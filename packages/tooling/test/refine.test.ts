import { describe, expect, it } from "vitest";
import { parsePathData } from "../src/path-data.ts";
import { refineSvg } from "../src/refine.ts";

const svg = (...d: string[]) => `<svg>${d.map((p) => `<path d="${p}"/>`).join("")}</svg>`;

describe("refineSvg", () => {
  it("rounds the corners of a closed shape, including the start vertex", () => {
    const out = refineSvg(svg("M4 4h16v16H4Z"), "outline");
    expect(out.match(/A/g)).toHaveLength(4);
    const d = out.match(/d="([^"]+)"/)![1]!;
    expect(parsePathData(d).ok).toBe(true);
  });

  it("softens chevrons only slightly", () => {
    const out = refineSvg(svg("M15 6l-6 6 6 6"), "outline");
    expect(Number(out.match(/A([\d.]+)/)![1])).toBeLessThan(0.6);
  });

  it("grows existing tangent corners", () => {
    const d = "M6 3H18A3 3 0 0 1 21 6V18A3 3 0 0 1 18 21H6A3 3 0 0 1 3 18V6A3 3 0 0 1 6 3Z";
    expect(refineSvg(svg(d), "outline").match(/A3\.2 3\.2/g)).toHaveLength(4);
  });

  it("never shrinks a corner that is already generous", () => {
    const d = "M8 3H16A5 5 0 0 1 21 8V16A5 5 0 0 1 16 21H8A5 5 0 0 1 3 16V8A5 5 0 0 1 8 3Z";
    expect(refineSvg(svg(d), "outline").match(/A5 5/g)).toHaveLength(4);
  });

  it("gives rectangles the same rounding", () => {
    expect(refineSvg('<svg><rect x="4" y="4" width="16" height="16" rx="2"/></svg>', "outline")).toContain('rx="3.2"');
  });

  it("keeps vertices where another shape joins", () => {
    const out = refineSvg(svg("M4 4h8v8h8", "M12 4V2"), "outline");
    expect(out.match(/A/g)).toHaveLength(1);
  });

  it("leaves curves alone and is idempotent", () => {
    const curve = svg("M4 12a8 8 0 0 1 16 0");
    expect(refineSvg(curve, "outline")).toBe(curve);
    const once = refineSvg(svg("M4 4h16v16H4Z"), "filled");
    expect(refineSvg(once, "filled")).toBe(once);
  });
});
