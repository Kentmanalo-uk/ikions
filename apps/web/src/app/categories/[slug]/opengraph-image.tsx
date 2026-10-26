import { ImageResponse } from "next/og";
import { getCategory, getCategoryIcons, withNodes } from "@/lib/catalog";
import { OG_SIZE, OgCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Ikions icon category";

export default async function CategoryOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return new Response("Not found", { status: 404 });
  const icons = withNodes(getCategoryIcons(slug).slice(0, 9));
  return new ImageResponse(<OgCard title={`${category.name} icons`} subtitle={`${category.count} free icons · SVG, React, Vue, Svelte`} icons={icons} />, size);
}
