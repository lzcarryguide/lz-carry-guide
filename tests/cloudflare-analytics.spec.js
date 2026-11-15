const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");

const pages = [
  "index.html",
  "guides.html",
  "beginner.html",
  "dashboard.html",
  "research.html",
  "flowers-count.html",
  "pilot.html"
];
const token = "97e4ffc3f5e84e6387c02ef53bdf981c";
const src = "https://static.cloudflareinsights.com/beacon.min.js";

test("Cloudflare Web Analytics is installed exactly once before body close on every public page", () => {
  for (const page of pages) {
    const html = fs.readFileSync(path.join(process.cwd(), page), "utf8");
    const occurrences = html.match(/https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js/g) || [];
    expect(occurrences, page + " beacon count").toHaveLength(1);
    expect(html, page + " module script").toContain("<script type='module' src='" + src + "'");
    expect(html, page + " unchanged token").toContain('data-cf-beacon=\'{"token": "' + token + '"}\'');
    expect(html, page + " script before body close").toMatch(/<!-- Cloudflare Web Analytics -->[\s\S]*?<script type='module' src='https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js'[\s\S]*?<\/script>[\s\S]*?<!-- End Cloudflare Web Analytics -->\s*<\/body>/i);
  }
});
