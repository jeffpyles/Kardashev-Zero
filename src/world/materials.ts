// Starter materials for the Anatolia slice. Materials are described by
// properties, not per-item rules, so the DM can judge combinations it has
// never seen. Values are coarse on purpose: the first slice asks for gist,
// not engineering.

export type Fracture = "conchoidal" | "granular" | "splits_along_grain" | "crumbles" | "none";
export type Burn = "excellent" | "good" | "poor" | "none";
export type Level = "none" | "low" | "medium" | "high";

export interface Material {
  id: string;
  name: string;
  category: "stone" | "wood" | "plant" | "animal" | "earth" | "other";
  /** Mohs scale, roughly. */
  hardness: number;
  /** How it breaks when struck. Conchoidal stone knaps into sharp flakes. */
  fracture: Fracture;
  /** How well it burns, for wood and plant matter. */
  burn: Burn;
  /** Pulls into fibers strong enough for cord. */
  fiberStrength: Level;
  /** Can be shaped when wet and holds the shape when dry. */
  plasticity: Level;
  /** Food energy in kcal per kg, or 0 if inedible. */
  kcalPerKg: number;
  /** Where it's found and how common. */
  occurrence: string;
  notes?: string;
}

export const MATERIALS: Material[] = [
  // Stone
  { id: "flint", name: "Flint", category: "stone", hardness: 7, fracture: "conchoidal", burn: "none", fiberStrength: "none", plasticity: "none", kcalPerKg: 0, occurrence: "Nodules in limestone and chalk; common in river gravels." },
  { id: "chert", name: "Chert", category: "stone", hardness: 7, fracture: "conchoidal", burn: "none", fiberStrength: "none", plasticity: "none", kcalPerKg: 0, occurrence: "Beds in limestone uplands; common.", notes: "Knaps a little less cleanly than flint." },
  { id: "obsidian", name: "Obsidian", category: "stone", hardness: 5.5, fracture: "conchoidal", burn: "none", fiberStrength: "none", plasticity: "none", kcalPerKg: 0, occurrence: "Volcanic highlands of Cappadocia only; rare elsewhere.", notes: "Sharpest edges of any stone, but brittle." },
  { id: "quartzite", name: "Quartzite", category: "stone", hardness: 7, fracture: "granular", burn: "none", fiberStrength: "none", plasticity: "none", kcalPerKg: 0, occurrence: "River cobbles; common.", notes: "Flakes poorly, edges are rough. Good hammerstone." },
  { id: "basalt", name: "Basalt", category: "stone", hardness: 6, fracture: "granular", burn: "none", fiberStrength: "none", plasticity: "none", kcalPerKg: 0, occurrence: "Volcanic areas; common.", notes: "Tough. Good for grinding stones and hammerstones; can be ground and polished into axes." },
  { id: "sandstone", name: "Sandstone", category: "stone", hardness: 6, fracture: "crumbles", burn: "none", fiberStrength: "none", plasticity: "none", kcalPerKg: 0, occurrence: "Common in lowlands.", notes: "Abrasive. Useful for grinding and polishing other stone." },
  { id: "limestone", name: "Limestone", category: "stone", hardness: 3, fracture: "granular", burn: "none", fiberStrength: "none", plasticity: "none", kcalPerKg: 0, occurrence: "Very common; the region's bedrock.", notes: "Heated to about 800–900 °C it becomes quicklime." },
  { id: "river_cobble", name: "River cobble", category: "stone", hardness: 6, fracture: "granular", burn: "none", fiberStrength: "none", plasticity: "none", kcalPerKg: 0, occurrence: "Every riverbed.", notes: "Mixed rounded stones; hand-sized ones make hammerstones." },

  // Wood and plants
  { id: "oak_wood", name: "Oak wood", category: "wood", hardness: 3, fracture: "splits_along_grain", burn: "excellent", fiberStrength: "none", plasticity: "none", kcalPerKg: 0, occurrence: "Open oak woodland across the uplands." },
  { id: "dead_branches", name: "Dead branches", category: "wood", hardness: 2, fracture: "splits_along_grain", burn: "excellent", fiberStrength: "none", plasticity: "none", kcalPerKg: 0, occurrence: "Under any trees.", notes: "Dry and seasoned already." },
  { id: "softwood", name: "Softwood (pine, juniper)", category: "wood", hardness: 2, fracture: "splits_along_grain", burn: "good", fiberStrength: "none", plasticity: "none", kcalPerKg: 0, occurrence: "Mountain slopes.", notes: "Soft, resinous. Dry softwood is the easiest wood to light by friction." },
  { id: "reed", name: "Reed", category: "plant", hardness: 1, fracture: "splits_along_grain", burn: "good", fiberStrength: "low", plasticity: "none", kcalPerKg: 0, occurrence: "Marshes and lake edges.", notes: "Straight, hollow stems. Good for weaving, arrow shafts and roofing." },
  { id: "inner_bark", name: "Inner bark (lime, willow)", category: "plant", hardness: 1, fracture: "none", burn: "poor", fiberStrength: "high", plasticity: "none", kcalPerKg: 0, occurrence: "Peeled from living trees in spring." },
  { id: "wild_flax", name: "Wild flax", category: "plant", hardness: 0, fracture: "none", burn: "poor", fiberStrength: "high", plasticity: "none", kcalPerKg: 4500, occurrence: "Grassland; patchy.", notes: "Stems yield strong fiber after retting; seeds are oily and edible." },
  { id: "dry_grass", name: "Dry grass", category: "plant", hardness: 0, fracture: "none", burn: "excellent", fiberStrength: "low", plasticity: "none", kcalPerKg: 0, occurrence: "Everywhere in summer and autumn.", notes: "Catches an ember easily; good tinder." },
  { id: "wild_wheat", name: "Wild wheat and barley", category: "plant", hardness: 0, fracture: "none", burn: "good", fiberStrength: "none", plasticity: "none", kcalPerKg: 3300, occurrence: "Dense natural stands on hill slopes; ripens early summer.", notes: "Ears shatter when ripe, scattering seed. Grain is hard to eat raw." },
  { id: "acorns", name: "Acorns", category: "plant", hardness: 1, fracture: "none", burn: "poor", fiberStrength: "none", plasticity: "none", kcalPerKg: 3900, occurrence: "Oak woodland; autumn.", notes: "Bitter with tannin until leached in water." },
  { id: "wild_lentils", name: "Wild lentils and peas", category: "plant", hardness: 0, fracture: "none", burn: "poor", fiberStrength: "none", plasticity: "none", kcalPerKg: 3500, occurrence: "Grassland edges; early summer." },
  { id: "fruit_and_nuts", name: "Wild fruit and nuts (pistachio, almond, fig)", category: "plant", hardness: 0, fracture: "none", burn: "none", fiberStrength: "none", plasticity: "none", kcalPerKg: 2500, occurrence: "Scattered; late summer and autumn." },
  { id: "roots_and_greens", name: "Roots, tubers and greens", category: "plant", hardness: 0, fracture: "none", burn: "none", fiberStrength: "none", plasticity: "none", kcalPerKg: 700, occurrence: "Everywhere; best in spring.", notes: "Many roots lie deep; digging by hand is slow." },

  // Animal
  { id: "meat", name: "Meat", category: "animal", hardness: 0, fracture: "none", burn: "none", fiberStrength: "none", plasticity: "none", kcalPerKg: 1500, occurrence: "From hunting or scavenging gazelle, deer, wild goat, aurochs.", notes: "Spoils in days unless dried." },
  { id: "animal_fat", name: "Animal fat and marrow", category: "animal", hardness: 0, fracture: "none", burn: "good", fiberStrength: "none", plasticity: "none", kcalPerKg: 8000, occurrence: "From carcasses; marrow sealed inside long bones." },
  { id: "hide", name: "Raw hide", category: "animal", hardness: 0, fracture: "none", burn: "poor", fiberStrength: "medium", plasticity: "none", kcalPerKg: 0, occurrence: "From carcasses.", notes: "Rots and stiffens unless scraped and treated." },
  { id: "sinew", name: "Sinew", category: "animal", hardness: 0, fracture: "none", burn: "poor", fiberStrength: "high", plasticity: "none", kcalPerKg: 0, occurrence: "Leg and back tendons of large animals.", notes: "Dried and pounded, it splits into very strong thread that shrinks tight as it dries." },
  { id: "bone", name: "Bone", category: "animal", hardness: 3, fracture: "splits_along_grain", burn: "poor", fiberStrength: "none", plasticity: "none", kcalPerKg: 0, occurrence: "From carcasses." },
  { id: "antler", name: "Antler", category: "animal", hardness: 3, fracture: "none", burn: "poor", fiberStrength: "none", plasticity: "none", kcalPerKg: 0, occurrence: "Shed by deer each year.", notes: "Tough and slightly springy. Good soft hammer for fine knapping." },

  // Earth and other
  { id: "clay", name: "Clay", category: "earth", hardness: 1, fracture: "crumbles", burn: "none", fiberStrength: "none", plasticity: "high", kcalPerKg: 0, occurrence: "Riverbanks and lake beds.", notes: "Air-dried clay softens again in water. Above about 600 °C it hardens permanently." },
  { id: "mud", name: "Mud and silt", category: "earth", hardness: 0, fracture: "crumbles", burn: "none", fiberStrength: "none", plasticity: "medium", kcalPerKg: 0, occurrence: "Riverbanks, marshes.", notes: "Mixed with straw and dried, it makes a weak but usable building material." },
  { id: "ochre", name: "Ochre", category: "earth", hardness: 2, fracture: "crumbles", burn: "none", fiberStrength: "none", plasticity: "low", kcalPerKg: 0, occurrence: "Iron-rich soils and outcrops.", notes: "Red and yellow pigment when ground." },
  { id: "water", name: "Water", category: "other", hardness: 0, fracture: "none", burn: "none", fiberStrength: "none", plasticity: "none", kcalPerKg: 0, occurrence: "Rivers, springs, lakes." },
];

export const MATERIALS_BY_ID = new Map(MATERIALS.map((m) => [m.id, m]));
