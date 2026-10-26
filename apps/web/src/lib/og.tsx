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

/** A share card: logo, title, subtitle and a row of the page's own icons. */
export function OgCard({ title, subtitle, icons }: { title: string; subtitle: string; icons: { nodes: { outline: readonly IconNode[]; filled: readonly IconNode[] } }[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#FAFAF8", padding: 72, color: "#18191B" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <OgLogo size={52} />
        <OgWordmark height={34} color="#18191B" />
      </div>
      <div style={{ display: "flex", fontSize: 72, fontWeight: 600, letterSpacing: -3, lineHeight: 1.05, marginTop: 60, maxWidth: 1000 }}>{title}</div>
      <div style={{ display: "flex", fontSize: 30, color: "#6A6C72", marginTop: 18 }}>{subtitle}</div>
      <div style={{ display: "flex", gap: 34, marginTop: "auto" }}>
        {icons.slice(0, 9).map((icon, i) => (
          <OgIcon key={i} nodes={icon.nodes[i % 2 ? "filled" : "outline"]} variant={i % 2 ? "filled" : "outline"} size={60} color={i % 3 === 1 ? "#5555E8" : "#18191B"} />
        ))}
      </div>
    </div>
  );
}
