// Runs the test pitches through the DM and reports which rulings matched
// expectations. Usage:
//
//   npm run harness                      run every pitch once
//   npm run harness -- --only fire       pitches whose id contains "fire"
//   npm run harness -- --repeat 3        run each pitch 3 times to check consistency
//   npm run harness -- --model claude-sonnet-5-5 --effort low
//   npm run harness -- --rigor strict    judge pitches under strict rigor
//   npm run harness -- --dry-run         print one prompt and validate the cases, no API calls
//
// Without an API key, another model can stand in for the DM:
//
//   npm run harness -- --export DIR      write the system prompt, schema and one message per pitch
//   npm run harness -- --score DIR       score rulings saved as DIR/<case id>.json

import Anthropic from "@anthropic-ai/sdk";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { DEFAULT_MODEL, judgePitch, type DmOptions, type DmResult } from "../src/dm/dm.js";
import { z } from "zod";
import { systemPrompt, userMessage, type Rigor } from "../src/dm/prompt.js";
import { PitchSchema, RulingSchema } from "../src/dm/schema.js";
import { PITCHES, passes, type PitchCase } from "./pitches.js";

const { values: args } = parseArgs({
  options: {
    only: { type: "string" },
    repeat: { type: "string", default: "1" },
    model: { type: "string", default: DEFAULT_MODEL },
    effort: { type: "string", default: "medium" },
    concurrency: { type: "string", default: "4" },
    rigor: { type: "string", default: "casual" },
    "dry-run": { type: "boolean", default: false },
    export: { type: "string" },
    score: { type: "string" },
  },
});

const cases = PITCHES.filter((c) => !args.only || c.id.includes(args.only));
for (const c of cases) PitchSchema.parse(c.pitch);

if (args.rigor !== "casual" && args.rigor !== "strict") throw new Error("--rigor must be casual or strict");
const rigor: Rigor = args.rigor;

if (args.export) {
  mkdirSync(args.export, { recursive: true });
  writeFileSync(`${args.export}/system.md`, systemPrompt(rigor));
  writeFileSync(`${args.export}/ruling.schema.json`, JSON.stringify(z.toJSONSchema(RulingSchema), null, 2));
  for (const c of cases) writeFileSync(`${args.export}/pitch-${c.id}.md`, userMessage(c.society, c.pitch, c.precedents));
  console.log(`Exported ${cases.length} pitches to ${args.export}.`);
  process.exit(0);
}

