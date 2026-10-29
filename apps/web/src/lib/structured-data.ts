/**
 * schema.org structured data (JSON-LD). Search engines and AI assistants read
 * it to understand what Ikions is: a free icon library, made by
 * a named person, with a site search they can link into.
 */
import { DEVELOPER } from "@/lib/developer";
import { absoluteUrl, siteConfig } from "@/lib/site";

const ORG_ID = absoluteUrl("/#organization");
const SITE_ID = absoluteUrl("/#website");
const PERSON_ID = absoluteUrl("/#developer");

export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        url: absoluteUrl("/"),
        name: siteConfig.name,
        alternateName: ["Ikions Icons", "Ikions icon library"],
        description: siteConfig.description,
        inLanguage: "en",
        publisher: { "@id": ORG_ID },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("/icons")}?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: siteConfig.name,
        url: absoluteUrl("/"),
        logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") },
        founder: { "@id": PERSON_ID },
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: DEVELOPER.name,
        jobTitle: `${DEVELOPER.role} Ikions`,
        image: absoluteUrl(DEVELOPER.photo),
        sameAs: DEVELOPER.socials.map((s) => s.href),
      },
    ],
  };
}

export function libraryGraph({ icons, categories }: { icons: number; categories: number }) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Ikions icon library",
    description: `${icons.toLocaleString("en")} free, original SVG icons across ${categories} categories, with React, Vue and Svelte components.`,
    url: absoluteUrl("/"),
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    license: absoluteUrl("/license"),
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    keywords: siteConfig.keywords.join(", "),
    author: { "@id": PERSON_ID },
    publisher: { "@id": ORG_ID },
  };
}

/** A category or collection page: the page, the icons it lists, and its breadcrumb trail. */
export function collectionGraph({
  name,
  path,
  description,
  icons,
  trail,
}: {
  name: string;
  path: string;
  description: string;
  icons: { name: string; title: string }[];
  trail: { name: string; path: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name,
        description,
        url: absoluteUrl(path),
        isPartOf: { "@id": SITE_ID },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: icons.length,
          itemListElement: icons.slice(0, 100).map((icon, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${icon.title} icon`,
            url: absoluteUrl(`/icons/${icon.name}`),
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [...trail, { name, path }].map((crumb, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: crumb.name,
          item: absoluteUrl(crumb.path),
        })),
      },
    ],
  };
}

/** Serialise for a <script type="application/ld+json">, safe against `</script>` injection. */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
