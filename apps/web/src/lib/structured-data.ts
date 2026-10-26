/**
 * schema.org structured data (JSON-LD). Search engines and AI assistants read
 * it to understand what Ikions is: a free, MIT-licensed icon library, made by
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
        sameAs: [siteConfig.github],
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: DEVELOPER.name,
        jobTitle: DEVELOPER.role,
        image: absoluteUrl(DEVELOPER.photo),
        sameAs: DEVELOPER.socials.map((s) => s.href),
      },
    ],
  };
}

export function libraryGraph({ icons, categories }: { icons: number; categories: number }) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: "Ikions icon library",
    description: `${icons.toLocaleString("en")} free, original SVG icons in Outline and Filled across ${categories} categories, with React, Vue and Svelte components. MIT licensed for personal and commercial use.`,
    url: absoluteUrl("/"),
    codeRepository: siteConfig.github,
    programmingLanguage: ["TypeScript", "SVG"],
    runtimePlatform: ["React", "Vue", "Svelte", "HTML"],
    license: "https://opensource.org/licenses/MIT",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    keywords: siteConfig.keywords.join(", "),
    author: { "@id": PERSON_ID },
    publisher: { "@id": ORG_ID },
  };
}

export function faqGraph(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** Serialise for a <script type="application/ld+json">, safe against `</script>` injection. */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
