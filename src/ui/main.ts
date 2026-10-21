// Debug UI for the bare simulation: a map, a Kardashev gauge, worker
// assignment, the stockpile, and a panel to unlock recipes from DM test runs.

import { FIXTURE_RECIPES } from "../sim/fixtures.js";
import type { Biome } from "../sim/map.js";
import { DAYS_PER_SEASON, yearOf } from "../sim/resources.js";
import {
  assign,
  KCAL_PER_PERSON_DAY,
  learn,
  moveCamp,
  newGame,
  stepDay,
  storedFoodKcal,
  taskMultiplier,
  tasksFor,
  workforce,
  type GameState,
} from "../sim/sim.js";
import { MATERIALS_BY_ID } from "../world/materials.js";

const BIOME_COLORS: Record<Biome, string> = {
  sea: "#3f6fa8",
  lake: "#5b8fc9",
  marsh: "#6f9f8a",
  steppe: "#d8c88a",
  foothills: "#b7c46a",
  oak_woodland: "#5f8f3e",
  pine_forest: "#3e6b4a",
  mountain: "#9a8f84",
  volcanic: "#8a5a4a",
};
const TILE_PX = 6;
const SPEEDS = [0, 1, 10, 50];

const $ = (id: string) => document.getElementById(id)!;
const canvas = $("map") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

let state: GameState = newGame(1);
let speed = 1;
let selected: { x: number; y: number } | null = null;

function startWorld(seed: number): void {
  state = newGame(seed);
  selected = null;
  canvas.width = state.map.width * TILE_PX;
  canvas.height = state.map.height * TILE_PX;
  renderAll();
}

// --- Map ---------------------------------------------------------------

function drawMap(): void {
  for (const tile of state.map.tiles) {
    ctx.fillStyle = BIOME_COLORS[tile.biome];
    ctx.fillRect(tile.x * TILE_PX, tile.y * TILE_PX, TILE_PX, TILE_PX);
    // Darken tiles whose food has been gathered down.
    const food = ["wild_wheat", "acorns", "roots_and_greens", "fruit_and_nuts", "wild_lentils", "meat"]
      .map((m) => tile.resources[m])
      .filter((r) => r !== undefined);
    if (food.length) {
      const left = food.reduce((n, r) => n + r.stock / r.max, 0) / food.length;
      if (left < 0.98) {
        ctx.fillStyle = `rgba(60, 30, 10, ${Math.min(0.6, (1 - left) * 1.5)})`;
        ctx.fillRect(tile.x * TILE_PX, tile.y * TILE_PX, TILE_PX, TILE_PX);
      }
    }
  }
  const r = state.workRadius;
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 1;
  ctx.strokeRect((state.camp.x - r) * TILE_PX + 0.5, (state.camp.y - r) * TILE_PX + 0.5, (2 * r + 1) * TILE_PX - 1, (2 * r + 1) * TILE_PX - 1);
  ctx.fillStyle = "#c8642c";
  ctx.beginPath();
  ctx.arc((state.camp.x + 0.5) * TILE_PX, (state.camp.y + 0.5) * TILE_PX, TILE_PX * 0.6, 0, Math.PI * 2);
  ctx.fill();
  if (selected) {
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(selected.x * TILE_PX - 0.5, selected.y * TILE_PX - 0.5, TILE_PX + 1, TILE_PX + 1);
  }
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(((e.clientX - rect.left) / rect.width) * state.map.width);
  const y = Math.floor(((e.clientY - rect.top) / rect.height) * state.map.height);
  selected = { x, y };
  renderAll();
});

function renderLegend(): void {
  $("legend").innerHTML = Object.entries(BIOME_COLORS)
    .map(([b, c]) => `<span style="--swatch:${c}">${b.replace("_", " ")}</span>`)
    .join("") + `<span style="--swatch:#c8642c">camp (box = work area)</span>`;
}

