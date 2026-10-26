import { Resvg } from "@resvg/resvg-js";
import { ROOT_ATTRS, VARIANTS, type IconNode, type Variant } from "./schema.ts";
import { nodesToMarkup } from "./svg.ts";

export interface SheetIcon {
  name: string;
  nodes: Record<Variant, IconNode[]>;
}

const rootPaint = (variant: Variant, color: string) =>
  Object.entries(ROOT_ATTRS[variant])
    .filter(([k]) => !["xmlns", "width", "height", "viewBox"].includes(k))
    .map(([k, v]) => `${k}="${v === "currentColor" ? color : v}"`)
    .join(" ");

function embed(icon: SheetIcon, variant: Variant, x: number, y: number, size: number, color: string) {
  const markup = nodesToMarkup(icon.nodes[variant]).replaceAll("currentColor", color);
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" ${rootPaint(variant, color)}>${markup}</svg>`;
}

function grid(x: number, y: number, size: number) {
  const step = size / 24;
  let lines = "";
  for (let i = 0; i <= 24; i++) {
    const p = i * step;
    const strong = i % 2 === 0 ? 0.5 : 0.25;
    lines += `<line x1="${x + p}" y1="${y}" x2="${x + p}" y2="${y + size}" stroke="#d9d9f5" stroke-width="${strong}"/>`;
    lines += `<line x1="${x}" y1="${y + p}" x2="${x + size}" y2="${y + p}" stroke="#d9d9f5" stroke-width="${strong}"/>`;
  }
  // Live area (2–22) and circle keyline.
  lines += `<rect x="${x + 2 * step}" y="${y + 2 * step}" width="${20 * step}" height="${20 * step}" fill="none" stroke="#f0a0a0" stroke-width="0.75"/>`;
  lines += `<circle cx="${x + 12 * step}" cy="${y + 12 * step}" r="${9 * step}" fill="none" stroke="#a0c0f0" stroke-width="0.75"/>`;
  return lines;
}

/** Large construction view: each icon at 4× with grid and keylines. */
export function renderDetailSheet(icons: SheetIcon[], columns = 4): Buffer {
  const box = 120;
  const gap = 16;
  const cellW = box * 2 + gap * 3;
  const cellH = box + 36;
  const rows = Math.ceil(icons.length / columns);
  const width = columns * cellW;
  const height = rows * cellH + gap;
  let body = `<rect width="100%" height="100%" fill="#ffffff"/>`;
  icons.forEach((icon, index) => {
    const cx = (index % columns) * cellW + gap;
    const cy = Math.floor(index / columns) * cellH + gap;
    VARIANTS.forEach((variant, vi) => {
      const x = cx + vi * (box + gap);
      body += grid(x, cy, box);
      body += embed(icon, variant, x, cy, box, "#18191B");
    });
    body += `<text x="${cx}" y="${cy + box + 16}" font-family="Arial" font-size="13" fill="#18191B">${icon.name}</text>`;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${body}</svg>`;
  return new Resvg(svg, { font: { loadSystemFonts: true, defaultFontFamily: "Arial" } }).render().asPng();
}

/** Pixel-accurate view: each icon at 16/20/24/32 px, light and dark. */
export function renderSizeSheet(icons: SheetIcon[], columns = 3, scale = 2): Buffer {
  const sizes = [16, 20, 24, 32];
  const pad = 10;
  const groupW = sizes.reduce((a, s) => a + s + pad, 0) + pad;
  const cellW = groupW * 2 + 12;
  const rowH = 32 + pad * 2;
  const cellH = rowH * 2 + 20;
  const rows = Math.ceil(icons.length / columns);
  const width = columns * cellW;
  const height = rows * cellH;
  let body = `<rect width="100%" height="100%" fill="#FAFAF8"/>`;
  icons.forEach((icon, index) => {
    const ox = (index % columns) * cellW;
    const oy = Math.floor(index / columns) * cellH;
    [["#FFFFFF", "#18191B"], ["#121316", "#F5F5F2"]].forEach(([bg, fg], themeIndex) => {
      const gx = ox + themeIndex * (groupW + 4);
      body += `<rect x="${gx}" y="${oy}" width="${groupW}" height="${rowH * 2}" fill="${bg}"/>`;
      VARIANTS.forEach((variant, vi) => {
        let x = gx + pad;
        for (const size of sizes) {
          const y = oy + vi * rowH + pad + (32 - size) / 2;
          body += embed(icon, variant, Math.round(x), Math.round(y), size, fg!);
          x += size + pad;
        }
      });
    });
    body += `<text x="${ox + 2}" y="${oy + rowH * 2 + 14}" font-family="Arial" font-size="11" fill="#72747A">${icon.name}</text>`;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${body}</svg>`;
  // Render at 1× first so the pixel grid is real, then scale up for review.
  const png = new Resvg(svg, { font: { loadSystemFonts: true, defaultFontFamily: "Arial" }, shapeRendering: 2 }).render().asPng();
  if (scale === 1) return png;
  return upscale(png, width, height, scale);
}

/** Render a single icon variant to PNG at the given pixel size. */
export function renderIconPng(nodes: IconNode[], variant: Variant, size: number, color = "#000000"): Buffer {
  const markup = nodesToMarkup(nodes).replaceAll("currentColor", color);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" ${rootPaint(variant, color)}>${markup}</svg>`;
  return new Resvg(svg, { fitTo: { mode: "width", value: size }, font: { loadSystemFonts: false } }).render().asPng();
}

/** Re-render the 1× sheet as an image scaled with nearest-neighbour pixels. */
function upscale(png: Buffer, width: number, height: number, scale: number): Buffer {
  const href = `data:image/png;base64,${png.toString("base64")}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}"><image href="${href}" width="${width * scale}" height="${height * scale}" style="image-rendering:pixelated" image-rendering="optimizeSpeed"/></svg>`;
  return new Resvg(svg, { font: { loadSystemFonts: false } }).render().asPng();
}
