import type { MetadataRoute } from "next";
import { categories, collections, icons } from "@/lib/catalog";
import { docPages } from "@/lib/docs";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/icons", "/categories", "/collections", "/changelog", "/license", "/about", "/search"];
  return [
    ...pages.map((path) => ({ url: absoluteUrl(path), changeFrequency: "weekly" as const, priority: path === "/" ? 1 : 0.8 })),
    ...docPages.map((page) => ({ url: absoluteUrl(page.href), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...categories.map((c) => ({ url: absoluteUrl(`/categories/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...collections.map((c) => ({ url: absoluteUrl(`/collections/${c.slug}`), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...icons.map((icon) => ({ url: absoluteUrl(`/icons/${icon.name}`), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
