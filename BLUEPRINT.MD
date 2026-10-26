# IKIONS
## Complete Product, Design System & Production Engineering Blueprint
**Project:** Ikions — An Original Icon Library for Everything
**Type:** Public website, icon library, design toolkit, npm packages, and developer platform
**Target:** Production-ready, scalable, accessible, responsive
**Primary stack:** Next.js, TypeScript, React, Tailwind CSS, SVG, MDX
**Brand philosophy:** Every interface deserves a better icon.

---

# 1. PROJECT VISION

Build **Ikions**, a professional icon library that provides beautiful, consistent, original icons for practically every digital interface.

Ikions must be more than a gallery of SVG files. It must function as a complete design resource and developer ecosystem.

Users should be able to:

- Browse thousands of professionally designed icons.
- Search icons using names, synonyms, categories, and use cases.
- Switch instantly between Outline and Filled variants.
- Customize icon size, color, stroke width, and supported visual properties.
- Copy SVG, JSX, React component code, and icon names.
- Download SVG and PNG files.
- Select multiple icons and download them together.
- Integrate icons through npm packages.
- Use icons in React, Next.js, Vue, Svelte, and plain HTML.
- Explore comprehensive documentation and usage examples.
- Access icon metadata and searchable catalogs programmatically.
- Use the icons in personal and commercial projects under a clearly defined license.

The product must feel like a mature design infrastructure company created it, not a generic icon gallery generated from a website template.

## Non-negotiable principles

1. Original icon artwork, not copies of existing libraries.
2. Every published icon has a corresponding Outline and Filled design.
3. Icon families must remain visually consistent.
4. All icons are real SVG assets, not emoji or Unicode placeholders.
5. The website must be fully functional, not a visual mockup.
6. No fake icon counts, fake downloads, fake reviews, or unfinished navigation.
7. The platform must work on desktop, tablet, and mobile.
8. Icon packages must be reusable independently of the website.
9. Accessibility, performance, and maintainability are core requirements.
10. The project must have a reproducible process for continuously expanding the library.

---

# 2. IKIONS BRAND IDENTITY

## Brand personality

Ikions should communicate:

- Precision
- Simplicity
- Craftsmanship
- Playfulness in small details
- Modernity
- Reliability
- Creative independence

Avoid imitating the visual identity of other icon libraries.

## Brand styling

Use a warm, neutral, editorial design language with selective accent colors.

### Colors

- Primary background: `#FAFAF8`
- Main surface: `#FFFFFF`
- Primary text: `#18191B`
- Secondary text: `#72747A`
- Subtle surface: `#F2F2EF`
- Dividers: `#E8E8E4`
- Primary accent: `#5555E8`
- Accent hover: `#4444CF`
- Selected icon background: `#EEEEFF`

Dark mode:

- Background: `#121316`
- Surface: `#1B1C20`
- Elevated surface: `#24252A`
- Main text: `#F5F5F2`
- Secondary text: `#A1A2AA`
- Dividers: `#303137`

Colors must be centralized as design tokens.

### Typography

Use **Inter** or **Geist** for interface text.

Recommended:

- Display headings: Geist with carefully controlled letter spacing.
- Body: Inter.
- Code: JetBrains Mono.
- Navigation: Medium weight.
- Supporting labels: Regular or medium.

Avoid oversized generic SaaS headings, excessive gradients, and random font-weight changes.

### Logo

Create an original Ikions wordmark.

Design a distinctive, simple geometric symbol that works at favicon size.

The logo must not resemble another icon library's logo.

Create a consistent brand mark for the website, package documentation, and social previews.

---

# 3. ORIGINAL ICON DESIGN LANGUAGE

This is the most important part of Ikions.

Every icon must belong to one unified visual family.

Do not copy, trace, slightly modify, or automatically recolor icons from Lucide, Heroicons, Phosphor, Tabler, Material Symbols, or other libraries.

Ikions needs its own carefully developed geometry.

## 3.1 Base geometry

- Master artboard: 24 × 24 units.
- Standard visual drawing area: approximately 20 × 20.
- Optical overshoot allowed where needed.
- Standard outline stroke: 1.75 units.
- Default stroke caps: rounded.
- Default stroke joins: rounded.
- Use consistent corner radii based on shape size.
- Prioritize balanced negative space.
- Align common geometric elements to a predictable grid.
- Apply optical correction to curved and diagonal shapes.

Do not force all icons into identical boxes or geometries when it reduces clarity.

