import fs from "node:fs";
import path from "node:path";
import { CATEGORIES_FILE, COLLECTIONS_FILE, SOURCE } from "./paths.ts";
import { VARIANTS, type Category, type Collection, type IconMeta, type SourceIcon, type Variant } from "./schema.ts";

export interface LoadIssue {
  icon: string;
  message: string;
}

export interface LoadedCatalog {
  icons: SourceIcon[];
  categories: Category[];
  collections: Collection[];
  issues: LoadIssue[];
}

export function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

export function loadCatalog(sourceDir = SOURCE): LoadedCatalog {
  const issues: LoadIssue[] = [];
  const icons: SourceIcon[] = [];
  const dirs = fs
    .readdirSync(sourceDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  for (const dirName of dirs) {
    const dir = path.join(sourceDir, dirName);
    const metaFile = path.join(dir, "meta.json");
    if (!fs.existsSync(metaFile)) {
      issues.push({ icon: dirName, message: "missing meta.json" });
      continue;
    }
    let meta: IconMeta;
    try {
      meta = readJson<IconMeta>(metaFile);
    } catch (error) {
      issues.push({ icon: dirName, message: `meta.json is not valid JSON: ${(error as Error).message}` });
      continue;
    }
    const svg = {} as Record<Variant, string>;
    let complete = true;
    for (const variant of VARIANTS) {
      const file = path.join(dir, `${variant}.svg`);
      if (!fs.existsSync(file)) {
        issues.push({ icon: dirName, message: `missing ${variant}.svg` });
        complete = false;
        continue;
      }
      svg[variant] = fs.readFileSync(file, "utf8");
    }
    if (!complete) continue;
    if (meta.name !== dirName) {
      issues.push({ icon: dirName, message: `meta.name "${meta.name}" does not match folder name` });
    }
    icons.push({ meta, dir, svg });
  }

  const categories = readJson<Category[]>(CATEGORIES_FILE);
  const collections = fs.existsSync(COLLECTIONS_FILE) ? readJson<Collection[]>(COLLECTIONS_FILE) : [];
  return { icons, categories, collections, issues };
}
