/**
 * Websites built with Ikions. A site is only shown once its live pages are
 * verified to use Ikions, so the showcase never claims usage that isn't there.
 *
 * Verification fetches the listed pages (and the same-site scripts and
 * styles they load) and looks for evidence that only Ikions produces:
 * - the classes the components render: `ikion ikion-<name>`
 * - gradient ids: `ikions-gradient-<hash>`
 * - package or file references: `@ikions/`, `ikions.cloud/api/v1/icons/`
 * - SVG path data identical to an Ikions icon (at least two different icons)
 * Results are cached for a day.
 */
import { iconNodes } from "@/lib/catalog";

export interface ShowcaseSite {
  name: string;
  url: string;
  description: string;
  /** Screenshot in /public/showcase, 1280 × 800. */
  screenshot: string;
  /** Pages to check; the first is also the link. */
  pages: string[];
}

export const SHOWCASE_SITES: ShowcaseSite[] = [
  {
    name: "Balai-Reserve",
    url: "https://balairesort.site/",
    description: "A beachfront resort in Gloria, Oriental Mindoro, with rooms, cottages, a function hall and online booking.",
    screenshot: "/showcase/balairesort.jpg",
    pages: ["https://balairesort.site/", "https://balairesort.site/portal/rooms", "https://balairesort.site/portal/venues"],
  },
];

export const SHOWCASE_REVALIDATE = 86_400;

export interface Verification {
  verified: boolean;
  /** Ikions icon names found on the site, when they can be identified. */
  icons: string[];
  evidence: string[];
  checkedAt: string;
}

const norm = (d: string) => d.replace(/\s+/g, " ").trim();

/** Ikions path data → icon name, built once per server instance. */
let shapeIndex: Map<string, string> | null = null;
function shapes(): Map<string, string> {
  if (shapeIndex) return shapeIndex;
  shapeIndex = new Map();
  for (const [name, variants] of Object.entries(iconNodes)) {
    for (const nodes of [variants.outline, variants.filled]) {
      for (const [tag, attrs] of nodes) {
        const d = tag === "path" ? (attrs as Record<string, string>).d : undefined;
        // Very short paths (a dot, a single line) are too generic to count as evidence.
        // Shapes shared by a family (heart, heart-pulse…) keep the first, simplest name.
        if (d && d.length >= 24 && !shapeIndex.has(norm(d))) shapeIndex.set(norm(d), name);
      }
    }
  }
  return shapeIndex;
}

type Fetcher = (url: string, init?: RequestInit & { next?: { revalidate: number } }) => Promise<Response>;

async function getText(fetcher: Fetcher, url: string): Promise<string> {
  try {
    const res = await fetcher(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; IkionsShowcase/1.0; +https://www.ikions.cloud/showcase)" },
      next: { revalidate: SHOWCASE_REVALIDATE },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return "";
    const text = await res.text();
    return text.slice(0, 3_000_000);
  } catch {
    return "";
  }
}

/** Same-site scripts and stylesheets referenced by a page (icons often live in bundles). */
function assetUrls(html: string, pageUrl: string): string[] {
  const origin = new URL(pageUrl).origin;
  const urls = new Set<string>();
  for (const m of html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|mjs|css)(?:\?[^"']*)?)["']/g)) {
    try {
      const url = new URL(m[1]!, pageUrl);
      if (url.origin === origin) urls.add(url.href);
    } catch {
      /* ignore malformed URLs */
    }
  }
  return [...urls].slice(0, 25);
}

export function findEvidence(sources: string[]): { evidence: string[]; icons: string[] } {
  const text = sources.join("\n");
  const evidence: string[] = [];
  const icons = new Set<string>();

  for (const m of text.matchAll(/\bikion ikion-([a-z0-9-]+)/g)) icons.add(m[1]!);
  if (icons.size) evidence.push("Ikions component markup");
  if (/ikions-gradient-[a-z0-9]+/.test(text)) evidence.push("Ikions gradient");
  if (/@ikions\/(?:icons|react|vue|svelte|metadata)/.test(text)) evidence.push("@ikions package");
  if (/ikions\.cloud\/api\/v1\/icons\//.test(text)) evidence.push("Ikions SVG files");

  const index = shapes();
  const matched = new Set<string>();
  for (const m of text.matchAll(/\sd=\\?["']([^"'\\]{24,})/g)) {
    const name = index.get(norm(m[1]!));
    if (name) matched.add(name);
  }
  if (matched.size >= 2) {
    evidence.push(`${matched.size} icons with identical artwork`);
    for (const name of matched) icons.add(name);
  }
  return { evidence, icons: [...icons].sort() };
}

export async function verifySite(site: ShowcaseSite, fetcher: Fetcher = fetch): Promise<Verification> {
  const pages = await Promise.all(site.pages.map((url) => getText(fetcher, url)));
  const assets = [...new Set(pages.flatMap((html, i) => (html ? assetUrls(html, site.pages[i]!) : [])))];
  const assetTexts = await Promise.all(assets.map((url) => getText(fetcher, url)));
  const { evidence, icons } = findEvidence([...pages, ...assetTexts]);
  return { verified: evidence.length > 0, icons, evidence, checkedAt: new Date().toISOString() };
}

export async function getVerifiedShowcase(fetcher: Fetcher = fetch) {
  const results = await Promise.all(SHOWCASE_SITES.map(async (site) => ({ site, verification: await verifySite(site, fetcher) })));
  return results.filter((r) => r.verification.verified);
}
