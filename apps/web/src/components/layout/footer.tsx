import Link from "next/link";
import { stats, version } from "@/lib/catalog";
import { siteConfig } from "@/lib/site";
import { Logo } from "./logo";
import { ThemeSelect } from "./theme-toggle";

const sections = [
  {
    title: "Free icons",
    links: [
      { href: "/react-icons", label: "React icons" },
      { href: "/vue-icons", label: "Vue icons" },
      { href: "/svelte-icons", label: "Svelte icons" },
      { href: "/svg-icons", label: "SVG icons" },
    ],
  },
  {
    title: "Product",
    links: [
      { href: "/icons", label: "Icon explorer" },
      { href: "/categories", label: "Categories" },
      { href: "/collections", label: "Collections" },
      { href: "/search", label: "Search" },
    ],
  },
  {
    title: "Documentation",
    links: [
      { href: "/docs", label: "Introduction" },
      { href: "/docs/installation", label: "Installation" },
      { href: "/docs/react", label: "React" },
      { href: "/docs/api", label: "Metadata & API" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/changelog", label: "Changelog" },
      { href: "/license", label: "License" },
      { href: "/about", label: "About" },
      { href: "/docs/contributing", label: "Contributing" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-[14px] leading-6 text-ink-2">{siteConfig.tagline}</p>
          <p className="mt-3 text-[13px] text-ink-2">
            Version {version} · {stats.icons} icons in Outline and Filled
          </p>
          <div className="mt-5">
            <ThemeSelect />
          </div>
        </div>
        {sections.map((section) => (
          <nav key={section.title} aria-label={section.title}>
            <h2 className="text-[13px] font-semibold text-ink">{section.title}</h2>
            <ul className="mt-3 space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[14px] text-ink-2 hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
              {section.title === "Resources" && siteConfig.github ? (
                <li>
                  <a href={siteConfig.github} rel="noopener noreferrer" className="text-[14px] text-ink-2 hover:text-ink">
                    GitHub
                  </a>
                </li>
              ) : null}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-[1440px] px-4 py-5 text-[12.5px] text-ink-2 sm:px-6">
          Icon artwork and code are released under the MIT License. The Ikions name and logo are not covered by that license.
        </p>
      </div>
    </footer>
  );
}
