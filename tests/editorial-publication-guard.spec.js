const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const validator = path.resolve(__dirname, "../scripts/validate-public-content.js");

function fixture(records) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "lzcarry-public-data-"));
  fs.writeFileSync(path.join(root, "records.json"), JSON.stringify(records));
  return root;
}

test("public content guard accepts evidence-qualified published records", () => {
  const root = fixture({ events: [
    { name: "Example", verificationStatus: "community-supported" },
    { name: "Pending evidence", verificationStatus: "unconfirmed" }
  ] });
  try {
    const result = spawnSync(process.execPath, [validator, root], { encoding: "utf8" });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("1 JSON file(s) checked");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("public content guard blocks draft, review-only and unpublished records", () => {
  for (const record of [
    { publicationStatus: "draft" },
    { editorialStatus: "pending review" },
    { publishState: "rejected" },
    { isPublished: false }
  ]) {
    const root = fixture({ records: [record] });
    try {
      const result = spawnSync(process.execPath, [validator, root], { encoding: "utf8" });
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("Public content publication guard failed");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  }
});
