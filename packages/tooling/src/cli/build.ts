import { buildAll } from "../build.ts";

// Usage: pnpm icons:build [--skip-invalid]
// --skip-invalid is for local work-in-progress only; CI builds must be strict.
const skipInvalid = process.argv.includes("--skip-invalid");
const started = Date.now();
const result = buildAll({ skipInvalid });

const errors = result.issues.filter((i) => i.severity === "error");
for (const issue of errors) {
  console.log(`error  ${issue.variant ? `${issue.icon}/${issue.variant}` : issue.icon}: ${issue.message}`);
}

if (errors.length > 0 && !skipInvalid) {
  console.error(`\nBuild aborted: ${errors.length} validation error(s). Run pnpm icons:validate for details.`);
  process.exit(1);
}
if (result.skipped.length > 0) console.warn(`\nSkipped invalid icons: ${result.skipped.join(", ")}`);
console.log(
  `Built ${result.icons.length} icons (${result.icons.length * 2} variant assets) into packages/ in ${Date.now() - started} ms.`,
);
