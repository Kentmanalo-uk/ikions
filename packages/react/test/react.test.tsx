import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeIcon, SearchIcon, createIkion } from "../src/index.js";

describe("@ikions/react", () => {
  it("renders the outline variant by default", () => {
    const html = renderToStaticMarkup(<HomeIcon />);
    expect(html).toContain('data-variant="outline"');
    expect(html).toContain('stroke-width="1.75"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('class="ikion ikion-home"');
  });

  it("switches to the filled variant", () => {
    const html = renderToStaticMarkup(<HomeIcon variant="filled" />);
    expect(html).toContain('data-variant="filled"');
    expect(html).toContain('fill="currentColor"');
    expect(html).not.toMatch(/<svg[^>]*stroke-width/);
  });

  it("supports size, color, strokeWidth and className", () => {
    const html = renderToStaticMarkup(<SearchIcon size={32} color="#5555E8" strokeWidth={2} className="nav" />);
    expect(html).toContain('width="32"');
    expect(html).toContain('height="32"');
    expect(html).toContain('color="#5555E8"');
    expect(html).toContain('stroke-width="2"');
    expect(html).toContain('class="ikion ikion-search nav"');
  });

  it("is accessible when given a title", () => {
    const html = renderToStaticMarkup(<SearchIcon title="Search the library" />);
    expect(html).toContain('role="img"');
    expect(html).toMatch(/aria-labelledby="[^"]+"/);
    expect(html).toContain("<title");
    expect(html).not.toContain("aria-hidden");
  });

  it("is accessible with aria-label", () => {
    const html = renderToStaticMarkup(<SearchIcon aria-label="Search" />);
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Search"');
  });

  it("passes through standard SVG attributes", () => {
    const html = renderToStaticMarkup(<HomeIcon data-testid="home" style={{ opacity: 0.5 }} />);
    expect(html).toContain('data-testid="home"');
    expect(html).toContain("opacity:0.5");
  });

  it("sets display names and forwards refs", () => {
    expect(HomeIcon.displayName).toBe("HomeIcon");
    const ref = createRef<SVGSVGElement>();
    expect(() => renderToStaticMarkup(<HomeIcon ref={ref} />)).not.toThrow();
  });

  it("uses camelCased attributes for React", () => {
    const html = renderToStaticMarkup(<HomeIcon variant="filled" />);
    expect(html).not.toContain("strokeWidth");
  });

  it("supports custom icons via createIkion", () => {
    const Dot = createIkion("dot", "DotIcon", {
      outline: [["circle", { cx: "12", cy: "12", r: "4" }]],
      filled: [["circle", { cx: "12", cy: "12", r: "5" }]],
    });
    expect(renderToStaticMarkup(<Dot variant="filled" />)).toContain('r="5"');
  });

  it("renders a gradient that matches @ikions/icons", () => {
    const html = renderToStaticMarkup(<HomeIcon gradient={{ from: "#7C6CFF", to: "#FF8AC2" }} />);
    const id = /<linearGradient id="(ikions-gradient-[a-z0-9]+)"/.exec(html)?.[1];
    expect(id).toBeTruthy();
    expect(html).toContain(`stroke="url(#${id})"`);
    expect(html).toContain('stop-color="#7C6CFF"');
    expect(html).toContain('x1="3.51"');
  });

  it("applies gradients to filled icons and ignores unsafe colours", () => {
    expect(renderToStaticMarkup(<HomeIcon variant="filled" gradient={{ from: "red", to: "blue", angle: 90 }} />)).toMatch(/<svg[^>]*fill="url\(#ikions-gradient-/);
    const unsafe = renderToStaticMarkup(<HomeIcon gradient={{ from: "url(javascript:x)", to: "blue" }} />);
    expect(unsafe).not.toContain("linearGradient");
    expect(unsafe).toContain('stroke="currentColor"');
  });
});
