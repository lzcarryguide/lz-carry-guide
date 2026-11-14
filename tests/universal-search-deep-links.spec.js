const { test, expect } = require("@playwright/test");

async function searchAndOpen(page, query, hrefPattern, targetId) {
  await page.goto("/");
  await page.getByRole("button", { name: "Search the entire LZ Carry website" }).click();
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
  } else if (await target.locator("details").count()) {
    await expect(target.locator("details").first()).toHaveAttribute("open", "");
  }
}

test("universal search opens the matching research tree", async ({ page }) => {
  await searchAndOpen(page, "Alliance Recognition", /research\.html#research-alliance-recognition/, "research-alliance-recognition");
});

test("universal search opens standalone Flowers Count", async ({ page }) => {
  await searchAndOpen(page, "Flowers Count", /flowers-count\\.html#lucky-rose-tracker/, "lucky-rose-tracker");
});
