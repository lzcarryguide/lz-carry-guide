LZ CARRY WEBSITE
================

LZ Carry is a static, responsive Last Z community knowledge hub and gaming-assistance website. Public content is original LZ Carry writing. External websites are research inputs only; their prose, layouts, artwork, and presentation are not copied.

CURRENT FEATURES
----------------
- Homepage and LZ Carry YouTube channel section.
- Searchable guide directory.
- Beginner guide and a 22-tree community-indexed Laboratory research guide with HQ/Lab gates and F2P/spending routes.
- HQ progression planner and local checklist.
- 45-record community-indexed Heroes Encyclopedia with expandable profiles, source conflicts and search/filter controls.
- 16 searchable event profiles plus weekly Alliance Duel / Full Preparedness planning and Hot Event cycle conflict notes.
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
Current development branch: research-guide-heroes-events-v2
Base: production main as of 2026-11-09
Run browser tests with: npx playwright test
The branch workflow runs Playwright and uploads screenshots/reports as artifacts.
Do not merge or deploy until the release owner explicitly approves. A passing test run is not release approval.


HERO PROFILE EVIDENCE
---------------------
The Heroes section now indexes 45 community-referenced records from the union of source indexes. This is not a publisher-confirmed roster count: the references disagree (one 31-hero headline lists 36 names, while a separate tool indexes 26 skill records). Some individual profiles contain paraphrased skill/formation notes; source conflicts and unverified details are called out. The 3 Season 4 names remain flagged Verify. Check docs/hero-profile-source-review.md before treating community notes as current in-game facts.

RESEARCH GUIDE EVIDENCE
-----------------------
The Research Guide maps 22 named trees across community indexes (including Allied Troops, which some current guides omit) and records conflicting gates. Community trackers disagree on some unlock requirements and names. Check docs/research-source-review.md for source comparisons and the in-game evidence backlog. Exact node effects, badge costs, resource totals and speedups are intentionally omitted until verified in the current client.
