/**
 * Geometry toolkit for drawing Ikions icons (headless paper.js).
 *
 * Shapes are plain SVG path strings in 24 × 24 icon units. Use these to build
 * filled silhouettes with real cutouts (subtract), merge parts (union), and
 * clip outline strokes around a badge or slash (clipStrokes).
 *
 *   import { roundRect, circle, capsule, union, subtract, clipStrokes } from ".../packages/tooling/src/geo.ts";
 *   const filled = subtract(roundRect(3, 5, 18, 14, 3), circle(12, 12, 3));
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
// paper-core runs headless; the default entry would try to load jsdom/canvas.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const paper = require("paper/dist/paper-core.js") as typeof import("paper");
paper.setup(new paper.Size(24, 24));

type Item = paper.PathItem;

/** Round every number in path data to at most `digits` decimals. */
export function fmt(d: string, digits = 2): string {
  const f = 10 ** digits;
  return d
    .replace(/-?\d*\.?\d+(?:e-?\d+)?/g, (n) => String(Math.round(Number(n) * f) / f))
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .replace(/ ?([MmLlHhVvCcSsQqTtAaZz]) ?/g, "$1")
    .replace(/ -/g, "-")
    .trim();
}

const toItem = (d: string, fillRule: "nonzero" | "evenodd" = "nonzero"): Item => {
  const item = paper.PathItem.create(d) as Item;
  item.fillRule = fillRule;
  return item;
};
const out = (item: Item | null): string => (item ? fmt(item.pathData) : "");

// ---------- Primitive shapes (closed paths) ----------

