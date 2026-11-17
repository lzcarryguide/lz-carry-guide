const { test, expect } = require("@playwright/test");

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

test("all Veil routes, navigation, images and browser console are healthy", async ({ page }) => {
  test.setTimeout(90000);
  const consoleErrors = [];
  const pageErrors = [];
  const firstPartyErrors = [];
  page.on("console", message => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", error => pageErrors.push(error.message));
  page.on("response", response => {
    if (response.url().startsWith("http://127.0.0.1:4173/") && response.status() >= 400) {
      firstPartyErrors.push(response.status() + " " + response.url());
    }
  });

  for (const route of routes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toBeVisible();
    await page.evaluate(async () => {
      const images = Array.from(document.images);
      images.forEach(image => { image.loading = "eager"; });
      await Promise.all(images.map(image => image.decode().catch(() => null)));
    });
    const imageState = await page.locator("img").evaluateAll(images =>
      images.map(image => ({
        src: image.currentSrc || image.src,
        hasSource: Boolean(image.getAttribute("src")),
        loaded: !image.getAttribute("src") || (image.complete && image.naturalWidth > 0)
      }))
    );
    expect(imageState.filter(image => image.hasSource && !image.loaded), route + " broken images").toEqual([]);
    expect(await page.locator("header nav a").count(), route + " primary navigation").toBeGreaterThan(0);
  }

  expect(firstPartyErrors, "first-party HTTP errors").toEqual([]);
  expect(pageErrors, "uncaught JavaScript errors").toEqual([]);
  expect(consoleErrors, "browser console errors").toEqual([]);
});

test("mobile layouts fit phone widths and all twelve comic images keep their original proportions", async ({ page }) => {
  test.setTimeout(120000);
  for (const width of [320, 390, 414]) {
    for (const route of routes) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const layout = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        bodyFontSize: Number.parseFloat(getComputedStyle(document.body).fontSize)
      }));
      expect(layout.document, route + " horizontal overflow at " + width).toBeLessThanOrEqual(layout.viewport + 1);
      expect(layout.bodyFontSize, route + " base text size").toBeGreaterThanOrEqual(16);
    }
  }

  for (const width of [320, 360, 375, 390, 414, 768]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 1024 });
    await page.goto("/stories/series/before-we-lost-each-other/episode-01/", { waitUntil: "domcontentloaded" });
    const images = page.locator("main.episode img.page");
    await expect(images).toHaveCount(12);
    for (let index = 0; index < 12; index++) {
      const image = images.nth(index);
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0)).toBeTruthy();
      const dimensions = await image.evaluate(node => {
        const bounds = node.getBoundingClientRect();
        return {
          naturalWidth: node.naturalWidth,
          naturalHeight: node.naturalHeight,
          renderedWidth: bounds.width,
          renderedHeight: bounds.height,
          filename: new URL(node.currentSrc || node.src).pathname.split("/").pop()
        };
      });
      expect(dimensions.filename).toBe(pageNames[index]);
      expect(dimensions.naturalWidth).toBe(768);
      expect(dimensions.naturalHeight).toBe(1376);
      expect(dimensions.renderedWidth).toBeLessThanOrEqual(width + 1);
      expect(Math.abs(dimensions.renderedWidth / dimensions.renderedHeight - 768 / 1376)).toBeLessThan(0.015);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, "reader overflow at " + width).toBeLessThanOrEqual(1);
    await expect(page.locator("#bookmark-page")).toBeVisible();
    await expect(page.locator("#toggle")).toBeVisible();
    await expect(page.locator("#mute-toggle")).toBeVisible();
  }
});

