const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

test("Hero Encyclopedia and Events Center pass WCAG 2.1 A/AA automated checks", async ({ page }) => {
  for (const route of ["/heroes.html", "/events.html"]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toBeVisible();
    if (route === "/heroes.html") await expect(page.locator("#builder-results .hero-directory-item")).toHaveCount(36);
    if (route === "/events.html") await expect(page.locator("#event-results .event-profile")).toHaveCount(16);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const summary = results.violations.map(violation => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.map(node => node.target) }));
    expect(summary, "accessibility violations on " + route).toEqual([]);
  }
});
