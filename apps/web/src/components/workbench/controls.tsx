"use client";

import { useEffect, useId, useState } from "react";
import type { IconGradient, IconOptions } from "@/lib/snippets";
import { Segmented } from "../ui/segmented";

export const SIZE_PRESETS = [16, 20, 24, 32, 48, 64] as const;
export const COLOR_PRESETS = [
  { value: "currentColor", label: "Current colour" },
  { value: "#5555E8", label: "Ikions indigo" },
  { value: "#E5484D", label: "Red" },
  { value: "#F76B15", label: "Orange" },
  { value: "#2F9E6B", label: "Green" },
  { value: "#0B84D8", label: "Blue" },
  { value: "#8E4EC6", label: "Purple" },
] as const;

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
export const MIN_SIZE = 8;
export const MAX_SIZE = 512;

const chip =
  "h-8 min-w-9 rounded-full border px-2.5 text-[12.5px] font-medium tabular-nums transition-colors";

export function SizeControl({ value, onChange }: { value: number; onChange: (size: number) => void }) {
  const id = useId();
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const n = Math.round(Number(draft));
    if (Number.isFinite(n) && n >= MIN_SIZE && n <= MAX_SIZE) onChange(n);
    else setDraft(String(value));
  };
  return (
    <fieldset>
      <legend className="mb-2 text-[12.5px] font-medium text-ink-2">Size</legend>
      <div className="flex flex-wrap items-center gap-1.5">
        {SIZE_PRESETS.map((size) => (
          <button
            key={size}
            type="button"
            aria-pressed={value === size}
            onClick={() => onChange(size)}
            className={`${chip} ${value === size ? "border-accent bg-selected text-accent-text" : "border-transparent bg-subtle text-ink-2 hover:text-ink"}`}
          >
            {size}
          </button>
        ))}
        <label htmlFor={id} className="sr-only">
          Custom size in pixels
        </label>
        <div className="relative">
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && commit()}
            className="h-8 w-[4.75rem] rounded-full border border-line bg-surface pl-2 pr-7 text-[12.5px] tabular-nums text-ink"
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-ink-2">px</span>
        </div>
      </div>
    </fieldset>
  );
}

export const GRADIENT_PRESETS = [
  { label: "Ikions", from: "#7C6CFF", to: "#3A2BC9" },
  { label: "Aurora", from: "#7C6CFF", to: "#FF8AC2" },
  { label: "Bloom", from: "#FF8AC2", to: "#FFB25E" },
  { label: "Ocean", from: "#22D3EE", to: "#2563EB" },
  { label: "Mint", from: "#34D399", to: "#0EA5E9" },
  { label: "Ember", from: "#F97316", to: "#E11D48" },
  { label: "Dusk", from: "#8B5CF6", to: "#EC4899" },
] as const;

const DEFAULT_GRADIENT: IconGradient = { from: GRADIENT_PRESETS[1].from, to: GRADIENT_PRESETS[1].to, angle: 135 };

const sameGradient = (a: IconGradient | null, b: { from: string; to: string }) =>
  Boolean(a) && a!.from.toLowerCase() === b.from.toLowerCase() && a!.to.toLowerCase() === b.to.toLowerCase();

const swatch = (g: { from: string; to: string }, angle = 135) => `linear-gradient(${angle}deg, ${g.from}, ${g.to})`;

/** Solid colour or gradient paint, with presets and custom values. */
export function ColorControl({
  value,
  gradient,
  onChange,
  onGradientChange,
}: {
  value: string;
  gradient: IconGradient | null;
  onChange: (color: string) => void;
  onGradientChange: (gradient: IconGradient | null) => void;
}) {
  const [mode, setMode] = useState<"solid" | "gradient">(gradient ? "gradient" : "solid");
  // Remember the last gradient so switching modes back and forth keeps it.
  const [lastGradient, setLastGradient] = useState<IconGradient>(gradient ?? DEFAULT_GRADIENT);
  useEffect(() => {
    if (gradient) {
      setMode("gradient");
      setLastGradient(gradient);
    }
  }, [gradient]);

  const setGradient = (next: IconGradient) => {
    setLastGradient(next);
    onGradientChange(next);
  };

  return (
    <fieldset>
      <legend className="sr-only">Colour</legend>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span aria-hidden="true" className="text-[12.5px] font-medium text-ink-2">
          Colour
        </span>
        <Segmented
          label="Paint"
          size="sm"
          value={mode}
          onChange={(next) => {
            setMode(next);
            onGradientChange(next === "gradient" ? lastGradient : null);
          }}
          options={[
            { value: "solid", label: "Solid" },
            { value: "gradient", label: "Gradient" },
          ]}
        />
      </div>
      {mode === "solid" ? <SolidColor value={value} onChange={onChange} /> : <GradientEditor gradient={gradient ?? lastGradient} onChange={setGradient} />}
    </fieldset>
  );
}

