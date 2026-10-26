"use client";

import type { IconVariants } from "@ikions/icons";
import type { CategoryMetadata, IconMetadata } from "@ikions/metadata";
import { CheckIcon, CloseIcon, FilterIcon, LoaderIcon, SearchIcon } from "@ikions/react";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useClientCatalog } from "@/lib/client-catalog";
import { DEFAULT_OPTIONS, svgMarkup, type IconOptions } from "@/lib/snippets";
import { useFavorites, useSelection } from "@/lib/stored-set";
import { buttonClass } from "../ui/button";
import { CopyButton } from "../ui/copy-button";
import { Dialog } from "../ui/dialog";
import { NodeIcon } from "../ui/node-icon";
import { Segmented } from "../ui/segmented";
import { Inspector } from "./inspector";
import { SelectionBar } from "./selection-bar";
import { useMediaQuery } from "./use-media-query";

type Sort = "relevance" | "name" | "category" | "recent";
const SORTS: { value: Sort; label: string }[] = [
  { value: "relevance", label: "Best match" },
  { value: "name", label: "Name (A–Z)" },
  { value: "category", label: "Category" },
  { value: "recent", label: "Recently added" },
];

const ALL = "all";
const FAVORITES = "favorites";
/** Tiles rendered per step; more are added as the grid scrolls into view. */
const PAGE = 180;

export type InitialIcon = IconMetadata & { nodes: IconVariants };

export interface ExplorerInitial {
  /** First screen of icons (server-rendered) so the page paints before the catalog loads. */
  icons: InitialIcon[];
  categories: CategoryMetadata[];
  total: number;
}

const compareVersions = (a: string, b: string) => {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  return 0;
};

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

