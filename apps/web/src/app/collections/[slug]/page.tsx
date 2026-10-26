import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconGallery } from "@/components/ui/icon-gallery";
import { PageHeader } from "@/components/ui/page-header";
import { collections, getCollection, getIcon, withNodes, type IconMetadata } from "@/lib/catalog";
import { collectionGraph, jsonLd } from "@/lib/structured-data";
import { SelectCollection } from "./select-collection";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return {};
  const title = `${collection.name} — Free Icon Set (${collection.icons.length} icons)`;
  const description = `${collection.description} ${collection.icons.length} free icons in Outline and Filled. Select the set and export it as SVG, PNG, sprite or ZIP.`;
  return {
    title: { absolute: `${title} | Ikions` },
    description,
    alternates: { canonical: `/collections/${slug}` },
    openGraph: { title, description, url: `/collections/${slug}` },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();
  const icons = collection.icons.map(getIcon).filter((icon): icon is IconMetadata => Boolean(icon));

  const graph = collectionGraph({
    name: collection.name,
    path: `/collections/${slug}`,
    description: collection.description,
    icons,
    trail: [{ name: "Collections", path: "/collections" }],
  });

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(graph)} />
      <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-ink-2">
        <Link href="/collections" className="hover:text-ink">
          Collections
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page" className="text-ink">
          {collection.name}
        </span>
      </nav>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <PageHeader title={collection.name}>
          {collection.description} {icons.length} icons.
        </PageHeader>
        <SelectCollection names={icons.map((i) => i.name)} />
      </div>
      <div className="mt-10">
        <IconGallery icons={withNodes(icons.map(({ name, title }) => ({ name, title })))} />
      </div>
    </div>
  );
}
