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


## November 8, 2026 follow-up review

A newer community article was found: [LZ Exchange — HQ upgrade costs](https://lzexchange.net/guides/hq-upgrade-costs), published October 26, 2026. It provides a full level-by-level resource table, base construction times, and explicit prerequisite building levels for HQ2–HQ35. It also explains that some other published costs reflect a base with cost reductions. Its HQ35 base cost is listed as approximately 2.8B Food, 2.8B Wood, 541M Zent and 7.6M Steel.

This does not resolve the discrepancies. For example:
- The Last Z Guide page lists HQ35 at 2.3G Wood, 2.3G Food, 459.8M Zent and 6.4M Steel.
- Last-Z.net lists HQ35 at 2.93G Wood, 2.93G Food, 573M Zent and 9.08M Steel.
- LZ Exchange lists higher base figures than both.

These figures may reflect cost reductions, server/season differences, or data methodology. Without a controlled in-game observation, the planner must not treat any one value as universal.

### What is now in the planner dataset

The data file contains **community research candidates only** for HQ2–HQ35:
- Building names and levels transcribed from LZ Exchange's published prerequisite table.
- The source article and two independent community cross-check links.
- No resource cost values.
- Each record is explicitly tagged `community-candidate`; each building is tagged `community-reported`.

The planner displays these candidate prerequisites with a visible warning, allows local checklist tracking, and withholds resource totals. This is an intermediate research view, not a verified requirements database.

### In-game verification needed

To promote a target level to verified:
1. Capture the upgrade panel on the actual server/account.
2. Record exact resource quantities, required building names and levels, and displayed base duration.
3. Record game version, server/season and any discounts or buffs affecting the displayed cost.
4. Compare against the community candidate and investigate any mismatch.
5. Keep the row unpublished until the discrepancy is explained or independently reproduced.

The source pages above are community references, not official publisher documentation.


## Source-attributed dataset update — November 8, 2026

The earlier decision to leave all numeric data out was too conservative. The cited community references are legitimate research sources and are now used as attributed planning references, with differences preserved rather than silently choosing a winner.

### Imported per-level HQ construction table

The planner now includes HQ2–HQ35 costs and base durations transcribed from [Last Z Guides — HQ Construction Cost Table](https://lastzguides.com/hq-construction-cost.html), whose table is labelled in millions and states it was checked with server 403 players. Values retain the table's published decimal precision. This is a community-published reference, not a universal official value.

[Last Z Exchange — HQ upgrade costs, level by level](https://lzexchange.net/guides/hq-upgrade-costs) is stored as an alternate source on each row. Its values are displayed in rounded K/M/B units, so they are not converted into false-precision integer quantities. The article also publishes cumulative milestone totals and explains its base-cost methodology.

Prerequisite building names and levels are retained as community-reported candidates from the LZ Exchange prerequisite table. They are separately labelled from the HQ cost table.

### Known source differences (examples)

- HQ12 Food/Wood: Last Z Guides lists 3.6M; Last Z Exchange lists about 3.7M; Last-Z.net lists 4.02M.
- HQ31 Steel: Last Z Guides lists 2.2M; Last Z Exchange lists about 2.7M.
- HQ35 Steel: Last Z Guides lists 6.4M; Last Z Exchange lists about 7.6M.
- HQ35 Food/Wood: Last Z Guides lists 2.3B; Last Z Exchange lists about 2.8B; Last-Z.net's table should be retained as a third comparison where its exact row is transcribed.

These differences are recorded as source differences, not evidence that any reference is false. They may reflect cost reductions, server/version, rounding, or different base assumptions. Do not silently merge values from different sources.

### Planner calculation policy

- Per-step costs display the Last Z Guides table as the selected base reference, with source links and a visible community-sourced status.
- Range totals sum only the complete per-level values from that one selected table; they are labelled published-source estimates and inherit its precision.
- Alternate source values are not blended into the total.
- Prerequisite building upgrade costs are not included in HQ construction totals.
- The live in-game upgrade screen remains the best check for the player's current account/server. The planner does not call community values official or guaranteed.

### Corrections to earlier notes

The dataset is no longer empty. It now contains community-sourced cost rows for HQ2–HQ35 and community-reported prerequisite candidates. It is not yet an in-game verified dataset.
