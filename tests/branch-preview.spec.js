const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");

const pages = ["index.html", "guides.html", "beginner.html", "dashboard.html", "research.html", "heroes.html", "events.html", "pilot.html"];
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
  expect(navRows.length).toBeGreaterThanOrEqual(1);
  expect(navRows.length).toBeLessThanOrEqual(2);
  await page.screenshot({ path: path.join(artifacts, "homepage-desktop.png"), fullPage: true });
  await page.goto("/guides.html");
  await expect(page.getByRole("heading", { name: "All Guides" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "guides-desktop.png"), fullPage: true });
  await page.goto("/research.html");
  await expect(page.getByRole("heading", { name: "Research Guide" })).toBeVisible();
  await expect(page.locator("#research-count")).toHaveText("22 matching technologies");
  await page.screenshot({ path: path.join(artifacts, "research-desktop.png"), fullPage: true });
  await page.goto("/");
  await expect(page.getByText("Watch Our Videos", { exact: true })).toBeVisible();
  const channel = page.getByRole("link", { name: /Visit Our YouTube Channel/ });
  await expect(channel).toHaveAttribute("href", "https://www.youtube.com/@Queen_WANGEL");
  await expect(channel).toHaveAttribute("target", "_blank");
});


test("research database searches, filters and expands technology details", async ({ page }) => {
  await page.setViewportSize({width:1440,height:1000});
  await page.goto("/research.html");
  const search=page.getByLabel("Search research");
  const group=page.getByLabel("Category");
  await expect(page.locator(".research-tree-card")).toHaveCount(22);
  await search.fill("Alliance Recognition");
  await expect(page.locator(".research-tree-card:visible")).toHaveCount(1);
  const card=page.locator(".research-tree-card:visible");
  await expect(card.locator("summary h3")).toHaveText("Alliance Recognition");
  await expect(card).toHaveAttribute("open","");
  await expect(card.locator(".research-tree-body")).toContainText("Prerequisite");
  await page.screenshot({path:path.join(artifacts,"research-tree-detail.png"),fullPage:true});
  await search.fill("");
  await group.selectOption("alliance");
  await expect(page.locator(".research-tree-card:visible")).toHaveCount(3);
  await group.selectOption("");
  await search.fill("Laboratory");
  await expect(page.locator(".research-tree-card:visible").first()).toBeVisible();
});
test("mobile layouts fit viewport without page-level horizontal overflow", async ({ page }) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    for (const target of ["/", "/guides.html", "/beginner.html", "/dashboard.html", "/research.html", "/heroes.html", "/events.html"]) {
      await page.goto(target);
      const sizes = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth }));
      expect(sizes.document, target + " at " + width + "px").toBeLessThanOrEqual(sizes.viewport + 1);
      if (width === 390) await page.screenshot({ path: path.join(artifacts, target === "/" ? "homepage-mobile.png" : target.slice(1).replace(".html","") + "-mobile.png"), fullPage: true });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/research.html");
  const toggle = page.getByRole("button", { name: "Menu" });
  const mobileNav = page.locator('header nav[aria-label="Main navigation"]');
  await expect(toggle).toBeVisible();
  await expect(page.getByRole("button", { name: "Manage saved LZ Carry progress" })).toBeVisible();
  await expect(mobileNav).toBeHidden();
  await toggle.click();
  await expect(mobileNav).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "LZ Carry Service" })).toBeVisible();
  const navMetrics = await mobileNav.evaluate(node => ({ client: node.clientWidth, scroll: node.scrollWidth, overflow: getComputedStyle(node).overflowX }));
  expect(navMetrics.scroll).toBeLessThanOrEqual(navMetrics.client + 1);
  expect(navMetrics.overflow).not.toMatch(/auto|scroll/);
});

