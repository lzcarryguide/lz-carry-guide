const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const pages = ["/", "/guides.html", "/beginner.html", "/dashboard.html", "/research.html", "/events.html", "/pilot.html"];
const artifacts = path.join(process.cwd(), "artifacts");
fs.mkdirSync(artifacts, { recursive: true });

test("primary navigation and internal links resolve without the retired Troops page", async ({ page, request }) => {
  await page.goto("/");
  const links = await page.locator("header nav a").evaluateAll(as => as.map(a => a.getAttribute("href")));
  expect(links).toEqual(expect.arrayContaining(["index.html", "guides.html", "dashboard.html", "beginner.html", "beginner.html#hq-planner-section", "research.html", "events.html", "pilot.html"]));
  expect(links.some(href => /troops\\.html/i.test(href))).toBeFalsy();
  for (const target of pages) {
    expect((await request.get(target)).status(), target).toBe(200);
    await page.goto(target);
    const localLinks = await page.locator("a[href]").evaluateAll(as => as.map(a => a.getAttribute("href")).filter(h => h && !h.startsWith("#") && !/^(https?:|mailto:|tel:|javascript:)/i.test(h)).map(h => h.split("#")[0]));
    for (const href of localLinks) expect((await request.get("/" + href)).status(), target + " -> " + href).toBe(200);
  }
  expect((await request.get("/troops.html")).status()).toBe(404);
  expect((await request.get("/data/troops.json")).status()).toBe(404);
});

test("desktop pages load without runtime errors or horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const target of pages) {
    const errors = [];
    const onError = error => errors.push(error.message);
    page.on("pageerror", onError);
    await page.goto(target);
    await expect(page.locator("main")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, target + " desktop overflow").toBeLessThanOrEqual(1);
    expect(errors, target + " runtime errors").toEqual([]);
    if (target === "/") await page.screenshot({ path: path.join(artifacts, "home-desktop.png"), fullPage: true });
    page.off("pageerror", onError);
  }
});

test("mobile layouts and navigation work at 390px and 320px", async ({ page }) => {
  for (const width of [390, 320]) {
    for (const target of pages) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(target);
      const sizes = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
      expect(sizes.page, target + " at " + width).toBeLessThanOrEqual(sizes.viewport + 1);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Menu" });
  const nav = page.locator('header nav[aria-label="Main navigation"]');
  await expect(toggle).toBeVisible();
  await expect(nav).toBeHidden();
  await toggle.click();
  await expect(nav).toBeVisible();
  await expect(nav.locator("a")).toHaveCount(8);
  await expect(nav.getByRole("link", { name: "Troops" })).toHaveCount(0);
  await page.screenshot({ path: path.join(artifacts, "home-mobile.png"), fullPage: true });
});

test("Research and Events directories remain available", async ({ page }) => {
  await page.goto("/research.html");
  await expect(page.locator(".research-tree-card")).toHaveCount(22);
  await page.goto("/events.html");
  await expect(page.locator("#event-results details.event-profile")).toHaveCount(16);
});

test("guide index contains only retained categories and searchable entries", async ({ page }) => {
  await page.goto("/guides.html");
  const categories = await page.locator("#guide-category option").evaluateAll(nodes => nodes.map(node => node.value));
  expect(categories).toEqual(["", "beginner", "research", "events"]);
  await expect(page.locator("#guide-results article.card")).toHaveCount(5);
  await page.getByLabel("Category").selectOption("research");
  await expect(page.locator("#guide-results article.card")).toHaveCount(1);
});

test("older backups skip retired Troops progress and migrate old goals to Other", async ({ page }) => {
  await page.goto("/dashboard.html");
  page.on("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Manage saved LZ Carry progress" }).click();
  await page.getByRole("button", { name: "Import a backup" }).click();
  const backup = {
    format: "lz-carry-player-data", schemaVersion: 1, exportedAt: "2026-11-14T00:00:00.000Z", app: "LZ Carry",
    data: {
      "lzcarry-troop-plan-v1": { classId: "assaulters", tier: "1", current: 100, target: 250 },
      "lzcarry-player-goals-v1": [{
        id: "old-troop-goal", title: "Old troop target", category: "Troops", dueDate: "",
        note: "Keep this personal goal", done: false, createdAt: "2026-11-13T00:00:00.000Z"
      }]
    }
  };
  await page.getByLabel("Choose a LZ Carry progress backup JSON file").setInputFiles({
    name: "old-progress-backup.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(backup))
  });
  await expect(page.locator(".player-data-summary")).toContainText("Progress imported successfully");
  const stored = await page.evaluate(() => ({
    troop: localStorage.getItem("lzcarry-troop-plan-v1"),
    goals: JSON.parse(localStorage.getItem("lzcarry-player-goals-v1") || "[]")
  }));
  expect(stored.troop).toBeNull();
  expect(stored.goals).toHaveLength(1);
  expect(stored.goals[0].category).toBe("Other");
  await page.reload();
  await page.locator("#dashboard-goals > summary").click();
  await expect(page.locator("#dashboard-goal-list")).toContainText("Old troop target");
  await expect(page.locator("#dashboard-goal-list")).toContainText("Other");
});
