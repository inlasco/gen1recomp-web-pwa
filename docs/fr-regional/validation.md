# Validation record — FR regional support

Everything below was executed. Anything that could not be executed is marked
as such rather than assumed.

## Baseline preflight

```text
git branch --show-current   main -> feat/fr-regional-rom-support
git log -1 --oneline        394ede0 Simplify quick start and document tested 3D preset
git status --short          (clean)
sha256sum game-v13.3-viewport-final.love
  854a27848e573832f6a9a5be7762aaa63686cb65afb61338959431e3333c494b   MATCHES
```

## The three French cartridges

Supplied as private local test input. Never added to git, never copied into a
`.love`, never published.

| file | size | SHA-1 | SHA-256 |
| --- | --- | --- | --- |
| Rouge FR | 1 048 576 | `47a7622fa30e6402a3891fe65b3a930bf9bd7aec` | `23766290f3b2347f815f1e8977c3b84047ed880cadda8c4f1a3595a633daa303` |
| Bleue FR | 1 048 576 | `47faa910d0e073c600665bf9c83b6bd17babdf8a` | `73dee67befed0c39cd0a6ed53a98ff5b98b3bddc3e7a0dae1d982776a4d0889b` |
| Jaune FR | 1 048 576 | `0aceec0ef7aa2ca5aa831554598d91f61a925591` | `77b31f874fd877fbf48757f315ffc3144e06fc7222aba6ac4eda2045ebf5d3fa` |

Game Boy headers, all three: header checksum **OK**, global checksum **OK**,
destination `$01` (non-Japanese), licensee `$33`/`01`, MBC5+RAM+BATTERY,
ROM size `$05` (1 MiB), RAM `$03`, version `$00`.

| | title | CGB | SGB |
| --- | --- | --- | --- |
| Rouge | `POKEMON RED` | `$00` | `$03` |
| Bleue | `POKEMON BLUE` | `$00` | `$03` |
| Jaune | `POKEMON YEL` + maker `APSF` | `$80` | `$03` |

**Confirmation source.** Not a guess and not a lookup table: each
disassembly was built from source with rgbds 1.0.1 and the resulting ROM
compared byte-for-byte against the supplied file.

```text
cmp pokered-fr/pokered.gbc      <Rouge FR>   -> identical
cmp pokered-fr/pokeblue.gbc     <Bleue FR>   -> identical
cmp pokeyellow-fr/pokeyellow.gbc <Jaune FR>  -> identical
```

The same was done for the three US ROMs, which reproduce
`ea9bcae6…`, `d7037c83…` and `cc7d0326…` from `pret/pokered` and
`pret/pokeyellow`. Those builds are what the non-regression runs below use.

## Generator patch neutrality (US must not move)

The three English manifests were regenerated twice from the same pret
checkouts — once with a pristine Gen1Recomp checkout, once with the
locale-agnostic patch applied — and compared.

```text
red    : IDENTICAL
blue   : IDENTICAL
yellow : IDENTICAL
```

After the later `pokedex` measurement work, the comparison is:

```text
red    : keys added ['pokedex']  removed []  unchanged 30  modified []
blue   : keys added ['pokedex']  removed []  unchanged 30  modified []
yellow : keys added ['pokedex']  removed []  unchanged 30  modified []
```

The only difference is one additive block. Notably `text.dynamic` is
unchanged, which is what proves the fall-through chaining is inert in English.

The committed English `charmap.lua` also regenerates byte-identically from
`pret/pokered` with the patched tool.

## Manifests

| manifest | result |
| --- | --- |
| `rom_manifest_red_fr.json` | **OK** — 3289 symbols, `romSha1` = Rouge FR |
| `rom_manifest_blue_fr.json` | **OK** — symbols re-sourced from `pokeblue.sym`, credits banner asserted as `VERSION BLEUE` |
| `rom_manifest_yellow_fr.json` | **OK** — 4507 symbols, 72 aliases, 11 dropped, 4 intro symbols omitted (same shape as the shipped US Yellow manifest) |

