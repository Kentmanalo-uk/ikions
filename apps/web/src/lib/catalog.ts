import { iconNodes, type IconName, type IconVariant, type IconVariants } from "@ikions/icons";
import {
  categories as allCategories,
  collections,
  createSearchIndex,
  icons,
  releases,
  synonyms,
  version,
  type CategoryMetadata,
  type IconMetadata,
} from "@ikions/metadata";

export type { CategoryMetadata, IconMetadata, IconName, IconVariant, IconVariants };
export { collections, icons, iconNodes, releases, version };

/** Categories that contain at least one published icon. */
export const categories: CategoryMetadata[] = allCategories.filter((c) => c.count > 0);
/** Categories defined in the roadmap that do not have published icons yet. */
export const plannedCategories: CategoryMetadata[] = allCategories.filter((c) => c.count === 0);

export const searchIndex = createSearchIndex(icons, allCategories, synonyms);

const iconMap = new Map(icons.map((icon) => [icon.name, icon]));
const categoryMap = new Map(allCategories.map((c) => [c.slug, c]));

export function getIcon(name: string): IconMetadata | undefined {
  return iconMap.get(name);
}

export function getCategory(slug: string): CategoryMetadata | undefined {
  return categoryMap.get(slug);
}

export function getCategoryIcons(slug: string): IconMetadata[] {
  return icons.filter((icon) => icon.category === slug);
}

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug);
}

export function getNodes(name: string): IconVariants | undefined {
  return (iconNodes as Record<string, IconVariants>)[name];
}

/** Metadata plus node data, for passing a few icons to client components. */
export function withNodes<T extends { name: string }>(list: T[]): (T & { nodes: IconVariants })[] {
  return list.flatMap((icon) => {
    const nodes = getNodes(icon.name);
    return nodes ? [{ ...icon, nodes }] : [];
  });
}

/** Related icons: shared tags and aliases first, then the same category. */
export function getRelatedIcons(icon: IconMetadata, limit = 12): IconMetadata[] {
  const terms = new Set([...icon.tags, ...icon.aliases, ...icon.name.split("-")]);
  return icons
    .filter((other) => other.name !== icon.name)
    .map((other) => {
      let score = other.category === icon.category ? 2 : 0;
      for (const term of [...other.tags, ...other.aliases, ...other.name.split("-")]) if (terms.has(term)) score += 3;
      return { other, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.other.name.localeCompare(b.other.name))
    .slice(0, limit)
    .map((entry) => entry.other);
}

/** Real numbers for the landing page, derived from the generated catalog. */
export const stats = {
  icons: icons.length,
  assets: icons.reduce((sum, icon) => sum + icon.variants.length, 0),
  variants: 2,
  categories: categories.length,
  integrations: ["React", "Vue", "Svelte", "SVG"] as const,
};
