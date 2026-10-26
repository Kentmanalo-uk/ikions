import type { SVGAttributes } from "svelte/elements";

export type IkionVariant = "outline" | "filled";

export interface IkionGradient {
  /** Start colour (any CSS colour). */
  from: string;
  /** End colour (any CSS colour). */
  to: string;
  /** CSS-style angle in degrees: 0 = to top, 90 = to right. Default 135. */
  angle?: number;
}

export interface IkionProps extends Omit<SVGAttributes<SVGSVGElement>, "color"> {
  /** Width and height. Default `24`. */
  size?: number | string;
  /** Icon colour. Default `currentColor`. Ignored when `gradient` is set. */
  color?: string;
  /** Paint the icon with a linear gradient, e.g. `{ from: "#7C6CFF", to: "#FF8AC2", angle: 135 }`. */
  gradient?: IkionGradient;
  /** `outline` (default) or `filled`. */
  variant?: IkionVariant;
  /** Outline stroke width. Default `1.75`. Ignored by filled icons. */
  strokeWidth?: number | string;
  /** Accessible name. Without `title` or `aria-label` the icon is decorative. */
  title?: string;
}
