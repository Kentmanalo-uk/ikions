import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/layout/logo";
import { buttonClass } from "@/components/ui/button";
import { IkIcon } from "@/components/ui/ik-icon";
import { PageHeader } from "@/components/ui/page-header";
import { categories, plannedCategories, stats } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "About",
  description: "Why Ikions exists, how the icons are designed and where the library is going.",
  alternates: { canonical: "/about" },
};

const principles = [
  {
    icon: "pen-tool",
    title: "Drawn, not collected",
    text: "Every icon is original artwork drawn for Ikions on one grid with one set of rules. Nothing is traced or adapted from another library.",
  },
  {
    icon: "layers",
    title: "Two variants, one meaning",
    text: "Outline and Filled share a name, scale and meaning, but each is drawn on its own. Filled icons use real cutouts instead of filled outlines.",
  },
  {
    icon: "check",
    title: "Checked by machines and people",
    text: "Automated validation catches unsafe or broken SVG; every icon is also reviewed at 16 px in light and dark next to its neighbours.",
  },
  {
    icon: "code",
    title: "One source, every format",
    text: "SVG files, sprites and React, Vue and Svelte components are generated from a single source per variant, so they never drift apart.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[960px] px-4 pt-10 sm:px-6">
      <PageHeader eyebrow="About" title="Every interface deserves a better icon.">
        Ikions is an icon library built like design infrastructure: a precise visual language, a reproducible pipeline and packages
        that drop into any stack.
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
            The Ikions mark is a “drift i”. Its stem is a leaf-cut capsule — two generous corners, two tight ones — in an
            indigo-to-violet gradient, and its dot is a warm orb that has drifted up and to the right. Precise construction with one
            small, playful detail: the balance the icons aim for too.
          </p>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="status-heading">
        <h2 id="status-heading" className="font-display text-[22px] font-semibold tracking-[-0.02em]">
          Where the library is today
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-ink-2">
          Ikions currently publishes <strong className="text-ink">{stats.icons} icons</strong> ({stats.assets} SVG assets) across{" "}
          {categories.length} categories. The long-term goal is a catalog of several thousand concepts, added category by category in
          reviewed batches — never by generating unreviewed artwork to inflate the count.
          {plannedCategories.length > 0 ? ` ${plannedCategories.length} more categories are on the roadmap.` : ""}
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link href="/changelog" className={buttonClass.secondary}>
            Read the changelog
          </Link>
          <Link href="/docs/contributing" className={buttonClass.primary}>
            Contribute an icon
          </Link>
        </div>
      </section>
    </div>
  );
}
