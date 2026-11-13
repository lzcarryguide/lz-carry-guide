const { test, expect } = require("@playwright/test");

test("profile recommendations reflect saved local research progress", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("lzcarry-research-plan-v1", JSON.stringify({
      "Alliance Recognition": "In progress",
      "Elite Troops": "Done"
    }));
  });
  await page.goto("/research.html");
  const items = page.locator("#research-profile-results .research-profile-item");
  await expect(items.filter({ hasText: "Alliance Recognition" })).toContainText("Your progress: In progress");
  await expect(items.filter({ hasText: "Elite Troops" })).toContainText("Your progress: Done");
  await page.locator("#research-player-profile").selectOption("high");
  await expect(items.filter({ hasText: "Alliance Recognition" })).toContainText("Your progress: In progress");
});

test("profile progress refreshes after the research tracker emits a change", async ({ page }) => {
  await page.goto("/research.html");
  const item = page.locator("#research-profile-results .research-profile-item").filter({ hasText: "Alliance Recognition" });
  await expect(item).toContainText("Your progress: Not started");
  await page.evaluate(() => {
    localStorage.setItem("lzcarry-research-plan-v1", JSON.stringify({ "Alliance Recognition": "Done" }));
    window.dispatchEvent(new CustomEvent("lzcarry-research-progress-change", { detail: { "Alliance Recognition": "Done" } }));
  });
  await expect(item).toContainText("Your progress: Done");
});
