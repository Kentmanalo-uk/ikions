import { topicOgImage } from "@/components/landing/topic-og";
import { OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Ikions free icons";

export default function Image() {
  return topicOgImage("nextjs-icons");
}
