/**
 * The library's soft geometry, applied to every icon. Straight corners and
 * existing tangent corner arcs are rebuilt with one generous radius rule, and
 * rectangles get the same rounding, so outlines and fills share a construction.
 *
 * Radii only ever grow. Vertices where another shape joins stay as drawn, and
 * open two-segment strokes (chevrons, check marks) get only a slight softening.
 * Corners are rebuilt from their original lines, so running this again changes
 * nothing.
 */
import type { Variant } from "./schema.ts";

type Point = [number, number];
type Cmd = { c: string; a: number[] };
type Seg = { cmd: Cmd; from: Point; to: Point; keep: number };
type Arc = { grew: boolean; from: Point; to: Point; r: number; sweep: number };

const LIMITS: Record<Variant, { max: number; minSegment: number }> = {
  outline: { max: 3.2, minSegment: 1.4 },
  filled: { max: 2.6, minSegment: 1.4 },
};
const SHARE = 0.28; // Tangent length as a share of the shorter segment.
const RECT_SHARE = 0.25; // Corner radius as a share of the shorter side.
const TIP_MAX = 0.55; // Open two-segment strokes stay legible as marks.
const TIP_SHARE = 0.2;
const MIN_TURN = 15; // Degrees; flatter vertices already read as smooth.
const JOIN_DISTANCE = 0.3;
const GROW_MIN = 0.05;
const POINT_ANGLE = (80 * Math.PI) / 180; // Sharper than this, a corner shows direction.
const POINT_RADIUS = 0.55; // Tips stay readable: carets, cursors, stars.
const MAX_CORNER_ARC = 8; // Larger arcs are drawn curves, not corners.

