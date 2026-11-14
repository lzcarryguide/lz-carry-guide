const { test, expect } = require("@playwright/test");

test("Flowers Count remains a standalone weekly tool outside the Event Center", async ({ page, request }) => {
  await page.goto("/flowers-count.html");
  await expect(page.getByRole("heading", { name: "Flowers Count" })).toBeVisible();
  await expect(page.locator("#lucky-rose-current")).toBeVisible();
  await expect(page.locator("#lucky-rose-history .lucky-rose-history-row").first()).toBeVisible();
  await expect(page.locator("#lucky-rose-scope-note")).toContainText("Monday at 00:00 Apocalypse Time (02:00 UTC)");
  expect((await request.get("/events.html")).status()).toBe(404);
});
