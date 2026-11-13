const { test, expect } = require("@playwright/test");

const validGoal = (id, title = "Protect my next milestone") => ({
  id, title, category: "HQ", dueDate: "2026-12-01", note: "Verify in game",
  done: false, createdAt: "2026-11-13T12:00:00.000Z"
});

test("dashboard ignores malformed and duplicate local goal records safely", async ({ page }) => {
  await page.goto("/dashboard.html");
  await page.evaluate((records) => localStorage.setItem("lzcarry-player-goals-v1", JSON.stringify(records)), [
    validGoal("same-id"),
    validGoal("same-id", "Duplicate should be ignored"),
    { ...validGoal("bad-date"), dueDate: "2026-02-30" },
    { ...validGoal("bad-time"), createdAt: "not-a-date" },
    { ...validGoal("too-long"), note: "x".repeat(201) },
    { ...validGoal("bad-category"), category: "Unknown" }
  ]);
  await page.reload();
  await expect(page.locator("#dashboard-goal-value")).toHaveText("0 / 1");
  await page.locator("#dashboard-goals > summary").click();
  await expect(page.locator("#dashboard-goal-list .dashboard-goal-item")).toHaveCount(1);
  await expect(page.locator("#dashboard-goal-list")).toContainText("Protect my next milestone");
  await expect(page.locator("#dashboard-goal-list")).not.toContainText("Duplicate should be ignored");
});

test("backup importer rejects duplicate goal IDs without overwriting current progress", async ({ page }) => {
  await page.goto("/dashboard.html");
  await page.evaluate((goal) => {
    localStorage.setItem("lzcarry-player-goals-v1", JSON.stringify([goal]));
    localStorage.setItem("lzcarry:hq-planner:v2", JSON.stringify({ "35:0": true }));
  }, validGoal("existing", "Existing saved goal"));
  await page.getByRole("button", { name: "Manage saved LZ Carry progress" }).click();
  const invalidBackup = {
    format: "lz-carry-player-data", schemaVersion: 1, exportedAt: "2026-11-13T12:00:00.000Z",
    data: { "lzcarry-player-goals-v1": [validGoal("duplicate"), validGoal("duplicate", "Second duplicate")] }
  };
  await page.locator(".player-data-file").setInputFiles({
    name: "invalid-goals.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(invalidBackup))
  });
  await expect(page.locator(".player-data-summary")).toContainText("Invalid personal goal data");
  const unchanged = await page.evaluate(() => ({
    goals: JSON.parse(localStorage.getItem("lzcarry-player-goals-v1")),
    hq: JSON.parse(localStorage.getItem("lzcarry:hq-planner:v2"))
  }));
  expect(unchanged.goals[0].title).toBe("Existing saved goal");
  expect(unchanged.hq["35:0"]).toBe(true);
});

test("failed partial backup import restores the existing goal and planner values", async ({ page }) => {
  await page.goto("/dashboard.html");
  await page.evaluate((goal) => {
    localStorage.setItem("lzcarry-player-goals-v1", JSON.stringify([goal]));
    localStorage.setItem("lzcarry:hq-planner:v2", JSON.stringify({ "35:0": false }));
    const original = Storage.prototype.setItem;
    let failOnce = true;
    Storage.prototype.setItem = function (key, value) {
      if (key === "lzcarry-player-goals-v1" && failOnce) {
        failOnce = false;
        throw new DOMException("Simulated storage quota failure", "QuotaExceededError");
      }
      return original.call(this, key, value);
    };
  }, validGoal("existing", "Keep this saved goal"));
  await page.getByRole("button", { name: "Manage saved LZ Carry progress" }).click();
  page.on("dialog", dialog => dialog.accept());
  const backup = {
    format: "lz-carry-player-data", schemaVersion: 1, exportedAt: "2026-11-13T12:00:00.000Z",
    data: {
      "lzcarry:hq-planner:v2": { "35:0": true },
      "lzcarry-player-goals-v1": [validGoal("incoming", "Imported goal")]
    }
  };
  await page.locator(".player-data-file").setInputFiles({
    name: "quota-failure.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(backup))
  });
  await expect(page.locator(".player-data-summary")).toContainText("Simulated storage quota failure");
  const restored = await page.evaluate(() => ({
    goals: JSON.parse(localStorage.getItem("lzcarry-player-goals-v1")),
    hq: JSON.parse(localStorage.getItem("lzcarry:hq-planner:v2"))
  }));
  expect(restored.goals).toHaveLength(1);
  expect(restored.goals[0].title).toBe("Keep this saved goal");
  expect(restored.hq["35:0"]).toBe(false);
});
