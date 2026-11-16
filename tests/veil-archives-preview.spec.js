const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
fs.mkdirSync("artifacts", { recursive: true });

const routes = [
  "/stories/",
  "/stories/discover/",
  "/stories/series/before-we-lost-each-other/",
  "/stories/series/before-we-lost-each-other/episode-01/",
  "/stories/library/",
  "/stories/updates/"
];
const pageNames = [
  "Page_01_Three_Years_Together.jpg",
  "Page_02_The_Argument.jpg",
  "Page_03_Walking_Away.jpg",
  "Page_04_The_Crash.jpg",
  "Page_05_The_First_Runner.jpg",
  "Page_06_Someone_She_Knows.jpg",
  "Page_07_The_Wrong_Impression.jpg",
  "Page_08_Dont_Let_Me_Go.jpg",
  "Page_09_Run_For_Your_Life.jpg",
  "Page_10_No_Signal.jpg",
  "Page_11_Can_You_Hear_Me.jpg",
  "Page_12_A_Reason_To_Hope.jpg"
];

test("all six Veil Archives routes resolve and render inside the LZ Carry project path", async ({ page, request }) => {
  for (const route of routes) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
  }
  await page.goto("/stories/");
  await expect(page.locator("h1")).toContainText("BEFORE WE");
  await expect(page.getByRole("link", { name: /VIEW SERIES/i })).toHaveAttribute("href", "series/before-we-lost-each-other/");
  await expect(page.getByText(/Free to read · Preview only/i)).toBeVisible();
  const cover = page.locator(".hero-grid .cover-frame img");
  await expect(cover).toBeVisible();
  await expect.poll(() => cover.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
});

test("Discover search, genre/status filtering and A–Z/latest sorting work", async ({ page }) => {
  await page.goto("/stories/discover/");
  const card = page.locator("[data-story-card]");
  await expect(card).toHaveCount(1);
  const cover = card.locator("img");
  await expect.poll(() => cover.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
  await page.getByRole("searchbox", { name: /search stories/i }).fill("not-a-real-series");
  await expect(card).toBeHidden();
  await expect(page.locator("[data-empty]")).toBeVisible();
  await page.getByRole("searchbox", { name: /search stories/i }).fill("Before We Lost Each Other");
  await page.locator('select[name="genre"]').selectOption("Drama");
  await page.locator('select[name="status"]').selectOption("preview");
  await page.locator('select[name="sort"]').selectOption("az");
  await expect(card).toBeVisible();
});

test("series detail shows approved cover, creator metadata and the only creator-preview episode", async ({ page }) => {
  await page.goto("/stories/series/before-we-lost-each-other/");
  await expect(page.getByRole("heading", { name: "BEFORE WE LOST EACH OTHER" })).toBeVisible();
  await expect(page.getByText("Weeping Angel", { exact: false }).first()).toBeVisible();
  await expect(page.getByText(/Published episodes: 0/)).toBeVisible();
  await expect(page.getByRole("link", { name: /EPISODE 01 PREVIEW/i })).toHaveAttribute("href", "episode-01/");
  const cover = page.locator(".detail-grid .cover-frame img");
  await expect.poll(() => cover.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
});

test("all twelve original pages load in order at their natural portrait proportions", async ({ page, request }) => {
  await page.goto("/stories/series/before-we-lost-each-other/episode-01/");
  const images = page.locator("main.episode img.page");
  await expect(images).toHaveCount(12);
  const refs = await images.evaluateAll(nodes => nodes.map(img => new URL(img.src).pathname.split("/").pop()));
  expect(refs).toEqual(pageNames);
  for (let i = 0; i < 12; i++) {
    const img = images.nth(i);
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate(node => node.complete && node.naturalWidth > 0)).toBeTruthy();
    const size = await img.evaluate(node => ({ width: node.naturalWidth, height: node.naturalHeight, rendered: node.getBoundingClientRect().width }));
    expect(size.width).toBe(768);
    expect(size.height).toBe(1376);
    expect(size.rendered).toBeLessThanOrEqual(768);
    const response = await request.get(new URL(refs[i], "http://127.0.0.1:4173/stories/series/before-we-lost-each-other/episode-01/assets/pages/").href);
    expect(response.status(), refs[i]).toBe(200);
  }
});

test("full-screen viewer, page navigation, zoom and close controls work", async ({ page }) => {
  await page.goto("/stories/series/before-we-lost-each-other/episode-01/");
  await page.locator(".page-open").first().click();
  const dialog = page.locator("#viewer");
  await expect(dialog).toBeVisible();
  await expect(page.locator("#viewer-label")).toHaveText("Page 1 of 12");
  await expect(page.locator("#previous-page")).toBeDisabled();
  await page.locator("#next-page").click();
  await expect(page.locator("#viewer-label")).toHaveText("Page 2 of 12");
  await expect(page.locator("#current-page")).toHaveText("Page 2 of 12");
  await expect(page.locator("#bookmark-page")).toHaveAttribute("aria-pressed", "false");
  await page.locator("#bookmark-page").click();
  await expect(page.locator("#bookmark-page")).toHaveAttribute("aria-pressed", "true");
  await page.locator("#previous-page").click();
  await expect(page.locator("#current-page")).toHaveText("Page 1 of 12");
  await expect(page.locator("#bookmark-page")).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#viewer-label")).toHaveText("Page 2 of 12");
  await expect(page.locator("#current-page")).toHaveText("Page 2 of 12");
  await expect(page.locator("#bookmark-page")).toHaveAttribute("aria-pressed", "true");
  for (let i = 0; i < 12; i++) await page.locator("#zoom-in").click();
  await expect(page.locator("#zoom-level")).toHaveText("400%");
  await expect(page.locator("#zoom-in")).toBeDisabled();
  await page.locator("#zoom-out").click();
  await expect(page.locator("#zoom-level")).toHaveText("375%");
  await page.locator("#zoom-reset").click();
  await expect(page.locator("#zoom-level")).toHaveText("100%");
  await expect(page.locator("#zoom-out")).toBeDisabled();
  await page.locator("#fullscreen-viewer").click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id || "")).toBe("viewer");
  await page.locator("#fullscreen-viewer").click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
  await page.locator("#close-viewer").click();
  await expect(dialog).toBeHidden();
});

