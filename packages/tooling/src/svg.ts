import { parseSync, type INode } from "svgson";
import { ROOT_ATTRS, type IconNode, type Variant } from "./schema.ts";

export interface ParsedSvg {
  root: INode;
  children: INode[];
}

export function parseSvg(source: string): ParsedSvg {
  const root = parseSync(source, { camelcase: false });
  // svgson keeps whitespace text nodes; drop them.
  const children = root.children.filter((c) => !(c.type === "text" && c.value.trim() === ""));
  return { root, children };
}

/** Convert parsed children to the flat node format used by all packages. */
export function toNodes(children: INode[]): IconNode[] {
  return children.map((child) => [child.name, { ...child.attributes }]);
}

const escapeAttr = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export function nodesToMarkup(nodes: IconNode[]): string {
  return nodes
    .map(([tag, attrs]) => {
      const attrText = Object.entries(attrs)
        .map(([k, v]) => `${k}="${escapeAttr(v)}"`)
        .join(" ");
      return `<${tag} ${attrText}/>`;
    })
    .join("");
}

/** Serialize a variant's nodes as a canonical, standalone SVG document. */
export function nodesToSvg(variant: Variant, nodes: IconNode[], pretty = false): string {
  const rootAttrs = Object.entries(ROOT_ATTRS[variant])
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
  if (!pretty) return `<svg ${rootAttrs}>${nodesToMarkup(nodes)}</svg>`;
  const body = nodes.map((n) => `  ${nodesToMarkup([n])}`).join("\n");
  return `<svg ${rootAttrs}>\n${body}\n</svg>\n`;
}
