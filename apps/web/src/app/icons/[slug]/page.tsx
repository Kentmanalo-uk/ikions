import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MorphText } from "@/components/landing/morph-heading";
import { IconGallery } from "@/components/ui/icon-gallery";
import { Workbench } from "@/components/workbench/workbench";
import { getCategory, getIcon, getNodes, getRelatedIcons, withNodes } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

// With thousands of icons, pages are rendered on first request and then cached
// instead of being pre-rendered at build time.
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const icon = getIcon(slug);
  if (!icon) return {};
  const title = `${icon.title} Icon — Free SVG, Outline & Filled`;
  const description = `Free ${icon.title.toLowerCase()} icon (MIT) in Outline and Filled. ${icon.description} Copy SVG or JSX, download SVG or PNG, or use the ${icon.component} component in React, Vue or Svelte.`;
  return {
    title,
    description,
    keywords: [icon.name, ...icon.aliases, ...icon.tags, "icon", "svg"],
    alternates: { canonical: `/icons/${icon.name}` },
    openGraph: { title: `${title} | Ikions`, description, url: `/icons/${icon.name}` },
  };
}

export default async function IconPage({ params }: Props) {
  const { slug } = await params;
  const icon = getIcon(slug);
  const nodes = icon ? getNodes(icon.name) : undefined;
  if (!icon || !nodes) notFound();
  const category = getCategory(icon.category);
  const related = getRelatedIcons(icon);

  // Image licence metadata lets Google Images label the icon as free to use.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ImageObject",
        name: `${icon.title} icon`,
        description: icon.description,
        contentUrl: absoluteUrl(`/api/v1/icons/${icon.name}/outline.svg`),
        thumbnailUrl: absoluteUrl(`/api/v1/icons/${icon.name}/outline.svg`),
        encodingFormat: "image/svg+xml",
        keywords: [icon.name, ...icon.aliases, ...icon.tags, "free icon", "svg icon"].join(", "),
        license: absoluteUrl("/license"),
        acquireLicensePage: absoluteUrl("/license"),
        isAccessibleForFree: true,
        creditText: "Ikions",
        copyrightNotice: "Ikions — MIT License",
        creator: { "@type": "Organization", name: "Ikions", url: absoluteUrl("/") },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Icons", item: absoluteUrl("/icons") },
          { "@type": "ListItem", position: 2, name: category?.name ?? icon.category, item: absoluteUrl(`/categories/${icon.category}`) },
          { "@type": "ListItem", position: 3, name: icon.title, item: absoluteUrl(`/icons/${icon.name}`) },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-6 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="text-[13px] text-ink-2">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/icons" className="hover:text-ink">
              Icons
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/categories/${icon.category}`} className="hover:text-ink">
              {category?.name}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            {icon.title}
          </li>
        </ol>
      </nav>

      <header className="relative isolate mt-5 mb-8 max-w-2xl">
        <div className="ik-page-glow" aria-hidden="true" />
        <MorphText
          as="h1"
          trigger="load"
          lines={[`${icon.title} icon`]}
          className="font-display text-[36px] font-semibold leading-[1.08] tracking-[-0.04em] sm:text-[44px]"
        />
        <p className="mt-2 text-[16px] leading-7 text-ink-2">{icon.description}</p>
      </header>

      <Workbench icon={{ name: icon.name, title: icon.title, component: icon.component }} nodes={nodes} />

      <section className="mt-12 grid grid-cols-1 gap-3 md:grid-cols-2" aria-labelledby="details-heading">
        <h2 id="details-heading" className="sr-only">
          Icon details
        </h2>
        <dl className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 rounded-[22px] bg-surface p-6 text-[14px] shadow-card">
          <dt className="text-ink-2">Name</dt>
          <dd className="font-mono">{icon.name}</dd>
          <dt className="text-ink-2">Component</dt>
          <dd className="font-mono">{icon.component}</dd>
          <dt className="text-ink-2">Category</dt>
          <dd>
            <Link href={`/categories/${icon.category}`} className="text-accent-text hover:underline">
              {category?.name}
            </Link>
          </dd>
          <dt className="text-ink-2">Variants</dt>
          <dd>Outline, Filled</dd>
          <dt className="text-ink-2">Added in</dt>
          <dd>
            <Link href="/changelog" className="text-accent-text hover:underline">
              v{icon.added}
            </Link>
          </dd>
          <dt className="text-ink-2">Files</dt>
          <dd className="break-all font-mono text-[12.5px]">
            @ikions/icons/outline/{icon.name}.svg
            <br />
            @ikions/icons/filled/{icon.name}.svg
          </dd>
        </dl>
        <div className="space-y-5 rounded-[22px] bg-surface p-6 text-[14px] shadow-card">
          {icon.aliases.length ? (
            <div>
              <h3 className="text-ink-2">Also known as</h3>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {icon.aliases.map((alias) => (
                  <li key={alias} className="rounded-full bg-subtle px-2.5 py-0.5 font-mono text-[12.5px]">
                    {alias}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div>
            <h3 className="text-ink-2">Tags</h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {icon.tags.map((tag) => (
                <li key={tag}>
                  <Link href={`/icons?q=${encodeURIComponent(tag)}`} className="inline-block rounded-full bg-subtle px-2.5 py-0.5 text-[12.5px] text-ink-2 transition-colors hover:bg-selected hover:text-accent-text">
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <div className="mt-12">
          <IconGallery icons={withNodes(related.map(({ name, title }) => ({ name, title })))} heading="Related icons" />
        </div>
      ) : null}
    </div>
  );
}
