"use client";

import type { IconVariants } from "@ikions/icons";
import { DownloadIcon } from "@ikions/react";
import { useState } from "react";
import { downloadText, svgFile, svgFileName } from "@/lib/export";
import { DEFAULT_OPTIONS, reactSnippet, svgMarkup, type IconOptions } from "@/lib/snippets";
import { buttonClass } from "../ui/button";
import { CodeBlock } from "../ui/code-block";
import { CopyButton } from "../ui/copy-button";
import { NodeIcon } from "../ui/node-icon";
import { Segmented } from "../ui/segmented";
import { COLOR_PRESETS, GRADIENT_PRESETS } from "../workbench/controls";

/** Gradients offered in the homepage demo (a subset of the full presets). */
const DEMO_GRADIENTS = GRADIENT_PRESETS.filter((g) => ["Aurora", "Ocean", "Ember"].includes(g.label));

export interface DemoIcon {
  name: string;
  title: string;
  component: string;
  nodes: IconVariants;
}

/**
 * One live icon demonstrating every customisation the library supports:
 * a large preview canvas on the left, controls and the matching code on the
 * right.
 */
export function FeatureDemo({ icons }: { icons: DemoIcon[] }) {
  const [name, setName] = useState(icons[0]?.name ?? "");
  const [options, setOptions] = useState<IconOptions>({ ...DEFAULT_OPTIONS, size: 32, color: "#5555E8" });
  const icon = icons.find((i) => i.name === name);
  if (!icon) return null;
  const nodes = icon.nodes;
  const update = (patch: Partial<IconOptions>) => setOptions((o) => ({ ...o, ...patch }));
  const color = options.color === "currentColor" ? undefined : options.color;
  const gradientActive = (g: { from: string; to: string }) => options.gradient?.from === g.from && options.gradient?.to === g.to;

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-[24px] bg-surface shadow-soft lg:grid-cols-[1.1fr_1fr]">
      {/* Preview */}
      <div className="relative p-3 sm:p-4">
        <div className="grid-paper relative grid h-full min-h-[300px] place-items-center rounded-[18px] bg-bg sm:min-h-[380px]">
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5" role="group" aria-label="Demo icon">
            {icons.map(({ name: n, title, nodes: demoNodes }) => (
              <button
                key={n}
                type="button"
                aria-pressed={n === name}
                aria-label={title}
                onClick={() => setName(n)}
                className={`grid h-9 w-9 place-items-center rounded-full border bg-surface transition-colors ${
                  n === name ? "border-accent text-accent-text shadow-[0_0_0_3px_var(--selected)]" : "border-transparent text-ink-2 shadow-card hover:text-ink"
                }`}
              >
                <NodeIcon nodes={demoNodes} size={18} variant={options.variant} />
              </button>
            ))}
          </div>
          <NodeIcon
            key={`${name}-${options.variant}`}
            nodes={nodes}
            variant={options.variant}
            size={Math.round(options.size * 3.4)}
            strokeWidth={options.strokeWidth}
            color={color}
            gradient={options.gradient}
            className="ik-swap mt-8 transition-[width,height] duration-200"
            title={`${icon.title}, ${options.variant}`}
          />
          <p className="absolute bottom-3 left-3 rounded-md bg-surface/90 px-2 py-1 font-mono text-[11.5px] text-ink-2">
            {icon.component} · {options.size}px · {options.variant === "filled" ? "filled" : `stroke ${options.strokeWidth.toFixed(2)}`}
          </p>
        </div>
      </div>

      {/* Controls and code */}
      <div className="flex min-w-0 flex-col gap-5 p-5 sm:p-6">
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
          <div className="flex flex-wrap gap-2 sm:gap-1.5" role="group" aria-label="Colour">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                aria-label={preset.label}
                aria-pressed={!options.gradient && options.color === preset.value}
                onClick={() => update({ color: preset.value, gradient: null })}
                className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 sm:h-7 sm:w-7 ${!options.gradient && options.color === preset.value ? "border-ink" : "border-transparent"}`}
                style={{ background: preset.value === "currentColor" ? "var(--text)" : preset.value }}
              />
            ))}
            <span className="mx-0.5 w-px self-stretch bg-line" aria-hidden="true" />
            {DEMO_GRADIENTS.map((g) => (
              <button
                key={g.label}
                type="button"
                aria-label={`${g.label} gradient`}
                title={`${g.label} gradient`}
                aria-pressed={gradientActive(g)}
                onClick={() => update({ gradient: { from: g.from, to: g.to, angle: 135 } })}
                className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 sm:h-7 sm:w-7 ${gradientActive(g) ? "border-ink" : "border-transparent"}`}
                style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <label className="text-[12.5px] text-ink-2">
            <span className="flex justify-between">
              Size <span className="font-mono text-ink">{options.size}px</span>
            </span>
            <input
              type="range"
              min={16}
              max={64}
              step={4}
              value={options.size}
              onChange={(e) => update({ size: Number(e.target.value) })}
              className="mt-2 block w-full accent-[var(--accent)]"
            />
          </label>
          <label className="text-[12.5px] text-ink-2">
            <span className="flex justify-between">
              Stroke <span className="font-mono text-ink">{options.variant === "filled" ? "—" : options.strokeWidth.toFixed(2)}</span>
            </span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.25}
              value={options.strokeWidth}
              disabled={options.variant === "filled"}
              onChange={(e) => update({ strokeWidth: Number(e.target.value) })}
              className="mt-2 block w-full accent-[var(--accent)] disabled:opacity-40"
            />
          </label>
        </div>
        <CodeBlock code={reactSnippet(icon, options, true)} lang="javascript" label="Example.tsx" className="flex-1" />
        <div className="flex flex-wrap gap-2">
          <CopyButton text={() => svgMarkup(nodes[options.variant], options)} label="Copy SVG" className={buttonClass.secondary} />
          <button
            type="button"
            className={buttonClass.secondary}
            onClick={() =>
              downloadText(
                svgFile(nodes, options.variant, { color: options.color, gradient: options.gradient ?? undefined, strokeWidth: options.strokeWidth, size: options.size }),
                svgFileName(name, options.variant),
              )
            }
          >
            <DownloadIcon size={16} />
            Download SVG
          </button>
        </div>
      </div>
    </div>
  );
}
