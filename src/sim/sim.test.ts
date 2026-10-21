import { describe, expect, it } from "vitest";
import { FIXTURE_RECIPES } from "./fixtures.js";
import { generateMap } from "./map.js";
import { assign, kardashev, learn, newGame, stepDay, taskMultiplier, workforce, type GameState } from "./sim.js";

const recipe = (id: string) => FIXTURE_RECIPES.find((r) => r.id === id)!;

function run(state: GameState, days: number): void {
  for (let i = 0; i < days; i++) stepDay(state);
}

describe("map", () => {
  it("is the same for the same seed", () => {
    const a = generateMap(42);
    const b = generateMap(42);
    expect(a.tiles.map((t) => t.biome)).toEqual(b.tiles.map((t) => t.biome));
  });

  it("has sea at the western edge and land in the middle", () => {
    const map = generateMap(7);
    expect(map.tiles[Math.floor(map.height / 2) * map.width]!.biome).toBe("sea");
    const land = map.tiles.filter((t) => t.biome !== "sea").length;
    expect(land / map.tiles.length).toBeGreaterThan(0.4);
  });
});

describe("kardashev", () => {
  it("matches the design doc's milestones", () => {
    expect(kardashev(3_000)).toBeCloseTo(-0.25, 2);
    expect(kardashev(1e6)).toBe(0);
    expect(kardashev(1e16)).toBe(1);
  });

  it("starts a band of 30 near K = -0.25", () => {
    const state = newGame(1);
    run(state, 1);
    expect(state.last.kardashev).toBeGreaterThan(-0.27);
    expect(state.last.kardashev).toBeLessThan(-0.23);
  });
});

describe("food and population", () => {
  it("feeds the starting band through its first summer", () => {
    const state = newGame(1);
    run(state, 91 * 2);
    expect(state.hunger).toBeLessThan(2000);
    expect(state.population).toBeGreaterThan(30);
  });

  it("starves a band that doesn't gather food", () => {
    const state = newGame(1);
    state.assignments = { scout: workforce(state) };
    run(state, 120);
    expect(state.population).toBeLessThan(30);
  });
});

describe("recipes", () => {
  it("produces items from inputs and raises skill", () => {
    const state = newGame(1);
    learn(state, recipe("stone_flake"));
    state.stock.flint = 5;
    state.assignments = { "make:stone_flake": 1 };
    run(state, 1);
    expect(state.stock.stone_flake).toBeGreaterThan(0);
    expect(state.stock.flint ?? 0).toBeLessThan(5);
    expect(state.skills.knapping).toBeGreaterThan(0);
  });

  it("scales a tool's effect by how many workers have one", () => {
    const state = newGame(1);
    learn(state, recipe("stone_flake"));
    expect(taskMultiplier(state, "scavenge", 4)).toBe(1);
    state.stock.stone_flake = 2;
    expect(taskMultiplier(state, "scavenge", 4)).toBeCloseTo(1.25);
    state.stock.stone_flake = 10;
    expect(taskMultiplier(state, "scavenge", 4)).toBeCloseTo(1.5);
  });

  it("burns wood for fire, which raises power", () => {
    const state = newGame(1);
    learn(state, recipe("hand_drill_fire"));
    state.stock.dead_branches = 100;
    state.assignments = {};
    assign(state, "make_fire", 2);
    run(state, 1);
    expect(state.last.fuelBurned).toBeCloseTo(20);
    // 20 kg of wood at 16 MJ/kg over a day is about 3.7 kW; nobody foraged, so no food power.
    expect(state.last.power).toBeCloseTo((20 * 16e6) / 86_400, 0);
  });

  it("blocks production when a tool is missing", () => {
    const state = newGame(1);
    learn(state, recipe("bark_cord"));
    state.stock.inner_bark = 5;
    state.assignments = { "make:bark_cord": 1 };
    run(state, 1);
    expect(state.stock.bark_cord ?? 0).toBe(0);
  });
});