test("reader keyboard, dialog, zoom, fullscreen, bookmarks, progress and audio controls work", async ({ page }) => {
  test.setTimeout(90000);
  await page.addInitScript(() => {
    localStorage.setItem("tva-audio-preference-v1", JSON.stringify("off"));
  });
  await page.goto("/stories/series/before-we-lost-each-other/episode-01/");
  const opener = page.locator(".page-open").first();
  await opener.focus();
  const focusStyle = await opener.evaluate(node => ({
    outlineStyle: getComputedStyle(node).outlineStyle,
    outlineWidth: parseFloat(getComputedStyle(node).outlineWidth)
  }));
  expect(focusStyle.outlineStyle).not.toBe("none");
  expect(focusStyle.outlineWidth).toBeGreaterThanOrEqual(2);
  await opener.click();

  const dialog = page.getByRole("dialog", { name: "Enlarged comic page" });
  await expect(dialog).toBeVisible();
  await expect(page.locator("#viewer-label")).toHaveText("Page 1 of 12");
  expect(await page.locator("#viewer").evaluate(node => node.open)).toBeTruthy();
  expect(await page.locator("#viewer").evaluate(node => node.contains(document.activeElement))).toBeTruthy();

  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#viewer-label")).toHaveText("Page 2 of 12");
  await expect(page.locator("#current-page")).toHaveText("Page 2 of 12");
  await page.locator("#bookmark-page").click();
  await expect(page.locator("#bookmark-page")).toHaveAttribute("aria-pressed", "true");

  await page.locator("#zoom-in").click();
  await expect(page.locator("#zoom-level")).toHaveText("125%");
  await page.locator("#zoom-reset").click();
  await expect(page.locator("#zoom-level")).toHaveText("100%");

  const fullscreenAvailable = await page.evaluate(() =>
    document.fullscreenEnabled && typeof document.documentElement.requestFullscreen === "function"
  );
  if (fullscreenAvailable) {
    const fullscreenControl = page.locator("#fullscreen-viewer");
    await fullscreenControl.click();
    await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBeTruthy();
    if (test.info().project.name === "webkit") {
      // Playwright's headless WebKit can enter native fullscreen but does not
      // reliably deliver a second coordinate click while the page is fullscreen.
      // Escape is the browser-native exit gesture used by Safari as well.
      await page.keyboard.press("Escape");
    } else {
      await fullscreenControl.click();
    }
    await expect.poll(() => page.evaluate(() => document.fullscreenElement === null)).toBeTruthy();
    await expect(fullscreenControl).toHaveText("Fullscreen");
  } else {
    await page.locator("#fullscreen-viewer").click();
    await expect(page.locator("#status")).toContainText(/fullscreen/i);
  }

  const audio = page.locator("#music");
  expect(await audio.evaluate(node => node.canPlayType("audio/wav"))).not.toBe("");
  await page.locator("#toggle").click();
  await expect.poll(() => audio.evaluate(node => !node.paused), { timeout: 12000 }).toBeTruthy();
  await page.locator("#mute-toggle").click();
  await expect(page.locator("#mute-toggle")).toHaveAttribute("aria-pressed", "true");
  expect(await audio.evaluate(node => node.muted)).toBeTruthy();
  await page.locator("#mute-toggle").click();
  await expect(page.locator("#mute-toggle")).toHaveAttribute("aria-pressed", "false");
  expect(await audio.evaluate(node => !node.muted && !node.paused)).toBeTruthy();
  await page.locator("#volume").evaluate(node => {
    node.value = "0.4";
    node.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(page.locator("#volval")).toHaveText("40%");
  await page.locator("#toggle").click();
  await expect.poll(() => audio.evaluate(node => node.paused)).toBeTruthy();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  expect(await opener.evaluate(node => document.activeElement === node)).toBeTruthy();

  await page.locator("#page-8").scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => {
    const record = JSON.parse(localStorage.getItem("tva-reading-progress-v1") || "{}")["before-we-lost-each-other-episode-01"];
    return record?.page === 8 && record.scrollY > 0;
  })).toBeTruthy();
  await page.reload();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

  await page.goto("/stories/library/");
  await expect(page.locator("[data-library-list]")).toContainText("BOOKMARK");
  await expect(page.locator("[data-library-list]")).toContainText("CONTINUE READING");
  const libraryImages = page.locator("[data-library-list] img");
  await expect(libraryImages).toHaveCount(2);
  await expect.poll(() => libraryImages.evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBeTruthy();

  await page.goto("/stories/");
  const continueCover = page.locator("[data-continue-reading] img");
  await expect(continueCover).toHaveCount(1);
  await expect.poll(() => continueCover.evaluate(image => image.complete && image.naturalWidth > 0)).toBeTruthy();
  expect(await continueCover.evaluate(image => new URL(image.src).pathname))
    .toBe("/stories/assets/before-we-lost-each-other-cover.webp");
});
