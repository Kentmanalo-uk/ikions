export const VARIANTS = ["outline", "filled"] as const;
export type Variant = (typeof VARIANTS)[number];

/** A flat SVG child element: [tagName, attributes]. */
export type IconNode = [tag: string, attrs: Record<string, string>];

export interface IconMeta {
  name: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  aliases: string[];
  variants: Variant[];
  added: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
}

export interface Collection {
  slug: string;
  name: string;
  description: string;
  icons: string[];
}

export interface SourceIcon {
  meta: IconMeta;
  dir: string;
  svg: Record<Variant, string>;
}

export interface BuiltIcon {
  meta: IconMeta;
  svg: Record<Variant, string>;
  nodes: Record<Variant, IconNode[]>;
}

/** Icon names become component names, so they must start with a letter. */
export const NAME_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
export const ALIAS_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

export const ROOT_ATTRS: Record<Variant, Record<string, string>> = {
  outline: {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "1.75",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  filled: {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "currentColor",
  },
};

export const DEFAULT_STROKE_WIDTH = 1.75;
