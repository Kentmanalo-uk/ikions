import fs from "node:fs";
import path from "node:path";
import { loadCatalog } from "../catalog.ts";
import { REVIEW } from "../paths.ts";
import { VARIANTS, type IconNode, type Variant } from "../schema.ts";
import { renderDetailSheet, renderSizeSheet } from "../sheet.ts";
import { parseSvg, toNodes } from "../svg.ts";
import { BASELINE_FILE, compareHashes, readBaseline, renderHashes, writeBaseline } from "../visual.ts";

// Usage: pnpm icons:visual            compare against the baseline
//        pnpm icons:visual --update   accept the current rendering
const catalog = loadCatalog();
const current = renderHashes(catalog);

if (process.argv.includes("--update")) {
  writeBaseline(current);
  console.log(`Baseline updated: ${Object.keys(current).length} renders → ${path.relative(process.cwd(), BASELINE_FILE)}`);
  process.exit(0);
}

const baseline = readBaseline();
if (!baseline) {
  console.error("No visual baseline yet. Review the contact sheets, then run with --update.");
  process.exit(1);
}

const diff = compareHashes(baseline, current);
const touched = [...new Set([...diff.changed, ...diff.added].map((key) => key.split("/")[0]!))];
console.log(`${diff.changed.length} changed, ${diff.added.length} new, ${diff.removed.length} removed renders.`);
for (const key of diff.changed) console.log(`changed  ${key}`);
for (const key of diff.removed) console.log(`removed  ${key}`);

if (touched.length > 0) {
  const icons = catalog.icons
    .filter((i) => touched.includes(i.meta.name))
    .map((i) => {
      const nodes = {} as Record<Variant, IconNode[]>;
      for (const v of VARIANTS) nodes[v] = toNodes(parseSvg(i.svg[v]).children);
      return { name: i.meta.name, nodes };
    });
  fs.mkdirSync(REVIEW, { recursive: true });
  fs.writeFileSync(path.join(REVIEW, "visual-diff-detail.png"), renderDetailSheet(icons));
  fs.writeFileSync(path.join(REVIEW, "visual-diff-sizes.png"), renderSizeSheet(icons));
  console.log(`Review sheets for ${touched.length} icon(s) written to ${REVIEW}/visual-diff-*.png`);
}

if (diff.changed.length || diff.removed.length || diff.added.length) {
  console.error("Visual changes detected. If intended, run: pnpm icons:visual --update");
  process.exit(1);
}
