import { ImageResponse } from "next/og";
import { getNodes, stats } from "@/lib/catalog";
import { OG_SIZE, OgIcon, OgLogo, OgWordmark } from "@/lib/og";

export const alt = "Ikions — original icons in Outline and Filled";
export const size = OG_SIZE;
export const contentType = "image/png";

const ROW = ["home", "search", "bell", "camera", "heart", "map-pin", "wallet", "sparkles"];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#FAFAF8", padding: 72, color: "#18191B" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <OgLogo size={60} />
          <OgWordmark height={40} color="#18191B" />
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 600, letterSpacing: -3, lineHeight: 1.05, marginTop: 64 }}>
          Icons for everything you imagine.
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#6A6C72", marginTop: 20 }}>
          {`${stats.icons} original icons · Outline and Filled · React, Vue, Svelte, SVG`}
        </div>
        <div style={{ display: "flex", gap: 36, marginTop: "auto" }}>
          {ROW.map((name, i) => {
            const nodes = getNodes(name);
            return nodes ? <OgIcon key={name} nodes={nodes[i % 2 ? "filled" : "outline"]} variant={i % 2 ? "filled" : "outline"} size={64} color="#18191B" /> : null;
          })}
        </div>
      </div>
    ),
    size,
  );
}
