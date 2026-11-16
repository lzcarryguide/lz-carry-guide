#!/usr/bin/env python3
"""Validate and install the 15 approved Veil Archives assets from ZIP or individual files."""
import hashlib
import pathlib
import shutil
import zipfile

ROOT = pathlib.Path(".")
TRANSFER = ROOT / "media-transfer"
ZIP = TRANSFER / "veil-media-package.zip"
NESTED = TRANSFER / "individual"
MANIFEST = "MEDIA_SHA256_MANIFEST.txt"
EXPECTED = {
    "stories/assets/before-we-lost-each-other-cover.webp",
    "stories/assets/before-we-lost-each-other-original.png",
    "stories/series/before-we-lost-each-other/episode-01/assets/audio/where-the-silence-stays-episode01.wav",
    *{
        f"stories/series/before-we-lost-each-other/episode-01/assets/pages/{name}"
        for name in (
            "Page_01_Three_Years_Together.jpg", "Page_02_The_Argument.jpg",
            "Page_03_Walking_Away.jpg", "Page_04_The_Crash.jpg",
            "Page_05_The_First_Runner.jpg", "Page_06_Someone_She_Knows.jpg",
            "Page_07_The_Wrong_Impression.jpg", "Page_08_Dont_Let_Me_Go.jpg",
            "Page_09_Run_For_Your_Life.jpg", "Page_10_No_Signal.jpg",
            "Page_11_Can_You_Hear_Me.jpg", "Page_12_A_Reason_To_Hope.jpg",
        )
    },
}

def parse_manifest(raw):
    rows = {}
    for number, line in enumerate(raw.splitlines(), 1):
        if not line.strip():
            continue
        try:
            digest, path = line.split("  ", 1)
        except ValueError:
            raise SystemExit(f"Invalid manifest line {number}")
        if len(digest) != 64 or any(c not in "0123456789abcdef" for c in digest):
            raise SystemExit(f"Invalid SHA-256 on manifest line {number}")
        if path in rows:
            raise SystemExit(f"Duplicate manifest path: {path}")
        rows[path] = digest
    if set(rows) != EXPECTED:
        raise SystemExit(f"Manifest mismatch; missing={sorted(EXPECTED-set(rows))}; extra={sorted(set(rows)-EXPECTED)}")
    return rows

def load_individual(folder):
    manifest = folder / MANIFEST
    if not manifest.is_file():
        raise SystemExit(f"Missing {manifest.as_posix()}")
    rows = parse_manifest(manifest.read_text(encoding="utf-8"))
    names = {pathlib.PurePosixPath(path).name: path for path in EXPECTED}
    if len(names) != len(EXPECTED):
        raise SystemExit("Asset filenames are not unique")
    supplied = {p.name for p in folder.iterdir() if p.is_file() and not p.name.startswith(".") and p.name != MANIFEST}
    if supplied != set(names):
        raise SystemExit(f"Individual upload mismatch; missing={sorted(set(names)-supplied)}; unexpected={sorted(supplied-set(names))}")
    return rows, {path: (folder / pathlib.PurePosixPath(path).name).read_bytes() for path in EXPECTED}

if ZIP.is_file():
    print("Transfer mode: ZIP")
    with zipfile.ZipFile(ZIP) as archive:
        bad = archive.testzip()
        if bad:
            raise SystemExit(f"Corrupt ZIP member: {bad}")
        members = set(archive.namelist())
        if MANIFEST not in members or not EXPECTED.issubset(members):
            raise SystemExit(f"ZIP missing manifest or assets: {sorted((EXPECTED | {MANIFEST})-members)}")
        rows = parse_manifest(archive.read(MANIFEST).decode("utf-8"))
        payloads = {path: archive.read(path) for path in EXPECTED}
    mode = "zip"
elif (NESTED / MANIFEST).is_file():
    print("Transfer mode: individual files in media-transfer/individual/")
    rows, payloads = load_individual(NESTED)
    mode = "nested"
elif (TRANSFER / MANIFEST).is_file():
    print("Transfer mode: individual files in media-transfer/")
    rows, payloads = load_individual(TRANSFER)
    mode = "root"
else:
    raise SystemExit("Upload either veil-media-package.zip or 15 individual assets plus MEDIA_SHA256_MANIFEST.txt into media-transfer/.")

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

if ZIP.exists():
    ZIP.unlink()
if NESTED.exists():
    shutil.rmtree(NESTED)
if mode == "root":
    for path in EXPECTED:
        (TRANSFER / pathlib.PurePosixPath(path).name).unlink()
    (TRANSFER / MANIFEST).unlink()
(TRANSFER / ".gitkeep").unlink(missing_ok=True)
try:
    TRANSFER.rmdir()
except OSError:
    pass
print("SUCCESS: all 15 media assets verified and installed.")
