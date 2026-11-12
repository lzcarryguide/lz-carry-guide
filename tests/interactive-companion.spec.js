const { test, expect } = require("@playwright/test");

test("research progress is interactive, saved locally and keeps long reference notes collapsed", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/research.html");
  await page.evaluate(() => localStorage.removeItem("lzcarry-research-plan-v1"));
  await page.reload();
  await expect(page.locator(".research-progress-panel")).toBeVisible();
  await expect(page.locator("#research-progress-value")).toHaveText("0%");
  const card = page.locator(".research-tree-card").filter({ has: page.locator("summary h3", { hasText: "Alliance Recognition" }) });
  await card.locator("summary").click();
  await expect(card.locator(".research-tree-body")).toBeVisible();
  await expect(card.locator(".research-entry-controls select")).toBeVisible();
  await card.locator(".research-entry-controls select").selectOption("Done");
  await expect(page.locator("#research-progress-copy")).toContainText("1 of 22 research trees complete");
  await expect(page.locator("#research-progress-value")).toHaveText("5%");
  await expect(page.locator("#research-next")).toContainText("Recommended next research");
  await page.reload();
  await expect(page.locator("#research-progress-copy")).toContainText("1 of 22 research trees complete");
  await page.locator("#lab-path").selectOption("early-low");
  const routeCard = page.locator("#lab-plan-list .lab-plan-item").filter({ hasText: "New Home" });
  await routeCard.locator("summary").click();
  await routeCard.locator('select[aria-label="New Home progress"]').selectOption("In progress");
  await expect(page.locator("#research-progress-copy")).toContainText("1 in progress");
  await expect(page.locator(".research-reference-disclosure")).not.toHaveAttribute("open", "");
  await page.screenshot({ path: "artifacts/research-interactive-desktop.png", fullPage: true });
});

test("hero roster supports troop-type filters while keeping formation builder first", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/heroes.html");
  await expect(page.locator("#formation-lab")).toBeVisible();
  await expect(page.locator("#formation-slots .formation-slot")).toHaveCount(5);
  await expect(page.getByLabel("Hero troop type")).toBeVisible();
  await expect(page.locator("#builder-results .hero-directory-item")).toHaveCount(12);
  await page.getByRole("button", { name: /Show more heroes/ }).click();
  await page.getByRole("button", { name: /Show more heroes/ }).click();
  await expect(page.locator("#builder-results .hero-directory-item")).toHaveCount(36);
  await page.getByLabel("Hero troop type").selectOption("Assaulters");
  const names = await page.locator("#builder-results .hero-directory-identity small").allTextContents();
  expect(names.length).toBeGreaterThan(0);
  expect(names.every(name => name.includes("Assaulters"))).toBeTruthy();
  await page.getByLabel("Hero troop type").selectOption("Shooters");
  const shooters = await page.locator("#builder-results .hero-directory-identity small").allTextContents();
  expect(shooters.length).toBeGreaterThan(0);
  expect(shooters.every(name => name.includes("Shooters"))).toBeTruthy();
  await page.getByLabel("Hero troop type").selectOption("");
  await expect(page.locator("#builder-results .hero-directory-item")).toHaveCount(12);
  await expect(page.locator("#formation-library .hero-advanced-disclosure")).toBeVisible();
  await expect(page.locator("#formation-library .hero-advanced-disclosure")).not.toHaveAttribute("open", "");
  await page.screenshot({ path: "artifacts/heroes-interactive-desktop.png", fullPage: true });
});

test("event directory opens one selected event and saves its preparation checklist", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/events.html");
  await page.evaluate(() => localStorage.removeItem("lzcarry-event-checklists-v1"));
  await page.reload();
  await page.getByLabel("Search events").fill("Alliance Duel");
  const card = page.locator("#event-results details.event-profile").first();
  await expect(card).toBeVisible();
  await card.locator("summary").click();
  const checklist = card.locator(".event-personal-checklist");
  await expect(checklist).toBeVisible();
  await expect(checklist.locator("input[type=checkbox]")).toHaveCount(3);
  await checklist.locator("input[type=checkbox]").first().check();
  await expect(checklist).toContainText("1 / 3 ready");
  await page.reload();
  await page.getByLabel("Search events").fill("Alliance Duel");
  const restored = page.locator("#event-results details.event-profile").first();
  await restored.locator("summary").click();
  await expect(restored.locator(".event-personal-checklist")).toContainText("1 / 3 ready");
  for (const id of ["event-routines", "weekly-cycle", "event-planning"]) {
    await expect(page.locator("#" + id + " .event-reference-disclosure")).toBeVisible();
    await expect(page.locator("#" + id + " .event-reference-disclosure")).not.toHaveAttribute("open", "");
  }
  await page.screenshot({ path: "artifacts/events-interactive-desktop.png", fullPage: true });
});

