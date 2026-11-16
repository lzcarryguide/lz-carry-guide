# The Veil Archives — mobile media import

PR #54 now has a mobile-friendly import path for the original Episode 01 artwork and the newly composed soundtrack.

## Package contents

Upload `Veil_Archives_Episode01_Mobile_Transfer.zip` as one file. It contains exactly 15 media assets:
- 12 creator-supplied Episode 01 JPG pages, copied byte-for-byte from the recovered integration media archive.
- The approved original cover PNG and approved WebP derivative, copied byte-for-byte.
- A new original 48-second ambient piano composition, `where-the-silence-stays-episode01.wav` (stereo, 16-bit PCM, 22,050 Hz).
- A SHA-256 manifest covering all 15 assets.

The previous WAV from the archive is deliberately not included because the owner clarified that no soundtrack had been supplied or approved. The comic artwork is not regenerated, retouched, or otherwise altered.

## Upload from a phone

1. Download the ZIP linked in the ChatGPT conversation.
2. Open the development branch: https://github.com/lzcarryguide/lz-carry-guide/tree/the-veil-archives-integration
3. Choose **Add file → Upload files**.
4. Upload the ZIP and set its repository path to `media-transfer/veil-media-package.zip`.
5. Commit directly to `the-veil-archives-integration`.

A GitHub Actions workflow at `.github/workflows/veil-media-mobile-import.yml` will then:
- verify the exact 15-file manifest and every SHA-256 hash;
- reject unexpected or missing media paths;
- install only the expected media assets;
- replace the repository media manifest;
- remove the uploaded transfer ZIP; and
- commit the verified media to the development branch.

The workflow has no secrets in the package and does not merge PR #54 or deploy the website. It uses the repository's scoped GitHub Actions token to commit only after successful validation.

## Release gate

After the import workflow succeeds, rerun and inspect the full browser suite. Do not merge or deploy until all 12 comic images, the new soundtrack, reader controls, progress/bookmarks, desktop/mobile layouts, parent-site regression checks, and Cloudflare Analytics are verified.
