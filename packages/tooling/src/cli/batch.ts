/**
 * `tsx src/cli/batch.ts <batch-id> [--check]`
 *
 * Prints a batch's category and concept names with their status. With
 * --check, validates the batch's icons and checks aliases against every
 * published and planned name, so parallel batches never collide.
 */
import { loadCatalog } from "../catalog.ts";
import { loadPlan, syncBatches } from "../plan.ts";
import { validateCatalog } from "../validate.ts";

const id = process.argv[2];
const check = process.argv.includes("--check");
const batch = syncBatches().find((b) => b.id === id);
if (!batch) {
  console.error(`Unknown batch "${id}".`);
  process.exit(1);
}

const catalog = loadCatalog();
const byName = new Map(catalog.icons.map((i) => [i.meta.name, i]));
console.log(`Batch ${batch.id} — category "${batch.category}" — ${batch.names.length} concepts\n`);
for (const name of batch.names) console.log(`  ${byName.has(name) ? "✓" : "·"} ${name}`);

if (check) {
  const { generated, concepts } = loadPlan();
  const mine = new Set(batch.names);
  const otherNames = new Set([
    ...catalog.icons.map((i) => i.meta.name),
    ...generated.map((g) => g.name),
    ...concepts.map((c) => c.name),
  ]);
  for (const n of mine) otherNames.delete(n);
  const otherAliases = new Map<string, string>();
  for (const icon of catalog.icons) if (!mine.has(icon.meta.name)) for (const a of icon.meta.aliases) otherAliases.set(a, icon.meta.name);

  const problems: string[] = [];
  for (const issue of validateCatalog(catalog)) {
    if (mine.has(issue.icon) && issue.severity === "error") problems.push(`${issue.icon}${issue.variant ? `/${issue.variant}` : ""}: ${issue.message}`);
  }
  for (const name of mine) {
    const icon = byName.get(name);
    if (!icon) {
      problems.push(`${name}: not drawn yet`);
      continue;
    }
    if (icon.meta.category !== batch.category) problems.push(`${name}: category must be "${batch.category}"`);
    for (const alias of icon.meta.aliases) {
      if (otherNames.has(alias)) problems.push(`${name}: alias "${alias}" is another icon's planned or published name — drop it`);
      const owner = otherAliases.get(alias);
      if (owner) problems.push(`${name}: alias "${alias}" is already an alias of "${owner}" — drop it`);
    }
  }
  console.log(problems.length ? `\n${problems.length} problem(s):\n  ${problems.join("\n  ")}` : "\nAll icons in this batch are drawn and valid.");
  if (problems.length) process.exit(1);
}
