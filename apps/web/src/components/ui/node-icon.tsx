import { gradientCoords, gradientId, normalizeGradient, type IconGradient, type IconNode, type IconVariant, type IconVariants } from "@ikions/icons";
import { createElement, type SVGProps } from "react";

const camel = (key: string) => key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

export interface NodeIconProps extends Omit<SVGProps<SVGSVGElement>, "color"> {
  nodes: IconVariants;
  variant?: IconVariant;
  size?: number | string;
  color?: string;
  /** Paint with a linear gradient instead of `color`. */
  gradient?: IconGradient | null;
  strokeWidth?: number;
  title?: string;
}

/**
 * Renders an icon from node data. It has no catalog dependency, so client
 * components can pass in only the icons they need. Gradients use the same
 * deterministic ids and geometry as @ikions/icons and the framework packages.
 */
export function NodeIcon({ nodes, variant = "outline", size = 24, color, gradient, strokeWidth = 1.75, title, ...rest }: NodeIconProps) {
  const children: readonly IconNode[] = nodes[variant];
  const g = normalizeGradient(gradient);
  const id = g ? gradientId(g) : "";
  const ink = g ? `url(#${id})` : "currentColor";
  const paint =
    variant === "outline"
      ? { fill: "none", stroke: ink, strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
      : { fill: ink };
  const coords = g ? gradientCoords(g.angle) : null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      color={color}
      {...paint}
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {g && coords ? (
        <defs>
          <linearGradient id={id} gradientUnits="userSpaceOnUse" {...coords}>
            <stop offset="0" stopColor={g.from} />
            <stop offset="1" stopColor={g.to} />
          </linearGradient>
        </defs>
      ) : null}
      {children.map(([tag, attrs], index) =>
        createElement(tag, {
          key: index,
          ...Object.fromEntries(Object.entries(attrs).map(([k, v]) => [camel(k), g && v === "currentColor" ? ink : v])),
        }),
      )}
    </svg>
  );
}