function renderTile(): void {
  if (!selected) {
    $("tile-info").innerHTML = `<span class="muted">Click a tile to inspect it, or to move camp there.</span>`;
    return;
  }
  const tile = state.map.tiles[selected.y * state.map.width + selected.x];
  if (!tile) return;
  const rows = Object.entries(tile.resources)
    .filter(([m]) => m !== "water")
    .map(([m, r]) => `<tr><td>${name(m)}</td><td class="num">${fmt(r.stock)} / ${fmt(r.max)} kg</td></tr>`)
    .join("");
  const canCamp = tile.biome !== "sea" && tile.biome !== "lake";
  $("tile-info").innerHTML = `<h2>${tile.biome.replace("_", " ")} at ${tile.x}, ${tile.y}</h2>
    <table>${rows || `<tr><td class="muted">Nothing gatherable</td></tr>`}</table>
    <p><button data-action="move" ${canCamp ? "" : "disabled"}>Move camp here</button></p>`;
}

// --- Panels ------------------------------------------------------------

function renderClock(): void {
  const dayOfSeason = (state.day % DAYS_PER_SEASON) + 1;
  $("clock").innerHTML = `Year ${yearOf(state.day)}, ${state.last.season}, day ${dayOfSeason}`;
  $("speed").innerHTML = SPEEDS.map((s) => `<button data-action="speed" data-speed="${s}" class="${s === speed ? "active" : ""}">${s === 0 ? "Pause" : `${s}×`}</button>`).join("");
}

function renderGauge(): void {
  const k = state.last.kardashev;
  // Bar runs from the starting band (K -0.3) to Kardashev Zero.
  const pct = Math.max(0, Math.min(100, ((k + 0.3) / 0.3) * 100));
  const foodDays = storedFoodKcal(state) / Math.max(state.population * KCAL_PER_PERSON_DAY, 1);
  const assigned = Object.values(state.assignments).reduce((a, b) => a + b, 0);
  const fed = state.last.need > 0 ? state.last.eaten / state.last.need : 1;
  $("gauge").innerHTML = `<h2>Kardashev gauge</h2>
    <div class="big">K = ${k.toFixed(3)}</div>
    <div class="bar"><div style="width:${pct}%"></div></div>
    <div class="stats">
      <div>Power<b>${watts(state.last.power)}</b></div>
      <div>Population<b>${Math.floor(state.population)}</b></div>
      <div>Workers<b>${assigned} / ${workforce(state)}</b></div>
      <div>Fed today<b class="${fed < 0.99 ? "bad" : "good"}">${Math.round(fed * 100)}%</b></div>
      <div>Food stored<b>${foodDays.toFixed(1)} days</b></div>
      <div>Sheltered<b>${Math.min(100, Math.round((state.shelter / Math.max(state.population, 1)) * 100))}%</b></div>
      <div>Hearths<b>${state.last.hearths.toFixed(1)}</b></div>
      <div>Hunger<b class="${state.hunger > 2000 ? "bad" : ""}">${fmt(state.hunger)} kcal</b></div>
    </div>
    <p class="muted">K = 0 at 1 MW. Food counts as metabolic power; burned fuel adds its heat.</p>`;
}

function renderTasks(): void {
  const free = workforce(state) - Object.values(state.assignments).reduce((a, b) => a + b, 0);
  const rows = tasksFor(state).map((t) => {
    const n = state.assignments[t.id] ?? 0;
    const mult = taskMultiplier(state, t.id, Math.max(n, 1));
    const note = t.run.kind === "idle" ? `<span class="muted">not simulated yet</span>` : "";
    return row(t.id, t.name, n, free, `${outputOf(t.id)}${mult > 1.001 ? ` <span class="good">×${mult.toFixed(2)}</span>` : ""} ${note}`);
  });
  const makes = state.known
    .filter((r) => r.kind === "item")
    .map((r) => {
      const id = `make:${r.id}`;
      const inputs = r.inputs.map((i) => `${i.quantity} ${name(i.material)}`).join(", ") || "no inputs";
      return row(id, `Make ${r.name.toLowerCase()}`, state.assignments[id] ?? 0, free, `${outputOf(id)} <span class="muted">(${inputs}; ${r.laborDays} work-days each)</span>`);
    });
  $("tasks").innerHTML = `<h2>Tasks <span class="muted">${free} idle</span></h2><table>${rows.join("")}${makes.join("")}</table>`;
}

function row(id: string, label: string, n: number, free: number, detail: string): string {
  return `<tr><td>${label}<div class="muted">${detail}</div></td>
    <td class="num"><button data-action="assign" data-task="${id}" data-delta="-1" ${n === 0 ? "disabled" : ""}>−</button>
    <b style="display:inline-block;width:2em;text-align:center">${n}</b>
    <button data-action="assign" data-task="${id}" data-delta="1" ${free <= 0 ? "disabled" : ""}>+</button></td></tr>`;
}