test("heroes, troops and events databases load and search", async ({ page }) => {
  await page.setViewportSize({width:1440,height:1000});
  const pageErrors=[];
  page.on("pageerror",error=>pageErrors.push(error.stack || error.message));
  page.on("console",message=>{if(message.type()==="error") console.log("BROWSER_CONSOLE_ERROR",message.text());});
  await page.goto("/heroes.html");
  await expect(page.getByRole("heading",{name:"Hero Recommendations & Formation Builder"})).toBeVisible();
  await expect(page.locator("#formation-slots .formation-slot")).toHaveCount(5);
  await expect(page.locator("#builder-results .hero-directory-item")).toHaveCount(12);
  await expect(page.locator("#builder-count")).toContainText("Showing 12 of 36 indexed heroes · 33 selectable");
  await page.getByRole("button", { name: /Show more heroes/ }).click();
  await page.getByRole("button", { name: /Show more heroes/ }).click();
  await expect(page.locator("#builder-results .hero-directory-item")).toHaveCount(36);
  await expect(page.locator("#builder-results .builder-hero:not(:disabled)")).toHaveCount(33);
  await expect(page.locator("#builder-results .builder-hero:disabled")).toHaveCount(3);
  await page.locator("#builder-results .hero-directory-item").first().locator("summary").click();
  await expect(page.locator("#builder-results .hero-directory-item").first()).toContainText("Portrait not verified");
  await expect(page.locator("#builder-results .hero-directory-item").first()).toContainText("Portrait status: no official or reliable portrait asset has been verified");
  await page.getByLabel("Role").selectOption("Tank");
  expect(await page.locator("#builder-results .hero-directory-item").count()).toBeGreaterThan(0);
  await page.getByLabel("Role").selectOption("");
  await page.getByLabel("Search heroes").fill("Jack");
  await expect(page.locator("#builder-results .builder-hero")).toHaveCount(0);
  await page.getByLabel("Search heroes").fill("");
  await page.getByLabel("Season").selectOption("5");
  await expect(page.locator("#builder-results .hero-directory-item")).toHaveCount(3);
  await expect(page.locator("#builder-results .builder-hero:not(:disabled)")).toHaveCount(3);
  await page.getByLabel("Season").selectOption("");
  await page.screenshot({path:path.join(artifacts,"heroes-desktop.png"),fullPage:true});
  await page.goto("/events.html");
  await expect(page.getByRole("heading",{name:"Events & Rewards"})).toBeVisible();
  await expect(page.getByRole("heading",{name:"Weekly Alliance Duel and Full Preparedness"})).toBeVisible();
  await expect(page.locator("#event-results details.event-profile")).toHaveCount(16);
  await page.getByLabel("Search events").fill("bullseye");
  await expect(page.getByRole("heading",{name:"Shooting Loot / Bullseye (Booty)"})).toBeVisible();
  await expect(page.locator("#event-results details.event-profile")).toHaveCount(1);
  await page.getByLabel("Search events").fill("canyon");
  await expect(page.getByRole("heading",{name:"Canyon Clash"})).toBeVisible();
  await page.getByRole("heading",{name:"Canyon Clash"}).click();
  await expect(page.getByText("Participation and eligibility")).toBeVisible();
  await expect(page.getByText("F2P strategy")).toBeVisible();
  await page.screenshot({path:path.join(artifacts,"event-profile-detail.png"),fullPage:true});
  await page.getByLabel("Event type").selectOption("Rewards");
  await page.getByLabel("Search events").fill("");
  await expect(page.getByRole("heading",{name:"Canyon Clash"})).toHaveCount(0);
  await expect(page.getByRole("heading",{name:"Shooting Loot / Bullseye (Booty)"})).toBeVisible();
  await page.getByLabel("Search events").fill("");
  await page.getByLabel("Event type").selectOption("");
  await page.screenshot({path:path.join(artifacts,"events-desktop.png"),fullPage:true});
});

