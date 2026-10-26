# Ikions — Free SVG Icon Library

**Every interface deserves a better icon.**

[![Website](https://img.shields.io/badge/website-ikions.cloud-5555E8)](https://www.ikions.cloud)
[![npm](https://img.shields.io/npm/v/@ikions/react?label=npm&color=cb3837)](https://www.npmjs.com/package/@ikions/react)
[![License: free use](https://img.shields.io/badge/license-free%20use-22c55e)](LICENSE)
![Icons](https://img.shields.io/badge/icons-1%2C900%2B-8b5cf6)
![Styles](https://img.shields.io/badge/styles-Outline%20%2B%20Filled-0ea5e9)

**[Browse and download the icons → ikions.cloud](https://www.ikions.cloud)**

Ikions is a **free icon library** with **1,900+ original SVG icons**. Every icon is drawn on a 24 × 24 grid and published as a matched **Outline** and **Filled** pair, **free for personal and commercial use** under the Ikions License, with no attribution required.

- **Free to use:** in websites, apps, products, slides and client work. Ikions is free, not open source: the icons may not be resold or redistributed as a set.
- **Two styles per icon:** Outline (1.75 stroke, round caps) and Filled (solid silhouettes with real cutouts).
- **Works everywhere:** copy SVG or JSX, download SVG or PNG, export sprites and ZIPs, or use the React, Vue and Svelte components.
- **Customisable:** size, colour, stroke width and gradient fills, live on the site.
- **Original:** every icon is drawn for Ikions; nothing is copied from other icon sets.
- **Accessible and tree-shakeable:** typed components, SSR-safe, with only the icons you import ending up in your bundle.

## Use the icons

1. Open **[ikions.cloud/icons](https://www.ikions.cloud/icons)** and search ("arrow", "payment", "weather"…).
2. Pick Outline or Filled, adjust size, colour or gradient.
3. **Copy SVG** / **Copy JSX**, or **Download SVG / PNG**. Select several icons to export a ZIP or sprite.

Each icon is also available as a raw SVG URL:

```html
<img src="https://www.ikions.cloud/api/v1/icons/camera/outline.svg" width="24" height="24" alt="Camera" />
```

Or install a package from npm:

```bash
npm install @ikions/react    # React and Next.js
npm install @ikions/vue      # Vue 3 and Nuxt
npm install @ikions/svelte   # Svelte 5 and SvelteKit
npm install @ikions/icons    # SVG files, sprites and toSvg()
```

```tsx
import { CameraIcon } from "@ikions/react";

<CameraIcon size={20} variant="filled" />;
```

Made by [Mike Fernandez](https://www.ikions.cloud/#developer-heading) · [Instagram @dvbmike](https://www.instagram.com/dvbmike/)

---

## Development

This repository contains the source artwork, the asset pipeline, the packages and the website.

See [docs/catalog-roadmap.md](docs/catalog-roadmap.md) for planned concepts — planned icons are never counted as published.

## Repository layout

```text
assets/
  source/<name>/          outline.svg, filled.svg, meta.json — the single source of truth
  categories.json         category registry
  collections.json        curated collections
  synonyms.json           concept words that expand search ("payment" → wallet, card…)
  releases.json           changelog entries
  roadmap.json            planned concepts per category
packages/
  tooling/                validation, optimisation, code generation, review sheets, visual regression
  icons/                  @ikions/icons    — SVG files, sprites, toSvg()
  metadata/               @ikions/metadata — metadata + ranked search engine
  react/                  @ikions/react    — React components
  vue/                    @ikions/vue      — Vue 3 components
  svelte/                 @ikions/svelte   — Svelte 5 components
apps/web/                 Next.js website (explorer, docs, API)
tests/                    Playwright end-to-end tests and the visual baseline
docs/                     icon design specification and roadmap
```

Generated files (`packages/*/src/generated`, `packages/react|vue/src/icons`, `packages/svelte/src/icons`, `packages/icons/{outline,filled,sprite}`) are produced by `pnpm icons:build`. Never edit them by hand.

## Requirements

- Node.js 20.11 or newer
- pnpm 9 (`npm install -g pnpm@9` or `corepack enable`)

## Getting started

```bash
pnpm install
pnpm dev            # builds assets + packages, then starts the website on http://localhost:3000
```

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm icons:validate [names…]` | Validate SVG safety, geometry, metadata and naming |
| `pnpm icons:sheet [names or categories…]` | Render review contact sheets into `review/` |
| `pnpm icons:build` | Optimise SVGs and generate every package's sources |
| `pnpm icons:visual [--update]` | Compare renders against `tests/visual/baseline.json` |
| `pnpm icons:roadmap` | Regenerate `docs/catalog-roadmap.md` |
| `pnpm build` | Full build: assets, packages and website |
| `pnpm test` | Unit, package, rendering and visual regression tests |
| `pnpm typecheck` | TypeScript across the workspace |
| `pnpm e2e` | Playwright tests against a production build (run `pnpm build` first) |

## Quality status

Last full measurement (2026-10-26, at 248 icons) against a local production build (`next start`); to be re-run for the expanded catalog:

| Check | Result |
| --- | --- |
| Icon validation | 248 icons, 496 assets, 0 errors |
| Unit / package / visual tests | 84 passing (tooling 21 incl. geometry and visual regression, icons 9, metadata 14, react 10, vue 3, svelte 4, web 23) |
| End-to-end (Playwright, desktop + mobile) | 29 passing, including axe WCAG 2.2 A/AA scans of key pages in light and dark |
| Lighthouse desktop (`/`, `/icons`, `/icons/camera`, `/docs/react`) | Performance 100, Accessibility 100, Best Practices 100, SEO 100 |
| Lighthouse mobile (simulated slow 4G, 4× CPU) | Performance 87–92, Accessibility 100, Best Practices 100, SEO 100; CLS 0; simulated LCP 2.9–3.5 s |

Mobile LCP is above the 2.5 s target in Lighthouse's simulation and has not yet been measured with real-user (field) data. Re-run with `node tests/lighthouse.mjs` while a production server runs on port 3100.

## Adding icons

1. Read [docs/icon-design-spec.md](docs/icon-design-spec.md).
2. Create `assets/source/<name>/` with both variants and `meta.json` (or write a batch module and run `pnpm --filter @ikions/tooling exec tsx src/cli/write-batch.ts <batch.mjs>`).
3. `pnpm icons:validate <name>` and `pnpm icons:sheet <name>` — review at 16–32 px, light and dark.
4. `pnpm icons:visual --update` to accept the new renders, then `pnpm icons:build && pnpm test`.
5. Add the concept to `assets/roadmap.json` and a note to `assets/releases.json`.

## Deployment

The website is a standard Next.js app; almost every route is statically generated at build time.

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm --filter @ikions/web start      # serves on port 3000
```

Environment variables (all optional):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, sitemap and Open Graph URLs. Defaults to `https://www.ikions.cloud` in production |
| `NEXT_PUBLIC_GITHUB_URL` | Optional repository link for the header and footer; hidden when unset |

Any Node.js host works (Vercel, a container, a VPS). Serve over HTTPS; the app already sends CSP, HSTS and other security headers (see `apps/web/next.config.ts`). The `/api/v1/search` endpoint has an in-memory rate limiter per instance; put a shared limiter or WAF rule in front when running multiple instances.

## Publishing packages

Packages are versioned together; the version comes from the newest entry in `assets/releases.json`.

One-time setup: create the free `ikions` organization on npmjs.com, then run `npm login`.

```bash
pnpm release:packages   # strict icon build, package builds, then publish all five
```

`pnpm publish` refuses to run with uncommitted changes or from a branch other than `main`. Check a package before publishing with `npm pack --dry-run` inside its folder.

`@ikions/tooling` and the website are private and are never published.

## License

Icons: free for personal and commercial use under the [Ikions License](LICENSE). Website, tooling and source code are proprietary. The Ikions name and logo are not covered by the license.
