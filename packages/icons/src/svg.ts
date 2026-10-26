import type { IconNode, IconVariant } from "./types.js";

export const DEFAULT_SIZE = 24;
export const DEFAULT_STROKE_WIDTH = 1.75;
export const DEFAULT_GRADIENT_ANGLE = 135;

/** A two-stop linear gradient painted across the whole icon. */
export interface IconGradient {
  /** Start colour (any CSS colour). */
  from: string;
  /** End colour (any CSS colour). */
  to: string;
  /** CSS-style angle in degrees: 0 = to top, 90 = to right. Default 135. */
  angle?: number;
}

export interface ToSvgOptions {
  /** Width and height in pixels. Default 24. */
  size?: number;
  /** Any CSS colour. Default `currentColor`. Ignored when `gradient` is set. */
  color?: string;
  /** Paint the icon with a linear gradient instead of a solid colour. */
  gradient?: IconGradient;
  /** Outline stroke width (ignored for filled icons). Default 1.75. */
  strokeWidth?: number;
  /** Accessible title. Without it the SVG is marked `aria-hidden`. */
  title?: string;
  /** Optional class attribute. */
  className?: string;
}

const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const FUNCTIONAL = /^(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\(\s*[-0-9.%\s,/a-z]+\)$/i;
const KEYWORD = /^[a-z]{3,20}$/i;

/** True when the value is a safe CSS colour token for an SVG attribute. */
export function isSafeColor(value: string): boolean {
  const v = value.trim();
  return v === "currentColor" || HEX.test(v) || FUNCTIONAL.test(v) || KEYWORD.test(v);
}

/** Return a colour safe to place in markup, falling back to currentColor. */
export function normalizeColor(value: string | undefined): string {
  if (!value) return "currentColor";
  return isSafeColor(value) ? value.trim() : "currentColor";
}

/** Validate a gradient; returns undefined when it is missing or unsafe. */
export function normalizeGradient(gradient: IconGradient | null | undefined): Required<IconGradient> | undefined {
  if (!gradient || !isSafeColor(gradient.from) || !isSafeColor(gradient.to)) return undefined;
  const angle = Number.isFinite(gradient.angle) ? ((Math.round(gradient.angle!) % 360) + 360) % 360 : DEFAULT_GRADIENT_ANGLE;
  return { from: gradient.from.trim(), to: gradient.to.trim(), angle };
}

/**
 * Gradient line endpoints in icon units (userSpaceOnUse), so one gradient
 * spans the whole 24 × 24 artboard rather than restarting on every shape.
 */
export function gradientCoords(angle: number): { x1: string; y1: string; x2: string; y2: string } {
  const rad = (angle * Math.PI) / 180;
  const dx = Math.sin(rad) * 12;
  const dy = -Math.cos(rad) * 12;
  const r = (n: number) => String(Math.round(n * 100) / 100);
  return { x1: r(12 - dx), y1: r(12 - dy), x2: r(12 + dx), y2: r(12 + dy) };
}

/**
 * Deterministic id for a gradient: identical gradients share an id (and an
 * identical definition), different ones never collide on the same page.
 */
export function gradientId(gradient: Required<IconGradient>): string {
  const input = `${gradient.from}|${gradient.to}|${gradient.angle}`;
  let hash = 5381;
  for (let i = 0; i < input.length; i++) hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0;
  return `ikions-gradient-${hash.toString(36)}`;
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const clampNumber = (value: number | undefined, fallback: number, min: number, max: number) => {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
};

/** Serialize icon nodes as a standalone SVG string. */
export function nodesToSvg(nodes: readonly IconNode[], variant: IconVariant, options: ToSvgOptions = {}): string {
  const size = clampNumber(options.size, DEFAULT_SIZE, 1, 4096);
  const gradient = normalizeGradient(options.gradient);
  const id = gradient ? gradientId(gradient) : "";
  const paint = gradient ? `url(#${id})` : normalizeColor(options.color);
  const strokeWidth = clampNumber(options.strokeWidth, DEFAULT_STROKE_WIDTH, 0.25, 4);
  const attrs: Record<string, string> = {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
  };
  if (variant === "outline") {
    Object.assign(attrs, {
      fill: "none",
      stroke: paint,
      "stroke-width": String(strokeWidth),
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    });
  } else {
    attrs.fill = paint;
  }
  if (options.className) attrs.class = options.className;
  if (options.title) attrs.role = "img";
  else attrs["aria-hidden"] = "true";

  const open = Object.entries(attrs)
    .map(([k, v]) => `${k}="${escapeXml(v)}"`)
    .join(" ");
  const title = options.title ? `<title>${escapeXml(options.title)}</title>` : "";
  let defs = "";
  if (gradient) {
    const c = gradientCoords(gradient.angle);
    defs =
      `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${c.x1}" y1="${c.y1}" x2="${c.x2}" y2="${c.y2}">` +
      `<stop offset="0" stop-color="${escapeXml(gradient.from)}"/><stop offset="1" stop-color="${escapeXml(gradient.to)}"/>` +
      `</linearGradient></defs>`;
  }
  const body = nodes
    .map(([tag, nodeAttrs]) => {
      const text = Object.entries(nodeAttrs)
        .map(([k, v]) => `${k}="${escapeXml(v === "currentColor" ? paint : v)}"`)
        .join(" ");
      return `<${tag} ${text}/>`;
    })
    .join("");
  return `<svg ${open}>${title}${defs}${body}</svg>`;
}
