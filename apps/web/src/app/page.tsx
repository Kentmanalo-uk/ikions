import type { CSSProperties } from "react";
import Link from "next/link";
import { FeatureDemo } from "@/components/landing/feature-demo";
import { FrameworkTabs, type FrameworkTab } from "@/components/landing/framework-tabs";
import { LogoMark, Wordmark } from "@/components/layout/logo";
import { HeroSearch } from "@/components/landing/hero-search";
import { MeetDeveloper } from "@/components/landing/meet-developer";
import { MorphHeading, MorphText } from "@/components/landing/morph-heading";
import { Showcase } from "@/components/landing/showcase";
import { buttonClass } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { IkIcon } from "@/components/ui/ik-icon";
import { FRAMEWORK_LOGOS } from "@/lib/framework-logos";
import { jsonLd, libraryGraph } from "@/lib/structured-data";
import { categories, getCategoryIcons, getIcon, icons, stats, withNodes, type CategoryMetadata, type IconMetadata } from "@/lib/catalog";

const SHOWCASE = [
  "home", "search", "bell", "mail", "chat", "user", "settings", "heart",
  "camera", "image", "music", "play", "calendar", "clock", "map-pin", "compass",
  "cart", "bag", "wallet", "credit-card", "file", "folder", "cloud", "sun",
  "moon", "umbrella", "lock", "shield-check", "key", "code", "terminal", "git-branch",
  "plane", "car", "coffee", "pizza", "book-open", "lightbulb", "trophy", "sparkles",
];

const DEMO = ["camera", "bell", "wallet", "chat", "map-pin", "sparkles"];

/** The first category is featured large in the bento grid. */
const FEATURED_CATEGORIES = ["interface", "communication", "files", "media", "commerce", "maps", "weather", "development", "editing"];

const FRAMEWORKS: (Omit<FrameworkTab, "code"> & { file: string; lang: "javascript" | "vue" | "svelte"; source: string })[] = [
  {
    id: "react",
    label: "React",
    pkg: "@ikions/react",
    install: "npm install @ikions/react",
    file: "Navigation.tsx",
    lang: "javascript",
    source: `import { SearchIcon, HomeIcon } from "@ikions/react";

export function Navigation() {
  return (
    <nav>
      <HomeIcon size={24} variant="outline" />
      <SearchIcon size={24} variant="filled" />
    </nav>
  );
}`,
  },
  {
    id: "vue",
    label: "Vue",
    pkg: "@ikions/vue",
    install: "npm install @ikions/vue",
    file: "Navigation.vue",
    lang: "vue",
    source: `<script setup>
import { HomeIcon, SearchIcon } from "@ikions/vue";
</script>

<template>
  <nav>
    <HomeIcon :size="24" variant="outline" />
    <SearchIcon :size="24" variant="filled" />
  </nav>
</template>`,
  },
  {
    id: "svelte",
    label: "Svelte",
    pkg: "@ikions/svelte",
    install: "npm install @ikions/svelte",
    file: "Navigation.svelte",
    lang: "svelte",
    source: `<script>
  import { HomeIcon, SearchIcon } from "@ikions/svelte";
</script>

<nav>
  <HomeIcon size={24} variant="outline" />
  <SearchIcon size={24} variant="filled" />
</nav>`,
  },
  {
    id: "svg",
    label: "Plain SVG",
    pkg: "@ikions/icons",
    install: "npm install @ikions/icons",
    file: "navigation.js",
    lang: "javascript",
    source: `import { toSvg } from "@ikions/icons";

const nav = document.querySelector("nav");
nav.innerHTML =
  toSvg("home", "outline", { size: 24 }) +
  toSvg("search", "filled", { size: 24 });`,
  },
];

/** Icons for the closing marquee: two different rows from the catalog. */
const MARQUEE_ROWS = [icons.slice(0, 28).map((i) => i.name), icons.slice(-28).map((i) => i.name)];

