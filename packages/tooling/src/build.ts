import fs from "node:fs";
import path from "node:path";
import { loadCatalog, readJson, type LoadedCatalog } from "./catalog.ts";
import { componentName, GENERATED_HEADER } from "./generate/names.ts";
import { optimizeVariant } from "./optimize.ts";
import { ASSETS, PACKAGES, RELEASES_FILE } from "./paths.ts";
import { VARIANTS, type BuiltIcon, type IconNode, type Variant } from "./schema.ts";
import { nodesToSvg } from "./svg.ts";
import { validateCatalog, type ValidationIssue } from "./validate.ts";

export interface Release {
  version: string;
  date: string | null;
  status: "released" | "unreleased";
  summary: string;
  notes: string[];
}

export interface BuildResult {
  icons: BuiltIcon[];
  issues: ValidationIssue[];
  skipped: string[];
}

const json = (value: unknown) => JSON.stringify(value);

function writeFile(file: string, content: string | Buffer) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function emptyDir(dir: string) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

/** Validate, optimize and return the publishable icons. */
export function buildIcons(catalog: LoadedCatalog, { skipInvalid = false } = {}): BuildResult {
  const issues = validateCatalog(catalog);
  const invalid = new Set(issues.filter((i) => i.severity === "error").map((i) => i.icon));
  if (invalid.size > 0 && !skipInvalid) return { icons: [], issues, skipped: [...invalid] };

  const icons: BuiltIcon[] = [];
  for (const source of catalog.icons) {
    if (invalid.has(source.meta.name)) continue;
    const svg = {} as Record<Variant, string>;
    const nodes = {} as Record<Variant, IconNode[]>;
    for (const variant of VARIANTS) {
      const optimized = optimizeVariant(source.svg[variant], variant);
      svg[variant] = optimized.svg;
      nodes[variant] = optimized.nodes;
    }
    icons.push({ meta: source.meta, svg, nodes });
  }
  icons.sort((a, b) => a.meta.name.localeCompare(b.meta.name));
  return { icons, issues, skipped: [...invalid] };
}

/** @ikions/icons — standalone SVG files, sprites and a JS node map. */
export function writeIconsPackage(icons: BuiltIcon[]) {
  const pkg = path.join(PACKAGES, "icons");
  for (const variant of VARIANTS) {
    emptyDir(path.join(pkg, variant));
    for (const icon of icons) {
      writeFile(path.join(pkg, variant, `${icon.meta.name}.svg`), nodesToSvg(variant, icon.nodes[variant], true));
    }
    const symbols = icons
      .map((icon) => {
        const body = nodesToSvg(variant, icon.nodes[variant])
          .replace(/^<svg [^>]*>/, "")
          .replace(/<\/svg>$/, "");
        const paint = variant === "outline"
          ? `fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"`
          : `fill="currentColor"`;
        return `  <symbol id="ikions-${icon.meta.name}" viewBox="0 0 24 24" ${paint}>${body}</symbol>`;
      })
      .join("\n");
    writeFile(
      path.join(pkg, "sprite", `${variant}.svg`),
      `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${symbols}\n</svg>\n`,
    );
  }

  const names = icons.map((i) => i.meta.name);
  const nodeEntries = icons
    .map((icon) => `  ${json(icon.meta.name)}: { outline: ${json(icon.nodes.outline)}, filled: ${json(icon.nodes.filled)} },`)
    .join("\n");
  writeFile(
    path.join(pkg, "src", "generated", "nodes.ts"),
    `${GENERATED_HEADER}import type { IconVariants } from "../types.js";\n\n` +
      `export const iconNames = ${json(names)} as const;\n\n` +
      `export type IconName = (typeof iconNames)[number];\n\n` +
      `export const iconNodes: Record<IconName, IconVariants> = {\n${nodeEntries}\n};\n`,
  );

  // One module per icon (`@ikions/icons/nodes/<name>`), so browser code can
  // render a single icon with nodesToSvg() without bundling the whole map.
  const perIcon = path.join(pkg, "src", "generated", "icons");
  emptyDir(perIcon);
  for (const icon of icons) {
    writeFile(
      path.join(perIcon, `${icon.meta.name}.ts`),
      `${GENERATED_HEADER}import type { IconVariants } from "../../types.js";\n\n` +
        `const icon: IconVariants = { outline: ${json(icon.nodes.outline)}, filled: ${json(icon.nodes.filled)} };\n\nexport default icon;\n`,
    );
  }
}

