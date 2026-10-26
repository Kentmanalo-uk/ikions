/**
 * Site-wide configuration. External links are only rendered when configured,
 * so the site never links to a repository that does not exist.
 */
const normalizeUrl = (value: string | undefined) => value?.replace(/\/+$/, "") || undefined;

export const siteConfig = {
  name: "Ikions",
  tagline: "Every interface deserves a better icon.",
  description:
    "Ikions is an original icon library with carefully drawn Outline and Filled variants, ready for React, Vue, Svelte and plain SVG.",
  url: normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000",
  /** Public source repository, e.g. https://github.com/your-org/ikions. Hidden when unset. */
  github: normalizeUrl(process.env.NEXT_PUBLIC_GITHUB_URL),
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