test("public knowledge data contains no external source URLs or unverified numeric claims", async ({ request }) => {
  for (const [file,key] of [["heroes","heroes"],["troops","classes"],["events","events"]]) {
    const response=await request.get("/data/"+file+".json");
    expect(response.ok()).toBeTruthy();
    const data=await response.json();
    expect(data.schemaVersion).toBe(key==="heroes"?3:2);
    expect(Array.isArray(data[key])).toBeTruthy();
    expect(JSON.stringify(data)).not.toMatch(/https?:\/\//i);
  }
  const troopData=await (await request.get("/data/troops.json")).json();
  expect(troopData.classes).toHaveLength(3);
  expect(troopData.classes.every(c=>c.tiers.length===10)).toBeTruthy();
  expect(troopData.classes.every(c=>c.tiers.every(t=>t.trainingCost===undefined && t.promotionCost===undefined && t.trainingTime===undefined && t.campLevel===undefined && t.attack===undefined && t.defense===undefined && t.hp===undefined && t.power===undefined && t.load===undefined))).toBeTruthy();
  expect(troopData.tierUnlocks).toEqual([]);
  const eventData=await (await request.get("/data/events.json")).json();
  expect(eventData.events).toHaveLength(16);
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
  await expect(page.getByText("No guides match this search")).toBeVisible();
});

test("published quick-start guide records retain dated sources and safe internal destinations", async ({ request }) => {
  const response=await request.get("/data/guides.json");
  expect(response.ok()).toBeTruthy();
  const data=await response.json();
  expect(data.schemaVersion).toBe(1);
  expect(data.entries).toHaveLength(7);
  expect(new Set(data.entries.map(entry=>entry.id)).size).toBe(7);
  for(const entry of data.entries){
    expect(entry.status).toBe("published");
    expect(entry.verifiedAt).toMatch(/^2026-11-\d{2}$/);
    expect(["beginner","research","heroes","events"]).toContain(entry.category);
    expect(entry.url).toMatch(/^[a-z0-9._-]+(?:#[a-z0-9_-]+)?$/i);
    expect(entry.sources.length).toBeGreaterThan(0);
    expect(entry.sources.every(source=>source.name&&source.checkedAt&&source.note&&["official","in-game","community","internal-tool-review"].includes(source.type))).toBeTruthy();
  }
});

test("research database search filters and expands only matching technologies", async ({ page }) => {
  await page.goto("/research.html");
  await page.getByLabel("Search research").fill("Laboratory");
  await expect(page.locator(".research-tree-card:visible").first()).toBeVisible();
  await page.getByLabel("Search research").fill("Alliance Recognition");
  await expect(page.locator(".research-tree-card:visible")).toHaveCount(1);
  await expect(page.locator(".research-tree-card:visible summary h3")).toHaveText("Alliance Recognition");
  await expect(page.locator(".research-tree-card:visible")).toHaveAttribute("open", "");
});
test("formation builder selects, replaces, swaps, removes and filters verified heroes", async ({ page }) => {
  await page.goto("/heroes.html");
  await expect(page.locator(".formation-slot")).toHaveCount(5);
  await page.locator(".formation-slot").nth(0).click();
  await page.locator("#builder-search").fill("Katrina");
  await page.getByRole("button", { name: /Katrina/ }).click();
  await expect(page.locator(".formation-slot").nth(0)).toContainText("Katrina");
  await expect(page.locator("#hero-intel")).toContainText("Hero quick intel · Katrina");
  await page.screenshot({path:path.join(artifacts,"formation-builder-selected.png"),fullPage:true});
  await page.locator(".formation-slot").nth(1).click();
  await page.locator("#builder-search").fill("Sophia");
  await page.getByRole("button", { name: /Sophia/ }).click();
  await page.locator(".formation-slot").nth(0).click();
  await page.locator("#builder-search").fill("Sophia");
  await page.locator(".builder-hero").filter({hasText:"Sophia"}).click();
  await expect(page.locator(".formation-slot").nth(0)).toContainText("Sophia");
  await expect(page.locator(".formation-slot").nth(1)).toContainText("Katrina");
  await page.locator(".formation-slot").nth(0).click();
  await page.locator("#builder-search").fill("Angelina");
  await page.locator(".builder-hero").filter({hasText:"Angelina"}).click();
  await expect(page.locator(".formation-slot").nth(0)).toContainText("Angelina");
  await page.locator(".slot-remove").nth(0).click();
  await expect(page.locator(".formation-slot").nth(0)).toContainText("Choose hero");
  await page.locator("#builder-search").fill("Katrina");
  await expect(page.locator("#builder-results .builder-hero[aria-pressed=true]")).toHaveCount(1);
  await page.locator("#builder-search").fill("");
  await page.locator("#builder-faction").selectOption("Wings of Dawn");
  await expect(page.locator(".builder-hero:not(:disabled)")).toHaveCount(11);
  await expect(page.getByText("Jack", { exact: true })).toHaveCount(0);
});

test("mixed-faction analysis explains pair signals, troop fit and counter matchups", async ({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto("/heroes.html");
 await page.locator(".formation-slot").nth(0).click();await page.locator("#builder-search").fill("Bella");await page.getByRole("button",{name:/Bella/}).click();
 await page.locator(".formation-slot").nth(1).click();await page.locator("#builder-search").fill("Licia");await page.getByRole("button",{name:/Licia/}).click();
 await page.locator(".formation-slot").nth(2).click();await page.locator("#builder-search").fill("Scarlett");await page.getByRole("button",{name:/Scarlett/}).click();
 await expect(page.locator("#formation-advice")).toContainText("Mixed-faction formation");
 await expect(page.locator("#formation-advice")).toContainText("Bella + Licia");
 await page.getByLabel("March troop line").selectOption("Shooters");
 await expect(page.locator("#formation-advice")).toContainText("Check troop-specific passives");
 await page.getByLabel("Opponent faction").selectOption("Guard of Order");
 await expect(page.locator("#formation-advice")).toContainText("Blood Rose is the community-listed counter");
 await page.screenshot({path:path.join(artifacts,"formation-mixed-feedback-mobile.png"),fullPage:true});
 await page.locator(".hero-preset-disclosure > summary").click();
 await page.getByRole("button",{name:/Clear formation/}).click();
 await expect(page.locator("#formation-advice")).toContainText("Add heroes to compare");
});
test("source-backed faction presets populate named examples",async({page})=>{
 await page.goto("/heroes.html");
 await page.locator(".hero-preset-disclosure > summary").click();
 await page.getByRole("button",{name:/Blood Rose.*SIN Command example/}).click();
 await expect(page.locator(".formation-slot").nth(0)).toContainText("Bella");
 await expect(page.locator(".formation-slot").nth(3)).toContainText("Licia");
 await page.getByRole("button",{name:/Wings of Dawn.*SIN Command example/}).click();
 await expect(page.locator(".formation-slot").nth(0)).toContainText("Laura");
 await expect(page.locator(".formation-slot").nth(3)).toContainText("Liliana");
});
test("GitHub Pages project subpath resolves scripts, styles and JSON data", async ({ page }) => {
  const alias=path.join(process.cwd(),"lz-carry-guide");
  let created=false;
  try { fs.symlinkSync(process.cwd(),alias,"dir"); created=true; }
  catch(e) { if(e.code!=="EEXIST") throw e; }
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  const failed=[];
  page.on("requestfailed",r=>failed.push(r.url()));
  try {
    await page.goto("/lz-carry-guide/research.html");
    await expect(page.getByLabel("Search research")).toBeVisible();
    await page.getByLabel("Search research").fill("Alliance Recognition");
    await expect(page.locator(".research-tree-card:visible")).toHaveCount(1);
    await page.goto("/lz-carry-guide/heroes.html");
    await expect(page.locator("#builder-results .hero-directory-item")).toHaveCount(12);
    await page.getByRole("button", { name: /Show more heroes/ }).click();
    await page.getByRole("button", { name: /Show more heroes/ }).click();
    await expect(page.locator("#builder-results .hero-directory-item")).toHaveCount(36);
    await expect(page.locator("#builder-results .builder-hero:not(:disabled)")).toHaveCount(33);
    await page.goto("/lz-carry-guide/events.html");
    await expect(page.locator("#event-results details.event-profile")).toHaveCount(16);
    expect(errors).toEqual([]);
    expect(failed).toEqual([]);
  } finally {
    if(created) fs.unlinkSync(alias);
  }
});

test("universal search indexes pages and structured game databases", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const target of pages) {
    await page.goto("/" + target);
    await expect(page.getByRole("button", { name: "Search the entire LZ Carry website" })).toBeVisible();
  }
  await page.goto("/heroes.html");
  await page.getByRole("button", { name: "Search the entire LZ Carry website" }).click();
  const search = page.getByRole("searchbox", { name: "Search all LZ Carry content" });
  await search.fill("Bella");
  await expect(page.locator(".universal-search-result-title", { hasText: "Bella" }).first()).toBeVisible();
  await expect(page.locator(".universal-search-result").first()).toHaveAttribute("href", /heroes\.html/);
  await search.fill("Alliance Recognition");
  await expect(page.locator(".universal-search-result-title", { hasText: "Alliance Recognition" }).first()).toBeVisible();
  await expect(page.locator(".universal-search-result").filter({ hasText: "Alliance Recognition" }).first()).toHaveAttribute("href", /research\.html/);
  await search.fill("Canyon Clash");
  await expect(page.locator(".universal-search-result-title", { hasText: "Canyon Clash" }).first()).toBeVisible();
  await expect(page.locator(".universal-search-result[href*=\"events.html\"]").filter({ hasText: "Canyon Clash" }).first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".universal-search-dialog")).not.toBeVisible();
});

test("knowledge pages contain no stray escaped newline text", async ({ page }) => {
  for (const target of ["/heroes.html", "/events.html"]) {
    await page.goto(target);
    const bodyText = await page.locator("body").innerText();
    expect(bodyText, target).not.toContain("\\n");
  }
});

test("hero formation controls remain usable on narrow mobile screens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/heroes.html");
  const search = page.locator("#builder-search");
  const searchBox = await search.boundingBox();
  expect(searchBox.width).toBeGreaterThanOrEqual(300);
  const add = page.locator("#builder-results .builder-hero:not(:disabled)").first();
  const addBox = await add.boundingBox();
  expect(addBox.width).toBeGreaterThanOrEqual(300);
  await expect(add).toHaveCSS("white-space", "nowrap");
  const pageWidth = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
  expect(pageWidth.page).toBeLessThanOrEqual(pageWidth.viewport + 1);
});

