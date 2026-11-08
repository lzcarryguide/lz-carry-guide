# HQ1–35 source review — initial findings

**Review date:** 2026-11-08  
**Publication decision:** Do not publish numeric HQ requirements yet.

This is a source-quality review, not an approved requirements dataset. The public data file remains empty until conflicting values and building levels can be resolved against in-game upgrade screens.

## Candidate references reviewed

| Reference | What it provides | Initial assessment |
|---|---|---|
| [Last Z Guides — HQ requirements](https://lastzguides.com/hq.html) | HQ1–35 table, costs, prerequisites, hero caps, strategy notes; page says it was checked with server 403 players | Detailed community reference. Its current page is dated Aug 29, 2026. Verify all values in-game and confirm server scope. |
| [Last Z Guides — HQ construction cost table](https://lastzguides.com/hq-construction-cost.html) | Per-level costs, building requirements, base build times, calculator | Useful for cross-checking; the table says prerequisite-building upgrade costs are separate from HQ costs. |
| [Last Z Guide — HQ requirements](https://www.lastz.guide/progression/hq-requirements/) | Interactive HQ1–35 lookup and chart | Detailed second reference, but early-level resource values differ from other sources. |
| [Z Tools — HQ levels](https://ztools.co.uk/tools/hq/) | HQ1–35 required buildings, resource costs, hero caps | Recently crawled community reference; useful independent cross-check. |
| [Last-Z.net — HQ upgrade requirements](https://last-z.net/tables/hq-upgrade-requirements/) | Per-level buildings, RSS and hero caps | Page shows update date June 13, 2026; its early-level costs differ from newer references. |
| [LastZData — HQ calculator](https://www.lastzdata.com/calculators/headquarters) | Resource totals, build time and building requirements | Additional calculator reference; needs row-level reconciliation. |

## Conflicts found — why we are not importing data yet

- **HQ1–HQ3 resource allocations differ.** The Last Z Guide chart lists HQ1 Wood 0.012M and HQ2 Food 0.0103M, while Last-Z.net lists HQ1 Food 10.4K and HQ2 Food 15.6K. These cannot both describe the same upgrade sequence without a version/server or transcription explanation.
- **HQ6/HQ7 prerequisite presentation differs.** Some tables show Military Center at HQ6 and Alliance Center plus Training Ground at HQ7; other references differ in how the building requirements are paired and labeled.
- **Building names/localization differ.** Sources use variants such as City Wall/City Walls, Laboratory/Research Lab, and Assaulter Camp/Assault Training Ground. These need canonical IDs plus exact in-game display labels.
- **Building requirement levels are not consistently explicit.** A required building name alone is not enough for a planner; the required level must be independently confirmed.
- **HQ31–HQ35 steel costs broadly align across several recent community tables**, but that does not validate the rest of the dataset or prove server-wide uniformity.

## Verification standard before data entry

1. Capture each HQ upgrade screen from an identifiable game version/server and record the target HQ level, every listed resource, each required building and its required level, and any displayed duration.
2. Obtain a second independent corroboration for each row. Prefer an independent in-game observation; otherwise record a reputable community table as corroboration, not as official proof.
3. Compare exact integer quantities, not rounded M/B display values. If only abbreviated display values are available, preserve the displayed precision and record the unit/rounding limitation.
4. Investigate discrepancies by server age, game version, event/season state, and localization before deciding whether separate data profiles are needed.
5. Store each source and verification date on the level record. Do not publish rows with unresolved differences.
6. Keep HQ construction costs separate from the costs of upgrading prerequisite buildings. The planner must label which totals include which costs.
7. Only calculate current-to-target totals when every required row in the selected range is verified. Show missing rows as unavailable, never as zero.

## Planned planner behavior

- Inputs: current HQ (1–35) and target HQ (current+1 through 35).
- Per-step display: required building(s), required building level(s), HQ upgrade resource costs, prerequisites, and duration where verified.
- Progress tracking: per prerequisite/building and per upgrade step, saved locally in the browser.
- Totals: sum only fully verified HQ upgrade costs; show prerequisite-building costs separately if/when verified.
- Transparency: visible data scope, last-verified date, source links, and a warning if the chosen range includes an unverified level.

**Current status:** `data/hq-requirements.json` intentionally has an empty `levels` array. No HQ cost or prerequisite is currently published by the new LZ Carry planner.
