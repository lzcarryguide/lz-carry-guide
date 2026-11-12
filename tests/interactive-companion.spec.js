const { test, expect } = require("@playwright/test");


test("personal goals save locally, link to the right planner and restore after reload", async ({ page }) => {
  await page.goto("/dashboard.html");
  await page.evaluate(() => localStorage.removeItem("lzcarry-player-goals-v1"));
  await page.reload();
  await expect(page.locator("#dashboard-goal-value")).toHaveText("0 / 0");
  await page.locator("#dashboard-goals > summary").click();
  await page.getByLabel("Goal", { exact: true }).fill("Finish my next research milestone");
  await page.getByLabel("Planning area").selectOption("Research");
  await page.getByLabel("Target date (optional)").fill("2027-02-01");
  await page.getByLabel("Planning note (optional)").fill("Confirm the live Laboratory unlock first");
  await page.getByRole("button", { name: "Add personal goal" }).click();
  await expect(page.locator("#dashboard-goal-list")).toContainText("Finish my next research milestone");
  await expect(page.locator('#dashboard-goal-list a[href="research.html#lab-planner"]')).toBeVisible();
  const check = page.getByLabel("Complete goal: Finish my next research milestone");
  await check.check();
  await expect(page.locator("#dashboard-goal-value")).toHaveText("1 / 1");
  await page.reload();
  await expect(page.locator("#dashboard-goal-value")).toHaveText("1 / 1");
  await page.locator("#dashboard-goals > summary").click();
  await expect(page.getByLabel("Complete goal: Finish my next research milestone")).toBeChecked();
  await page.setViewportSize({ width: 360, height: 800 });
  const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport + 1);
  page.on("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Clear completed goals" }).click();
  await expect(page.locator("#dashboard-goal-value")).toHaveText("0 / 0");
});

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
  await expect(page.locator("#research-next")).toContainText("Priority-based suggestion only");
  await expect(page.locator("#research-next")).toContainText("verify prerequisite research");
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
  const durationStyle = await page.locator("#pilot-days").evaluate(el => ({ background: getComputedStyle(el).backgroundColor, color: getComputedStyle(el).color, height: el.getBoundingClientRect().height }));
  expect(durationStyle.background).toBe("rgb(11, 18, 29)");
  expect(durationStyle.color).toBe("rgb(232, 239, 248)");
  expect(durationStyle.height).toBeGreaterThanOrEqual(42);

  await page.getByLabel("Daily Pilot duration").fill("0");
  await expect(page.getByLabel("Daily Pilot duration")).toHaveValue("1");
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
  await page.locator("#pilot-canyon-accounts").fill("25");
  await expect(page.locator("#pilot-canyon-accounts")).toHaveValue("20");
  await expect(page.locator("#pilot-total")).toHaveText("$195");
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


test("player progress can be cleared and restored from a reversible local snapshot", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/dashboard.html");
  await page.evaluate(() => {
    localStorage.setItem("lzcarry:hq-planner:v2", JSON.stringify({ "35:0": true }));
    localStorage.setItem("lzcarry-research-plan-v1", JSON.stringify({ "Alliance Recognition": "Done" }));
    localStorage.setItem("lzcarry-event-checklists-v1", JSON.stringify({ "alliance-duel": { "0": true } }));
    localStorage.setItem("lzcarry-hero-investment-compare-v1", JSON.stringify({ a: "audrey", b: "ava" }));
  });
  await page.getByRole("button", { name: "Manage saved LZ Carry progress" }).click();
  page.on("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Clear all progress" }).click();
  await expect(page.locator(".player-data-summary")).toContainText("All saved progress cleared");
  const cleared = await page.evaluate(() => ({
    hq: localStorage.getItem("lzcarry:hq-planner:v2"),
    research: localStorage.getItem("lzcarry-research-plan-v1"),
    event: localStorage.getItem("lzcarry-event-checklists-v1"),
    heroCompare: localStorage.getItem("lzcarry-hero-investment-compare-v1"),
    snapshot: JSON.parse(localStorage.getItem("lzcarry-player-data-rollback-v1"))
  }));
  expect(cleared.hq).toBeNull();
  expect(cleared.research).toBeNull();
  expect(cleared.event).toBeNull();
  expect(cleared.heroCompare).toBeNull();
  expect(cleared.snapshot.values["lzcarry:hq-planner:v2"]).toContain("true");
  await page.getByRole("button", { name: "Restore previous snapshot" }).click();
  await expect(page.locator(".player-data-summary")).toContainText("Previous progress snapshot restored");
  const restored = await page.evaluate(() => ({
    hq: JSON.parse(localStorage.getItem("lzcarry:hq-planner:v2")),
    research: JSON.parse(localStorage.getItem("lzcarry-research-plan-v1")),
    event: JSON.parse(localStorage.getItem("lzcarry-event-checklists-v1")),
    heroCompare: JSON.parse(localStorage.getItem("lzcarry-hero-investment-compare-v1"))
  }));
  expect(restored.hq["35:0"]).toBe(true);
  expect(restored.research["Alliance Recognition"]).toBe("Done");
  expect(restored.event["alliance-duel"]["0"]).toBe(true);
  expect(restored.heroCompare.a).toBe("audrey");
});


