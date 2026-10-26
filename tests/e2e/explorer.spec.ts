import { expect, test } from "@playwright/test";
import fs from "node:fs";
import JSZip from "jszip";

/** Open the explorer and wait until it has hydrated and applied the URL state. */
async function openExplorer(page: import("@playwright/test").Page, query = "") {
  await page.goto(`/icons${query}`, { waitUntil: "networkidle" });
  const q = new URLSearchParams(query).get("q") ?? "";
  await expect(page.getByRole("searchbox", { name: "Search icons" })).toHaveValue(q);
}

const tile = (page: import("@playwright/test").Page, name: string) =>
  page.getByRole("list", { name: "Icons" }).locator(`[data-icon="${name}"]`);

test.describe("icon explorer", () => {
  test("finds icons by name, alias and concept", async ({ page }) => {
    await openExplorer(page);
    const search = page.getByRole("searchbox", { name: "Search icons" });

    await search.fill("trash");
    await expect(page.getByRole("list", { name: "Icons" }).locator("[data-icon]").first()).toHaveAttribute("data-icon", "trash");

    await search.fill("delete");
    await expect(page.getByRole("list", { name: "Icons" }).locator("[data-icon]").first()).toHaveAttribute("data-icon", "trash");

    await search.fill("payment");
    for (const name of ["wallet", "credit-card", "receipt"]) await expect(tile(page, name)).toBeVisible();

    await search.fill("message");
    for (const name of ["chat", "mail"]) await expect(tile(page, name)).toBeVisible();

    await search.fill("zzzzqqq");
    await expect(page.getByRole("heading", { name: "No icons found" })).toBeVisible();
  });

  test("filters by category and keeps state in the URL", async ({ page }) => {
    await openExplorer(page);
    await page.getByRole("navigation", { name: "Icon categories" }).getByRole("button", { name: /Weather & Nature/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Weather & Nature");
    await expect(page).toHaveURL(/category=weather/);
    await expect(tile(page, "cloud-rain")).toBeVisible();
    await expect(tile(page, "home")).toHaveCount(0);
  });

  test("switches to Filled", async ({ page }) => {
    await openExplorer(page, "?q=home");
    const filled = page.getByRole("radiogroup", { name: "Icon variant" }).getByRole("radio", { name: "Filled" });
    await filled.click();
    await expect(filled).toHaveAttribute("aria-checked", "true");
    await expect(page).toHaveURL(/variant=filled/);
    await expect(tile(page, "home").locator("svg")).toHaveAttribute("fill", "currentColor");
  });

  test("copies SVG from the inspector", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await openExplorer(page, "?q=camera");
    await tile(page, "camera").click();
    const inspector = page.getByRole("complementary", { name: "Camera inspector" });
    await expect(inspector).toBeVisible();
    await inspector.getByRole("button", { name: "Copy SVG" }).click();
    await expect(inspector.getByText("Copied").first()).toBeVisible();
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    expect(clipboard).toContain('viewBox="0 0 24 24"');
  });

  test("works with the keyboard only", async ({ page }) => {
    await openExplorer(page);
    await page.keyboard.press("/");
    await expect(page.getByRole("searchbox", { name: "Search icons" })).toBeFocused();
    await page.keyboard.type("arrow");
    await page.keyboard.press("ArrowDown");
    const first = page.getByRole("list", { name: "Icons" }).locator("[data-icon]").first();
    await expect(first).toBeFocused();
    await page.keyboard.press("ArrowRight");
    const second = page.getByRole("list", { name: "Icons" }).locator("[data-icon]").nth(1);
    await expect(second).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("complementary", { name: /inspector/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("complementary", { name: /inspector/ })).toHaveCount(0);
    await expect(second).toBeFocused();
  });

  test("exports a multi-icon ZIP with the documented structure", async ({ page }) => {
    await openExplorer(page, "?q=home");
    await tile(page, "home").focus();
    await page.keyboard.press("x");
    await page.getByRole("searchbox", { name: "Search icons" }).fill("search");
    await tile(page, "search").focus();
    await page.keyboard.press("x");

    const bar = page.getByRole("region", { name: "Selected icons" });
    await expect(bar).toContainText("2");
    const [download] = await Promise.all([page.waitForEvent("download"), bar.getByRole("button", { name: "Download ZIP" }).click()]);
    expect(download.suggestedFilename()).toBe("ikions-export.zip");
    const zip = await JSZip.loadAsync(fs.readFileSync((await download.path())!));
    const files = Object.keys(zip.files).filter((f) => !zip.files[f]!.dir).sort();
    expect(files).toEqual([
      "ikions-export/README.txt",
      "ikions-export/filled/home.svg",
      "ikions-export/filled/search.svg",
      "ikions-export/outline/home.svg",
      "ikions-export/outline/search.svg",
      "ikions-export/sprite.svg",
    ]);
    const svg = await zip.file("ikions-export/filled/home.svg")!.async("string");
    expect(svg).toContain('fill="currentColor"');

    const [sprite] = await Promise.all([page.waitForEvent("download"), bar.getByRole("button", { name: "Sprite" }).click()]);
    expect(sprite.suggestedFilename()).toBe("ikions-sprite-both.svg");

    await bar.getByRole("button", { name: "Clear selection" }).click();
    await expect(bar).toHaveCount(0);
  });

  test("opens the inspector as a bottom sheet on mobile @mobile", async ({ page }) => {
    await openExplorer(page, "?q=bell");
    await tile(page, "bell").click();
    const sheet = page.getByRole("dialog", { name: "Bell details" });
    await expect(sheet).toBeVisible();
    await sheet.getByRole("button", { name: "Close inspector" }).click();
    await expect(sheet).toBeHidden();
    await page.getByRole("button", { name: "Categories" }).click();
    await expect(page.getByRole("dialog", { name: "Categories" })).toBeVisible();
  });
});

test.describe("icon detail page", () => {
  test("has unique metadata", async ({ page }) => {
    await page.goto("/icons/camera");
    await expect(page).toHaveTitle("Camera Icon — Outline & Filled SVG | Ikions");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/icons\/camera$/);
  });

  test("downloads SVG and PNG with the chosen options", async ({ page }) => {
    await page.goto("/icons/camera");
    await page.getByRole("radiogroup", { name: "Variant", exact: true }).getByRole("radio", { name: "Filled" }).click();
    await page.getByRole("button", { name: "Ikions indigo" }).click();

    const [svgDownload] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download SVG" }).click()]);
    expect(svgDownload.suggestedFilename()).toBe("ikions-camera-filled.svg");
    const svg = fs.readFileSync((await svgDownload.path())!, "utf8");
    expect(svg).toContain('fill="#5555E8"');

    await page.getByLabel("PNG size").selectOption("96");
    const [pngDownload] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download PNG" }).click()]);
    expect(pngDownload.suggestedFilename()).toBe("ikions-camera-filled-96px.png");
    const png = fs.readFileSync((await pngDownload.path())!);
    expect(png.subarray(1, 4).toString()).toBe("PNG");
    expect(png.readUInt32BE(16)).toBe(96);
    expect(png.readUInt32BE(20)).toBe(96);
  });

  test("paints and downloads gradient icons", async ({ page }) => {
    await page.goto("/icons/sparkles", { waitUntil: "networkidle" });
    await page.getByRole("radiogroup", { name: "Paint" }).getByRole("radio", { name: "Gradient" }).click();
    await page.getByRole("button", { name: "Ocean gradient" }).click();
    // The header logo has its own gradients, so look for the icon's stop colour specifically.
    await expect(page.locator('linearGradient[id^="ikions-gradient-"] stop[stop-color="#22D3EE"]').first()).toBeAttached();

    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download SVG" }).click()]);
    const svg = fs.readFileSync((await download.path())!, "utf8");
    expect(svg).toContain("<linearGradient");
    expect(svg).toMatch(/stroke="url\(#ikions-gradient-[a-z0-9]+\)"/);
    expect(svg).toContain('stop-color="#2563EB"');

    await page.getByRole("tab", { name: "React" }).click();
    await expect(page.getByRole("tabpanel")).toContainText('gradient={{ from: "#22D3EE", to: "#2563EB", angle: 135 }}');
  });

  test("code tabs reflect the selected variant", async ({ page }) => {
    await page.goto("/icons/camera");
    await page.getByRole("radiogroup", { name: "Variant", exact: true }).getByRole("radio", { name: "Filled" }).click();
    await page.getByRole("tab", { name: "React" }).click();
    await expect(page.getByRole("tabpanel")).toContainText('<CameraIcon variant="filled" />');
    await expect(page.getByLabel("Stroke width")).toBeDisabled();
  });
});
