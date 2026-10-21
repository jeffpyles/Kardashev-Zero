// What the DM needs to know about the society making a pitch: what it
// already knows how to do, what it has, and what its people can do today.

import type { Recipe } from "../dm/schema.js";

export interface Task {
  id: string;
  name: string;
  description: string;
}

export interface Society {
  population: number;
  season: "spring" | "summer" | "autumn" | "winter";
  /** Accepted recipes, i.e. everything the society knows how to make or do. */
  known: Recipe[];
  /** Tasks people can be assigned to. Grows as inventions enable new ones. */
  tasks: Task[];
  /** Craft skill levels, 0 to 1, keyed by skill name. */
  skills: Record<string, number>;
}

/** What 30 people can do with bare hands and nothing else. */
export const BARE_HANDED_TASKS: Task[] = [
  { id: "forage_plants", name: "Forage plants", description: "Pick fruit, nuts, greens, seeds and shallow roots by hand." },
  { id: "scavenge", name: "Scavenge carcasses", description: "Drive predators off kills and take what's left by hand." },
  { id: "hunt_small_game", name: "Hunt small game", description: "Catch tortoises, lizards, nestlings and slow animals by hand." },
  { id: "gather_wood", name: "Gather wood", description: "Collect dead branches and break off what can be broken by hand." },
  { id: "gather_stone", name: "Gather stone", description: "Pick up loose stones, cobbles and nodules." },
  { id: "gather_fiber", name: "Gather fiber", description: "Strip bark, pull grass and reeds by hand." },
  { id: "carry", name: "Carry", description: "Move things by hand, in arms or on the back." },
  { id: "brush_shelter", name: "Make brush shelter", description: "Pile branches and grass into a windbreak." },
  { id: "scout", name: "Scout", description: "Walk out and look around." },
];

export function startingSociety(): Society {
  return {
    population: 30,
    season: "spring",
    known: [],
    tasks: [...BARE_HANDED_TASKS],
    skills: {},
  };
}
