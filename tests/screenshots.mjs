// Capture review screenshots of key pages at desktop and mobile widths.
// Usage: BASE_URL=http://localhost:3100 node screenshots.mjs [out-dir] [paths...]
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const base = process.env.BASE_URL ?? "http://localhost:3100";
const out = path.resolve(process.argv[2] ?? "screenshots");
const paths = process.argv.slice(3).length ? process.argv.slice(3) : ["/", "/icons", "/icons/camera", "/categories", "/docs/react"];
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];
const themes = (process.env.THEMES ?? "light").split(",");

fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
for (const theme of themes) {
  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, colorScheme: theme });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    for (const p of paths) {
      await page.goto(base + p, { waitUntil: "networkidle" });
      const file = path.join(out, `${theme}-${vp.name}${p === "/" ? "-home" : p.replace(/[^a-z0-9]+/gi, "-")}.png`);
      await page.screenshot({ path: file, fullPage: process.env.FULL === "1" });
      console.log(file);
    }
    if (errors.length) console.log(`console errors (${theme}/${vp.name}):\n  ${errors.join("\n  ")}`);
    await context.close();
  }
}
await browser.close();
