"use client";

import type { IconVariant, IconVariants } from "@ikions/icons";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NodeIcon } from "../ui/node-icon";
import { Segmented } from "../ui/segmented";

/** Icons shown on narrow screens (6 × 6), so the grid never ends short. */
const MOBILE_COUNT = 36;

export interface ShowcaseIcon {
  name: string;
  title: string;
  component: string;
  nodes: IconVariants;
}

/**
 * The hero's "product window": a grid of real icons with a live
 * Outline/Filled switch. While on screen, one icon at a time briefly flips to
 * its other variant; the caption and floating inspector follow the icon being
 * hovered, or the one pulsing. Pulsing pauses for reduced motion, hidden tabs
 * and when scrolled out of view.
 */
export function Showcase({ icons }: { icons: ShowcaseIcon[] }) {
  const [variant, setVariant] = useState<IconVariant>("outline");
  const [pulse, setPulse] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  // Stagger the swap animation only right after load or a variant switch.
  const [stagger, setStagger] = useState(true);
  const gridRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setStagger(true);
    const id = window.setTimeout(() => setStagger(false), 900);
    return () => window.clearTimeout(id);
  }, [variant]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !gridRef.current) return;
    let visible = false;
    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (!visible) setPulse(null);
    });
    observer.observe(gridRef.current);
    const id = window.setInterval(() => {
      if (!visible || document.hidden) return;
      const count = window.matchMedia("(min-width: 640px)").matches ? icons.length : Math.min(MOBILE_COUNT, icons.length);
      setPulse((previous) => {
        let next = Math.floor(Math.random() * count);
        if (next === previous) next = (next + 7) % count;
        return next;
      });
    }, 1600);
    return () => {
      observer.disconnect();
      window.clearInterval(id);
    };
  }, [icons.length]);

  const focusIndex = hovered ?? pulse ?? 0;
  const focus = icons[focusIndex] ?? icons[0]!;
  const focusVariant: IconVariant = hovered === null && pulse !== null ? (variant === "outline" ? "filled" : "outline") : variant;

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-[24px] bg-surface shadow-[0_1px_2px_rgb(24_25_27/0.04),0_24px_60px_-28px_rgb(60_50_200/0.35)]">
        {/* Window bar: live caption + variant switch */}
        <div className="flex items-center justify-between gap-3 px-4 pb-1 pt-3">
          <div className="flex min-w-0 items-center gap-2.5" aria-hidden="true">
            <span className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
              <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
              <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            </span>
            <span className="truncate font-mono text-[12px] text-ink-2">
              ikions / <span className="text-ink">{focus.name}</span>
            </span>
          </div>
          <Segmented
            label="Showcase variant"
            size="sm"
            value={variant}
            onChange={setVariant}
            options={[
              { value: "outline", label: "Outline" },
              { value: "filled", label: "Filled" },
            ]}
          />
        </div>
        <ul
          ref={gridRef}
          onMouseLeave={() => setHovered(null)}
          className="grid grid-cols-6 gap-1 p-2.5 sm:grid-cols-8"
        >
          {icons.map(({ name, nodes }, i) => {
            const pulsing = i === pulse && hovered === null;
            const shown: IconVariant = pulsing ? (variant === "outline" ? "filled" : "outline") : variant;
            return (
              <li key={name} className={i >= MOBILE_COUNT ? "max-sm:hidden" : undefined}>
                <Link
                  href={`/icons/${name}`}
                  onMouseEnter={() => setHovered(i)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  className={`group grid aspect-square place-items-center rounded-[14px] transition-colors duration-300 hover:bg-selected hover:text-accent-text ${
                    pulsing ? "bg-selected text-accent-text" : "text-ink"
                  }`}
                  title={name}
                >
                  <NodeIcon
                    nodes={nodes}
                    variant={shown}
                    size={24}
                    key={shown}
                    className="ik-swap transition-transform duration-200 group-hover:scale-125"
                    style={{ animationDelay: stagger && !pulsing ? `${(i % 8) * 18 + Math.floor(i / 8) * 18}ms` : "0ms" }}
                  />
                  <span className="sr-only">{name} icon</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Floating inspector: follows the hovered or pulsing icon. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[62px] -left-8 hidden items-center gap-3.5 rounded-[18px] bg-elevated/95 py-3 pl-3 pr-5 shadow-soft backdrop-blur lg:flex"
      >
        <span className="grid h-12 w-12 place-items-center rounded-[12px] bg-selected text-accent-text">
          <NodeIcon key={`${focus.name}-${focusVariant}`} nodes={focus.nodes} variant={focusVariant} size={26} className="ik-swap" />
        </span>
        <span>
          <span className="block text-[14px] font-semibold">{focus.title}</span>
          <span className="block font-mono text-[11.5px] text-ink-2">
            {"<"}
            <span className="text-accent-text">{focus.component}</span> variant=&quot;{focusVariant}&quot; {"/>"}
          </span>
        </span>
      </div>
    </div>
  );
}
