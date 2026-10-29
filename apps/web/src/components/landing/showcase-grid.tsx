import Image from "next/image";
import type { CSSProperties } from "react";
import { IkIcon } from "@/components/ui/ik-icon";
import type { ShowcaseSite, Verification } from "@/lib/showcase";

/** A laptop showing the desktop site; the screen scrolls slowly through the page. */
function Laptop({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="ik-laptop">
      <div className="ik-laptop-lid">
        <span className="ik-laptop-camera" aria-hidden="true" />
        <div className="ik-device-screen aspect-[16/10] rounded-[6px]">
          <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 640px, 90vw" className="ik-screen-scroll object-cover" />
        </div>
      </div>
      <div className="ik-laptop-base" aria-hidden="true" />
    </div>
  );
}

/** A phone showing the mobile site. */
function Phone({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="ik-phone">
      <div className="ik-device-screen aspect-[9/19.5] rounded-[1.65rem]">
        <span className="ik-phone-island" aria-hidden="true" />
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 180px, 30vw" className="ik-screen-scroll ik-screen-scroll-late object-cover" />
      </div>
    </div>
  );
}

/** Verified showcase sites, each as a feature with laptop and phone previews. */
export function ShowcaseGrid({ sites }: { sites: { site: ShowcaseSite; verification: Verification }[] }) {
  return (
    <div className="mt-16 space-y-24 sm:mt-20 sm:space-y-32">
      {sites.map(({ site, verification }, index) => {
        const host = new URL(site.url).host;
        const flip = index % 2 === 1;
        return (
          <article
            key={site.url}
            className={`grid items-center gap-10 lg:gap-16 ${flip ? "lg:grid-cols-[1fr_1.35fr]" : "lg:grid-cols-[1.35fr_1fr]"}`}
            aria-labelledby={`showcase-${index}`}
          >
            <div className={`relative ${flip ? "lg:order-2" : ""}`}>
              <div className="ik-showcase-glow" aria-hidden="true" />
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block pb-[9%] pr-[9%] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                aria-label={`Visit ${site.name} (opens in a new tab)`}
              >
                <Laptop src={site.screenshots.desktop} alt={`${site.name} on a laptop`} />
                <div className="ik-phone-float absolute bottom-0 right-0 w-[27%] sm:w-[24%]" style={{ "--float-delay": `${index * 1.3}s` } as CSSProperties}>
                  <Phone src={site.screenshots.mobile} alt={`${site.name} on a phone`} />
                </div>
              </a>
            </div>

            <div className={flip ? "lg:order-1" : ""}>
              <span className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-accent-text">
                <IkIcon name="shield-check" size={14} />
                Verified on the live site
              </span>
              <h2 id={`showcase-${index}`} className="mt-4 font-display text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[42px]">
                {site.name}
              </h2>
              <a href={site.url} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-block font-mono text-[14px] text-ink-2 hover:text-accent-text">
                {host}
              </a>
              <p className="mt-4 max-w-md text-[16px] leading-7 text-ink-2">{site.description}</p>

              {verification.icons.length > 0 ? (
                <div className="mt-7">
                  <p className="text-[13px] text-ink-2">
                    <span className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink">{verification.icons.length}</span> Ikions icons in
                    use
                  </p>
                  <ul className="mt-3 flex max-w-md flex-wrap gap-1.5" aria-label={`Icons used on ${site.name}`}>
                    {verification.icons.slice(0, 18).map((name) => (
                      <li key={name} className="grid h-10 w-10 place-items-center rounded-[12px] bg-surface text-ink shadow-card" title={name}>
                        <IkIcon name={name} size={19} />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[15px] font-medium text-bg transition-opacity hover:opacity-85"
              >
                Visit {host}
                <IkIcon name="external-link" size={17} />
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
