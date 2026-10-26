# Getting Ikions found

What is already built into the site, and what only you can do, in priority order. Search engines and AI assistants recommend what the web links to and talks about, so the off-site steps matter as much as the code.

## Already done in the code

| What | Where |
| --- | --- |
| Canonical URLs, sitemap, robots and Open Graph point to `https://www.ikions.cloud` (they pointed to `localhost` before) | `apps/web/src/lib/site.ts` |
| Keyword-rich titles and descriptions ("free", "open source", "SVG", "React/Vue/Svelte", "MIT") | `layout.tsx`, icon pages, home hero |
| Structured data: WebSite + site search box, Organization, Person, SoftwareSourceCode (free, MIT), FAQPage, per-icon ImageObject with licence (the "Licensable" badge in Google Images), breadcrumbs | `apps/web/src/lib/structured-data.ts` |
| Visible FAQ on the home page, written to be quoted by AI assistants | `components/landing/faq.tsx` |
| `/llms.txt` and `/llms-full.txt`: plain-text guides for ChatGPT, Claude, Perplexity and others | `apps/web/src/app/llms*.txt` |
| `robots.txt` explicitly welcomes AI crawlers (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended…) | `apps/web/src/app/robots.ts` |
| Sitemap with every icon's SVG as an image entry | `apps/web/src/app/sitemap.ts` |
| IndexNow (Bing, which also powers ChatGPT search and Copilot; Yandex; Seznam; Naver) | `pnpm --filter @ikions/web indexnow` |
| Web manifest, GitHub links in header and footer, README and npm keywords | various |
| Landing pages for high-intent searches: `/react-icons`, `/vue-icons`, `/svelte-icons`, `/svg-icons`, each with its own copy, example, popular icons and FAQ schema | `lib/topics.ts`, `components/landing/topic-page.tsx` |
| Category and collection pages: "Free … Icons (count)" titles, CollectionPage + ItemList + BreadcrumbList schema | `app/categories/[slug]`, `app/collections/[slug]` |
| Footer "Free icons" column linking the landing pages from every page | `components/layout/footer.tsx` |
| `/search` set to `noindex` (it duplicates the explorer) and removed from the sitemap | `app/search/page.tsx` |
| Optional "Icons by Ikions" credit snippet on `/license` to encourage backlinks | `app/license/page.mdx` |

## 1. Search engines (this week)

1. **Google Search Console** (property `https://www.ikions.cloud/` is verified):
   - Sitemaps → add `sitemap.xml` → Submit.
   - URL Inspection → `https://www.ikions.cloud/` → *Request indexing*. Repeat for `/icons`, `/docs`, `/license` and a few popular icons (`/icons/home`, `/icons/search`, `/icons/arrow-right`).
   - Optional: also add the **Domain** property with the DNS TXT record in Vercel, so `ikions.cloud` and `www` are covered together.
2. **Bing Webmaster Tools** (bing.com/webmasters): *Import from Google Search Console*. One click, no extra verification. Bing results feed ChatGPT search, Copilot and DuckDuckGo.
3. After every deploy that adds icons: `pnpm --filter @ikions/web indexnow`.

## 2. Publish the npm packages

Developers search npm and ask AI assistants "which React icon library…". Packages on npm also appear on jsDelivr, unpkg, Socket, npmtrends and bundlephobia, which are all backlinks.

```bash
npm login                       # create the free "ikions" org on npmjs.com first
pnpm build
pnpm --filter "./packages/{icons,metadata,react,vue,svelte}" publish --access public
```

Then update the README and the FAQ answer about npm (both currently say "not on npm yet").

## 3. GitHub repository settings

On github.com/Kentmanalo-uk/ikions → ⚙ next to *About*:

- **Description:** `Free, open-source SVG icon library — 1,900+ original icons in Outline and Filled. MIT. React, Vue, Svelte.`
- **Website:** `https://www.ikions.cloud`
- **Topics:** `icons` `icon-library` `svg-icons` `free-icons` `open-source` `react-icons` `vue-icons` `svelte-icons` `icon-pack` `ui-icons` `outline-icons` `design-system` `svg` `mit-license`
- Settings → *Social preview*: upload a 1280×640 image (the home page Open Graph image works).

Stars drive GitHub search ranking and "trending". Ask friends who use it to star it.

## 4. Launch posts (one per day, not all at once)

Be honest, reply to every comment, and never post the same text everywhere.

**Product Hunt** (launch on a Tuesday–Thursday, 12:01 am PT)
- Name: Ikions
- Tagline: `1,900+ free, original icons in Outline and Filled`
- Description: `Ikions is a free, MIT-licensed icon library I drew from scratch: every icon comes as a matched Outline and Filled pair on one 24px grid. Search, tweak size, colour, stroke or gradient, then copy SVG/JSX or download SVG, PNG, sprites and ZIPs. React, Vue and Svelte components included.`

**Hacker News** (Show HN)
- Title: `Show HN: Ikions – 1,900 free, original SVG icons in Outline and Filled`
- Text: what you built, why (consistent Outline *and* Filled pairs, original artwork), how the pipeline works (validation, duplicate detection, generated packages), and what feedback you want.

**Reddit**: read each subreddit's self-promotion rules first.
- r/webdev, r/web_design, r/SideProject: "I made a free icon library with 1,900 original icons in Outline and Filled. Feedback welcome."
- r/reactjs, r/vuejs, r/sveltejs: framework-specific, show the component usage.
- r/FigmaDesign, r/UI_Design: focus on the design system (grid, stroke, filled cutouts).

**dev.to / Hashnode / Medium article**: "How I drew 1,900 icons with a consistent design system" or "Building a duplicate detector for an icon library". Link to the site once, naturally.

**Indie Hackers**: build-in-public post with real numbers.

## 5. Directories and lists

- **AlternativeTo:** add Ikions as an alternative to other popular icon libraries.
- **"Awesome" lists on GitHub:** search GitHub for `awesome icons`, `awesome react components`, `awesome svelte` and `awesome vue`, then open a pull request adding one line, following each list's format.
- Free-resource roundups: search "free icon libraries 2026" and email authors with a one-paragraph pitch.
- Figma Community: publish the icons as a Figma file or plugin. Designers search there first.

## 6. Keep it growing

- Ship icons regularly and add a changelog entry each time. Fresh content gets recrawled.
- Answer real questions on Stack Overflow and Reddit where Ikions genuinely fits (no spam).
- Watch Search Console → *Performance* for queries you almost rank for, and improve those pages.

No one can guarantee a #1 ranking or that an AI will recommend a specific site. What moves both is consistent, honest exposure: indexed pages, real users, links and mentions.