## 3.2 Signature Ikions style

Create a recognizable visual personality using:

- Soft but controlled geometric corners.
- Balanced, friendly silhouettes.
- Slightly rounded terminals.
- Clear internal negative space.
- Minimal unnecessary detail.
- Harmonious circular and rectangular forms.
- Purposeful proportions.
- Strong recognition at small sizes.
- A subtle handcrafted quality without looking cartoonish.

Ikions should feel precise but approachable.

Icons must not look like random illustrations or unrelated assets.

## 3.3 Outline icons

Outline is one of the two primary variants.

Requirements:

- Stroke-based SVG construction.
- Consistent default 1.75 stroke width.
- No unnecessary fills.
- Predictable `currentColor` behavior.
- Clear silhouettes at 16, 20, 24, and 32 pixels.
- No overly thin details.
- Consistent joins, caps, spacing, and alignment.
- Support configurable stroke width where geometry permits.

Outline icons should remain visually balanced when stroke width changes.

## 3.4 Filled icons

Filled icons are equally important.

Do not simply apply `fill="currentColor"` to outline SVGs.

Every Filled icon must be a separately designed silhouette derived from the same conceptual geometry.

Requirements:

- Strong, recognizable filled silhouettes.
- Carefully designed negative-space cutouts.
- No accidental filled holes.
- Appropriate optical weight.
- Consistent mass and density across the library.
- Good readability at 16–24 pixels.
- Use `fill="currentColor"` for monochrome paths.
- Preserve transparent internal openings where necessary.

Filled icons must look intentionally designed, not like converted outlines.

## 3.5 Variant parity

Every published icon must have:

- An Outline version.
- A Filled version.
- The same canonical icon name.
- Matching semantic meaning.
- Comparable visual scale.
- Consistent proportions.

If a Filled variant cannot be made legible, redesign both versions until they work.

Do not publish incomplete icon pairs in the stable catalog.

## 3.6 Icon review process

For every icon:

1. Research the object or concept.
2. Identify its most recognizable visual characteristics.
3. Sketch an original simplified silhouette.
4. Create the Outline variant.
5. Create the Filled variant independently.
6. Test both at multiple sizes.
7. Compare against other Ikions icons for consistency.
8. Check SVG structure.
9. Check visual weight.
10. Review for accidental similarity to existing libraries.
11. Approve and register both assets.

Create an internal design specification and reusable templates so new icons remain consistent.

---

# 4. COMPREHENSIVE ICON CATALOG

The long-term target is a genuinely extensive catalog with thousands of unique semantic icons and complete Outline/Filled parity.

**Target: 3,000–5,000 original icon concepts, representing 6,000–10,000 variant assets.**

This is a roadmap target, not a count to advertise before those assets actually exist.

Build the catalog around the following categories.

## 4.1 Interface Essentials

Home, menu, search, close, check, add, remove, edit, delete, more, settings, filter, sort, refresh, loading, drag, resize, maximize, minimize, fullscreen, expand, collapse, grid, list, layout, sidebar, panel, dashboard, navigation, command, shortcut, and other standard interface actions.

## 4.2 Arrows & Directions

Directional arrows, chevrons, long arrows, curved arrows, diagonal arrows, arrow circles, arrow squares, upload, download, import, export, undo, redo, repeat, shuffle, swap, exchange, turn, enter, exit, expand, collapse, and navigation directions.

## 4.3 Communication

Mail, inbox, send, reply, forward, chat, messages, comments, conversation, phone, voicemail, video call, contacts, notification, bell, announcement, megaphone, broadcast, radio, microphone, and communication statuses.

## 4.4 People & Accounts

User, users, profile, avatar, user add, user remove, user check, account settings, identity, family, team, organization, relationships, accessibility, and user permissions.

## 4.5 Files & Documents

File, folder, archive, attachment, PDF, image file, audio file, video file, spreadsheet, document, presentation, code file, file search, file upload, file download, file edit, file lock, file share, file check, and file warning.

## 4.6 Editing & Creativity

Pen, pencil, brush, eraser, color palette, crop, selection, shapes, layers, typography, text alignment, text formatting, ruler, vector, bezier curve, gradient, transparency, eyedropper, design canvas, artboard, transform, and creative tools.

## 4.7 Media & Entertainment

Play, pause, stop, record, rewind, forward, volume, mute, music, headphones, speakers, camera, video, film, image, gallery, playlist, podcast, streaming, television, games, controller, and media editing.

