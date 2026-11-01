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
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icons-app/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons-app/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
