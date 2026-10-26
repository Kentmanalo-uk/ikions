import { describe, expect, it } from "vitest";
import { loadCatalog } from "../src/catalog.ts";
import { compareHashes, readBaseline, renderHashes } from "../src/visual.ts";

describe("visual regression", () => {
  it("renders every icon identically to the approved baseline", () => {
    const baseline = readBaseline();
    expect(baseline, "missing tests/visual/baseline.json — run pnpm icons:visual --update after review").not.toBeNull();
    const diff = compareHashes(baseline!, renderHashes(loadCatalog()));
    expect(diff).toEqual({ changed: [], added: [], removed: [] });
  });

  it("detects geometry changes", () => {
    const diff = compareHashes({ "a/outline@16": "1", "b/filled@16": "2" }, { "a/outline@16": "9", "c/filled@16": "3" });
    expect(diff).toEqual({ changed: ["a/outline@16"], added: ["c/filled@16"], removed: ["b/filled@16"] });
  });
});
