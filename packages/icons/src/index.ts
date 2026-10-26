import { iconNodes, type IconName } from "./generated/nodes.js";
import { nodesToSvg, type ToSvgOptions } from "./svg.js";
import type { IconVariant } from "./types.js";

export { iconNames, iconNodes, type IconName } from "./generated/nodes.js";
export {
  DEFAULT_GRADIENT_ANGLE,
  DEFAULT_SIZE,
  DEFAULT_STROKE_WIDTH,
  escapeXml,
  gradientCoords,
  gradientId,
  isSafeColor,
  nodesToSvg,
  normalizeColor,
  normalizeGradient,
  type IconGradient,
  type ToSvgOptions,
} from "./svg.js";
export type { IconNode, IconVariant, IconVariants } from "./types.js";

/** True when `name` is a published Ikions icon. */
export function isIconName(name: string): name is IconName {
  return Object.prototype.hasOwnProperty.call(iconNodes, name);
}

/** Render a published icon as an SVG string. */
export function toSvg(name: IconName, variant: IconVariant = "outline", options: ToSvgOptions = {}): string {
  if (!isIconName(name)) throw new Error(`Unknown Ikions icon "${name}"`);
  return nodesToSvg(iconNodes[name][variant], variant, options);
}
