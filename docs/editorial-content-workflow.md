# LZ Carry editorial and publication workflow

## Purpose

Keep new or changed Last Z content out of the public site until its evidence, wording and presentation have been reviewed. Evidence status and editorial publication status are separate: a community-supported or unconfirmed item may be published only when the page clearly communicates that limitation and the player is not misled into treating it as an in-game fact.

## Workflow

1. **Prepare** — Create a focused content branch from the latest `main`. Identify the affected records, player-facing purpose, source links, server/season scope and any missing evidence.
2. **Draft** — Keep draft text, screenshots and proposed records on that development branch or in the PR discussion. Do not place draft-only records in public `data/*.json`, public HTML, or any asset path served by GitHub Pages.
3. **Verify** — Prefer current in-game screenshots or official publisher material. For community evidence, seek independent corroboration and record source date, server/season scope and disagreements. Do not convert a community report into "Verified".
4. **Review** — Check terminology, prerequisites, calculations, internal links, mobile presentation, accessibility and whether the proposed recommendation is actually supported. Keep unresolved items visibly Unconfirmed or Outdated.
5. **Publish** — Only after review, copy the approved content into public site files, retain its evidence label and caveats, add/update regression tests, and request PR review. Merge only after the preview checks and a human visual/content review pass.

## Evidence labels

- **Verified** — checked against the current game client or an official publisher source.
- **Community-supported** — corroborated by community references, but not publisher-certified or confirmed in the current client.
- **Estimated** — derived from a disclosed calculation or assumption.
- **Outdated** — previously supported but needs rechecking.
- **Unconfirmed** — incomplete, conflicting or awaiting confirmation.

These labels describe evidence, not whether the editorial team has approved publication.

## Static-site publication guard

`scripts/validate-public-content.js` scans public JSON data for explicit editorial states such as `draft`, `in-review`, `pending-review`, `unpublished` and `rejected`, and rejects `published: false` / `isPublished: false`. Run it before proposing a content change:

```sh
node scripts/validate-public-content.js
```

Drafts should remain on non-production branches. GitHub Pages serves repository files as static assets, so merely hiding a draft in the interface is not sufficient protection. The guard is a backstop, not a substitute for review: content should still be checked against evidence and the PR must describe its verification limits.

## Safety and provenance

- Never invent game requirements, prices, event schedules, rewards, skills or lineup positions.
- Do not include passwords, login codes, player account credentials or private customer data in content or screenshots.
- Do not use game art or third-party artwork without documented permission.
- Preserve existing records and player-entered local progress; prefer additive edits and tested migrations.
