# Knowledge hub data specification

The Heroes, Troops, and Events pages read small JSON databases from `data/`. Page markup and presentation are kept separate from content records so updates do not require rewriting the page.

## Files

- `data/heroes.json`: selected hero name/faction references.
- `data/troops.json`: troop class, faction, and camp mapping.
- `data/events.json`: event directory and original LZ Carry preparation summaries.

## Schema rules

Each file has `schemaVersion: 1`, `lastUpdated` in ISO date format, and a top-level collection. Every record has a stable kebab-case `id`. Public records must not contain external source URLs; put research links and source comparisons in the matching `docs/*-source-review.md` file.

## Publication policy

- Include only facts supported by the internal review.
- Do not publish skill text, numeric values, costs, timers, prerequisites, point values, schedules, or reward amounts without current in-game verification where available.
- Distinguish selected roster references from a complete roster.
- Avoid presenting community-reported observations as official game data.
- Update the data file and its source review together.
- Remove or revise stale data when a patch, season, or server-specific rule changes.
- Keep public copy original to LZ Carry; research sources are not templates for prose, page structure, or artwork.