function CategoryCard({ category, featured }: { category: CategoryMetadata; featured: boolean }) {
  const list = getCategoryIcons(category.slug).slice(0, featured ? 24 : 8);
  return (
    <li className={`overflow-hidden rounded-[22px] bg-surface shadow-card ${featured ? "col-span-2 lg:row-span-2" : ""}`}>
      <Link
        href={`/categories/${category.slug}`}
        className={`group relative flex h-full flex-col transition-colors hover:bg-subtle ${featured ? "p-6 sm:p-8" : "p-5"}`}
      >
        <div
          className={`grid text-ink-2 transition-colors group-hover:text-accent-text ${
            featured ? "grid-cols-6 gap-x-3 gap-y-5 sm:gap-y-6" : "grid-cols-4 gap-3"
          }`}
          aria-hidden="true"
        >
          {list.map((icon, i) => (
            <span key={icon.name} className="ik-flip" style={{ "--fd": `${i * 22}ms` } as CSSProperties}>
              <IkIcon name={icon.name} size={featured ? 26 : 22} className="ik-flip-outline" />
              <IkIcon name={icon.name} size={featured ? 26 : 22} variant="filled" className="ik-flip-filled" />
            </span>
          ))}
        </div>
        <div className={featured ? "mt-auto pt-10" : "mt-auto pt-6"}>
          <h3 className={`font-display font-semibold tracking-[-0.01em] ${featured ? "text-[22px]" : "text-[15.5px]"}`}>{category.name}</h3>
          {featured ? <p className="mt-2 max-w-md text-[14.5px] leading-6 text-ink-2">{category.description}</p> : null}
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-2">
            {category.count} icons
            <span className="translate-x-[-4px] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true">
              →
            </span>
          </p>
        </div>
      </Link>
    </li>
  );
}

