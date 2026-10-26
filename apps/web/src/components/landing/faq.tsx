import { IkIcon } from "@/components/ui/ik-icon";

export interface Faq {
  question: string;
  answer: string;
}

/** Plain-language answers to what people ask before picking an icon library. Also published as FAQPage JSON-LD. */
export function homeFaqs({ icons, categories }: { icons: number; categories: number }): Faq[] {
  const count = icons.toLocaleString("en");
  return [
    {
      question: "Is Ikions free to use?",
      answer:
        "Yes. Every Ikions icon is free under the MIT License, for personal and commercial projects, websites, apps and products. Attribution is appreciated but not required.",
    },
    {
      question: "How many icons does Ikions have?",
      answer: `Ikions currently has ${count} icons across ${categories} categories. Every icon comes in two styles, Outline and Filled, and the library keeps growing in reviewed batches.`,
    },
    {
      question: "Can I use Ikions icons in React, Vue or Svelte?",
      answer:
        "Yes. Every icon page lets you copy ready-to-paste JSX or SVG, and the open-source repository includes typed React, Vue and Svelte component packages. You can also download any icon as SVG or PNG.",
    },
    {
      question: "Are the icons original?",
      answer:
        "Yes. Every icon is drawn for Ikions on one 24 × 24 grid with consistent strokes and corners. Nothing is copied or traced from another icon library.",
    },
    {
      question: "Which formats can I download?",
      answer:
        "SVG and PNG for single icons, plus SVG sprites and ZIP exports for a selection. Colour, size, stroke width and gradients can be adjusted before you download.",
    },
    {
      question: "Do I need to credit Ikions?",
      answer:
        "No credit is required by the MIT License beyond keeping the license notice when you redistribute the icon set itself. A link back to ikions.cloud is always welcome.",
    },
  ];
}

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="mx-auto max-w-3xl divide-y divide-line rounded-[24px] bg-surface px-6 shadow-card sm:px-8">
      {faqs.map((faq) => (
        <details key={faq.question} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-medium text-ink [&::-webkit-details-marker]:hidden">
            <h3>{faq.question}</h3>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-subtle text-ink-2 transition-transform group-open:rotate-45">
              <IkIcon name="plus" size={18} />
            </span>
          </summary>
          <p className="mt-3 pr-12 text-[15px] leading-7 text-ink-2">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