export function Explorer({ initial }: { initial: ExplorerInitial }) {
  const { catalog, error: catalogError } = useClientCatalog();
  const initialNodes = useMemo(() => new Map(initial.icons.map((i) => [i.name, i.nodes])), [initial.icons]);
  const categories = catalog?.categories ?? initial.categories;
  const total = catalog?.icons.length ?? initial.total;
  const getNodes = useCallback((name: string) => catalog?.getNodes(name) ?? initialNodes.get(name), [catalog, initialNodes]);
  const getIcon = useCallback(
    (name: string): IconMetadata | undefined => catalog?.getIcon(name) ?? initial.icons.find((i) => i.name === name),
    [catalog, initial.icons],
  );
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [category, setCategory] = useState(ALL);
  const [sort, setSort] = useState<Sort>("relevance");
  const [options, setOptions] = useState<IconOptions>(DEFAULT_OPTIONS);
  const [active, setActive] = useState<string | null>(null);
  // The page is statically rendered; URL state is applied after mount.
  const [urlRead, setUrlRead] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)", true);
  const favorites = useFavorites();
  const selection = useSelection();
  const searchRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [limit, setLimit] = useState(PAGE);
  const pendingFocus = useRef<string | null>(null);

  const updateOptions = useCallback((patch: Partial<IconOptions>) => setOptions((o) => ({ ...o, ...patch })), []);

  // Until the full catalog arrives only the server-rendered first screen is
  // available, and only for the unfiltered view.
  const waiting = !catalog && (Boolean(deferredQuery.trim()) || category !== ALL || sort !== "relevance");
  const results = useMemo(() => {
    if (!catalog) return waiting ? [] : (initial.icons as IconMetadata[]);
    const scoped = category !== ALL && category !== FAVORITES ? category : undefined;
    let list: IconMetadata[] = catalog.searchIndex.search(deferredQuery, { category: scoped }).map((r) => r.icon);
    if (category === FAVORITES) list = list.filter((icon) => favorites.values.includes(icon.name));
    const effective = sort === "relevance" && !deferredQuery.trim() ? "name" : sort;
    if (effective === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (effective === "category") list = [...list].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
    else if (effective === "recent") list = [...list].sort((a, b) => compareVersions(b.added, a.added) || a.name.localeCompare(b.name));
    return list;
  }, [catalog, waiting, initial.icons, deferredQuery, category, sort, favorites.values]);
  const visible = results.slice(0, limit);

  useEffect(() => setLimit(PAGE), [deferredQuery, category, sort]);

  // Render more tiles when the end of the grid approaches.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || limit >= results.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setLimit((l) => l + PAGE);
      },
      { rootMargin: "900px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [limit, results.length]);

  // Focus a tile that keyboard navigation asked for once it has rendered.
  useEffect(() => {
    const name = pendingFocus.current;
    if (!name) return;
    const tile = gridRef.current?.querySelector<HTMLElement>(`[data-icon="${name}"]`);
    if (tile) {
      pendingFocus.current = null;
      tile.focus();
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) setQuery(q.slice(0, 100));
    const c = params.get("category");
    if (c && (c === FAVORITES || initial.categories.some((x) => x.slug === c))) setCategory(c);
    const s = params.get("sort");
    if (SORTS.some((x) => x.value === s)) setSort(s as Sort);
    if (params.get("variant") === "filled") setOptions((o) => ({ ...o, variant: "filled" }));
    const icon = params.get("icon");
    if (icon && /^[a-z0-9-]{1,80}$/.test(icon)) setActive(icon);
    setUrlRead(true);
  }, [initial.categories]);

  // Keep the URL shareable without adding history entries.
  useEffect(() => {
    if (!urlRead) return;
    const next = new URLSearchParams();
    if (query.trim()) next.set("q", query.trim());
    if (category !== ALL) next.set("category", category);
    if (sort !== "relevance") next.set("sort", sort);
    if (options.variant === "filled") next.set("variant", "filled");
    if (active) next.set("icon", active);
    const search = next.toString();
    const url = `${window.location.pathname}${search ? `?${search}` : ""}`;
    if (url !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(null, "", url);
  }, [urlRead, query, category, sort, options.variant, active]);

  useEffect(() => setFocusIndex(0), [deferredQuery, category]);

  // Global shortcuts: "/" focuses search, Escape closes the inspector.
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "/" && !isTyping(event.target) && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      } else if (event.key === "Escape" && active && isDesktop && !document.querySelector("dialog[open]")) {
        const name = active;
        setActive(null);
        requestAnimationFrame(() => gridRef.current?.querySelector<HTMLElement>(`[data-icon="${name}"]`)?.focus());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, isDesktop]);

  const columns = () => {
    const grid = gridRef.current;
    if (!grid) return 1;
    return Math.max(1, getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length);
  };

  const moveFocus = (index: number) => {
    const clamped = Math.max(0, Math.min(results.length - 1, index));
    setFocusIndex(clamped);
    const name = results[clamped]?.name;
    if (!name) return;
    if (clamped >= limit) setLimit(clamped + PAGE);
    pendingFocus.current = name;
    gridRef.current?.querySelector<HTMLElement>(`[data-icon="${name}"]`)?.focus();
  };

  const onGridKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    // Act on the tile that actually has focus, not on remembered state.
    const focusedName = (event.target as HTMLElement).closest<HTMLElement>("[data-icon]")?.dataset.icon;
    const found = results.findIndex((icon) => icon.name === focusedName);
    const current = found >= 0 ? found : focusIndex;
    const cols = columns();
    const map: Record<string, number> = {
      ArrowRight: current + 1,
      ArrowLeft: current - 1,
      ArrowDown: current + cols,
      ArrowUp: current - cols,
      Home: 0,
      End: results.length - 1,
    };
    if (event.key in map) {
      event.preventDefault();
      moveFocus(map[event.key]!);
    } else if (event.key.toLowerCase() === "x" && focusedName) {
      event.preventDefault();
      selection.toggle(focusedName);
    }
  };

  const activeIcon = active ? getIcon(active) : undefined;
  const activeNodes = activeIcon ? getNodes(activeIcon.name) : undefined;
  const activeCategory = activeIcon ? categories.find((c) => c.slug === activeIcon.category)?.name : undefined;
  const filterLabel = category === ALL ? "All icons" : category === FAVORITES ? "Favourites" : categories.find((c) => c.slug === category)?.name;

  const sidebar = (
    <nav aria-label="Icon categories">
      <ul className="space-y-0.5">
        {[
          { slug: ALL, name: "All icons", count: total },
          { slug: FAVORITES, name: "Favourites", count: favorites.values.length },
        ].map((item) => (
          <li key={item.slug}>
            <CategoryButton
              label={item.name}
              count={item.count}
              active={category === item.slug}
              onClick={() => {
                setCategory(item.slug);
                setFiltersOpen(false);
              }}
            />
          </li>
        ))}
      </ul>
      <h2 className="mb-1.5 mt-5 px-2.5 text-[12px] font-semibold uppercase tracking-wide text-ink-2">Categories</h2>
      <ul className="space-y-0.5">
        {categories.map((c) => (
          <li key={c.slug}>
            <CategoryButton
              label={c.name}
              count={c.count}
              active={category === c.slug}
              onClick={() => {
                setCategory(c.slug);
                setFiltersOpen(false);
              }}
            />
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <div className="mx-auto flex max-w-[1440px] gap-0 px-0 lg:px-6">
      <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 overflow-y-auto border-r border-line py-6 pr-4 lg:block">
        {sidebar}
      </aside>

      <section className="min-w-0 flex-1 px-4 pb-32 pt-6 sm:px-6" aria-labelledby="explorer-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 id="explorer-title" className="font-display text-[26px] font-semibold tracking-[-0.03em]">
              {filterLabel}
            </h1>
            <p className="mt-1 text-[14px] text-ink-2" aria-live="polite">
              {waiting ? "Loading the full library…" : !catalog ? `${total} icons` : results.length === 1 ? "1 icon" : `${results.length} icons`}
              {deferredQuery.trim() ? ` for “${deferredQuery.trim()}”` : ""}
            </p>
          </div>
        </div>

        <div className="sticky top-16 z-20 -mx-4 mt-4 flex flex-wrap items-center gap-2 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="relative basis-full sm:min-w-[200px] sm:flex-1 sm:basis-auto">
            <SearchIcon size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-2" />
            <label htmlFor="icon-search" className="sr-only">
              Search icons
            </label>
            <input
              ref={searchRef}
              id="icon-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value.slice(0, 100))}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  moveFocus(0);
                } else if (e.key === "Escape" && query) {
                  e.preventDefault();
                  setQuery("");
                }
              }}
              placeholder="Search by name, alias or use case"
              autoComplete="off"
              spellCheck={false}
              className="h-10 w-full rounded-full border border-line bg-surface pl-10 pr-12 text-[14.5px] text-ink placeholder:text-ink-2 hover:border-line-strong focus:border-accent focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-accent/25"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-line bg-subtle px-1.5 font-mono text-[11px] text-ink-2 sm:block">
              /
            </kbd>
          </div>
          <Segmented
            label="Icon variant"
            value={options.variant}
            onChange={(variant) => updateOptions({ variant })}
            options={[
              { value: "outline", label: "Outline" },
              { value: "filled", label: "Filled" },
            ]}
          />
          <label htmlFor="icon-sort" className="sr-only">
            Sort icons
          </label>
          <select
            id="icon-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-9 rounded-full border border-line bg-surface px-3.5 text-[13px] text-ink"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button type="button" className={`${buttonClass.small} h-9 lg:hidden`} onClick={() => setFiltersOpen(true)} aria-haspopup="dialog">
            <FilterIcon size={16} />
            <span className="max-sm:sr-only">Categories</span>
          </button>
        </div>

        {waiting || catalogError ? (
          <div className="py-20 text-center text-[14px] text-ink-2" role="status">
            {catalogError ? (
              <>
                The icon library could not be loaded.{" "}
                <button type="button" className="font-medium text-accent-text underline" onClick={() => window.location.reload()}>
                  Retry
                </button>
              </>
            ) : (
              <span className="inline-flex items-center gap-2">
                <LoaderIcon size={18} className="animate-spin" /> Loading {total.toLocaleString("en")} icons…
              </span>
            )}
          </div>
        ) : results.length === 0 ? (
          <div className="mx-auto max-w-md py-20 text-center">
            <SearchIcon size={32} className="mx-auto text-ink-2" />
            <h2 className="mt-4 font-display text-[18px] font-semibold">No icons found</h2>
            <p className="mt-2 text-[14px] text-ink-2">
              {category === FAVORITES && favorites.values.length === 0
                ? "You have no favourites yet. Open an icon and press the heart to save it on this device."
                : "Try a broader word, a synonym, or search all categories."}
            </p>
            <div className="mt-5 flex justify-center gap-2">
              {query ? (
                <button type="button" className={buttonClass.secondary} onClick={() => setQuery("")}>
                  Clear search
                </button>
              ) : null}
              {category !== ALL ? (
                <button type="button" className={buttonClass.secondary} onClick={() => setCategory(ALL)}>
                  All categories
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <ul
            ref={gridRef}
            onKeyDown={onGridKeyDown}
            aria-label="Icons"
            aria-describedby="grid-help"
            className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] gap-1 sm:grid-cols-[repeat(auto-fill,minmax(96px,1fr))] sm:gap-1.5"
          >
            {visible.map((icon, index) => (
              <IconTile
                key={icon.name}
                icon={icon}
                nodes={getNodes(icon.name)}
                options={options}
                focusable={index === focusIndex}
                active={icon.name === active}
                selected={selection.values.includes(icon.name)}
                selectionMode={selection.values.length > 0}
                onOpen={() => {
                  setFocusIndex(index);
                  setActive(icon.name);
                }}
                onToggleSelect={() => selection.toggle(icon.name)}
              />
            ))}
          </ul>
        )}
        {!waiting && limit < results.length ? <div ref={sentinelRef} className="h-px" aria-hidden="true" /> : null}
        <p id="grid-help" className="sr-only">
          Use arrow keys to move between icons, Enter to open details, and X to add or remove an icon from the selection.
        </p>
      </section>

      {isDesktop && activeIcon && activeNodes ? (
        <aside
          aria-label={`${activeIcon.title} inspector`}
          className="ik-drawer sticky top-16 h-[calc(100dvh-4rem)] w-[340px] shrink-0 border-l border-line bg-surface"
        >
          <Inspector icon={activeIcon} nodes={activeNodes} categoryName={activeCategory} options={options} onOptionsChange={updateOptions} onClose={() => setActive(null)} />
        </aside>
      ) : null}

      {!isDesktop ? (
        <>
          <Dialog open={Boolean(activeIcon && activeNodes)} onClose={() => setActive(null)} label={activeIcon ? `${activeIcon.title} details` : "Icon details"}>
            {activeIcon && activeNodes ? (
              <Inspector icon={activeIcon} nodes={activeNodes} categoryName={activeCategory} options={options} onOptionsChange={updateOptions} onClose={() => setActive(null)} autoFocusClose />
            ) : null}
          </Dialog>
          <Dialog open={filtersOpen} onClose={() => setFiltersOpen(false)} label="Categories">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="font-display text-[16px] font-semibold">Categories</h2>
              <button type="button" className={buttonClass.icon} aria-label="Close categories" onClick={() => setFiltersOpen(false)}>
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="overflow-y-auto p-3">{sidebar}</div>
          </Dialog>
        </>
      ) : null}

      <SelectionBar />
    </div>
  );
}

