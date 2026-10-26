import { ImageResponse } from "next/og";
import { getCategory, getIcon, getNodes } from "@/lib/catalog";
import { OG_SIZE, OgIcon, OgLogo, OgWordmark } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Ikions icon preview";

export default async function IconOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const icon = getIcon(slug);
  const nodes = getNodes(slug);
  if (!icon || !nodes) return new Response("Not found", { status: 404 });
  const category = getCategory(icon.category);

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#FAFAF8", color: "#18191B", padding: 72 }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <OgLogo size={48} />
            <OgWordmark height={32} color="#18191B" />
          </div>
          <div style={{ display: "flex", fontSize: 80, fontWeight: 600, letterSpacing: -3, marginTop: 70 }}>{`${icon.title} icon`}</div>
          <div style={{ display: "flex", fontSize: 30, color: "#6A6C72", marginTop: 16, maxWidth: 560 }}>{icon.description}</div>
          <div style={{ display: "flex", fontSize: 26, color: "#4747D6", marginTop: "auto" }}>
            {`${category?.name ?? ""} · Free SVG icon`}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28, justifyContent: "center" }}>
          <div style={{ display: "flex", width: 210, height: 210, alignItems: "center", justifyContent: "center", background: "#FFFFFF", border: "2px solid #E8E8E4", borderRadius: 32 }}>
            <OgIcon nodes={nodes.outline} variant="outline" size={140} color="#18191B" />
          </div>
          <div style={{ display: "flex", width: 210, height: 210, alignItems: "center", justifyContent: "center", background: "#5555E8", borderRadius: 32 }}>
            <OgIcon nodes={nodes.filled} variant="filled" size={140} color="#FFFFFF" />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
