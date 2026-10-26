"use client";

import type { IconVariant, IconVariants } from "@ikions/icons";
import Link from "next/link";
import { useState } from "react";
import { NodeIcon } from "./node-icon";
import { Segmented } from "./segmented";

export interface GalleryIcon {
  name: string;
  title: string;
  nodes: IconVariants;
}

/** A linked grid of icons with an Outline/Filled switch. Node data comes from the server. */
export function IconGallery({
  icons,
  heading,
  headingLevel = 2,
  showToggle = true,
}: {
  icons: GalleryIcon[];
  heading?: string;
  headingLevel?: 2 | 3;
  showToggle?: boolean;
}) {
  const [variant, setVariant] = useState<IconVariant>("outline");
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <section>
      {heading || showToggle ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {heading ? <Heading className="font-display text-[18px] font-semibold tracking-[-0.02em]">{heading}</Heading> : <span />}
          {showToggle ? (
            <Segmented
              label="Gallery variant"
              size="sm"
              value={variant}
              onChange={setVariant}
              options={[
                { value: "outline", label: "Outline" },
                { value: "filled", label: "Filled" },
              ]}
            />
          ) : null}
        </div>
      ) : null}
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-1 rounded-[24px] bg-surface p-2.5 shadow-card">
        {icons.map((icon) => (
          <li key={icon.name} className="ik-tile">
            <Link
              href={`/icons/${icon.name}`}
              className="group flex h-[104px] flex-col items-center justify-center gap-2.5 rounded-[16px] px-1.5 pt-2 transition-colors hover:bg-selected hover:text-accent-text"
            >
              <NodeIcon nodes={icon.nodes} variant={variant} size={28} key={variant} className="ik-swap" />
              <span className="w-full truncate text-center text-[11.5px] text-ink-2 group-hover:text-ink">{icon.name}</span>
              <span className="sr-only">{icon.title} icon</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
