import type { MDXComponents } from "mdx/types";
import { docsComponents } from "@/components/docs/mdx";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...docsComponents, ...components };
}
