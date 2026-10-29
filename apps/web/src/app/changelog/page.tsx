import type { Metadata } from "next";
import Link from "next/link";
import { IkIcon } from "@/components/ui/ik-icon";
import { PageHeader } from "@/components/ui/page-header";
import { categories, icons, releases } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Ikions releases: new icons, package changes and fixes.",
  alternates: { canonical: "/changelog" },
};

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-[860px] px-4 pt-10 sm:px-6">
      <PageHeader title="Releases">
        Every release lists what changed in the library and its packages. Icon counts are computed from the catalog.
      </PageHeader>

      <ol className="mt-12 space-y-14">
        {releases.map((release) => {
          const added = icons.filter((icon) => icon.added === release.version);
          const byCategory = categories
            .map((c) => ({ category: c, icons: added.filter((i) => i.category === c.slug) }))
            .filter((g) => g.icons.length > 0);
          return (
            <li key={release.version} id={`v${release.version}`} className="grid scroll-mt-24 gap-6 md:grid-cols-[10rem_1fr]">
              <div>
                <h2 className="font-display text-[22px] font-semibold tracking-[-0.02em]">v{release.version}</h2>
                <p className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-ink-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${release.status === "released" ? "bg-success" : "bg-accent"}`} aria-hidden="true" />
                  {release.status === "released" && release.date
                    ? new Date(release.date).toLocaleDateString("en", { dateStyle: "long" })
                    : "In preparation"}
                </p>
              </div>
              <div className="rounded-[24px] bg-surface p-6 shadow-card sm:p-7">
                <p className="text-[15.5px] leading-7">{release.summary}</p>
                <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[14.5px] leading-6 text-ink-2">
                  {release.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
                {added.length > 0 ? (
                  <details className="mt-6 rounded-[18px] bg-subtle">
                    <summary className="cursor-pointer rounded-[18px] px-4 py-3 text-[14px] font-medium hover:text-accent-text">
                      {added.length} icons added in {byCategory.length} categories
                    </summary>
                    <div className="space-y-4 px-4 pb-4 pt-1">
                      {byCategory.map(({ category, icons: list }) => (
                        <div key={category.slug}>
                          <h3 className="text-[13px] font-semibold text-ink-2">{category.name}</h3>
                          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                            {list.map((icon) => (
                              <li key={icon.name}>
                                <Link
                                  href={`/icons/${icon.name}`}
                                  className="inline-flex items-center gap-1.5 py-1 text-[13px] text-ink-2 hover:text-accent-text"
                                >
                                  <IkIcon name={icon.name} size={14} />
                                  {icon.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </details>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
