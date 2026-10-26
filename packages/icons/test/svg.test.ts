import { describe, expect, it } from "vitest";
import { gradientCoords, gradientId, iconNames, iconNodes, isIconName, isSafeColor, normalizeColor, normalizeGradient, toSvg } from "../src/index.js";

describe("toSvg", () => {
  it("renders an outline icon with defaults", () => {
    const svg = toSvg("home");
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="24" height="24" viewBox="0 0 24 24"/);
    expect(svg).toContain('stroke-width="1.75"');
    expect(svg).toContain('aria-hidden="true"');
  });

  it("renders the filled variant without strokes on the root", () => {
    const svg = toSvg("home", "filled");
    expect(svg).toContain('fill="currentColor"');
    expect(svg).not.toMatch(/<svg[^>]*stroke-width/);
  });

  it("applies size, colour and stroke width", () => {
    const svg = toSvg("search", "outline", { size: 48, color: "#5555E8", strokeWidth: 2 });
    expect(svg).toContain('width="48"');
    expect(svg).toContain('stroke="#5555E8"');
    expect(svg).toContain('stroke-width="2"');
  });

  it("adds an accessible title when given", () => {
    const svg = toSvg("bell", "outline", { title: "Notifications <3" });
    expect(svg).toContain('role="img"');
    expect(svg).toContain("<title>Notifications &lt;3</title>");
    expect(svg).not.toContain("aria-hidden");
  });

  it("refuses unknown icons", () => {
    expect(() => toSvg("not-an-icon" as never)).toThrow(/Unknown Ikions icon/);
  });

  it("clamps invalid numbers", () => {
    expect(toSvg("home", "outline", { size: Number.NaN })).toContain('width="24"');
    expect(toSvg("home", "outline", { strokeWidth: 99 })).toContain('stroke-width="4"');
  });
});

describe("colour handling", () => {
  it("accepts common CSS colour formats", () => {
    for (const c of ["currentColor", "#fff", "#5555e8", "#5555e8cc", "rgb(1, 2, 3)", "hsl(240 80% 60%)", "red"]) {
      expect(isSafeColor(c), c).toBe(true);
    }
  });

  it("rejects injection attempts", () => {
    for (const c of ['red" onload="alert(1)', "url(javascript:x)", "#12345g", "</svg><script>"]) {
      expect(isSafeColor(c), c).toBe(false);
      expect(normalizeColor(c)).toBe("currentColor");
    }
  });
});

describe("generated data", () => {
  it("has outline and filled nodes for every icon", () => {
    for (const name of iconNames) {
      expect(isIconName(name)).toBe(true);
      expect(iconNodes[name].outline.length, `${name} outline`).toBeGreaterThan(0);
      expect(iconNodes[name].filled.length, `${name} filled`).toBeGreaterThan(0);
    }
  });
});

describe("gradients", () => {
  const gradient = { from: "#7C6CFF", to: "#FF8AC2", angle: 135 };

  it("paints outline strokes with a userSpaceOnUse gradient", () => {
    const svg = toSvg("home", "outline", { gradient });
    const id = /<linearGradient id="(ikions-gradient-[a-z0-9]+)"/.exec(svg)?.[1];
    expect(id).toBeTruthy();
    expect(svg).toContain(`stroke="url(#${id})"`);
    expect(svg).toContain('gradientUnits="userSpaceOnUse"');
    expect(svg).toContain('x1="3.51" y1="3.51" x2="20.49" y2="20.49"');
    expect(svg).toContain('<stop offset="0" stop-color="#7C6CFF"/><stop offset="1" stop-color="#FF8AC2"/>');
  });

  it("paints filled icons and currentColor child paints", () => {
    const svg = toSvg("moon", "filled", { gradient });
    expect(svg).toMatch(/<svg[^>]*fill="url\(#ikions-gradient-/);
    expect(svg).not.toContain("currentColor");
  });

  it("uses the same id for the same gradient and different ids otherwise", () => {
    const a = gradientId(normalizeGradient(gradient)!);
    expect(gradientId(normalizeGradient({ ...gradient })!)).toBe(a);
    expect(gradientId(normalizeGradient({ ...gradient, angle: 90 })!)).not.toBe(a);
  });

  it("normalises angles and computes CSS-style directions", () => {
    expect(normalizeGradient({ from: "red", to: "blue" })?.angle).toBe(135);
    expect(normalizeGradient({ from: "red", to: "blue", angle: -90 })?.angle).toBe(270);
    expect(gradientCoords(90)).toEqual({ x1: "0", y1: "12", x2: "24", y2: "12" });
    expect(gradientCoords(0)).toEqual({ x1: "12", y1: "24", x2: "12", y2: "0" });
  });

  it("rejects unsafe gradient colours and falls back to solid", () => {
    expect(normalizeGradient({ from: 'red" onload="x', to: "blue" })).toBeUndefined();
    const svg = toSvg("home", "outline", { gradient: { from: "</svg><script>", to: "blue" } });
    expect(svg).not.toContain("linearGradient");
    expect(svg).not.toContain("<script>");
  });
});
