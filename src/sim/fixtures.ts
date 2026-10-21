// Recipes the DM accepted in test runs, for trying the simulation before the
// invention UI is connected. Unlock them from the debug panel.

import type { Recipe } from "../dm/schema.js";
import fixtures from "./fixtures.json" with { type: "json" };

export const FIXTURE_RECIPES = fixtures as Recipe[];
