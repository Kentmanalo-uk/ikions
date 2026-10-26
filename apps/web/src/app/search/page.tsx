import type { Metadata } from "next";
import { SiteSearch } from "./site-search";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Ikions icons, categories, collections and documentation in one place.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-[1000px] px-4 pt-10 sm:px-6">
      <SiteSearch />
    </div>
  );
}
