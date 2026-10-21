// The contract between the DM and the simulation. A pitch goes in, a ruling
// comes out, and an accepted ruling's recipe is what the production layer runs.

import { z } from "zod";

/** What the player writes. Field limits keep pitches short and the DM cheap. */
export const PitchSchema = z.object({
  name: z.string().min(1).max(80),
  whatItDoes: z.string().min(1).max(600),
  madeOf: z.string().min(1).max(600),
  howItsMade: z.string().min(1).max(1200),
  whyItWorks: z.string().min(1).max(1200),
});
export type Pitch = z.infer<typeof PitchSchema>;

export const EffectSchema = z.object({
  /** "modify_task" scales an existing task; "enable_task" creates a new one. */
  type: z.enum(["modify_task", "enable_task"]),
  /** Snake_case task id, e.g. "butchering" or "hide_scraping". */
  task: z.string(),
  /** Speed or yield multiplier for modify_task; null for enable_task. */
  multiplier: z.number().nullable(),
  /** One line on what changes, for the player. */
  description: z.string(),
});
export type Effect = z.infer<typeof EffectSchema>;

export const RecipeSchema = z.object({
  /** Snake_case id for the item or technique, e.g. "stone_blade". */
  id: z.string(),
  name: z.string(),
  /** An item is a thing people make and use; a technique is a practice or process. */
  kind: z.enum(["item", "technique", "structure"]),
  /** Material id with quantity in kg, or a known item id with a count. */
  inputs: z.array(z.object({ material: z.string(), quantity: z.number() })),
  /** Items needed but not consumed: known items, or unworked natural objects by material id. */
  tools: z.array(z.string()),
  /** Work-days of labor per unit made (or per use, for a technique). */
  laborDays: z.number(),
  /** Craft skill that applies, e.g. "knapping". Skill rises with practice. */
  skill: z.string(),
  /** 0 = barely works, 1 = as good as this design can get. */
  quality: z.number(),
  effects: z.array(EffectSchema),
  /** Known techniques this depends on. */
  prerequisites: z.array(z.string()),
  /** Seasons in which it can be made, or empty for any season. */
  seasons: z.array(z.enum(["spring", "summer", "autumn", "winter"])),
});
export type Recipe = z.infer<typeof RecipeSchema>;

export const RulingSchema = z.object({
  verdict: z.enum(["accepted", "examiner_question", "rejected", "out_of_scope"]),
  /** Short, plain explanation for the player. This is where the learning happens. */
  explanation: z.string(),
  /** Specific flaws, each naming the actual physical or material problem. */
  flaws: z.array(z.string()),
  /** One or two pointed questions, for examiner_question. */
  questions: z.array(z.string()),
  /** Present only when accepted. */
  recipe: RecipeSchema.nullable(),
  /** How well documented this is in real history: well_known pitches need less detail. */
  priorArt: z.enum(["well_known", "plausible_variant", "novel"]),
  /** The DM's confidence in its own ruling, 0 to 1. */
  confidence: z.number(),
  /** How the quality grade could be improved, for accepted designs. */
  improvementHints: z.array(z.string()),
});
export type Ruling = z.infer<typeof RulingSchema>;
