import { ImageResponse } from "next/og";
import { getCollection, getIcon, withNodes, type IconMetadata } from "@/lib/catalog";
import { OG_SIZE, OgCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Ikions icon collection";

export default async function CollectionOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return new Response("Not found", { status: 404 });
  const icons = withNodes(collection.icons.map(getIcon).filter((i): i is IconMetadata => Boolean(i)).slice(0, 9));
  return new ImageResponse(<OgCard title={collection.name} subtitle={`${collection.icons.length} free icons · Ikions icon set`} icons={icons} />, size);
}
