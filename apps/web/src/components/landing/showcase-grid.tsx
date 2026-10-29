import Image from "next/image";
import type { CSSProperties } from "react";
import { IkIcon } from "@/components/ui/ik-icon";
import type { ShowcaseSite, Verification } from "@/lib/showcase";

/** Scalloped "seal" outline for the verified badge, built from ten outward arcs. */
const SEAL = (() => {
  const lobes = 10;
  const valley = 9.6;
  const point = (i: number) => {
    const a = ((i + 0.5) / lobes) * Math.PI * 2 - Math.PI / 2;
    return `${(12 + valley * Math.cos(a)).toFixed(2)} ${(12 + valley * Math.sin(a)).toFixed(2)}`;
  };
  let d = `M${point(0)}`;
  for (let i = 1; i <= lobes; i++) d += `A3.4 3.4 0 0 1 ${point(i % lobes)}`;
  return `${d}Z`;
})();

function VerifiedBadge() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" role="img" aria-label="Verified: uses Ikions on its live site" className="shrink-0">
      <title>Verified: uses Ikions on its live site</title>
      <path d={SEAL} fill="var(--accent)" />
      <path d="M8.3 12.3l2.5 2.5 5-5.2" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Screenshots are full-page captures: desktop 1280 × 2600, mobile 390 × 2200 at 2×
 * (see the showcase capture script). They scroll inside the device screens.
 */

/** A MacBook showing the desktop site in Safari; the page scrolls slowly. */
function MacBook({ src, alt, host }: { src: string; alt: string; host: string }) {
  return (
    <div className="ik-mac">
      <div className="ik-mac-lid">
        <div className="ik-mac-screen">
          <div className="ik-mac-menubar" aria-hidden="true">
            <span className="ik-mac-menus">
              <b>Safari</b>
              <span>File</span>
              <span>Edit</span>
              <span>View</span>
              <span>History</span>
            </span>
            <span className="ik-mac-notch" />
            <span className="ik-mac-clock">Tue 9:41 AM</span>
          </div>
          <div className="ik-mac-toolbar" aria-hidden="true">
            <span className="ik-mac-lights">
              <i />
              <i />
              <i />
            </span>
            <span className="ik-mac-url">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor" />
                <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
              </svg>
              {host}
            </span>
          </div>
          <div className="ik-mac-viewport">
            <Image src={src} alt={alt} width={1280} height={2600} sizes="(min-width: 1024px) 640px, 90vw" className="ik-screen-scroll" />
          </div>
        </div>
      </div>
      <div className="ik-mac-base" aria-hidden="true" />
    </div>
  );
}

/** An iPhone 17 showing the mobile site in Safari. */
function IPhone({ src, alt, host }: { src: string; alt: string; host: string }) {
  return (
    <div className="ik-iphone">
      <span className="ik-iphone-btn ik-iphone-action" aria-hidden="true" />
      <span className="ik-iphone-btn ik-iphone-vol-up" aria-hidden="true" />
      <span className="ik-iphone-btn ik-iphone-vol-down" aria-hidden="true" />
      <span className="ik-iphone-btn ik-iphone-power" aria-hidden="true" />
      <div className="ik-iphone-body">
        <div className="ik-iphone-screen">
          <div className="ik-iphone-status" aria-hidden="true">
            <span className="ik-iphone-time">9:41</span>
            <span className="ik-iphone-island" />
            <span className="ik-iphone-indicators">
              <svg viewBox="0 0 18 12">
                <rect x="0" y="8" width="3" height="4" rx="1" />
                <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
                <rect x="10" y="3" width="3" height="9" rx="1" />
                <rect x="15" y="0" width="3" height="12" rx="1" />
              </svg>
              <svg viewBox="0 0 16 12">
                <path d="M8 11.2 5.6 8.7a3.4 3.4 0 0 1 4.8 0Z" />
                <path d="M3.4 6.5a6.5 6.5 0 0 1 9.2 0l-1.3 1.3a4.7 4.7 0 0 0-6.6 0Z" />
                <path d="M1.1 4.2a9.7 9.7 0 0 1 13.8 0l-1.3 1.3a7.9 7.9 0 0 0-11.2 0Z" />
              </svg>
              <svg viewBox="0 0 27 12">
                <rect x=".5" y=".5" width="22.5" height="11" rx="3.5" fill="none" stroke="currentColor" strokeOpacity=".4" />
                <rect x="2.2" y="2.2" width="17" height="7.6" rx="2" />
                <path d="M24.6 4.2v3.6a2 2 0 0 0 0-3.6Z" fillOpacity=".4" />
              </svg>
            </span>
          </div>
          <div className="ik-iphone-viewport">
            <Image src={src} alt={alt} width={780} height={4400} sizes="(min-width: 1024px) 180px, 30vw" className="ik-screen-scroll ik-screen-scroll-late" />
          </div>
          <div className="ik-iphone-urlbar" aria-hidden="true">
            {host}
          </div>
          <span className="ik-iphone-home" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

/** Verified showcase sites, each as a feature with MacBook and iPhone previews. */
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
                className="relative block pb-[10%] pr-[8%] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                aria-label={`Visit ${site.name} (opens in a new tab)`}
              >
                <MacBook src={site.screenshots.desktop} alt={`${site.name} on a MacBook`} host={host} />
                <div className="ik-phone-float absolute bottom-0 right-0 w-[25%] sm:w-[22%]" style={{ "--float-delay": `${index * 1.3}s` } as CSSProperties}>
                  <IPhone src={site.screenshots.mobile} alt={`${site.name} on an iPhone`} host={host} />
                </div>
              </a>
            </div>

            <div className={flip ? "lg:order-1" : ""}>
              <h2 id={`showcase-${index}`} className="flex items-center gap-2.5 font-display text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[42px]">
                {site.name}
                <VerifiedBadge />
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
