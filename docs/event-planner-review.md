# Events planner — evidence and limitations

Checked: 2026-11-09

## What the tool does
- Displays a live Apocalypse Time clock using the fixed UTC−2 reference.
- Shows the current four-hour time block and time until its next boundary.
- Flags the two community-reported possible Full Preparedness / Alliance Duel overlap windows: 08:00–12:00 and 20:00–00:00 AT.
- Provides a browser-saved checklist for the five community-indexed Full Preparedness themes: Mod Vehicle Boost, Shelter Upgrade, Age of Science, Hero Initiative and Army Expansion / Unit Training. Players manually select the active and next themes from their live Event Center.
- Rolls checklist state to a new Apocalypse Time date.
- Does not guess the active Full Preparedness theme, the server's Alliance Duel day, scoring actions, reward thresholds or server-specific reset. The current / next theme selectors are manual inputs, not an inferred schedule.

## Evidence used
- SIN Command Full Preparedness: https://www.lastz.guide/events/full-preparedness/ — six four-hour rotations and reported 08:00–12:00 / 20:00–00:00 AT overlap.
- LastZ.GG Alliance Duel: https://lastz.gg/guides/alliance-duel — updated 2 Nov 2026; day themes and overlap notes, including player-state observations that are not universal point values.
- GAMIDES events: https://gamides.com/events/ — AT UTC−2 reference and six four-hour Full Preparedness changes; weekly schedule differences remain.
- Z Tools Full Preparedness: https://ztools.co.uk/wiki/full-preparedness/ — event rotation and task-category context.
- Last Z Wiki Events: https://lastzwiki.com/en/events.html — event catalogue and schedule context.

## Reconciliation and confidence
- Six four-hour Full Preparedness blocks and the fixed UTC−2 Apocalypse Time convention are supported across multiple community references.
- Two potential overlap windows are reported, but the exact eligible actions are not identical between Full Preparedness and Alliance Duel. The UI warns users to inspect both in-game task lists.
- Weekly theme labels and exact day mappings vary by community source and server. The public page retains a reference table with caveats; the interactive clock does not infer a weekly theme.
- Hot Event rotation evidence conflicts: Z Tools describes a four-week cycle while Last Z Wiki describes a three-week cycle. No live dates or universal cycle are hard-coded.
- Reward quantities, point values, thresholds, participation caps and server-specific schedules remain unpublished unless confirmed in the current client.

## Research media
Google-indexed event references were reviewed. Targeted YouTube searches for current Full Preparedness and Alliance Duel walkthroughs returned no directly usable video results in this pass. No video timestamp or in-game recording is claimed as evidence.

## Next evidence needed
1. Current Event Center clock and server reset display.
2. Full Preparedness active theme and next rotation.
3. Alliance Duel current daily task list and eligible action details.
4. The same action checked against both task panels during an overlap window.
5. Current rewards and thresholds for each event edition.


## Additional current-source recheck — 2026-11-10

- SIN Command's current Full Preparedness reference describes six four-hour AT rotations, the five recurring progression themes, and two potential matching windows at 08:00–12:00 and 20:00–00:00 AT.
- LastZ.GG's Alliance Duel guide updated 9 Nov 2026 repeats the two windows and warns that the eligible actions must be checked against both task panels. It also distinguishes the weekly Alliance Duel themes: Mod Vehicle, Shelter Upgrade, Age of Science, Hero Progression, Holistic Growth / Unit Training and Enemy Buster.
- GAMIDES independently states AT is UTC−2 and lists Full Preparedness four-hour changes. It also shows differing event cycle schedules, so LZ Carry does not hard-code the current theme or a universal weekly calendar.
- Targeted YouTube searches on 2026-11-10 for current Laboratory, Full Preparedness / Alliance Duel and hero formation videos returned no directly usable results. No gameplay video, creator or timestamp is claimed as reviewed.

## Planner UI correction
The preparation checklist now lists the five Full Preparedness theme families and excludes Enemy Buster / Combat from the Full Prep theme selector. Enemy Buster remains a separate Alliance Duel day in the weekly reference. The visitor manually selects the current and next theme from the live Event Center; the clock only supplies AT time and the current four-hour boundary. Reward thresholds remain a live-client-only value and are not fabricated.


## Reward-milestone evidence — 2026-11-10
SIN Command's Full Preparedness guide reports three personal task chests per four-hour rotation, Preparedness Medals from task chests, and a daily medal-chest track. The UI therefore tracks three personal chest milestones plus a daily medal-chest reminder. It intentionally leaves point thresholds and reward quantities to the live Event Center because those values are not independently certified across servers / versions.
