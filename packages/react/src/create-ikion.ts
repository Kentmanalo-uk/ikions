import { createElement, forwardRef, useId } from "react";
import { resolveGradient } from "./gradient.js";
import type { IkionComponent, IkionNode, IkionProps, IkionVariant } from "./types.js";

export const DEFAULT_SIZE = 24;
export const DEFAULT_STROKE_WIDTH = 1.75;

/**
 * Build an icon component from its outline and filled node data. Every
 * generated icon is a call to this factory, so icons share one runtime.
 */
export function createIkion(
  iconName: string,
  displayName: string,
  nodes: Readonly<Record<IkionVariant, readonly IkionNode[]>>,
): IkionComponent {
  const Icon = forwardRef<SVGSVGElement, IkionProps>(function Ikion(
    {
      size = DEFAULT_SIZE,
      color = "currentColor",
      gradient,
      variant = "outline",
      strokeWidth = DEFAULT_STROKE_WIDTH,
      title,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const titleId = useId();
    const resolved: IkionVariant = variant === "filled" ? "filled" : "outline";
    const g = resolveGradient(gradient);
    const ink = g ? `url(#${g.id})` : "currentColor";
    const paint =
      resolved === "filled"
        ? { fill: ink }
        : {
            fill: "none",
            stroke: ink,
            strokeWidth,
            strokeLinecap: "round" as const,
            strokeLinejoin: "round" as const,
          };
    const labelled = Boolean(title) || rest["aria-label"] !== undefined || rest["aria-labelledby"] !== undefined;
    const a11y = labelled
      ? { role: "img", ...(title ? { "aria-labelledby": titleId } : {}) }
      : { "aria-hidden": true };

    return createElement(
      "svg",
      {
        ref,
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        color,
        ...paint,
        className: ["ikion", `ikion-${iconName}`, className].filter(Boolean).join(" "),
        "data-variant": resolved,
        ...a11y,
        ...rest,
      },
      title ? createElement("title", { id: titleId }, title) : null,
      g
        ? createElement(
            "defs",
            null,
            createElement(
              "linearGradient",
              { id: g.id, gradientUnits: "userSpaceOnUse", x1: g.x1, y1: g.y1, x2: g.x2, y2: g.y2 },
              createElement("stop", { offset: "0", stopColor: g.from }),
              createElement("stop", { offset: "1", stopColor: g.to }),
            ),
          )
        : null,
      ...nodes[resolved].map(([tag, attrs], index) =>
        createElement(tag, {
          key: index,
          ...(g ? Object.fromEntries(Object.entries(attrs).map(([k, v]) => [k, v === "currentColor" ? ink : v])) : attrs),
        }),
      ),
      children,
    );
  });
  Icon.displayName = displayName;
  return Icon;
}
