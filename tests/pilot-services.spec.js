const { test, expect } = require("@playwright/test");

const invite = "https://discord.gg/kVmN6e7Rm";

test("official pilot contact buttons use the approved Discord invite", async ({ page }) => {
  await page.route(invite, route => route.fulfill({ status: 200, contentType: "text/html", body: "<title>Discord invite test</title>" }));
  await page.goto("/pilot.html");
  for (const [id, label] of [["pilot-request", "Request a Pilot"], ["pilot-assistance", "Ask for Assistance"]]) {
    const button = page.locator("#" + id);
    await expect(button).toBeEnabled();
    await expect(button).toHaveAttribute("data-destination", invite);
    await button.click();
    await expect(page).toHaveURL(invite);
    await page.goto("/pilot.html");
  }
});

test("pilot service descriptions and approved prices match the official reference", async ({ page }) => {
  await page.goto("/pilot.html");
  await expect(page.getByText("$3/day", { exact: true })).toBeVisible();
  await expect(page.getByText("$8", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("$30 / 7 days", { exact: true })).toBeVisible();
  await expect(page.getByText(/Full Preparedness \(FP\), Boomer, Mines, Melee, Arena and Fury Lord/)).toBeVisible();
  await expect(page.getByText(/Enemy Buster participation and RSS Loot-Cap assistance/)).toBeVisible();
  await expect(page.getByText(/Upgrade planning and progression/)).toBeVisible();
  await expect(page.getByText(/participation time and workload/)).toBeVisible();
  await expect(page.getByText(/Approximately 45 minutes of gameplay per account/)).toBeVisible();
  await expect(page.getByText(/Covers 2–3 accounts/)).toBeVisible();
});

test("pilot pricing calculator preserves flat packages, per-day and per-account totals, and quote exclusion", async ({ page }) => {
  await page.goto("/pilot.html");
  await expect(page.locator("#pilot-total")).toHaveText("$3");
  await page.getByLabel("Daily Pilot duration").fill("5");
  await expect(page.locator("#pilot-total")).toHaveText("$15");
  await page.getByLabel("Saturday Special").check();
  await expect(page.locator("#pilot-total")).toHaveText("$8");
  await page.getByLabel("Weekly Elite Management").check();
  await expect(page.locator("#pilot-total")).toHaveText("$30");
  await page.getByLabel(/SVS Chest Opening/).check();
  await expect(page.locator("#pilot-total")).toHaveText("$35");
  await page.getByLabel(/Canyon Clash/).check();
  await page.locator("#pilot-canyon-accounts").fill("3");
  await expect(page.locator("#pilot-total")).toHaveText("$59");
  await page.getByLabel(/Full SVS Participation/).check();
  await expect(page.locator("#pilot-total")).toHaveText("$59 + SVS quote");
  await expect(page.locator("#pilot-price-status")).toContainText("excludes the individually quoted Full SVS Participation");
  await expect(page.locator("#pilot-booking-summary")).toContainText("individual quote");
});

test("pilot page remains usable on desktop and mobile without horizontal overflow", async ({ page }) => {
  for (const width of [1440, 390, 360]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/pilot.html");
    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
    expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport + 1);
    await expect(page.locator("#pilot-request")).toBeEnabled();
    await expect(page.locator("#pilot-assistance")).toBeEnabled();
    await page.screenshot({ path: "artifacts/pilot-services-" + width + ".png", fullPage: true });
  }
});
