import { icons, version } from "@/lib/catalog";

export const dynamic = "force-static";

/** GET /api/v1/icons — metadata for every published icon. */
export function GET() {
  return Response.json(
    { version, count: icons.length, icons },
    { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
  );
}
