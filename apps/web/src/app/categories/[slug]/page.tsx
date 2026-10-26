import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonClass } from "@/components/ui/button";
import { IconGallery } from "@/components/ui/icon-gallery";
import { IkIcon } from "@/components/ui/ik-icon";
import { PageHeader } from "@/components/ui/page-header";
import { categories, getCategory, getCategoryIcons, withNodes } from "@/lib/catalog";
import { collectionGraph, jsonLd } from "@/lib/structured-data";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  const title = `Free ${category.name} Icons (${category.count})`;
  const description = `${category.count} free ${category.name.toLowerCase()} icons. ${category.description}`;
  return {
    title: { absolute: `${title} | Ikions` },
    description,
    alternates: { canonical: `/categories/${slug}` },
    openGraph: { title, description, url: `/categories/${slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category || category.count === 0) notFound();
  const icons = getCategoryIcons(slug);
  const index = categories.findIndex((c) => c.slug === slug);
  const previous = categories[index - 1];
  const next = categories[index + 1];

  const graph = collectionGraph({
    name: `${category.name} icons`,
    path: `/categories/${slug}`,
    description: category.description,
    icons,
    trail: [{ name: "Categories", path: "/categories" }],
  });

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(graph)} />
      <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-ink-2">
        <Link href="/categories" className="hover:text-ink">
          Categories
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page" className="text-ink">
          {category.name}
        </span>
      </nav>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <PageHeader title={`${category.name} icons`}>
          {category.description} {icons.length} {icons.length === 1 ? "icon" : "icons"}.
        </PageHeader>
        <Link href={`/icons?category=${slug}`} className={buttonClass.secondary}>
          Open in explorer
          <IkIcon name="arrow-right" size={16} />
        </Link>
      </div>

      <div className="mt-10">
        <IconGallery icons={withNodes(icons.map(({ name, title }) => ({ name, title })))} />
      </div>

      <nav aria-label="Other categories" className="mt-10 flex justify-between gap-4 text-[14px]">
        {previous ? (
          <Link href={`/categories/${previous.slug}`} className="rounded-full bg-surface px-4 py-2 text-ink-2 shadow-card transition-colors hover:text-ink">
            ← {previous.name}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/categories/${next.slug}`} className="rounded-full bg-surface px-4 py-2 text-right text-ink-2 shadow-card transition-colors hover:text-ink">
            {next.name} →
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
