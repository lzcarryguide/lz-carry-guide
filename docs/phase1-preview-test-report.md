# Phase 1 isolated preview — test report

**Branch:** `lz-carry-expansion`  
**Tested commit:** `5da9c6b865946503397a73ed90172ae2217c3b41`  
**Test date:** 2026-11-08  
**Result:** All 5 Playwright test groups passed in Chromium.

## Coverage and results

| Area | Result | Details |
|---|---|---|
| Homepage | PASS | Desktop and mobile screenshots captured; key sections and calls to action render. |
| Navigation | PASS | All primary navigation destinations return HTTP 200. Internal links across all eight pages were checked for missing targets. Desktop homepage nav is constrained to one row. |
| Videos page | PASS | Separate page renders, links back to written guides, and correctly reports that no videos are published yet. |
| Guide directory | PASS | Search input, category selector, zero-result state, and category/search combination were exercised. |
| Responsive layout | PASS | Homepage, Videos, and Guide Directory tested at 390px and 320px viewport widths; no page-level horizontal overflow. |
| Publication filter | PASS | Fixture test includes one fully verified published record plus draft, missing-verification-date, undated-source, and unsafe-URL records. Only the verified published entry renders. |
| Production data | PASS | `data/guides.json` parses as schema v1 and currently contains an empty entries array. |

## Issues discovered and fixed

1. **Publication gate was too permissive.** The first implementation accepted a published flag plus any non-empty sources array. It now requires a supported category, safe relative guide URL, valid ISO verification date, and at least one source with a recognized source type, valid checked date, name, and verification note.
2. **ISO date validator regex was over-escaped.** The first browser fixture run exposed that valid source dates were rejected. The regex was corrected and the fixture suite now passes.
3. **Homepage desktop navigation wrapped its final item to a second row.** The 1440px layout was tightened so the complete navigation stays on one row; the browser test now asserts this.

## Test setup

The isolated GitHub Actions workflow serves the checked-out branch from a temporary runner-local HTTP server and runs Playwright/Chromium. It uploads screenshots and the HTML test report as a 14-day Actions artifact. It does not publish to GitHub Pages, change the Pages source, or merge any branch.

## Screenshots

The CI artifact includes:
- `homepage-desktop.png`
- `homepage-mobile.png`
- `guides-desktop.png`
- `guides-mobile.png`
- `videos-desktop.png`
- `videos-mobile.png`
- `guide-search-verified-fixture.png`

## Remaining content limitations

- No written guide records are published yet; the searchable directory is correctly empty rather than filled with invented advice.
- No videos are published yet; the Videos page is intentionally separate and empty.
- The category pages describe planned topics and clearly label them as in-development, not finished walkthroughs.
- The HQ1–35 requirements array is empty pending row-by-row verification. This phase did not add guessed HQ costs or building prerequisites.
- The Discord contact button still points to the generic Discord homepage because no confirmed booking invite/profile URL has been supplied.

## Branch and deployment safety

The test workflow is scoped to pushes on `lz-carry-expansion` and manual workflow dispatch. No Pages deployment workflow or Pages configuration was changed. `main` remains the base branch and has not been updated or merged.
