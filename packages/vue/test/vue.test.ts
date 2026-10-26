import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";
import { HomeIcon, SearchIcon } from "../src/index.js";

const render = (component: unknown, props: Record<string, unknown> = {}) =>
  renderToString(createSSRApp({ render: () => h(component as never, props) }));

describe("@ikions/vue", () => {
  it("renders outline by default", async () => {
    const html = await render(HomeIcon);
    expect(html).toContain('data-variant="outline"');
    expect(html).toContain('stroke-width="1.75"');
    expect(html).toContain('aria-hidden="true"');
  });

  it("renders filled with props", async () => {
    const html = await render(SearchIcon, { variant: "filled", size: 32, color: "#5555E8", class: "x" });
    expect(html).toContain('data-variant="filled"');
    expect(html).toContain('width="32"');
    expect(html).toContain('color="#5555E8"');
    expect(html).toContain("ikion ikion-search x");
  });

  it("labels the icon when a title is set", async () => {
    const html = await render(SearchIcon, { title: "Search" });
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Search"');
    expect(html).toContain("<title>Search</title>");
  });

  it("renders gradients", async () => {
    const html = await render(HomeIcon, { gradient: { from: "#7C6CFF", to: "#FF8AC2" } });
    expect(html).toMatch(/stroke="url\(#ikions-gradient-[a-z0-9]+\)"/);
    expect(html).toContain('stop-color="#FF8AC2"');
  });
});
