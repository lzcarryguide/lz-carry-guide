const { test, expect } = require("@playwright/test");

test("Hero Center reports skill coverage and does not overstate draft formation evidence", async ({ page }) => {
  await page.goto("/heroes.html");
  await expect(page.getByText(/23 of 36 profiles include community-indexed skill notes/)).toBeVisible();
  await page.locator(".hero-preset-disclosure > summary").click();
  await expect(page.getByRole("heading", { name: "Draft faction templates" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Blood Rose · draft template" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Wings of Dawn · draft template" })).toBeVisible();
  await expect(page.getByText(/do not establish these exact five names, slot order or front\/back positions/i)).toBeVisible();
});
