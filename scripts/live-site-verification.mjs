import { chromium, request as playwrightRequest } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'https://lzcarryguide.github.io/lz-carry-guide/';
const PAGES = [
  { file: 'index.html', selectors: ['h1', '.home-video', '.home-feature-card'] },
  { file: 'guides.html', selectors: ['h1', '#guide-search', '#guide-category', '#guide-results'] },
  { file: 'beginner.html', selectors: ['h1', '#hq-planner-section', '#hq-current', '#hq-target'] },
  { file: 'research.html', selectors: ['h1', '#tree-map', '#lab-planner', '#research-resource-calculator'] },
  { file: 'heroes.html', selectors: ['h1', '#formation-lab', '#formation-library', '#troop-progress-planner'] },
  { file: 'events.html', selectors: ['h1', '#event-directory', '#event-prep-planner', '#weekly-cycle'] },
  { file: 'pilot.html', selectors: ['h1', '#packages', '#contact'] }
];
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 375, height: 812 }
];
const outDir = 'artifacts/live-site';
fs.mkdirSync(outDir, { recursive: true });
const results = [];
const linkCache = new Map();
const browser = await chromium.launch({ headless: true });
const http = await playwrightRequest.newContext({
  ignoreHTTPSErrors: true,
  timeout: 20000,
  extraHTTPHeaders: { 'User-Agent': 'LZCarry-PostDeployment-Verification/1.0' }
});

async function checkLink(raw, currentUrl) {
  let u;
  try { u = new URL(raw, currentUrl); } catch { return { href: raw, status: 'invalid-url' }; }
  if (['mailto:', 'tel:', 'javascript:', 'data:'].includes(u.protocol)) return null;
  const key = u.href;
  if (linkCache.has(key)) return linkCache.get(key);
  if (u.origin === new URL(BASE).origin && u.hash && u.pathname === new URL(currentUrl).pathname) {
    const r = { href: key, status: 'fragment-local' };
    linkCache.set(key, r);
    return r;
  }
  const fetchUrl = new URL(u.href);
  const fragment = fetchUrl.hash;
  fetchUrl.hash = '';
  try {
    const response = await http.get(fetchUrl.href, { timeout: 20000, maxRedirects: 5 });
    const r = { href: key, status: response.status(), finalUrl: response.url(), external: u.origin !== new URL(BASE).origin };
    if (fragment && u.origin === new URL(BASE).origin) {
      const html = await response.text();
      const id = decodeURIComponent(fragment.slice(1));
      r.fragmentFound = html.includes('id="' + id + '"') || html.includes("id='" + id + "'") || html.includes('name="' + id + '"') || html.includes("name='" + id + "'");
      if (!r.fragmentFound) r.status = 'missing-fragment';
    }
    linkCache.set(key, r);
    return r;
  } catch (e) {
    const r = { href: key, status: 'request-failed', error: String(e).slice(0, 240), external: u.origin !== new URL(BASE).origin };
    linkCache.set(key, r);
    return r;
  }
}

