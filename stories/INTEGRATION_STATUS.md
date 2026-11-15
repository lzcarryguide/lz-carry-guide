The Veil Archives — integration status

Repository: lzcarryguide/lz-carry-guide
Branch: the-veil-archives-integration
Base: main at 2b2a41d4ad02849ee43fcd0239ee731bb8279886

Parent navigation entries are added on the seven existing LZ Carry public pages. Static route/style/script scaffolding is committed under stories/. Browser regression coverage for the Veil routes, Discover filters, local favorites, responsive overflow, and the preview-state Episode 01 route is added in tests/veil-archives-preview.spec.js. The existing parent navigation regression test was updated for the additional link.

MEDIA SYNC IS STILL INCOMPLETE. The local creator ZIP contains 15 binary media files totaling 15,045,493 bytes: the original approved cover PNG, its WebP display derivative, all 12 original Episode 01 JPG pages, and the original WAV soundtrack. None of these 15 new files is present in the remote branch tree. The original artwork is preserved locally in the creator ZIP and has not been changed.

The connected repository action supports text writes and base64 Git blobs, but this session has no direct binary-file upload from the local container, and direct Git network access is unavailable. Do not treat this branch as a complete hosted reader. The existing route pages retain explicit preview / asset-sync status rather than showing substitute artwork or broken media references.

See docs/veil-archives-remote-sync-audit.md and docs/veil-archives-assets.sha256 for the full inventory and exact SHA-256 verification list.

No existing LZ Carry tool or analytics configuration was intentionally changed. No payment/subscription feature has been added. No PR, merge, public deployment, or public release has been performed.
