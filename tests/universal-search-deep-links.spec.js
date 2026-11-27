const { test, expect } = require("@playwright/test");

async function searchAndOpen(page, query, hrefPattern, targetId, openNestedDetails = true) {
  await page.goto("/");
  await page.getByRole("button", { name: "Search LZ Carry" }).click();
  const search = page.getByRole("searchbox", { name: "Search all LZ Carry content" });
  await search.fill(query);
  const result = page.locator(".universal-search-result").filter({ hasText: query }).first();
  await expect(result).toHaveAttribute("href", hrefPattern);
  await result.click();
  await expect(page).toHaveURL(hrefPattern);
  const target = page.locator("#" + targetId);
  await expect(target).toBeVisible();
  if (await target.evaluate(node => node.tagName === "DETAILS")) {
    await expect(target).toHaveAttribute("open", "");
  } else if (openNestedDetails && await target.locator("details").count()) {
    await expect(target.locator("details").first()).toHaveAttribute("open", "");
  }
}

test("universal search opens the matching research tree", async ({ page }) => {
  await searchAndOpen(page, "Alliance Recognition", /research\.html#research-alliance-recognition/, "research-alliance-recognition");
});

test("universal search opens standalone Flowers Count", async ({ page }) => {
  await searchAndOpen(page, "This week's number", /flowers-count\.html#lucky-rose-tracker/, "lucky-rose-tracker", false);
});


test("universal search indexes community hero records and opens the Hero Encyclopedia", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search LZ Carry" }).click();
  const search = page.getByRole("searchbox", { name: "Search all LZ Carry content" });
  await search.fill("Bella");
  const result = page.locator(".universal-search-result").filter({ hasText: "Bella" }).first();
  await expect(result).toHaveAttribute("href", /heroes\.html/);
  await result.click();
  await expect(page).toHaveURL(/heroes\.html/);
  await expect(page.locator("#builder-results")).toContainText("Bella");
});

test("universal search indexes event records and opens the Events Center", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search LZ Carry" }).click();
  const search = page.getByRole("searchbox", { name: "Search all LZ Carry content" });
  await search.fill("Canyon Clash");
  const result = page.locator(".universal-search-result").filter({ hasText: "Canyon Clash" }).first();
  await expect(result).toHaveAttribute("href", /events\.html/);
  await result.click();
  await expect(page).toHaveURL(/events\.html/);
  await expect(page.locator("#event-results")).toContainText("Canyon Clash");
});
