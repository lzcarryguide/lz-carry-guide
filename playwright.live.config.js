const { defineConfig } = require("@playwright/test");
const configuredUrl = process.env.LZCARRY_LIVE_URL || "https://lzcarryguide.github.io/lz-carry-guide/";
const liveBaseUrl = configuredUrl.endsWith("/") ? configuredUrl : configuredUrl + "/";
module.exports = defineConfig({
  testDir: "./tests",
  testMatch: "live-site.spec.js",
  timeout: 600000,
  reporter: [["list"], ["html", { outputFolder: "artifacts/live-report", open: "never" }]],
  use: {
    baseURL: liveBaseUrl,
    browserName: "chromium",
    screenshot: "only-on-failure"
  }
});
