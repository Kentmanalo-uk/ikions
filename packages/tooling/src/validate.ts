import type { INode } from "svgson";
import type { LoadedCatalog } from "./catalog.ts";
import { parsePathData } from "./path-data.ts";
import { ALIAS_PATTERN, NAME_PATTERN, ROOT_ATTRS, VARIANTS, VERSION_PATTERN, type IconMeta, type Variant } from "./schema.ts";
import { parseSvg } from "./svg.ts";

export interface ValidationIssue {
  icon: string;
  variant?: Variant;
  severity: "error" | "warning";
  message: string;
}

const PAINT_ATTRS = ["fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "fill-rule", "clip-rule"];

const ELEMENT_ATTRS: Record<string, string[]> = {
  path: ["d"],
  circle: ["cx", "cy", "r"],
  ellipse: ["cx", "cy", "rx", "ry"],
  rect: ["x", "y", "width", "height", "rx", "ry"],
  line: ["x1", "y1", "x2", "y2"],
  polyline: ["points"],
  polygon: ["points"],
};

const PAINT_VALUES = new Set(["currentColor", "none"]);
const NUMBER = /^-?(?:\d+\.?\d*|\.\d+)$/;
const MAX_DECIMALS = 3;
const SIZE_WARNING = 2500;
const SIZE_ERROR = 5000;

/** Validate a single SVG source string for the given variant. */
export function validateSvg(source: string, variant: Variant): string[] {
  const errors: string[] = [];
  let parsed;
  try {
    parsed = parseSvg(source);
  } catch (error) {
    return [`invalid XML: ${(error as Error).message}`];
  }
  const { root, children } = parsed;
  // svgson is lenient; strict XML parsers (SVGO, browsers' XML mode) are not.
  if (/="[^"]*"(?=[^\s/>])/.test(source)) errors.push("invalid XML: missing whitespace between attributes");

  if (root.name !== "svg") return ["root element must be <svg>"];
  const expected = ROOT_ATTRS[variant];
  for (const [key, value] of Object.entries(expected)) {
    if (root.attributes[key] !== value) {
      errors.push(`root attribute ${key} must be "${value}" (found ${JSON.stringify(root.attributes[key] ?? null)})`);
    }
  }
  for (const key of Object.keys(root.attributes)) {
    if (!(key in expected)) errors.push(`unexpected root attribute "${key}"`);
  }
  if (children.length === 0) errors.push("svg has no drawing elements");

  for (const child of children) {
    errors.push(...validateElement(child, variant));
  }

  const bytes = Buffer.byteLength(source, "utf8");
  if (bytes > SIZE_ERROR) errors.push(`file is ${bytes} bytes (limit ${SIZE_ERROR})`);
  return errors;
}

function validateElement(node: INode, variant: Variant): string[] {
  const errors: string[] = [];
  if (node.type !== "element") {
    return [`unexpected ${node.type} node${node.value ? ` "${node.value.trim().slice(0, 20)}"` : ""}`];
  }
  const tag = node.name;
  const allowed = ELEMENT_ATTRS[tag];
  if (!allowed) return [`element <${tag}> is not allowed`];
  if (node.children.length > 0) errors.push(`<${tag}> must not have children`);

  for (const [key, value] of Object.entries(node.attributes)) {
    if (/^on/i.test(key)) {
      errors.push(`event handler attribute "${key}" is not allowed`);
      continue;
    }
    if (!allowed.includes(key) && !PAINT_ATTRS.includes(key)) {
      errors.push(`attribute "${key}" is not allowed on <${tag}>`);
      continue;
    }
    if ((key === "fill" || key === "stroke") && !PAINT_VALUES.has(value)) {
      errors.push(`hardcoded colour ${key}="${value}" (use currentColor or none)`);
    }
    if ((key === "fill-rule" || key === "clip-rule") && value !== "evenodd" && value !== "nonzero") {
      errors.push(`invalid ${key} "${value}"`);
    }
    if ((key === "stroke-linecap" || key === "stroke-linejoin") && value !== "round") {
      errors.push(`${key} must be round`);
    }
    if (key === "stroke-width") {
      if (variant === "outline") errors.push("outline children must not override stroke-width");
      else if (!NUMBER.test(value) || Number(value) < 1 || Number(value) > 3) errors.push(`invalid stroke-width "${value}"`);
    }
  }

  const numeric = (key: string) => {
    const raw = node.attributes[key];
    if (raw === undefined) return undefined;
    if (!NUMBER.test(raw)) {
      errors.push(`attribute ${key}="${raw}" is not a plain number`);
      return undefined;
    }
    const decimals = raw.split(".")[1]?.length ?? 0;
    if (decimals > MAX_DECIMALS) errors.push(`attribute ${key}="${raw}" has more than ${MAX_DECIMALS} decimals`);
    return Number(raw);
  };
  const inBounds = (x: number, y: number) => x >= 0 && x <= 24 && y >= 0 && y <= 24;
  const requireAttrs = (...keys: string[]) => {
    for (const k of keys) if (node.attributes[k] === undefined) errors.push(`<${tag}> is missing ${k}`);
  };

  switch (tag) {
    case "path": {
      requireAttrs("d");
      const d = node.attributes.d ?? "";
      const result = parsePathData(d);
      if (!result.ok) errors.push(`invalid path data: ${result.error}`);
      else if (result.points.some(([x, y]) => !inBounds(x, y))) errors.push("path extends outside the 24×24 artboard");
      const decimals = d.match(/\d*\.\d{4,}/);
      if (decimals) errors.push(`path data uses more than ${MAX_DECIMALS} decimals (${decimals[0]})`);
      break;
    }
    case "circle": {
      requireAttrs("cx", "cy", "r");
      const cx = numeric("cx"), cy = numeric("cy"), r = numeric("r");
      if (cx !== undefined && cy !== undefined && r !== undefined) {
        if (r <= 0) errors.push("circle radius must be positive");
        if (!inBounds(cx - r, cy - r) || !inBounds(cx + r, cy + r)) errors.push("circle extends outside the artboard");
      }
      break;
    }
    case "ellipse": {
      requireAttrs("cx", "cy", "rx", "ry");
      const cx = numeric("cx"), cy = numeric("cy"), rx = numeric("rx"), ry = numeric("ry");
      if (cx !== undefined && cy !== undefined && rx !== undefined && ry !== undefined) {
        if (!inBounds(cx - rx, cy - ry) || !inBounds(cx + rx, cy + ry)) errors.push("ellipse extends outside the artboard");
      }
      break;
    }
    case "rect": {
      requireAttrs("x", "y", "width", "height");
      const x = numeric("x"), y = numeric("y"), w = numeric("width"), h = numeric("height");
      numeric("rx");
      numeric("ry");
      if (x !== undefined && y !== undefined && w !== undefined && h !== undefined) {
        if (w <= 0 || h <= 0) errors.push("rect must have positive size");
        if (!inBounds(x, y) || !inBounds(x + w, y + h)) errors.push("rect extends outside the artboard");
      }
      break;
    }
    case "line": {
      requireAttrs("x1", "y1", "x2", "y2");
      const x1 = numeric("x1"), y1 = numeric("y1"), x2 = numeric("x2"), y2 = numeric("y2");
      if (x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined) {
        if (!inBounds(x1, y1) || !inBounds(x2, y2)) errors.push("line extends outside the artboard");
      }
      break;
    }
    case "polyline":
    case "polygon": {
      requireAttrs("points");
      const nums = (node.attributes.points ?? "").trim().split(/[\s,]+/).map(Number);
      if (nums.length < 4 || nums.length % 2 !== 0 || nums.some((n) => !Number.isFinite(n))) {
        errors.push("invalid points list");
      } else {
        for (let i = 0; i < nums.length; i += 2) {
          if (!inBounds(nums[i]!, nums[i + 1]!)) errors.push(`<${tag}> extends outside the artboard`);
        }
      }
      break;
    }
  }
  return errors;
}

export function validateMeta(meta: IconMeta, categorySlugs: Set<string>): string[] {
  const errors: string[] = [];
  const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((s) => typeof s === "string");

  if (typeof meta.name !== "string" || !NAME_PATTERN.test(meta.name)) errors.push(`invalid name "${meta.name}"`);
  if (typeof meta.title !== "string" || meta.title.trim().length === 0) errors.push("title is required");
  if (typeof meta.description !== "string" || meta.description.length < 12 || meta.description.length > 160) {
    errors.push("description must be 12–160 characters");
  } else if (!/[.]$/.test(meta.description)) {
    errors.push("description must be a sentence ending with a period");
  }
  if (!categorySlugs.has(meta.category)) errors.push(`unknown category "${meta.category}"`);
  if (!isStringArray(meta.tags) || meta.tags.length < 2) errors.push("at least two tags are required");
  else {
    for (const tag of meta.tags) if (tag !== tag.toLowerCase() || tag.trim() !== tag || !tag) errors.push(`tag "${tag}" must be lowercase and trimmed`);
    if (new Set(meta.tags).size !== meta.tags.length) errors.push("duplicate tags");
  }
  if (!isStringArray(meta.aliases)) errors.push("aliases must be an array of strings");
  else for (const alias of meta.aliases) if (!ALIAS_PATTERN.test(alias)) errors.push(`alias "${alias}" must be kebab-case`);
  if (!isStringArray(meta.variants) || [...meta.variants].sort().join() !== [...VARIANTS].sort().join()) {
    errors.push(`variants must list exactly: ${VARIANTS.join(", ")}`);
  }
  if (typeof meta.added !== "string" || !VERSION_PATTERN.test(meta.added)) errors.push("added must be a semver version");

  const allowedKeys = new Set(["name", "title", "category", "description", "tags", "aliases", "variants", "added"]);
  for (const key of Object.keys(meta)) if (!allowedKeys.has(key)) errors.push(`unexpected meta key "${key}"`);
  return errors;
}

export function validateCatalog(catalog: LoadedCatalog): ValidationIssue[] {
  const issues: ValidationIssue[] = catalog.issues.map((i) => ({ icon: i.icon, severity: "error", message: i.message }));
  const categorySlugs = new Set(catalog.categories.map((c) => c.slug));
  const claimed = new Map<string, string>();

  for (const category of catalog.categories) {
    if (!ALIAS_PATTERN.test(category.slug)) issues.push({ icon: `category:${category.slug}`, severity: "error", message: "invalid slug" });
  }

  for (const icon of catalog.icons) {
    const name = icon.meta.name;
    for (const message of validateMeta(icon.meta, categorySlugs)) issues.push({ icon: name, severity: "error", message });

    for (const term of [name, ...(icon.meta.aliases ?? [])]) {
      const owner = claimed.get(term);
      if (owner && owner !== name) issues.push({ icon: name, severity: "error", message: `name/alias "${term}" is already used by "${owner}"` });
      claimed.set(term, name);
    }

    for (const variant of VARIANTS) {
      for (const message of validateSvg(icon.svg[variant], variant)) issues.push({ icon: name, variant, severity: "error", message });
      const bytes = Buffer.byteLength(icon.svg[variant], "utf8");
      if (bytes > SIZE_WARNING && bytes <= SIZE_ERROR) {
        issues.push({ icon: name, variant, severity: "warning", message: `file is ${bytes} bytes; consider simplifying` });
      }
    }
    if (icon.svg.outline.replace(/\s+/g, "") === icon.svg.filled.replace(/\s+/g, "")) {
      issues.push({ icon: name, severity: "error", message: "outline and filled variants are identical" });
    }
  }

  const iconNames = new Set(catalog.icons.map((i) => i.meta.name));
  for (const collection of catalog.collections) {
    if (!ALIAS_PATTERN.test(collection.slug)) issues.push({ icon: `collection:${collection.slug}`, severity: "error", message: "invalid slug" });
    for (const name of collection.icons) {
      if (!iconNames.has(name)) issues.push({ icon: `collection:${collection.slug}`, severity: "error", message: `references unknown icon "${name}"` });
    }
  }
  return issues;
}
