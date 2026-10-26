"use client";

import type { IconVariants } from "@ikions/icons";
import { useId, useState, type CSSProperties, type KeyboardEvent } from "react";
import { FRAMEWORK_LOGOS } from "@/lib/framework-logos";
import { getSnippet, SNIPPET_TABS, type IconOptions, type SnippetKind } from "@/lib/snippets";
import { CodeBlock } from "../ui/code-block";

interface Props {
  icon: { name: string; title: string; component: string };
  nodes: IconVariants;
  options: IconOptions;
}

/** Tabbed integration snippets; every snippet reflects the current options. */
export function CodeTabs({ icon, nodes, options }: Props) {
  const [active, setActive] = useState<SnippetKind>("svg");
  const id = useId();
  const current = SNIPPET_TABS.find((t) => t.kind === active) ?? SNIPPET_TABS[0]!;
  const code = getSnippet(active, icon, nodes[options.variant], options);

  const onKeyDown = (event: KeyboardEvent) => {
    const index = SNIPPET_TABS.findIndex((t) => t.kind === active);
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % SNIPPET_TABS.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + SNIPPET_TABS.length) % SNIPPET_TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = SNIPPET_TABS.length - 1;
    else return;
    event.preventDefault();
    const tab = SNIPPET_TABS[next]!;
    setActive(tab.kind);
    document.getElementById(`${id}-tab-${tab.kind}`)?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Code snippets" onKeyDown={onKeyDown} className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-subtle p-1">
        {SNIPPET_TABS.map((tab) => {
          const selected = tab.kind === active;
          return (
            <button
              key={tab.kind}
              id={`${id}-tab-${tab.kind}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.kind)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                selected ? "bg-surface text-ink shadow-[0_1px_2px_rgb(0_0_0/0.08)]" : "text-ink-2 hover:text-ink"
              }`}
            >
              {FRAMEWORK_LOGOS[tab.label] ? (
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  aria-hidden="true"
                  className="ik-brand-logo shrink-0"
                  style={{ "--logo-light": FRAMEWORK_LOGOS[tab.label]!.light, "--logo-dark": FRAMEWORK_LOGOS[tab.label]!.dark } as CSSProperties}
                >
                  <path d={FRAMEWORK_LOGOS[tab.label]!.path} />
                </svg>
              ) : null}
              {tab.label}
            </button>
          );
        })}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active}`} className="pt-4">
        <CodeBlock code={code} lang={current.lang} />
      </div>
    </div>
  );
}
