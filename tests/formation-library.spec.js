const { test, expect } = require("@playwright/test");

test("Formation Lab saves, reloads and compares local lineups", async ({ page }) => {
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.setViewportSize({width:1280,height:900});
  await page.goto("/heroes.html");
  await expect(page.getByRole("heading",{name:"Save, Share & Compare"})).toBeVisible();
  await expect(page.locator("#builder-results .builder-hero").first()).toBeVisible();
  await page.locator("#formation-slots .formation-slot").nth(0).click();
  await page.locator("#builder-results .builder-hero").nth(0).click();
  const alphaHero=await page.locator("#formation-slots .formation-slot").first().locator("strong").textContent();
  await page.locator("#formation-name").fill("Alpha");
  await page.locator("#formation-save").click();
  await expect(page.locator("#formation-saved-list")).toContainText("Alpha");
  await page.locator("#formation-saved-list").getByRole("button",{name:"Copy",exact:true}).first().click();
  await expect(page.locator("#formation-saved-list")).toContainText("Alpha copy");
  await page.locator("#formation-slots .formation-slot").nth(1).click();
  await page.locator("#builder-results .builder-hero").nth(1).click();
  await page.locator("#formation-name").fill("Beta");
  await page.locator("#formation-save").click();
  await page.locator("#formation-compare-a").selectOption({index:1});
  await page.locator("#formation-compare-b").selectOption({index:3});
  await page.locator("#formation-compare").click();
  await expect(page.locator("#formation-compare-result")).toContainText("Slot");
  await page.locator("#formation-saved-list").getByRole("button",{name:"Load"}).first().click();
  await expect(page.locator("#formation-slots .formation-slot").first()).toContainText(alphaHero);
  await page.reload();
  await expect(page.locator("#formation-saved-list")).toContainText("Alpha");
  await expect(page.locator("#formation-saved-list")).toContainText("Beta");
  await expect(page.locator("#formation-saved-list")).toContainText("Alpha copy");
  await page.screenshot({path:"artifacts/formation-library.png",fullPage:true});
  expect(errors).toEqual([]);
});

test("formation share link restores a five-slot lineup", async ({ page, baseURL }) => {
  const payload=btoa(unescape(encodeURIComponent(JSON.stringify({v:1,heroes:["Scarlett","Alma",null,null,null]}))));
  await page.goto(baseURL+"/heroes.html?formation="+encodeURIComponent(payload));
  await expect(page.locator("#builder-results .builder-hero").first()).toBeVisible();
  await expect(page.locator("#formation-slots .formation-slot").nth(0)).toContainText("Scarlett");
  await expect(page.locator("#formation-slots .formation-slot").nth(1)).toContainText("Alma");
});
