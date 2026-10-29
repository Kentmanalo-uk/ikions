import type { ReactNode } from "react";
import { MorphText } from "../landing/morph-heading";
import { BrandName } from "../layout/logo";

const TITLE = "font-display text-[36px] font-semibold leading-[1.08] tracking-[-0.04em] text-balance sm:text-[46px]";

/**
 * Page title block shared by secondary pages. Mirrors the homepage: the title
 * assembles itself from icons on load and sits on a soft brand glow. `brand`
 * ends the title with the Ikions wordmark ("Built with" + wordmark).
 */
export function PageHeader({ title, brand, children }: { title: string; brand?: boolean; children?: ReactNode }) {
  return (
    <header className="relative isolate max-w-2xl">
      <div className="ik-page-glow" aria-hidden="true" />
      {brand ? (
        <h1 className={`flex flex-wrap items-baseline gap-x-[0.26em] ${TITLE}`}>
          <MorphText as="span" trigger="load" lines={[title]} className="inline-block" />
          <BrandName />
        </h1>
      ) : (
        <MorphText as="h1" trigger="load" lines={[title]} className={TITLE} />
      )}
      {children ? <div className="mt-4 text-[16.5px] leading-7 text-ink-2">{children}</div> : null}
    </header>
  );
}
