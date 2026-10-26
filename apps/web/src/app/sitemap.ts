import type { MetadataRoute } from "next";
import { categories, collections, icons, releases } from "@/lib/catalog";
import { docPages } from "@/lib/docs";
import { absoluteUrl } from "@/lib/site";
import { TOPICS } from "@/lib/topics";

export default function sitemap(): MetadataRoute.Sitemap {
  // Real dates from the changelog: each icon page changes when its release ships.
  const releaseDate = new Map(releases.filter((r) => r.date).map((r) => [r.version, new Date(r.date!)]));
  const lastModified = releases.find((r) => r.date)?.date ? new Date(releases.find((r) => r.date)!.date!) : new Date();
  const pages = ["/", "/icons", "/categories", "/collections", "/changelog", "/license", "/about"];
  return [
    ...pages.map((path) => ({ url: absoluteUrl(path), lastModified, changeFrequency: "weekly" as const, priority: path === "/" ? 1 : 0.8 })),
    ...TOPICS.map((t) => ({ url: absoluteUrl(`/${t.slug}`), lastModified, changeFrequency: "weekly" as const, priority: 0.9 })),
    ...docPages.map((page) => ({ url: absoluteUrl(page.href), lastModified, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...categories.map((c) => ({ url: absoluteUrl(`/categories/${c.slug}`), lastModified, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...collections.map((c) => ({ url: absoluteUrl(`/collections/${c.slug}`), lastModified, changeFrequency: "monthly" as const, priority: 0.6 })),
    // Each icon page lists its two SVGs so Google Images can index them with the page.
    ...icons.map((icon) => ({
      url: absoluteUrl(`/icons/${icon.name}`),
      lastModified: releaseDate.get(icon.added) ?? lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      images: [absoluteUrl(`/api/v1/icons/${icon.name}/outline.svg`), absoluteUrl(`/api/v1/icons/${icon.name}/filled.svg`)],
    })),
  ];
}
