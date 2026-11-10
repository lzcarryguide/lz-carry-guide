# LZ Carry data verification policy

## Purpose

Give every game-data claim a clear evidence label. A community database entry must never look like an official publisher statement or a current-client confirmation when it is not one.

## Canonical statuses

| Status | When to use it | User-facing meaning |
| --- | --- | --- |
| **Verified** | Directly checked against the current in-game client or an official publisher source. Record the verification method and date. | Verified |
| **Community-supported** | Corroborated by one or more identifiable community references, but not confirmed in the current client or by the publisher. | Community-supported |
| **Estimated** | Calculated or inferred from explicit assumptions. Preserve the formula and assumptions. | Estimated |
| **Outdated** | Previously supported, but a game update, season change, or newer evidence has made it unsafe to rely on without rechecking. | Outdated |
| **Unconfirmed** | Candidate, incomplete, disputed, conflicting, or awaiting adequate evidence. | Unconfirmed |

**Important:** Community-supported is deliberately separate from Verified. A community index can be useful and well corroborated without being official or confirmed in the current game client.

## Recommended record metadata

New or migrated records should use a `verification` object while retaining existing source and evidence fields:

```json
{
  "verification": {
    "status": "community-supported",
    "method": "independent-community-source-corroboration",
    "checkedAt": "2026-11-10",
    "gameVersion": null,
    "serverScope": null,
    "sources": ["source-id-1", "source-id-2"],
    "notes": "Confirm season-specific details in the live client."
  }
}
```

- `status` must be one of the five canonical values above.
- `method` records how the claim was checked; it must not be inferred from the status label.
- `checkedAt` is the date evidence was reviewed, not a promise that the data remains current.
- `gameVersion` and `serverScope` should be populated only when known.
- `sources` should reference the existing source registry or stable source records; do not invent source IDs.
- `notes` records conflicts, scope limits, and what still needs live-client confirmation.

## Migration rules for current LZ Carry databases

- **Heroes:** community-indexed identity records remain Community-supported, not Verified. Any unresolved identity, role, skill, season, or equipment conflict must remain explicitly caveated; a record awaiting in-game confirmation is not promoted to Verified.
- **HQ requirements:** `community-candidate` records remain Unconfirmed until the individual value and prerequisites are checked. Do not average conflicting source values or remove source comparisons.
- **Troops:** provisional class/tier references may be Community-supported; numeric stats, costs, camp unlocks, and research gates remain Unconfirmed until checked against the current client.
- **Events:** stable mechanics may be Community-supported where multiple sources agree. Event dates, schedules, scoring, thresholds, and rewards are separate claims and remain Unconfirmed unless the live event panel or current official material verifies them.
- **Guides and player-entered progress:** distinguish editorial advice and player-supplied account inputs from verified game facts. A user's saved progress is not evidence that a game mechanic is correct.

## Safety and maintenance

1. Never assign Verified merely because several community websites repeat the same claim.
2. Never infer Outdated solely from age; use evidence of a superseding version, patch, season, or correction.
3. Never display an Estimated value without its assumptions or calculation method.
4. Preserve conflicting sources and explain the disagreement rather than silently choosing or averaging.
5. Apply status at the smallest useful claim level. A verified hero identity does not automatically verify every skill, role, equipment effect, or season unlock on that hero.
6. Recheck volatile data before publication and show the checked date when available.
7. Keep user-entered account data separate from the canonical game-data database.

This policy is additive: it does not delete or rewrite existing evidence, source comparisons, planner records, or historical notes.
