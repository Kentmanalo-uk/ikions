import { iconNodes } from "@ikions/icons";
import { describe, expect, it } from "vitest";
import { buildSprite, pngFileName, svgFile, svgFileName, zipEntries } from "@/lib/export";
import { createRateLimiter } from "@/lib/rate-limit";
import { cssSnippet, DEFAULT_OPTIONS, getSnippet, htmlSnippet, jsSnippet, jsxSnippet, reactSnippet, svgDataUri, svgMarkup, SNIPPET_TABS, vueSnippet, svelteSnippet } from "@/lib/snippets";

const camera = { name: "camera", title: "Camera", component: "CameraIcon" };
const nodes = iconNodes.camera;

describe("snippets", () => {
  it("omits default props in component snippets", () => {
    expect(reactSnippet(camera, DEFAULT_OPTIONS)).toContain('<CameraIcon variant="outline" />');
    expect(svelteSnippet(camera, DEFAULT_OPTIONS)).toContain('<CameraIcon variant="outline" />');
    expect(vueSnippet(camera, DEFAULT_OPTIONS)).toContain('<CameraIcon variant="outline" />');
  });

  it("includes customised props", () => {
    const options = { ...DEFAULT_OPTIONS, variant: "outline" as const, size: 32, color: "#5555E8", strokeWidth: 2 };
    expect(reactSnippet(camera, options)).toContain('<CameraIcon size={32} variant="outline" color="#5555E8" strokeWidth={2} />');
    expect(vueSnippet(camera, options)).toContain(':size="32" variant="outline" color="#5555E8" :stroke-width="2"');
    expect(jsSnippet(camera, options)).toContain('toSvg("camera", "outline", { size: 32, color: "#5555E8", strokeWidth: 2 })');
  });

  it("drops strokeWidth for filled icons", () => {
    const options = { ...DEFAULT_OPTIONS, variant: "filled" as const, strokeWidth: 2.5 };
    expect(reactSnippet(camera, options)).toBe(reactSnippet(camera, { ...options, strokeWidth: 1.75 }));
  });

  it("renders the selected variant in SVG and JSX", () => {
    const outline = svgMarkup(nodes.outline, DEFAULT_OPTIONS);
    const filled = svgMarkup(nodes.filled, { ...DEFAULT_OPTIONS, variant: "filled" });
    expect(outline).toContain('stroke-width="1.75"');
    expect(filled).not.toMatch(/<svg[^>]*stroke-width/);
    expect(outline).not.toContain("aria-hidden");
    expect(jsxSnippet(camera, nodes.filled, { ...DEFAULT_OPTIONS, variant: "filled" })).toContain('fill="currentColor"');
    expect(jsxSnippet(camera, nodes.outline, DEFAULT_OPTIONS)).toContain("strokeWidth={1.75}");
  });

  it("never injects unsafe colours", () => {
    const options = { ...DEFAULT_OPTIONS, color: '"><script>alert(1)</script>' };
    for (const tab of SNIPPET_TABS) {
      expect(getSnippet(tab.kind, camera, nodes.outline, options), tab.kind).not.toContain("alert(1)");
    }
  });

  it("builds a valid CSS mask", () => {
    const css = cssSnippet(camera, nodes.outline, DEFAULT_OPTIONS);
    expect(css).toContain("mask: url(\"data:image/svg+xml,");
    const data = /data:image\/svg\+xml,([^"]*)"/.exec(css)![1]!;
    expect(data).not.toMatch(/[<>#]/);
    expect(svgDataUri('<svg fill="#000"/>')).toBe("url(\"data:image/svg+xml,%3Csvg fill='%23000'/%3E\")");
  });

  it("points HTML users at the sprite symbol id", () => {
    expect(htmlSnippet(camera, nodes.outline, DEFAULT_OPTIONS)).toContain('href="/ikions-outline.svg#ikions-camera"');
  });
});

describe("gradient snippets", () => {
  const gradient = { from: "#7C6CFF", to: "#FF8AC2", angle: 90 };
  const options = { ...DEFAULT_OPTIONS, gradient };

  it("passes the gradient prop to framework components", () => {
    expect(reactSnippet(camera, options)).toContain('gradient={{ from: "#7C6CFF", to: "#FF8AC2", angle: 90 }}');
    expect(svelteSnippet(camera, options)).toContain('gradient={{ from: "#7C6CFF", to: "#FF8AC2", angle: 90 }}');
    expect(vueSnippet(camera, options)).toContain(':gradient="{ from: \x27#7C6CFF\x27, to: \x27#FF8AC2\x27, angle: 90 }"');
    expect(jsSnippet(camera, options)).toContain('gradient: { from: "#7C6CFF", to: "#FF8AC2", angle: 90 }');
    expect(reactSnippet(camera, { ...options, color: "#E5484D" })).not.toContain("color=");
  });

  it("embeds a real gradient in SVG, JSX, HTML and file exports", () => {
    for (const out of [
      svgMarkup(nodes.outline, options),
      jsxSnippet(camera, nodes.outline, options),
      getSnippet("html", camera, nodes.outline, options),
      svgFile(nodes, "filled", { gradient }),
    ]) {
      expect(out).toContain("linearGradient");
      expect(out).toMatch(/url\(#ikions-gradient-[a-z0-9]+\)/);
    }
    expect(jsxSnippet(camera, nodes.outline, options)).toContain('stopColor="#FF8AC2"');
  });

  it("uses a CSS gradient background for the mask technique", () => {
    const css = cssSnippet(camera, nodes.outline, options);
    expect(css).toContain("background: linear-gradient(90deg, #7C6CFF, #FF8AC2);");
    expect(/data:image\/svg\+xml,([^"]*)"/.exec(css)![1]).not.toContain("linearGradient");
  });

  it("ignores unsafe gradient colours", () => {
    const unsafe = { ...DEFAULT_OPTIONS, gradient: { from: '"><script>alert(1)</script>', to: "blue" } };
    for (const tab of SNIPPET_TABS) expect(getSnippet(tab.kind, camera, nodes.outline, unsafe), tab.kind).not.toContain("alert(1)");
  });
});

describe("export", () => {
  const icons = [
    { name: "home", nodes: iconNodes.home },
    { name: "search", nodes: iconNodes.search },
  ];

  it("names files predictably", () => {
    expect(svgFileName("home", "filled")).toBe("ikions-home-filled.svg");
    expect(pngFileName("home", "outline", 96)).toBe("ikions-home-outline-96px.png");
  });

  it("organises ZIP entries by variant", () => {
    expect(zipEntries(icons, "both").map((e) => e.path)).toEqual([
      "ikions-export/outline/home.svg",
      "ikions-export/outline/search.svg",
      "ikions-export/filled/home.svg",
      "ikions-export/filled/search.svg",
    ]);
    expect(zipEntries(icons, "filled").map((e) => e.path)).toEqual(["ikions-export/filled/home.svg", "ikions-export/filled/search.svg"]);
  });

  it("writes real SVG content, not previews", () => {
    const [entry] = zipEntries(icons, "outline");
    expect(entry!.content).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"[^>]*viewBox="0 0 24 24"/);
    expect(svgFile(iconNodes.home, "filled", { color: "#ff0000" })).toContain('fill="#ff0000"');
  });

  it("builds sprites with unique symbol ids", () => {
    const single = buildSprite(icons, "outline");
    expect(single.match(/<symbol /g)).toHaveLength(2);
    expect(single).toContain('id="ikions-home"');
    const both = buildSprite(icons, "both");
    expect(both).toContain('id="ikions-home"');
    expect(both).toContain('id="ikions-home-filled"');
    const ids = [...both.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("rate limiter", () => {
  it("allows up to the limit per window", () => {
    const check = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(check("a", 0).ok).toBe(true);
    expect(check("a", 1).ok).toBe(true);
    expect(check("a", 2).ok).toBe(false);
    expect(check("b", 2).ok).toBe(true);
    expect(check("a", 1001).ok).toBe(true);
  });

  it("bounds memory", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 3 });
    for (let i = 0; i < 10; i++) check(`k${i}`, 0);
    expect(check("k9", 0).ok).toBe(false);
  });
});
