const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");

const pages = ["index.html", "guides.html", "beginner.html", "research.html", "heroes.html", "events.html", "pilot.html"];
const artifacts = path.join(process.cwd(), "artifacts");
fs.mkdirSync(artifacts, { recursive: true });

test("all primary navigation destinations resolve", async ({ page, request }) => {
  await page.goto("/");
  const links = await page.locator("header nav a").evaluateAll(as => as.map(a => a.getAttribute("href")));
  expect(links).toEqual(expect.arrayContaining(pages));
  expect(links).not.toContain("videos.html");
  for (const href of links) expect((await request.get("/" + href)).status(), href).toBe(200);
  for (const target of pages) {
    await page.goto("/" + target);
    const localLinks = await page.locator("a[href]").evaluateAll(as => as.map(a => a.getAttribute("href")).filter(h => h && !h.startsWith("#") && !/^(https?:|mailto:|tel:|javascript:)/i.test(h)).map(h => h.split("#")[0] || location.pathname.slice(1)));
    for (const href of localLinks) expect((await request.get("/" + href)).status(), target + " -> " + href).toBe(200);
  }
});

test("homepage and Watch Our Videos channel section render", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /your ultimate/i })).toBeVisible();
  const navRows = await page.locator("header nav a").evaluateAll(as => [...new Set(as.map(a => Math.round(a.getBoundingClientRect().top)))]);
  expect(navRows).toHaveLength(1);
  await page.screenshot({ path: path.join(artifacts, "homepage-desktop.png"), fullPage: true });
  await page.goto("/guides.html");
  await expect(page.getByRole("heading", { name: "All Guides" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "guides-desktop.png"), fullPage: true });
  await page.goto("/");
  await expect(page.getByText("Watch Our Videos", { exact: true })).toBeVisible();
  const channel = page.getByRole("link", { name: /Visit Our YouTube Channel/ });
  await expect(channel).toHaveAttribute("href", "https://www.youtube.com/@Queen_WANGEL");
  await expect(channel).toHaveAttribute("target", "_blank");
});

test("mobile layouts fit viewport without page-level horizontal overflow", async ({ page }) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    for (const target of ["/", "/guides.html", "/heroes.html", "/events.html"]) {
      await page.goto(target);
      const sizes = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth }));
      expect(sizes.document, target + " at " + width + "px").toBeLessThanOrEqual(sizes.viewport + 1);
      if (width === 390) await page.screenshot({ path: path.join(artifacts, target === "/" ? "homepage-mobile.png" : target.slice(1).replace(".html","") + "-mobile.png"), fullPage: true });
    }
  }
});

test("heroes, troops and events databases load and search", async ({ page }) => {
  await page.setViewportSize({width:1440,height:1000});
  await page.goto("/heroes.html");
  await expect(page.getByRole("heading",{name:"Heroes & Troops"})).toBeVisible();
  await expect(page.getByText("12 records")).toBeVisible();
  await page.getByLabel("Search heroes").fill("angelina");
  await expect(page.getByRole("heading",{name:"Angelina"})).toBeVisible();
  await page.getByLabel("Search heroes").fill("no-such-hero");
  await expect(page.getByText("No matching records")).toBeVisible();
  await page.getByLabel("Search heroes").fill("");
  await page.getByLabel("Faction").selectOption("Blood Rose");
  await expect(page.getByText("1 record")).toBeVisible();
  await page.getByLabel("Search troop classes").fill("rider");
  await expect(page.getByRole("heading",{name:"Riders"})).toBeVisible();
  await page.screenshot({path:path.join(artifacts,"heroes-desktop.png"),fullPage:true});
  await page.goto("/events.html");
  await expect(page.getByRole("heading",{name:"Events & Rewards"})).toBeVisible();
  await expect(page.getByText("10 records")).toBeVisible();
  await page.getByLabel("Search events").fill("canyon");
  await expect(page.getByRole("heading",{name:"Canyon Clash"})).toBeVisible();
  await page.getByLabel("Event type").selectOption("Rewards");
  await expect(page.getByRole("heading",{name:"Canyon Clash"})).toHaveCount(0);
  await expect(page.getByRole("heading",{name:"Shooting Loot"})).toBeVisible();
  await page.screenshot({path:path.join(artifacts,"events-desktop.png"),fullPage:true});
});

