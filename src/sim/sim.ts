// The deterministic simulation: one call to stepDay advances the world a day.
// No AI calls happen here; the DM only adds recipes to `known`.

import type { Recipe } from "../dm/schema.js";
import { MATERIALS_BY_ID } from "../world/materials.js";
import { findStartingCamp, generateMap, tilesAround, type Tile, type WorldMap } from "./map.js";
import {
  CARCASS_BYPRODUCTS,
  DAILY_HARVEST_CAP,
  REGROWTH,
  SEASONAL,
  SPOILAGE,
  seasonOf,
  type Season,
} from "./resources.js";
import { SHELTER_PER_WORKER_DAY, simTasks, type SimTask, type TaskYield } from "./tasks.js";

export interface GameState {
  seed: number;
  map: WorldMap;
  day: number;
  camp: { x: number; y: number };
  /** Tiles from camp that people walk out to work. */
  workRadius: number;
  /** Aggregate headcount; fractional so slow growth accumulates. */
  population: number;
  /** Unmet food need per person, in kcal. Recovers when people eat well. */
  hunger: number;
  /** Stockpile: materials in kg, made items as counts. */
  stock: Record<string, number>;
  known: Recipe[];
  /** Workers per task id, or per "make:<recipe id>" for production. */
  assignments: Record<string, number>;
  /** Craft skill levels, 0 to 1. */
  skills: Record<string, number>;
  /** People covered by brush shelter. */
  shelter: number;
  last: DayReport;
  log: string[];
}

export interface DayReport {
  season: Season;
  /** Food eaten, kcal. */
  eaten: number;
  /** Food needed, kcal. */
  need: number;
  /** Fuel burned, kg. */
  fuelBurned: number;
  hearths: number;
  /** Total power in watts: food metabolism plus fuel. */
  power: number;
  kardashev: number;
  /** What each task or production job produced, keyed by assignment id. */
  output: Record<string, Record<string, number>>;
}

export const KCAL_PER_PERSON_DAY = 2200;
export const WORKING_SHARE = 0.6;
/** kg of wood a hearth burns per day. */
export const FUEL_PER_HEARTH = 10;
/** People one hearth cooks for and warms. */
export const PEOPLE_PER_HEARTH = 15;
const WOOD_MJ_PER_KG = 16;
const JOULES_PER_KCAL = 4184;
const SECONDS_PER_DAY = 86_400;
const FUELS = ["dead_branches", "oak_wood", "softwood", "dry_grass"];

/** Share of a food's energy people get from it raw, and cooked. */
const EDIBILITY: Record<string, { raw: number; cooked: number }> = {
  wild_wheat: { raw: 0.5, cooked: 0.95 },
  wild_lentils: { raw: 0.5, cooked: 0.95 },
  acorns: { raw: 0.25, cooked: 0.4 },
  roots_and_greens: { raw: 0.7, cooked: 1 },
  fruit_and_nuts: { raw: 0.95, cooked: 1 },
  meat: { raw: 0.8, cooked: 1 },
  animal_fat: { raw: 1, cooked: 1 },
  wild_flax: { raw: 0.6, cooked: 0.9 },
};
const FOODS = Object.keys(EDIBILITY);

/** Sagan's interpolation: K = (log10 P - 6) / 10, with P in watts. */
export function kardashev(watts: number): number {
  return (Math.log10(Math.max(watts, 1)) - 6) / 10;
}

export function newGame(seed: number): GameState {
  const map = generateMap(seed);
  const camp = findStartingCamp(map);
  const state: GameState = {
    seed,
    map,
    day: 0,
    camp,
    workRadius: 1,
    population: 30,
    hunger: 0,
    stock: {},
    known: [],
    assignments: { forage_plants: 10, scavenge: 5, gather_wood: 1, gather_fiber: 1, brush_shelter: 1 },
    skills: {},
    shelter: 0,
    last: emptyReport(seasonOf(0), 30),
    log: ["Day 1: a band of 30 people, with nothing but their hands."],
  };
  return state;
}

