// A generated region that gestures at Anatolia: a peninsula with seas to the
// north, west and south, a dry central plateau with lakes and marshes,
// mountain ranges along both coasts, a volcanic highland in the south
// center, and wild-grain foothills toward the southeast.

import { noise2d, rng } from "./random.js";
import { BIOME_RESOURCES } from "./resources.js";

export type Biome =
  | "sea"
  | "lake"
  | "marsh"
  | "steppe"
  | "foothills"
  | "oak_woodland"
  | "pine_forest"
  | "mountain"
  | "volcanic";

export interface ResourceStock {
  stock: number;
  max: number;
}

export interface Tile {
  x: number;
  y: number;
  biome: Biome;
  elevation: number;
  moisture: number;
  /** Harvestable materials on this tile, in kg, keyed by material id. */
  resources: Record<string, ResourceStock>;
}

export interface WorldMap {
  seed: number;
  width: number;
  height: number;
  tiles: Tile[];
}

/** Roughly 13 km per tile at the default size. */
export const MAP_WIDTH = 120;
export const MAP_HEIGHT = 72;

export function generateMap(seed: number, width = MAP_WIDTH, height = MAP_HEIGHT): WorldMap {
  const coast = noise2d(seed, width, height, 16, 4);
  const relief = noise2d(seed + 1, width, height, 12, 5);
  const wet = noise2d(seed + 2, width, height, 20, 3);
  const random = rng(seed + 3);
  const tiles: Tile[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const u = x / width;
      const v = y / height;

      // Peninsula: land fades out toward the west, north and south edges.
      const westEdge = 0.08 + coast[i]! * 0.12;
      const northEdge = 0.1 + coast[i]! * 0.1;
      const southEdge = 0.88 - coast[i]! * 0.1 + (u > 0.75 ? 0.08 : 0);
      const isLand = u > westEdge && v > northEdge && v < southEdge;

      // Mountain ridges near both coasts, a raised plateau between them.
      const north = Math.exp(-(((v - northEdge - 0.08) / 0.07) ** 2));
      const south = Math.exp(-(((v - southEdge + 0.1) / 0.07) ** 2));
      const elevation = isLand ? Math.min(1, 0.35 + 0.45 * Math.max(north, south) + 0.3 * (relief[i]! - 0.5) + 0.1 * u) : 0;

      // Coasts and mountains are wetter; the central plateau is dry.
      const fromCoast = Math.min(v - northEdge, southEdge - v, u - westEdge);
      const moisture = isLand ? clamp(0.25 + 0.5 * Math.exp(-fromCoast / 0.08) + 0.7 * (wet[i]! - 0.5) + 0.25 * Math.max(north, south)) : 1;

      const biome = isLand ? pickBiome(u, v, elevation, moisture, relief[i]!, wet[i]!, random) : "sea";
      tiles.push({ x, y, biome, elevation, moisture, resources: stockFor(biome, random) });
    }
  }
  return { seed, width, height, tiles };
}

function pickBiome(u: number, v: number, elevation: number, moisture: number, relief: number, wet: number, random: () => number): Biome {
  // Noise wobbles the regional boundaries so they don't come out as clean shapes.
  const wobble = (relief - 0.5) * 0.12 + (wet - 0.5) * 0.08;
  // Volcanic highland: Cappadocia, south of center.
  const dx = (u - 0.55 + wobble) / 0.07;
  const dy = (v - 0.62 - wobble) / 0.07;
  if (dx * dx + dy * dy < 1 && relief > 0.42) return "volcanic";
  if (elevation > 0.78) return "mountain";
  // Lakes and marshes in low wet hollows of the plateau.
  if (elevation < 0.4 && moisture > 0.4) return random() < 0.4 ? "lake" : "marsh";
  if (elevation > 0.62) return moisture > 0.55 ? "pine_forest" : "oak_woodland";
  // Fertile foothills toward the southeast, where wild grain grows thick.
  if (u + wobble > 0.66 && v - wobble > 0.5 && moisture > 0.3) return "foothills";
  if (moisture > 0.48) return "oak_woodland";
  return "steppe";
}

function stockFor(biome: Biome, random: () => number): Record<string, ResourceStock> {
  const resources: Record<string, ResourceStock> = {};
  for (const [material, max] of Object.entries(BIOME_RESOURCES[biome])) {
    // Each tile varies around its biome's typical amount.
    const amount = max * (0.6 + 0.8 * random());
    resources[material] = { stock: amount, max: amount };
  }
  return resources;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export function tileAt(map: WorldMap, x: number, y: number): Tile | undefined {
  if (x < 0 || y < 0 || x >= map.width || y >= map.height) return undefined;
  return map.tiles[y * map.width + x];
}

/** Tiles within a square radius of a point, the area a band works from camp. */
export function tilesAround(map: WorldMap, x: number, y: number, radius: number): Tile[] {
  const out: Tile[] = [];
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const tile = tileAt(map, x + dx, y + dy);
      if (tile) out.push(tile);
    }
  }
  return out;
}

/** A good starting camp: woodland or foothills next to water and flint-bearing ground. */
export function findStartingCamp(map: WorldMap): { x: number; y: number } {
  let best = { x: Math.floor(map.width / 2), y: Math.floor(map.height / 2), score: -1 };
  for (const tile of map.tiles) {
    if (tile.biome === "sea" || tile.biome === "lake") continue;
    const around = tilesAround(map, tile.x, tile.y, 1);
    const has = (m: string) => around.some((t) => (t.resources[m]?.stock ?? 0) > 0);
    const biomeBonus = tile.biome === "oak_woodland" || tile.biome === "foothills" ? 2 : 0;
    const score =
      biomeBonus +
      (has("water") ? 2 : 0) + (has("flint") || has("chert") ? 2 : 0) + (has("dead_branches") ? 1 : 0) + (has("wild_wheat") ? 1 : 0) + (has("acorns") ? 1 : 0);
    // Tie-break toward the map's middle so the start isn't on an edge.
    const centered = score - Math.hypot(tile.x - map.width * 0.6, tile.y - map.height * 0.55) / 1000;
    if (centered > best.score) best = { x: tile.x, y: tile.y, score: centered };
  }
  return { x: best.x, y: best.y };
}
