const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");

const pages = [
  ["index.html", "home"],
  ["guides.html", "guides"],
  ["beginner.html", "beginner"],
  ["dashboard.html", "dashboard"],
  ["research.html", "research"],
  ["flowers-count.html", "flowers"],
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
      const [pilotResponse, flowersResponse] = await Promise.all([
        request.get("pilot.html?pages-verification=" + attempt, { timeout: 15000 }),
        request.get("flowers-count.html?pages-verification=" + attempt, { timeout: 15000 })
      ]);
      const [pilotBody, flowersBody] = await Promise.all([pilotResponse.text(), flowersResponse.text()]);
      if (pilotResponse.ok() && pilotBody.includes("Build your pilot package") &&
          flowersResponse.ok() && flowersBody.includes("<h1>Flowers Count</h1>")) {
        deployed = true;
        break;
      }
      observation = "Pilot HTTP " + pilotResponse.status() + " / Flowers Count HTTP " + flowersResponse.status() + " or expected release markers not present";
    } catch (error) {
      observation = error.message;
    }
    await page.waitForTimeout(15000);
  }
  expect(deployed, "Pages deployment was not updated at " + baseURL + ": " + observation).toBeTruthy();
  expect((await request.get("troops.html")).status()).toBe(404);
  expect((await request.get("events.html")).status()).toBe(404);
  expect((await request.get("data/events.json")).status()).toBe(404);

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
        await expect(toggle).toHaveAttribute("aria-expanded", "false");
      } else {
        await expect(page.locator('header nav[aria-label="Main navigation"]')).toBeVisible();
        await expect(page.locator('header nav a[aria-current="page"]')).toHaveCount(1);
      }

      if (name === "research") await expect(page.locator(".research-tree-card")).toHaveCount(22);
      if (name === "flowers") {
        await expect(page.getByRole("heading", { name: "Flowers Count" })).toBeVisible();
        await expect(page.locator("#lucky-rose-current")).toBeVisible();
        await expect(page.locator("#lucky-rose-history")).toBeVisible();
        await expect(page.locator("#lucky-rose-scope-note")).toContainText("Monday at 00:00 UTC");
      }
      if (name === "pilot") {
        await expect(page.locator("#pilot-configurator")).toBeVisible();
        await expect(page.locator(".pilot-addon-item").filter({ hasText: "SVS Chest Opening" })).toContainText("Each account is charged separately");
        await expect(page.locator("#pilot-svs-accounts option")).toHaveCount(3);
        for (const [id, label] of [["pilot-request", "Request a Pilot"], ["pilot-assistance", "Ask for Assistance"]]) {
          const contact = page.locator("#" + id);
          if (await contact.isDisabled()) {
            await expect(contact).toHaveAccessibleName(label + " — unavailable");
          } else {
            await expect(contact).toHaveAttribute("data-destination", "https://discord.gg/kVmN6e7Rm");
          }
        }
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
