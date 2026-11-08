LZ CARRY WEBSITE
================

LZ Carry is a static, responsive Last Z community knowledge hub and gaming-assistance website. Public content is original LZ Carry writing. External websites are research inputs only; their prose, layouts, artwork, and presentation are not copied.

CURRENT FEATURES
----------------
- Homepage and LZ Carry YouTube channel section.
- Searchable guide directory.
- Beginner and research/progression pages.
- HQ progression planner and local checklist.
- Expanded Heroes & Troops reference with searchable JSON data.
- Expanded Events directory with searchable JSON data.
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
Current development branch: lz-carry-knowledge-hub
Base: main at 10a833e0c986f181069d8a3d37ea9b1d9e8cc8a3
Run browser tests with: npx playwright test
The branch workflow runs Playwright and uploads screenshots/reports as artifacts.
Do not merge or deploy until the release owner explicitly approves. A passing test run is not release approval.
