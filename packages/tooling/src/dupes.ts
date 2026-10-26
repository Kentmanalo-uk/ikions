/**
 * Duplicate detection.
 *
 * - Exact: identical drawing (normalised SVG body) under two names.
 * - Near: rasterise each variant to a 32 × 32 mask and compare every pair by
 *   intersection-over-union, also against the other icon's 90° rotations and
 *   mirrors, so "new" icons that are just turned or flipped copies are caught.
 *   Intentional direction families (arrow-up / arrow-down …) are not reported.
 */
import { Resvg } from "@resvg/resvg-js";
import type { SourceIcon, Variant } from "./schema.ts";

const N = 32;
const WORDS = (N * N) / 32;

export interface DupePair {
  a: string;
  b: string;
  variant: Variant;
  score: number;
  transform: string;
}

function mask(svg: string): Uint32Array {
  const png = new Resvg(svg.replaceAll("currentColor", "#000"), { fitTo: { mode: "width", value: N }, font: { loadSystemFonts: false } }).render();
  const px = png.pixels;
  const bits = new Uint32Array(WORDS);
  for (let i = 0; i < N * N; i++) if (px[i * 4 + 3]! > 96) bits[i >> 5]! |= 1 << (i & 31);
  return bits;
}

type Grid = (x: number, y: number) => [number, number];
const TRANSFORMS: [string, Grid][] = [
  ["identity", (x, y) => [x, y]],
  ["rotate90", (x, y) => [N - 1 - y, x]],
  ["rotate180", (x, y) => [N - 1 - x, N - 1 - y]],
  ["rotate270", (x, y) => [y, N - 1 - x]],
  ["mirrorX", (x, y) => [N - 1 - x, y]],
  ["mirrorY", (x, y) => [x, N - 1 - y]],
  ["transpose", (x, y) => [y, x]],
  ["antiTranspose", (x, y) => [N - 1 - y, N - 1 - x]],
];

function apply(bits: Uint32Array, t: Grid): Uint32Array {
  const out = new Uint32Array(WORDS);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const i = y * N + x;
      if (bits[i >> 5]! & (1 << (i & 31))) {
        const [nx, ny] = t(x, y);
        const j = ny * N + nx;
        out[j >> 5]! |= 1 << (j & 31);
      }
    }
  }
  return out;
}

const popcount = (v: number) => {
  v -= (v >>> 1) & 0x55555555;
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return (((v + (v >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
};

function iou(a: Uint32Array, b: Uint32Array): number {
  let inter = 0;
  let union = 0;
  for (let i = 0; i < WORDS; i++) {
    inter += popcount(a[i]! & b[i]!);
    union += popcount(a[i]! | b[i]!);
  }
  return union === 0 ? 0 : inter / union;
}

const DIRECTION = /\b(up|down|left|right|horizontal|vertical|diagonal|top|bottom|start|end|forward|backward|back|in|out|open|close|cw|ccw|next|previous|prev|first|last|on|off|increase|decrease|plus|minus|ascending|descending)\b/g;

/** Names that differ only in direction/state words are an intentional family. */
function isDirectionalFamily(a: string, b: string): boolean {
  const strip = (s: string) => s.replace(/-/g, " ").replace(DIRECTION, "").replace(/\s+/g, " ").trim();
  return strip(a) === strip(b);
}

const body = (svg: string) => svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/\s+/g, " ").trim();

export function findDuplicates(icons: SourceIcon[], threshold = 0.9) {
  const exact: { a: string; b: string; variant: Variant }[] = [];
  const seen = new Map<string, string>();
  for (const icon of icons) {
    for (const variant of ["outline", "filled"] as Variant[]) {
      const key = `${variant}:${body(icon.svg[variant])}`;
      const prior = seen.get(key);
      if (prior) exact.push({ a: prior, b: icon.meta.name, variant });
      else seen.set(key, icon.meta.name);
    }
  }

  const near: DupePair[] = [];
  for (const variant of ["outline", "filled"] as Variant[]) {
    const masks = icons.map((icon) => mask(icon.svg[variant]));
    const variants = masks.map((m) => TRANSFORMS.map(([name, t]) => [name, name === "identity" ? m : apply(m, t)] as const));
    for (let i = 0; i < icons.length; i++) {
      for (let j = i + 1; j < icons.length; j++) {
        const a = icons[i]!.meta.name;
        const b = icons[j]!.meta.name;
        let best = 0;
        let how = "identity";
        for (const [name, m] of variants[j]!) {
          if (name !== "identity" && isDirectionalFamily(a, b)) continue;
          const s = iou(masks[i]!, m);
          if (s > best) {
            best = s;
            how = name;
          }
        }
        if (best >= threshold && !(how === "identity" && isDirectionalFamily(a, b) && best < 0.995)) {
          near.push({ a, b, variant, score: Math.round(best * 1000) / 1000, transform: how });
        }
      }
    }
  }
  near.sort((x, y) => y.score - x.score);
  return { exact, near };
}
