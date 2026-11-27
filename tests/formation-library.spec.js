const { test, expect } = require("@playwright/test");

test("Hero Encyclopedia keeps all 36 records visible and gates only three unconfirmed heroes", async ({ page }) => {
  await page.goto("/heroes.html");
  await expect(page.locator("#builder-results .hero-directory-item")).toHaveCount(36);
  await expect(page.locator("#builder-results .builder-hero:not(:disabled)")).toHaveCount(33);
  await expect(page.locator("#builder-results .builder-hero:disabled")).toHaveCount(3);
  for (const name of ["Amber", "Queenie", "Yu Chan"]) {
    await expect(page.getByRole("button", { name: new RegExp(name + ".*needs confirmation", "i") })).toBeDisabled();
  }
  await expect(page.locator("#builder-results .hero-portrait-pending")).toHaveCount(36);
});

test("Formation Lab saves, reloads and compares local lineups", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/heroes.html");
  await expect(page.getByRole("heading", { name: "Save, Share & Compare" })).toBeVisible();
  const selectable = page.locator("#builder-results .builder-hero:not(:disabled)");
  await expect(selectable.first()).toBeVisible();
  await page.locator("#formation-slots .formation-slot").nth(0).click();
  await selectable.nth(0).click();
  const alphaHero = await page.locator("#formation-slots .formation-slot").first().locator("strong").textContent();
  await page.locator("#formation-name").fill("Alpha");
  await page.locator("#formation-save").click();
  await expect(page.locator("#formation-saved-list")).toContainText("Alpha");
  await page.locator("#formation-saved-list").getByRole("button", { name: "Copy", exact: true }).first().click();
  await expect(page.locator("#formation-saved-list")).toContainText("Alpha copy");
  await page.locator("#formation-slots .formation-slot").nth(1).click();
  await selectable.nth(1).click();
  await page.locator("#formation-name").fill("Beta");
  await page.locator("#formation-save").click();
  await page.locator("#formation-compare-a").selectOption({ index: 1 });
  await page.locator("#formation-compare-b").selectOption({ index: 3 });
  await page.locator("#formation-compare").click();
  await expect(page.locator("#formation-compare-result")).toContainText("Slot");
  await page.locator("#formation-saved-list").getByRole("button", { name: "Load" }).first().click();
  await expect(page.locator("#formation-slots .formation-slot").first()).toContainText(alphaHero);
  await page.reload();
  await expect(page.locator("#formation-saved-list")).toContainText("Alpha");
  await expect(page.locator("#formation-saved-list")).toContainText("Beta");
  await expect(page.locator("#formation-saved-list")).toContainText("Alpha copy");
  await page.screenshot({ path: "artifacts/formation-library.png", fullPage: true });
  expect(errors).toEqual([]);
});

test("formation share link restores a five-slot lineup", async ({ page, baseURL }) => {
  const payload = btoa(unescape(encodeURIComponent(JSON.stringify({ v: 1, heroes: ["Scarlett", "Alma", null, null, null] }))));
  await page.goto(baseURL + "/heroes.html?formation=" + encodeURIComponent(payload));
  await expect(page.locator("#builder-results .builder-hero").first()).toBeVisible();
  await expect(page.locator("#formation-slots .formation-slot").nth(0)).toContainText("Scarlett");
  await expect(page.locator("#formation-slots .formation-slot").nth(1)).toContainText("Alma");
});

test("Hero and Events pages remain within narrow mobile viewports", async ({ page }) => {
  for (const width of [320, 375, 390, 520]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ["/heroes.html", "/events.html"]) {
      await page.goto(route);
      const size = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
      expect(size.page, route + " at " + width + "px").toBeLessThanOrEqual(size.viewport + 1);
    }
  }
});