if (args.score) {
  let passed = 0;
  for (const c of cases) {
    const file = `${args.score}/${c.id}.json`;
    if (!existsSync(file)) {
      console.log(`MISSING ${c.id}`);
      continue;
    }
    const parsed = RulingSchema.safeParse(JSON.parse(readFileSync(file, "utf8")));
    if (!parsed.success) {
      console.log(`INVALID ${c.id}: ${parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
      continue;
    }
    const pass = passes(c, parsed.data);
    if (pass) passed++;
    const recipe = parsed.data.recipe;
    console.log(`${pass ? "PASS" : "FAIL"}  ${c.id}: ${parsed.data.verdict}${recipe ? ` (${recipe.id}, quality ${recipe.quality})` : ""}`);
  }
  console.log(`\nPassed ${passed} of ${cases.length}.`);
  process.exit(0);
}

if (args["dry-run"]) {
  const first = cases[0]!;
  console.log("=== System prompt ===\n" + systemPrompt(rigor));
  console.log(`\n=== User message for "${first.id}" ===\n` + userMessage(first.society, first.pitch, first.precedents));
  console.log(`\n${cases.length} pitch cases validated.`);
  process.exit(0);
}

interface Run {
  caseId: string;
  attempt: number;
  pass: boolean;
  result: DmResult | null;
  thrown: string | null;
}

const client = new Anthropic();
const options: DmOptions = { model: args.model, effort: args.effort as DmOptions["effort"], rigor };
const repeat = Number(args.repeat);
const concurrency = Number(args.concurrency);
if (!(repeat >= 1) || !(concurrency >= 1)) throw new Error("--repeat and --concurrency must be positive numbers");
const jobs: { c: PitchCase; attempt: number }[] = cases.flatMap((c) =>
  Array.from({ length: repeat }, (_, attempt) => ({ c, attempt })),
);

async function runJob({ c, attempt }: { c: PitchCase; attempt: number }): Promise<Run> {
  try {
    const result = await judgePitch(client, c.society, c.pitch, { ...options, precedents: c.precedents });
    const pass = !!result.ruling && passes(c, result.ruling);
    const verdict = result.ruling?.verdict ?? result.error;
    console.log(`${pass ? "PASS" : "FAIL"}  ${c.id}${repeat > 1 ? ` #${attempt + 1}` : ""}: ${verdict}`);
    return { caseId: c.id, attempt, pass, result, thrown: null };
  } catch (err) {
    const message = err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : String(err);
    console.log(`ERROR ${c.id}: ${message}`);
    return { caseId: c.id, attempt, pass: false, result: null, thrown: message };
  }
}

async function runAll(): Promise<Run[]> {
  const runs: Run[] = [];
  const queue = [...jobs];
  const workers = Array.from({ length: concurrency }, async () => {
    for (let job = queue.shift(); job; job = queue.shift()) runs.push(await runJob(job));
  });
  await Promise.all(workers);
  return runs.sort((a, b) => a.caseId.localeCompare(b.caseId) || a.attempt - b.attempt);
}

function report(runs: Run[]): string {
  const lines = [`# DM harness results`, ``, `Model ${args.model}, effort ${args.effort}, ${rigor} rigor, ${runs.length} runs.`, ``];
  lines.push(`Passed ${runs.filter((r) => r.pass).length} of ${runs.length}.`, ``);
  lines.push(`| Case | Expected | Got | Quality | Confidence |`, `| --- | --- | --- | --- | --- |`);
  for (const r of runs) {
    const c = cases.find((x) => x.id === r.caseId)!;
    const ruling = r.result?.ruling;
    const got = ruling?.verdict ?? r.result?.error ?? r.thrown;
    lines.push(`| ${r.pass ? "" : "❌ "}${r.caseId} | ${c.expect.join(" / ")} | ${got} | ${ruling?.recipe?.quality ?? ""} | ${ruling?.confidence ?? ""} |`);
  }
  for (const r of runs) {
    const c = cases.find((x) => x.id === r.caseId)!;
    const ruling = r.result?.ruling;
    lines.push(``, `## ${r.caseId}${repeat > 1 ? ` #${r.attempt + 1}` : ""}`, ``, `_${c.purpose}_`, ``);
    if (!ruling) {
      lines.push(`No ruling: ${r.result?.error ?? r.thrown}`);
      continue;
    }
    lines.push(`**${ruling.verdict}** (prior art: ${ruling.priorArt}). ${ruling.explanation}`);
    for (const f of ruling.flaws) lines.push(`- Flaw: ${f}`);
    for (const q of ruling.questions) lines.push(`- Question: ${q}`);
    for (const h of ruling.improvementHints) lines.push(`- To improve: ${h}`);
    if (ruling.recipe) lines.push(``, "```json", JSON.stringify(ruling.recipe, null, 2), "```");
  }
  const totals = runs.reduce(
    (t, r) => ({
      input: t.input + (r.result?.usage.inputTokens ?? 0),
      output: t.output + (r.result?.usage.outputTokens ?? 0),
      cached: t.cached + (r.result?.usage.cacheReadTokens ?? 0),
    }),
    { input: 0, output: 0, cached: 0 },
  );
  lines.push(``, `Tokens: ${totals.input} input, ${totals.cached} cache-read, ${totals.output} output.`);
  return lines.join("\n") + "\n";
}

const runs = await runAll();
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
mkdirSync("harness/results", { recursive: true });
writeFileSync(`harness/results/${stamp}.json`, JSON.stringify(runs, null, 2));
writeFileSync(`harness/results/${stamp}.md`, report(runs));
console.log(`\nPassed ${runs.filter((r) => r.pass).length} of ${runs.length}. Report: harness/results/${stamp}.md`);
