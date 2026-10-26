# Ikions

**Every interface deserves a better icon.**

Ikions is an original icon library: every icon is drawn on a 24 × 24 grid and published as a matched **Outline** and **Filled** pair. This repository contains the source artwork, the asset pipeline, the npm packages and the website.

Current catalog: **248 icons (496 SVG assets) in 30 categories.** See [docs/catalog-roadmap.md](docs/catalog-roadmap.md) for planned concepts — planned icons are never counted as published.

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

Measured on 2026-10-26 against a local production build (`next start`):

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
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, sitemap and Open Graph URLs, e.g. `https://ikions.example` |
| `NEXT_PUBLIC_GITHUB_URL` | Public repository URL. The GitHub links in the header and footer only appear when this is set. |

Any Node.js host works (Vercel, a container, a VPS). Serve over HTTPS; the app already sends CSP, HSTS and other security headers (see `apps/web/next.config.ts`). The `/api/v1/search` endpoint has an in-memory rate limiter per instance; put a shared limiter or WAF rule in front when running multiple instances.

## Publishing packages

Packages are versioned together. After `pnpm build`:

```bash
pnpm --filter "./packages/{icons,metadata,react,vue,svelte}" publish --access public
```

`@ikions/tooling` and the website are private and are never published.

## License

Icons and code: [MIT](LICENSE). The Ikions name and logo are not covered by the license.
