const { test, expect } = require("@playwright/test");

test("Events Center indexes 16 caveated profiles and filters event names", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/events.html");
  await expect(page.getByRole("heading", { name: "Events & Rewards" })).toBeVisible();
  await expect(page.locator("#event-results .event-profile")).toHaveCount(16);
  await page.getByLabel("Search events").fill("Canyon Clash");
  await expect(page.locator("#event-count")).toHaveText("1 record");
  await expect(page.locator("#event-results .event-profile")).toContainText("Canyon Clash");
  await page.getByLabel("Search events").fill("");
  await page.getByLabel("Event type").selectOption("Alliance");
  await expect(page.locator("#event-results .event-profile").first()).toBeVisible();
  await expect(page.locator("#event-count")).not.toHaveText("16 records");
  expect(errors).toEqual([]);
});

test("Full Preparedness theme is manual and checklist progress persists locally", async ({ page }) => {
  await page.goto("/events.html");
  const theme = page.getByLabel("Current Full Preparedness theme");
  await theme.selectOption("Research");
  await expect(page.locator("#event-theme-context")).toContainText("Current theme selected: Research");
  await expect(page.locator("#event-theme-context")).toContainText("manual");
  await expect(page.locator("#event-prep-checks .event-check-row")).toHaveCount(4);
  await expect(page.locator("#event-prep-milestones .event-check-row")).toHaveCount(4);
  await page.locator("#event-prep-checks input").first().check();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("lzcarry-event-prep-v2") || "{}"));
  expect(Object.values(saved)).toContain(true);

  await page.reload();
  await page.getByLabel("Current Full Preparedness theme").selectOption("Research");
  await expect(page.locator("#event-prep-checks input").first()).toBeChecked();
  await page.locator("#event-prep-reset").click();
  await expect(page.locator("#event-prep-checks input").first()).not.toBeChecked();
  await expect(page.evaluate(() => localStorage.getItem("lzcarry-event-prep-v2"))).resolves.toBeNull();
});

test("Progress backup preserves current event preparation and saved formation data", async ({ page }) => {
  await page.goto("/dashboard.html");
  await page.getByRole("button", { name: "Manage saved LZ Carry progress" }).click();
  page.on("dialog", dialog => dialog.accept());
  const backup = {
    format: "lz-carry-player-data",
    schemaVersion: 1,
    exportedAt: "2026-11-27T09:00:00.000Z",
    app: "LZ Carry",
    data: {
      "lzcarry-event-prep-v2": { "20261127-Research-0": true },
      "lzcarry-formation-library-v1": { saved: [{ id: "main", name: "Main", heroes: ["Audrey", "Ava", null, null, null] }] }
    }
  };
  await page.locator(".player-data-file").setInputFiles({
    name: "hero-event-progress.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup))
  });
  await expect(page.locator(".player-data-summary")).toContainText("Progress imported successfully");
  const restored = await page.evaluate(() => ({
    event: JSON.parse(localStorage.getItem("lzcarry-event-prep-v2") || "null"),
    formation: JSON.parse(localStorage.getItem("lzcarry-formation-library-v1") || "null")
  }));
  expect(restored.event["20261127-Research-0"]).toBe(true);
  expect(restored.formation.saved[0].name).toBe("Main");
});