## 4.8 Devices & Technology

Smartphone, tablet, laptop, desktop, monitor, keyboard, mouse, printer, scanner, camera, smartwatch, headphones, USB, Bluetooth, Wi-Fi, router, server, database, cloud, chip, processor, memory, storage, and device connections.

## 4.9 Development & Programming

Code, terminal, Git branch, merge, commit, pull request, bug, debugging, API, webhook, database, cloud deployment, server, container, package, component, framework, brackets, JSON, variables, functions, and programming tools.

## 4.10 Shopping & E-commerce

Cart, basket, bag, storefront, shop, product, barcode, QR code, checkout, receipt, coupon, discount, price tag, delivery, package, inventory, refund, return, seller, buyer, wishlist, reviews, and order statuses.

## 4.11 Finance & Business

Wallet, money, cash, coins, bank, credit card, debit card, invoice, receipt, billing, transfer, payment, savings, investment, profit, loss, revenue, expenses, budget, tax, accounting, and financial analytics.

## 4.12 Maps & Navigation

Map, pin, location, compass, globe, route, directions, destination, GPS, navigation, street, road, highway, traffic, landmark, building, city, country, parking, and geographical symbols.

## 4.13 Transportation & Travel

Car, motorcycle, bicycle, scooter, bus, taxi, train, airplane, ship, boat, truck, delivery van, luggage, passport, ticket, hotel, accommodation, fuel, charging station, and travel services.

## 4.14 Weather & Nature

Sun, moon, stars, clouds, rain, snow, storm, lightning, wind, fog, temperature, thermometer, sunrise, sunset, seasons, mountains, rivers, ocean, trees, leaves, flowers, plants, and natural environments.

## 4.15 Food & Beverages

Restaurant, utensils, plate, bowl, cup, coffee, tea, juice, water, bread, rice, noodles, pizza, burger, fruits, vegetables, meat, seafood, cooking, kitchen tools, food delivery, and dining services.

## 4.16 Health & Medical

Heart, pulse, medical kit, hospital, doctor, nurse, medicine, pill, syringe, thermometer, stethoscope, ambulance, emergency, laboratory, health records, wellness, and medical equipment.

## 4.17 Education & Learning

Book, library, school, university, graduation, notebook, pencil, exam, certificate, diploma, classroom, learning, teaching, research, microscope, calculator, and educational tools.

## 4.18 Security & Privacy

Lock, unlock, shield, key, password, fingerprint, face recognition, authentication, encryption, visibility, hidden, warning, verification, identity, access control, and cybersecurity.

## 4.19 Time & Productivity

Clock, calendar, timer, stopwatch, alarm, schedule, task, checklist, priority, bookmark, pin, reminder, focus, progress, milestone, workflow, and productivity tools.

## 4.20 Charts & Analytics

Bar chart, line chart, pie chart, donut chart, scatter plot, trend, activity, statistics, analytics, growth, decline, dashboard, report, comparison, and data visualization.

## 4.21 Social & Community

Share, like, dislike, follow, unfollow, favorite, reaction, group, community, forum, comment, hashtag, mention, repost, and social interactions.

## 4.22 Buildings & Places

House, apartment, office, factory, warehouse, school, hospital, hotel, restaurant, store, stadium, museum, church, park, government building, and public facilities.

## 4.23 Animals & Agriculture

Cat, dog, bird, fish, cow, pig, chicken, horse, sheep, goat, farming, tractor, crops, harvest, irrigation, seed, soil, livestock, and agricultural equipment.

## 4.24 Sports & Fitness

Running, walking, cycling, swimming, basketball, football, volleyball, tennis, badminton, gym, dumbbell, exercise, fitness tracker, trophy, medal, and sports equipment.

## 4.25 Clothing & Lifestyle

Shirt, pants, shoes, dress, jacket, hat, watch, glasses, bag, jewelry, beauty, grooming, and personal accessories.

## 4.26 Science & Engineering

Atom, molecule, microscope, telescope, laboratory, flask, chemistry, physics, mathematics, engineering, robotics, electricity, circuits, and scientific equipment.

## 4.27 Energy & Sustainability

Battery, solar panel, wind turbine, power, electricity, recycling, water conservation, environmental protection, green energy, carbon footprint, and sustainability.

## 4.28 Status & Feedback

Success, error, warning, information, help, question, loading, pending, approved, rejected, completed, blocked, offline, online, active, inactive, and system statuses.

