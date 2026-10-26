/**
 * Landing pages for the searches people make when looking for an icon
 * library ("free react icons", "free svg icons"…). Each has its own copy,
 * example and popular icons, so it is a useful page in its own right.
 */
import type { LanguageName } from "sugar-high";

export interface Topic {
  slug: "react-icons" | "nextjs-icons" | "vue-icons" | "svelte-icons" | "tailwind-icons" | "svg-icons";
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
    title: "Free React Icons (SVG Components)",
    heading: "Free React icons",
    intro:
      "Original icons for React and Next.js. Each one renders accessible SVG and takes size, colour and stroke props.",
    steps: [
      "Find an icon in the explorer by name or concept.",
      "Adjust the size, colour or stroke.",
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
    slug: "nextjs-icons",
    framework: "Next.js",
    title: "Free Next.js Icons (Server Component Ready)",
    heading: "Free Next.js icons",
    intro: "Original icons for Next.js. They render as plain SVG in Server Components, so no extra JavaScript reaches the browser.",
    steps: [
      "Find an icon in the explorer.",
      "Adjust the size, colour or stroke.",
      "Import it from @ikions/react in any page, layout or component.",
    ],
    example: {
      label: "app/page.tsx",
      lang: "javascript",
      code: `import { SearchIcon, ArrowRightIcon } from "@ikions/react";

// A Server Component: the icons render to SVG on the server.
export default function Page() {
  return (
    <a href="/search" className="link">
      <SearchIcon size={18} />
      Search
      <ArrowRightIcon size={16} />
    </a>
  );
}`,
    },
    docs: { href: "/docs/nextjs", label: "Next.js guide" },
  },
  {
    slug: "vue-icons",
    framework: "Vue",
    title: "Free Vue 3 Icons (SVG Components)",
    heading: "Free Vue icons",
    intro:
      "Original icons for Vue 3 and Nuxt, as typed components that render inline SVG.",
    steps: [
      "Search the explorer for the icon you need.",
      "Adjust the size and colour.",
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
    title: "Free Svelte 5 Icons (SVG Components)",
    heading: "Free Svelte icons",
    intro:
      "Original icons for Svelte 5 and SvelteKit, as lightweight components.",
    steps: [
      "Browse or search the icon explorer.",
      "Adjust it to match your design.",
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
    slug: "tailwind-icons",
    framework: "Tailwind CSS",
    title: "Free Icons for Tailwind CSS (SVG)",
    heading: "Free Tailwind CSS icons",
    intro: "Original icons that take Tailwind classes. They use currentColor, so text, size and hover utilities just work.",
    steps: [
      "Find an icon in the explorer.",
      "Add Tailwind classes for size and colour.",
      "Use hover and dark variants like any other element.",
    ],
    example: {
      label: "Button.tsx",
      lang: "javascript",
      code: `import { HeartIcon } from "@ikions/react";

export function LikeButton() {
  return (
    <button className="inline-flex items-center gap-2 text-slate-600 hover:text-rose-600 dark:text-slate-300">
      <HeartIcon className="size-5" />
      Like
    </button>
  );
}`,
    },
    docs: { href: "/docs/styling", label: "Styling guide" },
  },
  {
    slug: "svg-icons",
    framework: "SVG",
    title: "Free SVG Icons (SVG and PNG Download)",
    heading: "Free SVG icons",
    intro:
      "Original SVG icons for websites, apps, slides and design tools. Free for personal and commercial use.",
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
