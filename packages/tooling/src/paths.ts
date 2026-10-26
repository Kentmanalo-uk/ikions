import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.resolve(here, "../../..");
export const ASSETS = path.join(ROOT, "assets");
export const SOURCE = path.join(ASSETS, "source");
export const CATEGORIES_FILE = path.join(ASSETS, "categories.json");
export const COLLECTIONS_FILE = path.join(ASSETS, "collections.json");
export const RELEASES_FILE = path.join(ASSETS, "releases.json");
export const PACKAGES = path.join(ROOT, "packages");
export const REVIEW = path.join(ROOT, "review");
