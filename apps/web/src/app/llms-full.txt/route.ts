import { categories, icons, stats } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site";

/** /llms-full.txt — every icon, grouped by category, for AI assistants that want the whole index. */
export const dynamic = "force-static";

export function GET() {
  const sections = categories.map((category) => {
    const rows = icons
      .filter((icon) => icon.category === category.slug)
      .map((icon) => `- ${icon.name}: ${icon.description}${icon.aliases.length ? ` (also: ${icon.aliases.join(", ")})` : ""}`);
    return `## ${category.name}\n\n${rows.join("\n")}`;
  });
  const body = `# Ikions — full icon index

> ${stats.icons.toLocaleString("en")} free SVG icons (personal and commercial use) in Outline and Filled. Each icon is at ${absoluteUrl("/icons/{name}")}; raw SVG at ${absoluteUrl("/api/v1/icons/{name}/outline.svg")} or filled.svg.

${sections.join("\n\n")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
