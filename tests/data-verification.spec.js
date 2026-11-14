const { test, expect } = require("@playwright/test");

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
