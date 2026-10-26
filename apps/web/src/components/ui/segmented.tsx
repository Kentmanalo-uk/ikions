"use client";

import { useId, type KeyboardEvent } from "react";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/** An accessible single-choice control (radio group semantics). */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  size = "md",
  className,
}: {
  label: string;
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  const id = useId();
  const enabled = options.filter((o) => !o.disabled);
  const onKeyDown = (event: KeyboardEvent) => {
    const index = enabled.findIndex((o) => o.value === value);
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % enabled.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + enabled.length) % enabled.length;
    else return;
    event.preventDefault();
    const option = enabled[next];
    if (option) {
      onChange(option.value);
      document.getElementById(`${id}-${option.value}`)?.focus();
    }
  };
  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={`inline-flex rounded-full bg-subtle p-0.5 ${className ?? ""}`}
    >
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            id={`${id}-${option.value}`}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={`${size === "sm" ? "h-9 px-3 text-[12.5px] sm:h-7 sm:px-2.5" : "h-9 px-3.5 text-[13px] sm:h-8"} rounded-full font-medium transition-colors disabled:opacity-40 ${
              checked ? "bg-surface text-ink shadow-[0_1px_2px_rgb(0_0_0/0.08)]" : "text-ink-2 hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
