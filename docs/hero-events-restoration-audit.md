# Hero and Events restoration audit

Reviewed for a development-only restoration on 27 November 2026. The underlying community-source reviews are dated 8–10 November 2026; this migration review does **not** claim that those sources or game-client facts were freshly reverified today.

## Hero Encyclopedia and Formation Lab

- The historical community-indexed dataset contains 36 records. 33 are selectable under the prior LZ Carry evidence threshold; 3 remain visible but blocked from formation selection: Amber, Queenie, Yu Chan.
- The three pending records have unresolved season/role metadata. They must not be treated as confirmed Season 4 facts.
- 3 records lack a reconciled role field: Amber, Queenie, Yu Chan.
- All 36 top-level `skills` arrays are empty. 23 records contain qualitative, paraphrased community notes under `profileNotes.skills`; the remaining records do not have hero-specific skill notes. No exact skill transcription, coefficients, costs, star requirements or equipment effects are asserted.
- No hero portraits or game artwork are included. The interface uses text-only portrait placeholders because documented reuse permission is not available.
- Formation presets are labelled community examples or LZ Carry experiments, not best-in-slot claims. The planner does not simulate battle outcomes, exact position rules, troop counts, buffs or RNG.

## Events Center and preparation

- The historical community-indexed dataset contains 16 event profiles.
- Missing evidence remains explicit: scoring is absent for 8 records, rewards are absent for 6, server schedules are absent for 15, and 2 lack a complete mechanics list.
- The Full Preparedness planner uses manual current/next theme selection. It does not infer the active theme, score values, reward thresholds or server-specific schedule. The UTC−2 Apocalypse Time convention and two reported overlap windows remain community references, not a guarantee for every server.
- Weekly Alliance Duel themes and Hot Event cycles have source disagreements. The page labels them as reference patterns and directs players to the live Event Center before spending.

## Source quality and release guardrails

- Supporting source reviews were last checked 8–10 November 2026. They are retained with their dates and links for internal corroboration; no current-client screenshots were supplied in this run.
- Public data contains no third-party source URLs or copied source prose. All displayed explanations are LZ Carry summaries and caveats.
- The retired standalone Troops feature remains retired: no `troops.html` page, `data/troops.json`, or Troops navigation was restored. Troop-line selection remains only as a formation input.
- Local formation and event-checklist state stays in the browser. It is included in the existing local backup tool only after the new event-preparation key is explicitly allowlisted; old event reminder/checklist formats remain retired.

## Required next evidence

1. Current-client hero roster and profile screenshots for every indexed hero, including all skill panels and role/faction/season fields.
2. Current-client screenshots for Full Preparedness and Alliance Duel task panels, scoring caps, rewards, countdowns and server reset.
3. Current event panels for Canyon Clash, SvS, Capital battle, Zombie Tyrant and rotating reward events before publishing numeric rules.
4. Owner-provided or licensed hero portraits only if image assets are later requested.