test("canonical evidence labels distinguish verified and community claims", async ({ page }) => {
  await page.goto("/heroes.html");
  const mapped = await page.evaluate(() => {
    const status = window.LZCarryDataStatus;
    return {
      verified: status.normalize({ status: "verified", method: "current in-game client" }),
      community: status.normalize("community-indexed; current in-game confirmation pending"),
      candidate: status.normalize("community-candidate"),
      estimated: status.normalize("estimated from published source values"),
      outdated: status.normalize("outdated")
    };
  });
  expect(mapped).toEqual({
    verified: "verified",
    community: "community-supported",
    candidate: "unconfirmed",
    estimated: "estimated",
    outdated: "outdated"
  });
  await page.getByRole("button", { name: "Search the entire LZ Carry website" }).click();
  const search = page.getByRole("searchbox", { name: "Search all LZ Carry content" });
  await search.fill("Bella");
  await expect(page.locator(".universal-search-result-status", { hasText: "Community-supported" }).first()).toBeVisible();
  await search.fill("HQ 35");
  const hq = page.locator('.universal-search-result[href*="beginner.html"]').filter({ hasText: "HQ 35 upgrade" }).first();
  await expect(hq.locator(".universal-search-result-status")).toHaveText("Unconfirmed");
  await search.fill("Canyon Clash");
  const event = page.locator('.universal-search-result[href*="events.html"]').filter({ hasText: "Canyon Clash" }).first();
  await expect(event.locator(".universal-search-result-status")).toHaveText("Community-supported");
});

