/** Shared class recipes so buttons look and behave the same everywhere. */
const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[14px] font-medium transition-colors select-none disabled:opacity-50 disabled:pointer-events-none active:translate-y-px";

export const buttonClass = {
  primary: `${base} h-10 px-4 bg-accent text-accent-contrast hover:bg-accent-hover`,
  secondary: `${base} h-10 px-4 border border-line bg-surface text-ink hover:bg-subtle hover:border-line-strong`,
  ghost: `${base} h-9 px-3 text-ink-2 hover:text-ink hover:bg-subtle`,
  icon: `${base} h-9 w-9 text-ink-2 hover:text-ink hover:bg-subtle`,
  small: `${base} h-8 px-2.5 text-[13px] border border-line bg-surface text-ink hover:bg-subtle`,
} as const;
