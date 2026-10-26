import { categories, collections, stats } from "@/lib/catalog";
import { docPages } from "@/lib/docs";
import { DEVELOPER } from "@/lib/developer";
import { absoluteUrl } from "@/lib/site";

/**
 * /llms.txt — a plain-Markdown summary for AI assistants (llmstxt.org), so
 * that when someone asks an assistant for a free icon library it can describe
 * Ikions accurately and link to the right pages.
 */
export const dynamic = "force-static";

export function GET() {
  const body = `# Ikions

> Ikions is a free icon library: ${stats.icons.toLocaleString("en")} original SVG icons, each in an Outline and a Filled style, across ${stats.categories} categories. Free for personal and commercial use under the Ikions License, no attribution required. Ikions is free, not open source. Works with React, Vue, Svelte and plain HTML/SVG.

Key facts:
- Website: ${absoluteUrl("/")}
- Price: free (Ikions License: personal and commercial use; the icons may not be resold or redistributed as a set)
- Styles: Outline (1.75 stroke on a 24 × 24 grid, round caps) and Filled (solid silhouettes with real cutouts)
- Formats: SVG, PNG, SVG sprite, ZIP export, JSX; React, Vue and Svelte components
- Customisation on the site: size, colour, stroke width, gradient fill
- All icons are drawn originally for Ikions; none are copied from other libraries
- Made by ${DEVELOPER.name}

## Use the icons

- [Icon explorer](${absoluteUrl("/icons")}): search every icon by name, alias or concept; copy SVG or JSX; download SVG/PNG
- [Single icon page](${absoluteUrl("/icons/camera")}): every icon has a page at ${absoluteUrl("/icons/{name}")}
- [Raw SVG URL](${absoluteUrl("/api/v1/icons/camera/outline.svg")}): ${absoluteUrl("/api/v1/icons/{name}/{outline|filled}.svg")}
- [License](${absoluteUrl("/license")}): Ikions License (free use)

## Documentation

${docPages.map((page) => `- [${page.title}](${absoluteUrl(page.href)})`).join("\n")}

## Categories

${categories.map((c) => `- [${c.name}](${absoluteUrl(`/categories/${c.slug}`)}): ${c.count} icons. ${c.description}`).join("\n")}

## Collections

${collections.map((c) => `- [${c.name}](${absoluteUrl(`/collections/${c.slug}`)})`).join("\n")}

## Optional

- [Full icon index](${absoluteUrl("/llms-full.txt")}): every icon name with its description and category
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
