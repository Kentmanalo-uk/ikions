# Ikions Icon Design Specification

This is the internal rulebook for drawing Ikions icons. Every icon in
`assets/source/` must follow it. The validator (`pnpm icons:validate`)
enforces the mechanical rules; the visual rules are enforced by review of the
contact sheets (`pnpm icons:sheet`, output in `review/`).

Ikions artwork is original. Never trace, copy, or adapt paths from Lucide,
Heroicons, Phosphor, Tabler, Material Symbols, Feather, Remix, Bootstrap Icons
or any other library. Start every icon from the object itself and these rules.

---

## 1. Grid

| Rule | Value |
|---|---|
| Artboard | 24 × 24, `viewBox="0 0 24 24"` |
| Live area | 20 × 20, from (2, 2) to (22, 22) |
| Optical overshoot | Circles and diagonals may reach 1.5 / 22.5 |
| Keyline: square | 18 × 18 (3 → 21) |
| Keyline: circle | diameter 20 (r = 10 at 12,12) — use r = 9 for most "round" icons |
| Keyline: portrait | 16 × 20 (4 → 20 horizontally) |
| Keyline: landscape | 20 × 16 (2 → 22, 4 → 20) |

Coordinates use at most 2 decimal places. Prefer whole and half units for
straight edges; keep stroke centres on .0 or .5 so 24 px rendering stays crisp.

## 2. Outline variant

* Root element, exactly:
  ```xml
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" stroke-width="1.75"
       stroke-linecap="round" stroke-linejoin="round">
  ```
* Stroke width **1.75** everywhere. Children never override `stroke-width`
  (the `strokeWidth` prop must scale the whole icon uniformly).
* Small solid accents (dots, LEDs, pupils) are allowed as
  `<circle ... fill="currentColor" stroke="none"/>` with r between 1 and 1.5.
* Minimum gap between two parallel strokes: 2 units (centre-to-centre 3.75).
* Minimum enclosed counter: 3 × 3 units of empty space.

## 3. Filled variant

Filled icons are drawn separately; they are **not** the outline with a fill.

* Root element, exactly:
  ```xml
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
       fill="currentColor">
  ```
* The main mass is one solid silhouette, sized to the same keyline as the
  outline's **outer stroke edge** (outline centre line + 0.875).
* Interior detail becomes **cutouts** (transparent holes) using
  `fill-rule="evenodd" clip-rule="evenodd"` sub-paths, 1.5–2 units wide.
* Secondary, detached parts stay solid and keep a 1.5–2 unit gap from the
  main mass.
* Thin linear parts that must stay linear (handles, antennae, waves) may be
  drawn as strokes: `fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round"` (2 units — slightly heavier than outline to match
  filled mass). These do not respond to the `strokeWidth` prop.
* Never use masks, clip-paths, gradients, opacity or ids.

### Filled construction patterns

| Pattern | When | How |
|---|---|---|
| **Solid silhouette** | Objects that are naturally solid (cloud, star, moon) | Same centre-line path as the outline with `stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"` added, so the silhouette matches the outline's outer edge exactly and corners stay round. Add an evenodd sub-path for any real opening (gear hub). |
| **Cutout** | Containers with interior detail (mail, clock, lock, trash, camera) | Outer shape drawn at outline centre line + 0.875; details become evenodd holes 1.5–1.75 wide. |
| **Split mass** | Objects whose outline has a dividing line (folder, calendar, file fold) | The dividing line becomes a 1.5 unit gap that splits the silhouette into separate solid pieces. |
| **Heavy glyph** | Pure line marks with no enclosed area (arrows, chevrons, close, check, plus, minus, menu) | Same geometry drawn as strokes at `stroke-width="2.5"` with round caps and joins. |
| **Glint** | Optional playful accent on glossy, round objects (lens, heart) | A short 1.5–1.75 wide arc cutout in the upper-left at ~55% of the radius. Use sparingly. |

## 4. Signature Ikions character

1. **Soft corners.** Corner radius scales with the shape:

   | Shape span | Outer radius (outline centre line) |
   |---|---|
   | ≥ 16 | 3 |
   | 11 – 15 | 2.5 |
   | 7 – 10 | 2 |
   | ≤ 6 | 1 |

   Filled silhouettes use the same radius + 0.875 on the outside edge.
2. **Breathing gaps.** Where a secondary element meets a primary one
   (a pen nib meeting a line, a badge on a document, a handle meeting a
   lens), prefer a clear 1.75–2 unit gap over a touching join when it does
   not hurt recognition. This is the most recognisable Ikions trait.
3. **Round terminals, round joins.** Never mitre.
4. **Calm detail.** At most three internal details per icon. If a detail is
   not readable at 16 px, remove it.
5. **Friendly proportions.** Slightly generous counters, objects sit on the
   optical centre (12, 12.25) rather than the mathematical one when their
   weight is at the bottom.

## 5. Optical sizes to check

Every icon pair is reviewed at 16, 20, 24 and 32 px in light and dark on the
contact sheet. If the filled variant blocks up at 16 px, redesign both
variants (do not publish one without the other).

## 6. File & metadata rules

```
assets/source/<name>/
  outline.svg
  filled.svg
  meta.json
```

* `<name>`: lowercase kebab-case, `a-z`, `0-9`, `-`. Object first, modifier
  second: `file-lock`, `arrow-up-right`, `user-add`.
* `meta.json`:
  ```json
  {
    "name": "camera",
    "title": "Camera",
    "category": "media",
    "description": "Capture photos or open a camera interface.",
    "tags": ["photo", "picture", "capture"],
    "aliases": ["photography", "take-picture"],
    "variants": ["outline", "filled"],
    "added": "0.1.0"
  }
  ```
  * `category` must exist in `assets/categories.json`.
  * `aliases` are alternative *names* for the same concept (they are also
    search terms); `tags` are related words and use cases.
  * No two icons may share a name or alias.
* Allowed elements: `path`, `circle`, `ellipse`, `rect`, `line`, `polyline`,
  `polygon`. No groups, no `transform`, no `style`, no `id`, no `class`.
* Allowed colours: `currentColor` and `none` only.

## 7. Review checklist (per icon)

1. Researched the object; picked its most recognisable traits.
2. Outline drawn on the grid, 1.75 stroke, radius table applied.
3. Filled drawn independently, cutouts real, no accidental holes.
4. Contact sheet checked at 16 / 20 / 24 / 32, light and dark.
5. Weight compared with neighbouring icons in the same category.
6. Checked for accidental similarity to other libraries' drawings.
7. Metadata written; validator passes.
