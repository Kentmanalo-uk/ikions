"use client";

import type { IconVariants } from "@ikions/icons";
import { createSearchIndex, type SearchIndex } from "@ikions/metadata/search";
import type { CategoryMetadata, CollectionMetadata, IconMetadata } from "@ikions/metadata";
import { useEffect, useState } from "react";

/**
 * The browser-side catalog. The full library (metadata + drawing data) is
 * served once as a static, cacheable file (/data/catalog.json) and shared by
 * every interactive view, so no page bundles thousands of icons in its JS.
 */
export interface CatalogPayload {
  version: string;
  categories: CategoryMetadata[];
  collections: CollectionMetadata[];
  synonyms: Record<string, string[]>;
  icons: IconMetadata[];
  nodes: Record<string, IconVariants>;
}

export interface ClientCatalog {
  version: string;
  icons: IconMetadata[];
  /** Categories with published icons. */
  categories: CategoryMetadata[];
  collections: CollectionMetadata[];
  searchIndex: SearchIndex;
  getIcon(name: string): IconMetadata | undefined;
  getNodes(name: string): IconVariants | undefined;
}

export const CATALOG_URL = "/data/catalog.json";

let cache: ClientCatalog | null = null;
let pending: Promise<ClientCatalog> | null = null;
const listeners = new Set<(c: ClientCatalog) => void>();

export function buildClientCatalog(payload: CatalogPayload): ClientCatalog {
  const byName = new Map(payload.icons.map((i) => [i.name, i]));
  return {
    version: payload.version,
    icons: payload.icons,
    categories: payload.categories.filter((c) => c.count > 0),
    collections: payload.collections,
    searchIndex: createSearchIndex(payload.icons, payload.categories, payload.synonyms),
    getIcon: (name) => byName.get(name),
    getNodes: (name) => payload.nodes[name],
  };
}

/** Make a catalog available synchronously (used by tests and preloaded pages). */
export function primeClientCatalog(catalog: ClientCatalog | null) {
  cache = catalog;
  pending = catalog ? Promise.resolve(catalog) : null;
  if (catalog) listeners.forEach((l) => l(catalog));
}

export function getLoadedCatalog(): ClientCatalog | null {
  return cache;
}

/** Fetch the catalog once per page load; later calls share the same promise. */
export function loadClientCatalog(): Promise<ClientCatalog> {
  if (cache) return Promise.resolve(cache);
  pending ??= fetch(CATALOG_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`Catalog request failed: ${res.status}`);
      return res.json() as Promise<CatalogPayload>;
    })
    .then((payload) => {
      cache = buildClientCatalog(payload);
      listeners.forEach((l) => l(cache!));
      return cache;
    })
    .catch((error: unknown) => {
      pending = null;
      throw error;
    });
  return pending;
}

/** The catalog once loaded (null until then). Starts loading when `enabled`. */
export function useClientCatalog(enabled = true): { catalog: ClientCatalog | null; error: boolean } {
  const [catalog, setCatalog] = useState<ClientCatalog | null>(cache);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!enabled || cache) {
      if (cache) setCatalog(cache);
      return;
    }
    let live = true;
    const listener = (c: ClientCatalog) => live && setCatalog(c);
    listeners.add(listener);
    loadClientCatalog().catch(() => live && setError(true));
    return () => {
      live = false;
      listeners.delete(listener);
    };
  }, [enabled]);
  return { catalog, error };
}
