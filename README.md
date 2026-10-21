# Kardashev Zero

A 4X and factory-automation game where players invent every technology themselves. There is no tech tree: an AI game master (the DM) judges each invention pitch against the world's real physics and the society's material culture, and accepted inventions become recipes the game runs.

## Docs

- [Initial Design](Kardashev%20Zero%20Initial%20Design.md): vision, core loop, invention mechanic, long-term scope.
- [World Background: Enceladus](Kardashev%20Zero%20World%20Background%20Enceladus.md): the dark-ocean world.
- [First Slice Spec](docs/first-slice-spec.md): what we're building first, on Earth, from a band of 30 to the first city.

## Invention-loop harness

The first code tests the invention loop on its own, with no game around it: a DM prompt, the ruling schema, starter materials for the Anatolia slice, and a set of test pitches that mix good, vague, wrong and adversarial ideas.

| Path | What it is |
| --- | --- |
| `src/dm/schema.ts` | Pitch and ruling schemas: the contract between the DM and the simulation |
| `src/dm/prompt.ts` | The DM's system prompt and per-pitch message |
| `src/dm/dm.ts` | One structured Claude call per pitch |
| `src/world/materials.ts` | Starter materials and their properties |
| `src/world/society.ts` | Society state and the bare-handed starting tasks |
| `harness/pitches.ts` | Test pitches with the verdicts we'd accept |
| `harness/run.ts` | Runs the pitches and writes a report |

Requires Node 22 and an Anthropic API key.

```sh
npm install
export ANTHROPIC_API_KEY=...
npm run harness                    # every pitch once
npm run harness -- --repeat 3      # check that rulings are consistent
npm run harness -- --only fire     # just the fire pitches
npm run harness -- --dry-run       # print a prompt, no API calls
```

Without an API key, another model (such as a Claude Code subagent) can stand in for the DM. Export the prompts, have it write one ruling per pitch as `<case id>.json` following `ruling.schema.json`, then score them:

```sh
npm run harness -- --export /tmp/dm      # system.md, ruling.schema.json, pitch-<id>.md
npm run harness -- --score /tmp/dm/results
```

`--rigor strict` switches from the default casual rigor, where the DM fills in obvious small steps, to strict, where every step that matters must be stated.

Reports land in `harness/results/` (git-ignored). Each lists pass or fail per pitch, then the full ruling, flaws, questions and recipe, so you can judge the rulings as well as the verdicts.

The DM defaults to `claude-opus-5-5` at medium effort. `--model` and `--effort` let you compare cheaper settings, since cost per ruling matters for the game's economics.
