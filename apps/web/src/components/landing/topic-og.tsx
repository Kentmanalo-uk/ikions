import { ImageResponse } from "next/og";
import { getIcon, stats, withNodes, type IconMetadata } from "@/lib/catalog";
import { OG_SIZE, OgCard } from "@/lib/og";
import { POPULAR_ICONS, TOPICS, type Topic } from "@/lib/topics";

/** Share image for a landing page (/react-icons, /svg-icons…). */
export function topicOgImage(slug: Topic["slug"]) {
  const topic = TOPICS.find((t) => t.slug === slug)!;
  const icons = withNodes(POPULAR_ICONS.map(getIcon).filter((i): i is IconMetadata => Boolean(i)).slice(0, 9));
  return new ImageResponse(<OgCard title={topic.heading} subtitle={`${stats.icons.toLocaleString("en")} original icons · Ikions`} icons={icons} />, OG_SIZE);
}
