const { test, expect } = require("@playwright/test");

const veilRoutes = [
  "/stories/",
  "/stories/discover/",
  "/stories/series/before-we-lost-each-other/",
  "/stories/series/before-we-lost-each-other/episode-01/",
  "/stories/library/",
  "/stories/updates/"
];

test("The Veil Archives routes resolve and identify the correct section", async ({ page, request }) => {
  for (const route of veilRoutes) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
  }
  await page.goto("/stories/");
  await expect(page.getByRole("heading", { name: /BEFORE WE.*EACH OTHER/i, exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /VIEW SERIES/i })).toHaveAttribute("href", /before-we-lost-each-other/);
  await expect(page.getByText(/Free to read/i)).toBeVisible();
});

test("Discover search and filters operate on the supplied Series 01 catalogue record", async ({ page }) => {
  await page.goto("/stories/discover/");
  const card = page.locator("[data-story-card]");
  await expect(card).toHaveCount(1);
  await page.getByRole("searchbox", { name: /search stories/i }).fill("not-a-real-series");
  await expect(card).toBeHidden();
  await expect(page.locator("[data-empty]")).toBeVisible();
  await page.getByRole("searchbox", { name: /search stories/i }).fill("Before We Lost Each Other");
  await page.locator('select[name="genre"]').selectOption("Drama");
  await expect(card).toBeVisible();
  await page.locator('select[name="status"]').selectOption("preview");
  await expect(card).toBeVisible();
});

test("Series favorite is saved locally and reflected in My Library", async ({ page }) => {
  await page.goto("/stories/series/before-we-lost-each-other/");
  const favorite = page.locator("[data-favorite]");
  await expect(favorite).toBeVisible();
  await favorite.click();
  await expect(favorite).toHaveAttribute("aria-pressed", "true");
  await page.goto("/stories/library/");
  await expect(page.locator("[data-library]")).toContainText("Before We Lost Each Other");
});

test("Veil routes have no horizontal overflow on desktop and mobile", async ({ page }) => {
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of veilRoutes) {
      await page.goto(route);
      const dimensions = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth
      }));
      expect(dimensions.scroll, route + " at " + width + "px").toBeLessThanOrEqual(dimensions.client + 1);
    }
  }
});

test("Episode 01 route clearly remains a creator preview until media synchronization", async ({ page }) => {
  await page.goto("/stories/series/before-we-lost-each-other/episode-01/");
  await expect(page.getByRole("heading", { name: /Episode 01.*The Last Argument/i })).toBeVisible();
  await expect(page.getByText(/not yet been synchronized/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Back to Series/i })).toHaveAttribute("href", "../");
});