const TOKEN = /([MmLlHhVvCcSsQqTtAaZz])|([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/g;
const ARGS: Record<string, number> = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 };

/** Parses to absolute commands; H and V become L so corners are uniform. */
function parse(d: string): Cmd[] {
  const tokens = [...d.matchAll(TOKEN)].map((m) => m[0]);
  const out: Cmd[] = [];
  let i = 0;
  let cmd = "";
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  while (i < tokens.length) {
    if (/^[a-z]$/i.test(tokens[i]!)) cmd = tokens[i++]!;
    const lower = cmd.toLowerCase();
    const rel = cmd === lower;
    if (lower === "z") {
      out.push({ c: "Z", a: [] });
      x = sx;
      y = sy;
      continue;
    }
    const args: number[] = [];
    while (args.length < ARGS[lower]!) {
      const t = tokens[i++]!;
      const flag = lower === "a" && (args.length === 3 || args.length === 4);
      if (flag && t.length > 1) {
        // Arc flags may run into the next number ("011.5").
        args.push(Number(t[0]));
        tokens.splice(i, 0, t.slice(1));
      } else args.push(Number(t));
    }
    if (lower === "h" || lower === "v") {
      const nx = lower === "h" ? (rel ? x + args[0]! : args[0]!) : x;
      const ny = lower === "v" ? (rel ? y + args[0]! : args[0]!) : y;
      out.push({ c: "L", a: [nx, ny] });
      x = nx;
      y = ny;
    } else if (lower === "a") {
      const [rx, ry, rot, large, sweep, ex, ey] = args as [number, number, number, number, number, number, number];
      const nx = rel ? x + ex : ex;
      const ny = rel ? y + ey : ey;
      out.push({ c: "A", a: [rx, ry, rot, large, sweep, nx, ny] });
      x = nx;
      y = ny;
    } else {
      const abs = args.map((v, k) => (rel ? v + (k % 2 === 0 ? x : y) : v));
      const upper = cmd.toUpperCase();
      out.push({ c: upper, a: abs });
      x = abs[abs.length - 2]!;
      y = abs[abs.length - 1]!;
      if (upper === "M") {
        sx = x;
        sy = y;
        cmd = rel ? "l" : "L";
      }
    }
  }
  return out;
}

const num = (n: number) => String(Math.round(n * 1000) / 1000);
const write = (cmds: Cmd[]) => cmds.map((p) => p.c + p.a.map(num).join(" ")).join("");
const end = (c: Cmd): Point => [c.a[c.a.length - 2]!, c.a[c.a.length - 1]!];
const dist = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function splitSubpaths(cmds: Cmd[]): Cmd[][] {
  const subs: Cmd[][] = [];
  for (const c of cmds) {
    if (c.c === "M") subs.push([c]);
    else subs.at(-1)?.push(c);
  }
  return subs;
}

/** The arc replacing vertex v between a and b, or null when v should stay. */
function fillet(a: Point, v: Point, b: Point, variant: Variant, others: Point[], tip: boolean, keep: number): Arc | null {
  const la = dist(a, v);
  const lb = dist(v, b);
  const { max, minSegment } = LIMITS[variant];
  if (Math.min(la, lb) < minSegment && !keep) return null;
  const ux = (a[0] - v[0]) / la;
  const uy = (a[1] - v[1]) / la;
  const wx = (b[0] - v[0]) / lb;
  const wy = (b[1] - v[1]) / lb;
  const interior = Math.acos(Math.max(-1, Math.min(1, ux * wx + uy * wy)));
  if (180 - (interior * 180) / Math.PI < MIN_TURN) return null;
  if (!keep && others.some((p) => dist(p, v) < JOIN_DISTANCE)) return null;
  const pointLimit = interior < POINT_ANGLE ? POINT_RADIUS / Math.tan(interior / 2) : max;
  const grown = tip ? Math.min(TIP_MAX, TIP_SHARE * Math.min(la, lb)) : Math.min(max, pointLimit, SHARE * Math.min(la, lb));
  // Corners that would barely change stay as they are, which keeps reruns stable.
  const t = grown > keep + GROW_MIN ? grown : keep;
  if (!t) return null;
  return {
    grew: t > keep,
    from: [v[0] + ux * t, v[1] + uy * t],
    to: [v[0] + wx * t, v[1] + wy * t],
    r: t * Math.tan(interior / 2),
    sweep: ux * wy - uy * wx < 0 ? 1 : 0,
  };
}

/** Where two lines cross, or null when they are nearly parallel. */
function cross(p1: Point, p2: Point, p3: Point, p4: Point): Point | null {
  const d = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]);
  if (Math.abs(d) < 1e-3) return null;
  const a = p1[0] * p2[1] - p1[1] * p2[0];
  const b = p3[0] * p4[1] - p3[1] * p4[0];
  return [(a * (p3[0] - p4[0]) - (p1[0] - p2[0]) * b) / d, (a * (p3[1] - p4[1]) - (p1[1] - p2[1]) * b) / d];
}

/** Turns tangent line-arc-line corners back into vertices, remembering their size. */
function collapse(segs: Seg[], closed: boolean): Seg[] {
  const out = segs.slice();
  for (let i = out.length - 1; i >= 0 && out.length > 2; i--) {
    const n = out.length;
    const at = i % n;
    if (!closed && (at === 0 || at === n - 1)) continue;
    const seg = out[at]!;
    const prev = out[(at - 1 + n) % n]!;
    const next = out[(at + 1) % n]!;
    if (seg.cmd.c !== "A" || prev.cmd.c !== "L" || next.cmd.c !== "L") continue;
    const [rx, ry, , large] = seg.cmd.a as [number, number, number, number];
    if (rx !== ry || large || rx > MAX_CORNER_ARC) continue;
    const v = cross(prev.from, prev.to, next.from, next.to);
    if (!v) continue;
    const t1 = dist(prev.to, v);
    const t2 = dist(next.from, v);
    if (Math.abs(t1 - t2) > 0.04 || t1 >= dist(prev.from, v) || t2 >= dist(next.to, v)) continue;
    const ax = prev.from[0] - v[0];
    const ay = prev.from[1] - v[1];
    const bx = next.to[0] - v[0];
    const by = next.to[1] - v[1];
    const half = Math.acos(Math.max(-1, Math.min(1, (ax * bx + ay * by) / (Math.hypot(ax, ay) * Math.hypot(bx, by))))) / 2;
    if (Math.abs(rx - t1 * Math.tan(half)) > 0.12) continue;
    prev.to = v;
    prev.cmd = { c: "L", a: [...v] };
    next.from = v;
    next.keep = Math.max(next.keep, t1);
    out.splice(at, 1);
  }
  return out;
}

