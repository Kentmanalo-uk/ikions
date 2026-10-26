import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Catalog-wide tests render every icon (thousands of rasterisations);
    // the 5 s default is too tight when all packages test in parallel.
    testTimeout: 120_000,
  },
});
