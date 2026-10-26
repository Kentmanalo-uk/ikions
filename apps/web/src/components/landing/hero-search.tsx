"use client";

import { SearchIcon } from "@ikions/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useId, useMemo, useState } from "react";
import { loadClientCatalog, type ClientCatalog } from "@/lib/client-catalog";
import { NodeIcon } from "../ui/node-icon";

type Catalog = ClientCatalog;

const SUGGESTIONS = ["payment", "message", "trash", "weather", "code"];

let catalogPromise: Promise<Catalog> | null = null;
/** The catalog (metadata, nodes, search index) is loaded on first interaction. */
const loadCatalog = () => (catalogPromise ??= loadClientCatalog());

/** Hero search with instant results; Enter opens the full explorer. */
export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const deferred = useDeferredValue(query);
  const id = useId();

  const prepare = () => {
    if (!catalog) void loadCatalog().then(setCatalog);
  };

  const results = useMemo(
    () => (catalog && deferred.trim() ? catalog.searchIndex.search(deferred, { limit: 14 }).map((r) => r.icon) : []),
    [catalog, deferred],
  );
  const go = (q: string) => router.push(`/icons?q=${encodeURIComponent(q.trim())}`);
  const searching = Boolean(deferred.trim());

  return (
    <div className="w-full max-w-xl">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go(query);
        }}
        className="relative"
      >
        <label htmlFor={id} className="sr-only">
          Search icons
        </label>
        <SearchIcon size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-2" />
        <input
          id={id}
          type="search"
          value={query}
          onFocus={prepare}
          onPointerEnter={prepare}
          onChange={(e) => {
            prepare();
            setQuery(e.target.value.slice(0, 100));
          }}
          placeholder="Search icons…"
          autoComplete="off"
          spellCheck={false}
          aria-describedby={`${id}-status`}
          className="h-[56px] w-full rounded-full border border-transparent bg-surface pl-12 pr-28 text-[16px] text-ink shadow-soft placeholder:text-ink-2 focus:border-accent focus:outline-none focus-visible:outline-none focus:ring-4 focus:ring-accent/15"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-full bg-accent px-5 text-[13.5px] font-medium text-accent-contrast hover:bg-accent-hover"
        >
          Search
        </button>
      </form>

      <p id={`${id}-status`} className="sr-only" aria-live="polite">
        {searching && catalog ? `${results.length} matching icons shown` : ""}
      </p>

      {searching ? (
        !catalog ? (
          <p className="mt-3 text-[14px] text-ink-2">Searching…</p>
        ) : results.length ? (
          <ul className="ik-rise mt-3 grid grid-cols-7 gap-1 rounded-[22px] bg-surface p-2 shadow-soft" aria-label="Matching icons">
            {results.map((icon) => {
              const nodes = catalog.getNodes(icon.name);
              return (
                <li key={icon.name}>
                  <Link
                    href={`/icons/${icon.name}`}
                    title={icon.title}
                    className="grid aspect-square place-items-center rounded-full text-ink-2 transition-colors hover:bg-subtle hover:text-ink"
                  >
                    {nodes ? <NodeIcon nodes={nodes} size={22} /> : null}
                    <span className="sr-only">{icon.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-[14px] text-ink-2">No icons match yet. Try a synonym.</p>
        )
      ) : (
        <ul className="mt-3 flex flex-wrap items-center gap-1 text-[13px]" aria-label="Example searches">
          <li aria-hidden="true" className="pr-1 text-[12.5px] font-medium text-ink-2">Try</li>
          {SUGGESTIONS.map((s) => (
            <li key={s} className="max-sm:[&:nth-child(6)]:hidden">
              <button
                type="button"
                onClick={() => {
                  prepare();
                  setQuery(s);
                }}
                className="rounded-full bg-surface/80 px-3 py-1.5 text-ink-2 sm:px-2.5 sm:py-0.5 shadow-card transition-colors hover:bg-subtle hover:text-ink"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
