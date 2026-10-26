// Run Lighthouse against a running production server and print a summary.
// Usage: BASE_URL=http://localhost:3100 node lighthouse.mjs [out-dir]
// Requires Chrome; set CHROME_PATH (Playwright's Chromium works).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const base = process.env.BASE_URL ?? "http://localhost:3100";
const out = path.resolve(process.argv[2] ?? "lighthouse");
const pages = ["/", "/icons", "/icons/camera", "/docs/react"];
fs.mkdirSync(out, { recursive: true });

for (const preset of ["mobile", "desktop"]) {
  for (const page of pages) {
    const file = path.join(out, `${preset}${page === "/" ? "-home" : page.replace(/\//g, "-")}.json`);
    const args = ["-y", "lighthouse@13.5.0", base + page, "--quiet", "--chrome-flags=--headless=new", "--output=json", `--output-path=${file}`,
      "--only-categories=performance,accessibility,best-practices,seo"];
    if (preset === "desktop") args.push("--preset=desktop");
    execFileSync(process.platform === "win32" ? "npx.cmd" : "npx", args, { stdio: "ignore", shell: process.platform === "win32" });
    const report = JSON.parse(fs.readFileSync(file, "utf8"));
    const scores = Object.values(report.categories).map((c) => `${c.id.slice(0, 4)} ${Math.round(c.score * 100)}`).join("  ");
    const a = report.audits;
    console.log(`${preset.padEnd(8)} ${page.padEnd(14)} ${scores}  LCP ${a["largest-contentful-paint"].displayValue}  TBT ${a["total-blocking-time"].displayValue}  CLS ${a["cumulative-layout-shift"].displayValue}`);
  }
}
