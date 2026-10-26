// Compact review sheet: many icons, outline above filled, at 32px, 12 per row.
import fs from "node:fs";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { loadCatalog } from "../catalog.ts";
import { parseSvg, toNodes, nodesToMarkup } from "../svg.ts";
const [, , listFile, outDir] = process.argv;
const names = fs.readFileSync(listFile!, "utf8").trim().split(/\s+/);
const { icons } = loadCatalog();
const map = new Map(icons.map((i) => [i.meta.name, i]));
fs.mkdirSync(outDir!, { recursive: true });
const PER = 60, COLS = 10, CELL = 112;
for (let page = 0; page * PER < names.length; page++) {
  const chunk = names.slice(page * PER, (page + 1) * PER);
  let body = `<rect width="100%" height="100%" fill="#fff"/>`;
  chunk.forEach((name, i) => {
    const icon = map.get(name); if (!icon) return;
    const x = (i % COLS) * CELL + 8, y = Math.floor(i / COLS) * 96 + 6;
    const o = nodesToMarkup(toNodes(parseSvg(icon.svg.outline).children)).replaceAll("currentColor", "#111");
    const f = nodesToMarkup(toNodes(parseSvg(icon.svg.filled).children)).replaceAll("currentColor", "#111");
    body += `<svg x="${x}" y="${y}" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${o}</svg>`;
    body += `<svg x="${x + 50}" y="${y}" width="40" height="40" viewBox="0 0 24 24" fill="#111">${f}</svg>`;
    body += `<svg x="${x}" y="${y + 46}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${o}</svg>`;
    body += `<svg x="${x + 50}" y="${y + 46}" width="20" height="20" viewBox="0 0 24 24" fill="#111">${f}</svg>`;
    body += `<text x="${x}" y="${y + 84}" font-size="10" font-family="Arial" fill="#666">${name}</text>`;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${COLS * CELL}" height="${Math.ceil(chunk.length / COLS) * 96 + 8}">${body}</svg>`;
  fs.writeFileSync(path.join(outDir!, `p${String(page + 1).padStart(2, "0")}.png`), new Resvg(svg, { font: { loadSystemFonts: true } }).render().asPng());
}
console.log("pages", Math.ceil(names.length / PER));
