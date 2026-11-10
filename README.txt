LZ CARRY WEBSITE
================

LZ Carry is a static, responsive Last Z community knowledge hub and gaming-assistance website. Public content is original LZ Carry writing. External websites are research inputs only; their prose, layouts, artwork, and presentation are not copied.

CURRENT FEATURES
----------------
- Homepage and LZ Carry YouTube channel section.
- Searchable guide directory.
- Beginner guide and searchable 22-entry community-indexed Laboratory research guide, with personal Laboratory route and progress planner.
- HQ progression planner and local checklist.
- Evidence-screened Hero Formation Lab with hero profiles, mixed-faction builder, formation save/rename/load/compare/share, and troop database.
- Searchable event directory, weekly Alliance Duel / Full Preparedness reference, live Apocalypse Time clock and browser-saved preparation checklist.
- Weekly Pilot — $30 (Sunday–Saturday).
- Weekly + Canyon Clash — $35 (Sunday–Saturday).
- Responsive dark-blue visual system.

PROJECT STRUCTURE
-----------------
index.html, guides.html, beginner.html, research.html
heroes.html, events.html, pilot.html
style.css
assets/js/guide-library.js
assets/js/hq-planner.js
assets/js/knowledge-hub.js
data/guides.json
data/hq-requirements.json
data/heroes.json
data/troops.json
data/events.json
docs/guide-database-schema.md
docs/knowledge-hub-data-spec.md
docs/heroes-source-review.md
docs/troops-source-review.md
docs/events-source-review.md
docs/hq-source-review.md
tests/branch-preview.spec.js
tests/hq-planner.spec.js
playwright.config.js
.github/workflows/branch-preview.yml

CONTENT RULES
-------------
- Public explanations and data must be original LZ Carry content.
- External research URLs and disagreements stay in internal docs only.
- Do not publish skill details, costs, requirements, schedules, point values, or reward quantities without current evidence.
- Mark incomplete hero rosters as selected references, not complete lists.
- Re-check season/server-sensitive information against in-game panels.
- Never publish credentials, account recovery information, or private client details.

DEVELOPMENT AND RELEASE SAFETY
------------------------------
Current development branch: research-ui-hero-formation
Base: production main as of 2026-11-09
Run browser tests with: npx playwright test
The branch workflow runs Playwright and uploads screenshots/reports as artifacts.
The product owner has authorized autonomous development and release when quality criteria are met. Keep unresolved evidence gaps explicit; a passing test run alone is not sufficient.


HERO PROFILE EVIDENCE
---------------------
The Heroes section now indexes 45 community-referenced records from the union of source indexes. This is not a publisher-confirmed roster count: the references disagree (one 31-hero headline lists 36 names, while a separate tool indexes 26 skill records). Some individual profiles contain paraphrased skill/formation notes; source conflicts and unverified details are called out. The 3 Season 4 names remain flagged Verify. Check docs/hero-profile-source-review.md before treating community notes as current in-game facts.

RESEARCH GUIDE EVIDENCE
-----------------------
The Research Guide maps 22 named trees across community indexes (including Allied Troops, which some current guides omit) and records conflicting gates. Community trackers disagree on some unlock requirements and names. Check docs/research-source-review.md for source comparisons and the in-game evidence backlog. Exact node effects, badge costs, resource totals and speedups are intentionally omitted until verified in the current client.


PLANNER TOOL NOTES
------------------
- Laboratory route suggestions use community-reported gates and intentionally omit exact node costs, badge totals, percentages and timers until current-client evidence is available. The second Laboratory is tracked separately, including the reported Season 2 Day 50 condition.
- Full Preparedness planner displays Apocalypse Time (UTC-2), four-hour windows and a local checklist. It does not infer the active server theme or scoring tasks.
- Formation library stores names and five hero slots locally; save, rename, copy, load, compare and share links are available. Share links contain hero names and slot order only. No account or game credentials are stored.
- See docs/laboratory-planner-review.md, docs/event-planner-review.md and docs/website-quality-review.md for evidence and remaining verification.
