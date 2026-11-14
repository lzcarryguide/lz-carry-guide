const { test, expect } = require("@playwright/test");

test("Laboratory route planner filters routes and saves progress locally", async ({ page }) => {
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.setViewportSize({width:1280,height:900});
  await page.goto("/research.html");
  await expect(page.getByRole("heading",{name:"Research Guide"})).toBeVisible();
  await expect(page.getByLabel("Search research")).toBeVisible();
  const searchTop=await page.locator("#tree-map").evaluate(n=>n.getBoundingClientRect().top);
  const plannerTop=await page.locator("#lab-planner").evaluate(n=>n.getBoundingClientRect().top);
  expect(searchTop).toBeLessThan(plannerTop);
  await expect(page.getByRole("heading",{name:"Laboratory Route Planner"})).toBeVisible();
  await page.locator("#lab-hq").selectOption("30");
  await page.locator("#lab-level").selectOption("30");
  await page.locator("#lab-path").selectOption("early-low");
  await expect(page.locator("#lab-plan-list")).toContainText("Alliance Recognition");
  await page.locator("#lab-path").selectOption("t10");
  await page.locator("#lab-second").check();
  await expect(page.locator("#lab-plan-list")).toContainText("Unit Special Training");
  await expect(page.locator("#lab-plan-list")).toContainText("Army Expansion");
  await expect(page.locator("#lab-plan-list")).toContainText("Below reported Lab/HQ or Lab No. 2 / season gate");
  await page.locator("#lab-second-level").selectOption("33");
  await page.locator("#lab-season-day50").check();
  await expect(page.locator("#lab-plan-list .lab-plan-item").filter({hasText:"Unit Special Training"})).toContainText("Lab/HQ level gate met; confirm prerequisites in game");
  await page.locator("#lab-plan-list .lab-plan-item").filter({hasText:"Unit Special Training"}).locator("summary").click();
  await page.getByLabel("Unit Special Training progress").selectOption("In progress");
  await expect(page.locator("#lab-plan-summary")).toContainText("1 in progress");
  await page.reload();
  await page.locator("#lab-plan-list .lab-plan-item").filter({hasText:"Unit Special Training"}).locator("summary").click();
  await expect(page.getByLabel("Unit Special Training progress")).toHaveValue("In progress");
  await page.screenshot({path:"artifacts/laboratory-route-planner.png",fullPage:true});
  page.once("dialog",d=>d.accept());
  await page.locator("#lab-plan-reset").click();
  await expect(page.locator("#lab-plan-summary")).toContainText("0 in progress");
  expect(errors).toEqual([]);
});

test("new planning tools remain within narrow mobile viewports", async ({ page }) => {
  for (const width of [390,320]) {
    await page.setViewportSize({width,height:844});
    for (const target of ["/research.html","/flowers-count.html"]) {
      await page.goto(target);
      const sizes=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
      expect(sizes.scroll,target+" at "+width).toBeLessThanOrEqual(sizes.client+1);
    }
  }
});

