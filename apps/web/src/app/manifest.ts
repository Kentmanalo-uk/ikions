import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ikions Free Icon Library",
    short_name: "Ikions",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf8",
    theme_color: "#5555E8",
    categories: ["design", "developer", "productivity"],
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
