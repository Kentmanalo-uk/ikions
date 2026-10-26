import type { IconVariants } from "@ikions/icons";
import { getNodes } from "@/lib/catalog";
import { NodeIcon, type NodeIconProps } from "./node-icon";

export interface IkIconProps extends Omit<NodeIconProps, "nodes"> {
  /** Published icon name. */
  name?: string;
  nodes?: IconVariants;
}

/**
 * Renders a catalog icon by name. This imports the whole catalog, so use it in
 * server components or catalog-heavy client views (the explorer). Elsewhere use
 * NodeIcon with props from the server, or an @ikions/react component.
 */
export function IkIcon({ name, nodes, ...rest }: IkIconProps) {
  const data = nodes ?? (name ? getNodes(name) : undefined);
  return data ? <NodeIcon nodes={data} {...rest} /> : null;
}
