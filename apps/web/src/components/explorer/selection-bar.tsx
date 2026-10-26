"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, CloseIcon, DownloadIcon, LayersIcon, LoaderIcon, TrashIcon } from "@ikions/react";
import { useClientCatalog } from "@/lib/client-catalog";
import { buildSprite, buildZip, downloadBlob, downloadText, type ExportIcon, type ExportVariant } from "@/lib/export";
import { useSelection } from "@/lib/stored-set";
import { buttonClass } from "../ui/button";
import { CopyButton } from "../ui/copy-button";
import { NodeIcon } from "../ui/node-icon";
import { Segmented } from "../ui/segmented";

/** Floating toolbar for the multi-icon selection and its exports. */
export function SelectionBar() {
  const selection = useSelection();
  const [variant, setVariant] = useState<ExportVariant>("both");
  const [expanded, setExpanded] = useState(false);
  const [zipState, setZipState] = useState<"idle" | "working" | "error">("idle");
  const names = selection.values;
  const { catalog } = useClientCatalog(names.length > 0);
  if (names.length === 0) return null;
  const ready = Boolean(catalog);

  const icons: ExportIcon[] = names.flatMap((name) => {
    const nodes = catalog?.getNodes(name);
    return nodes ? [{ name, nodes }] : [];
  });

  const exportZip = async () => {
    setZipState("working");
    try {
      downloadBlob(await buildZip(icons, variant), "ikions-export.zip");
      setZipState("idle");
    } catch {
      setZipState("error");
    }
  };

  return (
    <section
      aria-label="Selected icons"
      className="ik-rise fixed inset-x-3 bottom-3 z-30 mx-auto max-w-3xl rounded-[24px] bg-elevated shadow-soft"
    >
      {expanded ? (
        <ul className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto p-3 pb-0" aria-label="Selected icon list">
          {names.map((name) => (
            <li key={name} className="flex items-center gap-1.5 rounded-lg bg-subtle py-1 pl-2 pr-1 text-[12.5px]">
              {catalog?.getNodes(name) ? <NodeIcon nodes={catalog.getNodes(name)!} size={16} /> : null}
              <span className="font-mono">{name}</span>
              <button
                type="button"
                onClick={() => selection.remove(name)}
                className="grid h-6 w-6 place-items-center rounded-md text-ink-2 hover:bg-surface hover:text-ink"
                aria-label={`Remove ${name} from selection`}
              >
                <CloseIcon size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap items-center gap-2 p-2.5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className={`${buttonClass.ghost} h-8 px-2`}
        >
          <span className="grid h-6 min-w-6 place-items-center rounded-md bg-accent px-1.5 text-[12px] font-semibold text-accent-contrast tabular-nums">
            {names.length}
          </span>
          selected
          {expanded ? <ChevronDownIcon size={16} /> : <ChevronUpIcon size={16} />}
        </button>
        <Segmented
          label="Export variant"
          size="sm"
          value={variant}
          onChange={setVariant}
          options={[
            { value: "outline", label: "Outline" },
            { value: "filled", label: "Filled" },
            { value: "both", label: "Both" },
          ]}
        />
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <CopyButton text={() => names.join("\n")} label="Copy names" className={buttonClass.small} />
          <button type="button" className={buttonClass.small} disabled={!ready} onClick={() => downloadText(buildSprite(icons, variant), `ikions-sprite-${variant}.svg`)}>
            <LayersIcon size={16} />
            Sprite
          </button>
          <button
            type="button"
            className={`${buttonClass.primary} h-8 px-3 text-[13px]`}
            onClick={exportZip}
            disabled={zipState === "working" || !ready}
            aria-busy={zipState === "working"}
          >
            {zipState === "working" || !ready ? <LoaderIcon size={16} /> : <DownloadIcon size={16} />}
            {zipState === "working" ? "Zipping…" : "Download ZIP"}
          </button>
          <button type="button" className={`${buttonClass.icon} h-8 w-8`} onClick={selection.clear} aria-label="Clear selection" title="Clear selection">
            <TrashIcon size={16} />
          </button>
        </div>
      </div>
      {zipState === "error" ? (
        <p role="alert" className="px-3 pb-2 text-[12.5px] text-danger">
          The ZIP could not be created. Try again or download icons individually.
        </p>
      ) : null}
    </section>
  );
}
