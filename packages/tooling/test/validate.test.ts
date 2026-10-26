import { describe, expect, it } from "vitest";
import { parsePathData } from "../src/path-data.ts";
import { ROOT_ATTRS, type Variant } from "../src/schema.ts";
import { validateMeta, validateSvg } from "../src/validate.ts";

const root = (variant: Variant) =>
  Object.entries(ROOT_ATTRS[variant])
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
const svg = (body: string, variant: Variant = "outline") => `<svg ${root(variant)}>${body}</svg>`;

describe("validateSvg", () => {
  it("accepts a canonical outline icon", () => {
    expect(validateSvg(svg(`<path d="M4 12h16"/><circle cx="12" cy="12" r="3"/>`), "outline")).toEqual([]);
  });

  it("accepts a canonical filled icon with cutouts", () => {
    const body = `<path fill-rule="evenodd" clip-rule="evenodd" d="M2 2h20v20H2ZM8 8h8v8H8Z"/>`;
    expect(validateSvg(svg(body, "filled"), "filled")).toEqual([]);
  });

  it("rejects scripts, external references and raster images", () => {
    expect(validateSvg(svg(`<script>alert(1)</script>`), "outline").join()).toMatch(/<script> is not allowed/);
    expect(validateSvg(svg(`<use href="#a"/>`), "outline").join()).toMatch(/<use> is not allowed/);
    expect(validateSvg(svg(`<image href="x.png" width="1" height="1"/>`), "outline").join()).toMatch(/<image> is not allowed/);
  });

  it("rejects event handlers, ids, styles and transforms", () => {
    const errors = validateSvg(svg(`<path d="M1 1h2" onclick="x()" id="a" style="fill:red" transform="scale(2)"/>`), "outline").join("\n");
    expect(errors).toMatch(/event handler/);
    expect(errors).toMatch(/"id" is not allowed/);
    expect(errors).toMatch(/"style" is not allowed/);
    expect(errors).toMatch(/"transform" is not allowed/);
  });

  it("rejects hardcoded colours", () => {
    expect(validateSvg(svg(`<path d="M1 1h2" stroke="#ff0000"/>`), "outline").join()).toMatch(/hardcoded colour/);
  });

  it("requires the canonical root attributes and viewBox", () => {
    const bad = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M1 1h2"/></svg>`;
    const errors = validateSvg(bad, "outline").join("\n");
    expect(errors).toMatch(/viewBox must be "0 0 24 24"/);
    expect(errors).toMatch(/stroke-width must be "1.75"/);
  });

  it("forbids stroke-width overrides in outline icons", () => {
    expect(validateSvg(svg(`<path d="M1 1h2" stroke-width="3"/>`), "outline").join()).toMatch(/must not override stroke-width/);
  });

  it("rejects geometry outside the artboard and invalid path data", () => {
    expect(validateSvg(svg(`<path d="M1 1h30"/>`), "outline").join()).toMatch(/outside the 24×24 artboard/);
    expect(validateSvg(svg(`<path d="M1 1 L 2"/>`), "outline").join()).toMatch(/invalid path data/);
    expect(validateSvg(svg(`<circle cx="23" cy="12" r="3"/>`), "outline").join()).toMatch(/circle extends outside/);
  });

  it("rejects malformed XML", () => {
    expect(validateSvg(`<svg ${root("outline")}><path d="M1 1"`, "outline")[0]).toMatch(/invalid XML/);
    expect(validateSvg(svg(`<path d="M1 1h2"fill="none"/>`), "outline").join()).toMatch(/missing whitespace/);
  });
});

describe("parsePathData", () => {
  it("parses relative and absolute commands", () => {
    const result = parsePathData("M4 4h4v4H4Z m10 0l2 2");
    expect(result.ok).toBe(true);
    expect(result.points).toContainEqual([16, 6]);
  });

  it("handles compact arc flags", () => {
    const result = parsePathData("M2 12a10 10 0 1020 0");
    expect(result.ok).toBe(true);
    expect(result.points.at(-1)).toEqual([22, 12]);
  });

  it("rejects missing arguments", () => {
    expect(parsePathData("M1 1C1 1 2 2").ok).toBe(false);
  });
});

describe("validateMeta", () => {
  const categories = new Set(["interface"]);
  const base = {
    name: "home",
    title: "Home",
    category: "interface",
    description: "Return to the start page.",
    tags: ["house", "start"],
    aliases: ["house"],
    variants: ["outline", "filled"] as ("outline" | "filled")[],
    added: "0.1.0",
  };

  it("accepts valid metadata", () => {
    expect(validateMeta(base, categories)).toEqual([]);
  });

  it("enforces naming rules", () => {
    expect(validateMeta({ ...base, name: "Home Icon" }, categories).join()).toMatch(/invalid name/);
    expect(validateMeta({ ...base, name: "3d-box" }, categories).join()).toMatch(/invalid name/);
    expect(validateMeta({ ...base, aliases: ["Bad Alias"] }, categories).join()).toMatch(/kebab-case/);
  });

  it("requires both variants and a known category", () => {
    expect(validateMeta({ ...base, variants: ["outline"] }, categories).join()).toMatch(/variants must list/);
    expect(validateMeta({ ...base, category: "nope" }, categories).join()).toMatch(/unknown category/);
  });
});
