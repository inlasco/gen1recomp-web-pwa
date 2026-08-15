#!/usr/bin/env python3
"""Build a regional (localised) ROM manifest for Gen1Recomp Web/PWA.

One driver for the three logical games and every language variant.  It reuses
the upstream Gen1Recomp generators unmodified in spirit - `make_rom_manifest`
for a pokered-shaped tree, `make_blue_manifest` for the Blue derivation,
`make_yellow_manifest` for the pokeyellow derivation - and supplies the two
things they hard-code for English: the canonical ROM SHA-1, and the content
cross-checks that quote English strings (see `locales.py`).

Nothing here is specific to one machine: every input is an explicit argument
or environment variable.

    # French Red
    python3 tools/manifests/make_regional_manifest.py \
        --gen1recomp ~/src/gen1recomp \
        --game red --locale fr \
        --source ~/src/pokered-fr \
        --symbols ~/src/pokered-fr/pokered.sym \
        --rom ~/roms/rouge.gb \
        --out tools/rom_manifest_red_fr.json

    # French Blue (derives from the French Red manifest)
    python3 tools/manifests/make_regional_manifest.py \
        --gen1recomp ~/src/gen1recomp \
        --game blue --locale fr \
        --source ~/src/pokered-fr \
        --symbols ~/src/pokered-fr/pokeblue.sym \
        --base tools/rom_manifest_red_fr.json \
        --rom ~/roms/bleue.gb \
        --out tools/rom_manifest_blue_fr.json

    # French Yellow (derives from the French Red manifest, rebuilds the
    # pokeyellow-shaped sections from the French pokeyellow tree)
    python3 tools/manifests/make_regional_manifest.py \
        --gen1recomp ~/src/gen1recomp \
        --game yellow --locale fr \
        --source ~/src/pokeyellow-fr \
        --symbols ~/src/pokeyellow-fr/pokeyellow.sym \
        --base tools/rom_manifest_red_fr.json \
        --rom ~/roms/jaune.gb \
        --out tools/rom_manifest_yellow_fr.json

`--rom` is optional and is only read to compute its SHA-1; its bytes are never
copied, hashed into the output, or written anywhere.  Use `--rom-sha1` instead
if you would rather not point the tool at a ROM at all.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from locales import extract_locale, profile  # noqa: E402


GAMES = ("red", "blue", "yellow")

# Sections of the shipped manifests that are hand-authored rather than
# generated, because there is nothing in the ROM to extract:
#
#   trainerPartyOverrides - ChiefData is empty in every Gen-1 ROM (the Celadon
#       Chief battle is cut content).  Gen1Recomp reimplements the fight, so
#       the party is authored in the manifest.  data/trainers/parties.asm is
#       "; none" in pokered *and* pokered-fr, so the same override applies to
#       every locale and is carried over rather than re-authored per variant.
DEFAULT_CARRY_OVER = ("trainerPartyOverrides",)


def sha1_of(path):
    h = hashlib.sha1()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def load_upstream(gen1recomp):
    """Import the upstream generator modules from a Gen1Recomp checkout."""
    tools = os.path.join(gen1recomp, "tools")
    if not os.path.isfile(os.path.join(tools, "make_rom_manifest.py")):
        raise SystemExit(
            f"{gen1recomp} does not look like a Gen1Recomp checkout "
            "(tools/make_rom_manifest.py not found)")
    sys.path.insert(0, tools)
    import make_blue_manifest          # noqa: E402
    import make_rom_manifest           # noqa: E402
    import make_yellow_manifest        # noqa: E402
    from extract import util           # noqa: E402
    for name, mod in (("util", util),):
        if not hasattr(mod, "LOCALE"):
            raise SystemExit(
                "the Gen1Recomp checkout is missing the locale-agnostic "
                "extractor patch (extract.util.LOCALE); see "
                "tools/manifests/README.md")
    return {
        "util": util,
        "red": make_rom_manifest,
        "blue": make_blue_manifest,
        "yellow": make_yellow_manifest,
    }


def build(mods, args, spec, rom_sha1):
    util = mods["util"]
    util.LOCALE = extract_locale(args.locale)

    if args.game == "red":
        saved = util.ASM_DEFINES
        util.ASM_DEFINES = {"_RED"}
        try:
            return mods["red"].generate(args.source, args.symbols,
                                        rom_sha1=rom_sha1)
        finally:
            util.ASM_DEFINES = saved

    with open(args.base, encoding="utf-8") as f:
        base = json.load(f)

    if args.game == "blue":
        banner = spec["creditsBanner"]["blue"]
        return mods["blue"].derive(base, args.source, args.symbols,
                                   rom_sha1=rom_sha1, expect_banner=banner)

    manifest, meta = mods["yellow"].derive(base, args.source, args.symbols,
                                           rom_sha1=rom_sha1)
    print(f"yellow: {len(manifest['symbols'])} symbols, "
          f"{meta['aliasCount']} aliases, "
          f"{len(meta['droppedSymbols'])} dropped")
    return manifest


def main():
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--gen1recomp",
                        default=os.environ.get("GEN1RECOMP"),
                        help="upstream Gen1Recomp checkout (env: GEN1RECOMP)")
    parser.add_argument("--game", required=True, choices=GAMES)
    parser.add_argument("--locale", default="fr",
                        help="locale profile id (see locales.py)")
    parser.add_argument("--source", required=True,
                        help="disassembly checkout (pokered-fr / pokeyellow-fr)")
    parser.add_argument("--symbols", required=True, help=".sym from that build")
    parser.add_argument("--base",
                        help="base manifest for blue/yellow derivation")
    parser.add_argument("--rom", help="ROM to take the canonical SHA-1 from")
    parser.add_argument("--rom-sha1", help="canonical SHA-1, instead of --rom")
    parser.add_argument(
        "--carry-over-from",
        help="shipped manifest of the same logical game to copy the "
             "hand-authored, ROM-independent sections from")
    parser.add_argument(
        "--carry-over", action="append", default=None, metavar="KEY",
        help="top-level key to carry over (repeatable); "
             f"default: {', '.join(DEFAULT_CARRY_OVER)}")
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    if args.carry_over is None:
        args.carry_over = list(DEFAULT_CARRY_OVER)

    if not args.gen1recomp:
        raise SystemExit("--gen1recomp (or $GEN1RECOMP) is required")
    for key in ("gen1recomp", "source", "symbols", "base", "rom", "out"):
        value = getattr(args, key)
        if value:
            setattr(args, key, os.path.abspath(value))

    if args.game in ("blue", "yellow") and not args.base:
        raise SystemExit(f"--base is required for --game {args.game}")
    if not os.path.isfile(os.path.join(args.source, "main.asm")):
        raise SystemExit(f"{args.source} is not a disassembly checkout")

    if args.rom_sha1:
        rom_sha1 = args.rom_sha1.lower()
    elif args.rom:
        rom_sha1 = sha1_of(args.rom)
    else:
        raise SystemExit("one of --rom / --rom-sha1 is required")

    spec = profile(args.locale)
    mods = load_upstream(args.gen1recomp)
    manifest = build(mods, args, spec, rom_sha1)

    carried = []
    if args.carry_over_from:
        with open(args.carry_over_from, encoding="utf-8") as f:
            reference = json.load(f)
        for key in args.carry_over:
            if manifest.get(key) is None and reference.get(key) is not None:
                manifest[key] = reference[key]
                carried.append(key)
            elif reference.get(key) is None:
                raise SystemExit(
                    f"--carry-over {key}: not present in {args.carry_over_from}")
    elif args.carry_over:
        missing = [k for k in args.carry_over if manifest.get(k) is None]
        if missing:
            raise SystemExit(
                "the generator produced no " + ", ".join(missing)
                + "; pass --carry-over-from <shipped manifest> or "
                  "--carry-over '' to accept the gap")

    manifest["variant"] = {
        "game": args.game,
        "locale": spec["id"],
        "language": spec["language"],
    }
    if manifest["romSha1"] != rom_sha1:
        raise SystemExit(
            f"generator wrote romSha1={manifest['romSha1']}, expected {rom_sha1}")

    os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
    with open(args.out, "w", encoding="utf-8", newline="\n") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write("\n")
    print(f"wrote {args.out}  ({args.game}/{spec['id']}, sha1 {rom_sha1}"
          + (f", carried over: {', '.join(carried)}" if carried else "") + ")")


if __name__ == "__main__":
    main()
