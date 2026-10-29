import { describe, expect, it } from "vitest";
import { getNodes } from "../src/lib/catalog";
import { findEvidence } from "../src/lib/showcase";

const pathOf = (name: string, variant: "outline" | "filled" = "outline") => {
  const node = getNodes(name)![variant].find(([tag, attrs]) => tag === "path" && (attrs as { d?: string }).d!.length >= 24);
  return (node![1] as { d: string }).d;
};

describe("showcase verification", () => {
  it("recognises Ikions component markup and names the icons", () => {
    const html = '<svg class="ikion ikion-camera" data-variant="outline"></svg><svg class="ikion ikion-bed"></svg>';
    const { evidence, icons } = findEvidence([html]);
    expect(evidence).toContain("Ikions component markup");
    expect(icons).toEqual(["bed", "camera"]);
  });

  it("recognises package imports in bundled scripts", () => {
    expect(findEvidence(['import{CameraIcon}from"@ikions/react";']).evidence).toContain("@ikions package");
  });

  it("recognises pasted SVGs with identical artwork", () => {
    const html = `<svg><path d="${pathOf("camera")}"/></svg><svg><path d="${pathOf("heart")}"/></svg>`;
    const { evidence, icons } = findEvidence([html]);
    expect(evidence.join()).toMatch(/identical artwork/);
    expect(icons).toEqual(expect.arrayContaining(["camera", "heart"]));
  });

  it("needs at least two matching icons before trusting artwork alone", () => {
    expect(findEvidence([`<path d="${pathOf("camera")}"/>`]).evidence).toEqual([]);
  });

  it("does not count other icon libraries", () => {
    const html = '<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"><i class="fas fa-camera"></i>';
    expect(findEvidence([html])).toEqual({ evidence: [], icons: [] });
  });
});

describe("showcase verification of live pages", () => {
  it("follows same-site SVG sprites referenced with <use>", async () => {
    const { verifySite } = await import("../src/lib/showcase");
    const sprite = `<svg><symbol id="i-camera"><path d="${pathOf("camera")}"/></symbol><symbol id="i-bed"><path d="${pathOf("bed")}"/></symbol></svg>`;
    const pages: Record<string, string> = {
      "https://example.com/": '<svg><use href="/images/icons.svg?v=1#i-camera"/></svg><link rel="stylesheet" href="https://cdn.example.net/x.css">',
      "https://example.com/images/icons.svg?v=1": sprite,
    };
    const fetcher = async (url: string) => (url in pages ? new Response(pages[url]) : new Response("", { status: 404 }));
    const result = await verifySite(
      { name: "Example", url: "https://example.com/", description: "", icon: "", screenshots: { desktop: "", mobile: "" }, pages: ["https://example.com/"] },
      fetcher,
    );
    expect(result.verified).toBe(true);
    expect(result.icons).toEqual(expect.arrayContaining(["bed", "camera"]));
  });
});

describe("showcase verification of bundled apps", () => {
  it("recognises @ikions/react compiled into a JavaScript bundle", () => {
    const bundle =
      "return{id:`ikions-gradient-${a.toString(36)}`};" +
      "className:[`ikion`,`ikion-${e}`,d].filter(Boolean).join(` `);" +
      `var d=u(\`camera\`,\`CameraIcon\`,{outline:[[\`path\`,{d:\`${pathOf("camera")}\`}]]});` +
      `var h=u(\`heart\`,\`HeartIcon\`,{outline:[[\`path\`,{d:"${pathOf("heart")}"}]]});`;
    const { evidence, icons } = findEvidence([bundle]);
    expect(evidence).toEqual(expect.arrayContaining(["Ikions component code", "Ikions gradient"]));
    expect(icons).toEqual(expect.arrayContaining(["camera", "heart"]));
  });
});
