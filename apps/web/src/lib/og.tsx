import type { IconNode, IconVariant } from "@ikions/icons";
import { createElement } from "react";
import { BRAND_MARK, BRAND_WORDMARK } from "./brand";

/** The outlined "ikions" wordmark for Open Graph images. */
export function OgWordmark({ height, color }: { height: number; color: string }) {
  const [, , w, h] = BRAND_WORDMARK.viewBox.split(" ").map(Number);
  return (
    <svg width={(height * w!) / h!} height={height} viewBox={BRAND_WORDMARK.viewBox}>
      <defs>
        <linearGradient id="og-wordmark-dot" x1="0" y1="0" x2="1" y2="1">
          {BRAND_MARK.dotStops.map(([offset, c]) => (
            <stop key={offset} offset={offset} stopColor={c} />
          ))}
        </linearGradient>
      </defs>
      <path d={BRAND_WORDMARK.letters} fill={color} />
      {BRAND_WORDMARK.dots.map((dot) => (
        <circle key={dot.cx} cx={dot.cx} cy={dot.cy} r={dot.r} fill="url(#og-wordmark-dot)" />
      ))}
    </svg>
  );
}

const camel = (key: string) => key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

/** An icon as plain SVG elements that Satori (next/og) can render. */
export function OgIcon({ nodes, variant, size, color }: { nodes: readonly IconNode[]; variant: IconVariant; size: number; color: string }) {
  const paint =
    variant === "outline"
      ? { fill: "none", stroke: color, strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
      : { fill: color };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...paint}>
      {nodes.map(([tag, attrs], i) =>
        createElement(tag, {
          key: i,
          ...Object.fromEntries(Object.entries(attrs).map(([k, v]) => [camel(k), v === "currentColor" ? color : v])),
        }),
      )}
    </svg>
  );
}

export const OG_SIZE = { width: 1200, height: 630 };

/** The gradient brand mark for Open Graph images (single use per image, fixed ids). */
export function OgLogo({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox={BRAND_MARK.viewBox}>
      <defs>
        <linearGradient id="og-stem" x1="6" y1="11" x2="20" y2="30" gradientUnits="userSpaceOnUse">
          {BRAND_MARK.stemStops.map(([offset, color]) => (
            <stop key={offset} offset={offset} stopColor={color} />
          ))}
        </linearGradient>
        <linearGradient id="og-dot" x1="17" y1="2" x2="26" y2="12" gradientUnits="userSpaceOnUse">
          {BRAND_MARK.dotStops.map(([offset, color]) => (
            <stop key={offset} offset={offset} stopColor={color} />
          ))}
        </linearGradient>
      </defs>
      <path d={BRAND_MARK.stem} fill="url(#og-stem)" />
      <circle cx={BRAND_MARK.dot.cx} cy={BRAND_MARK.dot.cy} r={BRAND_MARK.dot.r} fill="url(#og-dot)" />
    </svg>
  );
}
