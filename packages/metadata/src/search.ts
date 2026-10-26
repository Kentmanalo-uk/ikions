import type { IconMetadata } from "./types.js";

/**
 * Ranked local icon search.
 *
 * Ranking priority (highest first):
 *   1. exact canonical name
 *   2. exact alias
 *   3. name / alias prefix
 *   4. keyword (tag) match, including synonym expansion
 *   5. description match
 *   6. category match
 * A bounded edit-distance pass adds typo tolerance when nothing else matches.
 *
 * The index is plain data and needs no external service; the same interface
 * can later be backed by a hosted search service without changing callers.
 */

export interface SearchOptions {
  /** Restrict results to one category slug. */
  category?: string;
  /** Maximum number of results. Default: unlimited. */
  limit?: number;
}

export interface SearchResult {
  icon: IconMetadata;
  score: number;
}

export interface SearchIndex {
  search(query: string, options?: SearchOptions): SearchResult[];
}

interface CategoryLike {
  slug: string;
  name: string;
}

interface IndexedIcon {
  icon: IconMetadata;
  name: string;
  nameTokens: string[];
  aliases: string[];
  aliasTokens: string[];
  tags: string[];
  tagTokens: string[];
  descriptionTokens: string[];
  categoryTokens: string[];
}

const SCORE = {
  exactName: 1000,
  exactAlias: 900,
  namePrefix: 700,
  aliasPrefix: 600,
  nameToken: 140,
  nameTokenPrefix: 90,
  aliasToken: 110,
  aliasTokenPrefix: 70,
  tag: 100,
  tagPrefix: 55,
  synonym: 65,
  description: 30,
  descriptionPrefix: 15,
  category: 20,
  fuzzy: 25,
} as const;

const MAX_QUERY_LENGTH = 100;

/** Lowercase, strip unsupported characters and collapse whitespace. */
export function normalizeQuery(query: string): string {
  return query
    .slice(0, MAX_QUERY_LENGTH)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const tokenize = (text: string) => normalizeQuery(text).split(/[\s-]+/).filter(Boolean);

/** Optimal string alignment distance, capped for speed. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, (_, i) => {
    const row = new Array<number>(cols).fill(0);
    row[0] = i;
    return row;
  });
  for (let j = 0; j < cols; j++) d[0]![j] = j;
  for (let i = 1; i < rows; i++) {
    let rowMin = Infinity;
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, d[i - 2]![j - 2]! + 1);
      d[i]![j] = v;
      rowMin = Math.min(rowMin, v);
    }
    if (rowMin > max) return max + 1;
  }
  return d[a.length]![b.length]!;
}

const STOP_WORDS = new Set(["a", "an", "the", "or", "and", "of", "to", "for", "in", "on", "with", "icon", "icons"]);

export function createSearchIndex(
  icons: readonly IconMetadata[],
  categories: readonly CategoryLike[] = [],
  synonyms: Readonly<Record<string, readonly string[]>> = {},
): SearchIndex {
  const categoryNames = new Map(categories.map((c) => [c.slug, c.name]));
  const indexed: IndexedIcon[] = icons.map((icon) => ({
    icon,
    name: icon.name,
    nameTokens: tokenize(icon.name),
    aliases: icon.aliases,
    aliasTokens: icon.aliases.flatMap(tokenize),
    tags: icon.tags.map(normalizeQuery),
    tagTokens: icon.tags.flatMap(tokenize),
    descriptionTokens: tokenize(icon.description).filter((t) => !STOP_WORDS.has(t)),
    categoryTokens: [...tokenize(icon.category), ...tokenize(categoryNames.get(icon.category) ?? "")],
  }));

  const synonymMap = new Map<string, string[]>();
  for (const [key, values] of Object.entries(synonyms)) {
    const k = normalizeQuery(key);
    synonymMap.set(k, [...(synonymMap.get(k) ?? []), ...values.map(normalizeQuery)]);
  }

  function scoreToken(entry: IndexedIcon, token: string): number {
    let best = 0;
    const consider = (value: number) => {
      if (value > best) best = value;
    };
    for (const t of entry.nameTokens) {
      if (t === token) consider(SCORE.nameToken);
      else if (t.startsWith(token)) consider(SCORE.nameTokenPrefix);
    }
    for (const t of entry.aliasTokens) {
      if (t === token) consider(SCORE.aliasToken);
      else if (t.startsWith(token)) consider(SCORE.aliasTokenPrefix);
    }
    for (const t of entry.tagTokens) {
      if (t === token) consider(SCORE.tag);
      else if (token.length >= 2 && t.startsWith(token)) consider(SCORE.tagPrefix);
    }
    const related = synonymMap.get(token);
    if (related) {
      for (const term of related) {
        if (entry.name === term || entry.aliases.includes(term) || entry.tags.includes(term)) consider(SCORE.synonym);
      }
    }
    for (const t of entry.descriptionTokens) {
      if (t === token) consider(SCORE.description);
      else if (token.length >= 3 && t.startsWith(token)) consider(SCORE.descriptionPrefix);
    }
    if (entry.categoryTokens.includes(token)) consider(SCORE.category);
    return best;
  }

  function fuzzyToken(entry: IndexedIcon, token: string): number {
    if (token.length < 4) return 0;
    const max = token.length >= 7 ? 2 : 1;
    const candidates = [...entry.nameTokens, ...entry.aliasTokens, ...entry.tagTokens];
    return candidates.some((c) => editDistance(token, c, max) <= max) ? SCORE.fuzzy : 0;
  }

  return {
    search(rawQuery, options = {}) {
      const query = normalizeQuery(rawQuery);
      const pool = options.category ? indexed.filter((e) => e.icon.category === options.category) : indexed;
      let results: SearchResult[];

      if (!query) {
        results = pool.map((e) => ({ icon: e.icon, score: 0 }));
      } else {
        const joined = query.replace(/\s+/g, "-");
        const tokens = tokenize(query).filter((t) => !STOP_WORDS.has(t));
        const scored = (fuzzy: boolean) =>
          pool
            .map((entry): SearchResult | null => {
              let score = 0;
              if (entry.name === joined) score = SCORE.exactName;
              else if (entry.aliases.includes(joined)) score = SCORE.exactAlias;
              else if (entry.name.startsWith(joined)) score = SCORE.namePrefix;
              else if (entry.aliases.some((a) => a.startsWith(joined))) score = SCORE.aliasPrefix;

              // Every token must match somewhere (AND semantics).
              let tokenScore = 0;
              for (const token of tokens) {
                const s = scoreToken(entry, token) || (fuzzy ? fuzzyToken(entry, token) : 0);
                if (s === 0) {
                  tokenScore = -1;
                  break;
                }
                tokenScore += s;
              }
              if (tokenScore < 0 && score === 0) return null;
              return { icon: entry.icon, score: score + Math.max(tokenScore, 0) };
            })
            .filter((r): r is SearchResult => r !== null);

        results = scored(false);
        if (results.length === 0) results = scored(true);
      }

      results.sort((a, b) => b.score - a.score || a.icon.name.localeCompare(b.icon.name));
      return options.limit ? results.slice(0, options.limit) : results;
    },
  };
}
