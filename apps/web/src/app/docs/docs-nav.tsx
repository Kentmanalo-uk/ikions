"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CloseIcon, ListIcon, SearchIcon } from "@ikions/react";
import { docPages, docsNav } from "@/lib/docs";

export function DocsSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const nav = (
    <>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}&scope=docs`);
        }}
        className="relative mb-6"
      >
        <label htmlFor="docs-search" className="sr-only">
          Search documentation
        </label>
        <SearchIcon size={16} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-2" />
        <input
          id="docs-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value.slice(0, 100))}
          placeholder="Search docs"
          className="h-9 w-full rounded-full border border-line bg-surface pl-8 pr-2 text-[13.5px] placeholder:text-ink-2 focus:border-accent focus:outline-none"
        />
      </form>
      {docsNav.map((section) => (
        <div key={section.title} className="mb-6">
          <h2 className="mb-1.5 px-2 text-[12px] font-semibold uppercase tracking-wide text-ink-2">{section.title}</h2>
          <ul className="space-y-0.5">
            {section.pages.map((page) => {
              const active = pathname === page.href;
              return (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-md px-2 py-1.5 text-[14px] transition-colors ${
                      active ? "bg-selected font-medium text-accent-text" : "text-ink-2 hover:text-ink"
                    }`}
                  >
                    {page.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );

  return (
    <>
      <aside className="sticky top-24 hidden max-h-[calc(100dvh-7rem)] w-56 shrink-0 overflow-y-auto pb-10 md:block" aria-label="Documentation">
        {nav}
      </aside>
      <div className="fixed bottom-4 right-4 z-30 md:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="docs-mobile-nav"
          className="flex h-11 items-center gap-2 rounded-full bg-elevated px-4 text-[14px] font-medium shadow-soft"
        >
          {open ? <CloseIcon size={18} /> : <ListIcon size={18} />}
          {open ? "Close" : "Docs menu"}
        </button>
      </div>
      {open ? (
        <nav
          id="docs-mobile-nav"
          aria-label="Documentation"
          className="ik-sheet fixed inset-x-3 bottom-18 z-30 max-h-[70dvh] overflow-y-auto rounded-[22px] bg-elevated p-4 shadow-soft md:hidden"
        >
          {nav}
        </nav>
      ) : null}
    </>
  );
}

export function DocsPager() {
  const pathname = usePathname();
  const index = docPages.findIndex((p) => p.href === pathname);
  if (index < 0) return null;
  const previous = docPages[index - 1];
  const next = docPages[index + 1];
  return (
    <nav aria-label="Previous and next page" className="mt-14 grid max-w-[720px] gap-3 border-t border-line pt-6 sm:grid-cols-2">
      {previous ? (
        <Link href={previous.href} className="rounded-[18px] bg-surface p-4 shadow-card transition-colors hover:bg-subtle">
          <span className="text-[12.5px] text-ink-2">Previous</span>
          <span className="mt-0.5 block font-medium">{previous.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} className="rounded-[18px] bg-surface p-4 text-right shadow-card transition-colors hover:bg-subtle">
          <span className="text-[12.5px] text-ink-2">Next</span>
          <span className="mt-0.5 block font-medium">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
