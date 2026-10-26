import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { IkIcon } from "@/components/ui/ik-icon";

export default function NotFound() {
  return (
    <div className="relative isolate mx-auto flex max-w-lg flex-col items-center px-4 py-28 text-center">
      <div className="ik-page-glow" aria-hidden="true" />
      <span className="grid h-16 w-16 place-items-center rounded-full bg-selected text-accent-text">
        <IkIcon name="compass" size={32} />
      </span>
      <h1 className="mt-6 font-display text-[40px] font-semibold tracking-[-0.04em]">Page not found</h1>
      <p className="mt-2 text-[15px] text-ink-2">The page you were looking for does not exist or has moved.</p>
      <div className="mt-6 flex gap-2">
        <Link href="/icons" className={buttonClass.primary}>
          Browse icons
        </Link>
        <Link href="/search" className={buttonClass.secondary}>
          Search
        </Link>
      </div>
    </div>
  );
}