export const rect = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}Z`;

export function roundRect(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.min(r, w / 2, h / 2);
  return fmt(
    `M${x + rr} ${y}H${x + w - rr}A${rr} ${rr} 0 0 1 ${x + w} ${y + rr}V${y + h - rr}A${rr} ${rr} 0 0 1 ${x + w - rr} ${y + h}` +
      `H${x + rr}A${rr} ${rr} 0 0 1 ${x} ${y + h - rr}V${y + rr}A${rr} ${rr} 0 0 1 ${x + rr} ${y}Z`,
  );
}

export const circle = (cx: number, cy: number, r: number) =>
  fmt(`M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`);

export const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  fmt(`M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`);

/** A filled line segment with round ends (what a stroke of `width` looks like). */
export function capsule(x1: number, y1: number, x2: number, y2: number, width: number): string {
  const r = width / 2;
  const len = Math.hypot(x2 - x1, y2 - y1) || 0.0001;
  const nx = (-(y2 - y1) / len) * r;
  const ny = ((x2 - x1) / len) * r;
  return fmt(
    `M${x1 + nx} ${y1 + ny}L${x2 + nx} ${y2 + ny}A${r} ${r} 0 0 0 ${x2 - nx} ${y2 - ny}L${x1 - nx} ${y1 - ny}A${r} ${r} 0 0 0 ${x1 + nx} ${y1 + ny}Z`,
  );
}

/** A thick polyline (round joins and caps) as a filled shape. */
export function thickPolyline(points: [number, number][], width: number): string {
  let shape = circle(points[0]![0], points[0]![1], width / 2);
  for (let i = 1; i < points.length; i++) {
    const [a, b] = [points[i - 1]!, points[i]!];
    shape = union(shape, capsule(a[0], a[1], b[0], b[1], width), circle(b[0], b[1], width / 2));
  }
  return shape;
}

export const polygon = (points: [number, number][]) => fmt(`M${points.map((p) => p.join(" ")).join("L")}Z`);

// ---------- Boolean operations on filled shapes ----------

export function union(...shapes: string[]): string {
  let acc = toItem(shapes[0]!);
  for (const s of shapes.slice(1)) acc = acc.unite(toItem(s), { insert: false }) as Item;
  return out(acc);
}

/** Remove one or more shapes from a base shape (real transparent cutouts). */
export function subtract(base: string, ...cuts: string[]): string {
  let acc = toItem(base);
  for (const c of cuts) acc = acc.subtract(toItem(c), { insert: false }) as Item;
  return out(acc);
}

/** Like subtract, but honours the base shape's fill rule (for even-odd artwork). */
export function subtractRule(base: string, fillRule: "nonzero" | "evenodd", ...cuts: string[]): string {
  let acc = toItem(base, fillRule);
  // Resolving the base first turns even-odd holes into proper winding.
  acc = acc.unite(new paper.Path(), { insert: false }) as Item;
  for (const c of cuts) acc = acc.subtract(toItem(c), { insert: false }) as Item;
  return out(acc);
}

/**
 * Transform path data about the artboard centre (12, 12). Rotation is in
 * degrees clockwise; mirrorX flips left↔right, mirrorY flips top↔bottom,
 * transpose swaps x and y (a diagonal mirror).
 */
export function transform(d: string, t: { rotate?: number; mirrorX?: boolean; mirrorY?: boolean; transpose?: boolean }): string {
  const item = toItem(d);
  const c = new paper.Point(12, 12);
  if (t.transpose) item.transform(new paper.Matrix(0, 1, 1, 0, 0, 0));
  if (t.mirrorX) item.scale(-1, 1, c);
  if (t.mirrorY) item.scale(1, -1, c);
  if (t.rotate) item.rotate(t.rotate, c);
  return out(item);
}

export function intersect(a: string, b: string): string {
  return out(toItem(a).intersect(toItem(b), { insert: false }) as Item);
}

// ---------- Strokes ----------

/**
 * Clip open or closed stroke paths so nothing is drawn inside `keepOut`.
 * Used for outline icons: the strokes stay strokes (strokeWidth still works).
 */
export function clipStrokes(d: string, keepOut: string): string {
  const item = toItem(d);
  const cut = toItem(keepOut);
  // paper.js clips open compound paths unreliably; clip each subpath on its own.
  const parts = item instanceof paper.CompoundPath ? (item.children as paper.Path[]).map((c) => c.clone({ insert: false }) as paper.Path) : [item as paper.Path];
  const kept: string[] = [];
  for (const part of parts) {
    // Untouched subpaths (including zero-length "dot" strokes) are kept as drawn.
    if (part.getIntersections(cut).length === 0 && !cut.contains(part.firstSegment.point)) {
      kept.push(out(part));
      continue;
    }
    const res = part.subtract(cut, { insert: false, trace: false }) as Item;
    // Drop slivers left at the clip boundary: they read as stray dots.
    const pieces = res instanceof paper.CompoundPath ? (res.children as paper.Path[]) : [res as paper.Path];
    for (const piece of pieces) if (piece.length >= minLength) kept.push(out(piece));
  }
  return kept.join("");
}

/** Minimum length (icon units) for a clipped stroke fragment to be kept. */
const minLength = 1.1;

/** Convert a basic SVG element to path data (for clipping or booleans). */
export function elementToPath(tag: string, a: Record<string, string>): string {
  const n = (k: string, d = 0) => (a[k] === undefined ? d : Number(a[k]));
  switch (tag) {
    case "path":
      return a.d ?? "";
    case "circle":
      return circle(n("cx"), n("cy"), n("r"));
    case "ellipse":
      return ellipse(n("cx"), n("cy"), n("rx"), n("ry"));
    case "rect":
      return n("rx") || n("ry") ? roundRect(n("x"), n("y"), n("width"), n("height"), n("rx") || n("ry")) : rect(n("x"), n("y"), n("width"), n("height"));
    case "line":
      return `M${n("x1")} ${n("y1")}L${n("x2")} ${n("y2")}`;
    case "polyline":
    case "polygon": {
      const nums = (a.points ?? "").trim().split(/[\s,]+/).map(Number);
      let d = "";
      for (let i = 0; i < nums.length; i += 2) d += `${i === 0 ? "M" : "L"}${nums[i]} ${nums[i + 1]}`;
      return tag === "polygon" ? `${d}Z` : d;
    }
    default:
      throw new Error(`Unsupported element <${tag}>`);
  }
}

/** Points along a regular polygon / star, useful for gears, stars, badges. */
export function radialPoints(cx: number, cy: number, radii: number[], count: number, rotation = -90): [number, number][] {
  const pts: [number, number][] = [];
  const total = count * radii.length;
  for (let i = 0; i < total; i++) {
    const a = ((rotation + (360 / total) * i) * Math.PI) / 180;
    const r = radii[i % radii.length]!;
    pts.push([Math.round((cx + r * Math.cos(a)) * 100) / 100, Math.round((cy + r * Math.sin(a)) * 100) / 100]);
  }
  return pts;
}
