const { test, expect } = require("@playwright/test");

test("shared evidence labels distinguish cross-source agreement from verified game data", async ({ page }) => {
  await page.goto("/heroes.html");
  const result = await page.evaluate(() => ({
    crossSource: window.LZCarryDataStatus.normalize("cross-source agreement"),
    provisional: window.LZCarryDataStatus.normalize("PROVISIONAL — community-reported; not published as a verified value"),
    community: window.LZCarryDataStatus.normalize("Community-supported"),
    verifiedWithoutMethod: window.LZCarryDataStatus.normalize("Verified"),
    verifiedInGame: window.LZCarryDataStatus.normalize({ status: "verified", method: "current in-game client" })
  }));
  expect(result).toEqual({
    crossSource: "community-supported",
    provisional: "unconfirmed",
    community: "community-supported",
    verifiedWithoutMethod: "community-supported",
    verifiedInGame: "verified"
  });
});

test("hero encyclopedia renders shared community evidence labels", async ({ page }) => {
  await page.goto("/heroes.html");
  await expect(page.locator("#builder-results .hero-directory-item .evidence-badge").first()).toHaveText("Community-supported");
  await expect(page.locator("#builder-results .hero-directory-item").first()).toHaveAttribute("data-verification-status", "community-supported");
});

test("troop directory does not promote provisional statistics to verified", async ({ page }) => {
  await page.goto("/heroes.html");
  await page.locator("#troop-database .hero-advanced-disclosure > summary").click();
  await expect(page.locator("#troop-results .troop-tier-row .troop-evidence-badge").first()).toBeVisible();
  const data = await page.request.get("/data/troops.json");
  expect(data.ok()).toBeTruthy();
  const json = await data.json();
  const firstTier = json.classes[0].tiers[0];
  expect(await page.evaluate(status => window.LZCarryDataStatus.normalize(status), firstTier.nameStatus)).toBe("community-supported");
  expect(await page.evaluate(status => window.LZCarryDataStatus.normalize(status), firstTier.valuesStatus)).toBe("unconfirmed");
  expect(await page.evaluate(status => window.LZCarryDataStatus.normalize(status), firstTier.unlockStatus)).toBe("unconfirmed");
});

test("event directory labels community-supported and unconfirmed entries consistently", async ({ page }) => {
  await page.goto("/events.html");
  await expect(page.locator("#event-results .evidence-badge").first()).toBeVisible();
  const statuses = await page.evaluate(async () => {
    const response = await fetch("data/events.json");
    const data = await response.json();
    return data.events.map(event => window.LZCarryDataStatus.normalize(event.verificationStatus || event.evidenceStatus || "unconfirmed"));
  });
  expect(statuses).toContain("community-supported");
  expect(statuses).toContain("unconfirmed");
});
