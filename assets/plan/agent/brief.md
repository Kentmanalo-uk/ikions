# Ikions icon batch — shared brief (v2)

You are drawing one batch of **original** icons for Ikions, an icon library.
Repo: `C:\Users\Kaye\mike-project\ikions`. Use the Bash tool (Git Bash).

SCRATCH = `C:/Users/Kaye/AppData/Local/Temp/claude/c--Users-Kaye-mike-project-ikions/6d1cbcde-ed53-45f2-8a8e-8e6e7004567e/scratchpad`
TOOLING = `C:/Users/Kaye/mike-project/ikions/packages/tooling` (run all commands from here)

## 1. Read first (do this, it matters)
1. `C:\Users\Kaye\mike-project\ikions\docs\icon-design-spec.md` — the rulebook. Follow it exactly.
2. Your batch: `npx tsx src/cli/batch.ts <BATCH_ID>` lists the concept names and the category.
   Draw exactly these names, with exactly this category. Do not create other icons.
3. Study the existing approved artwork so your icons match it. The source SVGs are in
   `C:\Users\Kaye\mike-project\ikions\assets\source\<name>\{outline,filled}.svg`. Read at least
   10 that relate to your batch (e.g. for a files batch read `file`, `file-text`, `folder`; for
   people read `user`, `users`). Then render a reference sheet of them:
   `npx tsx src/cli/sheet.ts home search file user camera bell settings heart --out "SCRATCH/ref-<BATCH_ID>"`
   and Read the PNGs.
4. When a concept is a variation of an existing icon (e.g. `file-pdf` of `file`, `face-sad` of a
   face you draw, `battery-low` of `battery`), **reuse that icon's exact base path** so families
   stay consistent.

## 2. Originality
Draw every icon from the real object using the spec. Never reproduce path data or recognisable
drawings from Lucide, Feather, Heroicons, Phosphor, Tabler, Material, Bootstrap, Remix, Font
Awesome or any other set — not even from memory. Compute geometry yourself. Do not draw brand
logos. Every icon must clearly communicate its concept; no placeholders, no abstract filler.

## 3. Geometry toolkit (recommended)
`TOOLING/src/geo.ts` (paper.js) gives exact boolean geometry. Import it in your batch module with
a file URL:
```js
import { roundRect, circle, ellipse, capsule, thickPolyline, polygon, union, subtract, intersect, clipStrokes, radialPoints, fmt }
  from "file:///C:/Users/Kaye/mike-project/ikions/packages/tooling/src/geo.ts";
```
- Filled variants: build the solid silhouette with `union(...)`, cut details with `subtract(...)`.
  Output already has correct hole winding; still add `fill-rule="evenodd" clip-rule="evenodd"`
  when a path contains holes.
- `capsule(x1,y1,x2,y2,width)` = a stroke as a filled shape (great for cutting slots).
- `clipStrokes(d, keepOut)` removes the part of an outline stroke inside a shape (for breathing gaps).
- Round your own hand-written numbers to ≤ 2 decimals.

## 4. Batch module and workflow
1. Write `SCRATCH/batches/<BATCH_ID>.mjs` — default export an array of
   `{ name, title, category, description, tags, aliases, outline: [...], filled: [...] }`
   where outline/filled are inner SVG element strings. Helpers you may define:
   ```js
   const heavy = (d) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
   const bar = (d, w = 2) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
   const holes = (d) => `<path fill-rule="evenodd" clip-rule="evenodd" d="${d}"/>`;
   ```
2. Write sources: `npx tsx src/cli/write-batch.ts "SCRATCH/batches/<BATCH_ID>.mjs" --force`
3. Check: `npx tsx src/cli/batch.ts <BATCH_ID> --check` → must end with "All icons in this batch are drawn and valid."
4. Review: `npx tsx src/cli/sheet.ts <names...> --out "SCRATCH/review-<BATCH_ID>"` then Read every
   `detail-*.png` and `sizes-*.png`. For each icon ask: recognisable at 16 px? filled variant has
   real cutouts and no accidental filled holes or seams? weight matches the reference sheet?
   centred in the live area? distinct from its siblings? Fix and re-render. Do two review rounds;
   a third only for icons that still fail.
5. Delete `SCRATCH/review-<BATCH_ID>` and `SCRATCH/ref-<BATCH_ID>` when finished (disk is tight).

## 5. Rules
- Only create/modify `assets/source/<name>/` for names in your batch. Never touch other files.
- Every icon needs both variants. The filled variant is designed separately (solid silhouette,
  cutouts, or heavier strokes per the spec) — never just `fill` on the outline when the outline
  has interior detail.
- Metadata: `description` one sentence ending with a period (12–160 chars); 3–8 lowercase tags
  that are real search terms (synonyms, use cases); aliases kebab-case, optional, and they must
  pass `--check` (no alias may equal any other planned or published icon name).
- Use only `path`, `circle`, `ellipse`, `rect`, `line`, `polyline`, `polygon`. No groups,
  transforms, ids, masks, gradients or opacity. Colours only `currentColor` / `none`.
- Siblings must differ meaningfully (e.g. `battery-low` vs `battery-medium` differ in fill level),
  but must not be near-identical copies of other icons in the library.
- If a concept genuinely cannot be made legible at 16 px, skip it and say so in your report
  rather than shipping a weak icon.

## 6. Final report (short)
Reply with: batch id, number of icons completed (both variants, `--check` passing), any names
skipped and why, and any icon you are unsure about.

## Addendum: dropped concepts and same-idea duplicates

- Skip every concept listed in the `"$dropped"` object of `assets/plan/handdrawn.json`.
- Before drawing a concept, check that the same idea doesn't already exist under another name. Grep `assets/source/*/meta.json` names and aliases, and check badge composites such as `user-settings` and `user-question`. Known merges: user-cog → user-settings, user-question-mark → user-question, admin → user-shield, face-smile → smile, chat-typing → chat-dots, layer-plus → layers-plus, list-unordered → list, save-disk → save, document-stack → file-stack, package-box → package, cloud-deploy → cloud-upload, rest → api, remote-control → remote, memory → microchip, module → puzzle, puzzle-piece → puzzle. Never recreate a merged name: it is listed in `$dropped`.
- If an icon for the same idea already exists, don't draw it; list it under "Skipped (already exists as X)" in your report.
- Filled curved shapes: building them as a union of capsules can leave scalloped edges and push files over 5 KB. Batch b028 has smooth offset helpers (`growS`, `lineS`) in `scratchpad/batches/b028.mjs`. Copy them into your own module if you need them.
