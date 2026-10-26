import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { IkIcon } from "@/components/ui/ik-icon";
import { PageHeader } from "@/components/ui/page-header";
import { categories, getCategoryIcons, plannedCategories } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Icon categories",
  description: "Browse Ikions icons by category: interface, arrows, communication, files, media, devices, commerce, finance and more.",
  alternates: { canonical: "/categories" },
};

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-10 sm:px-6">
      <PageHeader eyebrow="Categories" title="Browse by category">
        {categories.length} categories with published icons. Every icon belongs to exactly one category and can also be found
        through its aliases and tags.
      </PageHeader>

      <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const preview = getCategoryIcons(category.slug).slice(0, 6);
          return (
            <li key={category.slug} className="overflow-hidden rounded-[22px] bg-surface shadow-card">
              <Link href={`/categories/${category.slug}`} className="group flex h-full flex-col p-6 transition-colors hover:bg-subtle">
                <div className="flex items-center gap-3.5 text-ink-2 transition-colors group-hover:text-accent-text" aria-hidden="true">
                  {preview.map((icon, i) => (
                    <span key={icon.name} className="ik-flip" style={{ "--fd": `${i * 30}ms` } as CSSProperties}>
                      <IkIcon name={icon.name} size={22} className="ik-flip-outline" />
                      <IkIcon name={icon.name} size={22} variant="filled" className="ik-flip-filled" />
                    </span>
                  ))}
                </div>
                <h2 className="mt-5 font-display text-[16px] font-semibold tracking-[-0.01em]">{category.name}</h2>
                <p className="mt-1 text-[13.5px] leading-6 text-ink-2">{category.description}</p>
                <p className="mt-auto flex items-center gap-1.5 pt-4 text-[12.5px] font-medium text-ink-2">
                  {category.count} {category.count === 1 ? "icon" : "icons"}
                  <span className="-translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true">
                    →
                  </span>
                </p>
              </Link>
            </li>
          );
        })}
      </ul>

      {plannedCategories.length > 0 ? (
        <section className="mt-14" aria-labelledby="planned">
          <h2 id="planned" className="font-display text-[18px] font-semibold">
            On the roadmap
          </h2>
          <p className="mt-1 max-w-2xl text-[14px] text-ink-2">
            These categories are planned but have no published icons yet. They appear in the explorer once their first batch passes review.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {plannedCategories.map((c) => (
              <li key={c.slug} className="rounded-full bg-subtle px-3.5 py-1.5 text-[13px] text-ink-2">
                {c.name}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
