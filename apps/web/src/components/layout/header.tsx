"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/site";
import { buttonClass } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { CloseIcon, MenuIcon, SearchIcon } from "@ikions/react";
import { Logo } from "./logo";
import { ThemeSelect, ThemeToggle } from "./theme-toggle";

const nav = [
  { href: "/icons", label: "Icons" },
  { href: "/categories", label: "Categories" },
  { href: "/docs", label: "Documentation" },
];

const mobileNav = [
  { href: "/icons", label: "Icons" },
  { href: "/categories", label: "Categories" },
  { href: "/collections", label: "Collections" },
  { href: "/docs", label: "Documentation" },
  { href: "/changelog", label: "Changelog" },
  { href: "/license", label: "License" },
  { href: "/about", label: "About" },
];

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function Header() {
  const pathname = usePathname() ?? "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer after navigation.
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors ${scrolled ? "bg-bg/85 backdrop-blur-md" : "bg-bg"}`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:shadow-soft"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="rounded-md" aria-label="Ikions home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className={`rounded-md px-3 py-2 text-[14px] font-medium transition-colors ${
                    isActive(pathname, item.href) ? "text-ink" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {siteConfig.github ? (
              <li>
                <a
                  href={siteConfig.github}
                  className="rounded-md px-3 py-2 text-[14px] font-medium text-ink-2 hover:text-ink"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </li>
            ) : null}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Link href="/search" className={buttonClass.icon} aria-label="Search icons and documentation">
            <SearchIcon size={19} />
          </Link>
          <ThemeToggle className={`${buttonClass.icon} max-md:hidden`} />
          <Link href="/icons" className={`${buttonClass.primary} h-9 max-md:hidden`}>
            Explore icons
          </Link>
          <button
            type="button"
            className={`${buttonClass.icon} md:hidden`}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon size={20} />
          </button>
        </div>
      </div>

      <Dialog open={menuOpen} onClose={() => setMenuOpen(false)} label="Menu" variant="drawer">
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center justify-between">
            <Logo />
            <button type="button" className={buttonClass.icon} aria-label="Close menu" onClick={() => setMenuOpen(false)}>
              <CloseIcon size={20} />
            </button>
          </div>
          <nav aria-label="Mobile" className="mt-6">
            <ul className="space-y-0.5">
              {mobileNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    className={`flex h-11 items-center rounded-lg px-3 text-[15px] font-medium ${
                      isActive(pathname, item.href) ? "bg-subtle text-ink" : "text-ink-2 hover:bg-subtle hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {siteConfig.github ? (
                <li>
                  <a
                    href={siteConfig.github}
                    rel="noopener noreferrer"
                    className="flex h-11 items-center rounded-lg px-3 text-[15px] font-medium text-ink-2 hover:bg-subtle hover:text-ink"
                  >
                    GitHub
                  </a>
                </li>
              ) : null}
            </ul>
          </nav>
          <div className="mt-auto border-t border-line pt-4">
            <p className="mb-2 text-[12px] font-medium text-ink-2">Theme</p>
            <ThemeSelect />
          </div>
        </div>
      </Dialog>
    </header>
  );
}
