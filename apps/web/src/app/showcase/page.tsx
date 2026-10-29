import type { Metadata } from "next";
import Link from "next/link";
import { IkIcon } from "@/components/ui/ik-icon";
import { PageHeader } from "@/components/ui/page-header";
import { DEVELOPER } from "@/lib/developer";
import { getVerifiedShowcase } from "@/lib/showcase";
import { ShowcaseGrid } from "@/components/landing/showcase-grid";

// Sites are re-verified at most once a day.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Showcase: websites built with Ikions",
  description: "Real websites that use Ikions icons, each verified from its live pages.",
  alternates: { canonical: "/showcase" },
};

export default async function ShowcasePage() {
  const sites = await getVerifiedShowcase();

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-10 sm:px-6">
      <PageHeader title="Built with Ikions">
        Real websites using Ikions icons. Each one is checked against its live pages, so every site here really uses them.
      </PageHeader>

      {sites.length > 0 ? (
        <>
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            <div className="flex flex-col-reverse">
              <dt className="text-[13px] text-ink-2">verified {sites.length === 1 ? "site" : "sites"}</dt>
              <dd className="font-display text-[30px] font-semibold leading-none tracking-[-0.03em] tabular-nums">{sites.length}</dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt className="text-[13px] text-ink-2">Ikions icons in use</dt>
              <dd className="font-display text-[30px] font-semibold leading-none tracking-[-0.03em] tabular-nums">
                {sites.reduce((sum, s) => sum + s.verification.icons.length, 0).toLocaleString("en")}
              </dd>
            </div>
          </dl>
          <ShowcaseGrid sites={sites} />
        </>
      ) : (
        <div className="mt-12 rounded-[24px] bg-surface p-8 text-center shadow-card">
          <p className="font-display text-[18px] font-semibold">The first sites are on their way</p>
          <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-6 text-ink-2">
            Sites appear here as soon as their live pages use Ikions. Check back soon.
          </p>
        </div>
      )}

      <section className="mt-24 rounded-[24px] bg-surface p-8 text-center shadow-card sm:mt-32" aria-labelledby="submit-heading">
        <h2 id="submit-heading" className="font-display text-[22px] font-semibold tracking-[-0.02em]">
          Using Ikions on your site?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-6 text-ink-2">Send the link and it will be added once the icons are live.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          <a href={`mailto:${DEVELOPER.email}?subject=${encodeURIComponent("Ikions showcase")}`} className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-[15px] font-medium text-accent-contrast hover:bg-accent-hover">
            <IkIcon name="mail" size={18} />
            Submit your site
          </a>
          <Link href="/icons" className="inline-flex h-11 items-center rounded-full bg-subtle px-5 text-[15px] font-medium text-ink hover:bg-selected">
            Explore icons
          </Link>
        </div>
      </section>
    </div>
  );
}
