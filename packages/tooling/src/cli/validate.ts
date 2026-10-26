import { loadCatalog } from "../catalog.ts";
import { validateCatalog } from "../validate.ts";

// Usage: pnpm icons:validate [name ...]   (no names = whole catalog)
const filters = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const catalog = loadCatalog();
const issues = validateCatalog(catalog).filter(
  (i) => filters.length === 0 || filters.includes(i.icon),
);
const errors = issues.filter((i) => i.severity === "error");
const warnings = issues.filter((i) => i.severity === "warning");

for (const issue of issues) {
  const where = issue.variant ? `${issue.icon}/${issue.variant}` : issue.icon;
  const label = issue.severity === "error" ? "error" : "warn ";
  console.log(`${label}  ${where}: ${issue.message}`);
}

const checked = filters.length === 0 ? catalog.icons.length : filters.length;
console.log(
  `\n${checked} icon(s) (${checked * 2} variant assets) checked — ` +
    `${errors.length} error(s), ${warnings.length} warning(s).`,
);
if (errors.length > 0) process.exit(1);
