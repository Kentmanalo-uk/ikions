import { Resvg } from "@resvg/resvg-js";
import { describe, expect, it } from "vitest";
import { loadCatalog } from "../src/catalog.ts";
import { optimizeVariant } from "../src/optimize.ts";
import { VARIANTS } from "../src/schema.ts";
import { validateCatalog } from "../src/validate.ts";

const catalog = loadCatalog();

describe("source catalog", () => {
  it("contains icons", () => {
    expect(catalog.icons.length).toBeGreaterThan(0);
  });

  it("passes validation with zero errors", () => {
    const errors = validateCatalog(catalog).filter((i) => i.severity === "error");
    expect(errors.map((e) => `${e.icon}${e.variant ? `/${e.variant}` : ""}: ${e.message}`)).toEqual([]);
  });

  it("has an outline and a filled variant for every icon", () => {
    for (const icon of catalog.icons) {
      for (const variant of VARIANTS) expect(icon.svg[variant], `${icon.meta.name}/${variant}`).toBeTruthy();
    }
  });
});

/** Render an SVG to an alpha mask at 48 px. */
function alpha(svg: string): Uint8Array {
  const pixels = new Resvg(svg.replaceAll("currentColor", "#000"), { fitTo: { mode: "width", value: 48 }, font: { loadSystemFonts: false } }).render().pixels;
  const out = new Uint8Array(pixels.length / 4);
  for (let i = 0; i < out.length; i++) out[i] = pixels[i * 4 + 3]!;
  return out;
}

describe("optimizer", () => {
  it("does not change icon geometry", () => {
    const failures: string[] = [];
    for (const icon of catalog.icons) {
      for (const variant of VARIANTS) {
        const before = alpha(icon.svg[variant]);
        const after = alpha(optimizeVariant(icon.svg[variant], variant).svg);
        let changed = 0;
        for (let i = 0; i < before.length; i++) if (Math.abs(before[i]! - after[i]!) > 48) changed++;
        if (changed / before.length > 0.002) failures.push(`${icon.meta.name}/${variant}: ${changed} pixels changed`);
      }
    }
    expect(failures).toEqual([]);
  });
});
