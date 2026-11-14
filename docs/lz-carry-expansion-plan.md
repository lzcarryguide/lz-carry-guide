# LZ Carry Website Expansion Roadmap

## Goal

Grow the existing static LZ Carry site into an original, mobile-friendly Last Z knowledge hub while preserving the Weeping Angel visual identity and the existing account-piloting service. All development stays on `lz-carry-expansion`; nothing is merged to `main` without explicit owner approval.

## Reference-site review

### Last Z Guides — editorial discovery and learning paths
Useful patterns observed:
- A clear guide taxonomy spanning progression, research, heroes, PvP, events, and economy.
- Featured guides and player-intent entry paths (new player, F2P, PvP, long-term progression).
- Search and a searchable/structured guide index.
- Detailed HQ requirements, research priorities, event schedules, and written explainers alongside tools.
- Strong cross-linking between related guides and calculators.

Opportunity for LZ Carry: make the four requested categories the primary navigation, add a genuinely searchable guide library, and connect every guide to relevant tables, tools, and related topics. Keep our own wording, layouts, graphics, and editorial voice.

### Wild Hoggs — practical calculators and persistent planning
Useful patterns observed:
- Dedicated tools for research trees, building upgrades, troop classes, equipment, and event resources.
- Current-versus-target planning, prerequisite paths, remaining-cost summaries, per-level detail, and progress indicators.
- Searchable hero information, event/code/rose hubs, changelog, and multilingual presentation.
- Mobile-specific interaction patterns and saved progress.

Opportunity for LZ Carry: build focused tools with transparent inputs, prerequisites, remaining totals, reset/export options, and local browser saves. Avoid copying their interface, code, data presentation, or artwork.

## Current LZ Carry baseline audit

The current site already has the seven-page static structure: Home, All Guides, Beginner, Research, Troops, Events, and Book a Pilot, with a shared stylesheet and the approved dark/silver/icy-blue Weeping Angel look.

Main gaps found:
- Most category cards are topic placeholders, not complete written guides.
- Beginner has no HQ1–35 requirements table or persistent progression checklist.
- Research has no verified cost dataset, calculators, tree dependency model, or saved planner.
- Heroes & Troops previously lacked an independent searchable database and quantity planner.
- Events has no structured schedule, requirements, reward tables, or trackers.
- Video placeholders are embedded in the guide cards rather than separated into a supplementary video library.
- The guide directory is only a four-card category landing page, with no search or filters.
- The homepage and footers still display Last Z Pilot branding in places.
- The Pilot page contains the existing $30 Weekly Pilot and $35 Weekly + Canyon Clash packages. Its Discord CTA currently points to the generic Discord homepage; preserve it for now and request the owner's actual invite/profile URL before replacing it. Keep scope, booking, and account-safety notices intact.

## Information architecture

Primary navigation:
1. Home
2. Guides (searchable directory)
3. Beginner & HQ
4. Research & Progression
5. Troops & Power
6. Events & Rewards
7. Videos (separate supplementary library)
8. LZ Carry Service

Each category page should have:
- A short orientation and stage/role filters where useful.
- Written guides first, with concise key takeaways.
- Searchable or filterable tables where the data is tabular.
- Functional tools/checklists near the relevant explanation.
- A separate optional video/resources area.
- Related guides and source/update notes.

## Phased implementation

### Phase 1 — Rebrand and structure
- Replace public-facing Last Z Pilot brand text with LZ Carry across navigation, page titles/descriptions, homepage service panel, package/booking headings, and footers.
- Retain the account-piloting service, $30 and $35 packages, package details, and Discord contact action.
- Create the guide/video separation and a searchable guide directory foundation.
- Add a shared data/source disclosure pattern.

### Phase 2 — Beginner and HQ progression
- Write beginner fundamentals, account setup, build priorities, routine, resource management, troops, and common mistakes.
- Add an HQ1–35 reference dataset and requirement lookup/table only after each row is source-checked.
- Build an HQ checklist/planner with prerequisite visibility, completion percentage, and local save.
- Store HQ progress locally; provide reset and export/import backup.

