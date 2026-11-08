# Guide database format

The public guide directory reads `data/guides.json`. Keep content data separate from page markup.

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

## Publication rules

1. The directory renders only `status: published` records.
2. A published guide must have a stable URL and at least one usable source record.
3. Distinguish official game information from community observations.
4. Record game version, server, or season scope where relevant. Use `null` when unknown; never imply universal coverage.
5. Never fill missing requirements, costs, prerequisites, or rewards with estimates.
6. Re-check time-sensitive information and update `verifiedAt`; remove publication status if it cannot be re-verified.
7. Use ISO dates (`YYYY-MM-DD`) and descriptive units in the guide itself.

The starter database intentionally contains no guide records. Existing topic cards are navigation/planning prompts, not verified reference data.
