/**
 * Programmatic icon families, built from approved hand-drawn bases and shared
 * glyphs so whole families stay geometrically consistent:
 *
 * - composites: a base object with a modifier badge (file-check, user-lock…).
 *   The base is clipped around the badge with a breathing gap — strokes stay
 *   strokes in Outline, silhouettes are cut in Filled.
 * - off: a base object with a slash (bell-off, wifi-off…), clipped the same way.
 * - arrows: directional families from one geometry, rotated or mirrored.
 * - containers: a symbol inside a circle or square.
 *
 * Output is ordinary source SVG + meta.json in assets/source, so generated
 * icons go through the same validation, review and build as drawn ones.
 */
import fs from "node:fs";
import path from "node:path";
import { capsule, circle, clipStrokes, elementToPath, fmt, roundRect, subtract, subtractRule, thickPolyline, transform, union } from "./geo.ts";
import { SOURCE } from "./paths.ts";
import type { FamiliesSpec } from "./plan.ts";
import { ROOT_ATTRS, VARIANTS, type IconMeta, type Variant } from "./schema.ts";
import { parseSvg, toNodes } from "./svg.ts";

type Node = [string, Record<string, string>];

export interface FamilyIcon {
  name: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  aliases: string[];
  outline: string[];
  filled: string[];
}

// ---------- element helpers ----------

const attrs = (a: Record<string, string>) =>
  Object.entries(a)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
const p = (d: string, extra: Record<string, string> = {}) => `<path ${attrs({ d, ...extra })}/>`;
const heavy = (d: string, w = 2.5) =>
  p(d, { fill: "none", stroke: "currentColor", "stroke-width": String(w), "stroke-linecap": "round", "stroke-linejoin": "round" });
const solid = (d: string) => p(d, { "fill-rule": "evenodd", "clip-rule": "evenodd" });
const dot = (cx: number, cy: number, r: number) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor" stroke="none"/>`;

function loadBase(name: string): Record<Variant, Node[]> {
  const out = {} as Record<Variant, Node[]>;
  for (const v of VARIANTS) {
    const file = path.join(SOURCE, name, `${v}.svg`);
    if (!fs.existsSync(file)) throw new Error(`Base icon "${name}" has no ${v}.svg`);
    out[v] = toNodes(parseSvg(fs.readFileSync(file, "utf8")).children) as Node[];
  }
  return out;
}

function loadMeta(name: string): IconMeta {
  return JSON.parse(fs.readFileSync(path.join(SOURCE, name, "meta.json"), "utf8")) as IconMeta;
}

const isStroked = (variant: Variant, a: Record<string, string>) =>
  variant === "outline" ? a.fill !== "currentColor" || a.stroke === "currentColor" : a.stroke === "currentColor" && a.fill === "none";

/**
 * Remove everything inside `keepOutStroke` (for strokes) / `keepOutFill` (for
 * solid shapes) from a base variant, preserving each element's paint.
 */
function clipBase(nodes: Node[], variant: Variant, keepOutStroke: string, keepOutFill: string): string[] {
  const result: string[] = [];
  for (const [tag, a] of nodes) {
    const d = elementToPath(tag, a);
    const paint = Object.fromEntries(
      Object.entries(a).filter(([k]) => !["d", "cx", "cy", "r", "rx", "ry", "x", "y", "width", "height", "x1", "y1", "x2", "y2", "points"].includes(k)),
    );
    if (isStroked(variant, a)) {
      const clipped = clipStrokes(d, keepOutStroke);
      if (clipped) result.push(p(clipped, paint));
    } else {
      const rule = a["fill-rule"] === "evenodd" ? "evenodd" : "nonzero";
      const cut = subtractRule(d, rule, keepOutFill);
      if (cut) result.push(p(cut, { ...paint, "fill-rule": "evenodd", "clip-rule": "evenodd" }));
    }
  }
  return result;
}

// ---------- badge glyphs (centre 18, 18; outline extent ≤ 3.5) ----------

const BX = 18;
const BY = 18;