## 4.29 Shapes & Symbols

Circle, square, triangle, polygon, star, heart, diamond, hexagon, cross, plus, minus, mathematical operators, punctuation, and common abstract symbols.

## 4.30 Specialized & Emerging Technology

AI, machine learning, neural networks, automation, robotics, augmented reality, virtual reality, smart home, IoT, satellite, drone, blockchain concepts, and emerging interfaces.

## Catalog completeness strategy

Do not interpret the category examples as the entire required icon list.

For each category:

- Research common interface usage.
- Expand into meaningful subcategories.
- Include common objects, actions, states, and variations.
- Include directional and status variants when genuinely useful.
- Include industry-specific symbols.
- Avoid meaningless variations that exist only to inflate counts.
- Avoid near-duplicate icons with different names.
- Use aliases for synonyms instead of duplicating artwork.

Create a structured master catalog with unique IDs, canonical names, descriptions, aliases, categories, keywords, and variant availability.

The system must support adding more categories without changing the frontend architecture.

---

# 5. WEBSITE INFORMATION ARCHITECTURE

Build the following real routes.

| Route | Purpose |
|---|---|
| `/` | Marketing landing page |
| `/icons` | Main searchable icon explorer |
| `/icons/[slug]` | Individual icon details |
| `/categories` | Browse all categories |
| `/categories/[slug]` | Category-specific collection |
| `/collections` | Curated icon collections |
| `/collections/[slug]` | Individual collection |
| `/docs` | Documentation introduction |
| `/docs/installation` | Installation |
| `/docs/react` | React integration |
| `/docs/nextjs` | Next.js integration |
| `/docs/vue` | Vue integration |
| `/docs/svelte` | Svelte integration |
| `/docs/html` | Vanilla HTML/SVG integration |
| `/docs/styling` | Colors, sizes, and styling |
| `/docs/accessibility` | Accessible usage |
| `/docs/api` | API and metadata documentation |
| `/license` | Icon and code licensing |
| `/changelog` | Library releases |
| `/about` | About Ikions |
| `/search` | Optional dedicated search experience |

Do not create redundant routes or pages without a useful purpose.

All routes must have meaningful content and working navigation.

---

# 6. LANDING PAGE DESIGN

The homepage should immediately communicate what Ikions offers.

## 6.1 Header

Desktop:

- Ikions logo and wordmark.
- Icons.
- Categories.
- Documentation.
- GitHub.
- Theme toggle.
- Primary action: Explore icons.

Keep the navigation compact and organized.

Mobile:

- Brand mark.
- Search shortcut.
- Menu button.
- Accessible navigation drawer.

Use a sticky header with subtle surface treatment when scrolling.

Avoid oversized pill-shaped navigation containers.

## 6.2 Hero

Create a visually distinctive hero.

Suggested headline:

**Icons for everything you imagine.**

Supporting text:

"A carefully crafted collection of original icons, available in Outline and Filled styles. Designed to make every interface feel complete."

Primary CTA: Explore icons

Secondary CTA: Get started

Include a functional search input directly within the hero.

Users should be able to start searching immediately without navigating through multiple pages.

## 6.3 Interactive icon showcase

Build an interactive grid showcasing actual Ikions icons.

Features:

- Live Outline/Fill switching.
- Smooth transitions.
- Hover emphasis.
- Real icon assets.
- Consistent spacing.
- Carefully composed visual rhythm.

Do not fill the hero with unrelated 3D illustrations or stock imagery.

Let the actual icons demonstrate the product.

## 6.4 Library overview

Display:

- Actual published icon count.
- Available variants.
- Number of categories.
- Supported integrations.

All numbers must be derived from the real catalog or package configuration.

## 6.5 Feature showcase

Present meaningful features through live interactive demonstrations rather than generic marketing cards.

Demonstrate:

- Outline and Filled.
- Copy SVG.
- Change color.
- Customize size.
- React integration.
- Download assets.

Use a mix of horizontal layouts, live previews, and concise editorial explanations.

## 6.6 Category discovery

Show a curated selection of categories using original icons.

Each category links to its real catalog.

## 6.7 Developer integration

Include a terminal-inspired installation section.

Example:

```bash
npm install @ikions/react
```

Show an actual working usage example.

```tsx
import { SearchIcon, HomeIcon } from "@ikions/react";

export function Navigation() {
  return (
    <nav>
      <HomeIcon size={24} variant="outline" />
      <SearchIcon size={24} variant="filled" />
    </nav>
  );
}
```

