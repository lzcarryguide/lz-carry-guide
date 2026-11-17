const { defineConfig } = require("@playwright/test");
module.exports = defineConfig({
  testDir: "./tests",
  testMatch: "**/cloudflare-live-delivery.spec.js",
  timeout: 45000,
  reporter: [["list"], ["html", { outputFolder: "artifacts/live-analytics-report", open: "never" }]],
  use: {
    baseURL: "https://lzcarryguide.github.io/lz-carry-guide/",
    browserName: "chromium"
  }
});
