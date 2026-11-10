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
  await page.locator("#event-prep-next-theme").selectOption("Heroes");
  await expect(page.locator("#event-theme-context")).toContainText("Next theme selected: Heroes");
  await expect(page.locator("#event-prep-checks")).toContainText("badges only for listed tasks");
  await expect(page.locator("#event-prep-theme option")).toHaveCount(6);
  const first=page.locator("#event-prep-checks input").first();
  await first.check();
  await page.reload();
  await page.locator("#event-prep-theme").selectOption("Research");
  await expect(page.locator("#event-prep-checks input").first()).toBeChecked();\n  await expect(page.locator("#event-prep-milestones input").first()).toBeChecked();
  await page.screenshot({path:"artifacts/event-preparation-planner.png",fullPage:true});
  page.once("dialog",d=>d.accept());
  await page.locator("#event-prep-reset").click();
  await expect(page.locator("#event-prep-checks input").first()).not.toBeChecked();\n  await expect(page.locator("#event-prep-milestones input").first()).not.toBeChecked();
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

test("Apocalypse Time countdown is exact at a four-hour boundary", async ({ page }) => {
  const fixed=Date.parse("2026-11-10T02:00:00Z"); // 00:00 AT (UTC-2)
  await page.addInitScript((timestamp)=>{
    const NativeDate=Date;
    class FixedDate extends NativeDate {
      constructor(...args){ super(...(args.length?args:[timestamp])); }
      static now(){ return timestamp; }
    }
    window.Date=FixedDate;
  },fixed);
  await page.goto("/events.html");
  await expect(page.locator("#event-at-clock")).toContainText("00:00:00 AT");
  await expect(page.locator("#event-at-next")).toHaveText("4h 00m 00s until next four-hour boundary");
});
