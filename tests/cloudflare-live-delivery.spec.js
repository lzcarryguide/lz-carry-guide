const { test, expect } = require("@playwright/test");

test("published LZ Carry loads Cloudflare's beacon and delivers a live RUM event", async ({ page, baseURL }) => {
  const beaconUrl = "https://static.cloudflareinsights.com/beacon.min.js";
  const rumUrl = "https://cloudflareinsights.com/cdn-cgi/rum";
  const beaconResponsePromise = page.waitForResponse(response => response.url() === beaconUrl, { timeout: 30000 });
  const rumResponsePromise = page.waitForResponse(response =>
    response.url().startsWith(rumUrl) && response.request().method() !== "OPTIONS",
    { timeout: 30000 }
  );
  const failedFirstParty = [];
  const consoleErrors = [];
  page.on("requestfailed", request => {
    if (request.url().startsWith(baseURL)) failedFirstParty.push(request.url() + " " + (request.failure()?.errorText || ""));
  });
  page.on("console", message => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  const beaconResponse = await beaconResponsePromise;
  expect(beaconResponse.ok(), "published beacon script response").toBeTruthy();
  const rumResponse = await rumResponsePromise;
  expect(rumResponse.ok(), "published Cloudflare RUM event response").toBeTruthy();
  expect(rumResponse.request().method()).toMatch(/POST|GET/);
  expect(failedFirstParty).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
