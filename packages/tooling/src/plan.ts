/**
 * Catalog expansion plan: which concepts are published, which are generated
 * by family scripts, and which hand-drawn concepts are assigned to which batch.
 * The batch manifest (assets/plan/batches.json) is append-only, so re-running
 * never reshuffles work that is already assigned or done.
 */
import fs from "node:fs";
import path from "node:path";
import { readJson } from "./catalog.ts";
import { ASSETS, SOURCE } from "./paths.ts";
import { NAME_PATTERN } from "./schema.ts";

export const PLAN_DIR = path.join(ASSETS, "plan");
export const BATCH_FILE = path.join(PLAN_DIR, "batches.json");
export const BATCH_SIZE = 45;

export interface FamiliesSpec {
  composites: Record<string, string[]>;
  off: string[];
  arrows: Record<string, string[]>;
  containers: Record<string, string[]>;
}

export interface Batch {
  id: string;
  category: string;
  names: string[];
}

/** Names rejected from the hand-drawn list: brand-derived or second drawings of a concept. */
const REJECT = [/^docker/, /^kubernetes/, /^npm-/, /^graphql$/, /^telegram/, /-free$/, /-\d$/];

export function familyNames(spec: FamiliesSpec): { name: string; family: string }[] {
  const out: { name: string; family: string }[] = [];
  for (const [base, badges] of Object.entries(spec.composites)) for (const b of badges) out.push({ name: `${base}-${b}`, family: "composite" });
  for (const base of spec.off) out.push({ name: `${base}-off`, family: "off" });
  const a = spec.arrows;
  for (const n of a["extra-directions"] ?? []) out.push({ name: n, family: "arrows" });
  for (const d of a["arrow-circle"] ?? []) out.push({ name: `arrow-circle-${d}`, family: "arrows" });
  for (const d of a["arrow-square"] ?? []) out.push({ name: `arrow-square-${d}`, family: "arrows" });
  for (const d of a["arrow-to-line"] ?? []) out.push({ name: `arrow-${d}-to-line`, family: "arrows" });
  for (const d of a["arrow-from-line"] ?? []) out.push({ name: `arrow-${d}-from-line`, family: "arrows" });
  for (const d of a.chevrons ?? []) out.push({ name: `chevrons-${d}`, family: "arrows" });
  for (const d of a["chevron-circle"] ?? []) out.push({ name: `chevron-circle-${d}`, family: "arrows" });
  for (const d of a.caret ?? []) out.push({ name: `caret-${d}`, family: "arrows" });
  for (const d of a.corner ?? []) out.push({ name: `corner-${d}`, family: "arrows" });
  for (const d of a["arrow-big"] ?? []) out.push({ name: `arrow-big-${d}`, family: "arrows" });
  for (const d of a.move ?? []) out.push({ name: `move-${d}`, family: "arrows" });
  for (const [shape, glyphs] of Object.entries(spec.containers)) for (const g of glyphs) out.push({ name: `${shape}-${g}`, family: "containers" });
  return out;
}

export function publishedNames(): Set<string> {
  return new Set(
    fs.existsSync(SOURCE)
      ? fs.readdirSync(SOURCE, { withFileTypes: true }).filter((d) => d.isDirectory() && fs.existsSync(path.join(SOURCE, d.name, "meta.json"))).map((d) => d.name)
      : [],
  );
}

export function loadPlan() {
  const families = readJson<FamiliesSpec>(path.join(PLAN_DIR, "families.json"));
  const handdrawn = readJson<Record<string, string[] | string | Record<string, string>>>(path.join(PLAN_DIR, "handdrawn.json"));
  const generated = familyNames(families);
  const generatedSet = new Set(generated.map((g) => g.name));
  const published = publishedNames();
  // Concepts dropped on review (duplicates, illegible) are neither counted nor assigned.
  const dropped = new Set(Object.keys((handdrawn.$dropped as unknown as Record<string, string>) ?? {}));
  const seen = new Set<string>(dropped);
  const rejected: string[] = [];
  const concepts: { name: string; category: string }[] = [];
  for (const [category, names] of Object.entries(handdrawn)) {
    if (category.startsWith("$") || !Array.isArray(names)) continue;
    for (const name of names) {
      if (seen.has(name) || generatedSet.has(name)) continue;
      seen.add(name);
      if (!NAME_PATTERN.test(name) || REJECT.some((r) => r.test(name))) {
        rejected.push(name);
        continue;
      }
      concepts.push({ name, category });
    }
  }
  return { families, generated, published, concepts, rejected, dropped };
}

/** Assign every unassigned, unpublished hand-drawn concept to a batch (append-only). */
export function syncBatches(): Batch[] {
  const { concepts, published } = loadPlan();
  const batches: Batch[] = fs.existsSync(BATCH_FILE) ? readJson<Batch[]>(BATCH_FILE) : [];
  const assigned = new Set(batches.flatMap((b) => b.names));
  const byCategory = new Map<string, string[]>();
  for (const c of concepts) {
    if (assigned.has(c.name) || published.has(c.name)) continue;
    byCategory.set(c.category, [...(byCategory.get(c.category) ?? []), c.name]);
  }
  let next = batches.length + 1;
  for (const [category, names] of byCategory) {
    // Split evenly so no batch is a tiny leftover.
    const size = Math.ceil(names.length / Math.ceil(names.length / BATCH_SIZE));
    for (let i = 0; i < names.length; i += size) {
      batches.push({ id: `b${String(next++).padStart(3, "0")}`, category, names: names.slice(i, i + size) });
    }
  }
  fs.writeFileSync(BATCH_FILE, `${JSON.stringify(batches, null, 2)}\n`);
  return batches;
}