These examples must match the implemented package API.

## 6.8 Final CTA and footer

Finish with a restrained invitation to explore the icon library.

Footer sections:

- Product
- Documentation
- Resources
- GitHub
- License
- Changelog
- About

No broken or placeholder links.

---

# 7. MAIN ICON EXPLORER

The `/icons` page is the core product.

It must feel fast, highly usable, and purpose-built.

## Desktop layout

- Compact global header.
- Category navigation sidebar.
- Main content area.
- Search and filtering toolbar.
- Dense but comfortable icon grid.
- Optional detail inspector when an icon is selected.

Avoid wrapping every interface section inside a separate card.

Use clean surfaces, thoughtful spacing, and subtle dividers.

## Search

Implement real full-text search.

Search must understand:

- Canonical icon name.
- Alternative names.
- Common synonyms.
- Category.
- Related actions.
- Relevant use cases.

Examples:

"trash" should find delete and trash icons.

"message" should find chat, speech bubble, and messaging-related icons.

"payment" should surface wallet, card, invoice, money, and related icons.

Search must be fast and keyboard-friendly.

## Filters

Provide:

- Outline / Filled toggle.
- Category.
- Sort by name.
- Recently added.
- Popular, only when backed by genuine usage metrics.
- Favorites, stored locally if accounts are not implemented.

## Icon grid

- Uniform icon preview containers.
- Proper optical alignment.
- Responsive columns.
- Clear hover and selection states.
- Icon names visible or accessible without unnecessary clicks.
- Smooth but restrained animations.
- Virtualization when required for large catalogs.

## Icon interactions

Single click:

Open a detail panel or inspector.

Quick actions:

- Copy SVG.
- Copy JSX.
- Copy icon name.
- Download SVG.
- Add to selection.

Keyboard:

- `/` focuses search.
- Escape closes the inspector.
- Enter opens the focused icon.
- Arrow keys navigate where appropriate.
- Accessible keyboard focus must remain visible.

## Responsive behavior

Desktop:

Sidebar + icon grid + optional inspector.

Tablet:

Collapsible sidebar + adaptive grid.

Mobile:

Search toolbar + filter drawer + icon grid + bottom-sheet inspector.

Never shrink the desktop interface until it becomes difficult to use.

---

# 8. ICON DETAIL EXPERIENCE

Every icon has a dedicated route and interactive detail view.

Display:

- Large icon preview.
- Icon name.
- Short description.
- Category.
- Tags and aliases.
- Outline / Filled toggle.
- Size control.
- Color control.
- Stroke-width control for Outline.
- Copy actions.
- Download actions.
- Integration code.
- Related icons.

## Preview controls

Sizes:

16, 20, 24, 32, 48, 64, and custom.

Colors:

- Current color.
- Preset colors.
- Custom hex input.
- Color picker.

Background preview:

- Light.
- Dark.
- Checkerboard.

Stroke width:

- Allow valid Outline stroke adjustments.
- Disable this control for Filled icons when not applicable.

## Code tabs

- SVG
- React
- JSX
- HTML
- CSS usage
- Icon package import

Every displayed snippet must be valid for the selected icon and variant.

Copy buttons must actually copy the correct content.

## Download formats

- SVG.
- PNG with transparent background.
- Multiple PNG resolutions.

Downloads must preserve proportions and transparency.

---

# 9. MULTI-ICON SELECTION & EXPORT

Allow users to select several icons from the explorer.

A compact selection toolbar should appear.

Actions:

- View selected icons.
- Remove individual icons.
- Clear selection.
- Select variant for export.
- Download selected icons as ZIP.
- Copy selected icon names.
- Export an SVG sprite.

ZIP structure:

```text
ikions-export/
  outline/
    home.svg
    search.svg
  filled/
    home.svg
    search.svg
```

The exporter must generate real files and correct names.

Do not export screenshots of SVG previews.

---

# 10. DEVELOPER PACKAGES

Ikions must have a reusable package ecosystem.

Recommended monorepo:

```text
ikions/
  apps/
    web/
  packages/
    icons/
    react/
    vue/
    svelte/
    metadata/
    tooling/
  scripts/
  docs/
  tests/
  .github/
  package.json
  pnpm-workspace.yaml
  turbo.json
```

## @ikions/icons

Framework-independent SVG assets.

Organize by:

