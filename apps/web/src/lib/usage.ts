/**
 * Real usage of the published packages, from public sources only:
 * - npm: downloads in the last 30 days (api.npmjs.org)
 * - jsDelivr: CDN requests in the last 30 days (data.jsdelivr.com)
 * - GitHub: public repositories whose package.json depends on @ikions/*
 *   (code search; needs a GITHUB_TOKEN, otherwise skipped)
 *
 * Every number links back to where it came from. Nothing is estimated: a
 * source that fails or has no data is left out, and the home page hides the
 * section entirely until at least one number is above zero.
 */

export const PACKAGES = ["icons", "metadata", "react", "vue", "svelte"] as const;
type PackageName = (typeof PACKAGES)[number];

/** Refresh at most every 6 hours; the sources update daily. */
export const USAGE_REVALIDATE = 21_600;
const OWN_REPO = "kentmanalo-uk/ikions";

export interface PublicProject {
  name: string;
  url: string;
  description: string | null;
  stars: number;
}

export interface UsageStats {
  npm: { total: number; byPackage: Record<PackageName, number> } | null;
  cdn: { total: number } | null;
  github: { count: number; projects: PublicProject[] } | null;
  updatedAt: string;
}

type Fetcher = (url: string, init?: RequestInit & { next?: { revalidate: number } }) => Promise<Response>;

async function getJson<T>(fetcher: Fetcher, url: string, headers: Record<string, string> = {}): Promise<T | null> {
  try {
    const res = await fetcher(url, {
      headers: { Accept: "application/json", "User-Agent": "ikions.cloud", ...headers },
      next: { revalidate: USAGE_REVALIDATE },
      signal: AbortSignal.timeout(8_000),
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

async function npmDownloads(fetcher: Fetcher): Promise<UsageStats["npm"]> {
  const results = await Promise.all(
    PACKAGES.map((p) => getJson<{ downloads?: number }>(fetcher, `https://api.npmjs.org/downloads/point/last-month/@ikions/${p}`)),
  );
  // npm answers "not found" for about a day after a first publish; treat that as no data yet.
  if (results.every((r) => r === null || typeof r.downloads !== "number")) return null;
  const byPackage = Object.fromEntries(PACKAGES.map((p, i) => [p, results[i]?.downloads ?? 0])) as Record<PackageName, number>;
  return { total: Object.values(byPackage).reduce((a, b) => a + b, 0), byPackage };
}

async function cdnRequests(fetcher: Fetcher): Promise<UsageStats["cdn"]> {
  const results = await Promise.all(
    PACKAGES.map((p) => getJson<{ hits?: { total?: number } }>(fetcher, `https://data.jsdelivr.com/v1/stats/packages/npm/@ikions/${p}?period=month`)),
  );
  if (results.every((r) => typeof r?.hits?.total !== "number")) return null;
  return { total: results.reduce((sum, r) => sum + (r?.hits?.total ?? 0), 0) };
}

async function githubProjects(fetcher: Fetcher, token: string | undefined): Promise<UsageStats["github"]> {
  if (!token) return null;
  const auth = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" };
  const search = await getJson<{ items?: { repository: { full_name: string; html_url: string; private: boolean } }[] }>(
    fetcher,
    `https://api.github.com/search/code?q=${encodeURIComponent('"@ikions/" filename:package.json')}&per_page=100`,
    auth,
  );
  if (!search?.items) return null;
  const repos = new Map<string, string>();
  for (const { repository } of search.items) {
    if (repository.private || repository.full_name.toLowerCase() === OWN_REPO) continue;
    repos.set(repository.full_name, repository.html_url);
  }
  // Details (description, stars) for the projects shown on the page.
  const details = await Promise.all(
    [...repos.keys()].slice(0, 12).map((name) =>
      getJson<{ full_name: string; html_url: string; description: string | null; stargazers_count: number }>(fetcher, `https://api.github.com/repos/${name}`, auth),
    ),
  );
  const projects = details
    .filter((d): d is NonNullable<typeof d> => d !== null)
    .map((d) => ({ name: d.full_name, url: d.html_url, description: d.description, stars: d.stargazers_count }))
    .sort((a, b) => b.stars - a.stars);
  return { count: repos.size, projects };
}

export async function getUsageStats(
  fetcher: Fetcher = fetch,
  env: { GITHUB_TOKEN?: string } = { GITHUB_TOKEN: process.env.GITHUB_TOKEN },
): Promise<UsageStats> {
  const [npm, cdn, github] = await Promise.all([npmDownloads(fetcher), cdnRequests(fetcher), githubProjects(fetcher, env.GITHUB_TOKEN)]);
  return { npm, cdn, github, updatedAt: new Date().toISOString() };
}

/** True when at least one real number is above zero; otherwise the section stays hidden. */
export function hasUsage(stats: UsageStats): boolean {
  return (stats.npm?.total ?? 0) > 0 || (stats.cdn?.total ?? 0) > 0 || (stats.github?.count ?? 0) > 0;
}
