"use client";

import type { IconVariants } from "@ikions/icons";
import { useState } from "react";
import { DEFAULT_OPTIONS, type IconOptions } from "@/lib/snippets";
import { useFavorites, useSelection } from "@/lib/stored-set";
import { buttonClass } from "../ui/button";
import { CheckIcon, HeartIcon, PlusIcon } from "@ikions/react";
import { NodeIcon } from "../ui/node-icon";
import { Segmented } from "../ui/segmented";
import { CodeTabs } from "./code-tabs";
import { PreviewControls } from "./controls";
import { IconActions } from "./icon-actions";

type Background = "light" | "dark" | "checker";

const backgrounds: Record<Background, string> = {
  light: "bg-[#ffffff] text-[#18191b]",
  dark: "bg-[#121316] text-[#f5f5f2]",
  checker: "checkerboard text-ink",
};

interface Props {
  icon: { name: string; title: string; component: string };
  nodes: IconVariants;
}

/** Interactive preview, customisation, code and downloads for one icon. */
export function Workbench({ icon, nodes }: Props) {
  const [options, setOptions] = useState<IconOptions>(DEFAULT_OPTIONS);
  const [background, setBackground] = useState<Background>("light");
  const update = (patch: Partial<IconOptions>) => setOptions((o) => ({ ...o, ...patch }));
  const favorites = useFavorites();
  const selection = useSelection();
  const color = options.color === "currentColor" ? undefined : options.color;
  const favorite = favorites.has(icon.name);
  const selected = selection.has(icon.name);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <div className={`relative grid aspect-[5/4] place-items-center overflow-hidden rounded-[24px] shadow-card ${backgrounds[background]}`}>
          <NodeIcon
            key={options.variant}
            nodes={nodes}
            variant={options.variant}
            size={Math.min(options.size * 4, 256)}
            strokeWidth={options.strokeWidth}
            color={color}
            gradient={options.gradient}
            className="ik-swap"
            title={`${icon.title} icon, ${options.variant}`}
          />
          <span className="absolute bottom-3 right-3 rounded-md bg-black/5 px-2 py-1 font-mono text-[11px] opacity-70">
            {options.size}px × 4
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmented
            label="Variant"
            value={options.variant}
            onChange={(variant) => update({ variant })}
            options={[
              { value: "outline", label: "Outline" },
              { value: "filled", label: "Filled" },
            ]}
          />
          <Segmented
            label="Preview background"
            size="sm"
            value={background}
            onChange={setBackground}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "checker", label: "Transparent" },
            ]}
          />
        </div>
        <div className={`flex items-end justify-around rounded-[22px] px-4 py-5 shadow-card ${backgrounds[background]}`} aria-label="Actual size preview">
          {[16, 20, 24, 32, 48].map((size) => (
            <figure key={size} className="flex flex-col items-center gap-2">
              <NodeIcon nodes={nodes} variant={options.variant} size={size} strokeWidth={options.strokeWidth} color={color} gradient={options.gradient} />
              <figcaption className="font-mono text-[11px] opacity-70">{size}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={favorite}
            onClick={() => favorites.toggle(icon.name)}
            className={buttonClass.secondary}
          >
            <HeartIcon variant={favorite ? "filled" : "outline"} size={16} className={favorite ? "text-danger" : ""} />
            {favorite ? "Favourited" : "Add to favourites"}
          </button>
          <button
            type="button"
            aria-pressed={selected}
            onClick={() => selection.toggle(icon.name)}
            className={`${buttonClass.secondary} ${selected ? "border-accent text-accent-text" : ""}`}
          >
            {selected ? <CheckIcon size={16} /> : <PlusIcon size={16} />}
            {selected ? "In export selection" : "Add to export selection"}
          </button>
        </div>
        <IconActions icon={icon} nodes={nodes} options={options} layout="row" />
        <PreviewControls options={options} onChange={update} />
      </div>

      <div className="lg:col-span-2">
        <h2 className="mb-3 font-display text-[18px] font-semibold tracking-[-0.02em]">Use it in your project</h2>
        <CodeTabs icon={icon} nodes={nodes} options={options} />
      </div>
    </div>
  );
}
