"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A string set persisted in Web Storage and shared across components.
 * Used for favourites (localStorage) and the export selection (sessionStorage).
 */
type StorageKind = "local" | "session";

const EMPTY: readonly string[] = Object.freeze([]);
const cache = new Map<string, readonly string[]>();
const listeners = new Map<string, Set<() => void>>();

const storage = (kind: StorageKind): Storage | null => {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
};

function read(key: string, kind: StorageKind): readonly string[] {
  const cached = cache.get(key);
  if (cached) return cached;
  let value: readonly string[] = EMPTY;
  try {
    const raw = storage(kind)?.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) value = parsed.filter((v): v is string => typeof v === "string").slice(0, 2000);
  } catch {
    value = EMPTY;
  }
  cache.set(key, value);
  return value;
}

function write(key: string, kind: StorageKind, value: readonly string[]) {
  cache.set(key, value);
  try {
    storage(kind)?.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be full or disabled; the in-memory value still works.
  }
  listeners.get(key)?.forEach((listener) => listener());
}

export function useStoredSet(key: string, kind: StorageKind = "local") {
  const subscribe = useCallback(
    (listener: () => void) => {
      const set = listeners.get(key) ?? new Set();
      set.add(listener);
      listeners.set(key, set);
      const onStorage = (event: StorageEvent) => {
        if (event.key === key) {
          cache.delete(key);
          listener();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        set.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key],
  );
  const values = useSyncExternalStore(subscribe, () => read(key, kind), () => EMPTY);

  const has = useCallback((item: string) => values.includes(item), [values]);
  const toggle = useCallback(
    (item: string) => {
      const current = read(key, kind);
      write(key, kind, current.includes(item) ? current.filter((v) => v !== item) : [...current, item]);
    },
    [key, kind],
  );
  const add = useCallback(
    (items: string[]) => {
      const current = read(key, kind);
      write(key, kind, [...current, ...items.filter((i) => !current.includes(i))]);
    },
    [key, kind],
  );
  const remove = useCallback(
    (item: string) => write(key, kind, read(key, kind).filter((v) => v !== item)),
    [key, kind],
  );
  const clear = useCallback(() => write(key, kind, EMPTY), [key, kind]);

  return { values, has, toggle, add, remove, clear };
}

export const useFavorites = () => useStoredSet("ikions:favorites", "local");
export const useSelection = () => useStoredSet("ikions:selection", "session");
