const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");

const pages = ["/", "/guides.html", "/beginner.html", "/dashboard.html", "/research.html", "/troops.html", "/events.html", "/pilot.html"];
const artifacts = path.join(process.cwd(), "artifacts");
fs.mkdirSync(artifacts, { recursive: true });

test("primary navigation and internal page links resolve", async ({ page, request }) => {
  await page.goto("/");
  const links = await page.locator("header nav a").evaluateAll(as => as.map(a => a.getAttribute("href")));
  expect(links).toEqual(expect.arrayContaining(["index.html", "guides.html", "dashboard.html", "beginner.html", "beginner.html#hq-planner-section", "research.html", "troops.html", "events.html", "pilot.html"]));
  expect(links.some(href => /heroes\.html/i.test(href))).toBeFalsy();
  for (const target of pages) {
    const response = await request.get(target);
    expect(response.status(), target).toBe(200);
    await page.goto(target);
    const localLinks = await page.locator("a[href]").evaluateAll(as => as.map(a => a.getAttribute("href")).filter(h => h && !h.startsWith("#") && !/^(https?:|mailto:|tel:|javascript:)/i.test(h)).map(h => h.split("#")[0] || location.pathname.slice(1)));
    for (const href of localLinks) expect((await request.get("/" + href)).status(), target + " -> " + href).toBe(200);
  }
  expect((await request.get("/heroes.html")).status()).toBe(404);
});

test("desktop pages load without runtime errors", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const target of pages) {
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(target);
    await expect(page.locator("main")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, target + " desktop overflow").toBeLessThanOrEqual(1);
    expect(errors, target + " runtime errors").toEqual([]);
    if (target === "/troops.html") await page.screenshot({ path: path.join(artifacts, "troops-desktop.png"), fullPage: true });
  }
});

test("mobile layouts and navigation work at narrow widths", async ({ page }) => {
  for (const width of [390, 320]) {
    for (const target of pages) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(target);
      const sizes = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
      expect(sizes.page, target + " at " + width).toBeLessThanOrEqual(sizes.viewport + 1);
      if (width === 390 && target === "/troops.html") await page.screenshot({ path: path.join(artifacts, "troops-mobile.png"), fullPage: true });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/troops.html");
  const toggle = page.getByRole("button", { name: "Menu" });
  const nav = page.locator('header nav[aria-label="Main navigation"]');
  await expect(toggle).toBeVisible();
  await expect(nav).toBeHidden();
  await toggle.click();
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link", { name: "Troops" })).toBeVisible();
  await expect(nav.locator("a")).toHaveCount(9);
});

test("standalone Troops database searches and filters its preserved records", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/troops.html");
  await expect(page.getByRole("heading", { name: "Troops Database & Target Planner" })).toBeVisible();
  await expect(page.locator("#troop-results .troop-class-card")).toHaveCount(3);
  await expect(page.locator("#troop-count")).toHaveText("3 records");
  await page.getByLabel("Search troop classes").fill("Assaulter");
  await expect(page.locator("#troop-results .troop-class-card")).toHaveCount(1);
  await expect(page.locator("#troop-results")).toContainText("Blood Rose");
  await page.getByLabel("Search troop classes").fill("");
  await page.getByLabel("Faction").selectOption("Wings of Dawn");
  await expect(page.locator("#troop-results .troop-class-card")).toHaveCount(1);
  await expect(page.locator("#troop-results")).toContainText("Shooters");
  await page.getByLabel("Faction").selectOption("");
  await expect(page.locator("#troop-results .troop-class-card")).toHaveCount(3);
  expect(errors).toEqual([]);
});

test("Troop Target Planner calculates a player-entered quantity gap and saves locally", async ({ page }) => {
  await page.goto("/troops.html");
  await expect(page.locator("#troop-plan-class option")).toHaveCount(3);
  await page.locator("#troop-plan-class").selectOption("assaulters");
  await page.locator("#troop-plan-tier").selectOption("1");
  await page.locator("#troop-plan-current").fill("125");
  await page.locator("#troop-plan-target").fill("200");
  await expect(page.locator("#troop-plan-result")).toContainText("75 more units needed");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("lzcarry-troop-plan-v1") || "{}").target)).toBe(200);
  await page.locator("#troop-plan-reset").click();
  await expect(page.locator("#troop-plan-current")).toHaveValue("");
  await expect(page.locator("#troop-plan-target")).toHaveValue("");
});

test("universal search indexes Troops and retains Research and Events", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search the entire LZ Carry website" }).click();
  const search = page.getByRole("searchbox", { name: "Search all LZ Carry content" });
  await search.fill("Assaulters");
  const result = page.locator(".universal-search-result").filter({ hasText: "Assaulters" }).first();
  await expect(result).toHaveAttribute("href", /troops\.html#troop-assaulters/);
  await result.click();
  await expect(page).toHaveURL(/troops\.html#troop-assaulters$/);
  await expect(page.locator("#troop-assaulters")).toBeVisible();
});

test("Research and Events directories remain available", async ({ page, request }) => {
  const troopData = await (await request.get("/data/troops.json")).json();
  expect(troopData.classes).toHaveLength(3);
  expect(troopData.classes.every(record => record.tiers.length === 10)).toBeTruthy();
  expect((await request.get("/data/heroes.json")).status()).toBe(404);
  await page.goto("/research.html");
  await expect(page.locator(".research-tree-card")).toHaveCount(22);
  await page.goto("/events.html");
  await expect(page.locator("#event-results details.event-profile")).toHaveCount(16);
});