### Phase 3 — Research and progression
- Model research trees, nodes, levels, prerequisite edges, laboratory gates, badges, electricity, Zent, and base times.
- Build cost calculator, badge calculator, target planner, and completion checklist.
- Show spent versus remaining amounts and clearly disclose when speed bonuses or server/season variations are not included.
- Launch with verified trees/nodes first; expand coverage as data is validated.

### Phase 4 — Troops and power
- Maintain an independent searchable troop-class database with faction, tier names and evidence/update metadata.
- Keep the Troop Target Planner focused on player-entered current and target quantities; do not infer costs, unlocks or promotion ratios.
- Add troop composition notes, equipment progression and combat fundamentals only when supported by reliable evidence.
- Use text/neutral icons initially; only add game artwork when licensing/reuse permission is clear.

### Phase 5 — Events and rewards
- Build event reference pages with schedule, eligibility, scoring, preparation, reward tiers, and F2P notes.
- Add event preparation checklists and reward/resource planners.
- Mark schedules and rewards as season/server dependent where applicable; show last-verified dates.

### Phase 6 — Lucky Flower/Rose and guide search
- Add a weekly tracker with active week, number, buff, duration, source, verification status, and append-only history.
- Require in-game confirmation plus a second independent current report before publishing a weekly value; if sources disagree or are stale, display “awaiting verification” rather than guessing.
- Build an editor-friendly JSON record format and a clear manual update process. Do not assume an official API exists.
- Add guide search across title, category, stage, tags, and tool type.

### Phase 7 — Responsive QA and release candidate
- Test all pages and tools at desktop, tablet, and narrow mobile widths.
- Check keyboard access, focus states, labels, contrast, table overflow, storage failure handling, and no-JavaScript fallbacks.
- Validate internal links, source links, page metadata, and console/network errors.
- Publish a preview and report screenshots and test results. Wait for explicit approval before merge.

## Data architecture

Keep game data separate from HTML and presentation. Proposed static JSON files:
- `data/hq-requirements.json`
- `data/research-trees.json`
- `data/troops.json`
- `data/events.json`
- `data/lucky-rose-history.json`
- `data/guides.json`

Each record should carry, where relevant:
- Stable ID and display name.
- Values and units (never ambiguous abbreviated numbers alone).
- Prerequisites and unlock conditions.
- Game version/season/server scope.
- `sourceName`, `sourceUrl`, `sourceType` (in-game observation, official announcement, community reference).
- `verifiedAt`, `confidence`, and a short verification note.
- Optional alternate values when reputable sources disagree.

Never label community-derived values “official” unless an official game source supports them. The in-game display is the final authority for account-specific or current event values.

## Local persistence and technical approach

- Keep the site compatible with static GitHub Pages hosting; no server or user account is required for local tools.
- Use namespaced, versioned localStorage keys per tool/profile, with graceful fallback if storage is blocked.
- Provide reset and JSON export/import for important plans. Explain that browser-local data does not automatically sync between devices or survive clearing browser data.
- Keep calculators deterministic and testable with small fixture datasets; avoid hidden assumptions.
- Use semantic HTML and progressively enhanced JavaScript. Prefer accessible controls and compact responsive tables over large, unscrollable diagrams.

## Lucky Rose source note

The reviewed community trackers agree on a weekly number and fixed number-to-buff mapping, but they do not consistently describe whether the effect is personal or shared with an alliance. Some sources report a sender-only buff; others report alliance-wide sharing. Therefore LZ Carry must not state alliance-wide scope as fact without direct in-game confirmation. The weekly number must be freshly verified each week; do not extrapolate a rotation. No official API was confirmed during this review.

## Release and approval rules

- Branch: `lz-carry-expansion`, created from the repository's current `main`.
- Work in small, focused commits and keep main untouched.
- Preview each phase and provide real screenshots or a working preview when available.
- Create a PR only when a phase is ready for review; do not merge without explicit approval.