test("sound starts after the reader's first interaction, is controllable, and remembers the preference and volume", async ({ page }) => {
  await page.goto("/stories/series/before-we-lost-each-other/episode-01/");
  const audio = page.locator("#music");
  const toggle = page.locator("#toggle");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  expect(await audio.evaluate(node => node.paused)).toBeTruthy();
  expect(await audio.evaluate(node => node.hasAttribute("autoplay"))).toBeFalsy();

  await page.locator(".page-open").first().click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => audio.evaluate(node => !node.paused)).toBeTruthy();

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  expect(await audio.evaluate(node => node.paused)).toBeTruthy();
  expect(await page.evaluate(() => localStorage.getItem("tva-audio-preference-v1"))).toBe('"off"');

  await page.locator("#volume").evaluate(node => { node.value = "0.4"; node.dispatchEvent(new Event("input", { bubbles: true })); });
  await expect(page.locator("#volval")).toHaveText("40%");
  await expect.poll(() => page.evaluate(() => Number(localStorage.getItem("tva-audio-volume-v1")))).toBe(0.4);

  await page.reload();
  await expect(page.locator("#toggle")).toHaveAttribute("aria-pressed", "false");
  expect(await page.locator("#music").evaluate(node => node.paused)).toBeTruthy();
  await page.locator(".page-open").first().click();
  expect(await page.locator("#music").evaluate(node => node.paused)).toBeTruthy();

  await page.locator("#toggle").click();
  await expect(page.locator("#toggle")).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => page.locator("#music").evaluate(node => !node.paused)).toBeTruthy();
  await page.locator("#mute-toggle").click();
  await expect(page.locator("#mute-toggle")).toHaveAttribute("aria-pressed", "true");
  expect(await audio.evaluate(node => !node.paused && node.muted)).toBeTruthy();
  await page.locator("#mute-toggle").click();
  await expect(page.locator("#mute-toggle")).toHaveAttribute("aria-pressed", "false");
  expect(await audio.evaluate(node => !node.paused && !node.muted)).toBeTruthy();
});


test("invalid local-storage values are rejected without breaking the reader", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("tva-reading-progress-v1", "{broken");
    localStorage.setItem("tva-bookmarks-v1", JSON.stringify([{ page: 999 }, { page: -1 }, null, { page: "5" }]));
    localStorage.setItem("tva-audio-preference-v1", JSON.stringify("sometimes"));
    localStorage.setItem("tva-audio-volume-v1", JSON.stringify(9));
    localStorage.setItem("tva-audio-muted-v1", JSON.stringify("yes"));
  });
  await page.goto("/stories/series/before-we-lost-each-other/episode-01/");
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("#current-page")).toHaveText("Page 1 of 12");
  await expect(page.locator("#bookmark-page")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#volval")).toHaveText("18%");
  await expect(page.locator("#mute-toggle")).toHaveAttribute("aria-pressed", "false");
  await page.goto("/stories/library/");
  await expect(page.locator("[data-library-list] .story-card")).toHaveCount(0);
});