/** @ikions/metadata — searchable metadata, categories, collections and releases. */
export function writeMetadataPackage(icons: BuiltIcon[], catalog: LoadedCatalog, version: string) {
  const pkg = path.join(PACKAGES, "metadata");
  const published = new Set(icons.map((i) => i.meta.name));
  const meta = icons.map(({ meta: m }) => ({
    name: m.name,
    title: m.title,
    component: componentName(m.name),
    category: m.category,
    description: m.description,
    tags: m.tags,
    aliases: m.aliases,
    variants: m.variants,
    added: m.added,
  }));
  const categories = catalog.categories.map((c) => ({
    ...c,
    count: icons.filter((i) => i.meta.category === c.slug).length,
  }));
  const collections = catalog.collections
    .map((c) => ({ ...c, icons: c.icons.filter((n) => published.has(n)) }))
    .filter((c) => c.icons.length > 0);
  const synonymsFile = path.join(ASSETS, "synonyms.json");
  const synonyms = fs.existsSync(synonymsFile) ? readJson<Record<string, string[]>>(synonymsFile) : {};
  const releases = fs.existsSync(RELEASES_FILE) ? readJson<Release[]>(RELEASES_FILE) : [];

  writeFile(
    path.join(pkg, "src", "generated", "data.ts"),
    `${GENERATED_HEADER}import type { CategoryMetadata, CollectionMetadata, IconMetadata, ReleaseMetadata } from "../types.js";\n\n` +
      `export const version = ${json(version)};\n\n` +
      `export const icons: IconMetadata[] = ${JSON.stringify(meta, null, 1)};\n\n` +
      `export const categories: CategoryMetadata[] = ${JSON.stringify(categories, null, 1)};\n\n` +
      `export const collections: CollectionMetadata[] = ${JSON.stringify(collections, null, 1)};\n\n` +
      `export const synonyms: Record<string, string[]> = ${JSON.stringify(synonyms, null, 1)};\n\n` +
      `export const releases: ReleaseMetadata[] = ${JSON.stringify(releases, null, 1)};\n`,
  );
  writeFile(
    path.join(pkg, "icons.json"),
    `${JSON.stringify({ version, count: meta.length, icons: meta }, null, 2)}\n`,
  );
}

const camelize = (nodes: IconNode[]): IconNode[] =>
  nodes.map(([tag, attrs]) => [
    tag,
    Object.fromEntries(Object.entries(attrs).map(([k, v]) => [k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()), v])),
  ]);

/** @ikions/react — one tree-shakeable module per icon (attributes camelCased for React). */
export function writeReactPackage(icons: BuiltIcon[]) {
  const dir = path.join(PACKAGES, "react", "src", "icons");
  emptyDir(dir);
  for (const icon of icons) {
    const name = componentName(icon.meta.name);
    writeFile(
      path.join(dir, `${icon.meta.name}.ts`),
      `${GENERATED_HEADER}import { createIkion } from "../create-ikion.js";\n\n` +
        `/** ${icon.meta.title} — ${icon.meta.description} */\n` +
        `export const ${name} = createIkion(${json(icon.meta.name)}, ${json(name)}, {\n` +
        `  outline: ${json(camelize(icon.nodes.outline))},\n  filled: ${json(camelize(icon.nodes.filled))},\n});\n\n` +
        `export default ${name};\n`,
    );
  }
  writeFile(
    path.join(PACKAGES, "react", "src", "index.ts"),
    `${GENERATED_HEADER}export { createIkion } from "./create-ikion.js";\n` +
      `export type { IkionGradient, IkionProps, IkionVariant, IkionComponent, IkionNode } from "./types.js";\n\n` +
      icons.map((i) => `export { ${componentName(i.meta.name)} } from "./icons/${i.meta.name}.js";`).join("\n") +
      "\n",
  );
}

