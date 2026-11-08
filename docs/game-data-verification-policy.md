# Game data verification policy

Last reviewed: 2026-11-08

## Evidence levels

- **In-game verified:** current game-client screen captured for the user's server/season; include capture date and context.
- **Cross-source:** at least two independent community references agree; show only as a reported reference, never as official.
- **Conflicting:** credible sources disagree; keep alternatives in internal notes and omit disputed values from public content.
- **Unverified:** single-source, stale, unclear or requires client confirmation; omit exact public values.

## Publishing rules

- Every changing number needs source, checked date, unit and scope.
- Do not infer a hero skill value from a different star or skill level.
- Do not merge building upgrade costs with troop training or promotion costs.
- Do not treat Apocalypse Time, weekday rotations or season schedules as universal across servers.
- A community roster count is not a definitive complete roster.
- Public prose must be original LZ Carry wording. External research URLs belong only in internal docs and maintainer metadata, never as public links or buttons.
- Preserve null for unknown values; do not substitute zero or a guessed value.

## Update workflow

1. Capture current in-game panel and record server/season/date.
2. Compare at least two independent sources where available.
3. Resolve discrepancies or retain them as conflicts.
4. Update JSON and internal source review together.
5. Run JSON validation, browser tests and responsive screenshots.
6. Review branch preview; never merge or deploy without explicit release approval.
