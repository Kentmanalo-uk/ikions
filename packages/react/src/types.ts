import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from "react";
import type { IkionGradient } from "./gradient.js";

export type { IkionGradient } from "./gradient.js";

export type IkionVariant = "outline" | "filled";

/** A flat SVG child element: [tagName, attributes]. */
export type IkionNode = readonly [tag: string, attrs: Readonly<Record<string, string>>];

export interface IkionProps extends Omit<SVGProps<SVGSVGElement>, "ref" | "color"> {
  /** Width and height. Default `24`. */
  size?: number | string;
  /** Icon colour. Default `currentColor` (inherits the text colour). Ignored when `gradient` is set. */
  color?: string;
  /** Paint the icon with a linear gradient, e.g. `{ from: "#7C6CFF", to: "#FF8AC2", angle: 135 }`. */
  gradient?: IkionGradient;
  /** `outline` (default) or `filled`. */
  variant?: IkionVariant;
  /** Outline stroke width. Default `1.75`. Ignored by filled icons. */
  strokeWidth?: number | string;
  /** Accessible name. Without `title` or `aria-label` the icon is decorative (`aria-hidden`). */
  title?: string;
}

export type IkionComponent = ForwardRefExoticComponent<IkionProps & RefAttributes<SVGSVGElement>>;
