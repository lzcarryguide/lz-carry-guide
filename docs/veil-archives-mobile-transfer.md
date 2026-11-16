# The Veil Archives — mobile media import

PR #54 includes a validated media import workflow for the approved Episode 01 assets. The workflow accepts either one ZIP archive or the expected individual media files. Both methods install the same fixed 15-path media set and verify every SHA-256 digest against the manifest.

## Approved package contents

Exactly 15 media assets are expected:

- 12 creator-supplied Episode 01 JPG pages, copied byte-for-byte.
- The approved original cover PNG and approved WebP derivative, copied byte-for-byte.
- The newly composed original ambient piano soundtrack, `where-the-silence-stays-episode01.wav` (48 seconds, stereo, 16-bit PCM, 22,050 Hz).
- A SHA-256 manifest covering all 15 assets.

The earlier archive WAV is deliberately excluded. The comic artwork and approved covers must not be regenerated, retouched, recompressed, cropped, or replaced.

## Method A — upload one ZIP (recommended for phones)

1. Download the current `veil-media-package.zip` transfer package.
2. Open the branch upload folder: https://github.com/lzcarryguide/lz-carry-guide/tree/the-veil-archives-integration/media-transfer
3. Choose **Add file → Upload files**.
4. Upload the ZIP using the exact filename `veil-media-package.zip`.
5. Commit directly to `the-veil-archives-integration`.

The workflow recognizes the ZIP by its supported package name and extracts only the expected paths.

## Method B — upload individual files

Use this method if the device or GitHub upload interface cannot upload a ZIP.

1. Open the same `media-transfer` folder on the development branch.
2. Create an `individual` subfolder inside `media-transfer/` and upload all 15 media files plus the manifest into that folder. Keep the exact original filenames; do not recreate the asset subfolders in individual-file mode.
3. Include the SHA-256 manifest file exactly as supplied.
4. Commit the complete set to `the-veil-archives-integration`.

For individual-file mode, the importer expects a flat set of 15 files plus the manifest either in `media-transfer/individual/` or directly in `media-transfer/`. The manifest maps each filename to its canonical repository path. Do not rename assets or omit the manifest. A partial or mixed upload is rejected; the import must match the exact 15 expected assets and hashes.

## What the import workflow does

The workflow at `.github/workflows/veil-media-mobile-import.yml`:

- accepts the supported ZIP or individual-file transfer layout;
- validates the manifest, expected paths, and every SHA-256 digest;
- rejects missing, duplicate, unexpected, or mismatched media;
- installs only the approved expected assets without recompressing them;
- updates `docs/veil-archives-assets.sha256`;
- removes temporary transfer files; and
- commits the validated media to the development branch.

It does not merge PR #54 or deploy the website. The package contains no repository secrets.

## Current synchronization status

As of 16 November 2026, the 15 approved media files have been imported into `the-veil-archives-integration`. The import workflow run [#43876092900](https://github.com/lzcarryguide/lz-carry-guide/actions/runs/43876092900) completed successfully. This confirms import and hash validation, not browser acceptance.

## Release gate

Run and inspect the complete browser suite against the latest media-complete commit. Do not merge PR #54 or deploy until all twelve original page images, both covers, the new soundtrack, reader controls, bookmarks/progress, responsive layouts, and existing LZ Carry regression checks have passed. Live Cloudflare Analytics event collection must be verified separately from static beacon presence.