function emptyReport(season: Season, population: number): DayReport {
  const power = population * 100;
  return { season, eaten: 0, need: 0, fuelBurned: 0, hearths: 0, power, kardashev: kardashev(power), output: {} };
}

export function workforce(state: GameState): number {
  return Math.floor(state.population * WORKING_SHARE);
}

export function tasksFor(state: GameState): SimTask[] {
  return simTasks(state.known);
}

/** Sets workers on a task or production job, within the available workforce. */
export function assign(state: GameState, id: string, workers: number): void {
  const others = Object.entries(state.assignments).reduce((n, [k, v]) => (k === id ? n : n + v), 0);
  state.assignments[id] = Math.max(0, Math.min(Math.round(workers), workforce(state) - others));
  if (state.assignments[id] === 0) delete state.assignments[id];
}

/** Adds an accepted ruling's recipe to what the society knows. */
export function learn(state: GameState, recipe: Recipe): void {
  if (state.known.some((r) => r.id === recipe.id)) return;
  state.known.push(recipe);
  state.log.push(`Day ${state.day + 1}: learned ${recipe.name}.`);
}

export function stepDay(state: GameState): void {
  const season = seasonOf(state.day);
  const around = tilesAround(state.map, state.camp.x, state.camp.y, state.workRadius);
  const report: DayReport = { ...emptyReport(season, state.population), output: {} };
  const tasks = new Map(tasksFor(state).map((t) => [t.id, t]));
  clampAssignments(state);

  for (const [id, workers] of Object.entries(state.assignments)) {
    if (workers <= 0) continue;
    const out: Record<string, number> = {};
    if (id.startsWith("make:")) {
      const recipe = state.known.find((r) => `make:${r.id}` === id);
      if (recipe) produce(state, recipe, workers, around, out);
    } else {
      const task = tasks.get(id);
      if (!task) continue;
      const mult = taskMultiplier(state, id, workers);
      if (task.run.kind === "gather") gather(state, task.run.yield, workers * mult, around, season, out);
      else if (task.run.kind === "shelter") {
        const built = workers * mult * SHELTER_PER_WORKER_DAY;
        state.shelter += built;
        out.shelter = built;
      } else if (task.run.kind === "heat") {
        const wanted = workers * mult * task.run.hearthsPerWorker;
        const burned = takeFrom(state.stock, FUELS, wanted * FUEL_PER_HEARTH);
        const hearths = burned / FUEL_PER_HEARTH;
        report.hearths += hearths;
        report.fuelBurned += burned;
        out.hearths = hearths;
      }
    }
    report.output[id] = out;
  }

  eat(state, report, season);
  wearAndSpoil(state);
  regrow(state.map);
  growPopulation(state);

  const foodWatts = (report.eaten * JOULES_PER_KCAL) / SECONDS_PER_DAY;
  const fuelWatts = (report.fuelBurned * WOOD_MJ_PER_KG * 1e6) / SECONDS_PER_DAY;
  report.power = foodWatts + fuelWatts;
  report.kardashev = kardashev(report.power);
  state.last = report;
  state.day += 1;
}

function clampAssignments(state: GameState): void {
  let free = workforce(state);
  for (const id of Object.keys(state.assignments)) {
    const n = Math.min(state.assignments[id]!, free);
    free -= n;
    if (n > 0) state.assignments[id] = n;
    else delete state.assignments[id];
  }
}

/**
 * Combined multiplier from known inventions on a task. A tool only helps the
 * workers who have one, so an item's effect scales with how many are in stock.
 */
export function taskMultiplier(state: GameState, taskId: string, workers: number): number {
  let mult = 1;
  for (const recipe of state.known) {
    for (const effect of recipe.effects) {
      if (effect.type !== "modify_task" || effect.task !== taskId || effect.multiplier === null) continue;
      const coverage = recipe.kind === "item" ? Math.min(1, (state.stock[recipe.id] ?? 0) / Math.max(1, workers)) : 1;
      mult *= 1 + (effect.multiplier - 1) * coverage;
    }
  }
  return mult;
}

