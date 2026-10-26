export type IconVariant = "outline" | "filled";

export interface IconMetadata {
  /** Canonical kebab-case name, e.g. `arrow-up-right`. */
  name: string;
  /** Human readable title, e.g. `Arrow Up Right`. */
  title: string;
  /** Component export name in framework packages, e.g. `ArrowUpRightIcon`. */
  component: string;
  /** Category slug. */
  category: string;
  description: string;
  tags: string[];
  aliases: string[];
  variants: IconVariant[];
  /** Library version that first published this icon. */
  added: string;
}

export interface CategoryMetadata {
  slug: string;
  name: string;
  description: string;
  /** Number of published icons in this category. */
  count: number;
}

export interface CollectionMetadata {
  slug: string;
  name: string;
  description: string;
  icons: string[];
}

export interface ReleaseMetadata {
  version: string;
  date: string | null;
  status: "released" | "unreleased";
  summary: string;
  notes: string[];
}
