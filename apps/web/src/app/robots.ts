import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "@/lib/site";

/**
 * Search engines and AI assistants (ChatGPT, Claude, Perplexity, Gemini,
 * Apple Intelligence…) are all welcome: being findable is the point of a free
 * library. Only the search API is excluded, since its results duplicate pages.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "DuckAssistBot",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/api/v1/search"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: AI_CRAWLERS, allow: "/", disallow },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}
