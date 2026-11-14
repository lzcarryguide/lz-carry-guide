LZ CARRY WEBSITE
================

LZ Carry is a static, responsive Last Z community knowledge hub and gaming-assistance website. Public content is original LZ Carry writing. External websites are research inputs only; their prose, layouts, artwork, and presentation are not copied.

CURRENT FEATURES
----------------
- Homepage and LZ Carry YouTube channel section.
- Searchable guide directory.
- Beginner guide and searchable 22-entry community-indexed Laboratory research guide, with personal Laboratory route and progress planner.
- HQ progression planner and local checklist.
- Standalone Flowers Count tool with weekly Lucky Rose evidence log and historical records.
- Daily Pilot — $3/day; Saturday Special — $8; Weekly Elite Management — $30 / 7 days; Canyon Clash — $8/account.
- SVS Chest Opening — $5 per account, each account billed separately; maximum service capacity is 2–3 accounts.
- Existing Daily Pilot, Saturday Special, Weekly Elite Management and Canyon Clash prices are unchanged.
- Responsive dark-blue visual system.

PROJECT STRUCTURE
-----------------
index.html, guides.html, beginner.html, dashboard.html, research.html
flowers-count.html, pilot.html
style.css
assets/js/guide-library.js
assets/js/hq-planner.js
assets/js/lucky-rose-tracker.js
assets/js/research-planner.js
assets/css/lucky-rose-tracker.css
data/guides.json
data/hq-requirements.json
data/lucky-rose-history.json
docs/guide-database-schema.md
docs/knowledge-hub-data-spec.md
docs/hq-source-review.md
tests/branch-preview.spec.js
tests/planner-tools.spec.js
tests/hq-planner.spec.js
playwright.config.js
.github/workflows/branch-preview.yml

CONTENT RULES
-------------
- Public explanations and data must be original LZ Carry content.
- External research URLs and disagreements stay in internal docs only.
- Do not publish skill details, costs, requirements, schedules, point values, or reward quantities without current evidence.
- Re-check season/server-sensitive information against in-game panels.
- Never publish credentials, account recovery information, or private client details.

DEVELOPMENT AND RELEASE SAFETY
------------------------------
Latest release: PR #7 merged to main on 2026-11-09 (`6ae8442252444b765b4a5c14d4398d160719d6e4`).
Post-release maintenance is performed on a separate branch and reviewed through a pull request.
Run browser tests with: npx playwright test
The pull-request workflow runs Playwright and uploads screenshots/reports as artifacts.
The product owner has authorized autonomous development and release when quality criteria are met. Keep unresolved evidence gaps explicit; a passing test run alone is not sufficient.


RESEARCH GUIDE EVIDENCE
-----------------------
The Research Guide maps 22 named trees across community indexes (including Allied Troops, which some current guides omit) and records conflicting gates. Community trackers disagree on some unlock requirements and names. Check docs/research-source-review.md for source comparisons and the in-game evidence backlog. Exact node effects, badge costs, resource totals and speedups are intentionally omitted until verified in the current client.


PLANNER TOOL NOTES
------------------
- Laboratory route suggestions use community-reported gates and intentionally omit exact node costs, badge totals, percentages and timers until current-client evidence is available. The second Laboratory is tracked separately, including the reported Season 2 Day 50 condition.
- Flowers Count checks its stored week against the Monday 00:00 UTC reset and flags stale entries. New weekly numbers are recorded manually after in-game verification; no future value is guessed.
- See docs/laboratory-planner-review.md, docs/event-planner-review.md and docs/website-quality-review.md for evidence and remaining verification.
