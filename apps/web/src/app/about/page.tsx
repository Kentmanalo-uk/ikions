import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/layout/logo";
import { buttonClass } from "@/components/ui/button";
import { IkIcon } from "@/components/ui/ik-icon";
import { PageHeader } from "@/components/ui/page-header";
import { categories, stats } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "About",
  description: "Why Ikions exists, how the icons are designed and where the library is going.",
  alternates: { canonical: "/about" },
};

const principles = [
  {
    icon: "pen-tool",
    title: "Drawn, not collected",
    text: "Every icon is original, drawn on one grid with one set of rules.",
  },
  {
    icon: "heart",
    title: "Free to use",
    text: "Use the icons in personal and commercial projects. No credit needed.",
  },
  {
    icon: "check",
    title: "Checked by machines and people",
    text: "Every icon passes automated checks and is reviewed by eye at small sizes.",
  },
  {
    icon: "code",
    title: "One source, every format",
    text: "SVG files and React, Vue and Svelte components all come from the same source.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[960px] px-4 pt-10 sm:px-6">
      <PageHeader title="Every interface deserves a better icon.">
        Original icons, drawn with care and free to use.
      </PageHeader>

      <ul className="mt-12 grid gap-3 sm:grid-cols-2">
        {principles.map((p) => (
          <li key={p.title} className="rounded-[22px] bg-surface p-6 shadow-card">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-selected text-accent-text">
              <IkIcon name={p.icon} size={22} />
            </span>
            <h2 className="mt-4 font-display text-[16px] font-semibold">{p.title}</h2>
            <p className="mt-1.5 text-[14px] leading-6 text-ink-2">{p.text}</p>
          </li>
        ))}
      </ul>

      <section className="mt-14 grid gap-8 md:grid-cols-[1fr_1.4fr]" aria-labelledby="mark-heading">
        <div className="ik-cta relative grid aspect-square max-w-[280px] place-items-center overflow-hidden rounded-[28px] bg-surface shadow-card">
          <LogoMark size={176} />
        </div>
        <div>
          <h2 id="mark-heading" className="font-display text-[22px] font-semibold tracking-[-0.02em]">
            The mark
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-ink-2">
            The Ikions mark is a “drift i”: a leaf-cut stem in an indigo-to-violet gradient, with a warm dot that has drifted up and to the
            right. Precise, with one playful detail.
          </p>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="status-heading">
        <h2 id="status-heading" className="font-display text-[22px] font-semibold tracking-[-0.02em]">
          Where the library is today
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-ink-2">
          Ikions has <strong className="text-ink">{stats.icons.toLocaleString("en")} icons</strong> across {categories.length} categories,
          and it keeps growing.
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link href="/changelog" className={buttonClass.secondary}>
            Read the changelog
          </Link>
          <Link href="/icons" className={buttonClass.primary}>
            Explore the icons
          </Link>
        </div>
      </section>
    </div>
  );
}
