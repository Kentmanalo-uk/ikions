import { toSvg, type IconName } from "@ikions/icons";
import { getIcon, version } from "@/lib/catalog";

export const dynamic = "force-static";
// With thousands of icons, pages are rendered on first request and then cached
// instead of being pre-rendered at build time.
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

/** GET /api/v1/icons/:name — metadata plus both SVG variants. */
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const icon = getIcon(name);
  if (!icon) return Response.json({ error: "Icon not found" }, { status: 404 });
  return Response.json(
    {
      version,
      icon,
      svg: {
        outline: toSvg(icon.name as IconName, "outline"),
        filled: toSvg(icon.name as IconName, "filled"),
      },
    },
    { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
  );
}
