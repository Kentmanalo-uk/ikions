// Usage: node merge.cjs gone=keep [gone=keep ...]  (run from repo root)
// Drops `gone` from the plan, deletes its source if drawn, and moves its name, aliases and tags onto `keep`.
const fs = require("fs");
const merge = Object.fromEntries(process.argv.slice(2).map((p) => p.split("=")));
const hf = "assets/plan/handdrawn.json";
const h = JSON.parse(fs.readFileSync(hf, "utf8"));
for (const [g, k] of Object.entries(merge)) h.$dropped[g] = "same as " + k;
fs.writeFileSync(hf, JSON.stringify(h, null, 2) + "\n");
const bf = "assets/plan/batches.json";
const b = JSON.parse(fs.readFileSync(bf, "utf8"));
for (const x of b) x.names = x.names.filter((n) => !(n in merge));
fs.writeFileSync(bf, JSON.stringify(b, null, 2) + "\n");
for (const [gone, keep] of Object.entries(merge)) {
  const mf = "assets/source/" + keep + "/meta.json";
  if (!fs.existsSync(mf)) { console.error("missing keep icon: " + keep); process.exitCode = 1; continue; }
  const m = JSON.parse(fs.readFileSync(mf, "utf8"));
  const gf = "assets/source/" + gone + "/meta.json";
  const gm = fs.existsSync(gf) ? JSON.parse(fs.readFileSync(gf, "utf8")) : { aliases: [], tags: [] };
  fs.rmSync("assets/source/" + gone, { recursive: true, force: true });
  for (const a of [gone, ...gm.aliases]) if (a !== keep && !m.aliases.includes(a)) m.aliases.push(a);
  for (const t of gm.tags) if (!m.tags.includes(t)) m.tags.push(t);
  fs.writeFileSync(mf, JSON.stringify(m, null, 2) + "\n");
  console.log(`${gone} -> ${keep}`);
}
