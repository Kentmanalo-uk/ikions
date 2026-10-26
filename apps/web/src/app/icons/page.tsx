import type { Metadata } from "next";
import { Explorer } from "@/components/explorer/explorer";
import { categories, icons, stats, withNodes } from "@/lib/catalog";

export const metadata: Metadata = {
  title: `Free Icon Search — ${stats.icons.toLocaleString("en")} SVG Icons, Outline & Filled`,
  description: `Search and browse ${stats.icons.toLocaleString("en")} original Ikions icons in Outline and Filled. Copy SVG or JSX, download SVG and PNG, or export a selection as ZIP.`,
  alternates: { canonical: "/icons" },
};

/** Icons rendered on the server so the first screen paints before the full catalog loads. */
const FIRST_SCREEN = 96;

export default function IconsPage() {
  const first = [...icons].sort((a, b) => a.name.localeCompare(b.name)).slice(0, FIRST_SCREEN);
  return <Explorer initial={{ icons: withNodes(first), categories, total: icons.length }} />;
}
