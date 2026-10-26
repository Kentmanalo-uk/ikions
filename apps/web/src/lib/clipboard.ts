"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback for browsers without the async clipboard API.
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  if (!ok) throw new Error("Copy failed");
}

export type CopyState = "idle" | "copied" | "error";

/** Copy with transient success/error feedback. */
export function useCopy(resetAfter = 1600) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = useCallback(
    async (text: string) => {
      clearTimeout(timer.current);
      try {
        await copyText(text);
        setState("copied");
      } catch {
        setState("error");
      }
      timer.current = setTimeout(() => setState("idle"), resetAfter);
    },
    [resetAfter],
  );
  return { state, copy };
}
