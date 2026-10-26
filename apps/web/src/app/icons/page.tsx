import type { Metadata } from "next";
import { Explorer } from "@/components/explorer/explorer";
import { categories, icons, stats, withNodes } from "@/lib/catalog";

export const metadata: Metadata = {
  title: `Search ${stats.icons.toLocaleString("en")} Free SVG Icons`,
  description: `Search ${stats.icons.toLocaleString("en")} free, original SVG icons. Copy SVG or JSX, or download SVG and PNG.`,
  alternates: { canonical: "/icons" },
};

/** Icons rendered on the server so the first screen paints before the full catalog loads. */
const FIRST_SCREEN = 96;

export default function IconsPage() {
  const first = [...icons].sort((a, b) => a.name.localeCompare(b.name)).slice(0, FIRST_SCREEN);
  return <Explorer initial={{ icons: withNodes(first), categories, total: icons.length }} />;
}
