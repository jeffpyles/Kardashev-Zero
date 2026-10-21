// The DM: one structured call per pitch, returning a ruling in a fixed format.

import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { Society } from "../world/society.js";
import { systemPrompt, userMessage, type Rigor } from "./prompt.js";
import { PitchSchema, RulingSchema, type Pitch, type Recipe, type Ruling } from "./schema.js";

export interface DmOptions {
  model?: string;
  effort?: "low" | "medium" | "high" | "xhigh" | "max";
  rigor?: Rigor;
  /** Similar past rulings (case law), so repeat pitches get consistent recipes. */
  precedents?: Recipe[];
}

export interface DmResult {
  ruling: Ruling | null;
  /** Set when the model declined or the output didn't parse. */
  error: string | null;
  model: string;
  usage: { inputTokens: number; outputTokens: number; cacheReadTokens: number };
}

export const DEFAULT_MODEL = "claude-opus-5-5";

export async function judgePitch(
  client: Anthropic,
  society: Society,
  rawPitch: Pitch,
  options: DmOptions = {},
): Promise<DmResult> {
  const pitch = PitchSchema.parse(rawPitch);
  const model = options.model ?? DEFAULT_MODEL;

  const response = await client.beta.messages.parse({
    model,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    thinking: { type: "adaptive" },
    output_config: {
      effort: options.effort ?? "medium",
      format: betaZodOutputFormat(RulingSchema),
    },
    system: [{ type: "text", text: systemPrompt(options.rigor), cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: userMessage(society, pitch, options.precedents) }],
  });

  const usage = {
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
  };

  if (response.stop_reason === "refusal") {
    const category = response.stop_details?.category ?? "unknown";
    return { ruling: null, error: `model declined (${category})`, model: response.model, usage };
  }
  if (!response.parsed_output) {
    return { ruling: null, error: `no parsable ruling (stop_reason ${response.stop_reason})`, model: response.model, usage };
  }
  return { ruling: response.parsed_output, error: null, model: response.model, usage };
}
