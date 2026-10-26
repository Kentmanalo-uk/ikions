import { Resvg } from "@resvg/resvg-js";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { LoadedCatalog } from "./catalog.ts";
import { ROOT } from "./paths.ts";
import { VARIANTS } from "./schema.ts";

/**
 * Visual regression for icon artwork. Each variant is rasterised at several
 * sizes with resvg (deterministic, no system fonts) and the pixel buffers are
 * hashed. The baseline is committed; any change to rendered geometry shows up
 * as a hash mismatch and must be reviewed and accepted with --update.
 */
export const VISUAL_SIZES = [16, 24, 32] as const;
export const BASELINE_FILE = path.join(ROOT, "tests", "visual", "baseline.json");

export type Baseline = Record<string, string>;

export function renderHashes(catalog: LoadedCatalog): Baseline {
  const hashes: Baseline = {};
  for (const icon of catalog.icons) {
    for (const variant of VARIANTS) {
      const svg = icon.svg[variant].replaceAll("currentColor", "#000");
      for (const size of VISUAL_SIZES) {
        const pixels = new Resvg(svg, { fitTo: { mode: "width", value: size }, font: { loadSystemFonts: false } }).render().pixels;
        hashes[`${icon.meta.name}/${variant}@${size}`] = crypto.createHash("sha256").update(pixels).digest("hex").slice(0, 16);
      }
    }
  }
  return Object.fromEntries(Object.entries(hashes).sort(([a], [b]) => a.localeCompare(b)));
}

export interface VisualDiff {
  changed: string[];
  added: string[];
  removed: string[];
}

export function compareHashes(baseline: Baseline, current: Baseline): VisualDiff {
  const changed: string[] = [];
  const added: string[] = [];
  for (const [key, hash] of Object.entries(current)) {
    if (!(key in baseline)) added.push(key);
    else if (baseline[key] !== hash) changed.push(key);
  }
  const removed = Object.keys(baseline).filter((key) => !(key in current));
  return { changed, added, removed };
}

export function readBaseline(): Baseline | null {
  return fs.existsSync(BASELINE_FILE) ? (JSON.parse(fs.readFileSync(BASELINE_FILE, "utf8")) as Baseline) : null;
}

export function writeBaseline(hashes: Baseline) {
  fs.mkdirSync(path.dirname(BASELINE_FILE), { recursive: true });
  fs.writeFileSync(BASELINE_FILE, `${JSON.stringify(hashes, null, 1)}\n`);
}
