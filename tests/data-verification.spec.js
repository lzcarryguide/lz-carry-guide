const { test, expect } = require("@playwright/test");

test("Flowers Count retains evidence labels and detects a stale weekly record", async ({ page }) => {
  await page.goto("/flowers-count.html");
  await expect(page.getByRole("heading", { name: "Flowers Count" })).toBeVisible();
  await expect(page.locator("#lucky-rose-current .evidence-badge").first()).toBeVisible();
  await expect(page.locator("#lucky-rose-scope-note")).toContainText("Monday at 00:00 Apocalypse Time (02:00 UTC)");
  const data = await page.evaluate(async () => (await (await fetch("data/lucky-rose-history.json")).json()));
  expect(data.activeCandidate.weekOf).toBe("2026-11-09");
  expect(data.activeCandidate.inGameConfirmed).toBe(false);
  expect(data.history.length).toBeGreaterThan(0);
});

test("Flowers Count flags the previous value after Monday weekly reset", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-16T02:01:00.000Z") });
  await page.goto("/flowers-count.html");
  await expect(page.locator("#lucky-rose-current")).toContainText("Previous week");
  await expect(page.locator("#lucky-rose-current")).toContainText("Last recorded #5");
  await expect(page.locator("#lucky-rose-current")).toContainText("new weekly count has not yet been recorded");
});