function GradientEditor({ gradient, onChange }: { gradient: IconGradient; onChange: (g: IconGradient) => void }) {
  const fromId = useId();
  const toId = useId();
  const angleId = useId();
  const angle = gradient.angle ?? 135;
  const colorInput = (id: string, label: string, color: string, key: "from" | "to") => (
    <label htmlFor={id} className="flex items-center gap-2 rounded-full bg-subtle py-1 pl-1 pr-3 text-[12px] text-ink-2">
      <input
        id={id}
        type="color"
        aria-label={label}
        value={HEX.test(color) && color.length === 7 ? color : "#7c6cff"}
        onChange={(e) => onChange({ ...gradient, [key]: e.target.value })}
        className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent p-0"
      />
      <span className="font-mono uppercase text-ink">{color}</span>
    </label>
  );
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Gradient presets">
        {GRADIENT_PRESETS.map((preset) => {
          const active = sameGradient(gradient, preset);
          return (
            <button
              key={preset.label}
              type="button"
              aria-label={`${preset.label} gradient`}
              title={preset.label}
              aria-pressed={active}
              onClick={() => onChange({ from: preset.from, to: preset.to, angle })}
              className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${active ? "ring-2 ring-accent ring-offset-2 ring-offset-surface" : ""}`}
              style={{ background: swatch(preset) }}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {colorInput(fromId, "Gradient start colour", gradient.from, "from")}
        <button
          type="button"
          aria-label="Swap gradient colours"
          title="Swap colours"
          onClick={() => onChange({ ...gradient, from: gradient.to, to: gradient.from })}
          className="grid h-8 w-8 place-items-center rounded-full text-ink-2 hover:bg-subtle hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 8h14.5M15 4.5 18.5 8 15 11.5M20 16H5.5M9 12.5 5.5 16 9 19.5" />
          </svg>
        </button>
        {colorInput(toId, "Gradient end colour", gradient.to, "to")}
      </div>
      <div>
        <label htmlFor={angleId} className="flex justify-between text-[12px] text-ink-2">
          Angle <span className="font-mono text-ink">{angle}°</span>
        </label>
        <input
          id={angleId}
          type="range"
          min={0}
          max={345}
          step={15}
          value={angle}
          onChange={(e) => onChange({ ...gradient, angle: Number(e.target.value) })}
          className="mt-1.5 block w-full accent-[var(--accent)]"
          style={{ backgroundImage: swatch(gradient, angle) }}
        />
      </div>
    </div>
  );
}

function SolidColor({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  const hexId = useId();
  const pickerId = useId();
  const [draft, setDraft] = useState(value === "currentColor" ? "" : value);
  useEffect(() => setDraft(value === "currentColor" ? "" : value), [value]);
  const invalid = draft !== "" && !HEX.test(draft);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        {COLOR_PRESETS.map((preset) => {
          const active = value.toLowerCase() === preset.value.toLowerCase();
          return (
            <button
              key={preset.value}
              type="button"
              aria-label={preset.label}
              title={preset.label}
              aria-pressed={active}
              onClick={() => onChange(preset.value)}
              className={`grid h-8 w-8 place-items-center rounded-full border transition-shadow ${
                active ? "border-accent ring-2 ring-accent/30" : "border-line hover:border-line-strong"
              }`}
            >
              <span
                className="h-5 w-5 rounded-full"
                style={
                  preset.value === "currentColor"
                    ? { background: "conic-gradient(var(--text) 0 50%, var(--surface) 0 100%)", border: "1px solid var(--line-strong)" }
                    : { background: preset.value }
                }
              />
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <label htmlFor={pickerId} className="sr-only">
          Pick a custom colour
        </label>
        <input
          id={pickerId}
          type="color"
          value={HEX.test(value) && value.length === 7 ? value : "#5555e8"}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-9 cursor-pointer rounded-full border border-line bg-surface p-0.5"
        />
        <label htmlFor={hexId} className="sr-only">
          Custom hex colour
        </label>
        <input
          id={hexId}
          type="text"
          placeholder="#5555E8"
          spellCheck={false}
          autoComplete="off"
          maxLength={7}
          value={draft}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${hexId}-error` : undefined}
          onChange={(e) => {
            const next = e.target.value.startsWith("#") || e.target.value === "" ? e.target.value : `#${e.target.value}`;
            setDraft(next);
            if (HEX.test(next)) onChange(next);
          }}
          className={`h-8 w-[6.5rem] rounded-full border bg-surface px-2 font-mono text-[12.5px] uppercase text-ink ${
            invalid ? "border-danger" : "border-line"
          }`}
        />
        {invalid ? (
          <span id={`${hexId}-error`} className="text-[12px] text-danger">
            Use #RGB or #RRGGBB
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function StrokeControl({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (width: number) => void;
  disabled: boolean;
}) {
  const id = useId();
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={id} className="text-[12.5px] font-medium text-ink-2">
          Stroke width
        </label>
        <span className="font-mono text-[12px] tabular-nums text-ink-2">{disabled ? "—" : value.toFixed(2)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={1}
        max={3}
        step={0.25}
        value={value}
        disabled={disabled}
        aria-describedby={disabled ? `${id}-note` : undefined}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--accent)] disabled:opacity-40"
      />
      {disabled ? (
        <p id={`${id}-note`} className="mt-1 text-[12px] text-ink-2">
          Filled icons are solid shapes, so stroke width does not apply.
        </p>
      ) : null}
    </div>
  );
}

export function PreviewControls({
  options,
  onChange,
}: {
  options: IconOptions;
  onChange: (patch: Partial<IconOptions>) => void;
}) {
  return (
    <div className="space-y-5">
      <SizeControl value={options.size} onChange={(size) => onChange({ size })} />
      <ColorControl
        value={options.color}
        gradient={options.gradient}
        onChange={(color) => onChange({ color, gradient: null })}
        onGradientChange={(gradient) => onChange({ gradient })}
      />
      <StrokeControl
        value={options.strokeWidth}
        disabled={options.variant === "filled"}
        onChange={(strokeWidth) => onChange({ strokeWidth })}
      />
    </div>
  );
}
