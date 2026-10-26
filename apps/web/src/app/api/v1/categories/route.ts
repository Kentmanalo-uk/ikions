import { categories as allCategories, version } from "@ikions/metadata";

export const dynamic = "force-static";

/** GET /api/v1/categories — every category with its published icon count. */
export function GET() {
  return Response.json(
    { version, categories: allCategories },
    { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
  );
}
