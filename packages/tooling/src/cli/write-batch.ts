/**
 * Write a batch of icon sources from a definition module.
 *
 *   pnpm --filter @ikions/tooling exec tsx src/cli/write-batch.ts path/to/batch.mjs
 *
 * The module default-exports an array of:
 *   { name, title, category, description, tags, aliases, added?,
 *     outline: string[] | string, filled: string[] | string }
 * where outline/filled are the inner SVG elements. Root attributes are
 * applied from the design spec so every source file is canonical.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT, SOURCE } from "../paths.ts";
import { ROOT_ATTRS, VARIANTS, type IconMeta, type Variant } from "../schema.ts";

interface BatchEntry extends Omit<IconMeta, "variants" | "added"> {
  added?: string;
  outline: string[] | string;
  filled: string[] | string;
}

const file = process.argv[2];
if (!file) {
  console.error("usage: write-batch <batch.mjs> [--force]");
  process.exit(1);
}
const force = process.argv.includes("--force");
const mod = (await import(pathToFileURL(path.resolve(file)).href)) as { default: BatchEntry[] };

const root = (variant: Variant) =>
  Object.entries(ROOT_ATTRS[variant])
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");

// Concepts merged into another icon on review must never come back.
const handdrawn = JSON.parse(fs.readFileSync(path.join(ROOT, "assets", "plan", "handdrawn.json"), "utf8")) as { $dropped?: Record<string, string> };
const dropped = handdrawn.$dropped ?? {};

let written = 0;
for (const entry of mod.default) {
  if (entry.name in dropped) {
    console.log(`skip   ${entry.name} (dropped: ${dropped[entry.name]})`);
    continue;
  }
  const dir = path.join(SOURCE, entry.name);
  if (fs.existsSync(dir) && !force) {
    console.log(`skip   ${entry.name} (exists; use --force to overwrite)`);
    continue;
  }
  fs.mkdirSync(dir, { recursive: true });
  for (const variant of VARIANTS) {
    const raw = entry[variant];
    const lines = (Array.isArray(raw) ? raw : [raw]).map((l) => `  ${l.trim()}`);
    fs.writeFileSync(path.join(dir, `${variant}.svg`), `<svg ${root(variant)}>\n${lines.join("\n")}\n</svg>\n`);
  }
  const meta: IconMeta = {
    name: entry.name,
    title: entry.title,
    category: entry.category,
    description: entry.description,
    tags: entry.tags,
    aliases: entry.aliases ?? [],
    variants: [...VARIANTS],
    added: entry.added ?? "0.2.0",
  };
  fs.writeFileSync(path.join(dir, "meta.json"), `${JSON.stringify(meta, null, 2)}\n`);
  written++;
  console.log(`write  ${entry.name}`);
}
console.log(`\n${written} icon(s) written to ${SOURCE}`);
