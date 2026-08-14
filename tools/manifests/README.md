# Regional manifest generation

How the three French import manifests in `tools/` were produced, and how to
reproduce them byte-for-byte.

```text
tools/rom_manifest_red_fr.json      Pokémon Version Rouge  (FR)
tools/rom_manifest_blue_fr.json     Pokémon Version Bleue  (FR)
tools/rom_manifest_yellow_fr.json   Pokémon Version Jaune  (FR)
```

The three English manifests (`rom_manifest.json`, `rom_manifest_blue.json`,
`rom_manifest_yellow.json`) live inside the `.love` and are **not** regenerated
here: they are the baseline this build was validated against and are shipped
unchanged.

No ROM byte is read, copied or stored by any step below. `--rom` is used only
to compute a SHA-1; pass `--rom-sha1` instead if you would rather not point the
tool at a cartridge dump at all.

## What you need

| input | why | where |
| --- | --- | --- |
| `rgbds` 1.0.1 | assembles the disassemblies | <https://github.com/gbdev/rgbds> |
| a Gen1Recomp checkout | the upstream manifest generators | <https://github.com/bryanthaboi/gen1recomp> |
| `einstein95/pokered-fr` | Rouge + Bleue source and symbols | <https://github.com/einstein95/pokered-fr> |
| `Narishma-gb/pokeyellow-fr` | Jaune source and symbols | <https://github.com/Narishma-gb/pokeyellow-fr> |

The manifests in this repository were generated against:

| repository | commit |
| --- | --- |
| `bryanthaboi/gen1recomp` | `4395792` |
| `einstein95/pokered-fr` | `7ddc547e` |
| `Narishma-gb/pokeyellow-fr` | `0c4b7313` |

## 1. Build the French ROMs and symbol files

The disassemblies are reproducible: the ROM they assemble is byte-identical to
the retail cartridge dump, which is what makes their `.sym` files a
trustworthy source of addresses.

```sh
git clone https://github.com/einstein95/pokered-fr
git clone https://github.com/Narishma-gb/pokeyellow-fr
make -C pokered-fr      # -> pokered.gbc  pokered.sym
                        #    pokeblue.gbc pokeblue.sym
make -C pokeyellow-fr   # -> pokeyellow.gbc pokeyellow.sym
```

Verify before going further — every hash below must match:

```text
47a7622fa30e6402a3891fe65b3a930bf9bd7aec  pokered-fr/pokered.gbc
47faa910d0e073c600665bf9c83b6bd17babdf8a  pokered-fr/pokeblue.gbc
0aceec0ef7aa2ca5aa831554598d91f61a925591  pokeyellow-fr/pokeyellow.gbc
```

## 2. Make the upstream extractors locale-agnostic

`gen1recomp-locale-agnostic.patch` widens the handful of upstream extractors
that assumed English content. Every hunk is a widening, not a relaxation: the
checks stay strict, they just learn which text they are checking for.

```sh
git clone https://github.com/bryanthaboi/gen1recomp
git -C gen1recomp apply /path/to/tools/manifests/gen1recomp-locale-agnostic.patch
```

What it changes, and why:

| file | change |
| --- | --- |
| `extract/util.py` | adds `LOCALE`, the swap-in table of locale-dependent expectations (same idiom as the existing `ASM_DEFINES`) |
| `extract/field.py` | Route 23 badge identity comes from the pointer label, not the displayed caption (`"BADGE TERRE"` is not an item key); the Game Corner cross-check matches the price/coins numbers rather than the English sentence; the town-map check verifies coordinates and cursor order rather than English location names; the credits banner and screen count come from the locale profile |
| `extract/gfx.py` | the credits "THE END" tilemap reads its caption from the locale profile ("THEND" is 5 columns, "FIIN" is 4) |
| `extract/pokemon.py` | detects whether dex entries store height as feet+inches or as a single decimetre byte, and reports it |
| `make_rom_manifest.py` | takes `rom_sha1`; emits the new `pokedex` measurement block; chains text-label substitutions across a label that falls through into the next one |
| `make_blue_manifest.py` | takes `rom_sha1` and the expected credits banner |
| `make_yellow_manifest.py` | takes `rom_sha1`; re-reads the dex measurement system from the pokeyellow tree |