test("public knowledge data contains no external source URLs or unverified numeric claims", async ({ request }) => {
  for (const [file,key] of [["heroes","heroes"],["troops","troops"],["events","events"]]) {
    const response=await request.get("/data/"+file+".json");
    expect(response.ok()).toBeTruthy();
    const data=await response.json();
    expect(data.schemaVersion).toBe(1);
    expect(Array.isArray(data[key])).toBeTruthy();
    expect(JSON.stringify(data)).not.toMatch(/https?:\/\//i);
  }
  const troopData=await (await request.get("/data/troops.json")).json();
  expect(troopData.troops).toHaveLength(3);
  const eventData=await (await request.get("/data/events.json")).json();
  expect(eventData.events).toHaveLength(10);
});

test("guide directory filters search and only admits verified published records", async ({ page }) => {
  const fixture = {schemaVersion:1,entries:[
    {id:"valid-hq",title:"Verified HQ basics",summary:"HQ resource planning",category:"beginner",tags:["hq"],url:"beginner.html",status:"published",verifiedAt:"2026-11-08",sources:[{name:"In-game screen",type:"in-game",checkedAt:"2026-11-08",note:"Observed directly"}]},
    {id:"draft",title:"Draft HQ strategy",summary:"not ready",category:"beginner",url:"beginner.html",status:"draft",verifiedAt:"2026-11-08",sources:[{name:"Community",type:"community",checkedAt:"2026-11-08",note:"Draft source"}]},
    {id:"no-verification",title:"Unverified HQ costs",summary:"no date",category:"beginner",url:"beginner.html",status:"published",sources:[{name:"Community",type:"community",checkedAt:"2026-11-08",note:"No actual validation"}]},
    {id:"undated-source",title:"Undated research tips",summary:"no source date",category:"research",url:"research.html",status:"published",verifiedAt:"2026-11-08",sources:[{name:"Community",type:"community",note:"Undated"}]},
    {id:"unsafe-url",title:"Unsafe entry",summary:"should not render",category:"events",url:"javascript:alert(1)",status:"published",verifiedAt:"2026-11-08",sources:[{name:"Official",type:"official",checkedAt:"2026-11-08",note:"Checked"}]}
  ]};
  await page.route("**/data/guides.json",route=>route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(fixture)}));
  await page.goto("/guides.html");
  await expect(page.getByText("1 published guide")).toBeVisible();
  await expect(page.getByRole("heading",{name:"Verified HQ basics"})).toBeVisible();
  await expect(page.getByText("Draft HQ strategy")).toHaveCount(0);
  await expect(page.getByText("Unverified HQ costs")).toHaveCount(0);
  await expect(page.getByText("Undated research tips")).toHaveCount(0);
  await expect(page.getByText("Unsafe entry")).toHaveCount(0);
  await page.screenshot({path:path.join(artifacts,"guide-search-verified-fixture.png"),fullPage:true});
  await page.getByLabel("Category").selectOption("research");
  await expect(page.getByText("0 published guides")).toBeVisible();
  await page.getByLabel("Category").selectOption("beginner");
  await page.getByLabel("Search written guides").fill("hq");
  await expect(page.getByRole("heading",{name:"Verified HQ basics"})).toBeVisible();
  await page.getByLabel("Search written guides").fill("no match");
  await expect(page.getByText("No published guides match yet")).toBeVisible();
});

test("existing guide database remains empty and unpublished", async ({ request }) => {
  const response=await request.get("/data/guides.json");
  expect(response.ok()).toBeTruthy();
  const data=await response.json();
  expect(data.schemaVersion).toBe(1);
  expect(data.entries).toEqual([]);
});
