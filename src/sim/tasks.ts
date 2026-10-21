// How each task turns a worker-day into goods. Bare-handed tasks are defined
// here; tasks that inventions enable get their yields from the DM's ruling.

import type { Recipe } from "../dm/schema.js";
import { BARE_HANDED_TASKS } from "../world/society.js";

export interface TaskYield {
  /** Materials drawn from tiles around camp. */
  draws: string[];
  /** Amount per worker-day: kcal for food tasks, kg otherwise. */
  rate: number;
  unit: "kcal" | "kg";
  /** "stock" splits by how much of each material is around; "equal" splits evenly among those present. */
  split: "stock" | "equal";
}

/**
 * What bare hands get per worker-day, at full availability. Food rates are
 * gross kcal before raw-eating losses; a forager has to feed dependents too,
 * so a worker's day brings in several people's food when it's in season.
 */
export const BASE_YIELDS: Record<string, TaskYield | "shelter" | null> = {
  forage_plants: { draws: ["wild_wheat", "wild_lentils", "acorns", "fruit_and_nuts", "roots_and_greens"], rate: 8000, unit: "kcal", split: "stock" },
  scavenge: { draws: ["meat"], rate: 4000, unit: "kcal", split: "stock" },
  hunt_small_game: { draws: ["meat"], rate: 1500, unit: "kcal", split: "stock" },
  gather_wood: { draws: ["dead_branches"], rate: 25, unit: "kg", split: "stock" },
  gather_stone: { draws: ["flint", "chert", "obsidian", "quartzite", "river_cobble", "basalt", "sandstone", "ochre"], rate: 15, unit: "kg", split: "equal" },
  gather_fiber: { draws: ["inner_bark", "reed", "dry_grass", "wild_flax"], rate: 8, unit: "kg", split: "equal" },
  brush_shelter: "shelter",
  carry: null,
  scout: null,
};

/** Brush shelter built per worker-day, in people sheltered. */
export const SHELTER_PER_WORKER_DAY = 0.5;

export type TaskKind =
  | { kind: "gather"; yield: TaskYield }
  | { kind: "shelter" }
  | { kind: "heat"; hearthsPerWorker: number }
  | { kind: "idle" };

export interface SimTask {
  id: string;
  name: string;
  description: string;
  run: TaskKind;
  /** The invention that enabled it, if any. */
  source: string | null;
}

/** Every task the society can assign workers to, with how the simulation runs it. */
export function simTasks(known: Recipe[]): SimTask[] {
  const tasks: SimTask[] = BARE_HANDED_TASKS.map((t) => {
    const y = BASE_YIELDS[t.id];
    const run: TaskKind = y === "shelter" ? { kind: "shelter" } : y ? { kind: "gather", yield: y } : { kind: "idle" };
    return { ...t, run, source: null };
  });
  for (const recipe of known) {
    for (const effect of recipe.effects) {
      if (effect.type !== "enable_task" || tasks.some((t) => t.id === effect.task)) continue;
      const y = effect.yields;
      const run: TaskKind = !y
        ? { kind: "idle" }
        : y.resource === "heat"
          ? { kind: "heat", hearthsPerWorker: y.perWorkerDay }
          : { kind: "gather", yield: { draws: [y.resource], rate: y.perWorkerDay, unit: "kg", split: "stock" } };
      tasks.push({ id: effect.task, name: effect.task.replace(/_/g, " "), description: effect.description, run, source: recipe.id });
    }
  }
  return tasks;
}
