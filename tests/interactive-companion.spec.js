const { test, expect } = require("@playwright/test");

test("Laboratory planner records player progress", async ({ page }) => {
  await page.goto("/research.html");
  const items = page.locator("#lab-plan-list .lab-plan-item");
  await expect(items.first()).toBeVisible();
  await items.first().locator("summary").click();
  await items.first().locator("select").first().selectOption("In progress");
  await expect(page.locator("#research-progress-copy")).toContainText("1 in progress");
  await page.reload();
  await expect(page.locator("#research-progress-copy")).toContainText("1 in progress");
});

test("dashboard retains personal goals without retired Troops controls", async ({ page }) => {
  await page.goto("/dashboard.html");
  await page.locator("#dashboard-goals > summary").click();
  await expect(page.locator("#dashboard-goal-form")).toBeVisible();
  await expect(page.locator("#dashboard-goal-category option")).toHaveCount(4);
  await expect(page.locator("#dashboard-goal-category")).not.toContainText("Troops");
  await expect(page.locator("#dashboard-goal-category")).not.toContainText("Events");
  await expect(page.locator('a[href*="events.html"]')).toHaveCount(0);
  await expect(page.locator("#dashboard-troop-value")).toHaveCount(0);
  await expect(page.locator('a[href*="troops.html"]')).toHaveCount(0);
});

test("Beginner Mode preserves a three-step progression checklist", async ({ page }) => {
  await page.goto("/beginner.html");
  await expect(page.locator("#beginner-steps .beginner-step")).toHaveCount(3);
  await expect(page.locator("#beginner-progress-text")).toHaveText("0 of 3 steps complete");
  await page.locator("#beginner-account").check();
  await expect(page.locator("#beginner-progress-text")).toHaveText("1 of 3 steps complete");
  await page.reload();
  await expect(page.locator("#beginner-progress-text")).toHaveText("1 of 3 steps complete");
});

test("mobile navigation exposes every retained primary destination", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const nav = page.locator('header nav[aria-label="Main navigation"]');
  const toggle = page.getByRole("button", { name: "Menu" });
  await expect(toggle).toBeVisible();
  await expect(nav).toBeHidden();
  await toggle.click();
  await expect(nav).toBeVisible();
  await expect(nav.locator("a")).toHaveCount(8);
  await expect(nav.getByRole("link", { name: "Troops" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Flowers Count" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Events Center" })).toHaveCount(0);
  const dims = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
  expect(dims.page).toBeLessThanOrEqual(dims.viewport + 1);
});

test("SVS Chest Opening is priced per account with a three-account capacity", async ({ page }) => {
  await page.goto("/pilot.html");
  await page.getByLabel(/SVS Chest Opening/).check();
  await expect(page.locator("#pilot-total")).toHaveText("$8");
  await expect(page.locator("#pilot-booking-summary")).toContainText("$5 per account × 1 account = $5");
  await page.locator("#pilot-svs-accounts").selectOption("3");
  await expect(page.locator("#pilot-total")).toHaveText("$18");
  await expect(page.locator("#pilot-booking-summary")).toContainText("$5 per account × 3 accounts = $15");
  await expect(page.locator("#pilot-svs-accounts option")).toHaveCount(3);
});