- Outline.
- Filled.
- Canonical icon name.

## @ikions/react

Provide typed, tree-shakeable React components.

Supported props:

- `size`
- `color`
- `variant`
- `strokeWidth`
- `className`
- `title`
- Standard SVG attributes.

Example:

```tsx
import { CameraIcon } from "@ikions/react";

<CameraIcon
  size={28}
  variant="outline"
  color="currentColor"
  strokeWidth={1.75}
/>
```

Support both variants through the component API.

Ensure unused icons are excluded from production bundles when imported individually.

## @ikions/vue

Vue 3 icon components with equivalent functionality.

## @ikions/svelte

Svelte components with equivalent functionality.

## @ikions/metadata

Export searchable icon metadata.

Use this for the website and developer tooling.

## @ikions/tooling

Shared scripts for:

- SVG validation.
- Asset optimization.
- Type generation.
- Package generation.
- Metadata generation.
- Catalog validation.
- Release preparation.

Do not publish empty packages or advertise unsupported frameworks.

---

# 11. ICON ASSET PIPELINE

Build a reliable source-to-package pipeline.

## Source structure

```text
assets/
  source/
    home/
      outline.svg
      filled.svg
    search/
      outline.svg
      filled.svg
    camera/
      outline.svg
      filled.svg
```

Each icon must have metadata.

Example:

```json
{
  "name": "camera",
  "category": "media",
  "description": "Capture photos or open a camera interface",
  "tags": ["photo", "picture", "capture"],
  "aliases": ["photography", "take-picture"],
  "variants": ["outline", "filled"]
}
```

## Automated checks

- Valid XML/SVG.
- 24 × 24 viewBox.
- No scripts.
- No external references.
- No embedded raster images.
- No unsafe SVG attributes.
- No unnecessary transforms.
- No duplicate IDs.
- No invalid path data.
- No unexpected hardcoded colors.
- Both required variants exist.
- Matching metadata exists.
- Naming rules are followed.
- File sizes are reasonable.
- React/Vue/Svelte outputs compile.

Use SVGO with carefully chosen settings.

Do not over-optimize in ways that damage icon geometry.

## Asset generation

Build scripts must generate:

1. Optimized SVG assets.
2. React components.
3. Vue components.
4. Svelte components.
5. TypeScript definitions.
6. Icon metadata.
7. Search indexes.
8. Public icon previews.
9. Package exports.
10. Documentation references.

Never manually maintain separate versions of the same icon in each framework.

Use one canonical SVG source per variant.

---

# 12. SEARCH ENGINE

Implement a robust local or server-backed search architecture.

Recommended:

- Generated metadata index.
- Fuse.js or an equivalent search engine.
- Weighted matching.
- Alias matching.
- Category filtering.
- Debounced search input.
- Keyboard navigation.

Ranking priority:

1. Exact canonical name.
2. Exact alias.
3. Prefix match.
4. Keyword match.
5. Description match.
6. Related category.

Search should not require an external paid service for normal operation.

As the library grows, allow migration to a dedicated search service without rebuilding the UI.

---

# 13. DOCUMENTATION

Build polished, readable documentation using MDX.

Documentation must cover:

- Introduction.
- Installation.
- Quick start.
- React.
- Next.js.
- Vue.
- Svelte.
- HTML.
- Icon variants.
- Styling.
- Size and color.
- Stroke width.
- Accessibility.
- Tree shaking.
- Server rendering.
- SVG downloads.
- Icon metadata.
- Custom usage.
- License.
- Contribution guide.
- Troubleshooting.

Use:

- Sidebar navigation.
- Search.
- Code highlighting.
- Copy code controls.
- Clear examples.
- Previous/next navigation.
- Responsive layouts.

Documentation must match the actual code.

---

# 14. UI/UX DESIGN STANDARDS

The website must not look like a generic AI-generated SaaS template.

Avoid:

- Excessive pill-shaped elements.
- Everything being inside cards.
- Unnecessary borders.
- Huge empty hero sections.
- Random gradient backgrounds.
- Oversized headings everywhere.
- Generic feature grids repeated on every page.
- Decorative dashboards with fake information.
- Excessive animation.
- Emoji as interface icons.
- Repeated marketing slogans.
- Overcrowded navigation.

Use:

- Strong typography hierarchy.
- Deliberate whitespace.
- Editorial composition.
- Carefully aligned icon grids.
- Subtle hover feedback.
- Restrained accent colors.
- Meaningful animation.
- Clear interaction affordances.
- Consistent spacing tokens.
- Functional responsive layouts.

