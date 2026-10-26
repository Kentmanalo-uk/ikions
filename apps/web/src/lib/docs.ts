export interface DocPage {
  href: string;
  title: string;
  description: string;
  /** Extra words for site search. */
  keywords: string[];
}

export interface DocSection {
  title: string;
  pages: DocPage[];
}

export const docsNav: DocSection[] = [
  {
    title: "Getting started",
    pages: [
      {
        href: "/docs",
        title: "Introduction",
        description: "What Ikions is, how the packages fit together and a quick start.",
        keywords: ["overview", "quick start", "packages", "variants", "outline", "filled"],
      },
      {
        href: "/docs/installation",
        title: "Installation",
        description: "Install the package for your framework with npm, pnpm, yarn or bun.",
        keywords: ["npm", "pnpm", "yarn", "bun", "install", "setup", "requirements"],
      },
    ],
  },
  {
    title: "Frameworks",
    pages: [
      {
        href: "/docs/react",
        title: "React",
        description: "Typed, tree-shakeable React components with variant, size, colour and stroke props.",
        keywords: ["react", "jsx", "tsx", "props", "forwardRef", "createIkion", "custom icon", "tree shaking"],
      },
      {
        href: "/docs/nextjs",
        title: "Next.js",
        description: "Using Ikions with the App Router, server components and static rendering.",
        keywords: ["next", "app router", "server components", "ssr", "server rendering", "rsc"],
      },
      {
        href: "/docs/vue",
        title: "Vue",
        description: "Vue 3 components with the same API as the React package.",
        keywords: ["vue", "vue3", "nuxt", "template", "script setup"],
      },
      {
        href: "/docs/svelte",
        title: "Svelte",
        description: "Svelte 5 components with the same API as the React package.",
        keywords: ["svelte", "svelte5", "sveltekit", "runes"],
      },
      {
        href: "/docs/html",
        title: "HTML & SVG",
        description: "Use raw SVG files, the sprite, or toSvg() without a framework.",
        keywords: ["html", "svg", "sprite", "use", "vanilla", "img", "download", "toSvg", "css mask"],
      },
    ],
  },
  {
    title: "Guides",
    pages: [
      {
        href: "/docs/styling",
        title: "Styling",
        description: "Variants, size, colour, stroke width and CSS techniques.",
        keywords: ["color", "colour", "size", "stroke width", "currentColor", "css", "tailwind", "variants", "class"],
      },
      {
        href: "/docs/accessibility",
        title: "Accessibility",
        description: "Decorative and meaningful icons, accessible names and focus.",
        keywords: ["a11y", "aria-hidden", "aria-label", "title", "screen reader", "wcag"],
      },
      {
        href: "/docs/api",
        title: "Metadata & API",
        description: "The metadata package, search engine and the public HTTP API.",
        keywords: ["metadata", "api", "json", "search", "http", "endpoint", "rest", "catalog"],
      },
    ],
  },
  {
    title: "Project",
    pages: [
      {
        href: "/docs/design",
        title: "Design principles",
        description: "The grid, stroke, corner and Filled-variant rules every icon follows.",
        keywords: ["design", "design spec", "grid", "stroke", "style", "quality"],
      },
      {
        href: "/docs/troubleshooting",
        title: "Troubleshooting",
        description: "Fixes for common integration problems.",
        keywords: ["error", "problem", "issue", "faq", "not showing", "colour wrong"],
      },
    ],
  },
];

export const docPages: DocPage[] = docsNav.flatMap((section) => section.pages);
