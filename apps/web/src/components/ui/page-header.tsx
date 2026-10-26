import type { ReactNode } from "react";
import { MorphText } from "../landing/morph-heading";

/**
 * Page title block shared by secondary pages. Mirrors the homepage: the title
 * assembles itself from icons on load and sits on a soft brand glow.
 */
export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <header className="relative isolate max-w-2xl">
      <div className="ik-page-glow" aria-hidden="true" />
      {eyebrow ? (
        <p className="inline-flex items-center gap-2 rounded-full bg-selected px-3 py-1 text-[12.5px] font-medium text-accent-text">{eyebrow}</p>
      ) : null}
      <MorphText
        as="h1"
        trigger="load"
        lines={[title]}
        className="mt-3 font-display text-[36px] font-semibold leading-[1.08] tracking-[-0.04em] text-balance sm:text-[46px]"
      />
      {children ? <div className="mt-4 text-[16.5px] leading-7 text-ink-2">{children}</div> : null}
    </header>
  );
}
