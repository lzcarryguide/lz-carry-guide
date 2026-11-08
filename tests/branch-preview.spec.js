const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");

const pages = ["index.html", "guides.html", "beginner.html", "research.html", "heroes.html", "events.html", "videos.html", "pilot.html"];
const artifacts = path.join(process.cwd(), "artifacts");
fs.mkdirSync(artifacts, { recursive: true });

test("all primary navigation destinations resolve", async ({ page, request }) => {
  await page.goto("/");
  const links = await page.locator("header nav a").evaluateAll(as => as.map(a => a.getAttribute("href")));
  expect(links).toEqual(expect.arrayContaining(pages));
  for (const href of links) {
    const response = await request.get("/" + href);
    expect(response.status(), href).toBe(200);
  }
});

test("homepage and separate video library render", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /your ultimate/i })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "homepage-desktop.png"), fullPage: true });
  await page.goto("/videos.html");
  await expect(page.getByRole("heading", { name: "Video Library" })).toBeVisible();
  await expect(page.getByText(/No videos published yet/)).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "videos-desktop.png"), fullPage: true });
});

test("mobile layouts fit viewport without page-level horizontal overflow", async ({ page }) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    for (const target of ["/", "/videos.html", "/guides.html"]) {
      await page.goto(target);
      const sizes = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth
      }));
      expect(sizes.document, target + " at " + width + "px").toBeLessThanOrEqual(sizes.viewport + 1);
      if (target === "/" && width === 390) await page.screenshot({ path: path.join(artifacts, "homepage-mobile.png"), fullPage: true });
      if (target === "/videos.html" && width === 390) await page.screenshot({ path: path.join(artifacts, "videos-mobile.png"), fullPage: true });
      if (target === "/guides.html" && width === 390) await page.screenshot({ path: path.join(artifacts, "guides-mobile.png"), fullPage: true });
    }
  }
});

test("guide directory filters search and only admits verified published records", async ({ page }) => {
  const fixture = {
    schemaVersion: 1,
    entries: [
      { id: "valid-hq", title: "Verified HQ basics", summary: "HQ resource planning", category: "beginner", tags: ["hq"], url: "beginner.html", status: "published", verifiedAt: "2026-11-08", sources: [{ name: "In-game screen", type: "in-game", checkedAt: "2026-11-08", note: "Observed directly" }] },
      { id: "draft", title: "Draft HQ strategy", summary: "not ready", category: "beginner", url: "beginner.html", status: "draft", verifiedAt: "2026-11-08", sources: [{ name: "Community", type: "community", checkedAt: "2026-11-08", note: "Draft source" }] },
      { id: "no-verification", title: "Unverified HQ costs", summary: "no date", category: "beginner", url: "beginner.html", status: "published", sources: [{ name: "Community", type: "community", checkedAt: "2026-11-08", note: "No actual validation" }] },
      { id: "undated-source", title: "Undated research tips", summary: "no source date", category: "research", url: "research.html", status: "published", verifiedAt: "2026-11-08", sources: [{ name: "Community", type: "community", note: "Undated" }] },
      { id: "unsafe-url", title: "Unsafe entry", summary: "should not render", category: "events", url: "javascript:alert(1)", status: "published", verifiedAt: "2026-11-08", sources: [{ name: "Official", type: "official", checkedAt: "2026-11-08", note: "Checked" }] }
    ]
  };
  await page.route("**/data/guides.json", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fixture) }));
  await page.goto("/guides.html");
  await expect(page.getByText("1 published guide")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Verified HQ basics" })).toBeVisible();
  await expect(page.getByText("Draft HQ strategy")).toHaveCount(0);
  await expect(page.getByText("Unverified HQ costs")).toHaveCount(0);
  await expect(page.getByText("Undated research tips")).toHaveCount(0);
  await expect(page.getByText("Unsafe entry")).toHaveCount(0);
  await page.screenshot({ path: path.join(artifacts, "guide-search-verified-fixture.png"), fullPage: true });
  await page.getByLabel("Category").selectOption("research");
  await expect(page.getByText("0 published guides")).toBeVisible();
  await page.getByLabel("Category").selectOption("beginner");
  await page.getByLabel("Search written guides").fill("hq");
  await expect(page.getByRole("heading", { name: "Verified HQ basics" })).toBeVisible();
  await page.getByLabel("Search written guides").fill("no match");
  await expect(page.getByText("No published guides match yet")).toBeVisible();
});

test("production guide database contains no unpublished content", async ({ request }) => {
  const response = await request.get("/data/guides.json");
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.schemaVersion).toBe(1);
  expect(data.entries).toEqual([]);
});
