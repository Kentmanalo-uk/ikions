import { build } from "esbuild";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("tree shaking", () => {
  // Runs a real esbuild bundle; allow for a cold start under load.
  it("bundles only the imported icon", { timeout: 30_000 }, async () => {
    const result = await build({
      stdin: {
        contents: 'import { HomeIcon } from "./src/index.ts"; console.log(HomeIcon);',
        resolveDir: path.resolve(__dirname, ".."),
        loader: "ts",
      },
      bundle: true,
      write: false,
      format: "esm",
      minify: true,
      treeShaking: true,
      external: ["react"],
    });
    const code = result.outputFiles[0]!.text;
    expect(code).toContain('"home"');
    expect(code).not.toContain('"search"');
    expect(code).not.toContain('"camera"');
  });
});
