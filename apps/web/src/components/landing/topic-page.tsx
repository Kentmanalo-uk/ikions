import type { Metadata } from "next";
import Link from "next/link";
import { MorphText } from "@/components/landing/morph-heading";
import { buttonClass } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { IconGallery } from "@/components/ui/icon-gallery";
import { getIcon, stats, withNodes, type IconMetadata } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site";
import { jsonLd } from "@/lib/structured-data";
import { POPULAR_ICONS, TOPICS, type Topic } from "@/lib/topics";

export function topicMetadata(slug: Topic["slug"]): Metadata {
  const topic = TOPICS.find((t) => t.slug === slug)!;
  const description = `${stats.icons.toLocaleString("en")} free ${topic.framework === "SVG" ? "SVG" : `${topic.framework} SVG`} icons in Outline and Filled. ${topic.intro}`;
  return {
    title: { absolute: topic.title },
    description,
    alternates: { canonical: `/${topic.slug}` },
    openGraph: { title: topic.title, description, url: `/${topic.slug}` },
  };
}

export function TopicPage({ slug }: { slug: Topic["slug"] }) {
  const topic = TOPICS.find((t) => t.slug === slug)!;
  const popular = POPULAR_ICONS.map(getIcon).filter((icon): icon is IconMetadata => Boolean(icon));
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ikions", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: topic.heading, item: absoluteUrl(`/${topic.slug}`) },
    ],
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbs)} />

      <header className="relative isolate max-w-3xl">
        <div className="ik-page-glow" aria-hidden="true" />
        <MorphText
          as="h1"
          trigger="load"
          lines={[topic.heading]}
          className="font-display text-[40px] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[52px]"
        />
        <p className="mt-5 text-[17px] leading-[1.7] text-ink-2">
          {stats.icons.toLocaleString("en")} icons, {stats.categories} categories. {topic.intro}
        </p>
        <div className="mt-7 flex flex-wrap gap-2.5">
          <Link href="/icons" className={`${buttonClass.primary} h-11 px-5 text-[15px]`}>
            Browse all icons
          </Link>
          <Link href={topic.docs.href} className={`${buttonClass.secondary} h-11 px-5 text-[15px]`}>
            {topic.docs.label}
          </Link>
        </div>
      </header>

      <section className="mt-16 grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start" aria-labelledby="how-heading">
        <div>
          <h2 id="how-heading" className="font-display text-[26px] font-semibold tracking-[-0.03em]">
            How to use them
          </h2>
          <ol className="mt-5 space-y-3">
            {topic.steps.map((step, i) => (
              <li key={step} className="flex gap-3 text-[15.5px] leading-7 text-ink-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-selected text-[13px] font-semibold text-accent-text">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <CodeBlock code={topic.example.code} lang={topic.example.lang} label={topic.example.label} />
      </section>

      <section className="mt-16" aria-labelledby="popular-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="popular-heading" className="font-display text-[26px] font-semibold tracking-[-0.03em]">
            Popular {topic.framework === "SVG" ? "SVG" : topic.framework} icons
          </h2>
          <Link href="/categories" className="text-[14px] font-medium text-accent-text hover:underline">
            All {stats.categories} categories →
          </Link>
        </div>
        <div className="mt-6">
          <IconGallery icons={withNodes(popular.map(({ name, title }) => ({ name, title })))} />
        </div>
      </section>

      <nav aria-label="Other icon guides" className="mt-14 flex flex-wrap justify-center gap-2.5">
        {TOPICS.filter((t) => t.slug !== topic.slug).map((t) => (
          <Link key={t.slug} href={`/${t.slug}`} className="rounded-full bg-surface px-4 py-2 text-[14px] text-ink-2 shadow-card hover:text-ink">
            {t.heading}
          </Link>
        ))}
      </nav>
    </div>
  );
}
