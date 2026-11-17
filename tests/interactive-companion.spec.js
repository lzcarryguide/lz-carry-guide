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
  await expect(nav.locator("a")).toHaveCount(9);
  await expect(nav.getByRole("link", { name: "Troops" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Flowers Count" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "The Veil Archives" })).toHaveAttribute("href", "stories/index.html");
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


test("HQ Planner exposes HQ1–HQ35 and matches every published prerequisite and per-level cost record", async ({ page, request }) => {
  const response = await request.get("/data/hq-requirements.json");
  expect(response.status()).toBe(200);
  const dataset = await response.json();
  expect(dataset.schemaVersion).toBe(4);
  expect(dataset.scope.minimumHqLevel).toBe(1);
  expect(dataset.scope.maximumHqLevel).toBe(35);
  expect(Array.isArray(dataset.levels)).toBeTruthy();

  const levels = [...dataset.levels].sort((a, b) => a.targetHq - b.targetHq);
  expect(new Set(levels.map(level => level.targetHq)).size).toBe(levels.length);
  expect(levels.every(level => Number.isInteger(level.targetHq) && level.targetHq >= 2 && level.targetHq <= 35)).toBeTruthy();

  await page.goto("/beginner.html#hq-planner-section");
  const current = page.locator("#hq-current");
  const target = page.locator("#hq-target");
  await expect(current.locator("option")).toHaveCount(35);
  await expect(target.locator("option")).toHaveCount(35);

  const formatMillions = value => value === 0 ? "0" : new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(value) + "M";
  for (const level of levels) {
    await current.selectOption(String(level.targetHq - 1));
    await target.selectOption(String(level.targetHq));
    const step = page.locator("#hq-steps .hq-step");
    await expect(step).toHaveCount(1);
    await expect(step.locator("h3")).toHaveText("HQ " + level.targetHq);
    const expectedBuildings = level.requiredBuildings || [];
    await expect(step.locator(".hq-check")).toHaveCount(expectedBuildings.length);
    for (const building of expectedBuildings) {
      await expect(step).toContainText(building.name);
      if (Number.isInteger(building.requiredLevel)) {
        await expect(step).toContainText("Required level: " + building.requiredLevel);
      }
    }
    const costs = level.resources || {};
    const keys = ["foodMillions", "woodMillions", "zentMillions", "steelMillions"];
    if (keys.every(key => Number.isFinite(costs[key]))) {
      const displayed = await step.locator(".hq-cost-list").first().locator("dd").allTextContents();
      expect(displayed).toEqual(keys.map(key => formatMillions(costs[key])));
    } else {
      await expect(step).toContainText("Cost not listed");
    }
  }

  await current.selectOption("1");
  await target.selectOption("35");
  await expect(page.locator("#hq-steps .hq-step")).toHaveCount(levels.filter(level => level.targetHq > 1 && level.targetHq <= 35).length);
  const expectedChecks = levels.reduce((sum, level) => sum + (level.requiredBuildings || []).length, 0);
  await expect(page.locator("#hq-steps .hq-check")).toHaveCount(expectedChecks);
  const allHaveCosts = levels.every(level => ["foodMillions", "woodMillions", "zentMillions", "steelMillions"].every(key => Number.isFinite(level.resources?.[key])));
  if (allHaveCosts) {
    const totals = { foodMillions: 0, woodMillions: 0, zentMillions: 0, steelMillions: 0 };
    levels.forEach(level => Object.keys(totals).forEach(key => { totals[key] += level.resources[key]; }));
    const actual = await page.locator("#hq-totals .hq-cost-list dd").allTextContents();
    expect(actual).toEqual(Object.values(totals).map(formatMillions));
  } else {
    await expect(page.locator("#hq-totals")).toContainText("Incomplete");
  }
});

test("HQ prerequisite checklist state persists when changing levels and refreshing", async ({ page }) => {
  await page.goto("/beginner.html#hq-planner-section");
  await page.locator("#hq-current").selectOption("4");
  await page.locator("#hq-target").selectOption("5");
  const check = page.locator("#hq-steps .hq-check input[type=checkbox]").first();
  await expect(check).toBeVisible();
  const key = await check.getAttribute("data-key");
  await check.check();
  await page.reload();
  await page.locator("#hq-current").selectOption("4");
  await page.locator("#hq-target").selectOption("5");
  await expect(page.locator("#hq-steps .hq-check input[type=checkbox]").first()).toBeChecked();
  expect(key).toBeTruthy();
});
