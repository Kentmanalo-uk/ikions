import { nodesToSvg, type IconVariant, type IconVariants, type ToSvgOptions } from "@ikions/icons";
import { absoluteUrl } from "./site";

export type ExportVariant = IconVariant | "both";

export interface ExportIcon {
  name: string;
  nodes: IconVariants;
}

const variantsFor = (variant: ExportVariant): IconVariant[] => (variant === "both" ? ["outline", "filled"] : [variant]);

/** Canonical file name for a downloaded SVG. */
export const svgFileName = (name: string, variant: IconVariant) => `ikions-${name}-${variant}.svg`;
export const pngFileName = (name: string, variant: IconVariant, size: number) => `ikions-${name}-${variant}-${size}px.png`;

/** Standalone SVG file content (no aria-hidden, colour stays currentColor). */
export function svgFile(nodes: IconVariants, variant: IconVariant, options: Pick<ToSvgOptions, "color" | "gradient" | "strokeWidth" | "size"> = {}) {
  return `${nodesToSvg(nodes[variant], variant, options).replace(' aria-hidden="true"', "")}\n`;
}

/** Paths and contents for a ZIP export: ikions-export/<variant>/<name>.svg. */
export function zipEntries(icons: ExportIcon[], variant: ExportVariant): { path: string; content: string }[] {
  const entries: { path: string; content: string }[] = [];
  for (const v of variantsFor(variant)) {
    for (const icon of icons) {
      entries.push({ path: `ikions-export/${v}/${icon.name}.svg`, content: svgFile(icon.nodes, v) });
    }
  }
  return entries;
}

export async function buildZip(icons: ExportIcon[], variant: ExportVariant): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const entry of zipEntries(icons, variant)) zip.file(entry.path, entry.content);
  zip.file("ikions-export/sprite.svg", buildSprite(icons, variant));
  zip.file(
    "ikions-export/README.txt",
    [
      "Ikions icon export",
      "",
      `Icons: ${icons.map((i) => i.name).join(", ")}`,
      `Variants: ${variantsFor(variant).join(", ")}`,
      "",
      "SVG files use currentColor, so they inherit the surrounding text colour when inlined.",
      "sprite.svg contains one <symbol> per icon; reference it with <use href=\"sprite.svg#ikions-NAME\">.",
      "",
      `License: ${absoluteUrl("/license")}`,
    ].join("\n"),
  );
  return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}

/**
 * An SVG sprite with one <symbol> per icon. When both variants are exported,
 * filled symbols get a `-filled` suffix: `ikions-home` and `ikions-home-filled`.
 */
export function buildSprite(icons: ExportIcon[], variant: ExportVariant): string {
  const symbols: string[] = [];
  for (const v of variantsFor(variant)) {
    for (const icon of icons) {
      const body = nodesToSvg(icon.nodes[v], v)
        .replace(/^<svg [^>]*>/, "")
        .replace(/<\/svg>$/, "");
      const id = variant === "both" && v === "filled" ? `ikions-${icon.name}-filled` : `ikions-${icon.name}`;
      const paint =
        v === "outline"
          ? 'fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"'
          : 'fill="currentColor"';
      symbols.push(`  <symbol id="${id}" viewBox="0 0 24 24" ${paint}>${body}</symbol>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${symbols.join("\n")}\n</svg>\n`;
}

/** Rasterise an SVG string to a transparent PNG of the given pixel size. */
export async function svgToPng(svg: string, size: number): Promise<Blob> {
  const sized = svg.replace(/width="[^"]*"/, `width="${size}"`).replace(/height="[^"]*"/, `height="${size}"`);
  const url = URL.createObjectURL(new Blob([sized], { type: "image/svg+xml" }));
  try {
    const image = new Image(size, size);
    image.decoding = "async";
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not supported in this browser");
    context.clearRect(0, 0, size, size);
    context.drawImage(image, 0, 0, size, size);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("PNG encoding failed"))), "image/png"),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const downloadText = (text: string, fileName: string, type = "image/svg+xml") =>
  downloadBlob(new Blob([text], { type }), fileName);

/** PNG export sizes offered on detail pages and in the inspector. */
export const PNG_SIZES = [24, 48, 96, 256, 512] as const;
