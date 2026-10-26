/**
 * `pnpm icons:families [family...]` — (re)generate programmatic families from
 * assets/plan/families.json. Generated names are recorded in
 * assets/plan/generated.json; a folder that exists but is not recorded there
 * belongs to a hand-drawn icon and is never overwritten.
 */
import fs from "node:fs";
import path from "node:path";
import { readJson } from "../catalog.ts";
import { arrowFamilies, composite, containerFamilies, offVariant, writeFamilyIcon, type FamilyIcon } from "../families.ts";
import { SOURCE } from "../paths.ts";
import { PLAN_DIR, type FamiliesSpec } from "../plan.ts";
import { validateSvg } from "../validate.ts";
import { ROOT_ATTRS, VARIANTS } from "../schema.ts";

const only = new Set(process.argv.slice(2));
const want = (family: string) => only.size === 0 || only.has(family);
const spec = readJson<FamiliesSpec>(path.join(PLAN_DIR, "families.json"));
const ledgerFile = path.join(PLAN_DIR, "generated.json");
const ledger = new Set<string>(fs.existsSync(ledgerFile) ? readJson<string[]>(ledgerFile) : []);

const icons: FamilyIcon[] = [];
const errors: string[] = [];
const attempt = (label: string, fn: () => FamilyIcon | FamilyIcon[]) => {
  try {
    const r = fn();
    icons.push(...(Array.isArray(r) ? r : [r]));
  } catch (error) {
    errors.push(`${label}: ${(error as Error).message}`);
  }
};

if (want("composites")) {
  for (const [base, badges] of Object.entries(spec.composites)) {
    for (const badge of badges) attempt(`${base}-${badge}`, () => composite(base, badge));
  }
}
if (want("off")) for (const base of spec.off) attempt(`${base}-off`, () => offVariant(base));
if (want("arrows")) attempt("arrows", () => arrowFamilies(spec.arrows));
if (want("containers")) attempt("containers", () => containerFamilies(spec.containers));

let written = 0;
let skipped = 0;
const invalid: string[] = [];
const root = (v: (typeof VARIANTS)[number]) =>
  Object.entries(ROOT_ATTRS[v])
    .map(([k, val]) => `${k}="${val}"`)
    .join(" ");

for (const icon of icons) {
  const dir = path.join(SOURCE, icon.name);
  if (fs.existsSync(dir) && !ledger.has(icon.name)) {
    skipped++;
    continue;
  }
  const problems = VARIANTS.flatMap((v) =>
    validateSvg(`<svg ${root(v)}>${(v === "outline" ? icon.outline : icon.filled).join("")}</svg>`, v).map((m) => `${v}: ${m}`),
  );
  if (problems.length) {
    invalid.push(`${icon.name} — ${problems.join("; ")}`);
    continue;
  }
  writeFamilyIcon(icon);
  ledger.add(icon.name);
  written++;
}

fs.writeFileSync(ledgerFile, `${JSON.stringify([...ledger].sort(), null, 2)}\n`);
console.log(`Generated ${written} family icons (${skipped} skipped: hand-drawn icon already uses the name).`);
if (invalid.length) console.log(`\n${invalid.length} invalid (not written):\n  ${invalid.join("\n  ")}`);
if (errors.length) console.log(`\n${errors.length} error(s):\n  ${errors.join("\n  ")}`);
