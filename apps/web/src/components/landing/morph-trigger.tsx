"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Decides when a MorphText animation plays.
 * - `load`: rendered with data-play, so the CSS animation runs at first paint.
 * - `view`: plays when at least 20% of the heading is visible, including
 *   headings already on screen at load. Its letters start hidden only when the
 *   document has data-js (set before paint), so the text stays readable without
 *   JavaScript; reduced motion shows the text immediately via CSS.
 */
export function MorphTrigger({ trigger, children }: { trigger: "load" | "view"; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (trigger !== "view" || !el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          el.dataset.play = "";
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [trigger]);

  return (
    <span ref={ref} aria-hidden="true" className="ik-morph" data-trigger={trigger} data-play={trigger === "load" ? "" : undefined}>
      {children}
    </span>
  );
}
