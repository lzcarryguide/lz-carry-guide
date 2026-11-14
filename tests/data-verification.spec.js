const { test, expect } = require("@playwright/test");

test("Troop database renders evidence labels and tier caveats", async ({ page }) => {
  await page.goto("/troops.html");
  const cards = page.locator("#troop-results .troop-class-card");
  await expect(cards).toHaveCount(3);
  await expect(cards.first().locator(".evidence-badge").first()).toBeVisible();
  await expect(cards.first()).toContainText("Statistics");
  await expect(cards.first()).toContainText("Unlock");
  await expect(cards.first()).toContainText("provisional");
});

test("event directory retains shared community evidence labels", async ({ page }) => {
  await page.goto("/events.html");
  await expect(page.locator("#event-results .evidence-badge").first()).toBeVisible();
  const statuses = await page.evaluate(async () => {
    const response = await fetch("data/events.json");
    const data = await response.json();
    return data.events.map(event => window.LZCarryDataStatus.normalize(event.verificationStatus || event.evidenceStatus || "unconfirmed"));
  });
  expect(statuses).toContain("community-supported");
  expect(statuses).toContain("unconfirmed");
});
