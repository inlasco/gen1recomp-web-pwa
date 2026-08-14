# Native French ROM support

Adds native support for the official French Pokémon **Rouge**, **Bleue** and
**Jaune** cartridges to the Web/PWA baseline, alongside the US ROMs already
supported. The player imports their own French cartridge dump from the
existing importer; nothing else changes.

Status: **published as its own artifact; the stable build is untouched and
stays online beside it.**

```text
game-v13.3-viewport-final.love   previous build, US only, kept for rollback
game-v13.4-fr.love               this work, US + FR
```

`index.html` decides which one the shell loads (the `g=` parameter on
`player.js`). Rolling back is one line, with no re-upload.

## Architecture

Three logical games, each with one or more regional variants.

```text
Game     red | blue | yellow          the identity mods, scripts and the
                                      launcher tabs key off — never six
Variant  us  | fr                     which bytes we accept, and where the
                                      extracted data and the save live
```

| game | variant | ROM SHA-1 | manifest | cache | save |
| --- | --- | --- | --- | --- | --- |
| red | us | `ea9bcae6…` | `rom_manifest.json` | `red/` | `save.lua` |
| red | fr | `47a7622f…` | `rom_manifest_red_fr.json` | `red-fr/` | `save_fr.lua` |
| blue | us | `d7037c83…` | `rom_manifest_blue.json` | `blue/` | `save_blue.lua` |
| blue | fr | `47faa910…` | `rom_manifest_blue_fr.json` | `blue-fr/` | `save_blue_fr.lua` |
| yellow | us | `cc7d0326…` | `rom_manifest_yellow.json` | `yellow/` | `save_yellow.lua` |
| yellow | fr | `0aceec0e…` | `rom_manifest_yellow_fr.json` | `yellow-fr/` | `save_yellow_fr.lua` |

Every US row is byte-for-byte what the baseline already used, so an existing
install keeps finding its caches and its saves.

`src/core/GameVersion.lua` is the single source of truth. `GameVersion.info()`
resolves a (game, variant) pair into one frozen record carrying the SHA-1,
manifest path, cache prefix, save suffix, save id, language, region and display
name. `GameVersion.identify(sha1)` returns the pair; `GameVersion.forSha1()`
keeps its historical single-value contract for the call sites that only care
which column a ROM lands in.

`GameVersion.VERSIONS` still has exactly three keys, and reads through it
resolve the currently selected variant of that game — so the ~40 historical
call sites are correct for a French playthrough without being touched, and the
mod layer still sees `red`, `blue`, `yellow` and nothing else.

## What is and is not in this repository

A French cartridge's **content** — dialogue, Pokémon and move names, items,
Pokédex entries — is decoded from the player's own ROM at import time and
cached privately in the browser. None of it is in this repository, and none of
it is in the `.love`.

What the repository carries is technical metadata: symbol addresses, table
shapes, charmaps, extraction rules. Plus one original French catalog for the
strings **Gen1Recomp itself authors** (menu labels, option rows, PC/bag
prompts) — see `data/strings/fr.lua` inside the `.love`.

`src/core/RomText.lua` already prefers the extracted ROM line over the engine's
own literal, so battle and field messages read French on a French import
without any catalog entry.

## Regional differences that needed real work

Not everything is a hash swap. These are genuine structural differences
between the international and French releases, found by running the extractor
against the real cartridges:

1. **Pokédex measurements.** The international releases store a dex entry's
   height as feet + inches (two bytes) and weight in tenths of a pound. The
   French releases store height as a single decimetre byte and weight in
   hectograms. The entry body is therefore one byte shorter and the `TX_FAR`
   description pointer that follows it moves — the extractor could not find it
   at all until the manifest started declaring which shape a ROM uses
   (`manifest.pokedex.measurements`).
2. **Text labels that fall through.** `pokered-fr` splits what `pret/pokered`
   wrote as one label into two (`_MonWasReleasedText` ends on `cont "@"` and
   continues in `_CF50ExclamationText`), but the ROM stream is contiguous, so
   the decoder meets both `text_ram` commands and needs both substitutions.
   The generator now chains substitutions across a label that does not
   terminate.
