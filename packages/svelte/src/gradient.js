/**
 * Gradient helpers, identical to @ikions/icons and the other framework
 * packages so every package renders the same gradient.
 * @typedef {{ from: string; to: string; angle?: number }} IkionGradient
 */
const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const FUNCTIONAL = /^(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\(\s*[-0-9.%\s,/a-z]+\)$/i;
const KEYWORD = /^[a-z]{3,20}$/i;
const safe = (v) => {
  const t = v.trim();
  return t === "currentColor" || HEX.test(t) || FUNCTIONAL.test(t) || KEYWORD.test(t);
};

/** @param {IkionGradient | null | undefined} gradient */
export function resolveGradient(gradient) {
  if (!gradient || typeof gradient.from !== "string" || typeof gradient.to !== "string") return undefined;
  if (!safe(gradient.from) || !safe(gradient.to)) return undefined;
  const from = gradient.from.trim();
  const to = gradient.to.trim();
  const angle = Number.isFinite(gradient.angle) ? ((Math.round(gradient.angle) % 360) + 360) % 360 : 135;
  const input = `${from}|${to}|${angle}`;
  let hash = 5381;
  for (let i = 0; i < input.length; i++) hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0;
  const rad = (angle * Math.PI) / 180;
  const dx = Math.sin(rad) * 12;
  const dy = -Math.cos(rad) * 12;
  const r = (n) => String(Math.round(n * 100) / 100);
  return { id: `ikions-gradient-${hash.toString(36)}`, from, to, x1: r(12 - dx), y1: r(12 - dy), x2: r(12 + dx), y2: r(12 + dy) };
}
