const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

const routes = [
  "/stories/",
  "/stories/discover/",
  "/stories/series/before-we-lost-each-other/",
  "/stories/series/before-we-lost-each-other/episode-01/",
  "/stories/library/",
  "/stories/updates/"
];

test("all six Veil routes pass WCAG 2.1 A and AA automated accessibility rules", async ({ page }) => {
  test.setTimeout(120000);
  for (const route of routes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const summary = results.violations.map(violation => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      nodes: violation.nodes.map(node => ({ target: node.target, summary: node.failureSummary }))
    }));
    expect(summary, "accessibility violations on " + route).toEqual([]);
  }

  await page.goto("/stories/series/before-we-lost-each-other/episode-01/");
  await page.locator(".page-open").first().click();
  const dialog = page.getByRole("dialog", { name: "Enlarged comic page" });
  await expect(dialog).toBeVisible();
  const dialogScan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(dialogScan.violations.map(item => ({ id: item.id, impact: item.impact })), "reader dialog accessibility").toEqual([]);
});
