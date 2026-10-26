/**
 * Ask IndexNow search engines (Bing — which also powers ChatGPT search and
 * Copilot — Yandex, Seznam, Naver…) to recrawl the site now instead of
 * waiting to discover changes. Run after a production deploy:
 *
 *   pnpm --filter @ikions/web indexnow
 *
 * Reads every URL from the live sitemap. The key file is public/<key>.txt.
 */
const SITE = "https://www.ikions.cloud";
const KEY = "e5785152389a9b527d5873c0b2bd26ba";

const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.startsWith(SITE));
if (urls.length === 0) {
  console.error(`No ${SITE} URLs in the live sitemap — deploy first (is the canonical URL configured?).`);
  process.exit(1);
}

// IndexNow accepts up to 10,000 URLs per request.
for (let i = 0; i < urls.length; i += 10_000) {
  const batch = urls.slice(i, i + 10_000);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: batch }),
  });
  console.log(`IndexNow: submitted ${batch.length} URL(s) → HTTP ${res.status} ${res.statusText}`);
  if (!res.ok && res.status !== 202) process.exitCode = 1;
}
