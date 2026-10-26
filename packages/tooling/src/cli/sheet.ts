import fs from "node:fs";
import path from "node:path";
import { loadCatalog } from "../catalog.ts";
import { REVIEW } from "../paths.ts";
import { VARIANTS, type IconNode, type Variant } from "../schema.ts";
import { renderDetailSheet, renderSizeSheet, type SheetIcon } from "../sheet.ts";
import { parseSvg, toNodes } from "../svg.ts";

// Usage: pnpm icons:sheet [name-or-category ...] [--out <dir>]
const args = process.argv.slice(2);
const outIndex = args.indexOf("--out");
const outDir = outIndex >= 0 ? path.resolve(args[outIndex + 1] ?? REVIEW) : REVIEW;
const filters = args.filter((_, i) => outIndex < 0 || (i !== outIndex && i !== outIndex + 1));

const { icons } = loadCatalog();
const selected = icons.filter(
  (icon) => filters.length === 0 || filters.includes(icon.meta.name) || filters.includes(icon.meta.category),
);

const sheetIcons: SheetIcon[] = [];
for (const icon of selected) {
  try {
    const nodes = {} as Record<Variant, IconNode[]>;
    for (const v of VARIANTS) nodes[v] = toNodes(parseSvg(icon.svg[v]).children);
    sheetIcons.push({ name: icon.meta.name, nodes });
  } catch (error) {
    console.warn(`skipping ${icon.meta.name}: ${(error as Error).message}`);
  }
}

fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(outDir)) if (/^(detail|sizes)-\d+\.png$/.test(f)) fs.rmSync(path.join(outDir, f));

const PAGE = 24;
for (let page = 0; page * PAGE < sheetIcons.length; page++) {
  const chunk = sheetIcons.slice(page * PAGE, (page + 1) * PAGE);
  const n = String(page + 1).padStart(2, "0");
  fs.writeFileSync(path.join(outDir, `detail-${n}.png`), renderDetailSheet(chunk));
  fs.writeFileSync(path.join(outDir, `sizes-${n}.png`), renderSizeSheet(chunk));
}
console.log(`Rendered ${sheetIcons.length} icons to ${outDir}`);
