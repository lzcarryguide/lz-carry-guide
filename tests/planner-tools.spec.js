const { test, expect } = require("@playwright/test");

test("Laboratory route planner filters routes and saves progress locally", async ({ page }) => {
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.setViewportSize({width:1280,height:900});
  await page.goto("/research.html");
  await expect(page.getByRole("heading",{name:"Laboratory Route Planner"})).toBeVisible();
  await page.locator("#lab-hq").selectOption("30");
  await page.locator("#lab-level").selectOption("30");
  await page.locator("#lab-path").selectOption("t10");
  await page.locator("#lab-second").check();
  await expect(page.locator("#lab-plan-list")).toContainText("Unit Special Training");
  await expect(page.locator("#lab-plan-list")).toContainText("Army Expansion");
  await page.getByLabel("Unit Special Training progress").selectOption("In progress");
  await expect(page.locator("#lab-plan-summary")).toContainText("1 in progress");
  await page.reload();
  await expect(page.getByLabel("Unit Special Training progress")).toHaveValue("In progress");
  await page.screenshot({path:"artifacts/laboratory-route-planner.png",fullPage:true});
  page.once("dialog",d=>d.accept());
  await page.locator("#lab-plan-reset").click();
  await expect(page.locator("#lab-plan-summary")).toContainText("0 in progress");
  expect(errors).toEqual([]);
});

test("Full Preparedness planner shows Apocalypse Time and persists checklist", async ({ page }) => {
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.setViewportSize({width:1280,height:900});
  await page.goto("/events.html");
  await expect(page.getByRole("heading",{name:"Full Preparedness & Alliance Duel Prep"})).toBeVisible();
  await expect(page.locator("#event-at-clock")).toContainText("AT");
  await expect(page.locator("#event-at-window")).toContainText("–");
  await page.locator("#event-prep-theme").selectOption("Research");
  const first=page.locator("#event-prep-checks input").first();
  await first.check();
  await page.reload();
  await page.locator("#event-prep-theme").selectOption("Research");
  await expect(page.locator("#event-prep-checks input").first()).toBeChecked();
  await page.screenshot({path:"artifacts/event-preparation-planner.png",fullPage:true});
  page.once("dialog",d=>d.accept());
  await page.locator("#event-prep-reset").click();
  await expect(page.locator("#event-prep-checks input").first()).not.toBeChecked();
  expect(errors).toEqual([]);
});

test("new planning tools remain within narrow mobile viewports", async ({ page }) => {
  for (const width of [390,320]) {
    await page.setViewportSize({width,height:844});
    for (const target of ["/research.html","/events.html"]) {
      await page.goto(target);
      const sizes=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
      expect(sizes.scroll,target+" at "+width).toBeLessThanOrEqual(sizes.client+1);
    }
  }
});
