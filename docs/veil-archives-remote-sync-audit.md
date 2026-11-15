# Remote media synchronization audit

Date: 15 November 2026
Repository: lzcarryguide/lz-carry-guide
Branch: the-veil-archives-integration

## Result

The branch exists and the latest branch tree was inspected. It contains the Veil route scaffolding and parent-navigation entries, but none of the new Veil media files are committed. The only image in the branch inventory is the pre-existing LZ Carry asset assets/weeping-angel.png.

The local creator ZIP was opened and its content inventory verified. It contains 15 binary media files totaling 15,045,493 bytes: two cover files (the original PNG plus the display WebP), twelve original Episode 01 JPG pages, and one original WAV soundtrack. Their SHA-256 hashes are recorded in veil-archives-assets.sha256.

## Why synchronization is incomplete

The connected GitHub operations available in this session support repository text-file writes and Git-object creation from content supplied as text/base64. They do not expose a direct binary-file upload from the local container, while direct Git network access from this execution environment is unavailable. I therefore cannot safely transfer the 15 MB media set byte-for-byte to the repository from this session.

I did not substitute compressed or regenerated comic pages, fabricate remote media, or mark missing image/audio resources as uploaded. The branch's explicit asset-sync preview state remains in place.

## Verification

- Local ZIP integrity: passed.
- Local binary media inventory: 15 files / 15,045,493 bytes.
- Local original cover PNG matches the separately supplied cover file byte-for-byte (SHA-256: 548d0aad88cfd608b8b8c55af3920ac1e7a95b13ecdb47010366d7bc0c04e432).
- Local cover, 12-page sequence, and audio SHA-256 manifest: generated.
- Remote branch tree inspected: passed; all 15 new media files are absent.
- GitHub Actions Chromium run 43701381551: passed; 42 passed, 1 skipped in 27.7 seconds, on commit 931f9d1abe2891696079249816592b0429bb1795.
- Browser checks covered route availability, homepage links, Discover search/genre/status filters, local favorites, mobile navigation and responsive overflow at 1440 / 768 / 390 / 320 px. The live LZ Carry primary-page smoke test also passed.
- Actual Chromium screenshots of the current branch homepage, Discover, series page, and Episode 01 status route were captured in workflow artifact https://github.com/lzcarryguide/lz-carry-guide/actions/runs/43701381551/artifacts/14156901169.
- Episode 01 comic images, zoom/fullscreen behavior, saved comic scroll restoration, previous/next episode behavior, and WAV playback: not tested on the remote branch because the media and integrated reader are not yet present there.
- A local Chromium attempt in this environment was blocked/timed out; the successful browser run was executed on GitHub Actions hosted runners.
- Hosted branch URL: unavailable. The current repository workflow runs tests and creates artifacts; it does not publish a branch-specific GitHub Pages preview. No deployment was attempted.

## Next required synchronization step

Upload the 15 original binary files to the exact paths listed in veil-archives-assets.sha256 using a Git-capable client or GitHub's repository file upload. Then run `sha256sum -c` from the repository root. All entries must pass before replacing the explicit route placeholders with the media-backed homepage and existing 12-page reader.

Draft PR #54 remains open for review only. It has not been merged. No Pages deployment or public episode release was performed.
