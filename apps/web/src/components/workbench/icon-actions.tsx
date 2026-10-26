"use client";

import type { IconVariants } from "@ikions/icons";
import { useState } from "react";
import { downloadBlob, downloadText, PNG_SIZES, pngFileName, svgFile, svgFileName, svgToPng } from "@/lib/export";
import { jsxSnippet, svgMarkup, type IconOptions } from "@/lib/snippets";
import { buttonClass } from "../ui/button";
import { CopyButton } from "../ui/copy-button";
import { DownloadIcon, ImageIcon, LoaderIcon } from "@ikions/react";

interface Props {
  icon: { name: string; title: string; component: string };
  nodes: IconVariants;
  options: IconOptions;
  layout?: "stack" | "row";
}

/** Copy and download actions for one icon, honouring the current options. */
export function IconActions({ icon, nodes, options, layout = "stack" }: Props) {
  const [pngSize, setPngSize] = useState<number>(256);
  const [pngState, setPngState] = useState<"idle" | "working" | "error">("idle");
  const fileOptions = { color: options.color, gradient: options.gradient ?? undefined, strokeWidth: options.strokeWidth, size: options.size };

  const downloadPng = async () => {
    setPngState("working");
    try {
      const svg = svgFile(nodes, options.variant, { ...fileOptions, color: options.color === "currentColor" ? "#000000" : options.color });
      downloadBlob(await svgToPng(svg, pngSize), pngFileName(icon.name, options.variant, pngSize));
      setPngState("idle");
    } catch {
      setPngState("error");
    }
  };

  const grid = layout === "stack" ? "grid grid-cols-2 gap-2" : "flex flex-wrap gap-2";
  const btn = `${buttonClass.small} justify-start`;

  return (
    <div className="space-y-3">
      <div className={grid}>
        <CopyButton text={() => svgMarkup(nodes[options.variant], options)} label="Copy SVG" className={btn} />
        <CopyButton text={() => jsxSnippet(icon, nodes[options.variant], options)} label="Copy JSX" className={btn} />
        <CopyButton text={icon.name} label="Copy name" className={btn} />
        <button
          type="button"
          className={btn}
          onClick={() => downloadText(svgFile(nodes, options.variant, fileOptions), svgFileName(icon.name, options.variant))}
        >
          <DownloadIcon size={16} />
          Download SVG
        </button>
      </div>
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor={`png-size-${icon.name}`}>
          PNG size
        </label>
        <select
          id={`png-size-${icon.name}`}
          value={pngSize}
          onChange={(e) => setPngSize(Number(e.target.value))}
          className="h-8 rounded-full border border-line bg-surface px-3 text-[12.5px] text-ink"
        >
          {PNG_SIZES.map((size) => (
            <option key={size} value={size}>
              {size} × {size} px
            </option>
          ))}
        </select>
        <button type="button" className={btn} onClick={downloadPng} disabled={pngState === "working"} aria-busy={pngState === "working"}>
          {pngState === "working" ? <LoaderIcon size={16} /> : <ImageIcon size={16} />}
          {pngState === "working" ? "Rendering…" : "Download PNG"}
        </button>
      </div>
      {pngState === "error" ? (
        <p role="alert" className="text-[12.5px] text-danger">
          PNG export failed in this browser. The SVG download still works.
        </p>
      ) : null}
    </div>
  );
}
