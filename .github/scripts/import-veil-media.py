#!/usr/bin/env python3
"""Validate and install the 15 approved Veil Archives assets from ZIP or flat files."""
import hashlib
import pathlib
import shutil
import zipfile

ROOT = pathlib.Path(".")
TRANSFER = ROOT / "media-transfer"
ZIP = TRANSFER / "veil-media-package.zip"
INDIVIDUAL = TRANSFER / "individual"
MANIFEST = "MEDIA_SHA256_MANIFEST.txt"

EXPECTED = {
    "stories/assets/before-we-lost-each-other-cover.webp",
    "stories/assets/before-we-lost-each-other-original.png",
    "stories/series/before-we-lost-each-other/episode-01/assets/audio/where-the-silence-stays-episode01.wav",
    *{
        f"stories/series/before-we-lost-each-other/episode-01/assets/pages/{name}"
        for name in (
            "Page_01_Three_Years_Together.jpg",
            "Page_02_The_Argument.jpg",
            "Page_03_Walking_Away.jpg",
            "Page_04_The_Crash.jpg",
            "Page_05_The_First_Runner.jpg",
            "Page_06_Someone_She_Knows.jpg",
            "Page_07_The_Wrong_Impression.jpg",
            "Page_08_Dont_Let_Me_Go.jpg",
            "Page_09_Run_For_Your_Life.jpg",
            "Page_10_No_Signal.jpg",
            "Page_11_Can_You_Hear_Me.jpg",
            "Page_12_A_Reason_To_Hope.jpg",
        )
    },
}


def parse_manifest(raw):
    rows = {}
    for line_number, line in enumerate(raw.splitlines(), 1):
        if not line.strip():
            continue
        try:
            digest, path = line.split("  ", 1)
        except ValueError:
            raise SystemExit(f"Invalid manifest line {line_number}")
        if len(digest) != 64 or any(c not in "0123456789abcdef" for c in digest):
            raise SystemExit(f"Invalid SHA-256 on manifest line {line_number}")
        if path in rows:
            raise SystemExit(f"Duplicate manifest path: {path}")
        rows[path] = digest
    if set(rows) != EXPECTED:
        raise SystemExit(
            f"Manifest path mismatch; missing={sorted(EXPECTED-set(rows))}; "
            f"extra={sorted(set(rows)-EXPECTED)}"
        )
    return rows


def load_zip():
    print("Transfer mode: ZIP")
    with zipfile.ZipFile(ZIP) as archive:
        bad = archive.testzip()
        if bad:
            raise SystemExit(f"Corrupt ZIP member: {bad}")
        names = set(archive.namelist())
        if MANIFEST not in names:
            raise SystemExit(f"ZIP missing {MANIFEST}")
        if not EXPECTED.issubset(names):
            raise SystemExit(f"ZIP missing assets: {sorted(EXPECTED-names)}")
        rows = parse_manifest(archive.read(MANIFEST).decode("utf-8"))
        return rows, {path: archive.read(path) for path in EXPECTED}


def load_individual():
    print("Transfer mode: individual files")
    manifest = INDIVIDUAL / MANIFEST
    if not manifest.is_file():
        raise SystemExit(f"Missing {manifest.as_posix()}")
    rows = parse_manifest(manifest.read_text(encoding="utf-8"))
    names = {pathlib.PurePosixPath(path).name: path for path in EXPECTED}
    if len(names) != len(EXPECTED):
        raise SystemExit("Asset basenames are not unique; cannot safely map flat upload")
    supplied = {p.name for p in INDIVIDUAL.iterdir() if p.is_file() and p.name != MANIFEST}
    if supplied != set(names):
        raise SystemExit(
            f"Individual files mismatch; missing={sorted(set(names)-supplied)}; "
            f"unexpected={sorted(supplied-set(names))}"
        )
    return rows, {
        path: (INDIVIDUAL / pathlib.PurePosixPath(path).name).read_bytes()
        for path in EXPECTED
    }


if ZIP.is_file():
    rows, payloads = load_zip()
elif INDIVIDUAL.is_dir():
    rows, payloads = load_individual()
else:
    raise SystemExit(
        "No media transfer found. Upload either veil-media-package.zip or "
        "15 individual assets plus MEDIA_SHA256_MANIFEST.txt to media-transfer/individual/."
    )

# Verify all bytes before writing any production asset paths.
for path in sorted(EXPECTED):
    actual = hashlib.sha256(payloads[path]).hexdigest()
    if actual != rows[path]:
        raise SystemExit(f"SHA-256 mismatch: {path}")
    print(f"VERIFIED {actual}  {path}")

for path in sorted(EXPECTED):
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(payloads[path])

manifest_text = "".join(f"{rows[path]}  {path}\n" for path in sorted(EXPECTED))
(ROOT / "docs/veil-archives-assets.sha256").write_text(manifest_text, encoding="utf-8")

# Remove staging files only after all 15 assets pass validation and installation.
if ZIP.exists():
    ZIP.unlink()
if INDIVIDUAL.exists():
    shutil.rmtree(INDIVIDUAL)
(TRANSFER / ".gitkeep").unlink(missing_ok=True)
try:
    TRANSFER.rmdir()
except OSError:
    pass
print("SUCCESS: all 15 original media assets verified and installed.")
