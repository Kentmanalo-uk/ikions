"use client";

import Link from "next/link";
import type { IconVariants } from "@ikions/icons";
import type { IconMetadata } from "@ikions/metadata";
import { ArrowRightIcon, CheckIcon, CloseIcon, HeartIcon, PlusIcon } from "@ikions/react";
import type { IconOptions } from "@/lib/snippets";
import { useFavorites, useSelection } from "@/lib/stored-set";
import { buttonClass } from "../ui/button";
import { NodeIcon } from "../ui/node-icon";
import { Segmented } from "../ui/segmented";
import { PreviewControls } from "../workbench/controls";
import { IconActions } from "../workbench/icon-actions";

interface Props {
  icon: IconMetadata;
  nodes: IconVariants;
  categoryName?: string;
  options: IconOptions;
  onOptionsChange: (patch: Partial<IconOptions>) => void;
  onClose: () => void;
  /** Focus the close button on mount (used when shown as a modal sheet). */
  autoFocusClose?: boolean;
}

/** Detail panel for the icon selected in the explorer. */
export function Inspector({ icon, nodes, categoryName, options, onOptionsChange, onClose, autoFocusClose = false }: Props) {
  const favorites = useFavorites();
  const selection = useSelection();
  const favorite = favorites.has(icon.name);
  const selected = selection.has(icon.name);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <h2 className="truncate font-display text-[18px] font-semibold tracking-[-0.02em]">{icon.title}</h2>
          <p className="mt-0.5 font-mono text-[12px] text-ink-2">{icon.name}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            className={buttonClass.icon}
            aria-pressed={favorite}
            aria-label={favorite ? `Remove ${icon.title} from favourites` : `Add ${icon.title} to favourites`}
            onClick={() => favorites.toggle(icon.name)}
          >
            <HeartIcon variant={favorite ? "filled" : "outline"} size={18} className={favorite ? "text-danger" : ""} />
          </button>
          <button type="button" className={buttonClass.icon} aria-label="Close inspector" onClick={onClose} autoFocus={autoFocusClose}>
            <CloseIcon size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        <div className="grid-paper grid aspect-[4/3] place-items-center rounded-[18px] bg-bg">
          <NodeIcon
            key={`${icon.name}-${options.variant}`}
            nodes={nodes}
            variant={options.variant}
            size={Math.min(Math.max(options.size * 2.5, 72), 128)}
            strokeWidth={options.strokeWidth}
            color={options.color === "currentColor" ? undefined : options.color}
            gradient={options.gradient}
            className="ik-swap"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <Segmented
            label="Variant"
            value={options.variant}
            onChange={(variant) => onOptionsChange({ variant })}
            options={[
              { value: "outline", label: "Outline" },
              { value: "filled", label: "Filled" },
            ]}
          />
          <button
            type="button"
            aria-pressed={selected}
            onClick={() => selection.toggle(icon.name)}
            className={`${buttonClass.small} ${selected ? "border-accent bg-selected text-accent-text" : ""}`}
          >
            {selected ? <CheckIcon size={16} /> : <PlusIcon size={16} />}
            {selected ? "Selected" : "Select"}
          </button>
        </div>

        <p className="text-[14px] leading-6 text-ink-2">{icon.description}</p>

        <IconActions icon={icon} nodes={nodes} options={options} />

        <PreviewControls options={options} onChange={onOptionsChange} />

        <dl className="space-y-3 text-[13px]">
          <div>
            <dt className="font-medium text-ink-2">Category</dt>
            <dd className="mt-1">
              <Link href={`/categories/${icon.category}`} className="text-accent-text hover:underline">
                {categoryName ?? icon.category}
              </Link>
            </dd>
          </div>
          {icon.aliases.length > 0 ? (
            <div>
              <dt className="font-medium text-ink-2">Also known as</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {icon.aliases.map((alias) => (
                  <span key={alias} className="rounded-md bg-subtle px-2 py-0.5 font-mono text-[12px]">
                    {alias}
                  </span>
                ))}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="font-medium text-ink-2">Tags</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {icon.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-subtle px-2.5 py-0.5 text-[12px] text-ink-2">
                  {tag}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </div>

      <div className="border-t border-line px-5 py-3">
        <Link href={`/icons/${icon.name}`} className={`${buttonClass.secondary} w-full`}>
          Open {icon.title} details
          <ArrowRightIcon size={16} />
        </Link>
      </div>
    </div>
  );
}
