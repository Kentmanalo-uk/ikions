import { toSvg, type IconName } from "@ikions/icons";
import { getIcon } from "@/lib/catalog";

export const dynamic = "force-static";
// With thousands of icons, pages are rendered on first request and then cached
// instead of being pre-rendered at build time.
export const dynamicParams = true;

const FILES = ["outline.svg", "filled.svg"] as const;

export function generateStaticParams() {
  return [];
}

/** GET /api/v1/icons/:name/(outline|filled).svg — the raw SVG file. */
export async function GET(_request: Request, { params }: { params: Promise<{ name: string; file: string }> }) {
  const { name, file } = await params;
  const icon = getIcon(name);
  if (!icon || !(FILES as readonly string[]).includes(file)) {
    return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  }
  const variant = file === "filled.svg" ? "filled" : "outline";
  const svg = toSvg(icon.name as IconName, variant).replace(' aria-hidden="true"', "");
  return new Response(`${svg}\n`, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
      // Defence in depth: never execute anything if the SVG is opened directly.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