test("audio controls remain reachable and independently usable on a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/stories/series/before-we-lost-each-other/episode-01/");
  let tablet = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(tablet.scroll).toBeLessThanOrEqual(tablet.width + 1);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto("/stories/series/before-we-lost-each-other/episode-01/");
  let landscape = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(landscape.scroll).toBeLessThanOrEqual(landscape.width + 1);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/stories/series/before-we-lost-each-other/episode-01/");
  await expect(page.locator("#toggle")).toBeVisible();
  await expect(page.locator("#mute-toggle")).toBeVisible();
  await page.locator("#toggle").click();
  await expect.poll(() => page.locator("#music").evaluate(node => !node.paused)).toBeTruthy();
  await page.locator("#mute-toggle").click();
  expect(await page.locator("#music").evaluate(node => node.muted)).toBeTruthy();
  await page.locator("#mute-toggle").click();
  expect(await page.locator("#music").evaluate(node => !node.muted)).toBeTruthy();
});

test("page bookmark is saved to My Library and bookmark URL restores the page", async ({ page }) => {
  await page.goto("/stories/series/before-we-lost-each-other/episode-01/");
  await page.locator("#page-5").scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator("#current-page").textContent()).toContain("Page 5");
  await page.locator("#bookmark-page").click();
  await expect(page.locator("#bookmark-page")).toHaveAttribute("aria-pressed", "true");
  await page.goto("/stories/library/");
  await expect(page.locator("[data-library-list]")).toContainText("BOOKMARK");
  const bookmark = page.locator("[data-library-list] a").filter({ hasText: "Page 5" });
  await expect(bookmark).toHaveAttribute("href", /#page-5$/);
  await bookmark.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await expect(page.locator("#current-page")).toContainText("Page 5");
});

test("reading progress restores after reloading and Continue Reading appears on the homepage", async ({ page }) => {
  await page.goto("/stories/series/before-we-lost-each-other/episode-01/");
  await page.locator("#page-8").scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator("#current-page").textContent()).toContain("Page 8");
  const before = await page.evaluate(() => Number(JSON.parse(localStorage.getItem("tva-reading-progress-v1"))["before-we-lost-each-other-episode-01"].scrollY));
  expect(before).toBeGreaterThan(0);
  await page.reload();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.goto("/stories/");
  await expect(page.locator("[data-continue-reading]")).toContainText(/Continue Reading/i);
  await expect(page.locator("[data-continue-reading]")).toContainText("Episode 01");
});

test("Veil pages remain responsive without horizontal overflow at all required widths", async ({ page }) => {
  for (const width of [1920, 1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      const dimensions = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth
      }));
      expect(dimensions.scroll, route + " at " + width + "px").toBeLessThanOrEqual(dimensions.client + 1);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/stories/series/before-we-lost-each-other/episode-01/");
  await expect(page.locator(".page-open")).toHaveCount(12);
  await expect(page.locator(".reader-tools #bookmark-page")).toBeVisible();
  await expect(page.locator("#toggle")).toBeVisible();
  expect(await page.locator(".reader-tools").evaluate(node => getComputedStyle(node).position)).toBe("sticky");
  const bookmarkBounds = await page.locator("#bookmark-page").boundingBox();
  const audioBounds = await page.locator(".audio").boundingBox();
  expect(bookmarkBounds).not.toBeNull();
  expect(audioBounds).not.toBeNull();
  expect(bookmarkBounds.y + bookmarkBounds.height).toBeLessThan(audioBounds.y);
});

test("capture real desktop and mobile Chromium screenshots for all key story routes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const captures = [
    ["/stories/", "artifacts/veil-homepage-desktop.png"],
    ["/stories/discover/", "artifacts/veil-discover-desktop.png"],
    ["/stories/series/before-we-lost-each-other/", "artifacts/veil-series-desktop.png"],
    ["/stories/series/before-we-lost-each-other/episode-01/", "artifacts/veil-reader-desktop.png"]
  ];
  for (const [route, output] of captures) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    await page.screenshot({ path: output, fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/stories/");
  await page.screenshot({ path: "artifacts/veil-homepage-mobile.png", fullPage: true });
  await page.goto("/stories/series/before-we-lost-each-other/episode-01/");
  await page.screenshot({ path: "artifacts/veil-reader-mobile.png", fullPage: true });
});
