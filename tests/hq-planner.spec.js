const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const artifacts = path.join(process.cwd(), "artifacts");
fs.mkdirSync(artifacts, { recursive: true });

test("HQ planner shows candidate prerequisites and withholds unverified costs", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/beginner.html#hq-planner-section");
  await expect(page.getByRole("heading", { name: "Headquarters Progression Planner" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "hq-planner-desktop.png"), fullPage: true });
  await expect(page.getByText(/community research candidates/i)).toBeVisible();
  await expect(page.locator("#hq-current")).toHaveValue("1");
  await expect(page.locator("#hq-target")).toHaveValue("10");
  await expect(page.getByRole("heading", { name: "HQ 4" })).toBeVisible();
  await expect(page.getByText("City Walls", { exact: true })).toBeVisible();
  await expect(page.getByText("Required level: 3")).toBeVisible();
  await expect(page.getByText("Not verified for your server/version").first()).toBeVisible();
  await expect(page.locator("#hq-totals")).toContainText("Unavailable — costs are not verified");
  await page.locator("#hq-target").selectOption("6");
  await expect(page.getByRole("heading", { name: "HQ 6" })).toBeVisible();
  await expect(page.getByText("Military Center", { exact: true })).toBeVisible();
  await expect(page.getByText("Required level: 5")).toBeVisible();
  const firstCheck = page.locator('.hq-check input[type="checkbox"]').first();
  await firstCheck.check();
  await expect(page.locator("#hq-progress")).toContainText("1 of");
  await page.reload();
  await expect(page.locator('.hq-check input[type="checkbox"]').first()).toBeChecked();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(artifacts, "hq-planner-mobile.png"), fullPage: true });
  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
  expect(widths.page).toBeLessThanOrEqual(widths.viewport + 1);
});

test("HQ planner restricts target to above current level", async ({ page }) => {
  await page.goto("/beginner.html#hq-planner-section");
  await page.locator("#hq-current").selectOption("20");
  await expect(page.locator("#hq-target")).toHaveValue("21");
  const disabled = await page.locator("#hq-target option:disabled").count();
  expect(disabled).toBe(20);
});