Symbol coverage was checked against the 57 symbol names `RomExtractor`
references directly. Rouge/Bleue FR are missing exactly the same 11
Yellow-only symbols as the shipped US Red manifest; Jaune FR is missing exactly
the 2 `FightIntro*` symbols the shipped US Yellow manifest is missing. No other
gaps.

## Real extraction against the supplied cartridges

`RomExtractor` was run headless against the real bytes of each ROM (LÖVE 11.5,
Xvfb), then the resulting cache was read back.

| | SHA recognised | manifest | RomExtractor | cache complete |
| --- | --- | --- | --- | --- |
| **Rouge FR** | `red` / `fr` | OK | **OK** | **OK** |
| **Bleue FR** | `blue` / `fr` | OK | **OK** | **OK** |
| **Jaune FR** | `yellow` / `fr` | OK | **OK** | **OK** |

What actually landed in the cache:

```text
                    Rouge FR / Bleue FR        Jaune FR             US (all three)
BULBASAUR           BULBIZARRE                 BULBIZARRE           BULBASAUR
TACKLE              CHARGE                     CHARGE               TACKLE
THUNDERBOLT         TONNERRE                   TONNERRE             THUNDERBOLT
MASTER_BALL         MASTER BALL                MASTER BALL          MASTER BALL
town map PALLET     BOURG PALETTE              BOURG PALETTE        PALLET TOWN
credits banner      VERSION ROUGE / BLEUE      VERSION JAUNE        RED/BLUE VERSION STAFF
credits screens     34                         31                   35 / 35 / 32
presets (player)    RED/SACHA/PAUL             YELLOW/SACHA/PAUL    RED/ASH/JACK
accented strings    1549                       1602                 617 / 617 / 651
{BYTE:XX} tokens    0                          0                    0
required files      all present                all present          all present
```

**Zero `{BYTE:XX}` tokens** in any of the six extractions: every glyph the
French ROMs use — `é è à ù ç ê î ô û ë ï â`, the `c' d' j' l' m' n' p' s' t'
u' y'` elisions, `♂ ♀ ×` and the Gen-1 ligatures — resolves through the
variant's charmap. No transliteration anywhere.

Jaune FR specifically:

```text
assets/generated/title/pikachu.png                   OK
assets/generated/title/pikachu_bg.png                OK
assets/generated/title/pika_bubble.png               OK
assets/generated/battle/trainers/jessie_james.png    OK
assets/generated/emotes.png                          OK   (8 bubbles: the 5 Pikachu-only ones)
field.oakSpeech.demoSpecies                          PIKACHU
```

Two extraction failures were found and fixed rather than worked around:

1. `dex entry 1 has no TX_FAR command` — the metric dex entry body.
2. `_MonWasReleasedText: missing dynamic text substitution` — the label
   fall-through.

## Cache isolation

Six independent trees in the LÖVE save directory after importing all six ROMs:

```text
red/        527 files   marker rom-cache-v10:ea9bcae6…
red-fr/     528 files   marker rom-cache-v10:47a7622f…
blue/       527 files   marker rom-cache-v10:d7037c83…
blue-fr/    528 files   marker rom-cache-v10:47faa910…
yellow/     624 files   marker rom-cache-v10:cc7d0326…
yellow-fr/  623 files   marker rom-cache-v10:0aceec0e…
```

`data/generated/pokemon.lua` hashes: `red` = `blue` ≠ `red-fr` = `blue-fr` ≠
`yellow` ≠ `yellow-fr`. No cross-contamination. The marker embeds the
variant's own ROM hash, so a US marker cannot validate an FR cache or the
reverse.

## Boot

Real boots under LÖVE 11.5 / Xvfb, one process per variant, driven by a frame
driver through the title screen and into a new game.

