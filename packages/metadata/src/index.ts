import { categories, collections, icons } from "./generated/data.js";
import type { CategoryMetadata, IconMetadata } from "./types.js";

export { categories, collections, icons, releases, synonyms, version } from "./generated/data.js";
export { createSearchIndex, normalizeQuery, type SearchIndex, type SearchOptions, type SearchResult } from "./search.js";
export type { CategoryMetadata, CollectionMetadata, IconMetadata, IconVariant, ReleaseMetadata } from "./types.js";

const byName = new Map(icons.map((icon) => [icon.name, icon]));

/** Look up an icon by canonical name or alias. */
export function getIcon(nameOrAlias: string): IconMetadata | undefined {
  const direct = byName.get(nameOrAlias);
  if (direct) return direct;
  return icons.find((icon) => icon.aliases.includes(nameOrAlias));
}

export function getCategory(slug: string): CategoryMetadata | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getIconsByCategory(slug: string): IconMetadata[] {
  return icons.filter((icon) => icon.category === slug);
}

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug);
}

/** Categories that currently contain at least one published icon. */
export function getPublishedCategories(): CategoryMetadata[] {
  return categories.filter((c) => c.count > 0);
}
