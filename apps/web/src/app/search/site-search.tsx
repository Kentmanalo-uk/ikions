"use client";

import { normalizeQuery } from "@ikions/metadata/search";
import { SearchIcon } from "@ikions/react";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { NodeIcon } from "@/components/ui/node-icon";
import { Segmented } from "@/components/ui/segmented";
import { useClientCatalog } from "@/lib/client-catalog";
import { docPages } from "@/lib/docs";

type Scope = "all" | "icons" | "docs";

const matches = (text: string, words: string[]) => {
  const haystack = normalizeQuery(text);
  return words.every((w) => haystack.includes(w));
};

/** One search box for icons, categories, collections and documentation. */
export function SiteSearch() {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [urlRead, setUrlRead] = useState(false);
  const deferred = useDeferredValue(query);
  const { catalog } = useClientCatalog();
  const inputRef = useRef<HTMLInputElement>(null);

  // The page is statically rendered; apply ?q= and ?scope= after mount.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery((params.get("q") ?? "").slice(0, 100));
    const s = params.get("scope");
    if (s === "icons" || s === "docs") setScope(s);
    setUrlRead(true);
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    if (!urlRead) return;
    const next = new URLSearchParams();
    if (query.trim()) next.set("q", query.trim());
    if (scope !== "all") next.set("scope", scope);
    const search = next.toString();
    window.history.replaceState(null, "", `/search${search ? `?${search}` : ""}`);
  }, [urlRead, query, scope]);

  const words = normalizeQuery(deferred).split(" ").filter(Boolean);
  const results = useMemo(() => {
    if (!words.length) return { icons: [], docs: [], categories: [], collections: [] };
    return {
      icons: scope === "docs" || !catalog ? [] : catalog.searchIndex.search(deferred, { limit: 48 }).map((r) => r.icon),
      docs: scope === "icons" ? [] : docPages.filter((p) => matches(`${p.title} ${p.description} ${p.keywords.join(" ")}`, words)),
      categories: scope === "all" && catalog ? catalog.categories.filter((c) => matches(`${c.name} ${c.slug} ${c.description}`, words)) : [],
      collections: scope === "all" && catalog ? catalog.collections.filter((c) => matches(`${c.name} ${c.description}`, words)) : [],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferred, scope, catalog]);

  const total = results.icons.length + results.docs.length + results.categories.length + results.collections.length;

  return (
    <div>
      <div className="relative isolate">
        <div className="ik-page-glow" aria-hidden="true" />
        <h1 className="font-display text-[40px] font-semibold tracking-[-0.04em]">Search</h1>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <SearchIcon size={20} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2" />
          <label htmlFor="site-search" className="sr-only">
            Search Ikions
          </label>
          <input
            ref={inputRef}
            id="site-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value.slice(0, 100))}
            placeholder="Icons, categories or documentation"
            autoComplete="off"
            className="h-12 w-full rounded-full border border-line bg-surface pl-11 pr-3 text-[16px] placeholder:text-ink-2 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
          />
        </div>
        <Segmented
          label="Search scope"
          value={scope}
          onChange={setScope}
          options={[
            { value: "all", label: "Everything" },
            { value: "icons", label: "Icons" },
            { value: "docs", label: "Docs" },
          ]}
        />
      </div>

      <p className="mt-4 text-[14px] text-ink-2" aria-live="polite">
        {words.length ? `${total} ${total === 1 ? "result" : "results"}` : "Start typing to search."}
      </p>

      {results.docs.length > 0 ? (
        <section className="mt-8" aria-labelledby="docs-results">
          <h2 id="docs-results" className="text-[13px] font-semibold uppercase tracking-wide text-ink-2">
            Documentation
          </h2>
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-[22px] bg-surface shadow-card">
            {results.docs.map((page) => (
              <li key={page.href}>
                <Link href={page.href} className="block px-4 py-3 hover:bg-subtle">
                  <span className="font-medium">{page.title}</span>
                  <span className="mt-0.5 block text-[13.5px] text-ink-2">{page.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {results.categories.length + results.collections.length > 0 ? (
        <section className="mt-8" aria-labelledby="group-results">
          <h2 id="group-results" className="text-[13px] font-semibold uppercase tracking-wide text-ink-2">
            Categories & collections
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {results.categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/categories/${c.slug}`} className="block rounded-full bg-surface px-4 py-2 text-[14px] shadow-card transition-colors hover:bg-selected hover:text-accent-text">
                  {c.name} <span className="text-ink-2">· {c.count}</span>
                </Link>
              </li>
            ))}
            {results.collections.map((c) => (
              <li key={c.slug}>
                <Link href={`/collections/${c.slug}`} className="block rounded-full bg-surface px-4 py-2 text-[14px] shadow-card transition-colors hover:bg-selected hover:text-accent-text">
                  {c.name} <span className="text-ink-2">· collection</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {results.icons.length > 0 ? (
        <section className="mt-8" aria-labelledby="icon-results">
          <div className="flex items-center justify-between">
            <h2 id="icon-results" className="text-[13px] font-semibold uppercase tracking-wide text-ink-2">
              Icons
            </h2>
            <Link href={`/icons?q=${encodeURIComponent(deferred.trim())}`} className="text-[13.5px] font-medium text-accent-text hover:underline">
              Open in explorer →
            </Link>
          </div>
          <ul className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-1 rounded-[24px] bg-surface p-2.5 shadow-card">
            {results.icons.map((icon) => (
              <li key={icon.name}>
                <Link
                  href={`/icons/${icon.name}`}
                  className="flex h-[96px] flex-col items-center justify-center gap-2 rounded-[18px] transition-colors hover:bg-selected hover:text-accent-text"
                >
                  {catalog?.getNodes(icon.name) ? <NodeIcon nodes={catalog.getNodes(icon.name)!} size={26} /> : null}
                  <span className="w-full truncate px-1 text-center text-[11.5px] text-ink-2">{icon.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {words.length > 0 && total === 0 ? (
        <p className="mt-10 text-[15px] text-ink-2">
          Nothing found for “{deferred.trim()}”. Try a synonym or browse the{" "}
          <Link href="/categories" className="text-accent-text hover:underline">
            categories
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