/** Pulls materials from tiles around camp into the stockpile. */
function gather(state: GameState, y: TaskYield, effort: number, around: Tile[], season: Season, out: Record<string, number>): void {
  const accessible = (tile: Tile, m: string) => {
    const r = tile.resources[m];
    return r ? r.stock * DAILY_HARVEST_CAP * (SEASONAL[m]?.[season] ?? 1) : 0;
  };
  const available = y.draws.map((m) => ({ m, kg: around.reduce((n, t) => n + accessible(t, m), 0) })).filter((a) => a.kg > 0);
  if (available.length === 0) return;
  const totalKg = available.reduce((n, a) => n + a.kg, 0);

  for (const a of available) {
    const share = y.split === "equal" ? 1 / available.length : a.kg / totalKg;
    const kcalPerKg = MATERIALS_BY_ID.get(a.m)?.kcalPerKg ?? 0;
    const wantKg = y.unit === "kcal" ? (effort * y.rate * share) / Math.max(kcalPerKg, 1) : effort * y.rate * share;
    const takeKg = Math.min(wantKg, a.kg);
    // Take from each tile in proportion to what it offers.
    for (const tile of around) {
      const r = tile.resources[a.m];
      if (r) r.stock -= takeKg * (accessible(tile, a.m) / a.kg);
    }
    add(state.stock, a.m, takeKg);
    out[a.m] = (out[a.m] ?? 0) + takeKg;
    if (a.m === "meat") {
      for (const [by, perKg] of Object.entries(CARCASS_BYPRODUCTS)) {
        add(state.stock, by, takeKg * perKg);
        out[by] = (out[by] ?? 0) + takeKg * perKg;
      }
    }
  }
}

/** Runs a production job: workers turn inputs into a recipe's item. */
function produce(state: GameState, recipe: Recipe, workers: number, around: Tile[], out: Record<string, number>): void {
  const missingTool = recipe.tools.find((tool) => !hasTool(state, tool, around));
  if (missingTool) {
    out[`missing ${missingTool}`] = 0;
    return;
  }
  const skill = state.skills[recipe.skill] ?? 0;
  let units = (workers / Math.max(recipe.laborDays, 0.001)) * (0.5 + skill);
  // Limited by whichever input runs out first.
  for (const input of recipe.inputs) {
    if (input.quantity <= 0) continue;
    units = Math.min(units, (state.stock[input.material] ?? 0) / input.quantity);
  }
  if (units <= 0) {
    out["no inputs"] = 0;
    return;
  }
  for (const input of recipe.inputs) add(state.stock, input.material, -units * input.quantity);
  add(state.stock, recipe.id, units);
  out[recipe.id] = units;
  // Practice raises skill, quickly at first and then more slowly.
  state.skills[recipe.skill] = Math.min(1, skill + 0.002 * workers * (1 - skill));
}

function hasTool(state: GameState, tool: string, around: Tile[]): boolean {
  if ((state.stock[tool] ?? 0) >= 1) return true;
  // Unworked natural objects can be picked up wherever they occur.
  return MATERIALS_BY_ID.has(tool) && around.some((t) => (t.resources[tool]?.stock ?? 0) > 0);
}

