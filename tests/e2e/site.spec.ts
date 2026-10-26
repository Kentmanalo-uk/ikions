import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("navigation", () => {
  test("homepage links to the explorer and documentation", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Icons for everything");
    await page.getByRole("link", { name: "Explore icons" }).first().click();
    await expect(page).toHaveURL(/\/icons$/);
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Documentation" }).click();
    await expect(page).toHaveURL(/\/docs$/);
    await expect(page.getByRole("heading", { level: 1, name: "Introduction" })).toBeVisible();
  });

  test("statistics come from the real catalog", async ({ page, request }) => {
    const api = await (await request.get("/api/v1/icons")).json();
    await page.goto("/");
    const overview = page.getByRole("region", { name: "Library overview" });
    await expect(overview).toContainText(api.count.toLocaleString("en"));
    await expect(overview).toContainText((api.count * 2).toLocaleString("en"));
  });

  test("categories are browsable", async ({ page }) => {
    await page.goto("/categories");
    await page.getByRole("link", { name: /Arrows & Directions/ }).click();
    await expect(page).toHaveURL(/\/categories\/arrows$/);
    // Titles use the animated heading; check the accessible name (what users and screen readers get).
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Arrows & Directions icons");
    await page.getByRole("link", { name: /arrow-up-right/ }).click();
    await expect(page).toHaveURL(/\/icons\/arrow-up-right$/);
  });

  test("hero search shows instant results", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("searchbox", { name: "Search icons" }).fill("wallet");
    await expect(page.getByRole("list", { name: "Matching icons" }).getByRole("link", { name: "Wallet", exact: true })).toBeVisible();
  });

  test("site search covers documentation", async ({ page }) => {
    await page.goto("/search?q=tree%20shaking");
    await expect(page.getByRole("link", { name: /React/ }).first()).toBeVisible();
  });

  test("unknown pages return 404", async ({ page }) => {
    const response = await page.goto("/icons/not-a-real-icon");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  });

  test("mobile navigation drawer works @mobile", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const drawer = page.getByRole("dialog", { name: "Menu" });
    // Under heavy parallel load a tap can land before React attaches the
    // click handler; retry the tap until the drawer opens.
    await expect(async () => {
      if (!(await drawer.isVisible())) await page.getByRole("button", { name: "Open menu" }).click();
      await expect(drawer).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 10_000 });
    await drawer.getByRole("link", { name: "Categories" }).click();
    await expect(page).toHaveURL(/\/categories$/);
    await expect(drawer).toBeHidden();
  });

  test("pages do not scroll horizontally on mobile @mobile", async ({ page }) => {
    for (const path of ["/", "/icons", "/icons/camera", "/docs/react", "/categories", "/license"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});

test.describe("accessibility", () => {
  for (const path of ["/", "/icons", "/icons/camera", "/categories", "/docs/react", "/license"]) {
    test(`${path} has no WCAG A/AA violations`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    });
  }

  test("dark theme has no contrast violations", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/icons/camera");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
    expect(results.violations.flatMap((v) => v.nodes.map((n) => `${n.target.join(" ")}: ${n.any[0]?.message ?? ""}`))).toEqual([]);
  });

  test("theme toggle switches and persists", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
});

test.describe("API", () => {
  test("serves icon metadata and SVG files", async ({ request }) => {
    const icon = await (await request.get("/api/v1/icons/camera")).json();
    expect(icon.icon.name).toBe("camera");
    expect(icon.svg.filled).toContain('fill="currentColor"');
    const svg = await request.get("/api/v1/icons/camera/outline.svg");
    expect(svg.headers()["content-type"]).toContain("image/svg+xml");
    expect(await svg.text()).toContain('viewBox="0 0 24 24"');
  });

  test("search validates input", async ({ request }) => {
    const ok = await (await request.get("/api/v1/search?q=trash&limit=3")).json();
    expect(ok.results[0].name).toBe("trash");
    expect((await request.get("/api/v1/search?q=x&limit=0")).status()).toBe(400);
    expect((await request.get("/api/v1/search?category=nope")).status()).toBe(400);
    expect((await request.get(`/api/v1/search?q=${"a".repeat(101)}`)).status()).toBe(400);
  });

  test("sends security headers", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    expect(headers["content-security-policy"]).toContain("object-src 'none'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
  });
});