function CategoryButton({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={`flex h-9 w-full items-center justify-between rounded-lg px-2.5 text-left text-[13.5px] transition-colors ${
        active ? "bg-selected font-medium text-accent-text" : "text-ink-2 hover:bg-subtle hover:text-ink"
      }`}
    >
      <span className="truncate">{label}</span>
      <span className="ml-2 text-[12px] tabular-nums">{count}</span>
    </button>
  );
}

function IconTile({
  icon,
  nodes,
  options,
  focusable,
  active,
  selected,
  selectionMode,
  onOpen,
  onToggleSelect,
}: {
  icon: IconMetadata;
  nodes: IconVariants | undefined;
  options: IconOptions;
  focusable: boolean;
  active: boolean;
  selected: boolean;
  selectionMode: boolean;
  onOpen: () => void;
  onToggleSelect: () => void;
}) {
  if (!nodes) return null;
  return (
    <li className="ik-tile group relative">
      <button
        type="button"
        data-icon={icon.name}
        tabIndex={focusable ? 0 : -1}
        onClick={onOpen}
        aria-pressed={active}
        title={icon.title}
        className={`flex h-[92px] w-full flex-col sm:h-[104px] items-center justify-center gap-2.5 rounded-[18px] border px-1.5 pt-2 transition-colors ${
          active
            ? "border-accent bg-selected text-ink"
            : selected
              ? "border-accent/50 bg-selected/60"
              : "border-transparent hover:bg-surface hover:shadow-card"
        }`}
      >
        <NodeIcon
          key={options.variant}
          nodes={nodes}
          variant={options.variant}
          size={28}
          strokeWidth={options.strokeWidth}
          color={options.color === "currentColor" ? undefined : options.color}
          gradient={options.gradient}
          className="ik-swap"
        />
        <span className="w-full truncate text-center text-[11.5px] text-ink-2 group-hover:text-ink">{icon.name}</span>
        {selected ? <span className="sr-only">, selected</span> : null}
      </button>
      <button
        type="button"
        tabIndex={-1}
        onClick={onToggleSelect}
        aria-label={selected ? `Remove ${icon.title} from selection` : `Add ${icon.title} to selection`}
        className={`absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-md border transition-opacity ${
          selected
            ? "border-accent bg-accent text-accent-contrast opacity-100"
            : `border-line-strong bg-surface text-transparent hover:text-ink-2 ${selectionMode ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"}`
        }`}
      >
        <CheckIcon size={14} />
      </button>
      <CopyButton
        text={() => svgMarkup(nodes[options.variant], options)}
        label={`Copy ${icon.name} SVG`}
        compact
        tabIndex={-1}
        className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-md text-ink-2 opacity-0 hover:bg-subtle hover:text-ink group-hover:opacity-100 group-focus-within:opacity-100 [&_svg]:h-3.5 [&_svg]:w-3.5"
      />
    </li>
  );
}
