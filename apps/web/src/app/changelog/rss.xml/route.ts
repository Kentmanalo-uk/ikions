import { releases } from "@/lib/catalog";
import { absoluteUrl, siteConfig } from "@/lib/site";

/** RSS feed of released versions, for feed readers and aggregators. */
export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function GET() {
  const items = releases
    .filter((r) => r.status === "released" && r.date)
    .map(
      (r) => `    <item>
      <title>Ikions ${esc(r.version)}</title>
      <link>${absoluteUrl(`/changelog#v${r.version}`)}</link>
      <guid isPermaLink="false">ikions-${esc(r.version)}</guid>
      <pubDate>${new Date(r.date!).toUTCString()}</pubDate>
      <description>${esc([r.summary, ...r.notes].join(" "))}</description>
    </item>`,
    )
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Ikions releases</title>
    <link>${absoluteUrl("/changelog")}</link>
    <atom:link href="${absoluteUrl("/changelog/rss.xml")}" rel="self" type="application/rss+xml" />
    <description>${esc(siteConfig.description)}</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;
  return new Response(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
