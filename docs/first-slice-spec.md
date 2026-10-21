# Kardashev Zero: First Slice Spec

Oct 21, 2026 · @Jeff Pyles

## Goal

Prove the core loop on the smallest world that can test it: a band of 30 people with no technology grows into the first small city, and every technology along the way is invented by the player through the AI DM. The slice ends when the society reaches Kardashev 0 (about 1 MW of total energy use).

Everything here is deliberately simple. Realism, pitch specificity and discovery are meant to become player options later; this slice uses the easy end of each dial so we can get the invention loop working quickly.

## Decisions so far

| Area | Decision |
| --- | --- |
| World | Earth, a generated region that roughly gestures at Anatolia and the Fertile Crescent. Not a historical simulation. |
| Map scale | Anatolia-sized. Fine tiles around settlements, coarse regions elsewhere. Larger strategic views arrive around K = 0. |
| Start | 30 Homo sapiens with no technology at all: no fire, clothing, knapped stone or cordage. No fixed start year; not story-driven. |
| End | First small city, about Çatalhöyük scale, at K = 0. |
| Player role | God's-eye guiding intelligence that commands the population, as in Civilization or StarCraft. No avatar. |
| Population | Modeled in aggregate, not as individuals: headcount, per-craft skill levels, known techniques, morale, food. |
| Time | Continuous, with pause and speed controls. No day and night. Seasons are kept, since foraging, migration, planting and harvest run on them. Labor is counted in work-days. |
| Properties | Material properties are visible to the player. Discovery by experiment becomes an option later. |
| Specificity | Low. Well-known techniques need only a rough description. |
| Platform | Browser game in TypeScript, with a small server that holds DM calls and the API key. |
| Art | 16-bit pixel art in the spirit of A Link to the Past: bright, optimistic, a little cartoonish, 3/4 top-down. Item sprites composed from a shape per item type and a palette per material, so invented items get art automatically. |

## The invention loop

1. The player writes a pitch: what it does, what it's made of, how it's made, why it works.
2. The DM judges it against the world model and the society's current material culture.
3. The DM returns one of four rulings:
   - **Accepted:** a recipe, with a quality grade.
   - **Examiner question:** one or two pointed questions; the player answers and resubmits.
   - **Rejected:** with the specific flaw named.
   - **Out of scope:** the request isn't an invention pitch (abuse guard).
4. An accepted recipe unlocks in the player's toolkit. The player assigns workers to make it, at a cost in time and materials, and it becomes a resource to use and trade.

### Ruling format

An accepted invention produces a recipe like this:

> **Stone blade.** Inputs: 1 knappable stone. Tool: hammerstone. Labor: 0.1 work-days, needs knapping skill. Quality: 0.4. Effects: butchering ×1.5, enables hide scraping.

| Field | Meaning |
| --- | --- |
| Inputs | Materials and quantities consumed |
| Tools | Items needed but not consumed |
| Labor | Work-days per unit, and the skill used |
| Skill | Which craft skill applies; skill rises with practice and raises speed and quality |
| Quality | 0 to 1. Graded outcomes: a rough design works, but worse |
| Effects | Modifiers on existing tasks (butchering ×1.5) or new tasks it enables (hide scraping) |
| Prerequisites | Known techniques it depends on |

The exact schema lives in code at `src/dm/schema.ts` and is the contract between the DM and the simulation.

### Room for genuine novelty

The visible properties are a summary over a deeper model, so there is always more to find. When a pitch rests on something the world model doesn't cover, the DM shouldn't reject it outright. It can rule it a hypothesis with a success chance, run it as a risky experiment, and if it works, add the new property or effect to that world's record. That is the design doc's frontier mechanic applied early. It's not in the first harness, but the ruling schema leaves room for it.

## World model, first scope

Materials are described by properties, not one rule per item, so the DM can judge combinations it hasn't seen. A small set of processes acts on those properties.

- **Properties:** fracture type, hardness, fiber strength, plasticity, how it burns, calories, and so on.
- **Processes:** fracture (knapping), abrade (grinding, polishing), heat (heat tiers: campfire, oven, kiln), twist and weave (cordage, baskets, textiles), mix and dry (plaster, mudbrick), cultivate and select (farming, domestication).
- **Size:** roughly 40 to 60 materials for the whole slice. The starter list in the harness is smaller.

The harder parts are not physics:

- **Domestication** happens over generations of selection (non-shattering wheat, tamer wolves), so it needs a simple trait-drift model for species under human pressure.
- **Ecology:** seasons, regrowth, soils, animal populations and depletion.
- **Food energy per work-day** is the core economy, and it feeds the Kardashev gauge directly.
- **Knowledge flow:** each group has its own known techniques, and knowledge spreads through contact, trade and teaching. Better ways to spread knowledge are themselves inventable.
- **Neighbors:** obsidian trade implies other groups, so we need at least simple NPC bands. Other Homo species, such as Neanderthals, are a possible later addition.

### Target technologies

The slice should be able to reach roughly what Çatalhöyük had:

- **Fire and food:** hearths, ovens, roasting pits, stone boiling, querns, drying and smoking, storage.
- **Stone and bone:** knapped flint and obsidian, polished stone axes, ground stone, bone awls, needles and fishhooks.
- **Hunting:** spears, spear-thrower, bow, sling, nets and snares.
- **Fiber:** cordage, baskets and mats, linen, sewn hide clothing.
- **Farming and herding:** wheat, barley, lentils, peas and flax; dogs, sheep and goats.
- **Building:** mudbrick, timber, lime plaster, ochre paint.
- **Clay and metal:** fired clay, early pottery, cold-hammered native copper.
- **Social:** exchange networks, shared ritual. The social simulation itself is out of scope for this slice.

No wheel, draft animals, writing or smelting.

## Build order

1. **This spec.**
2. **Invention-loop harness (done).** A DM prompt, the ruling schema, a starter material list, and a script that runs a set of test pitches with no game around it. It checks whether rulings are consistent, fair and hard to game. See `README.md`.
3. **Bare simulation (first version done).** Generated map, seasons, food energy, worker assignment, recipes and the Kardashev gauge, with debug visuals. Run with `npm run dev`.
4. **Connect them, then add art.** The first playable: band to first knapped blade, fire and shelter.

## Parked

- Enceladus and how solitary species fit multiplayer.
- Social simulation and player-invented institutions.
- Discovery-by-experiment mode, realism and specificity settings.
- DM cost controls beyond the basics (pitch length limits, fixed output format, out-of-scope verdict).