export default function HomePage() {
  const featured = FEATURED_CATEGORIES.map((slug) => categories.find((c) => c.slug === slug)).filter(
    (c): c is (typeof categories)[number] => Boolean(c),
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(libraryGraph(stats))} />
      {/* Hero — atmospheric backdrop, copy and search on the left, the product window on the right. */}
      <div className="relative isolate overflow-hidden">
        <div className="ik-hero-bg" aria-hidden="true" />
      <section className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-14 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.22fr_1fr] lg:gap-12 lg:pb-24 lg:pt-20">
        <div>
          <MorphHeading className="font-display text-[48px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[60px] lg:text-[64px]" />
          <p className="mt-6 max-w-lg text-[17.5px] leading-[1.7] text-ink-2">
            A free library of {stats.icons.toLocaleString("en")} original SVG icons in Outline and Filled
            styles — free for personal and commercial projects, with React, Vue and Svelte components.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link href="/icons" className={`${buttonClass.primary} h-11 px-5 text-[15px]`}>
              Explore icons
            </Link>
            <Link href="/docs/installation" className={`${buttonClass.secondary} h-11 px-5 text-[15px]`}>
              Get started
            </Link>
          </div>
          <div className="mt-10 max-w-xl">
            <HeroSearch />
          </div>
        </div>
        <Showcase
          icons={withNodes(
            SHOWCASE.map(getIcon)
              .filter((icon): icon is IconMetadata => Boolean(icon))
              .map(({ name, title, component }) => ({ name, title, component })),
          )}
        />
      </section>
      </div>

      {/* Library overview — every number comes from the generated catalog. */}
      <section aria-label="Library overview" className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <dl className="grid grid-cols-2 gap-y-8 rounded-[24px] bg-surface px-6 py-7 shadow-card md:grid-cols-[1fr_1fr_1fr_1.4fr] md:px-8">
          {[
            { label: "Published icons", value: stats.icons.toLocaleString("en") },
            { label: "SVG assets, Outline + Filled", value: stats.assets.toLocaleString("en") },
            { label: "Categories", value: stats.categories },
          ].map((item) => (
            <div key={item.label} className="flex flex-col-reverse md:px-8 md:first:pl-0">
              <dt className="mt-1 text-[13px] text-ink-2">{item.label}</dt>
              <dd className="font-display text-[34px] font-semibold leading-none tracking-[-0.04em] tabular-nums">{item.value}</dd>
            </div>
          ))}
          <div className="col-span-2 flex flex-col justify-center md:col-span-1 md:pl-8">
            <dt className="sr-only">Works with</dt>
            <dd className="flex flex-wrap items-start gap-x-6 gap-y-3">
              {stats.integrations.map((name) => {
                const logo = FRAMEWORK_LOGOS[name];
                return (
                  <span key={name} className="flex w-12 flex-col items-center gap-1.5">
                    {logo ? (
                      <svg
                        viewBox="0 0 24 24"
                        width="30"
                        height="30"
                        aria-hidden="true"
                        className="ik-brand-logo transition-transform duration-200 hover:scale-110"
                        style={{ "--logo-light": logo.light, "--logo-dark": logo.dark } as CSSProperties}
                      >
                        <path d={logo.path} />
                      </svg>
                    ) : null}
                    <span className="text-[11.5px] font-medium text-ink-2">{name}</span>
                  </span>
                );
              })}
            </dd>
          </div>
        </dl>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-[1200px] px-4 pt-28 sm:px-6" aria-labelledby="features-heading">
        <div className="grid grid-cols-1 items-end gap-6 lg:grid-cols-2 lg:gap-16">
          <MorphText
            id="features-heading"
            lines={["Two variants, drawn separately, behaving identically."]}
            className="font-display text-[34px] font-semibold leading-[1.1] tracking-[-0.035em] text-balance sm:text-[40px]"
          />
          <p className="max-w-lg text-[16px] leading-7 text-ink-2">
            Outline icons share a 1.75 stroke on a 24-unit grid with soft corners and round terminals. Filled icons are not filled
            outlines — each is its own silhouette with real cutouts, tuned to the same visual weight. Try it:
          </p>
        </div>
        <div className="mt-10">
          <FeatureDemo
            icons={withNodes(
              DEMO.map(getIcon)
                .filter((icon): icon is IconMetadata => Boolean(icon))
                .map(({ name, title, component }) => ({ name, title, component })),
            )}
          />
        </div>
      </section>

      {/* Categories — bento grid; hovering a card flips its icons to Filled. */}
      <section className="mx-auto max-w-[1200px] px-4 pt-28 sm:px-6" aria-labelledby="categories-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <MorphText
            id="categories-heading"
            lines={["Find icons by what you are building"]}
            className="font-display text-[34px] font-semibold leading-[1.1] tracking-[-0.035em] text-balance sm:text-[40px]"
          />
          <Link href="/categories" className="text-[14px] font-medium text-accent-text hover:underline">
            All {stats.categories} categories →
          </Link>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {featured.map((category, index) => (
            <CategoryCard key={category.slug} category={category} featured={index === 0} />
          ))}
        </ul>
      </section>

      {/* Developers */}
      <section className="mx-auto max-w-[1200px] px-4 pt-28 sm:px-6" aria-labelledby="dev-heading">
        <FrameworkTabs
          intro={
            <>
              <MorphText
                id="dev-heading"
                lines={["Install once. Import only what you use."]}
                className="font-display text-[34px] font-semibold leading-[1.1] tracking-[-0.035em] text-balance sm:text-[40px]"
              />
              <p className="mt-5 text-[16px] leading-7 text-ink-2">
                Each icon is its own ES module, so bundlers drop everything you do not import. Components accept size, colour,
                variant, strokeWidth, title and any SVG attribute, and render accessible markup on the server.
              </p>
            </>
          }
          tabs={FRAMEWORKS.map(({ file, lang, source, ...tab }) => ({
            ...tab,
            logo: FRAMEWORK_LOGOS[tab.id === "svg" ? "SVG" : tab.label],
            code: <CodeBlock code={source} lang={lang} label={file} />,
          }))}
        />
      </section>

      {/* Meet the developer */}
      <section className="mx-auto max-w-[1200px] px-4 pt-28 sm:px-6" aria-labelledby="developer-heading">
        <h2
          id="developer-heading"
          className="flex flex-wrap items-center justify-center gap-x-[0.32em] gap-y-2 font-display text-[34px] font-semibold leading-[1.1] tracking-[-0.035em] sm:text-[40px]"
        >
          <MorphText as="span" lines={["Behind the"]} className="inline-block" />
          <span className="inline-flex items-center gap-[0.04em] text-ink">
            <LogoMark className="h-[1.3em] w-auto" />
            <Wordmark className="h-[0.74em] w-auto" />
            <span className="sr-only">Ikions</span>
          </span>
        </h2>
        <div className="mt-10">
          <MeetDeveloper />
        </div>
      </section>

      {/* Closing — headline, actions and two rows of drifting icons. */}
      <section className="mx-auto max-w-[1200px] px-4 pt-28 sm:px-6" aria-labelledby="cta-heading">
        <div className="ik-cta relative overflow-hidden rounded-[28px] bg-surface shadow-card px-6 pb-10 pt-16 text-center sm:px-10 sm:pt-20">
          <MorphText
            id="cta-heading"
            lines={["Every interface deserves a better icon."]}
            className="mx-auto max-w-2xl font-display text-[36px] font-semibold leading-[1.08] tracking-[-0.04em] text-balance sm:text-[48px]"
          />
          <p className="mx-auto mt-4 max-w-md text-[16px] leading-7 text-ink-2">
            Browse the full library, customise what you need and ship it in the format your project uses.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            <Link href="/icons" className={`${buttonClass.primary} h-11 px-5 text-[15px]`}>
              Explore {stats.icons} icons
            </Link>
            <Link href="/docs" className={`${buttonClass.secondary} h-11 px-5 text-[15px]`}>
              Read the docs
            </Link>
          </div>
          <div className="ik-marquee mt-14 space-y-3" aria-hidden="true">
            {MARQUEE_ROWS.map((row, r) => (
              <div key={r} className="overflow-hidden">
                <div className={`ik-marquee-track ${r === 1 ? "ik-marquee-reverse" : ""}`}>
                  {[...row, ...row].map((name, i) => (
                    <span key={`${name}-${i}`} className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-subtle text-ink-2">
                      <IkIcon name={name} size={24} variant={(i + r) % 3 === 0 ? "filled" : "outline"} />
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