## Motion

Use subtle motion for:

- Outline/Fill transitions.
- Search results.
- Icon selection.
- Copy success feedback.
- Drawer and inspector transitions.
- Theme switching.
- Navigation states.

Respect `prefers-reduced-motion`.

Avoid heavy page transitions that slow down browsing.

## Interaction quality

Every interactive element must have:

- Hover state where relevant.
- Keyboard focus state.
- Pressed state where relevant.
- Disabled state when applicable.
- Loading state for asynchronous actions.
- Success/error feedback where needed.

---

# 15. ACCESSIBILITY

Target WCAG 2.2 AA.

Requirements:

- Keyboard-accessible controls.
- Visible focus indicators.
- Correct semantic HTML.
- Accessible navigation.
- Sufficient color contrast.
- Screen reader labels.
- Logical heading hierarchy.
- Accessible dialogs and drawers.
- Correct focus restoration.
- Reduced-motion support.
- Touch targets sized appropriately.
- Usable zoom and text scaling.

Icon package behavior:

Decorative icons should support `aria-hidden="true"`.

Meaningful icons must support an accessible name or title.

Never assume an icon alone communicates meaning to all users.

---

# 16. PERFORMANCE

Target excellent real-world performance.

Use:

- Next.js App Router.
- Static generation for stable public pages.
- Appropriate caching.
- Optimized fonts.
- Lazy loading.
- Search-index splitting if needed.
- Dynamic loading for expensive inspectors.
- Lightweight SVG rendering.
- Virtualized large grids when appropriate.
- Tree-shakeable packages.

Targets:

- Lighthouse Performance: 90+ on representative production pages.
- Accessibility: 95+.
- Best Practices: 95+.
- SEO: 95+.
- LCP: under 2.5 seconds at the 75th percentile.
- INP: under 200 milliseconds.
- CLS: under 0.1.

Measure with realistic devices and network conditions.

Do not claim these scores without testing.

---

# 17. SEO & DISCOVERABILITY

Implement:

- Semantic HTML.
- Unique metadata per icon.
- Dynamic page titles.
- Useful descriptions.
- Canonical URLs.
- Open Graph images.
- Sitemap generation.
- robots.txt.
- Structured data where appropriate.
- Category landing pages.
- Clean slugs.
- Internal linking.
- Search engine-friendly icon details.

Example title:

"Camera Icon — Outline & Filled SVG | Ikions"

Avoid creating thousands of thin pages with duplicate text.

Every published icon page should contain meaningful information and usable assets.

---

# 18. LICENSING & OPEN SOURCE

Use a clear licensing strategy.

Suggested:

- MIT for application and package source code.
- A clearly selected permissive license for original SVG artwork, such as MIT or CC0, following a legal review.

Document:

- Personal use.
- Commercial use.
- Attribution requirements.
- Redistribution.
- Modification.
- Package distribution.
- Trademark restrictions.

The Ikions name and logo should have separate trademark guidance.

Do not claim an icon is original or properly licensed without reviewing its provenance.

Maintain a contribution process that requires contributors to affirm they own or have the right to submit the artwork.

---

# 19. PRODUCTION SECURITY

The platform should be secure even if most content is public.

Requirements:

- Validate all search and API inputs.
- Sanitize generated SVG content.
- Reject SVG scripts and unsafe references.
- Use restrictive content security policies.
- Prevent XSS through icon metadata.
- Avoid arbitrary HTML injection.
- Add rate limits to public API endpoints where needed.
- Keep dependencies updated.
- Scan packages for known vulnerabilities.
- Protect deployment credentials.
- Avoid exposing secrets through client bundles.
- Use HTTPS.
- Add appropriate security headers.

Do not introduce user authentication or a database unless a real feature requires them.

Local favorites and temporary selections can work without accounts.

---

# 20. TESTING & QUALITY ASSURANCE

Implement automated testing.

## Unit tests

- Search ranking.
- Icon metadata.
- Variant selection.
- Color handling.
- SVG validation.
- Export utilities.
- Icon component props.
- File naming.

## Component tests

- Search interface.
- Icon grid.
- Icon inspector.
- Variant controls.
- Copy interactions.
- Category navigation.
- Theme toggle.
- Multi-selection.

## End-to-end tests

Use Playwright.

Test:

