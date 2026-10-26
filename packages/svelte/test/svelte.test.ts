import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";
import { beforeAll, describe, expect, it } from "vitest";

const src = path.resolve(__dirname, "../src");
const iconDir = path.join(src, "icons");
// Compile inside the package so compiled modules can resolve "svelte".
const out = path.resolve(__dirname, "../.test-out");
fs.rmSync(out, { recursive: true, force: true });

/** Compile a component for SSR into the temp dir, rewriting .svelte imports. */
function compileTo(file: string, target: string) {
  const source = fs.readFileSync(file, "utf8");
  const { js } = compile(source, { filename: file, generate: "server" });
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, js.code.replace(/\.svelte(["'])/g, ".svelte.js$1"));
}

beforeAll(() => {
  compileTo(path.join(src, "Ikion.svelte"), path.join(out, "Ikion.svelte.js"));
  fs.copyFileSync(path.join(src, "gradient.js"), path.join(out, "gradient.js"));
  for (const file of ["HomeIcon.svelte", "SearchIcon.svelte"]) {
    compileTo(path.join(iconDir, file), path.join(out, "icons", `${file}.js`));
  }
});

async function load(name: string) {
  return (await import(pathToFileURL(path.join(out, "icons", `${name}.svelte.js`)).href)).default;
}

describe("@ikions/svelte", () => {
  it("compiles every generated component (client and server)", () => {
    const files = fs.readdirSync(iconDir).filter((f) => f.endsWith(".svelte"));
    expect(files.length).toBeGreaterThan(0);
    for (const file of [...files.map((f) => path.join(iconDir, f)), path.join(src, "Ikion.svelte")]) {
      const source = fs.readFileSync(file, "utf8");
      expect(() => compile(source, { filename: file, generate: "client" }), file).not.toThrow();
      expect(() => compile(source, { filename: file, generate: "server" }), file).not.toThrow();
    }
  }, 60_000); // compiles ~1,900 components twice; slow under parallel CI load

  it("exports every icon from the index", () => {
    const index = fs.readFileSync(path.join(src, "index.js"), "utf8");
    const files = fs.readdirSync(iconDir).filter((f) => f.endsWith(".svelte"));
    for (const file of files) expect(index).toContain(`./icons/${file}`);
  });

  it("renders outline by default", async () => {
    const { body } = render(await load("HomeIcon"));
    expect(body).toContain('data-variant="outline"');
    expect(body).toContain('stroke-width="1.75"');
    expect(body).toContain('aria-hidden="true"');
  });

  it("renders filled with props and a title", async () => {
    const { body } = render(await load("SearchIcon"), {
      props: { variant: "filled", size: 32, color: "#5555E8", title: "Search" },
    });
    expect(body).toContain('data-variant="filled"');
    expect(body).toContain('width="32"');
    expect(body).toContain('color="#5555E8"');
    expect(body).toContain('role="img"');
    expect(body).toContain("<title>Search</title>");
  });

  it("renders gradients", async () => {
    const { body } = render(await load("HomeIcon"), { props: { gradient: { from: "#7C6CFF", to: "#FF8AC2" } } });
    expect(body).toMatch(/stroke="url\(#ikions-gradient-[a-z0-9]+\)"/);
    expect(body).toContain('stop-color="#7C6CFF"');
  });
});
