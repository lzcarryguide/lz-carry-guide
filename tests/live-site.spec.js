const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");

const pages = [
  ["index.html", "home"],
  ["guides.html", "guides"],
  ["beginner.html", "beginner"],
  ["dashboard.html", "dashboard"],
  ["research.html", "research"],
  ["heroes.html", "heroes"],
  ["events.html", "events"],
  ["pilot.html", "pilot"]
];
const artifacts = path.join(process.cwd(), "artifacts", "live");
fs.mkdirSync(artifacts, { recursive: true });

test("published GitHub Pages site is live, responsive and serves every primary page", async ({ page, request, baseURL }) => {
  test.setTimeout(600000);
  let deployed = false;
  let observation = "";
  for (let attempt = 1; attempt <= 20; attempt++) {
    try {
      const response = await request.get("pilot.html?pages-verification=" + attempt, { timeout: 15000 });
      const body = await response.text();
      if (response.ok() && body.includes("Build your pilot package")) {
        deployed = true;
        break;
      }
      observation = "HTTP " + response.status() + " or Pilot configurator marker not present";
    } catch (error) {
      observation = error.message;
    }
    await page.waitForTimeout(15000);
  }
  expect(deployed, "Pages deployment was not updated at " + baseURL + ": " + observation).toBeTruthy();

  for (const width of [1440, 390]) {
    for (const [target, name] of pages) {
      const runtimeErrors = [];
      const failedRequests = [];
      const badResponses = [];
      const pageError = error => runtimeErrors.push(error.message);
      const consoleError = message => { if (message.type() === "error") runtimeErrors.push(message.text()); };
      const requestFailed = req => {
        if (req.url().startsWith(baseURL)) failedRequests.push(req.url() + " " + (req.failure()?.errorText || ""));
      };
      const responseError = response => {
        if (response.url().startsWith(baseURL) && response.status() >= 400) badResponses.push(response.status() + " " + response.url());
      };
      page.on("pageerror", pageError);
      page.on("console", consoleError);
      page.on("requestfailed", requestFailed);
      page.on("response", responseError);
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.goto(target, { waitUntil: "networkidle", timeout: 45000 });
      await expect(page.locator("main")).toBeVisible();
      await page.evaluate(() => { document.querySelectorAll("img").forEach(img => { img.loading = "eager"; }); return document.fonts.ready; });
      await page.waitForFunction(() => Array.from(document.images).every(img => img.complete));
      const diagnostics = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        page: document.documentElement.scrollWidth,
        fontStatus: document.fonts.status,
        brokenImages: Array.from(document.images).filter(img => !img.complete || img.naturalWidth === 0).map(img => img.currentSrc || img.src)
      }));
      expect(diagnostics.page, name + " horizontal overflow at " + width).toBeLessThanOrEqual(diagnostics.viewport + 1);
      expect(diagnostics.fontStatus, name + " fonts").toBe("loaded");
      expect(diagnostics.brokenImages, name + " images").toEqual([]);

      if (width === 390) {
        const toggle = page.getByRole("button", { name: "Menu" });
        const nav = page.locator('header nav[aria-label="Main navigation"]');
        await expect(toggle).toBeVisible();
        await expect(nav).toBeHidden();
        await expect(page.getByRole("button", { name: "Manage saved LZ Carry progress" })).toBeVisible();
        await toggle.click();
        await expect(nav).toBeVisible();
        await expect(nav.locator('a[aria-current="page"]')).toHaveCount(1);
        if (name === "home") await page.screenshot({ path: path.join(artifacts, "mobile-navigation-open.png") });
        await toggle.click();
        await expect(nav).toBeHidden();
      } else {
        await expect(page.locator('header nav[aria-label="Main navigation"]')).toBeVisible();
        await expect(page.locator('header nav a[aria-current="page"]')).toHaveCount(1);
      }

      if (name === "research") await expect(page.locator(".research-tree-card")).toHaveCount(22);
      if (name === "heroes") {
        await expect(page.locator("#formation-lab")).toBeVisible();
        await expect(page.locator("#formation-slots .formation-slot")).toHaveCount(5);
      }
      if (name === "events") await expect(page.locator("#event-results details.event-profile").first()).toBeVisible();
      if (name === "pilot") {
        await expect(page.locator("#pilot-configurator")).toBeVisible();
        await expect(page.getByRole("button", { name: "Request a Pilot — unavailable" })).toBeDisabled();
        await expect(page.getByRole("button", { name: "Ask for Assistance — unavailable" })).toBeDisabled();
      }
      await page.screenshot({ path: path.join(artifacts, name + "-" + width + ".png"), fullPage: true });
      expect(runtimeErrors, name + " console/runtime errors at " + width).toEqual([]);
      expect(failedRequests, name + " failed first-party requests at " + width).toEqual([]);
      expect(badResponses, name + " first-party HTTP errors at " + width).toEqual([]);
      page.off("pageerror", pageError);
      page.off("console", consoleError);
      page.off("requestfailed", requestFailed);
      page.off("response", responseError);
    }
  }
});
