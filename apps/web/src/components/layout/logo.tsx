"use client";

import { useId } from "react";
import { BRAND_MARK as M, BRAND_WORDMARK as W } from "@/lib/brand";

/**
 * The Ikions mark: a "drift i". The stem is a leaf-cut capsule (two generous
 * opposite corners, two tight ones) in an indigo-violet gradient with a soft
 * gloss; the dot is a warm orb that has drifted up and to the right — precise
 * construction with one playful detail. No background tile: the shapes are
 * the mark. Gradient ids are unique per instance so several marks can share
 * a page.
 */
export function LogoMark({ size = 24, className, title }: { size?: number; className?: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox={M.viewBox}
      className={className}
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
    >
      <defs>
        <linearGradient id={`${id}-stem`} x1="6" y1="11" x2="20" y2="30" gradientUnits="userSpaceOnUse">
          {M.stemStops.map(([offset, color]) => (
            <stop key={offset} offset={offset} stopColor={color} />
          ))}
        </linearGradient>
        <linearGradient id={`${id}-dot`} x1="17" y1="2" x2="26" y2="12" gradientUnits="userSpaceOnUse">
          {M.dotStops.map(([offset, color]) => (
            <stop key={offset} offset={offset} stopColor={color} />
          ))}
        </linearGradient>
        <linearGradient id={`${id}-gloss`} x1="8" y1="12" x2="14" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={M.stem} fill={`url(#${id}-stem)`} />
      <path d={M.gloss} fill={`url(#${id}-gloss)`} />
      <circle {...M.dot} fill={`url(#${id}-dot)`} />
      <circle {...M.highlight} fill="#fff" fillOpacity="0.55" />
    </svg>
  );
}

/**
 * The "ikions" wordmark as outlines (Sora SemiBold, see BRAND_WORDMARK). Letters
 * follow the text colour; both i-dots are the brand's gradient orb.
 */
export function Wordmark({ height = 20, className }: { height?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const [, , w, h] = W.viewBox.split(" ").map(Number);
  return (
    <svg width={(height * w!) / h!} height={height} viewBox={W.viewBox} className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-dot`} x1="0" y1="0" x2="1" y2="1">
          {M.dotStops.map(([offset, color]) => (
            <stop key={offset} offset={offset} stopColor={color} />
          ))}
        </linearGradient>
      </defs>
      <path d={W.letters} fill="currentColor" />
      {W.dots.map((dot) => (
        <circle key={dot.cx} {...dot} fill={`url(#${id}-dot)`} />
      ))}
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-ink ${className ?? ""}`}>
      <LogoMark size={34} className="-my-1" />
      <Wordmark height={19} className="mt-0.5" />
      <span className="sr-only">Ikions</span>
    </span>
  );
}
