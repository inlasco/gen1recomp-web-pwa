# Gen1Recomp Web / PWA — v2.0 baseline

This document describes the **current public baseline** of the project.

`docs/BASELINE-v1.0.md` remains the historical record of the first published baseline and is deliberately left unchanged, including the former file name of the bundled mod.

## Release

- **Gen1Recomp Web/PWA v2.0**
- Repository: `inlasco/gen1recomp-web-pwa`
- Web/PWA adaptation by **inlasco**
- Not the official Gen1Recomp repository, and not affiliated with the upstream projects

## Runtime

- LÖVE 11.5, compiled to WebAssembly (`11.5/love.js`, `11.5/love.wasm`)
- WebGL1 rendering
- Web / mobile PWA shell, installable, offline-capable
- Browser-local persistence through IndexedDB / IDBFS, one namespace per game and per region
- No server-side save synchronization

The `.love` archive the shell actually loads in this baseline is:

```text
game-v13.4-fr.love
```

`game-v13.3-viewport-final.love` is still published in the repository and still runs, but it is not the archive loaded by default.

## Supported original ROMs

Original, unmodified retail dumps only — one canonical dump per game and per region, identified by SHA-1 at import:

| Game | US | French |
| --- | --- | --- |
| Red / Version Rouge | ✅ Pokémon Red | ✅ Pokémon Version Rouge |
| Blue / Version Bleue | ✅ Pokémon Blue | ✅ Pokémon Version Bleue |
| Yellow / Version Jaune | ✅ Pokémon Yellow | ✅ Pokémon Version Jaune — Édition Spéciale Pikachu |

**No ROM is included, hosted or linked by this repository.** The user supplies their own legally obtained copy, which is read locally on the device.

## Bundled mod

```text
mods/DramaticShape-Mobile-Web-by-inlasco.zip
```

| Field | Value |
| --- | --- |
| SHA-256 | `5e4d27e81915576a71e6f37c9216678a19d435f2934453b5090657ea8305cdaf` |
| Upstream mod | Dramatic Shape Voxel Mod by **DramaticShape** |
| Upstream repository | <https://github.com/DramaticShape/DramaticShapeVoxelMod> |
| Web/mobile adaptation | **inlasco** |
| License | MIT, preserved inside the archive |

The archive was renamed from `mods/DramaticShape-v1.0-widescreen-test.zip` for this release. Only the published file name changed: the internal mod name, id, manifest, original author, license, internal file order and attribution are unchanged.

Only the Web/mobile adaptation published in this repository is supported by this port. A Dramatic Shape ZIP obtained elsewhere is a different build.

## Rendering baseline

- Adaptive widescreen / landscape viewport
- Voxel 3D overworld (`VOXEL`)
- `DAYTIME = GOLDEN` fixed golden-hour lighting profile
- Geometric world-space shadows (`G-SHADOW`)
- **G-SHADOW V2 prewarm** — new in this baseline
- `VOID FILL = TREES`
- 3D battles
- Native-aspect Gen1 2D rendering

The shadow approach is unchanged from v1.0: geometric projected world-space shadows on WebGL1. There is no shadow map, no depth texture, no PCF, no GPU readback and no WebGL2 in this baseline.

## G-SHADOW V2

Two changes make up the V2 fix, both inside the bundled mod:

1. **Urgent visible map.** The map the scene is actually drawn from is requested as urgent work and gets a presentation-critical CPU slice, instead of sharing the background queue with off-screen neighbours. Turning `G-SHADOW` on while outdoors therefore takes effect immediately.
2. **Destination prewarm.** While the player is still walking around an interior, the anticipated outdoor destination has its shadow geometry built ahead of time, on a bounded slice, behind the terrain mesher's own speculative exterior prewarm. A bounded live-set hold keeps that work from being evicted before the player walks through the door.

Changed entries relative to the v1.0 archive:

```text
main.lua
lib/ProjectedShadows.lua
```

Every other entry in the archive is byte-identical to the previous build and in the same order.

## Physical validation

Validated on real hardware — **iPhone / Safari / PWA** — before this release:

| Scenario | Result |
| --- | --- |
| `G-SHADOW` `OFF` → outdoors → switch `G-SHADOW` `ON` | **PASS** — effect is immediate |
| `G-SHADOW` `ON` before `NEW GAME` → start indoors → first exit outdoors | **PASS** — shadows already present on arrival |

The former delay of roughly 5–6 seconds on the first outdoor frame is gone.

This campaign covered the two G-SHADOW scenarios above. Landscape, touch, rotation and fullscreen behaviour are unchanged from the previous baseline and were not re-tested as part of this specific campaign.

## Automated checks

| Suite | Result |
| --- | --- |
| Lua parse, all mod sources | 53 files, no parse errors |
| `tests/projected_shadows_cpu.lua` (inside the mod) | `8/8 CPU invariants passed` |
| Synthetic budget reference | `vertices=7092 triangles=2364 vram_bytes=170208` |
| `tools/tests/run_fr_regional_tests.sh` | `passed 208  failed 0  skipped 0` |
| `unzip -t` on the bundled mod | no errors |

## Integrity

Per-file hashes for the published tree are listed in `SHA256SUMS` at the repository root.

## Licensing and attribution

There is no blanket repository-wide license grant. Components retain their upstream licenses and notices — see `THIRD_PARTY_NOTICES.md`.

Pokémon, Nintendo, Game Boy and related names, marks and game intellectual property belong to their respective owners. This project is unofficial and is not affiliated with or endorsed by Nintendo, The Pokémon Company or Game Freak.
