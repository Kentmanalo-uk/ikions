# @ikions/icons

Original Ikions icons as optimised SVG files (Outline and Filled), SVG sprites and a framework-free `toSvg()` helper.

## Install

```bash
npm install @ikions/icons
```

## Usage

```js
import { toSvg } from "@ikions/icons";

const svg = toSvg("bell", "filled", { size: 20, color: "#5555E8", title: "Notifications" });
```

Files: `@ikions/icons/outline/<name>.svg`, `@ikions/icons/filled/<name>.svg`, `@ikions/icons/sprite/outline.svg`, `@ikions/icons/sprite/filled.svg` (symbol ids `ikions-<name>`).

See the documentation on the Ikions website (/docs).

## License

MIT. The Ikions name and logo are not covered by the license.
