import Image from "next/image";
import { IkIcon } from "@/components/ui/ik-icon";
import type { ShowcaseSite, Verification } from "@/lib/showcase";

/** Verified showcase sites: screenshot, name, host, description and the Ikions icons found. */
export function ShowcaseGrid({ sites }: { sites: { site: ShowcaseSite; verification: Verification }[] }) {
  return (
    <ul className="mt-12 grid gap-4 md:grid-cols-2">
      {sites.map(({ site, verification }) => (
        <li key={site.url}>
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block h-full overflow-hidden rounded-[24px] bg-surface shadow-card transition-transform hover:-translate-y-0.5"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-subtle">
              <Image
                src={site.screenshot}
                alt={`Screenshot of ${site.name}`}
                fill
                sizes="(min-width: 768px) 580px, 100vw"
                className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-[20px] font-semibold tracking-[-0.02em]">{site.name}</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-selected px-2.5 py-1 text-[12.5px] font-medium text-accent-text">
                  <IkIcon name="check" size={14} />
                  Verified
                </span>
              </div>
              <p className="mt-1 font-mono text-[13px] text-ink-2">{new URL(site.url).host}</p>
              <p className="mt-3 text-[14.5px] leading-6 text-ink-2">{site.description}</p>
              {verification.icons.length > 0 ? (
                <div className="mt-4">
                  <p className="text-[12.5px] text-ink-2">
                    Uses {verification.icons.length} Ikions {verification.icons.length === 1 ? "icon" : "icons"}
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={`Icons used on ${site.name}`}>
                    {verification.icons.slice(0, 14).map((name) => (
                      <li key={name} className="grid h-9 w-9 place-items-center rounded-full bg-subtle text-ink" title={name}>
                        <IkIcon name={name} size={18} />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
