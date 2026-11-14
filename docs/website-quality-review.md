# LZ Carry website quality review

Updated: 2026-11-14 — Heroes feature retirement and standalone Troops release candidate.

## Site areas reviewed
- Homepage and primary navigation.
- HQ Planner and Beginner Mode.
- Research Center and Laboratory route planner.
- Troops Database and Troop Target Planner as an independent page.
- Events Center, AT clock, and preparation checklist.
- Searchable guide directory and universal search.
- Player Dashboard, local goals, reminders, and progress backup controls.
- LZ Carry Service page.

## Changes in this pass
- Removed the public Heroes page, hero directory data, Formation Lab, five formation slots, saved formation controls, hero investment comparison, hero-only portrait placeholders and dedicated scripts/styles.
- Moved the existing Troop Database and Troop Target Planner into troops.html, retaining their original dataset, filters, tier references, local quantity state and planner script.
- Updated navigation, homepage, guide category, beginner progression, dashboard shortcuts and universal search to use the standalone Troops page.
- Replaced Hero-only guide-index records with Troops database and planner guides.
- Removed Hero-only data, docs and browser tests.
- Kept Research, HQ planning, Events, player progress, local backups and the Pilot service intact.
- Older progress backups silently skip retired Hero-only fields while restoring unrelated supported planner data.

## Validation status
- Static internal-link audit: all local HTML links resolve against the current branch tree; no broken internal links found.
- Removed-feature path audit: no remaining repository paths named for Heroes or Formation.
- GitHub Actions preview run: https://github.com/lzcarryguide/lz-carry-guide/actions/runs/43579426033
- Result: 41/41 Playwright tests passed (37.2 seconds), including desktop and 390px/320px mobile layouts, standalone Troops search/filtering, quantity planner calculations and local saves, universal-search deep links, guide-category filtering, legacy backup compatibility, Research, HQ, Events, Dashboard, Beginner Mode and Pilot checks.
- Screenshots and the HTML test report were uploaded as the workflow artifact.
- The live GitHub Pages browser smoke test runs automatically after a successful main-branch deployment.

## Evidence and product boundaries
- Troop names and faction mappings remain community-indexed, not publisher-certified.
- Troop statistics, camp unlock levels, training costs, timers, promotion ratios and research gates remain unpublished until checked against the current game client.
- Troop Target Planner calculates a quantity gap only; it does not infer training costs or lower-tier promotion availability.
- Research and Events retain their existing evidence labels and live-client caveats.
- Browser-local planner progress is not cloud-synced. Export a backup before changing devices or clearing browser data.

## Remaining verification
- Confirm current troop names and unlocks in the live game client before publishing additional numeric claims.
- Review the final desktop/mobile Playwright screenshots and post-merge live-site verification report.