for (const item of PAGES) {
  for (const viewport of VIEWPORTS) {
    const url = new URL(item.file, BASE).href;
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1 });
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    const badResponses = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', err => pageErrors.push(String(err)));
    page.on('requestfailed', req => failedRequests.push({ url: req.url(), error: req.failure()?.errorText || 'request failed' }));
    page.on('response', res => { if (res.status() >= 400) badResponses.push({ url: res.url(), status: res.status() }); });

    let httpStatus = null;
    let navigationError = null;
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
      httpStatus = response?.status() ?? null;
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
      await page.evaluate(async () => { await document.fonts.ready; });
      await page.waitForTimeout(800);
    } catch (e) {
      navigationError = String(e);
    }

    let snapshot = null;
    let linkResults = [];
    if (httpStatus && httpStatus < 400) {
      snapshot = await page.evaluate(() => {
        const nav = document.querySelector('nav[aria-label="Main navigation"]');
        const anchors = [...document.querySelectorAll('a[href]')].map(a => ({
          href: a.getAttribute('href'),
          text: (a.innerText || a.getAttribute('aria-label') || '').trim().slice(0, 100)
        }));
        const images = [...document.images].map(img => ({
          src: img.currentSrc || img.src,
          alt: img.alt,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        }));
        const backgrounds = [];
        for (const el of document.querySelectorAll('*')) {
          const value = getComputedStyle(el).backgroundImage;
          if (value && value !== 'none') {
            for (const m of value.matchAll(/url\(["']?(.*?)["']?\)/g)) backgrounds.push(m[1]);
          }
        }
        return {
          title: document.title,
          h1: document.querySelector('h1')?.innerText?.trim() || null,
          bodyText: document.body.innerText.slice(0, 20000),
          viewportWidth: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth,
          fontFamily: getComputedStyle(document.body).fontFamily,
          fontInterAvailable: document.fonts.check('12px Inter'),
          navExists: !!nav,
          navVisible: !!nav && !!(nav.offsetWidth || nav.offsetHeight),
          navLinkCount: nav?.querySelectorAll('a').length || 0,
          navCurrent: nav?.querySelector('a[aria-current="page"]')?.getAttribute('href') || null,
          navScrollWidth: nav?.scrollWidth || 0,
          navClientWidth: nav?.clientWidth || 0,
          navLastLinkText: nav?.querySelector('a:last-child')?.innerText?.trim() || null,
          anchors, images, backgrounds
        };
      });
      const required = item.selectors.map(selector => ({ selector, found: !!(await page.$(selector)) }));
      snapshot.required = required;
      if (viewport.name === 'mobile' && snapshot.navExists) {
        snapshot.mobileNav = await page.evaluate(() => {
          const nav = document.querySelector('nav[aria-label="Main navigation"]');
          if (!nav) return { usable: false };
          const last = nav.querySelector('a:last-child');
          nav.scrollTo({ left: nav.scrollWidth, behavior: 'instant' });
          const rect = last?.getBoundingClientRect();
          return {
            overflowX: getComputedStyle(nav).overflowX,
            canScrollHorizontally: nav.scrollWidth > nav.clientWidth + 1,
            lastLinkReachable: !!rect && rect.right <= innerWidth + 1 && rect.left >= 0,
            lastLinkText: last?.innerText?.trim() || null
          };
        });
      }
      const uniqueLinks = [...new Set(snapshot.anchors.map(a => a.href).filter(Boolean))];
      for (const href of uniqueLinks) {
        const result = await checkLink(href, url);
        if (result) linkResults.push(result);
      }
      await page.evaluate(() => {
        for (const img of document.images) img.loading = 'eager';
      });
      await page.waitForTimeout(700);
      snapshot.images = await page.evaluate(() => [...document.images].map(img => ({ src: img.currentSrc || img.src, alt: img.alt, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight })));
      snapshot.imageLoadFailures = snapshot.images.filter(i => !i.naturalWidth).map(i => i.src);
      snapshot.localFragmentFailures = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href')).filter(h => h.length > 1 && !document.getElementById(decodeURIComponent(h.slice(1)))));
    }

    const screenshot = path.join(outDir, item.file.replace('.html', '') + '-' + viewport.name + '.png');
    try { await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' }); } catch {}
    const result = {
      page: item.file,
      viewport: viewport.name,
      width: viewport.width,
      height: viewport.height,
      url,
      httpStatus,
      navigationError,
      title: snapshot?.title || null,
      h1: snapshot?.h1 || null,
      required: snapshot?.required || [],
      horizontalOverflow: snapshot ? (snapshot.documentWidth > snapshot.viewportWidth + 1 || snapshot.bodyWidth > snapshot.viewportWidth + 1) : null,
      navCurrent: snapshot?.navCurrent || null,
      navLinkCount: snapshot?.navLinkCount || 0,
      mobileNav: snapshot?.mobileNav || null,
      fontFamily: snapshot?.fontFamily || null,
      fontInterAvailable: snapshot?.fontInterAvailable ?? null,
      imageLoadFailures: snapshot?.imageLoadFailures || [],
      linkResults,
      consoleErrors,
      pageErrors,
      failedRequests,
      badResponses,
      screenshot
    };
    results.push(result);
    console.log(JSON.stringify(result));
    await page.close();
  }
}
await http.dispose();
await browser.close();

const report = {
  baseUrl: BASE,
  checkedAt: new Date().toISOString(),
  viewports: VIEWPORTS,
  pages: results,
  links: [...linkCache.values()]
};
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
const failures = [];
for (const r of results) {
  if (!r.httpStatus || r.httpStatus >= 400) failures.push(`${r.page} ${r.viewport}: page status/navigation failure`);
  if (r.required.some(x => !x.found)) failures.push(`${r.page} ${r.viewport}: required content selector missing`);
  if (r.horizontalOverflow) failures.push(`${r.page} ${r.viewport}: horizontal overflow`);
  if (!r.navCurrent) failures.push(`${r.page} ${r.viewport}: active navigation state missing`);
  if (r.imageLoadFailures.length) failures.push(`${r.page} ${r.viewport}: image load failures`);
  if (r.localFragmentFailures?.length) failures.push(`${r.page} ${r.viewport}: local fragment target missing`);
  if (r.consoleErrors.length || r.pageErrors.length || r.failedRequests.length || r.badResponses.length) failures.push(`${r.page} ${r.viewport}: browser console/network errors`);
  if (r.mobileNav && (!r.mobileNav.lastLinkReachable || !['auto','scroll'].includes(r.mobileNav.overflowX))) failures.push(`${r.page} mobile: navigation may not be scrollable/reachable`);
  if (r.linkResults.some(l => typeof l.status === 'number' && l.status >= 400 || l.status === 'request-failed' || l.status === 'missing-fragment')) failures.push(`${r.page} ${r.viewport}: broken/unreachable links`);
}
console.log('LIVE_SITE_SUMMARY ' + JSON.stringify({ totalPageViewportChecks: results.length, failedConditions: failures.length, failures, reportPath: path.join(outDir, 'report.json') }));
if (failures.length) process.exitCode = 1;
