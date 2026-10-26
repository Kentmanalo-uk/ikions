import Image from "next/image";
import { DEVELOPER } from "@/lib/developer";

export function MeetDeveloper() {
  return (
    <div className="ik-cta relative grid items-center gap-8 overflow-hidden rounded-[28px] bg-surface px-6 py-10 shadow-card sm:px-10 md:grid-cols-[auto_1fr] md:gap-12 md:py-12">
      <div className="mx-auto rounded-full p-1.5 shadow-card md:mx-0">
        <Image
          src={DEVELOPER.photo}
          alt={`Photo of ${DEVELOPER.name}`}
          width={168}
          height={168}
          sizes="168px"
          className="h-[168px] w-[168px] rounded-full object-cover"
        />
      </div>
      <div className="text-center md:text-left">
        <h3 className="font-display text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[32px]">{DEVELOPER.name}</h3>
        <p className="mt-2 text-[16px] leading-7 text-ink-2">{DEVELOPER.role}</p>
        <ul className="mt-6 flex flex-wrap justify-center gap-2.5 md:justify-start" aria-label={`${DEVELOPER.name} on social media`}>
          {DEVELOPER.socials.map((social) => (
            <li key={social.network}>
              <a
                href={social.href}
                target="_blank"
                rel="me noopener noreferrer"
                className="inline-flex h-11 items-center gap-2.5 rounded-full bg-subtle px-4 text-[15px] font-medium text-ink transition-colors hover:bg-selected hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={social.path} />
                </svg>
                <span>{social.handle}</span>
                <span className="sr-only">on {social.network} (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
