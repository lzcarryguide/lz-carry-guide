#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(process.argv[2] || path.join(__dirname, "..", "data"));
const blocked = new Set(["draft", "in-review", "pending-review", "unpublished", "rejected", "needs-review"]);
const statusKeys = new Set(["publicationstatus", "editorialstatus", "publishstate"]);
const errors = [];
let checked = 0;

function walk(value, file, trail) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, file, trail + "[" + index + "]"));
    return;
  }
  if (!value || typeof value !== "object") return;
  Object.keys(value).forEach((key) => {
    const normalized = key.toLowerCase();
    const child = value[key];
    if (statusKeys.has(normalized) && typeof child === "string" && blocked.has(child.trim().toLowerCase().replace(/_/g, "-").replace(/\s+/g, "-"))) {
      errors.push(file + " " + trail + "." + key + " is '" + child + "'; draft/review-only content cannot ship in public data.");
    }
    if ((normalized === "ispublished" || normalized === "published") && child === false) {
      errors.push(file + " " + trail + "." + key + " is false; unpublished content cannot ship in public data.");
    }
    walk(child, file, trail ? trail + "." + key : key);
  });
}

function visit(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(full);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
      checked++;
      try { walk(JSON.parse(fs.readFileSync(full, "utf8")), path.relative(root, full), ""); }
      catch (error) { errors.push(path.relative(root, full) + " is not valid JSON: " + error.message); }
    }
  }
}

if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
  console.error("Public content directory not found: " + root);
  process.exit(2);
}
visit(root);
if (errors.length) {
  console.error("Public content publication guard failed:");
  errors.forEach((error) => console.error("- " + error));
  process.exit(1);
}
console.log("Public content publication guard passed: " + checked + " JSON file(s) checked; no draft or unpublished editorial states found.");
