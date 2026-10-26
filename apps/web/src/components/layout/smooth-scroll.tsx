"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

/** Height of the sticky header, so in-page targets are not hidden under it. */
const HEADER_OFFSET = -80;

/**
 * Inertial smooth scrolling for mouse wheels and trackpads (Lenis).
 * - Touch keeps native scrolling, which is already smooth.
 * - Disabled automatically for prefers-reduced-motion.
 * - Scrollable panels (sidebars, inspector, code blocks) and dialogs keep
 *   their own native scrolling.
 * - Same-page hash links glide to their target and move keyboard focus there.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.11,
      wheelMultiplier: 0.95,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
      prevent: (node) => node.tagName === "DIALOG",
    });

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href*='#']");
      if (!(link instanceof HTMLAnchorElement)) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      history.pushState(null, "", url.hash);
      lenis.scrollTo(target, { offset: HEADER_OFFSET });
      if (!target.hasAttribute("tabindex") && !target.matches("a, button, input, select, textarea")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
