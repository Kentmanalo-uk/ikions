import { describe, expect, it } from "vitest";
import { getUsageStats, hasUsage } from "../src/lib/usage";

/** A fake fetch that answers from a URL → JSON map (anything else is a 404). */
function fakeFetch(routes: Record<string, unknown>) {
  return async (url: string) => {
    const hit = Object.entries(routes).find(([prefix]) => url.startsWith(prefix));
    return hit ? new Response(JSON.stringify(hit[1]), { status: 200 }) : new Response("{}", { status: 404 });
  };
}

describe("usage stats", () => {
  it("adds up npm downloads and CDN requests across packages", async () => {
    const stats = await getUsageStats(
      fakeFetch({
        "https://api.npmjs.org/downloads/point/last-month/@ikions/react": { downloads: 120 },
        "https://api.npmjs.org/downloads/point/last-month/@ikions/icons": { downloads: 30 },
        "https://data.jsdelivr.com/v1/stats/packages/npm/@ikions/icons": { hits: { total: 900 } },
      }),
      {},
    );
    expect(stats.npm?.total).toBe(150);
    expect(stats.npm?.byPackage.react).toBe(120);
    expect(stats.npm?.byPackage.vue).toBe(0);
    expect(stats.cdn?.total).toBe(900);
    expect(stats.github).toBeNull(); // no token, no GitHub numbers
    expect(hasUsage(stats)).toBe(true);
  });

  it("reports no data, not zero, when the sources have nothing yet", async () => {
    const stats = await getUsageStats(fakeFetch({}), {});
    expect(stats.npm).toBeNull();
    expect(stats.cdn).toBeNull();
    expect(hasUsage(stats)).toBe(false);
  });

  it("hides the section when every real number is zero", async () => {
    const stats = await getUsageStats(
      fakeFetch({ "https://data.jsdelivr.com/v1/stats/packages/npm/@ikions/": { hits: { total: 0 } } }),
      {},
    );
    expect(stats.cdn?.total).toBe(0);
    expect(hasUsage(stats)).toBe(false);
  });

  it("lists public GitHub projects, skipping private repos and Ikions itself", async () => {
    const repo = (full_name: string, isPrivate = false) => ({ repository: { full_name, html_url: `https://github.com/${full_name}`, private: isPrivate } });
    const stats = await getUsageStats(
      fakeFetch({
        "https://api.github.com/search/code": {
          items: [repo("acme/shop"), repo("acme/shop"), repo("Kentmanalo-uk/ikions"), repo("secret/app", true), repo("jane/blog")],
        },
        "https://api.github.com/repos/acme/shop": { full_name: "acme/shop", html_url: "https://github.com/acme/shop", description: "A shop", stargazers_count: 5 },
        "https://api.github.com/repos/jane/blog": { full_name: "jane/blog", html_url: "https://github.com/jane/blog", description: null, stargazers_count: 12 },
      }),
      { GITHUB_TOKEN: "test" },
    );
    expect(stats.github?.count).toBe(2);
    expect(stats.github?.projects.map((p) => p.name)).toEqual(["jane/blog", "acme/shop"]);
    expect(hasUsage(stats)).toBe(true);
  });
});
