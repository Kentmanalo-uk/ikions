"use client";

import { useId, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import type { FrameworkLogo } from "@/lib/framework-logos";
import { CopyButton } from "../ui/copy-button";

export interface FrameworkTab {
  id: string;
  label: string;
  pkg: string;
  install: string;
  /** Official framework logo shown in the tab. */
  logo?: FrameworkLogo;
  /** Pre-rendered (server) code block for this framework. */
  code: ReactNode;
}

/**
 * Framework switcher for the developer section: the tab list on the left
 * picks which install command and usage example are shown on the right.
 */
export function FrameworkTabs({ tabs, intro }: { tabs: FrameworkTab[]; intro: ReactNode }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const base = useId();
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  if (!current) return null;

  const onKeyDown = (event: KeyboardEvent) => {
    const index = tabs.findIndex((t) => t.id === active);
    const delta = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = tabs[(index + delta + tabs.length) % tabs.length]!;
    setActive(next.id);
    document.getElementById(`${base}-tab-${next.id}`)?.focus();
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
      <div>
        {intro}
        <div role="tablist" aria-label="Framework" onKeyDown={onKeyDown} className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
          {tabs.map((tab) => {
            const selected = tab.id === active;
            return (
              <button
                key={tab.id}
                id={`${base}-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${base}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(tab.id)}
                className={`group flex items-center justify-between gap-3 rounded-[18px] border px-4 py-3 text-left transition-colors ${
                  selected ? "border-accent bg-selected" : "border-transparent bg-surface shadow-card hover:bg-subtle"
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  {tab.logo ? (
                    <svg
                      viewBox="0 0 24 24"
                      width="26"
                      height="26"
                      aria-hidden="true"
                      className="ik-brand-logo shrink-0"
                      style={{ "--logo-light": tab.logo.light, "--logo-dark": tab.logo.dark } as CSSProperties}
                    >
                      <path d={tab.logo.path} />
                    </svg>
                  ) : null}
                  <span className="min-w-0">
                  <span className={`block text-[14.5px] font-medium ${selected ? "text-accent-text" : "text-ink"}`}>{tab.label}</span>
                  <span className="block truncate font-mono text-[12px] text-ink-2">{tab.pkg}</span>
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`hidden h-2 w-2 shrink-0 rounded-full transition-colors lg:block ${selected ? "bg-accent" : "bg-line-strong group-hover:bg-ink-2"}`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div id={`${base}-panel`} role="tabpanel" aria-labelledby={`${base}-tab-${current.id}`} className="min-w-0 space-y-3">
        <div className="flex items-center gap-3 overflow-hidden rounded-full bg-[#121316] py-2.5 pl-5 pr-2.5 text-[#f5f5f2]">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b6b]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffc24b]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#4cc38a]/80" />
          </span>
          <code className="min-w-0 flex-1 truncate font-mono text-[13.5px]">
            <span className="text-white/45">$ </span>
            {current.install}
          </code>
          <CopyButton
            text={current.install}
            label="Copy install command"
            compact
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
          />
        </div>
        <div key={current.id} className="ik-rise">
          {current.code}
        </div>
      </div>
    </div>
  );
}
