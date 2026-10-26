import { normalizeQuery } from "@ikions/metadata";
import { categories, searchIndex } from "@/lib/catalog";
import { createRateLimiter } from "@/lib/rate-limit";

const limiter = createRateLimiter({ limit: 60, windowMs: 60_000 });
const MAX_QUERY = 100;
const MAX_LIMIT = 100;

const clientKey = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anonymous";

/**
 * GET /api/v1/search?q=wallet&category=finance&limit=20
 * Ranked icon search. Inputs are validated; requests are rate limited.
 */
export function GET(request: Request) {
  const rate = limiter(clientKey(request));
  const rateHeaders = {
    "X-RateLimit-Limit": "60",
    "X-RateLimit-Remaining": String(rate.remaining),
    "X-RateLimit-Reset": String(Math.ceil(rate.resetAt / 1000)),
  };
  if (!rate.ok) {
    return Response.json(
      { error: "Too many requests" },
      { status: 429, headers: { ...rateHeaders, "Retry-After": String(Math.ceil((rate.resetAt - Date.now()) / 1000)) } },
    );
  }

  const url = new URL(request.url);
  const rawQuery = url.searchParams.get("q") ?? "";
  const category = url.searchParams.get("category") ?? undefined;
  const limitParam = url.searchParams.get("limit");

  if (rawQuery.length > MAX_QUERY) {
    return Response.json({ error: `q must be at most ${MAX_QUERY} characters` }, { status: 400, headers: rateHeaders });
  }
  if (category !== undefined && !categories.some((c) => c.slug === category)) {
    return Response.json({ error: "Unknown category" }, { status: 400, headers: rateHeaders });
  }
  const limit = limitParam === null ? 20 : Number(limitParam);
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    return Response.json({ error: `limit must be an integer between 1 and ${MAX_LIMIT}` }, { status: 400, headers: rateHeaders });
  }

  const query = normalizeQuery(rawQuery);
  const results = searchIndex.search(query, { category, limit }).map(({ icon, score }) => ({
    name: icon.name,
    title: icon.title,
    category: icon.category,
    score,
  }));
  return Response.json({ query, count: results.length, results }, { headers: { ...rateHeaders, "Cache-Control": "no-store" } });
}