function outputOf(id: string): string {
  const out = state.last.output[id];
  if (!out) return "";
  return Object.entries(out)
    .map(([k, v]) => (v === 0 ? k : `+${fmt(v)} ${name(k)}`))
    .join(", ");
}

function renderStock(): void {
  const rows = Object.entries(state.stock)
    .filter(([, n]) => n >= 0.01)
    .sort((a, b) => b[1] - a[1])
    .map(([id, n]) => `<tr><td>${name(id)}</td><td class="num">${fmt(n)} ${MATERIALS_BY_ID.has(id) ? "kg" : ""}</td></tr>`)
    .join("");
  $("stock").innerHTML = `<h2>Stockpile</h2><table>${rows || `<tr><td class="muted">Empty</td></tr>`}</table>`;
}

function renderKnown(): void {
  const knownIds = new Set(state.known.map((r) => r.id));
  const known = state.known.map((r) => `<tr><td>${r.name} <span class="muted">${r.kind}, quality ${r.quality}</span></td></tr>`).join("");
  const offers = FIXTURE_RECIPES.filter((r) => !knownIds.has(r.id))
    .map((r) => {
      const ready = r.prerequisites.every((p) => knownIds.has(p));
      return `<button data-action="learn" data-recipe="${r.id}" ${ready ? "" : `disabled title="Needs ${r.prerequisites.join(", ")}"`}>${r.name}</button>`;
    })
    .join(" ");
  $("known").innerHTML = `<h2>Known inventions</h2>
    <table>${known || `<tr><td class="muted">Nothing yet. The band has only bare hands.</td></tr>`}</table>
    <p class="muted">Debug: unlock recipes the DM accepted in test runs. The invention UI comes next.</p>
    <div style="display:flex;flex-wrap:wrap;gap:4px">${offers}</div>`;
}

function renderLog(): void {
  $("log").innerHTML = `<h2>Log</h2>${state.log.slice(-10).reverse().map((l) => `<div>${l}</div>`).join("")}`;
}

function renderAll(): void {
  drawMap();
  renderClock();
  renderGauge();
  renderTasks();
  renderStock();
  renderKnown();
  renderLog();
  renderTile();
}

document.body.addEventListener("click", (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>("[data-action]");
  if (!el || el.hasAttribute("disabled")) return;
  const action = el.dataset.action;
  if (action === "speed") speed = Number(el.dataset.speed);
  else if (action === "assign") {
    const id = el.dataset.task!;
    assign(state, id, (state.assignments[id] ?? 0) + Number(el.dataset.delta));
  } else if (action === "learn") {
    const recipe = FIXTURE_RECIPES.find((r) => r.id === el.dataset.recipe);
    if (recipe) learn(state, structuredClone(recipe));
  } else if (action === "move" && selected) moveCamp(state, selected.x, selected.y);
  renderAll();
});

$("new-world").addEventListener("click", () => startWorld(Number(($("seed") as HTMLInputElement).value) || 1));

// --- Loop --------------------------------------------------------------

let last = performance.now();
let pending = 0;
let sinceRender = 0;
function frame(now: number): void {
  const dt = Math.min(0.25, (now - last) / 1000);
  last = now;
  pending += dt * speed;
  let stepped = false;
  while (pending >= 1) {
    stepDay(state);
    pending -= 1;
    stepped = true;
  }
  sinceRender += dt;
  // Panels rebuild a few times a second so buttons stay clickable.
  if (stepped && sinceRender > 0.25) {
    renderAll();
    sinceRender = 0;
  }
  requestAnimationFrame(frame);
}

function name(id: string): string {
  return MATERIALS_BY_ID.get(id)?.name ?? id.replace(/_/g, " ");
}

function fmt(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e4) return `${Math.round(n / 1e3)}k`;
  if (n >= 100) return Math.round(n).toString();
  if (n >= 1) return n.toFixed(1);
  return n.toFixed(2);
}

function watts(w: number): string {
  if (w >= 1e6) return `${(w / 1e6).toFixed(2)} MW`;
  if (w >= 1e3) return `${(w / 1e3).toFixed(1)} kW`;
  return `${Math.round(w)} W`;
}

renderLegend();
startWorld(1);
requestAnimationFrame(frame);