3. **Badge gate identity.** Route 23's guards were identified by the badge
   *caption* in the ROM. In English that string happens to equal the item
   constant (`BOULDERBADGE`); in French it is `BADGE TERRE`, which is neither
   an item key nor a legal `EVENT_PASSED_*` suffix. The identity now comes
   from the pointer label, which is locale-independent — and is a latent
   correctness fix for the English build too.
4. **Name charmaps.** `$BA` is `é` internationally and `à` in French; `$BB`–
   `$BF` are the English elisions and the French accents; `$D4`–`$DF` carry
   the French elisions where the international table keeps vestigial kana. Raw
   `.sav` name fields decode through a per-variant crosswalk.
5. **Credits.** The French release has 34 screens where English has 35 (it adds
   its European localisation staff), the banner is `VERSION ROUGE` /
   `VERSION BLEUE` / `VERSION JAUNE`, and the end card reads `FIN` (four 8×16
   columns) rather than `THE END` (five).

## Raw `.sav`

Every SRAM offset the converter models was verified against the symbol files of
all six builds and is **identical** across them: `wMainDataStart`…`wMainDataEnd`
is 1929 bytes everywhere, `wPokedexOwned` +0, `wPlayerMoney` +80,
`wNumBoxItems` +579, `wEventFlags` +1104, `wPlayTimeHours` +1866, and Yellow's
`wPikachuHappiness` +377. The structures are shared, so the code is shared.
What differs is the name charmap, and that is selected explicitly per variant.

## Out of scope, verified untouched

`11.5/love.js`, `11.5/love.wasm`, `mods/DramaticShape-v1.0-widescreen-test.zip`,
`index.html`, `app-v13.css`, `player.js`, `web-bridge-v13.js`,
`web-mod-import.js`, `sw.js`, `manifest.webmanifest` and
`game-v13.3-viewport-final.love` are all still the bytes they were. Regional
detection lives entirely in the Gen1Recomp core; the Web bridge does not carry
a copy of the hash table.

## Files

Engine sources changed inside the `.love` (full diff in
`engine-changes.patch`):

```text
main.lua
src/core/GameVersion.lua        game x variant model
src/core/Game.lua               loads the locale catalog before the mod merge
src/core/SaveData.lua           slots scoped by save id
src/core/Strings.lua            built-in locale catalog under any mod catalog
src/import/CacheFs.lua          mount/unmount take a variant
src/import/RomImporter.lua      per-variant readiness, import, selection
src/import/LauncherView.lua     US | FR chip row in the game panel
src/import/RomExtractor.lua     metric dex entry bodies
src/import/SaveFileIO.lua       variant-scoped .sav import/export
src/save_convert/SaveConvert.lua per-variant charmap and crosswalks
src/ui/DexEntryMenu.lua         metric height/weight rows
```

Files added inside the `.love`:

```text
data/strings/fr.lua                          French catalog for engine text
src/save_convert/data/charmap_fr.lua         Rouge/Bleue name charmap
src/save_convert/data/charmap_fr_yellow.lua  Jaune name charmap
tools/rom_manifest_red_fr.json
tools/rom_manifest_blue_fr.json
tools/rom_manifest_yellow_fr.json
```

Files added to this repository:

```text
tools/rom_manifest_{red,blue,yellow}_fr.json  the manifests, for review
tools/manifests/README.md                     reproducible generation
tools/manifests/make_regional_manifest.py     the driver
tools/manifests/locales.py                    per-locale expectations
tools/manifests/gen1recomp-locale-agnostic.patch
tools/tests/run_fr_regional_tests.sh          suite entry point
tools/tests/fr_regional_test.lua              177 checks
docs/fr-regional/README.md                    this file
docs/fr-regional/engine-changes.patch
docs/fr-regional/validation.md                what was run, and what it said
```

## Running the tests

```sh
tools/tests/run_fr_regional_tests.sh            # defaults to the FR artifact
tools/tests/run_fr_regional_tests.sh game-v13.3-viewport-final.love
```

The suite unpacks the `.love` and tests the engine sources it actually ships,
so it validates the artifact rather than a checkout.
