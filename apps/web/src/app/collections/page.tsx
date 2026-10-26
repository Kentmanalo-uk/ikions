import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { IkIcon } from "@/components/ui/ik-icon";
import { PageHeader } from "@/components/ui/page-header";
import { collections } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Curated icon collections",
  description: "Hand-picked sets of Ikions icons for common products: app essentials, e-commerce, developer tools, media players, dashboards and more.",
  alternates: { canonical: "/collections" },
};

export default function CollectionsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-10 sm:px-6">
      <PageHeader eyebrow="Collections" title="Curated sets for real products">
        Starting points assembled from the published catalog. Open a collection to preview it, then select the icons you need and
        export them together.
      </PageHeader>
      <ul className="mt-12 grid gap-3 md:grid-cols-2">
        {collections.map((collection) => (
          <li key={collection.slug}>
            <Link
              href={`/collections/${collection.slug}`}
              className="group block h-full rounded-[22px] bg-surface p-6 shadow-card transition-colors hover:bg-subtle"
            >
              <div className="grid grid-cols-8 gap-3 text-ink-2 transition-colors group-hover:text-accent-text" aria-hidden="true">
                {collection.icons.slice(0, 16).map((name, i) => (
                  <span key={name} className="ik-flip" style={{ "--fd": `${i * 18}ms` } as CSSProperties}>
                    <IkIcon name={name} size={22} className="ik-flip-outline" />
                    <IkIcon name={name} size={22} variant="filled" className="ik-flip-filled" />
                  </span>
                ))}
              </div>
              <h2 className="mt-6 font-display text-[17px] font-semibold tracking-[-0.01em]">{collection.name}</h2>
              <p className="mt-1 text-[14px] leading-6 text-ink-2">{collection.description}</p>
              <p className="mt-3 text-[12.5px] font-medium text-ink-2">{collection.icons.length} icons</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
