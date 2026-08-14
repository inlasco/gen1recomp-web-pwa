# Gen1Recomp Web / PWA for iPhone

**English** | [Français](README.fr.md)

A Web/PWA adaptation of [Gen1Recomp](https://github.com/bryanthaboi/gen1recomp), focused on running the project directly in Safari on iPhone without sideloading.

This repository contains the **v1.0 web deployment baseline validated on real iPhone hardware**.

> **No ROM is included.** A supported, legally obtained game ROM must be selected locally by the user. The web port does not upload the selected ROM to this repository or to the hosting server.

## What this port adds

- Safari/iPhone WebAssembly + WebGL1 runtime
- installable Home Screen PWA shell
- local ROM import from iOS Files
- local mod import
- IndexedDB / IDBFS persistence
- touch controls and controller support
- adaptive landscape viewport for modern iPhone displays
- non-stretched native 2D presentation
- wide 3D voxel overworld presentation
- bundled web/iPhone build of Dramatic Shape Voxel Mod

## v1.0 validated baseline

The current deployment baseline was validated on physical iPhone/Safari hardware with:

- Gen1Recomp boot and launcher
- local ROM import
- local mod import
- touch controls
- WebGL1
- adaptive wide viewport
- Dramatic Shape voxel overworld
- animated flowers
- `DAYTIME = GOLDEN`
- geometric world-space `G-SHADOW`
- `VOID FILL = TREES`
- 3D battles
- indoor/outdoor transitions

See [`docs/BASELINE-v1.0.md`](docs/BASELINE-v1.0.md) for the exact artifact hashes and implementation notes.

## Run / deploy

This is a static web application. Serve the repository root over **HTTPS** with the existing directory structure intact.

The current shell loads:

```text
game-v13.3-viewport-final.love
11.5/love.js
11.5/love.wasm
```

Then open the deployment URL in Safari.

On first use:

1. Select a supported ROM from the iOS Files picker.
2. Import the Dramatic Shape ZIP if desired.
3. Launch the game.
4. Use Safari's **Add to Home Screen** action to install the PWA shell.

The ROM-derived cache, settings and saves are stored locally by the browser through IndexedDB / IDBFS. Clearing the site's browser data can remove them.

## Dramatic Shape

The repository includes:

```text
mods/DramaticShape-v1.0-widescreen-test.zip
```

This is the exact web/iPhone build used for the v1.0 hardware validation. Its SHA-256 is documented in `docs/BASELINE-v1.0.md`.

The mod is based on **Dramatic Shape Voxel Mod** by DramaticShape. The included mod archive contains its upstream license and attribution.

## Important current limitation

Some voxel auxiliary geometry, notably `G-SHADOW` and `VOID FILL = TREES`, can take additional time to appear after certain indoor/outdoor transitions. The current v1.0 baseline is intentionally preserved instead of shipping unvalidated optimization experiments.

## Project provenance

This repository is an independent Web/PWA adaptation and is **not the official Gen1Recomp repository**.

Upstream projects/components include:

- Gen1Recomp — `bryanthaboi/gen1recomp`
- Dramatic Shape Voxel Mod — `DramaticShape/DramaticShapeVoxelMod`
- LÖVE 11.5 / love.js runtime — license text retained under `11.5/license.txt`

See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

## ROMs and trademarks

No ROM is distributed by this repository. Users are responsible for supplying their own legally obtained compatible ROM.

Pokémon, Nintendo, Game Boy and related names, marks and game intellectual property belong to their respective owners. This project is unofficial and is not affiliated with or endorsed by Nintendo, The Pokémon Company or Game Freak.

## License

There is **no blanket repository-wide license grant** in this repository. Components retain their respective upstream licenses and notices. See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) and the license files shipped with the relevant components.
