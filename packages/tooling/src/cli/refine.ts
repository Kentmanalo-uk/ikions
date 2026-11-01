import fs from "node:fs";
import path from "node:path";
import { SOURCE } from "../paths.ts";
import { refineSvg } from "../refine.ts";

let changed = 0;
for (const name of fs.readdirSync(SOURCE)) {
  for (const variant of ["outline", "filled"] as const) {
    const file = path.join(SOURCE, name, `${variant}.svg`);
    if (!fs.existsSync(file)) continue;
    const before = fs.readFileSync(file, "utf8");
    const after = refineSvg(before, variant);
    // Rewritten paths are longer; never push a detailed file past the validator limit.
    if (after !== before && Buffer.byteLength(after) <= 5000) {
      fs.writeFileSync(file, after);
      changed++;
    }
  }
}
console.log(`Refined ${changed} files.`);