**The patch is behaviour-preserving for English.** Regenerating the three
English manifests with and without it produces byte-identical JSON apart from
the additive `pokedex` block:

```sh
python3 gen1recomp/tools/make_rom_manifest.py \
    --pokered pokered --symbols pokered/pokered.sym --out /tmp/red.json
```

## 3. Generate the three French manifests

`make_regional_manifest.py` is the single driver. Every input is an explicit
argument or environment variable; nothing is hard-coded to a machine.

```sh
export GEN1RECOMP=~/src/gen1recomp

# Rouge FR
python3 tools/manifests/make_regional_manifest.py \
  --game red --locale fr \
  --source ~/src/pokered-fr \
  --symbols ~/src/pokered-fr/pokered.sym \
  --rom-sha1 47a7622fa30e6402a3891fe65b3a930bf9bd7aec \
  --carry-over-from <shipped rom_manifest.json> \
  --out tools/rom_manifest_red_fr.json

# Bleue FR — derived from the Rouge FR manifest, re-sourced from pokeblue.sym
python3 tools/manifests/make_regional_manifest.py \
  --game blue --locale fr \
  --source ~/src/pokered-fr \
  --symbols ~/src/pokered-fr/pokeblue.sym \
  --base tools/rom_manifest_red_fr.json \
  --rom-sha1 47faa910d0e073c600665bf9c83b6bd17babdf8a \
  --carry-over-from <shipped rom_manifest_blue.json> \
  --out tools/rom_manifest_blue_fr.json

# Jaune FR — derived from the Rouge FR manifest, Yellow sections rebuilt
# from the French pokeyellow tree
python3 tools/manifests/make_regional_manifest.py \
  --game yellow --locale fr \
  --source ~/src/pokeyellow-fr \
  --symbols ~/src/pokeyellow-fr/pokeyellow.sym \
  --base tools/rom_manifest_red_fr.json \
  --rom-sha1 0aceec0ef7aa2ca5aa831554598d91f61a925591 \
  --carry-over-from <shipped rom_manifest_yellow.json> \
  --out tools/rom_manifest_yellow_fr.json
```

`--carry-over-from` copies the sections of a shipped manifest that are
hand-authored rather than generated. Today that is `trainerPartyOverrides`:
`ChiefData` is empty in every Gen-1 ROM (the Celadon Chief battle is cut
content), so Gen1Recomp authors that party in the manifest. `pokered-fr` is
`; none` there too, so the same override applies to every locale. The shipped
manifests are inside the `.love`; unzip it to reach them.

## 4. Generate the save-converter charmaps

Raw `.sav` name fields are charmap-encoded bytes and the French releases
re-point the upper half of that table (`$BA` is `é` internationally and `à` in
French). Those crosswalks are committed, not extracted at import time:

```sh
cd gen1recomp/tools
python3 -m extract.charmap --pokered ~/src/pokered-fr \
    --out src/save_convert/data/charmap_fr.lua
python3 -m extract.charmap --pokered ~/src/pokeyellow-fr \
    --out src/save_convert/data/charmap_fr_yellow.lua
```

Jaune gets its own file because `pokered-fr` and `pokeyellow-fr` disagree on a
few bracketed encode-only tokens. (`pret/pokered` and `pret/pokeyellow` agree,
which is why the international build ships a single `charmap.lua`.)

## 5. Adding another language later

Add a profile to `locales.py` (`theEndLetters`, `theEndDisplay`,
`creditsBanner`, `creditsScreens`), add the game/variant rows to
`src/core/GameVersion.lua`, run steps 1–4 against that disassembly. Nothing
else in the engine has to change.
