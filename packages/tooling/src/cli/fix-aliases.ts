/**
 * `tsx src/cli/fix-aliases.ts` — resolve alias collisions across the catalog.
 *
 * As the library grows, a concept that used to be an alias (e.g. "caret-down"
 * on chevron-down) gets its own icon. Then:
 *   1. an alias equal to any other icon's name (published or planned) is removed;
 *   2. an alias claimed by several icons stays with the earliest-added icon.
 * Removed aliases are kept as tags so search still finds the icon by them.
 * Idempotent; prints every change.
 */
import fs from "node:fs";
import path from "node:path";
import { loadCatalog } from "../catalog.ts";
import { loadPlan } from "../plan.ts";

const { icons } = loadCatalog();
const { generated, concepts } = loadPlan();
const names = new Set([...icons.map((i) => i.meta.name), ...generated.map((g) => g.name), ...concepts.map((c) => c.name)]);

const versionKey = (v: string) => v.split(".").map((n) => n.padStart(4, "0")).join(".");
const ordered = [...icons].sort((a, b) => versionKey(a.meta.added).localeCompare(versionKey(b.meta.added)) || a.meta.name.localeCompare(b.meta.name));

const owner = new Map<string, string>();
let changes = 0;
for (const icon of ordered) {
  const keep: string[] = [];
  const moved: string[] = [];
  for (const alias of icon.meta.aliases) {
    if (alias !== icon.meta.name && names.has(alias)) {
      console.log(`${icon.meta.name}: removed alias "${alias}" (now its own icon)`);
      changes++;
      moved.push(alias);
      continue;
    }
    const prior = owner.get(alias);
    if (prior && prior !== icon.meta.name) {
      console.log(`${icon.meta.name}: removed alias "${alias}" (already an alias of ${prior})`);
      changes++;
      moved.push(alias);
      continue;
    }
    owner.set(alias, icon.meta.name);
    keep.push(alias);
  }
  if (keep.length !== icon.meta.aliases.length) {
    const file = path.join(icon.dir, "meta.json");
    const meta = JSON.parse(fs.readFileSync(file, "utf8"));
    meta.aliases = keep;
    // A removed alias is still a useful search word: keep it as a tag.
    for (const alias of moved) {
      const tag = alias.replace(/-/g, " ");
      if (!meta.tags.includes(tag)) meta.tags.push(tag);
    }
    fs.writeFileSync(file, `${JSON.stringify(meta, null, 2)}\n`);
  }
}
console.log(`\n${changes} alias change(s).`);