test("player progress can be exported and safely imported across planners", async ({ page }) => {
  await page.goto("/heroes.html");
  await page.evaluate(() => {
    localStorage.setItem("lzcarry-formation-library-v1", JSON.stringify([{ id: "test-formation", name: "Test formation", heroes: ["Bella", null, null, null, null] }]));
    localStorage.setItem("lzcarry:hq-planner:v2", JSON.stringify({ "35:0": true }));
    localStorage.setItem("lzcarry-research-plan-v1", JSON.stringify({ "New Home": "Done" }));
    localStorage.setItem("lzcarry-event-prep-v2", JSON.stringify({ "20261110-Research-0": true }));
    localStorage.setItem("lzcarry-event-checklists-v1", JSON.stringify({ "alliance-duel": { "0": true } }));
    localStorage.setItem("lzcarry-event-reminders-v1", JSON.stringify([{ id: "reminder-1", name: "Alliance Duel", when: "2026-11-12T18:00:00.000Z", note: "Check the live task panel" }]));
    localStorage.setItem("lzcarry-hq-resource-check-v1", JSON.stringify({ food: "120", wood: "80", zent: "10", steel: "5" }));
    localStorage.setItem("lzcarry-speedup-plan-v1", JSON.stringify({ "speedup-task": "Research", "speedup-days": "1", "speedup-hours": "2", "speedup-minutes": "30", "speedup-available": "600" }));
    localStorage.setItem("lzcarry-hero-investment-compare-v1", JSON.stringify({ a: "audrey", b: "ava", "hero-compare-a-current": "45" }));
  });
  await page.getByRole("button", { name: "Manage saved LZ Carry progress" }).click();
  await expect(page.getByText(/9 of 13 saved data sets found/)).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export my progress" }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  let json = "";
  for await (const chunk of stream) json += chunk.toString();
  const backup = JSON.parse(json);
  expect(backup.format).toBe("lz-carry-player-data");
  expect(backup.schemaVersion).toBe(1);
  expect(backup.data["lzcarry-formation-library-v1"][0].name).toBe("Test formation");
  expect(backup.data["lzcarry:hq-planner:v2"]["35:0"]).toBe(true);
  expect(backup.data["lzcarry-event-reminders-v1"][0].name).toBe("Alliance Duel");
  expect(backup.data["lzcarry-event-checklists-v1"]["alliance-duel"]["0"]).toBe(true);
  expect(backup.data["lzcarry-hq-resource-check-v1"].food).toBe("120");
  expect(backup.data["lzcarry-speedup-plan-v1"]["speedup-available"]).toBe("600");
  expect(backup.data["lzcarry-hero-investment-compare-v1"].a).toBe("audrey");

  await page.evaluate(() => localStorage.setItem("lzcarry:hq-planner:v2", JSON.stringify({ "35:0": false })));
  page.on("dialog", dialog => dialog.accept());
  await page.locator(".player-data-file").setInputFiles({
    name: "lz-carry-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup))
  });
  await expect(page.locator(".player-data-summary")).toContainText("Progress imported successfully");
  const restored = await page.evaluate(() => ({
    hq: JSON.parse(localStorage.getItem("lzcarry:hq-planner:v2")),
    research: JSON.parse(localStorage.getItem("lzcarry-research-plan-v1")),
    rollback: JSON.parse(localStorage.getItem("lzcarry-player-data-rollback-v1")),
    reminders: JSON.parse(localStorage.getItem("lzcarry-event-reminders-v1")),
    hqResources: JSON.parse(localStorage.getItem("lzcarry-hq-resource-check-v1"))
  }));
  expect(restored.hq["35:0"]).toBe(true);
  expect(restored.research["New Home"]).toBe("Done");
  expect(restored.reminders[0].name).toBe("Alliance Duel");
  expect(restored.hqResources.food).toBe("120");
  expect(restored.rollback.values["lzcarry:hq-planner:v2"]).toContain("false");
});

test("progress manager is available on every primary page and fits mobile screens", async ({ page }) => {
  for (const target of pages) {
    await page.setViewportSize({ width: 320, height: 780 });
    await page.goto("/" + target);
    await expect(page.getByRole("button", { name: "Manage saved LZ Carry progress" })).toBeVisible();
    const size = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
    expect(size.page, target + " mobile progress manager").toBeLessThanOrEqual(size.viewport + 1);
  }
});

