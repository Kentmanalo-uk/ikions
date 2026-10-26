"use client";

import { useCopy } from "@/lib/clipboard";
import { CheckIcon, CopyIcon } from "@ikions/react";

/** Copies text and announces the result to screen readers. */
export function CopyButton({
  text,
  label,
  className,
  compact = false,
  tabIndex,
}: {
  text: string | (() => string);
  label: string;
  className?: string;
  compact?: boolean;
  tabIndex?: number;
}) {
  const { state, copy } = useCopy();
  const status = state === "copied" ? "Copied" : state === "error" ? "Copy failed" : label;
  return (
    <button
      type="button"
      tabIndex={tabIndex}
      onClick={() => copy(typeof text === "function" ? text() : text)}
      className={className}
      aria-label={compact ? status : undefined}
      title={compact ? label : undefined}
    >
      {state === "copied" ? <CheckIcon size={16} className="text-success ik-swap" /> : <CopyIcon size={16} />}
      {compact ? null : <span>{status}</span>}
      <span className="sr-only" aria-live="polite">
        {state === "copied" ? `${label}: copied` : state === "error" ? `${label}: copy failed` : ""}
      </span>
    </button>
  );
}
