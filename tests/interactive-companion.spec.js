const { test, expect } = require("@playwright/test");

test("Laboratory planner records player progress", async ({ page }) => {
  await page.goto("/research.html");
  const items = page.locator("#lab-plan-list .lab-plan-item");
  await expect(items.first()).toBeVisible();
  await items.first().locator("summary").click();
  const progress = items.first().locator("select").first();
  await progress.selectOption("In progress");
  await expect(page.locator("#research-progress-copy")).toContainText("1 in progress");
  await page.reload();
  await expect(page.locator("#research-progress-copy")).toContainText("1 in progress");
});

test("dashboard personal goals can be created, completed and removed", async ({ page }) => {
  await page.goto("/dashboard.html");
  await page.locator("#dashboard-goal-title").fill("Reach next HQ milestone");
  await page.locator("#dashboard-goal-category").selectOption("HQ");
  await page.getByRole("button", { name: "Add personal goal" }).click();
  const goal = page.locator("#dashboard-goal-list .dashboard-goal-item").first();
  await expect(goal).toContainText("Reach next HQ milestone");
  await goal.locator('input[type="checkbox"]').check();
  await expect(goal).toHaveClass(/is-complete/);
  await goal.getByRole("button", { name: "Remove" }).click();
  await expect(page.locator("#dashboard-goal-list .dashboard-goal-item")).toHaveCount(0);
});

test("Beginner Mode preserves a four-step non-Hero progression checklist", async ({ page }) => {
  await page.goto("/beginner.html");
  await expect(page.locator("#beginner-steps .beginner-step")).toHaveCount(4);
  await expect(page.locator("#beginner-progress-text")).toHaveText("0 of 4 steps complete");
  await page.locator("#beginner-account").check();
  await expect(page.locator("#beginner-progress-text")).toHaveText("1 of 4 steps complete");
  await page.reload();
  await expect(page.locator("#beginner-progress-text")).toHaveText("1 of 4 steps complete");
});

test("mobile navigation exposes every primary destination on the Troops page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/troops.html");
  const nav = page.locator('header nav[aria-label="Main navigation"]');
  const toggle = page.getByRole("button", { name: "Menu" });
  await expect(toggle).toBeVisible();
  await expect(nav).toBeHidden();
  await toggle.click();
  await expect(nav).toBeVisible();
  await expect(nav.locator("a")).toHaveCount(9);
  await expect(nav.getByRole("link", { name: "Troops" })).toBeVisible();
  const dims = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
  expect(dims.page).toBeLessThanOrEqual(dims.viewport + 1);
});