test("Player Dashboard summarizes local progress and links to existing planners", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/dashboard.html");
  await expect(page.getByRole("heading", { name: "Player Dashboard" })).toBeVisible();
  await expect(page.getByText(/does not connect to your game account/i)).toBeVisible();
  await page.locator("#dashboard-hq").selectOption("25");
  await page.getByRole("button", { name: "Save account progress" }).click();
  await expect(page.locator("#dashboard-hq-value")).toHaveText("HQ 25");
  await page.evaluate(() => {
    localStorage.setItem("lzcarry-formation-library-v1", JSON.stringify([{ id: "one", name: "Saved lineup", heroes: ["Bella"] }]));
    localStorage.setItem("lzcarry-research-plan-v1", JSON.stringify({ "New Home": "Done", "Shelter Building": "In progress" }));
    localStorage.setItem("lzcarry-troop-plan-v1", JSON.stringify({ classId: "assaulters", tier: "10", current: 120, target: 200 }));
    localStorage.setItem("lzcarry-event-checklists-v1", JSON.stringify({ "alliance-duel": { "0": true, "1": true } }));
  });
  await page.reload();
  await expect(page.locator("#dashboard-formation-value")).toHaveText("1");
  await expect(page.locator("#dashboard-hero-value")).toHaveText("1");
  await expect(page.locator("#dashboard-research-value")).toHaveText("1 / 2");
  await expect(page.locator("#dashboard-troop-value")).toHaveText("Assaulters T10");
  await expect(page.locator("#dashboard-event-value")).toHaveText("2");
  await expect(page.locator("#dashboard-recommendations")).toContainText("Review your saved formations");
  await page.locator(".dashboard-more-recommendations > summary").click();
  await expect(page.locator('a[href="heroes.html#formation-builder"]').first()).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "player-dashboard-desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(artifacts, "player-dashboard-mobile.png"), fullPage: true });
});

test("Beginner Mode checklist resumes and resets saved steps", async ({ page }) => {
  await page.goto("/beginner.html");
  await expect(page.getByRole("heading", { name: "Your first progression path" })).toBeVisible();
  await page.locator('[data-step="account"]').check();
  await page.locator('[data-step="hq"]').check();
  await expect(page.locator("#beginner-progress-text")).toHaveText("2 of 5 steps complete");
  await page.reload();
  await expect(page.locator('[data-step="account"]')).toBeChecked();
  await expect(page.locator("#beginner-progress-text")).toHaveText("2 of 5 steps complete");
  page.on("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Reset checklist" }).click();
  await expect(page.locator("#beginner-progress-text")).toHaveText("0 of 5 steps complete");
});

test("research resource calculator compares player-entered costs and persists inputs", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/research.html");
  const input = (resource, kind) => page.locator('[data-resource="' + resource + '"][data-kind="' + kind + '"]');
  await input("food", "available").fill("100");
  await input("food", "cost").fill("150");
  await input("wood", "available").fill("200");
  await input("wood", "cost").fill("150");
  await expect(page.locator("#research-resource-results")).toContainText("Short by 50");
  await expect(page.locator("#research-resource-results")).toContainText("Covered · 50 remaining");
  await page.locator("#research-resource-calculator").screenshot({ path: path.join(artifacts, "research-resource-calculator.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#research-resource-calculator").screenshot({ path: path.join(artifacts, "research-resource-calculator-mobile.png") });
  await page.reload();
  await expect(input("food", "available")).toHaveValue("100");
  await expect(input("food", "cost")).toHaveValue("150");
  await page.getByRole("button", { name: "Clear calculator" }).click();
  await expect(input("food", "available")).toHaveValue("");
});

test("troop target planner tracks a player-entered goal without inventing costs", async ({ page }) => {
  await page.goto("/heroes.html");
  await page.locator("#troop-progress-planner .hero-advanced-disclosure > summary").click();
  await expect(page.locator('#troop-plan-class option[value="assaulters"]')).toHaveCount(1);
  await page.locator("#troop-plan-class").selectOption("assaulters");
  await page.locator("#troop-plan-tier").selectOption("10");
  await page.locator("#troop-plan-current").fill("120");
  await page.locator("#troop-plan-target").fill("200");
  await expect(page.locator("#troop-plan-result")).toContainText("80 more units needed");
  await expect(page.locator("#troop-plan-result")).toContainText("quantity gap only");
  await page.reload();
  await page.locator("#troop-progress-planner .hero-advanced-disclosure > summary").click();
  await expect(page.locator("#troop-plan-class")).toHaveValue("assaulters");
  await expect(page.locator("#troop-plan-tier")).toHaveValue("10");
  await expect(page.locator("#troop-plan-current")).toHaveValue("120");
  await expect(page.locator("#troop-plan-target")).toHaveValue("200");
  await expect(page.locator(".troop-tier-row").first()).toContainText("Name evidence");
});

test("beginner progression guide provides six usable linked learning steps", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/beginner.html");
  await page.locator(".beginner-reference-disclosure > summary").click();
  await expect(page.getByRole("heading", { name: "A practical progression guide" })).toBeVisible();
  const steps = page.locator(".beginner-guide-card");
  await expect(steps).toHaveCount(6);
  await expect(steps.nth(0)).toHaveAttribute("open", "");
  await steps.nth(1).locator("summary").click();
  await expect(steps.nth(1)).toHaveAttribute("open", "");
  await expect(steps.nth(1)).toContainText("in-game upgrade panel");
  await expect(steps.nth(2).locator('a[href="research.html#lab-planner"]')).toHaveAttribute("href", "research.html#lab-planner");
  await expect(steps.nth(3).locator('a[href="heroes.html#formation-lab"]')).toHaveAttribute("href", "heroes.html#formation-lab");
  await expect(steps.nth(5).locator('a[href="events.html#event-prep-planner"]')).toHaveAttribute("href", "events.html#event-prep-planner");
  const size = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
  expect(size.page).toBeLessThanOrEqual(size.viewport + 1);
});

