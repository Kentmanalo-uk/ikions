# @ikions/react

Typed, tree-shakeable React components for Ikions icons, with Outline and Filled variants.

## Install

```bash
npm install @ikions/react
```

## Usage

```tsx
import { CameraIcon } from "@ikions/react";

<CameraIcon size={28} variant="outline" color="currentColor" strokeWidth={1.75} />;
```

Props: `size` (24), `variant` (`"outline"` | `"filled"`), `color` (`currentColor`), `gradient` (`{ from, to, angle? }`), `strokeWidth` (1.75, outline only), `title`, plus any SVG attribute. Icons without `title`/`aria-label` are `aria-hidden`. Requires React 18+.

See the documentation on the Ikions website (/docs).

## License

MIT. The Ikions name and logo are not covered by the license.
