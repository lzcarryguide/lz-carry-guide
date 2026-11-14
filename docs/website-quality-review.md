# LZ Carry website quality review

Updated: 2026-11-14 — Troops feature retirement release candidate.

## Site areas retained
- Homepage and primary navigation.
- HQ Planner and Beginner Guide / Beginner Mode.
- Research Center and Laboratory route planner.
- Events Center, Apocalypse Time clock, Lucky Rose tracker and preparation checklist.
- Searchable guide directory and universal search.
- Player Dashboard, local goals, reminders, speedup calculator and progress backup controls.
- LZ Carry Piloting Services.

## Changes in this pass
- Removed the standalone Troops page, database, filters, class/tier renderer, quantity planner and calculations.
- Removed Troops navigation, homepage category card, dashboard statistic and shortcut, Beginner Guide section, guide category and guide-index entries.
- Removed the Troops dataset, dedicated JavaScript and CSS, source-review document, and retired references from the project inventory and roadmap.
- Removed Troops page and dataset indexing from universal search.
- Removed Troops progress aggregation and backup export support. Older backups silently skip the retired Troops planner key.
- Existing personal goals formerly categorized as Troops are migrated to Other so users retain their dashboard goals without a dead destination.
- Preserved shared Events rendering in the knowledge hub and all unrelated Research, HQ, Events, Dashboard, Guides, Beginner and Piloting Services features.

## Validation status
- Automated branch preview runs Playwright at desktop and mobile widths and checks every primary page, internal links, runtime errors, horizontal overflow, Events rendering, Research, dashboard goal migration and backup compatibility.
- Static repository link audit checks every local HTML link against the branch tree and confirms that the retired Troops page and data file are absent.
- Post-merge GitHub Pages deployment and live Chromium smoke verification run before release completion.

## Data and persistence boundaries
- Research retains its own Laboratory research entries and terminology; those are not the removed Troops database.
- Events retains its live-game caveats and player-entered preparation state.
- Browser-local progress remains local and is not cloud-synced. Export a backup before changing devices or clearing browser data.