/** @ikions/vue — Vue 3 render-function components. */
export function writeVuePackage(icons: BuiltIcon[]) {
  const dir = path.join(PACKAGES, "vue", "src", "icons");
  emptyDir(dir);
  for (const icon of icons) {
    const name = componentName(icon.meta.name);
    writeFile(
      path.join(dir, `${icon.meta.name}.ts`),
      `${GENERATED_HEADER}import { createIkion } from "../create-ikion.js";\n\n` +
        `/** ${icon.meta.title} — ${icon.meta.description} */\n` +
        `export const ${name} = createIkion(${json(icon.meta.name)}, ${json(name)}, {\n` +
        `  outline: ${json(icon.nodes.outline)},\n  filled: ${json(icon.nodes.filled)},\n});\n\n` +
        `export default ${name};\n`,
    );
  }
  writeFile(
    path.join(PACKAGES, "vue", "src", "index.ts"),
    `${GENERATED_HEADER}export { createIkion } from "./create-ikion.js";\n` +
      `export type { IkionGradient, IkionProps, IkionVariant, IkionNode } from "./types.js";\n\n` +
      icons.map((i) => `export { ${componentName(i.meta.name)} } from "./icons/${i.meta.name}.js";`).join("\n") +
      "\n",
  );
}

/** @ikions/svelte — Svelte 5 components that wrap the shared Ikion base. */
export function writeSveltePackage(icons: BuiltIcon[]) {
  const pkg = path.join(PACKAGES, "svelte");
  const dir = path.join(pkg, "src", "icons");
  emptyDir(dir);
  for (const icon of icons) {
    const name = componentName(icon.meta.name);
    writeFile(
      path.join(dir, `${name}.svelte`),
      `<!-- This file is generated by @ikions/tooling. Do not edit by hand. -->\n` +
        `<script lang="ts">\n  import Ikion from "../Ikion.svelte";\n  import type { IkionProps } from "../types.js";\n\n` +
        `  const nodes = {\n    outline: ${json(icon.nodes.outline)},\n    filled: ${json(icon.nodes.filled)},\n  } as const;\n\n` +
        `  let props: IkionProps = $props();\n</script>\n\n` +
        `<Ikion {...props} iconName=${json(icon.meta.name)} {nodes} />\n`,
    );
  }
  writeFile(
    path.join(pkg, "src", "index.js"),
    `${GENERATED_HEADER}export { default as Ikion } from "./Ikion.svelte";\n` +
      icons.map((i) => `export { default as ${componentName(i.meta.name)} } from "./icons/${componentName(i.meta.name)}.svelte";`).join("\n") +
      "\n",
  );
  writeFile(
    path.join(pkg, "src", "index.d.ts"),
    `${GENERATED_HEADER}import type { Component } from "svelte";\nimport type { IkionProps } from "./types.js";\n\n` +
      `export type { IkionGradient, IkionProps, IkionVariant } from "./types.js";\n` +
      `export declare const Ikion: Component<IkionProps & { iconName: string; nodes: Record<"outline" | "filled", ReadonlyArray<readonly [string, Record<string, string>]>> }>;\n` +
      icons.map((i) => `export declare const ${componentName(i.meta.name)}: Component<IkionProps>;`).join("\n") +
      "\n",
  );
}

export function readVersion(): string {
  const releases = fs.existsSync(RELEASES_FILE) ? readJson<Release[]>(RELEASES_FILE) : [];
  return releases[0]?.version ?? "0.0.0";
}

export function buildAll({ skipInvalid = false } = {}) {
  const catalog = loadCatalog();
  const result = buildIcons(catalog, { skipInvalid });
  if (result.icons.length === 0) return result;
  const version = readVersion();
  writeIconsPackage(result.icons);
  writeMetadataPackage(result.icons, catalog, version);
  writeReactPackage(result.icons);
  writeVuePackage(result.icons);
  writeSveltePackage(result.icons);
  return result;
}