test("Lucky Rose tracker separates community candidates from in-game verification", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/events.html#lucky-rose-tracker");
  await expect(page.getByRole("heading", { name: "Lucky Rose Tracker" })).toBeVisible();
  const current = page.locator("#lucky-rose-current");
  await expect(current).toContainText("Week of 2026-11-09");
  await expect(current.locator(".lucky-rose-number")).toHaveText("#5");
  await expect(current).toContainText("+20% Research Speed");
  await expect(current).toContainText("2 hours");
  await expect(current.locator(".evidence-badge")).toContainText("Community-supported");
  await expect(current.locator(".evidence-badge")).not.toContainText("Verified");
  await expect(current.locator("a[href*='lastz.gg']")).toBeVisible();
  await expect(current.locator("a[href*='ztools.co.uk']")).toBeVisible();
  await page.locator("#lucky-rose-tracker .lucky-rose-reference-disclosure > summary").click();
  await expect(page.locator("#lucky-rose-scope-note")).toContainText("sender-only");
  await expect(page.locator("#lucky-rose-history .lucky-rose-history-row")).toHaveCount(2);
  const size = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
  expect(size.page).toBeLessThanOrEqual(size.viewport + 1);
});

test("universal search indexes Lucky Rose candidates and evidence status", async ({ page }) => {
  await page.goto("/events.html");
  await page.getByRole("button", { name: "Search the entire LZ Carry website" }).click();
  const search = page.getByRole("searchbox", { name: "Search all LZ Carry content" });
  await search.fill("2026-11-09");
  const result = page.locator(".universal-search-result").filter({ hasText: "Lucky Rose" }).first();
  await expect(result).toBeVisible();
  await expect(result).toHaveAttribute("href", /events\.html#lucky-rose-tracker/);
  await expect(result.locator(".universal-search-result-status")).toHaveText("Community-supported");
});

test("canonical evidence labels appear on hero, research, HQ and event records", async ({ page }) => {
  await page.goto("/heroes.html");
  await expect(page.locator("#builder-results .hero-directory-item .evidence-badge").first()).toBeVisible();
  await page.locator("#troop-database .hero-advanced-disclosure > summary").click();
  await expect(page.locator(".troop-tier-row .troop-evidence-badge").first()).toBeVisible();
  await page.goto("/research.html");
  await expect(page.locator(".lab-plan-item .evidence-badge").first()).toHaveText("Community-supported");
  await page.addInitScript(() => { localStorage.removeItem("lzcarry-player-profile-v1"); localStorage.removeItem("lzcarry:hq-planner:v2"); });
  await page.goto("/beginner.html");
  await page.locator("#hq-current").selectOption("1");
  await page.locator("#hq-target").selectOption("15");
  await expect(page.locator("#hq-steps")).toContainText("HQ 2");
  await expect(page.locator(".hq-step .evidence-badge").first()).toHaveText("Unconfirmed");
  await page.goto("/events.html");
  await expect(page.locator(".event-profile .evidence-badge").first()).toHaveText("Community-supported");
  await page.getByLabel("Search events").fill("shooting loot");
  await expect(page.locator(".event-profile .evidence-badge").first()).toHaveText("Unconfirmed");
});

test("dashboard and HQ planner share the player's saved current HQ level", async ({ page }) => {
  await page.addInitScript(() => { if (!localStorage.getItem("lzcarry-player-profile-v1")) localStorage.setItem("lzcarry-player-profile-v1", JSON.stringify({ currentHq: 20 })); });
  await page.goto("/beginner.html#hq-planner-section");
  await expect(page.locator("#hq-current")).toHaveValue("20");
  await page.locator("#hq-current").selectOption("21");
  await page.reload();
  await expect(page.locator("#hq-current")).toHaveValue("21");
  await page.goto("/dashboard.html");
  await expect(page.locator("#dashboard-hq")).toHaveValue("21");
  await expect(page.locator("#dashboard-hq-value")).toHaveText("HQ 21");
});

test("dashboard stores personal event reminders without implying an official schedule", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard.html");
  await page.locator("#dashboard-reminder-name").fill("Alliance Duel");
  await page.locator("#dashboard-reminder-when").fill("2026-11-12T18:00");
  await page.locator("#dashboard-reminder-note").fill("Confirm the live task before spending");
  await page.getByRole("button", { name: "Add reminder" }).click();
  await expect(page.locator("#dashboard-reminder-list")).toContainText("Alliance Duel");
  await expect(page.locator("#dashboard-reminder-list")).toContainText("Confirm the live task before spending");
  await expect(page.locator("#dashboard-reminder-value")).toHaveText("1");
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("lzcarry-event-reminders-v1")));
  expect(saved).toHaveLength(1);
  expect(saved[0].name).toBe("Alliance Duel");
  await page.getByRole("button", { name: "Remove reminder for Alliance Duel" }).click();
  await expect(page.locator("#dashboard-reminder-value")).toHaveText("0");
  const size = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
  expect(size.page).toBeLessThanOrEqual(size.viewport + 1);
});


