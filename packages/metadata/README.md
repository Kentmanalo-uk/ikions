# @ikions/metadata

Metadata for every Ikions icon — names, titles, aliases, tags, categories, collections — plus the ranked search engine used on the website.

## Install

```bash
npm install @ikions/metadata
```

## Usage

```ts
import { categories, createSearchIndex, getIcon, icons, synonyms } from "@ikions/metadata";

getIcon("magnifying-glass")?.name; // "search"
const index = createSearchIndex(icons, categories, synonyms);
index.search("payment", { limit: 10 });
```

A plain JSON file is available at `@ikions/metadata/icons.json`.

See the documentation on the Ikions website (/docs).

## License

Free for personal and commercial use under the Ikions License (see `LICENSE`). Ikions is free, not open source: the icons may not be resold or redistributed as a set. The Ikions name and logo are not covered by the license.