test("pilot selector calculates exact package and add-on totals without inventing SVS quote", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/pilot.html");
  await expect(page.locator("#pilot-total")).toHaveText("$3");
  await page.getByLabel("Daily Pilot duration").fill("4");
  await expect(page.locator("#pilot-total")).toHaveText("$12");
  await page.getByLabel("Saturday Special").check();
  await expect(page.locator("#pilot-total")).toHaveText("$8");
  await page.getByLabel("Weekly Elite Management").check();
  await expect(page.locator("#pilot-total")).toHaveText("$30");
  await page.getByLabel(/SVS Chest Opening/).check();
  await expect(page.locator("#pilot-total")).toHaveText("$35");
  await page.getByLabel(/Canyon Clash/).check();
  await page.locator("#pilot-canyon-accounts").fill("2");
  await expect(page.locator("#pilot-total")).toHaveText("$51");
  await page.getByLabel(/Full SVS Participation/).check();
  await page.getByLabel("Number of accounts for quote").fill("3");
  await expect(page.locator("#pilot-total")).toHaveText("$51 + SVS quote");
  await expect(page.locator("#pilot-price-status")).toContainText("excludes the individually quoted Full SVS Participation");
  await expect(page.locator("#pilot-booking-summary")).toContainText("3 accounts");
  await expect(page.getByRole("button", { name: "Request a Pilot — unavailable" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Ask for Assistance — unavailable" })).toBeDisabled();
  await expect(page.locator("#pilot-contact-status")).toContainText("No replacement invite or channel is being used.");
  await page.screenshot({ path: "artifacts/pilot-configurator-desktop.png", fullPage: true });
});

test("interactive tools fit narrow mobile viewports", async ({ page }) => {
  for (const width of [390, 360]) {
    await page.setViewportSize({ width, height: 844 });
    for (const target of ["/research.html", "/heroes.html", "/events.html", "/pilot.html"]) {
      await page.goto(target);
      const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
      expect(dimensions.page, target + " at " + width).toBeLessThanOrEqual(dimensions.viewport + 1);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/pilot.html");
  await page.getByLabel("Saturday Special").check();
  await expect(page.locator("#pilot-total")).toHaveText("$8");
  await page.screenshot({ path: "artifacts/pilot-configurator-mobile.png", fullPage: true });
});

test("event directory progressively reveals records and resets after search", async ({ page }) => {
  await page.goto("/events.html");
  await expect(page.locator("#event-results details.event-profile")).toHaveCount(16);
  await expect(page.locator("#event-results details.event-profile:visible")).toHaveCount(8);
  await page.getByRole("button", { name: /Show more events/ }).click();
  await expect(page.locator("#event-results details.event-profile:visible")).toHaveCount(16);
  await page.getByLabel("Search events").fill("Alliance Duel");
  await expect(page.locator("#event-results details.event-profile:visible")).toHaveCount(1);
  await expect(page.locator(".event-load-more")).toHaveCount(0);
});


test("mobile navigation opens accessibly on every primary page and exposes every destination", async ({ page }) => {
  const pages = ["/", "/guides.html", "/beginner.html", "/dashboard.html", "/research.html", "/heroes.html", "/events.html", "/pilot.html"];
  for (const width of [390, 360]) {
    for (const target of pages) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(target);
      const nav = page.locator('header nav[aria-label="Main navigation"]');
      const toggle = page.getByRole("button", { name: "Menu" });
      await expect(toggle).toBeVisible();
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await expect(nav).toBeHidden();
      await expect(page.getByRole("button", { name: "Manage saved LZ Carry progress" })).toBeVisible();
      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      await expect(nav.locator("a")).toHaveCount(9);
      await expect(nav.locator('a[aria-current="page"]')).toHaveCount(1);
      await expect(nav.locator('a[aria-current="page"]')).toBeVisible();
      const dims = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
      expect(dims.page, target + " at " + width).toBeLessThanOrEqual(dims.viewport + 1);
      await page.keyboard.press("Escape");
      await expect(nav).toBeHidden();
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await expect(toggle).toBeFocused();
    }
  }
});


test("primary pages load at desktop and mobile without first-party network or runtime errors", async ({ page }) => {
  const targets = ["/", "/guides.html", "/beginner.html", "/dashboard.html", "/research.html", "/heroes.html", "/events.html", "/pilot.html"];
  for (const width of [1440, 390]) {
    for (const target of targets) {
      const runtimeErrors = [];
      const failedLocalRequests = [];
      const badLocalResponses = [];
      page.on("pageerror", error => runtimeErrors.push(error.message));
      page.on("console", message => {
        if (message.type() === "error") runtimeErrors.push(message.text());
      });
      page.on("requestfailed", request => {
        if (request.url().startsWith("http://127.0.0.1:4173/")) failedLocalRequests.push(request.url() + " " + request.failure()?.errorText);
      });
      page.on("response", response => {
        if (response.url().startsWith("http://127.0.0.1:4173/") && response.status() >= 400) badLocalResponses.push(response.status() + " " + response.url());
      });
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.goto(target, { waitUntil: "networkidle" });
      await expect(page.locator("main")).toBeVisible();
      const images = await page.locator("img").evaluateAll(nodes => nodes.filter(img => !img.complete || img.naturalWidth === 0).map(img => img.currentSrc || img.src));
      expect(images, target + " images at " + width).toEqual([]);
      expect(runtimeErrors, target + " runtime errors at " + width).toEqual([]);
      expect(failedLocalRequests, target + " failed local requests at " + width).toEqual([]);
      expect(badLocalResponses, target + " bad local responses at " + width).toEqual([]);
      page.removeAllListeners("pageerror");
      page.removeAllListeners("console");
      page.removeAllListeners("requestfailed");
      page.removeAllListeners("response");
    }
  }
});