function refineSubpath(sub: Cmd[], variant: Variant, others: Point[]): Cmd[] {
  const closed = sub.at(-1)?.c === "Z";
  const body = closed ? sub.slice(0, -1) : sub.slice();
  const start = end(body[0]!);
  // The closing edge is a real segment unless the path already ended at its start.
  if (closed && dist(end(body.at(-1)!), start) > 1e-6) body.push({ c: "L", a: [...start] });
  if (body.length < 3) return sub;
  const raw: Seg[] = body.slice(1).map((cmd, i) => ({ cmd: { ...cmd }, from: end(body[i]!), to: end(cmd), keep: 0 }));
  const segs = collapse(raw, closed);
  const n = segs.length;
  const tip = !closed && n === 2;
  // corners[i] sits at the end of segs[i]; `keep` on the next segment is that corner's old size.
  const corners = segs.map((seg, i) => {
    const next = closed ? segs[(i + 1) % n]! : segs[i + 1];
    if (!next || seg.cmd.c !== "L" || next.cmd.c !== "L") return null;
    return fillet(seg.from, seg.to, next.to, variant, others, tip, next.keep);
  });
  if (!corners.some((c) => c?.grew)) return sub;
  const last = closed ? corners[n - 1] : null;
  const out: Cmd[] = [{ c: "M", a: last ? [...last.to] : [...segs[0]!.from] }];
  segs.forEach((seg, i) => {
    const arc = corners[i];
    if (seg.cmd.c === "L") out.push({ c: "L", a: arc ? [...arc.from] : [...seg.to] });
    else out.push(seg.cmd);
    if (arc) out.push({ c: "A", a: [arc.r, arc.r, 0, 0, arc.sweep, ...arc.to] });
  });
  if (closed) out.push({ c: "Z", a: [] });
  return out;
}

function refineRect(tag: string, variant: Variant): string {
  const attr = (k: string) => Number(tag.match(new RegExp(` ${k}="([^"]+)"`))?.[1] ?? 0);
  const rx = attr("rx");
  const r = Math.max(rx, Math.min(LIMITS[variant].max, RECT_SHARE * Math.min(attr("width"), attr("height"))));
  if (r <= rx) return tag;
  const value = ` rx="${num(r)}"`;
  const clean = tag.replace(/ ry="[^"]+"/, "");
  return / rx="/.test(clean) ? clean.replace(/ rx="[^"]+"/, value) : clean.replace(/\s*\/>$/, `${value}/>`);
}

/** Refines one SVG file's text. Returns it unchanged when nothing qualifies. */
export function refineSvg(svg: string, variant: Variant): string {
  const rounded = svg.replace(/<rect\b[^>]*>/g, (tag) => refineRect(tag, variant));
  const parsed = [...rounded.matchAll(/ d="([^"]+)"/g)].map((m) => splitSubpaths(parse(m[1]!)));
  const all = parsed.flatMap((subs, p) => subs.map((sub, s) => ({ p, s, points: sub.filter((c) => c.c !== "Z").map(end) })));
  let index = -1;
  return rounded.replace(/ d="([^"]+)"/g, (whole) => {
    const p = ++index;
    const subs = parsed[p]!;
    const before = subs.map(write).join("");
    const next = subs
      .map((sub, s) => write(refineSubpath(sub, variant, all.filter((o) => o.p !== p || o.s !== s).flatMap((o) => o.points))))
      .join("");
    return next === before ? whole : ` d="${next}"`;
  });
}
