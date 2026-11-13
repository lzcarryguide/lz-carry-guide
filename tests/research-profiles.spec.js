const { test, expect } = require("@playwright/test");

test("Research Center profile selector presents differentiated routes", async ({ page }) => {
  await page.goto("/research.html");
  const select = page.locator("#research-player-profile");
  await expect(select).toBeVisible();
  await expect(page.locator("#research-profile-results .research-profile-item")).toHaveCount(6);
  const f2p = await page.locator("#research-profile-results").innerText();
  expect(f2p).toContain("Alliance Recognition");
  await select.selectOption("mid-low");
  await expect(page.locator("#research-profile-results .research-profile-item")).toHaveCount(5);
  const mid = await page.locator("#research-profile-results").innerText();
  expect(mid).toContain("Military Strategies");
  expect(mid).toContain("Peace Shield");
  expect(mid).not.toContain("Fully Armed Alliance");
  await select.selectOption("high");
  await expect(page.locator("#research-profile-results .research-profile-item")).toHaveCount(8);
  const high = await page.locator("#research-profile-results").innerText();
  expect(high).toContain("Fully Armed Alliance");
  expect(high).toContain("Tactical Master");
  await expect(page.locator("#lab-path")).toHaveValue("high");
});

test("Why this research opens the matching detailed entry and focuses its summary", async ({ page }) => {
  await page.goto("/research.html");
  const why = page.locator("#research-profile-results .research-profile-item").filter({ hasText: "Alliance Recognition" }).getByRole("button", { name: "Why this research?" });
  await why.click();
  const entry = page.locator("#tree-map .research-tree-card").filter({ has: page.locator("summary h3", { hasText: "Alliance Recognition" }) });
  await expect(entry).toHaveAttribute("open", "");
  await expect(entry.locator("summary")).toBeFocused();
  await expect(entry.locator(".research-tree-body")).toContainText("Priority:");
});

test("Research profile selector and recommendation list fit a narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/research.html");
  await page.locator("#research-player-profile").selectOption("high");
  await expect(page.locator("#research-profile-results .research-profile-item")).toHaveCount(8);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBeFalsy();
});
