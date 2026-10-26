export type IconVariant = "outline" | "filled";

/** A flat SVG child element: [tagName, attributes]. */
export type IconNode = readonly [tag: string, attrs: Readonly<Record<string, string>>];

export interface IconVariants {
  outline: readonly IconNode[];
  filled: readonly IconNode[];
}