| | data loaded | ROM text | engine text | result |
| --- | --- | --- | --- | --- |
| Rouge FR | FR | `Un {…} sauvage apparaît!` | `NOUVELLE PARTIE` | **overworld reached** |
| Bleue FR | FR | `Un {…} sauvage apparaît!` | `NOUVELLE PARTIE` | **overworld reached** |
| Jaune FR | FR | `Un {…} sauvage apparaît!` | `NOUVELLE PARTIE` | **overworld reached** |
| Red US | EN | `Wild {…} appeared!` | `NEW GAME` | **overworld reached** |
| Blue US | EN | `Wild {…} appeared!` | `NEW GAME` | **overworld reached** |
| Yellow US | EN | `Wild {…} appeared!` | `NEW GAME` | **overworld reached** |

Each run ends in the overworld state on `REDS_HOUSE_2F`, the new-game start
inside the player's house in Bourg Palette / Pallet Town, with the correct
cache prefix mounted and the correct language active.

**Not covered by automation, needs physical validation:** the Safari/iPhone
run — importing a French cart through the Web importer, the launcher's US|FR
chip row under touch, the title/intro frames as rendered, and a session long
enough to reach Bourg Palette on foot, a wild battle and a save.

## Web boot, real import through the browser

The desktop boots above pass a cache the harness built. The Web build was
regressing anyway, so every variant is now also imported *through the page*,
in headless Chromium at 844×390 touch, by handing the cartridge to the
launcher's own file input and then tapping Play on the canvas.

| | extraction | `title/nine.png` | dialogs on Play | result |
| --- | --- | --- | --- | --- |
| Rouge FR | 14 s | 8×8 | 0 | **runs** |
| Bleue FR | 14 s | 8×8 | 0 | **runs** |
| Jaune FR | 16 s | **16×8** | 0 | **runs** |
| Red US | 14 s | absent (as always) | 0 | **runs** |
| Yellow US | 16 s | 8×8 (unchanged) | 0 | **runs** |

### The Yellow FR boot failure, and why it was fatal only on the Web

Jaune FR reached `GOOD TO GO` in the launcher and then died on Play with
LÖVE's pre-window alert:

```
[info] generated data loaded (223 maps, 151 species, 165 moves)
Could not open file assets/generated/title/nine.png. Does not exist.
An error occurred before the game window could be initialised.
```

Two independent defects had to line up.

1. **The extractor only knew the international shape.** The Yellow title
   copyright line is `©'95.'96.'98 <block> GAME FREAK inc.`, where `<block>`
   is whatever the ROM stores between `GameFreakLogoGraphicsEnd` and
   `TextBoxGraphics`. pokeyellow-us has a one-tile `NineTile` there;
   pokeyellow-fr has a two-tile `ZerosTile`. The probe asserted
   `TextBoxGraphics == GameFreakLogoGraphics + 9*16 + 16`, i.e. exactly one
   tile, so the French import never wrote the file at all. Measured symbol
   deltas: yellow-us 160 bytes, yellow-fr 176.

2. **`pcall` does not catch a LÖVE exception on love.js.** Every optional
   image in the UI was loaded as `pcall(love.graphics.newImage, path)`, which
   is correct on desktop — the French Yellow title simply drew nothing there —
   and wrong on the Web build, which is compiled without catchable C++
   exceptions. The unwind goes straight past `pcall` and takes the main loop
   with it. `src/core/WebViewport.lua` already documents the same hazard for
   `love.filesystem.read`.

Both are fixed, and separately:

* `RomExtractor` now extracts the block whatever its tile count (1 → 8×8,
  2 → 16×8, capped at four tiles, whole tiles only, same bank). Red US and
  Blue US have nothing between the two symbols — delta 0 — so they still
  produce no file, exactly as before.
* `TitleState:drawCopyright` advances by `nineImg:getWidth()` instead of a
  hardcoded 8, so the two-tile French block does not overlap `GAME FREAK inc.`
* `src/render/SafeImage.lua` probes with `love.filesystem.getInfo` — the only
  safe existence test on this runtime — before loading, and all eight
  `tryImage` implementations plus `Credits.silhouette` go through it. A
  missing optional asset can no longer kill a boot.
