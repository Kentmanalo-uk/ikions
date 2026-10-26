import { iconNodes } from "@ikions/icons";
import { categories, collections, icons, synonyms, version } from "@ikions/metadata";
import type { CatalogPayload } from "@/lib/client-catalog";

/**
 * GET /data/catalog.json — the whole library for interactive views, built
 * once at build time. Browsers cache it; a new build changes the content.
 */
export const dynamic = "force-static";

export function GET() {
  const payload: CatalogPayload = {
    version,
    categories,
    collections,
    synonyms: synonyms as Record<string, string[]>,
    icons,
    nodes: iconNodes as unknown as CatalogPayload["nodes"],
  };
  return Response.json(payload, {
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}
