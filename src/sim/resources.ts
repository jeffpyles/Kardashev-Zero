// What each biome holds, when it can be gathered, how fast it regrows and
// how fast it spoils. Amounts are kg per tile (a tile is about 13 km across)
// and deliberately coarse; they're tuning knobs, not data.

import type { Biome } from "./map.js";

export type Season = "spring" | "summer" | "autumn" | "winter";
export const SEASONS: Season[] = ["spring", "summer", "autumn", "winter"];
export const DAYS_PER_SEASON = 91;

/** Typical kg of each material on one tile of a biome. */
export const BIOME_RESOURCES: Record<Biome, Record<string, number>> = {
  sea: {},
  lake: { water: 1e9, reed: 40_000, clay: 50_000, mud: 50_000, meat: 400 },
  marsh: { water: 1e9, reed: 80_000, clay: 80_000, mud: 100_000, roots_and_greens: 15_000, meat: 800 },
  steppe: { wild_wheat: 6_000, wild_lentils: 3_000, wild_flax: 1_500, dry_grass: 60_000, roots_and_greens: 8_000, meat: 1_500, limestone: 1e6, river_cobble: 50_000, chert: 3_000, quartzite: 20_000, ochre: 2_000 },
  foothills: { wild_wheat: 20_000, wild_lentils: 8_000, wild_flax: 3_000, fruit_and_nuts: 4_000, dry_grass: 40_000, roots_and_greens: 10_000, meat: 1_500, dead_branches: 10_000, oak_wood: 40_000, inner_bark: 2_000, limestone: 1e6, flint: 5_000, river_cobble: 50_000, sandstone: 100_000, water: 1e8, clay: 20_000 },
  oak_woodland: { acorns: 15_000, fruit_and_nuts: 5_000, roots_and_greens: 12_000, meat: 2_000, dead_branches: 40_000, oak_wood: 300_000, inner_bark: 8_000, dry_grass: 10_000, limestone: 1e6, flint: 6_000, river_cobble: 30_000, sandstone: 50_000, water: 1e8, clay: 10_000 },
  pine_forest: { softwood: 300_000, dead_branches: 30_000, inner_bark: 3_000, fruit_and_nuts: 2_000, roots_and_greens: 5_000, meat: 1_500, river_cobble: 30_000, basalt: 1e5, water: 1e8 },
  mountain: { meat: 600, river_cobble: 20_000, basalt: 1e6, quartzite: 50_000, softwood: 30_000, water: 1e8 },
  volcanic: { obsidian: 20_000, basalt: 1e6, dry_grass: 20_000, wild_lentils: 2_000, roots_and_greens: 4_000, meat: 800, river_cobble: 20_000, water: 1e7 },
};

/** Share of a material's stock that can be gathered in each season. Missing = always. */
export const SEASONAL: Record<string, Record<Season, number>> = {
  wild_wheat: { spring: 0, summer: 1, autumn: 0.3, winter: 0 },
  wild_lentils: { spring: 0.2, summer: 1, autumn: 0.2, winter: 0 },
  wild_flax: { spring: 0.3, summer: 1, autumn: 0.5, winter: 0 },
  acorns: { spring: 0, summer: 0, autumn: 1, winter: 0.2 },
  fruit_and_nuts: { spring: 0, summer: 0.5, autumn: 1, winter: 0 },
  roots_and_greens: { spring: 1, summer: 0.6, autumn: 0.5, winter: 0.15 },
  inner_bark: { spring: 1, summer: 0.4, autumn: 0.1, winter: 0 },
  dry_grass: { spring: 0.2, summer: 1, autumn: 1, winter: 0.3 },
  meat: { spring: 1, summer: 0.9, autumn: 1, winter: 0.6 },
};

/** Fraction of the missing stock that regrows per day. Stone and clay don't regrow. */
export const REGROWTH: Record<string, number> = {
  wild_wheat: 0.004,
  wild_lentils: 0.004,
  wild_flax: 0.004,
  acorns: 0.003,
  fruit_and_nuts: 0.003,
  roots_and_greens: 0.006,
  inner_bark: 0.002,
  dry_grass: 0.01,
  reed: 0.008,
  dead_branches: 0.004,
  meat: 0.003,
  softwood: 0.0005,
  oak_wood: 0.0005,
};

/** Fraction of the stockpile lost per day. */
export const SPOILAGE: Record<string, number> = {
  meat: 0.15,
  roots_and_greens: 0.1,
  fruit_and_nuts: 0.03,
  animal_fat: 0.02,
  hide: 0.05,
  acorns: 0.002,
  wild_wheat: 0.001,
  wild_lentils: 0.001,
  wild_flax: 0.001,
};

/** Byproducts per kg of meat taken from carcasses. */
export const CARCASS_BYPRODUCTS: Record<string, number> = {
  hide: 0.12,
  bone: 0.15,
  sinew: 0.01,
  animal_fat: 0.05,
};

/**
 * Of the stock on a tile, the most that can be taken in one day. Keeps a
 * small band from stripping a region in a week and makes depletion gradual.
 */
export const DAILY_HARVEST_CAP = 0.01;

export function seasonOf(day: number): Season {
  return SEASONS[Math.floor(day / DAYS_PER_SEASON) % 4]!;
}

export function yearOf(day: number): number {
  return Math.floor(day / (DAYS_PER_SEASON * 4)) + 1;
}