test("Player Dashboard prioritizes one next action and Speedup Planner persists player-entered timer math", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/dashboard.html");
  await expect(page.getByRole("heading", { name: "Next Best Action" })).toBeVisible();
  await expect(page.locator(".dashboard-next-action-card strong")).toHaveText("Set your current HQ");
  await page.locator("#dashboard-hq").selectOption("25");
  await page.getByRole("button", { name: "Save account progress" }).click();
  await expect(page.locator(".dashboard-next-action-card strong")).toHaveText("Plan your next HQ upgrade");
  await expect(page.locator("#dashboard-recommendations")).not.toContainText("Plan your next HQ upgrade");

  await page.getByLabel("Timer type").selectOption("Research");
  await page.getByLabel("Days remaining").fill("1");
  await page.getByLabel("Hours remaining").fill("2");
  await page.getByLabel("Minutes remaining").fill("30");
  await page.getByLabel("Available speedup time (minutes)").fill("600");
  await expect(page.locator("#speedup-results")).toContainText("Research timer · 1d 2h 30m");
  await expect(page.locator("#speedup-results")).toContainText("Remaining: 16h 30m");
  await expect(page.locator(".speedup-progress-track")).toHaveAttribute("aria-valuenow", "38");
  await page.reload();
  await expect(page.getByLabel("Timer type")).toHaveValue("Research");
  await expect(page.getByLabel("Available speedup time (minutes)")).toHaveValue("600");
  await page.getByLabel("Available speedup time (minutes)").fill("2000");
  await expect(page.locator("#speedup-results")).toContainText("Your entered speedup time covers the full timer");
  await page.getByRole("button", { name: "Reset speedup planner" }).click();
  await expect(page.getByLabel("Timer type")).toHaveValue("Building");
  await expect(page.getByLabel("Available speedup time (minutes)")).toHaveValue("0");
});


test("Beginner Mode checklist is the primary path and long reference sections start collapsed", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/beginner.html");
  const order = await page.evaluate(() => {
    const nodes = Array.from(document.querySelector("main").children);
    return {
      mode: nodes.indexOf(document.getElementById("beginner-mode")),
      categories: nodes.indexOf(document.querySelector(".beginner-category-disclosure")?.closest("section")),
      guide: nodes.indexOf(document.querySelector(".beginner-field-guide"))
    };
  });
  expect(order.mode).toBeLessThan(order.categories);
  expect(order.mode).toBeLessThan(order.guide);
  await expect(page.locator("#beginner-mode")).toBeVisible();
  await expect(page.locator(".beginner-category-disclosure")).not.toHaveAttribute("open", "");
  await expect(page.locator(".beginner-reference-disclosure")).not.toHaveAttribute("open", "");
  await page.locator("#beginner-account").check();
  await expect(page.locator("#beginner-progress-text")).toHaveText("1 of 5 steps complete");
  await page.locator(".beginner-reference-disclosure > summary").click();
  await expect(page.locator(".beginner-reference-disclosure")).toHaveAttribute("open", "");
  await expect(page.locator(".beginner-guide-card")).toHaveCount(6);
  page.on("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Reset checklist" }).click();
  await expect(page.locator("#beginner-progress-text")).toHaveText("0 of 5 steps complete");
});


test("Hero Investment Comparison shows source caveats and persists player-entered notes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/heroes.html");
  const panel = page.locator("#hero-investment-compare .hero-investment-disclosure");
  await expect(panel).not.toHaveAttribute("open", "");
  await panel.locator(":scope > summary").click();
  await expect(page.locator('#hero-compare-a option[value="audrey"]')).toHaveCount(1);
  await page.locator("#hero-compare-a").selectOption("audrey");
  await page.locator("#hero-compare-b").selectOption("ava");
  await page.locator("#hero-compare-a-current").fill("45");
  await page.locator("#hero-compare-a-target").fill("60");
  await page.locator("#hero-compare-a-stars").fill("3 stars; skill 2");
  await expect(page.locator("#hero-investment-results")).toContainText("Audrey");
  await expect(page.locator("#hero-investment-results")).toContainText("Ava");
  await expect(page.locator("#hero-investment-results")).toContainText("Current level: 45");
  await expect(page.locator(".hero-investment-caveat")).toContainText("No universal investment ranking is calculated");
  await page.screenshot({ path: "artifacts/hero-investment-comparison-desktop.png", fullPage: true });
  await expect(page.locator("#hero-investment-results")).not.toContainText("Winner:");
  await expect(page.locator("#hero-investment-results")).not.toContainText("Power score:");
  const evidenceDetails = page.locator("#hero-investment-results .hero-investment-evidence").first();
  await expect(evidenceDetails).not.toHaveAttribute("open", "");
  await evidenceDetails.locator("summary").click();
  await expect(evidenceDetails).toHaveAttribute("open", "");
  await expect(evidenceDetails).toContainText("Source confidence:");
  await page.locator("#hero-compare-b").selectOption("amber");
  await expect(page.locator("#hero-investment-results")).toContainText("Unconfirmed");
  await expect(page.locator("#hero-investment-results")).toContainText("provisional");
  await page.reload();
  await expect(page.locator("#hero-compare-a")).toHaveValue("audrey");
  await expect(page.locator("#hero-compare-b")).toHaveValue("amber");
  await expect(page.locator("#hero-compare-a-current")).toHaveValue("45");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".hero-investment-disclosure > summary").click();
  const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport + 1);
  await page.screenshot({ path: "artifacts/hero-investment-comparison-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Reset comparison" }).click();
  await expect(page.locator("#hero-compare-a-current")).toHaveValue("");
  await expect(page.locator("#hero-compare-a-stars")).toHaveValue("");
});