* `RomImporter`'s `VERSION_REQUIRED_FILES.yellow` now lists
  `assets/generated/title/nine.png`, so the French Yellow caches already
  written without it re-import themselves. Yellow US caches always had the
  file and are untouched; Red and Blue never ask for it. No `CACHE_FORMAT`
  bump, so no US cache is invalidated.

### Scope of the `pcall` hazard, measured rather than assumed

Roughly two dozen other sites in the engine still load an asset with
`pcall(love.graphics.newImage, …)`. Rewriting them all was not in scope, so
the question was whether any of them can actually fire on a regional import.
It was answered by importing each cartridge through the page and dumping the
complete list of files the extractor produced under that variant's cache
prefix:

| | files produced | difference vs US |
| --- | --- | --- |
| Yellow US / Jaune FR | 625 / 625 | none |
| Red US / Rouge FR | 528 / 529 | FR adds `title/nine.png` |
| Blue US / Bleue FR | 528 / 529 | FR adds `title/nine.png` |

No French import is missing any file its US counterpart produces, so no other
optional-asset load can be reached by a regional divergence on these six
cartridges. The remaining sites stay a latent hazard for a *future* manifest
divergence, and are listed here rather than silently left.

## Test suite

```sh
tools/tests/run_fr_regional_tests.sh
```

```text
passed 208  failed 0  skipped 0
```

Covers: the six SHA-1 → (game, variant) mappings and rejection of unknown /
patched / truncated hashes; language, manifest, cache prefix and save identity
per variant; cache-namespace uniqueness and preservation of the historical US
prefixes; save-file and slot-directory uniqueness and preservation of
`save.lua` / `save_blue.lua` / `save_yellow.lua`; variant switching and
fallbacks; the mod layer still seeing exactly three games (including that a
mod profile rejects `red-fr` as a game id); the French catalog's format arity
and `{TOKEN}` preservation on every entry, and that it is inert for US; one
manifest per variant, each declaring its own ROM hash and measurement system;
the per-variant save charmaps; the size of the title copyright block in all
six manifests, that both Yellow variants can produce `title/nine.png`, that
the extractor no longer hardcodes the one-tile shape, and that every optional
image in the UI is loaded through `SafeImage` rather than a bare `pcall`; and
an artifact audit for ROMs, saves and extracted caches.

Skipped, with reasons:

* The upstream Gen1Recomp behaviour suite (`tests/run_tests.lua`, 294 files)
  targets the upstream tree at HEAD, not this `.love` baseline. Running it
  here would report upstream drift, not regressions in this work.
* `mods/DramaticShape-v1.0-widescreen-test.zip` was not re-run: this change
  does not touch the mod loader, the mod is byte-identical, and the mod layer
  still sees `red`/`blue`/`yellow`. Loading it against a French import is part
  of the physical validation above.

## Mods

The baseline has no `games = [...]` targeting field — mod manifests carry
`game_version`, which is an **engine** semver range. Game scoping happens
through `GameVersion.VERSIONS` and `ModProfile.slots`, both of which still key
on exactly `red`, `blue`, `yellow`. The invariant the mission asks for holds by
construction, and the suite asserts it.

## Residual English

The French catalog covers 190 of Gen1Recomp's own strings — the in-game menus,
option rows, PC/box/bag prompts, shop, save and printer messages. Still English
in a French playthrough:

* the launcher's ROM-management and mod-manager chrome (mod install/update,
  find/index, link-play screens, save import/export notices);
* engine-authored battle and field lines that have no ROM label behind them and
  are not yet in the catalog;
* anything a future engine string adds.

None of these are ROM content — every line that exists in the cartridge is
read from the cartridge.

## Security

* No ROM in git: `.gitignore` already excludes `*.gb`/`*.gbc`; `git status` is
  clean of them; the working copies used for testing live outside the
  repository.
* No ROM in the `.love`: the artifact listing has no `*.gb`, `*.gbc`, `*.rom`,
  `*.sav`, `data/generated/`, `assets/generated/`, `picked_rom` or `baserom`
  entry.
* No extracted cache, no personal save, no generated asset committed.
* No local path, private email, token, credential, `.env` or key material in
  any added file.
