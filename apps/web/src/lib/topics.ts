/**
 * Landing pages for the searches people make when looking for an icon
 * library ("free react icons", "free svg icons"…). Each has its own copy,
 * example and popular icons, so it is a useful page in its own right.
 */
import type { LanguageName } from "sugar-high";

export interface Topic {
  slug: "react-icons" | "vue-icons" | "svelte-icons" | "svg-icons";
  framework: string;
  title: string;
  heading: string;
  intro: string;
  steps: string[];
  example: { label: string; lang: LanguageName; code: string };
  docs: { href: string; label: string };
}

export const TOPICS: Topic[] = [
  {
    slug: "react-icons",
    framework: "React",
    title: "Free React Icons — SVG Icon Components (Outline & Filled)",
    heading: "Free React icons",
    intro:
      "Original, MIT-licensed icons for React and Next.js. Every icon comes in Outline and Filled, renders as accessible inline SVG, and accepts size, colour, variant, stroke width and any SVG attribute.",
    steps: [
      "Find an icon in the explorer by name or concept.",
      "Pick Outline or Filled and adjust size, colour, stroke or gradient.",
      "Copy JSX into your component, or import it from @ikions/react.",
    ],
    example: {
      label: "Toolbar.tsx",
      lang: "javascript",
      code: `import { SearchIcon, BellIcon, UserIcon } from "@ikions/react";

export function Toolbar() {
  return (
    <nav className="toolbar">
      <SearchIcon size={20} />
      <BellIcon size={20} variant="filled" title="Notifications" />
      <UserIcon size={20} strokeWidth={1.5} />
    </nav>
  );
}`,
    },
    docs: { href: "/docs/react", label: "React guide" },
  },
  {
    slug: "vue-icons",
    framework: "Vue",
    title: "Free Vue Icons — SVG Icon Components for Vue 3 (Outline & Filled)",
    heading: "Free Vue icons",
    intro:
      "Original, MIT-licensed icons for Vue 3 and Nuxt. Each icon is a typed component in Outline and Filled that renders inline SVG and takes size, colour, variant and stroke width props.",
    steps: [
      "Search the explorer for the icon you need.",
      "Choose Outline or Filled and tune the size and colour.",
      "Copy the SVG into your template, or import the component from @ikions/vue.",
    ],
    example: {
      label: "AppHeader.vue",
      lang: "javascript",
      code: `<script setup>
import { SearchIcon, BellIcon } from "@ikions/vue";
</script>

<template>
  <header class="app-header">
    <SearchIcon :size="20" />
    <BellIcon :size="20" variant="filled" title="Notifications" />
  </header>
</template>`,
    },
    docs: { href: "/docs/vue", label: "Vue guide" },
  },
  {
    slug: "svelte-icons",
    framework: "Svelte",
    title: "Free Svelte Icons — SVG Icon Components for Svelte 5 (Outline & Filled)",
    heading: "Free Svelte icons",
    intro:
      "Original, MIT-licensed icons for Svelte 5 and SvelteKit. Every icon comes in Outline and Filled as a lightweight component with size, colour, variant and stroke width props.",
    steps: [
      "Browse or search the icon explorer.",
      "Pick a style and adjust it to match your design.",
      "Copy the SVG into your markup, or import the component from @ikions/svelte.",
    ],
    example: {
      label: "Nav.svelte",
      lang: "javascript",
      code: `<script>
  import { HomeIcon, SearchIcon } from "@ikions/svelte";
</script>

<nav>
  <HomeIcon size={20} />
  <SearchIcon size={20} variant="filled" title="Search" />
</nav>`,
    },
    docs: { href: "/docs/svelte", label: "Svelte guide" },
  },
  {
    slug: "svg-icons",
    framework: "SVG",
    title: "Free SVG Icons — Download Outline & Filled SVG and PNG",
    heading: "Free SVG icons",
    intro:
      "Download original SVG icons for websites, apps, slides and design tools. Every icon is drawn on a 24 × 24 grid, comes in Outline and Filled, and is free to use under the MIT License.",
    steps: [
      "Search the explorer by name or concept, like “payment” or “weather”.",
      "Set the size, colour, stroke width or a gradient.",
      "Copy the SVG, download SVG or PNG, or export a selection as a ZIP or sprite.",
    ],
    example: {
      label: "index.html",
      lang: "javascript",
      code: `<!-- Link a hosted SVG… -->
<img src="https://www.ikions.cloud/api/v1/icons/camera/outline.svg" width="24" height="24" alt="Camera" />

<!-- …or paste it inline so it follows the text colour -->
<button>
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><!-- copied icon paths --></svg>
  Take photo
</button>`,
    },
    docs: { href: "/docs/html", label: "Plain HTML & SVG guide" },
  },
];

/** Recognisable everyday icons shown on every landing page. */
export const POPULAR_ICONS = [
  "home", "search", "user", "settings", "bell", "mail", "chat", "heart", "star", "camera", "image", "play",
  "calendar", "clock", "map-pin", "cart", "wallet", "credit-card", "file", "folder", "cloud", "download", "upload", "trash",
  "edit", "check", "x", "plus", "arrow-right", "arrow-left", "menu", "lock", "key", "shield-check", "sun", "moon",
];
