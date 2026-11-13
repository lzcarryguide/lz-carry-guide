const { test, expect } = require("@playwright/test");

test("Events Center puts the event directory before historical weekly references", async ({ page }) => {
  await page.goto("/events.html");
  const order = await page.evaluate(() => ({
    directory: document.getElementById("event-directory").getBoundingClientRect().top,
    luckyRose: document.getElementById("lucky-rose-tracker").getBoundingClientRect().top
  }));
  expect(order.directory).toBeLessThan(order.luckyRose);
  await expect(page.getByRole("heading", { name: "Events Center" })).toBeVisible();
  await expect(page.locator("#event-results .event-profile").first()).toBeVisible();
});

test("selecting an event reveals its personal preparation checklist", async ({ page }) => {
  await page.goto("/events.html");
  const first = page.locator("#event-results .event-profile").first();
  await first.locator("summary").click();
  await expect(first.locator(".event-personal-checklist")).toBeVisible();
  await expect(first.locator(".event-personal-checklist input[type=checkbox]").first()).toBeVisible();
});