function eat(state: GameState, report: DayReport, season: Season): void {
  const cooked = Math.min(1, (report.hearths * PEOPLE_PER_HEARTH) / Math.max(state.population, 1));
  const sheltered = Math.min(1, state.shelter / Math.max(state.population, 1));
  const cold = { spring: 0.05, summer: 0, autumn: 0.1, winter: 0.3 }[season];
  const exposure = (1 - sheltered) * (1 - 0.5 * cooked);
  const need = state.population * KCAL_PER_PERSON_DAY * (1 + cold * exposure);
  report.need = need;

  // Eat what spoils fastest first.
  const order = [...FOODS].sort((a, b) => (SPOILAGE[b] ?? 0) - (SPOILAGE[a] ?? 0));
  let remaining = need;
  for (const food of order) {
    if (remaining <= 0) break;
    const kg = state.stock[food] ?? 0;
    const e = EDIBILITY[food]!;
    const kcalPerKg = (MATERIALS_BY_ID.get(food)?.kcalPerKg ?? 0) * (e.raw + (e.cooked - e.raw) * cooked);
    if (kg <= 0 || kcalPerKg <= 0) continue;
    const eatKg = Math.min(kg, remaining / kcalPerKg);
    state.stock[food] = kg - eatKg;
    remaining -= eatKg * kcalPerKg;
  }
  report.eaten = need - Math.max(0, remaining);
  const deficitPerPerson = Math.max(0, remaining) / Math.max(state.population, 1);
  state.hunger = deficitPerPerson > 0 ? state.hunger + deficitPerPerson : Math.max(0, state.hunger - 400);
}

function wearAndSpoil(state: GameState): void {
  for (const [id, rate] of Object.entries(SPOILAGE)) {
    if (state.stock[id]) state.stock[id] *= 1 - rate;
  }
  // Tools wear out, and brush shelter falls apart.
  for (const recipe of state.known) {
    if (recipe.kind === "item" && state.stock[recipe.id]) state.stock[recipe.id]! *= 0.995;
  }
  state.shelter *= 0.995;
  for (const [id, n] of Object.entries(state.stock)) if (n < 1e-6) delete state.stock[id];
}

function regrow(map: WorldMap): void {
  for (const tile of map.tiles) {
    for (const [m, r] of Object.entries(tile.resources)) {
      const rate = REGROWTH[m];
      if (rate && r.stock < r.max) r.stock += (r.max - r.stock) * rate;
    }
  }
}

function growPopulation(state: GameState): void {
  const before = Math.floor(state.population);
  const fed = state.hunger < 2000;
  const foodDays = storedFoodKcal(state) / Math.max(state.population * KCAL_PER_PERSON_DAY, 1);
  const births = fed ? (foodDays > 30 ? 0.05 : 0.03) / 365 : 0;
  const deaths = 0.02 / 365 + (state.hunger > 15_000 ? 0.004 : 0);
  state.population = Math.max(0, state.population * (1 + births - deaths));
  const after = Math.floor(state.population);
  if (after < before && state.hunger > 15_000) state.log.push(`Day ${state.day + 1}: starvation. Population ${after}.`);
  else if (after > before && after % 10 === 0) state.log.push(`Day ${state.day + 1}: population reached ${after}.`);
}

/** Food energy in the stockpile, in kcal before cooking losses. */
export function storedFoodKcal(state: GameState): number {
  return FOODS.reduce((n, f) => n + (state.stock[f] ?? 0) * (MATERIALS_BY_ID.get(f)?.kcalPerKg ?? 0) * EDIBILITY[f]!.raw, 0);
}

/** Moves camp. Shelters stay behind; travel time isn't simulated yet. */
export function moveCamp(state: GameState, x: number, y: number): void {
  const tile = state.map.tiles[y * state.map.width + x];
  if (!tile || tile.biome === "sea" || tile.biome === "lake") return;
  state.camp = { x, y };
  state.shelter = 0;
  state.log.push(`Day ${state.day + 1}: moved camp to ${tile.biome.replace("_", " ")} at ${x}, ${y}. Shelters left behind.`);
}

function takeFrom(stock: Record<string, number>, ids: string[], amount: number): number {
  let taken = 0;
  for (const id of ids) {
    const have = stock[id] ?? 0;
    const t = Math.min(have, amount - taken);
    stock[id] = have - t;
    taken += t;
    if (taken >= amount) break;
  }
  return taken;
}

function add(stock: Record<string, number>, id: string, n: number): void {
  stock[id] = (stock[id] ?? 0) + n;
}
