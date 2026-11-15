The Veil Archives — integration status
Repository: lzcarryguide/lz-carry-guide
Branch: the-veil-archives-integration
Latest source commit: f7265c5b73336cc2d980b479fd3d78cea724f720

The Veil Archives is integrated into the existing LZ Carry static HTML/CSS/JavaScript site under stories/. Parent navigation remains scoped to the seven LZ Carry pages. The six story routes are present: homepage, Discover, series detail, Episode 01, My Library and Updates.

Episode 01 reader code is now integrated in the branch. It references the approved 12-page JPG sequence and original WAV soundtrack, and includes vertical scrolling, page enlargement, fullscreen dialog, previous/next controls, zoom, browser-local bookmark/progress state, and explicit opt-in sound with audio OFF by default. The episode HTML references the supplied source page filenames in the approved reading order. Reader code does not rewrite any page image or embedded lettering.

The homepage, Discover and series detail pages now reference the official cover WebP at stories/assets/before-we-lost-each-other-cover.webp. The original cover PNG is retained at stories/assets/before-we-lost-each-other-original.png. The WebP display derivative was regenerated from the original PNG; the original PNG remains byte-identical.

MEDIA SYNC IS STILL PENDING. The branch tree must contain 15 binary files: cover PNG, cover WebP, twelve original Episode 01 JPGs and the original WAV soundtrack. They are not yet uploaded. The prepared package and PowerShell script verify all 15 source/copy SHA-256 hashes, refuse to overwrite differing existing files, and push only to this development branch. Until the binary upload completes, image/audio resources will not load in a hosted branch preview and the reader acceptance tests cannot pass.

Latest browser regression run before reader integration: run 43715013914 failed (37 passed, 9 failed, 1 skipped). The nine failures were the newly added end-to-end expectations for complete reader and media-backed routes, while the branch still contained placeholder route scaffolding. A new run was triggered for commit f7265c5b73336cc2d980b479fd3d78cea724f720; inspect its result before declaring tests passed. Prior passing run 43701784553 (42 passed, 1 skipped) applied to the earlier scaffolding and did not verify the full comic reader.

No public deployment, merge, or episode release has occurred. PR #54 remains draft. No subscriptions, paywalls, or payment features are present. Existing LZ Carry tools and analytics configuration are preserved.
