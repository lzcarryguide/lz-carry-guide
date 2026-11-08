# HQ progression dataset specification

File: `data/hq-requirements.json`

The dataset is intentionally empty until level-by-level requirements can be verified. Do not infer costs from a single account, interpolate missing levels, or copy values without checking the source and game version.

## Top-level structure

- `schemaVersion`: currently `1`.
- `game`: `Last Z`.
- `scope`: intended HQ range (1–35); this does not imply all records are populated.
- `lastUpdated`: ISO date of the last complete data review, otherwise `null`.
- `levels`: one record per HQ upgrade target level. Empty is valid.

## HQ level record

```json
{
  "hqLevel": 2,
  "upgrade": {
    "durationSeconds": null,
    "resources": [
      { "id": "food", "name": "Food", "amount": 0, "unit": "game resource" }
    ]
  },
  "requiredBuildings": [
    {
      "buildingId": "stable-id",
      "name": "Building name as shown in game",
      "requiredLevel": 1
    }
  ],
  "prerequisites": [
    {
      "type": "building | research | quest | other",
      "name": "Exact in-game requirement",
      "requiredLevel": null,
      "note": null
    }
  ],
  "sources": [
    {
      "name": "In-game HQ upgrade screen",
      "url": null,
      "type": "in-game | official | community",
      "checkedAt": "YYYY-MM-DD",
      "gameVersion": null,
      "serverScope": "server/season or general",
      "note": "Record what was directly observed"
    }
  ],
  "verifiedAt": "YYYY-MM-DD",
  "confidence": "high | medium | low",
  "verificationNote": "Explain how the values and prerequisites were checked"
}
```

The sample above documents field types only; it is not a real level record and must not be copied into the production dataset.

## Data integrity rules

1. Only add an HQ level when all required buildings, resource costs, and prerequisites visible for that upgrade have been checked.
2. Use exact resource quantities as integers and retain explicit units. Do not use rounded values.
3. Record building requirements separately from other prerequisite types.
4. Record the source, date, game version, and server/season scope for every level.
5. When sources disagree, retain the discrepancy in a review note and do not publish a definitive value until resolved.
6. Missing values stay `null` or the field remains absent; never substitute a guess.
7. The in-game upgrade screen is the primary reference for the account/server being checked. Community databases can corroborate but must be labeled as community sources.
8. A planner must distinguish "unknown/not yet verified" from "not required".
9. Do not calculate total target costs from an incomplete range. Only sum levels for which all required cost fields are verified.
