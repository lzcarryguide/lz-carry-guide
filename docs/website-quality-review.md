# LZ Carry website quality review

Checked: 2026-11-10 — post-release audit of `main` (`6ae8442252444b765b4a5c14d4398d160719d6e4`)

## Site areas reviewed
- Homepage: quick-access content and channel link.
- HQ Planner: existing HQ1–35 data and browser checklist are retained on Beginner page.
- Research Center: search/filter tree directory and new Laboratory route planner.
- Hero Formation Lab: verified-roster builder, faction/troop/opponent feedback and new save/compare/share library.
- Events Center: searchable event directory, reference weekly schedule, AT clock and new prep checklist.
- Guides: searchable directory and existing empty-state safeguards.
- Troops: searchable troop data retained on Heroes & Troops page.
- Pilot Service: navigation and page route retained.

## Changes in this pass
- Added a dedicated Laboratory route and progress checklist, with distinct primary/second Laboratory inputs and Season 2 Day 50 confirmation for the reported Army Expansion gate.
- Added local-only progress state; no account is required.
- Added a fixed UTC−2 Apocalypse Time clock and four-hour window display.
- Added Full Preparedness / Alliance Duel prep checklist with local persistence and explicit server/live-task caveats.
- Added named formation save, rename, load, compare and share-link behavior, without requiring login.
- Added HQ Planner quick access from homepage and navigation.
- Standardized primary navigation labels for Research Center, Hero Formation Lab and Events Center.
- Added Playwright tests for new interactions, local persistence and mobile overflow.

## Preserved behavior
- Existing HQ planner dataset and code were not rewritten.
- Existing hero/troop/event JSON data and evidence records were not overwritten by the new planner features.
- Existing public page source links remain internal documentation only; public content does not redirect to third-party guides.
- No numeric research costs, badge totals, battle win rates, event point values or server-specific schedules were added.

## Automated validation and visual inspection (pre-merge branch run)
- GitHub Actions run: https://github.com/lzcarryguide/lz-carry-guide/actions/runs/42643618110
- Tested commit: `a41aa3e15945a02d80be80813536e7a8571d3467`.
- Result: 19/19 Playwright tests passed (17.1 seconds), including existing navigation, HQ Planner, Research, Hero/Troop/Event data, hero selection/swap/remove/filter, and new planner persistence/share/compare flows.
- Screenshot artifacts include `laboratory-route-planner.png`, `event-preparation-planner.png`, `formation-library.png`, plus homepage, HQ Planner, Research, Heroes, Events and Guides desktop/mobile screenshots.
- The pre-merge screenshot set was inspected: the Laboratory planner exposes separate Lab No. 2 and Season 2 Day 50 controls; the Event planner shows the AT clock and local checklist; the formation library shows saved lineups and compare controls.

## Test and inspection boundary
GitHub Actions Playwright runs execute the static site locally in CI and upload screenshots and HTML reports. The 19/19 pass proves the automated browser flows in the runner; it does not prove a live game-client value. Browser console errors are asserted for the new planner and formation-library tests. Network requests for page data are exercised by existing tests.

## Remaining work / known limitations
- Current in-game Laboratory screenshots are still needed to certify exact gates, badge prices, node values and the second-Lab unlock.
- Event Center screenshots are still needed to verify current server-specific event themes, task lists, points and reward milestones.
- Targeted YouTube searches in this pass returned no directly usable videos; do not infer gameplay footage was reviewed.
- Hero skill text, availability and Season 4 metadata still need current-client evidence; community-corroborated status is not publisher certification.
- Formation share links carry five hero names and slot order only. They do not encode server state, equipment, troop tiers, skills, buffs or account ownership.
- Saved planners and formations remain on the visitor's current browser/device and are not cloud-synced.
- HQ Planner is an anchor within the Beginner page rather than a standalone HTML page.
