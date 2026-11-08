# Guide database format

The public guide directory reads `data/guides.json`. Keep original LZ Carry writing and content data separate from page markup. External sites may inform fact-checking, but their prose, layouts, graphics, and guide structures must not be copied or closely reproduced.

## Top-level fields

- `schemaVersion`: integer. Increment only when the record structure changes incompatibly.
- `lastUpdated`: ISO 8601 date or `null`.
- `entries`: array of guide records. An empty array is valid and means no written guides are published yet.

## Guide record

```json
{
  "id": "stable-kebab-case-id",
  "title": "Guide title",
  "summary": "Concise, factual description",
  "category": "beginner | research | heroes | events",
  "stage": ["early", "mid", "late"],
  "tags": ["searchable", "terms"],
  "url": "beginner.html#section-id",
  "status": "draft | reviewed | published",
  "gameVersion": null,
  "serverScope": "general | server-specific | season-specific",
  "sources": [
    {
      "name": "Source title or in-game screen",
      "url": "https://...",
      "type": "in-game | official | community",
      "checkedAt": "YYYY-MM-DD",
      "note": "What the source verifies"
    }
  ],
  "verifiedAt": "YYYY-MM-DD",
  "verificationNote": "What was checked and any limitations"
}
```

## Research and publication rules

1. The directory renders only `status: published` records.
2. Write public explanations, tables, examples, and tools in LZ Carry’s own voice and format. Do not place external guide-site links in visitor-facing guide content.
3. Keep source URLs, research notes, comparisons, and verification history in repository research records; show source names/status only when useful to explain confidence.
4. A published guide must have a stable URL and at least one usable source record.
5. Distinguish official game information from community observations.
6. Record game version, server, or season scope where relevant. Use `null` when unknown; never imply universal coverage.
7. Never fill missing requirements, costs, prerequisites, or rewards with estimates.
8. Re-check time-sensitive information and update `verifiedAt`; remove publication status if it cannot be re-verified.
9. Use ISO dates (`YYYY-MM-DD`) and descriptive units in the guide itself.

The starter database intentionally contains no guide records. Existing topic cards are navigation/planning prompts, not verified reference data.