test("HQ resource calculator compares saved holdings with selected published totals", async ({ page }) => {
  await page.goto("/beginner.html#hq-planner-section");
  await page.locator("#hq-current").selectOption("1");
  await page.locator("#hq-target").selectOption("15");
  const calculator = page.locator(".hq-resource-availability");
  await expect(calculator).toBeVisible();
  const food = calculator.locator('[data-hq-resource="food"]');
  await food.fill("0");
  await expect(calculator.locator(".hq-resource-results")).toContainText("Short by");
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("lzcarry-hq-resource-check-v1")));
  expect(saved.food).toBe("0");
  await page.reload();
  await page.locator("#hq-current").selectOption("1");
  await page.locator("#hq-target").selectOption("15");
  await expect(page.locator('.hq-resource-availability [data-hq-resource="food"]')).toHaveValue("0");
});


test("primary pages expose names for interactive controls and text alternatives", async ({ page }) => {
  for (const target of pages) {
    await page.goto("/" + target, { waitUntil: "domcontentloaded" });
    const issues = await page.evaluate(() => {
      const controls = Array.from(document.querySelectorAll('button, input:not([type="hidden"]), select, textarea, a[href]'));
      return controls.filter(el => {
        if (el.closest('[aria-hidden="true"]')) return false;
        const tag = el.tagName.toLowerCase();
        if (tag === "input" || tag === "select" || tag === "textarea") {
          return !(el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || (el.labels && el.labels.length));
        }
        return !(el.getAttribute("aria-label") || el.getAttribute("title") || (el.textContent || "").trim());
      }).map(el => ({ tag: el.tagName, type: el.getAttribute("type"), id: el.id, href: el.getAttribute("href") }));
    });
    expect(issues, "unnamed controls on " + target).toEqual([]);
    const images = await page.locator("img").evaluateAll(nodes => nodes.filter(img => !img.hasAttribute("alt")).map(img => img.src));
    expect(images, "images missing alt text on " + target).toEqual([]);
    await expect(page.locator("html")).toHaveAttribute("lang", /.+/);
  }
});

test("universal search is keyboard accessible and returns focus safely", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const search = page.getByRole("searchbox", { name: "Search all LZ Carry content" });
  await expect(search).toBeFocused();
  await search.fill("HQ 35");
  await expect(page.locator(".universal-search-result").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});



test("beginner formation CTA targets the existing Hero Formation Lab section at desktop and mobile", async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 375, height: 812 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/beginner.html");
    const cta = page.getByRole("link", { name: "Build a formation" });
    await expect(cta).toHaveAttribute("href", "heroes.html#formation-lab");
    await cta.click();
    await expect(page).toHaveURL(/heroes\.html#formation-lab$/);
    await expect(page.locator("#formation-lab")).toBeVisible();
  }
});

 
test("homepage desktop navigation keeps the brand, links, search and progress controls separate", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.locator(".home-page .brand")).toBeVisible();
  await expect(page.locator('header nav[aria-label="Main navigation"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Manage saved LZ Carry progress" })).toBeVisible();
  const overlaps = await page.evaluate(() => {
    const header = document.querySelector("header");
    const nav = header && header.querySelector('nav[aria-label="Main navigation"]');
    const nodes = [
      header && header.querySelector(".brand"),
      ...(nav ? Array.from(nav.querySelectorAll("a,button")) : []),
      header && header.querySelector(".player-data-trigger")
    ].filter(node => node && node.getClientRects().length);
    const rects = nodes.map(node => ({ label: node.getAttribute("aria-label") || node.textContent.trim(), rect: node.getBoundingClientRect().toJSON() }));
    const collisions = [];
    for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i].rect, b = rects[j].rect;
      if (Math.min(a.right,b.right)-Math.max(a.left,b.left)>1 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1) collisions.push([rects[i].label,rects[j].label]);
    }
    return collisions;
  });
  expect(overlaps, "homepage navigation controls must not visually overlap").toEqual([]);
});


test("guide directory exposes original tool walkthroughs with expandable source notes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/guides.html");
  await expect(page.getByText("7 published guides")).toBeVisible();
  await expect(page.locator("#guide-results article")).toHaveCount(7);
  const categories = page.locator(".guide-category-disclosure");
  await expect(categories).not.toHaveAttribute("open", "");
  await categories.locator(":scope > summary").click();
  await expect(categories).toHaveAttribute("open", "");
  await page.getByLabel("Search written guides").fill("speedup");
  await expect(page.locator("#guide-results article")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Estimate timer coverage with speedups" })).toBeVisible();
  const source = page.locator("#guide-results .guide-source-note").first();
  await expect(source).not.toHaveAttribute("open", "");
  await source.locator("summary").click();
  await expect(source).toContainText("LZ Carry Speedup Planner");
  await expect(page.locator('#guide-results a[href="dashboard.html#speedup-planner"]')).toBeVisible();
  const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport + 1);
});
