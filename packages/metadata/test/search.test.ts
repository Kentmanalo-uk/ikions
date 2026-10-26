import { describe, expect, it } from "vitest";
import { categories, createSearchIndex, getIcon, icons, normalizeQuery, synonyms } from "../src/index.js";
import type { IconMetadata } from "../src/types.js";

const fixture = (name: string, extra: Partial<IconMetadata> = {}): IconMetadata => ({
  name,
  title: name,
  component: `${name}Icon`,
  category: "interface",
  description: `The ${name} icon.`,
  tags: [],
  aliases: [],
  variants: ["outline", "filled"],
  added: "0.1.0",
  ...extra,
});

const sample = [
  fixture("trash", { aliases: ["delete", "bin"], tags: ["remove", "garbage"] }),
  fixture("eraser", { category: "editing", tags: ["delete", "rubber"] }),
  fixture("chat", { category: "communication", tags: ["message", "conversation"], description: "Open a conversation." }),
  fixture("mail", { category: "communication", aliases: ["email"], tags: ["envelope", "inbox"] }),
  fixture("wallet", { category: "finance", tags: ["money", "pay"] }),
  fixture("credit-card", { category: "finance", tags: ["card", "pay"] }),
  fixture("receipt", { category: "commerce", tags: ["invoice", "bill"] }),
  fixture("search", { aliases: ["find"], tags: ["magnifier"] }),
  fixture("search-plus", { tags: ["zoom in"] }),
];
const index = createSearchIndex(sample, [{ slug: "finance", name: "Finance & Business" }], {
  payment: ["wallet", "credit-card", "receipt"],
  message: ["chat", "mail"],
});
const names = (q: string, category?: string) => index.search(q, { category }).map((r) => r.icon.name);

describe("search ranking", () => {
  it("ranks the exact canonical name first", () => {
    expect(names("search")[0]).toBe("search");
  });

  it("ranks exact aliases above keyword matches", () => {
    const result = names("delete");
    expect(result[0]).toBe("trash");
    expect(result).toContain("eraser");
  });

  it("matches prefixes", () => {
    expect(names("sea")).toEqual(["search", "search-plus"]);
  });

  it("expands synonyms", () => {
    expect(names("payment")).toEqual(expect.arrayContaining(["wallet", "credit-card", "receipt"]));
    expect(names("message")).toEqual(expect.arrayContaining(["chat", "mail"]));
  });

  it("requires every word of a multi-word query to match", () => {
    expect(names("credit card")).toEqual(["credit-card"]);
  });

  it("filters by category", () => {
    expect(names("", "finance")).toEqual(["credit-card", "wallet"]);
  });

  it("matches category names", () => {
    expect(names("finance")).toEqual(expect.arrayContaining(["wallet", "credit-card"]));
  });

  it("tolerates small typos", () => {
    expect(names("wallte")).toContain("wallet");
  });

  it("returns everything for an empty query and nothing for nonsense", () => {
    expect(names("")).toHaveLength(sample.length);
    expect(names("zzzzqqq")).toEqual([]);
  });

  it("normalizes unsafe input", () => {
    expect(normalizeQuery("  <script>Trash!</script> ")).toBe("script trash script");
    expect(normalizeQuery("x".repeat(500))).toHaveLength(100);
  });
});

describe("published metadata", () => {
  const live = createSearchIndex(icons, categories, synonyms);

  it("has unique names and complete variants", () => {
    expect(new Set(icons.map((i) => i.name)).size).toBe(icons.length);
    for (const icon of icons) expect(icon.variants).toEqual(["outline", "filled"]);
  });

  it("counts category icons correctly", () => {
    for (const c of categories) expect(c.count).toBe(icons.filter((i) => i.category === c.slug).length);
  });

  it("finds trash for 'trash' and 'delete'", () => {
    expect(live.search("trash")[0]?.icon.name).toBe("trash");
    expect(live.search("delete")[0]?.icon.name).toBe("trash");
  });

  it("resolves aliases with getIcon", () => {
    expect(getIcon("magnifying-glass")?.name).toBe("search");
  });
});