interface Glyph {
  outline: string[];
  filled: string[];
}

const GLYPHS: Record<string, Glyph> = {
  plus: { outline: [p("M18 14.5v7M14.5 18h7")], filled: [heavy("M18 14.75v6.5M14.75 18h6.5")] },
  minus: { outline: [p("M14.5 18h7")], filled: [heavy("M14.75 18h6.5")] },
  check: { outline: [p("M14.75 18.25l2.25 2.25 4.25-4.5")], filled: [heavy("M15 18.25l2 2 4-4.25")] },
  x: { outline: [p("M15.25 15.25l5.5 5.5M20.75 15.25l-5.5 5.5")], filled: [heavy("M15.5 15.5l5 5M20.5 15.5l-5 5")] },
  search: {
    outline: [`<circle cx="17.25" cy="17.25" r="2.5"/>`, p("M19.1 19.1l2.15 2.15")],
    filled: [heavy(circle(17.25, 17.25, 2.25)), heavy("M19.25 19.25l1.75 1.75")],
  },
  lock: {
    outline: [`<rect x="14.75" y="17.5" width="6.5" height="4.25" rx="1.25"/>`, p("M16.25 17.5v-1.25a1.75 1.75 0 0 1 3.5 0v1.25")],
    filled: [solid(roundRect(14.25, 17, 7.5, 5, 1.5)), p("M16.25 17v-0.75a1.75 1.75 0 0 1 3.5 0v0.75", { fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round" })],
  },
  alert: {
    outline: [p("M18 14.5v3.75"), dot(18, 21, 1.1)],
    filled: [heavy("M18 14.75v3.5"), `<circle cx="18" cy="21.1" r="1.4"/>`],
  },
  clock: {
    outline: [`<circle cx="18" cy="18" r="3.5"/>`, p("M18 16.25V18l1.25 1")],
    filled: [solid(subtract(circle(18, 18, 4.25), thickPolyline([[18, 16], [18, 18], [19.4, 19.1]], 1.5)))],
  },
  edit: {
    outline: [p("M15 21l0.5-2.1 4.15-4.15a1.06 1.06 0 0 1 1.5 1.5L17 20.4Z")],
    filled: [solid(union(capsule(16, 20, 20.25, 15.75, 3), "M14.4 21.6l0.75-3.05 2.3 2.3Z"))],
  },
  download: { outline: [p("M18 14.25v5M15.75 17.25 18 19.5l2.25-2.25M15 21.75h6")], filled: [heavy("M18 14.5v4.5M15.9 17.25 18 19.25l2.1-2"), heavy("M15.25 21.5h5.5", 2.25)] },
  upload: { outline: [p("M18 19.75v-5M15.75 16.75 18 14.5l2.25 2.25M15 21.75h6")], filled: [heavy("M18 19.25v-4.5M15.9 16.75 18 14.75l2.1 2"), heavy("M15.25 21.5h5.5", 2.25)] },
  star: {
    outline: [p("M18 14.6l1.05 2.3 2.5.28-1.86 1.68.52 2.46L18 20.06l-2.21 1.26.52-2.46-1.86-1.68 2.5-.28Z")],
    filled: [p("M18 14.2l1.3 2.65 2.92.32-2.17 1.98.6 2.87L18 20.55l-2.65 1.47.6-2.87-2.17-1.98 2.92-.32Z", { stroke: "currentColor", "stroke-width": "1", "stroke-linejoin": "round" })],
  },
  heart: {
    outline: [p("M18 21.25c-1.6-1.1-3.4-2.4-3.4-4.15A1.6 1.6 0 0 1 16.3 15.5c.7 0 1.3.35 1.7.9.4-.55 1-.9 1.7-.9a1.6 1.6 0 0 1 1.7 1.6c0 1.75-1.8 3.05-3.4 4.15Z")],
    filled: [p("M18 21.9c-1.85-1.25-3.9-2.7-3.9-4.75A2.05 2.05 0 0 1 16.2 15c.75 0 1.4.35 1.8.85.4-.5 1.05-.85 1.8-.85a2.05 2.05 0 0 1 2.1 2.15c0 2.05-2.05 3.5-3.9 4.75Z")],
  },
  settings: {
    outline: [
      p(
        "M17.3 14.4h1.4l.3 1.1.9.5 1.1-.35.7 1.2-.8.8v1.05l.8.8-.7 1.2-1.1-.35-.9.5-.3 1.1h-1.4l-.3-1.1-.9-.5-1.1.35-.7-1.2.8-.8V17.5l-.8-.8.7-1.2 1.1.35.9-.5Z",
      ),
      `<circle cx="18" cy="18" r="1.1"/>`,
    ],
    filled: [
      solid(
        subtract(
          "M17.15 13.9h1.7l.35 1.2.85.5 1.2-.4.85 1.45-.9.9v1l.9.9-.85 1.45-1.2-.4-.85.5-.35 1.2h-1.7l-.35-1.2-.85-.5-1.2.4-.85-1.45.9-.9v-1l-.9-.9.85-1.45 1.2.4.85-.5Z",
          circle(18, 18, 1.2),
        ),
      ),
    ],
  },
  question: {
    outline: [p("M16.35 16.1a1.75 1.75 0 1 1 2.55 1.55c-.55.3-.9.65-.9 1.2v.2"), dot(18, 21.1, 1)],
    filled: [heavy("M16.4 16.2a1.65 1.65 0 1 1 2.45 1.45c-.5.3-.85.6-.85 1.15", 2.25), `<circle cx="18" cy="21.2" r="1.3"/>`],
  },
};

const BADGE_TEXT: Record<string, { tag: string[]; describe: (noun: string, Noun: string) => string; alias?: (base: string) => string }> = {
  plus: { tag: ["add", "new", "create"], describe: (n) => `Add a new ${n}.`, alias: (b) => `add-${b}` },
  minus: { tag: ["remove", "subtract"], describe: (n) => `Remove a ${n}.`, alias: (b) => `remove-${b}` },
  check: { tag: ["done", "approved", "verified", "success"], describe: (_n, N) => `${N} confirmed, completed or verified.` },
  x: { tag: ["delete", "cancel", "close", "error"], describe: (n) => `Delete, cancel or reject a ${n}.`, alias: (b) => `delete-${b}` },
  search: { tag: ["find", "lookup", "browse"], describe: (n) => `Search for a ${n}.`, alias: (b) => `find-${b}` },
  lock: { tag: ["locked", "private", "secure", "protected"], describe: (n) => `A locked, private or protected ${n}.` },
  alert: { tag: ["warning", "error", "attention", "problem"], describe: (_n, N) => `${N} with a warning or problem that needs attention.` },
  clock: { tag: ["scheduled", "pending", "recent", "time"], describe: (n) => `A scheduled, pending or recent ${n}.` },
  edit: { tag: ["edit", "modify", "rename", "write"], describe: (n) => `Edit or rename a ${n}.`, alias: (b) => `edit-${b}` },
  download: { tag: ["download", "save", "import"], describe: (n) => `Download or import a ${n}.` },
  upload: { tag: ["upload", "send", "export"], describe: (n) => `Upload or export a ${n}.` },
  star: { tag: ["starred", "favorite", "featured"], describe: (n) => `A starred or featured ${n}.` },
  heart: { tag: ["liked", "favorite", "love"], describe: (n) => `A liked or favourite ${n}.` },
  settings: { tag: ["settings", "preferences", "configure"], describe: (n) => `Settings and preferences for a ${n}.` },
  question: { tag: ["help", "unknown", "support"], describe: (n) => `Help or questions about a ${n}.` },
};

const titleCase = (name: string) => name.split("-").map((w) => (w.length <= 2 && w !== "up" ? w.toUpperCase() : w[0]!.toUpperCase() + w.slice(1))).join(" ");

// Badge keep-out zones: Outline clips stroke centrelines, Filled cuts silhouettes.
const BADGE_KEEP_OUT_STROKE = circle(BX, BY, 6.75);
const BADGE_KEEP_OUT_FILL = circle(BX, BY, 6.5);

export function composite(base: string, badge: string): FamilyIcon {
  const glyph = GLYPHS[badge];
  const text = BADGE_TEXT[badge];
  if (!glyph || !text) throw new Error(`Unknown badge "${badge}"`);
  const nodes = loadBase(base);
  const meta = loadMeta(base);
  const noun = meta.title.toLowerCase();
  return {
    name: `${base}-${badge}`,
    title: `${meta.title} ${titleCase(badge)}`,
    category: meta.category,
    description: text.describe(noun, meta.title),
    tags: [...new Set([...meta.tags.slice(0, 3), ...text.tag, noun.split(" ")[0]!])].filter((t) => t !== `${base}-${badge}`).slice(0, 8),
    aliases: text.alias ? [text.alias(base)] : [],
    outline: [...clipBase(nodes.outline, "outline", BADGE_KEEP_OUT_STROKE, BADGE_KEEP_OUT_FILL), ...glyph.outline],
    filled: [...clipBase(nodes.filled, "filled", BADGE_KEEP_OUT_STROKE, BADGE_KEEP_OUT_FILL), ...glyph.filled],
  };
}

// ---------- off (slash) ----------

const SLASH = "M3.5 3.5l17 17";
const SLASH_KEEP_OUT_STROKE = capsule(2, 2, 22, 22, 5.25);
const SLASH_KEEP_OUT_FILL = capsule(2, 2, 22, 22, 5.75);

export function offVariant(base: string): FamilyIcon {
  const nodes = loadBase(base);
  const meta = loadMeta(base);
  const noun = meta.title.toLowerCase();
  return {
    name: `${base}-off`,
    title: `${meta.title} Off`,
    category: meta.category,
    description: `Turn off, disable or mute the ${noun}.`,
    tags: [...new Set([...meta.tags.slice(0, 3), "off", "disabled", "unavailable"])].slice(0, 8),
    aliases: [`no-${base}`],
    outline: [...clipBase(nodes.outline, "outline", SLASH_KEEP_OUT_STROKE, SLASH_KEEP_OUT_FILL), p(SLASH)],
    filled: [...clipBase(nodes.filled, "filled", SLASH_KEEP_OUT_STROKE, SLASH_KEEP_OUT_FILL), heavy(SLASH)],
  };
}

// ---------- arrows ----------

const DIR_ANGLE: Record<string, number> = {
  up: 0, "up-right": 45, right: 90, "down-right": 135, down: 180, "down-left": 225, left: 270, "up-left": 315,
};

const rot = (d: string, deg: number) => (deg ? transform(d, { rotate: deg }) : fmt(d));

/** A family member in a direction: rotate the "up" design. */
function directional(name: string, title: string, upOutline: string[], upFilled: string[], dir: string, description: string, tags: string[]): FamilyIcon {
  const a = DIR_ANGLE[dir]!;
  const mapD = (s: string) => s.replace(/ d="([^"]+)"/, (_, d: string) => ` d="${rot(d, a)}"`);
  return {
    name,
    title,
    category: "arrows",
    description,
    tags: [...new Set([...tags, ...dir.split("-")])],
    aliases: [],
    outline: upOutline.map(mapD),
    filled: upFilled.map(mapD),
  };
}

const UP_ARROW = "M12 16.5V7.5M8.25 11.25 12 7.5l3.75 3.75";

export function arrowFamilies(spec: FamiliesSpec["arrows"]): FamilyIcon[] {
  const out: FamilyIcon[] = [];

  // Diagonal arrows: mirror the approved arrow-up-right.
  const upRight = loadBase("arrow-up-right");
  const mirror = (nodes: Node[], t: { mirrorX?: boolean; mirrorY?: boolean }) =>
    nodes.map(([tag, a]) => {
      const { d: _d, ...rest } = a;
      return p(transform(elementToPath(tag, a), t), Object.fromEntries(Object.entries(rest).filter(([k]) => !["cx", "cy", "r", "x1", "y1", "x2", "y2", "x", "y", "width", "height", "rx", "ry", "points"].includes(k))));
    });
  const extra: Record<string, { mirrorX?: boolean; mirrorY?: boolean }> = {
    "arrow-up-left": { mirrorX: true },
    "arrow-down-right": { mirrorY: true },
    "arrow-down-left": { mirrorX: true, mirrorY: true },
  };
  for (const name of spec["extra-directions"] ?? []) {
    const t = extra[name];
    if (!t) continue;
    const dir = name.replace("arrow-", "");
    out.push({
      name,
      title: titleCase(name),
      category: "arrows",
      description: `Point or move ${dir.replace("-", " and ")}.`,
      tags: ["arrow", "direction", "diagonal", ...dir.split("-")],
      aliases: [],
      outline: mirror(upRight.outline, t),
      filled: mirror(upRight.filled, t),
    });
  }

  // Arrow in a circle / square: outline ring + glyph; filled solid with glyph cut out.
  const ring = `<circle cx="12" cy="12" r="9"/>`;
  const disc = circle(12, 12, 9.88);
  const box = `<rect x="3" y="3" width="18" height="18" rx="3"/>`;
  const boxSolid = roundRect(2.13, 2.13, 19.75, 19.75, 3.88);
  const glyphCut = (dir: string) => {
    const a = DIR_ANGLE[dir]!;
    const pts: [number, number][][] = [
      [[12, 16.5], [12, 7.75]],
      [[8.4, 11.35], [12, 7.75], [15.6, 11.35]],
    ];
    const shapes = pts.map((line) => thickPolyline(line, 1.75));
    return shapes.map((s) => rot(s, a));
  };
  for (const [shape, container, solidShape] of [
    ["circle", ring, disc],
    ["square", box, boxSolid],
  ] as const) {
    for (const dir of spec[`arrow-${shape}`] ?? []) {
      const a = DIR_ANGLE[dir]!;
      out.push({
        name: `arrow-${shape}-${dir}`,
        title: `Arrow ${titleCase(shape)} ${titleCase(dir)}`,
        category: "arrows",
        description: `Arrow pointing ${dir.replace("-", " and ")} inside a ${shape}; a direction button or step control.`,
        tags: ["arrow", "direction", shape, "button", ...dir.split("-")],
        aliases: [],
        outline: [container, p(rot(UP_ARROW, a))],
        filled: [solid(subtract(solidShape, ...glyphCut(dir)))],
      });
    }
  }

  // Arrow to a line / from a line.
  for (const dir of spec["arrow-to-line"] ?? []) {
    out.push(
      directional(
        `arrow-${dir}-to-line`,
        `Arrow ${titleCase(dir)} To Line`,
        [p("M5.5 4.5h13M12 20V8.75M7.75 13 12 8.75 16.25 13")],
        [heavy("M5.75 4.5h12.5M12 19.75V9M7.75 13.25 12 9l4.25 4.25")],
        dir,
        `Arrow pointing ${dir} to a line: move to the ${dir === "up" ? "top" : dir === "down" ? "bottom" : dir === "left" ? "start" : "end"}.`,
        ["arrow", "align", "edge", "jump"],
      ),
    );
  }
  for (const dir of spec["arrow-from-line"] ?? []) {
    out.push(
      directional(
        `arrow-${dir}-from-line`,
        `Arrow ${titleCase(dir)} From Line`,
        [p("M5.5 19.5h13M12 15.5V4.5M7.75 8.75 12 4.5l4.25 4.25")],
        [heavy("M5.75 19.5h12.5M12 15.25V4.75M7.75 9 12 4.75 16.25 9")],
        dir,
        `Arrow moving ${dir} away from a line: lift, raise or move off an edge.`,
        ["arrow", "edge", "move", "lift"],
      ),
    );
  }

  // Double chevrons.
  for (const dir of spec.chevrons ?? []) {
    out.push(
      directional(
        `chevrons-${dir}`,
        `Chevrons ${titleCase(dir)}`,
        [p("M6.5 12.25 12 6.75l5.5 5.5M6.5 18.25 12 12.75l5.5 5.5")],
        [heavy("M6.75 12 12 6.75 17.25 12M6.75 18 12 12.75 17.25 18")],
        dir,
        `Double chevron pointing ${dir}: skip, jump further or expand fully.`,
        ["chevron", "double", "skip", "fast"],
      ),
    );
  }

  // Chevron in a circle.
  for (const dir of spec["chevron-circle"] ?? []) {
    const a = DIR_ANGLE[dir]!;
    out.push({
      name: `chevron-circle-${dir}`,
      title: `Chevron Circle ${titleCase(dir)}`,
      category: "arrows",
      description: `Chevron pointing ${dir} inside a circle; a round navigation or expand button.`,
      tags: ["chevron", "circle", "button", "navigate", dir],
      aliases: [],
      outline: [ring, p(rot("M8 13.75 12 9.75l4 4", a))],
      filled: [solid(subtract(disc, rot(thickPolyline([[8, 13.75], [12, 9.75], [16, 13.75]], 1.9), a)))],
    });
  }

  // Carets (small triangles).
  for (const dir of spec.caret ?? []) {
    out.push(
      directional(
        `caret-${dir}`,
        `Caret ${titleCase(dir)}`,
        [p("M7.5 14.5 12 9.25l4.5 5.25Z")],
        [p("M7.5 14.5 12 9.25l4.5 5.25Z", { stroke: "currentColor", "stroke-width": "2.5", "stroke-linejoin": "round" })],
        dir,
        `Small triangle pointing ${dir}: open a menu, sort or indicate direction.`,
        ["caret", "triangle", "dropdown", "sort"],
      ),
    );
  }

  // Corner arrows: one drawing, eight orientations.
  const CORNER = "M18.5 4.5v6.5a3 3 0 0 1-3 3H5.5M9.25 10.25 5.5 14l3.75 3.75";
  const CORNER_F = "M18.5 4.75V11a3 3 0 0 1-3 3H5.75M9.25 10.5 5.75 14l3.5 3.5";
  const cornerT: Record<string, { mirrorX?: boolean; mirrorY?: boolean; transpose?: boolean }> = {
    "down-left": {},
    "down-right": { mirrorX: true },
    "up-left": { mirrorY: true },
    "up-right": { mirrorX: true, mirrorY: true },
    "right-up": { transpose: true },
    "left-up": { transpose: true, mirrorX: true },
    "right-down": { transpose: true, mirrorY: true },
    "left-down": { transpose: true, mirrorX: true, mirrorY: true },
  };
  for (const dir of spec.corner ?? []) {
    const t = cornerT[dir];
    if (!t) continue;
    const [first, second] = dir.split("-");
    out.push({
      name: `corner-${dir}`,
      title: `Corner ${titleCase(dir)}`,
      category: "arrows",
      description: `Arrow that goes ${first} then turns ${second}: return, redirect or reply.`,
      tags: ["arrow", "corner", "turn", "return", first!, second!],
      aliases: [],
      outline: [p(transform(CORNER, t))],
      filled: [heavy(transform(CORNER_F, t))],
    });
  }

  // Big block arrows.
  const BIG = "M12 3.75 19.5 11.5h-4.25v8.75h-6.5V11.5H4.5Z";
  for (const dir of spec["arrow-big"] ?? []) {
    out.push(
      directional(
        `arrow-big-${dir}`,
        `Arrow Big ${titleCase(dir)}`,
        [p(BIG)],
        [p(BIG, { stroke: "currentColor", "stroke-width": "1.75", "stroke-linejoin": "round" })],
        dir,
        `Large block arrow pointing ${dir}; bold direction or upgrade cue.`,
        ["arrow", "big", "bold", "block"],
      ),
    );
  }

  // Move (double-headed).
  const MOVE = "M3.75 12h16.5M7.25 8.5 3.75 12l3.5 3.5M16.75 8.5l3.5 3.5-3.5 3.5";
  const MOVE_F = "M4 12h16M7.5 8.5 4 12l3.5 3.5M16.5 8.5 20 12l-3.5 3.5";
  const moveAngle: Record<string, number> = { horizontal: 0, vertical: 90, diagonal: -45 };
  for (const kind of spec.move ?? []) {
    const a = moveAngle[kind] ?? 0;
    out.push({
      name: `move-${kind}`,
      title: `Move ${titleCase(kind)}`,
      category: "arrows",
      description: `Double-headed ${kind} arrow: move, resize or stretch ${kind === "diagonal" ? "diagonally" : kind + "ly"}.`,
      tags: ["move", "resize", "stretch", "drag", kind],
      aliases: [],
      outline: [p(rot(MOVE, a))],
      filled: [heavy(rot(MOVE_F, a))],
    });
  }
  return out;
}

// ---------- containers ----------

interface ContainerGlyph {
  outline: string[];
  /** Shapes cut out of the solid container in the filled variant. */
  cut: string[];
  /** Solid shapes added back on top of the cut (e.g. a centre dot). */
  add?: string[];
  title: string;
  description: string;
  tags: string[];
}

const CONTAINER_GLYPHS: Record<string, ContainerGlyph> = {
  plus: { outline: [p("M12 8v8M8 12h8")], cut: [capsule(12, 8, 12, 16, 1.9), capsule(8, 12, 16, 12, 1.9)], title: "Plus", description: "add or create", tags: ["add", "plus", "new"] },
  minus: { outline: [p("M8 12h8")], cut: [capsule(8, 12, 16, 12, 1.9)], title: "Minus", description: "remove or collapse", tags: ["remove", "minus", "collapse"] },
  check: { outline: [p("M8 12.25l2.75 2.75L16 9.5")], cut: [thickPolyline([[8, 12.25], [10.75, 15], [16, 9.5]], 1.9)], title: "Check", description: "a completed or selected item", tags: ["check", "done", "selected"] },
  x: { outline: [p("M9 9l6 6M15 9l-6 6")], cut: [capsule(9, 9, 15, 15, 1.9), capsule(15, 9, 9, 15, 1.9)], title: "X", description: "close, remove or reject", tags: ["close", "remove", "cancel"] },
  dot: { outline: [`<circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/>`], cut: [circle(12, 12, 5)], add: [circle(12, 12, 2.75)], title: "Dot", description: "a selected option, record point or status", tags: ["dot", "radio", "record", "status"] },
  pause: { outline: [p("M10 8.75v6.5M14 8.75v6.5")], cut: [capsule(10, 8.75, 10, 15.25, 2), capsule(14, 8.75, 14, 15.25, 2)], title: "Pause", description: "pause playback", tags: ["pause", "media", "hold"] },
  play: { outline: [p("M10 8.75v6.5L15.25 12Z")], cut: [union("M9.25 8.25v7.5L15.75 12Z", capsule(9.75, 8.75, 9.75, 15.25, 1))], title: "Play", description: "start playback", tags: ["play", "start", "media"] },
  stop: { outline: [`<rect x="9" y="9" width="6" height="6" rx="1"/>`], cut: [roundRect(8.5, 8.5, 7, 7, 1.5)], title: "Stop", description: "stop playback or recording", tags: ["stop", "media", "end"] },
  divide: { outline: [p("M8 12h8"), dot(12, 8.5, 1.1), dot(12, 15.5, 1.1)], cut: [capsule(8, 12, 16, 12, 1.9), circle(12, 8.25, 1.35), circle(12, 15.75, 1.35)], title: "Divide", description: "division in calculations", tags: ["divide", "math", "calculator"] },
  equal: { outline: [p("M8 10h8M8 14h8")], cut: [capsule(8, 10, 16, 10, 1.9), capsule(8, 14, 16, 14, 1.9)], title: "Equal", description: "equals or result", tags: ["equal", "math", "result"] },
  percent: {
    outline: [p("M15.25 8.75l-6.5 6.5"), `<circle cx="9" cy="9" r="1.25"/>`, `<circle cx="15" cy="15" r="1.25"/>`],
    cut: [capsule(15.25, 8.75, 8.75, 15.25, 1.9), circle(9, 9, 2), circle(15, 15, 2)],
    add: [circle(9, 9, 0.75), circle(15, 15, 0.75)],
    title: "Percent",
    description: "a percentage, discount or rate",
    tags: ["percent", "discount", "rate"],
  },
  ellipsis: { outline: [dot(8, 12, 1.25), dot(12, 12, 1.25), dot(16, 12, 1.25)], cut: [circle(8, 12, 1.5), circle(12, 12, 1.5), circle(16, 12, 1.5)], title: "Ellipsis", description: "more options", tags: ["more", "options", "menu"] },
  asterisk: { outline: [p("M12 7.75v8.5M8.3 9.9l7.4 4.2M8.3 14.1l7.4-4.2")], cut: [capsule(12, 7.75, 12, 16.25, 1.8), capsule(8.3, 9.9, 15.7, 14.1, 1.8), capsule(8.3, 14.1, 15.7, 9.9, 1.8)], title: "Asterisk", description: "a required field or footnote", tags: ["asterisk", "required", "footnote"] },
  slash: { outline: [p("M15.5 8.5l-7 7")], cut: [capsule(15.5, 8.5, 8.5, 15.5, 1.9)], title: "Slash", description: "disabled, blocked or not allowed", tags: ["slash", "disabled", "blocked"] },
};

export function containerFamilies(spec: FamiliesSpec["containers"]): FamilyIcon[] {
  const out: FamilyIcon[] = [];
  const shapes = {
    circle: { outline: `<circle cx="12" cy="12" r="9"/>`, solid: circle(12, 12, 9.88) },
    square: { outline: `<rect x="3" y="3" width="18" height="18" rx="3"/>`, solid: roundRect(2.13, 2.13, 19.75, 19.75, 3.88) },
  } as const;
  for (const [shape, glyphs] of Object.entries(spec) as [keyof typeof shapes, string[]][]) {
    if (!shapes[shape]) continue;
    for (const g of glyphs) {
      const glyph = CONTAINER_GLYPHS[g];
      if (!glyph) continue;
      const cutShape = subtract(shapes[shape].solid, ...glyph.cut);
      const filled = glyph.add ? union(cutShape, ...glyph.add) : cutShape;
      out.push({
        name: `${shape}-${g}`,
        title: `${titleCase(shape)} ${glyph.title}`,
        category: "shapes",
        description: `${glyph.title} in a ${shape}: ${glyph.description}.`,
        tags: [...new Set([shape, ...glyph.tags, "button"])],
        aliases: [],
        outline: [shapes[shape].outline, ...glyph.outline],
        filled: [solid(filled)],
      });
    }
  }
  return out;
}

// ---------- writing ----------

export function writeFamilyIcon(icon: FamilyIcon, version = "0.2.0"): void {
  const dir = path.join(SOURCE, icon.name);
  fs.mkdirSync(dir, { recursive: true });
  for (const v of VARIANTS) {
    const root = Object.entries(ROOT_ATTRS[v])
      .map(([k, val]) => `${k}="${val}"`)
      .join(" ");
    const body = (v === "outline" ? icon.outline : icon.filled).map((l) => `  ${l}`).join("\n");
    fs.writeFileSync(path.join(dir, `${v}.svg`), `<svg ${root}>\n${body}\n</svg>\n`);
  }
  const meta: IconMeta = {
    name: icon.name,
    title: icon.title,
    category: icon.category,
    description: icon.description,
    tags: icon.tags,
    aliases: icon.aliases,
    variants: [...VARIANTS],
    added: version,
  };
  fs.writeFileSync(path.join(dir, "meta.json"), `${JSON.stringify(meta, null, 2)}\n`);
}

