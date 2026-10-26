/**
 * Site-wide configuration. External links are only rendered when configured,
 * so the site never links to a repository that does not exist.
 */
const normalizeUrl = (value: string | undefined) => value?.replace(/\/+$/, "") || undefined;

/** The canonical production origin. Every deployment (including previews) points search engines here. */
const PRODUCTION_URL = "https://www.ikions.cloud";

export const siteConfig = {
  name: "Ikions",
  tagline: "Every interface deserves a better icon.",
  description:
    "Ikions is a free, open-source icon library: thousands of original SVG icons in Outline and Filled, MIT licensed, ready for React, Vue, Svelte and plain HTML.",
  url:
    normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    (process.env.NODE_ENV === "production" ? PRODUCTION_URL : "http://localhost:3000"),
  github: normalizeUrl(process.env.NEXT_PUBLIC_GITHUB_URL) ?? "https://github.com/Kentmanalo-uk/ikions",
  /** Search phrases the site should be found for; used in metadata and structured data. */
  keywords: [
    "free icons",
    "free icon library",
    "open source icons",
    "svg icons",
    "free svg icons",
    "react icons",
    "vue icons",
    "svelte icons",
    "icon pack",
    "outline icons",
    "filled icons",
    "mit license icons",
    "web icons",
    "ui icons",
  ],
} as const;

export const mainNav = [
  { href: "/icons", label: "Icons" },
  { href: "/categories", label: "Categories" },
  { href: "/collections", label: "Collections" },
  { href: "/docs", label: "Documentation" },
] as const;

export function absoluteUrl(path: string) {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