- Homepage navigation.
- Search for an icon.
- Switch to Filled.
- Copy SVG.
- Download SVG.
- Export multiple icons.
- Open documentation.
- Navigate categories.
- Mobile navigation.
- Keyboard-only usage.

## Visual regression

Capture icon contact sheets.

Compare:

- Outline variants.
- Filled variants.
- Multiple icon sizes.
- Light and dark previews.

Use visual regression testing to catch geometry changes and broken assets.

---

# 21. DEVELOPMENT ROADMAP

Build the product in deliberate phases.

## Phase 1 — Architecture & design foundations

- Initialize monorepo.
- Configure TypeScript.
- Configure Next.js.
- Establish design tokens.
- Build the brand identity.
- Document original icon design rules.
- Implement icon asset schema.
- Establish automated validation.

## Phase 2 — Original icon foundation

- Build a representative original icon set covering major categories.
- Create Outline and Filled versions.
- Establish consistent geometry.
- Create visual review sheets.
- Validate icon metadata.
- Build component generation.

Do not use another library as temporary published artwork.

## Phase 3 — Main website

- Landing page.
- Icon explorer.
- Search.
- Category pages.
- Icon detail pages.
- Variant controls.
- Copy and download.
- Responsive navigation.
- Dark mode.

## Phase 4 — Developer packages

- SVG package.
- React package.
- Vue package.
- Svelte package.
- Metadata package.
- Tree-shaking verification.
- Package build tests.

## Phase 5 — Advanced features

- Multi-selection.
- ZIP export.
- SVG sprite export.
- Custom preview settings.
- Favorites.
- Curated collections.
- Documentation search.

## Phase 6 — Catalog expansion

Expand the library category by category.

For every batch:

- Create original artwork.
- Create both variants.
- Run SVG validation.
- Run visual review.
- Generate packages.
- Update catalog counts.
- Update documentation.
- Test exports.

Do not generate thousands of unreviewed SVGs simply to claim a large library.

## Phase 7 — Production readiness

- Complete QA.
- Accessibility audit.
- Security audit.
- Performance testing.
- SEO verification.
- Cross-browser testing.
- Deployment configuration.
- Package publishing preparation.
- Changelog.
- License review.

---

# 22. ACCEPTANCE CRITERIA

Ikions is ready for a public production release when:

- The landing page is complete and responsive.
- The explorer uses real original SVG icons.
- Every published icon has both variants.
- Search works with names and aliases.
- All filters operate correctly.
- Icon detail pages work.
- SVG copying works.
- SVG and PNG downloads work.
- Multi-icon ZIP export works.
- Documentation is accurate.
- Published integration packages compile and render correctly.
- All published icon metadata is valid.
- Category navigation works.
- Keyboard navigation works.
- Dark mode works.
- Mobile layouts are fully usable.
- Automated tests pass.
- No fake statistics are displayed.
- No placeholder links or fake functionality remain.
- Build and deployment instructions are documented.
- The production deployment is tested.

The large catalog target is a separate measurable milestone. Never confuse a fully working platform with a completed 5,000-icon library.

---

# 23. INSTRUCTIONS TO CLAUDE CODE

You are the lead product designer, icon system designer, frontend engineer, package engineer, and quality assurance engineer responsible for Ikions.

Your assignment is to build an actual working product, not merely produce a design concept.

Before implementation:

1. Inspect the existing repository if one exists.
2. Determine which parts are already implemented.
3. Create a clear implementation plan.
4. Define the shared icon design rules.
5. Establish the data schema and package architecture.
6. Identify dependencies and technical risks.
7. Begin implementation in logical, testable stages.

During implementation:

- Use real original SVG assets.
- Preserve consistent geometry and visual identity.
- Keep the website clean, distinctive, and practical.
- Build working interactions.
- Maintain a single source of truth for icons.
- Ensure both variants remain synchronized.
- Keep code modular and strongly typed.
- Verify every generated package.
- Avoid mock functionality and fabricated content.
- Test desktop, tablet, and mobile.
- Run relevant automated tests after major changes.
- Correct errors instead of ignoring them.

For the icon catalog, create a comprehensive manifest and expansion process, then implement and validate the actual artwork in manageable batches. Never report planned icons as completed icons.

Prioritize a high-quality, complete user experience and a reliable design system over inflated asset counts.

**Final objective:** Deliver Ikions as a polished, original, production-quality icon library website and reusable developer ecosystem, capable of growing into a comprehensive library for virtually every modern interface.
