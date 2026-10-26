/**
 * `pnpm icons:watch [--with-web]` — keep the generated packages in sync with
 * assets/source while you work.
 *
 * Whenever an icon's SVG or meta.json changes (added, edited, deleted), the
 * catalog is rebuilt and the packages the website reads are recompiled.
 * The Next.js dev server watches those packages, so the site (counts,
 * explorer, icon pages) updates by itself. Invalid icons are skipped, not
 * fatal, so a half-finished icon never blocks the rest.
 *
 * --with-web also starts the website dev server, so `pnpm dev` is one command.
 */
import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ASSETS, ROOT } from "../paths.ts";

/** The packages the website imports; vue and svelte are rebuilt by `pnpm build`. */
const SITE_PACKAGES = ["@ikions/icons", "@ikions/metadata", "@ikions/react"];
const DEBOUNCE_MS = 1500;

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const run = (args: string[]) =>
  new Promise<number>((resolve) => {
    const child = spawn(pnpm, args, { cwd: ROOT, stdio: "inherit", shell: process.platform === "win32" });
    child.on("exit", (code) => resolve(code ?? 1));
  });

let timer: NodeJS.Timeout | undefined;
let building = false;
let pending = false;
const changed = new Set<string>();

async function rebuild() {
  if (building) {
    pending = true;
    return;
  }
  building = true;
  const files = [...changed];
  changed.clear();
  const started = Date.now();
  console.log(`\n[icons:watch] ${files.length} change(s) (${files.slice(0, 3).join(", ")}${files.length > 3 ? ", …" : ""}) — rebuilding`);
  const assets = await run(["--filter", "@ikions/tooling", "exec", "tsx", "src/cli/build.ts", "--skip-invalid"]);
  const packages = assets === 0 ? await run([...SITE_PACKAGES.flatMap((p) => ["--filter", p]), "build"]) : 1;
  console.log(
    packages === 0
      ? `[icons:watch] up to date in ${((Date.now() - started) / 1000).toFixed(1)}s`
      : "[icons:watch] rebuild failed — fix the error above; watching continues",
  );
  building = false;
  if (pending || changed.size > 0) {
    pending = false;
    void rebuild();
  }
}

function onChange(file: string | null) {
  if (!file || !/\.(svg|json)$/.test(file)) return;
  changed.add(file.replace(/\\/g, "/"));
  clearTimeout(timer);
  timer = setTimeout(() => void rebuild(), DEBOUNCE_MS);
}

// Icon sources plus the shared catalog files (categories, collections, releases).
fs.watch(path.join(ASSETS, "source"), { recursive: true }, (_event, file) => onChange(file && `source/${file}`));
fs.watch(ASSETS, (_event, file) => onChange(file));
console.log(`[icons:watch] watching ${path.relative(ROOT, ASSETS)}/ — packages rebuild on every icon change`);

let web: ChildProcess | undefined;
if (process.argv.includes("--with-web")) {
  web = spawn(pnpm, ["--filter", "@ikions/web", "dev"], { cwd: ROOT, stdio: "inherit", shell: process.platform === "win32" });
  web.on("exit", (code) => process.exit(code ?? 0));
}
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    web?.kill(signal);
    process.exit(0);
  });
}
