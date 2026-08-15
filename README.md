# Gen1Recomp Web / PWA

**English** | [Français](README.fr.md)

Play Gen1Recomp in your phone's browser, with your own ROM. No emulator, no sideloading, no App Store.

**Current release: v2.0** — see [`docs/BASELINE-v2.0.md`](docs/BASELINE-v2.0.md).

<p align="center">
  <img src="https://img.shields.io/badge/release-v2.0-0b7285?style=flat-square" alt="Current release: v2.0">
  <img src="https://img.shields.io/badge/Web-PWA-111827?style=flat-square" alt="Web / PWA">
  <img src="https://img.shields.io/badge/ROMs-US%20%2B%20FR-2f9e44?style=flat-square" alt="Original US and French ROMs supported">
  <img src="https://img.shields.io/badge/iPhone%20%2F%20Safari-hardware%20validated-0b7285?style=flat-square" alt="iPhone / Safari: hardware validated">
  <img src="https://img.shields.io/badge/Android-successfully%20tested-2f9e44?style=flat-square" alt="Android: successfully tested">
  <img src="https://img.shields.io/badge/WebGL1-supported-5c7cfa?style=flat-square" alt="WebGL1 supported">
  <img src="https://img.shields.io/badge/Touch%20%2B%20controller-supported-495057?style=flat-square" alt="Touch and controller supported">
  <img src="https://img.shields.io/badge/ROM-not%20included-c92a2a?style=flat-square" alt="No ROM included">
</p>

<p align="center">
  <img src="docs/screenshots/overworld-town.jpeg"
       alt="Gen1Recomp Web/PWA voxel 3D overworld running on a mobile device"
       width="100%">
</p>

<p align="center">
  <a href="https://gen1recomp.inlasco.fr/"><img src="https://img.shields.io/badge/%E2%96%B6%20Launch%20Web%20App-gen1recomp.inlasco.fr-0b7285?style=for-the-badge" alt="Launch Web App at gen1recomp.inlasco.fr"></a><br>
  <sub>Opens straight in your mobile browser. No download, no App Store, no GitHub account.</sub>
</p>

> [!WARNING]
> ## ⚠️ Use the Dramatic Shape build included in this repository
>
> The standard, upstream Dramatic Shape release is **not** the Web/mobile build this project runs on. For the supported Web/PWA experience, download and import exactly this file:
>
> ### 👉 [`mods/DramaticShape-Mobile-Web-by-inlasco.zip`](mods/DramaticShape-Mobile-Web-by-inlasco.zip)
>
> Using a Dramatic Shape ZIP obtained anywhere else may cause missing features, rendering problems, incorrect widescreen behaviour, `G-SHADOW` issues and other incompatibilities. Most "it doesn't work" reports turn out to be a different build of the mod rather than a bug in this port.
>
> **Please reproduce the problem with the bundled Mobile/Web adaptation before reporting a Web/PWA bug.**

<p align="center">
  <strong>Support the project</strong><br>
  <sub>Enjoying the project? If you'd like to support continued development and testing of the Web/PWA port, you can make a small PayPal donation to <strong>inlasco</strong>. Every contribution helps.</sub>
</p>

<p align="center">
  <a href="https://www.paypal.com/qrcodes/p2pqrc/3SUFQM7Z3MG6L">
    <img src="docs/assets/paypal-inlasco-qr.png"
         alt="PayPal donation QR code for inlasco"
         width="200">
  </a><br>
  <strong><a href="https://www.paypal.com/qrcodes/p2pqrc/3SUFQM7Z3MG6L">Donate with PayPal</a></strong>
</p>

> [!IMPORTANT]
> **No ROM is included.** You supply your own, legally obtained, supported ROM. It is read locally on your device and is never uploaded to this repository or to the hosting server.

> [!TIP]
> **French ROM support is now available.**
> Original, unmodified French retail ROMs of **Pokémon Version Rouge**, **Pokémon Version Bleue** and **Pokémon Version Jaune — Édition Spéciale Pikachu** are supported alongside the original US Red, Blue and Yellow releases. Dialogue, Pokémon and move names, items and Pokédex entries all come out of your own French cartridge.
>
> One canonical dump per game and region is recognized — see [Supported original ROMs](#supported-original-roms). Patched, hacked, fan-translated or otherwise modified ROMs are not part of the supported baseline and are rejected by the importer.

---

## 🎥 Video tutorial

Need a quick walkthrough? The video tutorial shows how to launch the game and enable the recommended 3D options, start to finish.

<p align="center">
  <a href="https://streamable.com/jl08os"><img src="https://img.shields.io/badge/%E2%96%B6%20Watch%20the%20setup%20video-Streamable-c92a2a?style=for-the-badge" alt="Watch the Gen1Recomp Web/PWA setup video on Streamable"></a>
</p>

**▶ [Watch the Gen1Recomp Web/PWA setup video](https://streamable.com/jl08os)** — <https://streamable.com/jl08os>

## Play in 4 steps

No GitHub account is required. You do not need to download or build this repository.

1. **Open the Web App**  
   Open **[gen1recomp.inlasco.fr](https://gen1recomp.inlasco.fr/)** and wait for the launcher to appear.

2. **Choose your ROM**  
   Tap `Import ROM`. A full-screen banner appears — tap it, and your device's file picker opens. Pick your own legally obtained original Red / Blue / Yellow ROM, US or French. Extraction takes about 15–20 seconds. **The ROM stays on your device.**

3. **Enable Dramatic Shape for the 3D look**  
   Download [`mods/DramaticShape-Mobile-Web-by-inlasco.zip`](mods/DramaticShape-Mobile-Web-by-inlasco.zip) from this repository. In the Web App, open the `MODS` tab, tap `Import mod .zip`, select the ZIP, then switch **Dramatic Shape Voxel Mod** on.  
   **Do not use another Dramatic Shape ZIP — this Web/mobile adaptation is the supported build for this project.**

4. **Apply the recommended 3D settings and play**  
   In game, press `START` → `OPTION`, apply the settings below, then play with the touch controls or a connected controller.

**What you need:** a modern iPhone / iPad or Android device, and your own legally obtained `.gb` / `.gbc` ROM of exactly 1 MiB. A game controller is optional and is detected automatically.

## Supported original ROMs

| Game | Original US release | Original French release |
| --- | --- | --- |
| Pokémon Red / Version Rouge | ✅ | ✅ **Pokémon Version Rouge** |
| Pokémon Blue / Version Bleue | ✅ | ✅ **Pokémon Version Bleue** |
| Pokémon Yellow / Version Jaune | ✅ | ✅ **Pokémon Version Jaune — Édition Spéciale Pikachu** |

The importer identifies your ROM by its SHA-1 and accepts **one canonical dump per game and region** — six in total. Anything else, including patched, hacked, fan-translated, randomized, overdumped or truncated files, is rejected by design: the importer reads your cartridge at precise addresses, and a modified dump would produce a broken game rather than an honest error.

Each game keeps its US and French imports side by side, in separate storage, with separate saves. Importing Rouge does not disturb an existing Red.

<details>
<summary><strong>The exact dumps the importer accepts (SHA-1)</strong></summary>

| Game | Region | SHA-1 |
| --- | --- | --- |
| Pokémon Red | US | `ea9bcae617fdf159b045185467ae58b2e4a48b9a` |
| Pokémon Version Rouge | FR | `47a7622fa30e6402a3891fe65b3a930bf9bd7aec` |
| Pokémon Blue | US | `d7037c83e1ae5b39bde3c30787637ba1d4c48ce2` |
| Pokémon Version Bleue | FR | `47faa910d0e073c600665bf9c83b6bd17babdf8a` |
| Pokémon Yellow | US | `cc7d03262ebfaf2f06772c1a480c7d9d5f4a38e1` |
| Pokémon Version Jaune | FR | `0aceec0ef7aa2ca5aa831554598d91f61a925591` |

These are the canonical retail dumps. Size and header are secondary checks only; the SHA-1 is what decides.

</details>

**No ROM is included, hosted or linked by this project.**

## Recommended 3D settings

For a result close to the screenshots on this page. Press `START` → `OPTION` in game; once Dramatic Shape is enabled, its rows appear at the bottom of that list.

| Setting | Value | Why |
| --- | --- | --- |
| `PERFORMANCE` | `HIGH` | the tested mobile profile |
| `VOXEL` | `50` | the camera angle of the voxel 3D view |
| `3D-BTL` | `ON` | battles staged on the map instead of the flat screen |
| `BACK SPRITES` | `ON` | keeps your Pokémon's back sprite framing in battle |
| `DAYTIME` | `GOLDEN` | pins the clock to the golden-hour lighting used above |
| `G-SHADOW` | `ON` | the validated geometric world-space shadows |
| `WATER` | `FULL` | full water, including shoreline reflections |
| `AA` | `OFF` | keeps the sharp pixel-art look |

<details>
<summary><strong>Full tested preset</strong></summary>

| Setting | Value |
| --- | --- |
| `MUSIC FILTER` | `OFF` |
| `PERFORMANCE` | `HIGH` |
| `COLORS` | `ADVANCED` |
| `TILT` | `OFF` |
| `VOXEL` | `50` |
| `T-SHIFT` | `1` |
| `V-GRID` | `ON` |
| `V-CURVE` | `OFF` |
| `WATER` | `FULL` |
| `3D-BTL` | `ON` |
| `BACK SPRITES` | `ON` |
| `DAYTIME` | `GOLDEN` |
| `G-SHADOW` | `ON` |
| `AA` | `OFF` |

Leave the other options as they are unless you want to customize them. `Up` / `Down` move the cursor, `Left` / `Right` change a value, `B` or `START` goes back.

This preset comes from hardware-validated mobile use. It is not an official Dramatic Shape configuration, and it is not a framerate promise for every device — if yours struggles, lower the rendering options before assuming the Web port is at fault.

</details>

## Install it like an app

**iPhone / iPad:** open the Web App in Safari → Share → Add to Home Screen.

**Android:** open the Web App in a compatible browser → browser menu → Install app / Add to Home screen.

Once installed it also runs offline, and it updates itself: a new version published on the server is picked up on your next launch, with nothing to clear or reinstall.

## Your ROM and saves stay local

> [!IMPORTANT]
> - The ROM you pick is read and processed **inside your browser, on your device**. This port does not upload it to this repository or to the hosting server.
> - Generated data, settings and saves live in your browser's local storage, separately for each game and each region.
> - **Clearing the site's browser data deletes your local saves.** There is no server-side backup.
> - No ROM is included with, distributed by, or linked to from this project. Supplying a legal copy is your responsibility.

## Compatibility

| Platform / Feature | Status |
| --- | --- |
| iPhone / Safari | ✅ Hardware validated |
| Android | ✅ Successfully tested |
| Original US ROMs — Red / Blue / Yellow | ✅ |
| Original French ROMs — Rouge / Bleue / Jaune | ✅ |
| Touch controls | ✅ |
| Game controller | ✅ |
| Installable PWA | ✅ |
| Local ROM import | ✅ |
| Local mod import | ✅ |
| Dramatic Shape voxel 3D | ✅ |
| WebGL1 | ✅ |

**iPhone / Safari** is the platform that went through the in-depth hardware campaign behind this baseline, from the original v1.0 campaign through the v2.0 `G-SHADOW` validation. **Android** has been tested successfully — that is not a guarantee for every Android device or browser.

The three French releases were each imported through the Web App and played, on top of the automated regional test suite.

## Gameplay

<table>
  <tr>
    <td width="50%" align="center" valign="top">
      <img src="docs/screenshots/battle-3d-touch.jpeg" alt="3D voxel battle between Charmander and Pidgey with on-screen touch controls" width="100%">
      <br><sub>3D voxel battle with touch controls</sub>
    </td>
    <td width="50%" align="center" valign="top">
      <img src="docs/screenshots/overworld-touch-dialogue.jpeg" alt="Voxel 3D overworld with a dialogue box and on-screen touch controls" width="100%">
      <br><sub>Voxel overworld with mobile touch controls</sub>
    </td>
  </tr>
</table>

## Features

**In the browser** — LÖVE 11.5 / WebAssembly runtime, WebGL1, local ROM import, local mod import, browser-local persistence (IndexedDB), touch controls, game controller support, installable PWA with offline play, adaptive mobile viewport, native-aspect Gen1 2D rendering.

**Rendering / Dramatic Shape** — wide voxel 3D overworld, Dramatic Shape Web/mobile build, animated flowers, `DAYTIME = GOLDEN`, geometric world-space `G-SHADOW`, `VOID FILL = TREES`, 3D battles.

**Regional support** — three logical games (Red, Blue, Yellow), each with a US and a French variant. Mods still target the game, not the region, so a mod written for Red also applies to Rouge. Cartridge text is extracted from your own ROM at import; the port's own interface strings have a separate French catalogue.

## Dramatic Shape

The repository includes the current Web/mobile adaptation:

```text
mods/DramaticShape-Mobile-Web-by-inlasco.zip
```

It is based on **Dramatic Shape Voxel Mod** by **DramaticShape** — upstream: <https://github.com/DramaticShape/DramaticShapeVoxelMod> — and includes additional Web/iPhone adaptation work by **inlasco**. This project is **not** the author of the original mod: the upstream attribution and the MIT license are preserved inside the archive, and the mod's internal name, id, manifest and authorship are unchanged. Only the published file name in this repository says which build it is.

This is the exact archive used for the v2.0 hardware validation; its SHA-256 is documented in [`docs/BASELINE-v2.0.md`](docs/BASELINE-v2.0.md).

> [!WARNING]
> This is the build this port is tested against. A Dramatic Shape ZIP downloaded from anywhere else is not the Web/mobile adaptation and is not supported here.

---

## Technical information

This is a **static web application**: serve the repository root over HTTPS with the directory structure intact.

The shell currently loads:

```text
game-v13.4-fr.love
11.5/love.js
11.5/love.wasm
```

The runtime is LÖVE 11.5 compiled to **WebAssembly** (`love.js` / `love.wasm`), rendering through **WebGL1**, with the game shipped as a packaged `.love` archive. ROM-derived generated data, options and saves are stored locally by the browser through IndexedDB / IDBFS, under a separate namespace per game and per region. There is no server-side save synchronization in the current baseline.

Two small files handle publishing:

- `boot-guard.js` verifies the byte length of every package held in the loader's IndexedDB cache before the engine starts, and drops anything that does not match. A download cut short can otherwise stay pinned in a browser for good.
- `sw.js` is the service worker: the page and the live assets are fetched network-first, the frozen runtime is served from cache, and the whole cache is dropped when its version changes. That is what makes a new build arrive on the next launch and lets the app run offline.

`.htaccess` sets the matching HTTP cache policy for an Apache host, and `diagnostic.html` is a standalone page that checks what the server actually returns, file by file.

Per-file hashes for the published tree are listed in [`SHA256SUMS`](SHA256SUMS).

The current public baseline is **v2.0** and is described in [`docs/BASELINE-v2.0.md`](docs/BASELINE-v2.0.md).

> [!NOTE]
> [`docs/BASELINE-v1.0.md`](docs/BASELINE-v1.0.md) is a **historical document**. It records the original v1.0 hardware campaign and the artifact hashes of that baseline, including `game-v13.3-viewport-final.love` and the mod under its former file name. That archive is still published here and still runs, but it is no longer the one the shell loads by default. Read that document as the history of v1.0, not as a description of the current build.

### Regional implementation

Regional support is documented in [`docs/fr-regional/`](docs/fr-regional/): the design notes, the validation record, and the reproducible tooling that generates a regional manifest from a French disassembly. The manifests themselves live in `tools/`, one per game and region, each bound to the exact ROM hash it was generated from. The test suite is:

```sh
tools/tests/run_fr_regional_tests.sh
```

### G-SHADOW in v2.0

Up to v1.x, `G-SHADOW` could take several seconds to appear after an indoor-to-outdoor transition, and turning the option on outdoors did not take effect immediately. v2.0 fixes both, and the fix is what this release is built around:

- turning `G-SHADOW` on while already outdoors now takes effect immediately, because the map the scene is actually drawn from is treated as urgent work instead of waiting in the background queue;
- walking out of a building arrives with the shadows already there, because the anticipated outdoor destination is prewarmed from inside the interior the player is still crossing, on the same bounded budget the terrain mesher already uses.

Both scenarios were validated on real hardware (iPhone / Safari / PWA) before this release. The rendering approach is unchanged: still geometric world-space shadows on WebGL1 — no shadow map, no depth texture, no PCF, no GPU readback, no WebGL2.

`VOID FILL = TREES` keeps its existing behaviour and can still take a moment to fill in after some transitions.

## Project provenance

This repository is an independent Web/PWA adaptation and is **not the official Gen1Recomp repository**. We are not the original authors of Gen1Recomp, nor of Dramatic Shape, and this project is not officially affiliated with the upstream projects.

- Gen1Recomp — <https://github.com/bryanthaboi/gen1recomp>
- Dramatic Shape Voxel Mod — <https://github.com/DramaticShape/DramaticShapeVoxelMod>
- LÖVE 11.5 / love.js runtime — license retained under [`11.5/license.txt`](11.5/license.txt)

See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

## ROMs and trademarks

No ROM is distributed by this repository. Users are responsible for supplying their own legally obtained compatible ROM.

Pokémon, Nintendo, Game Boy and related names, marks and game intellectual property belong to their respective owners. This project is unofficial and is not affiliated with or endorsed by Nintendo, The Pokémon Company or Game Freak.

## License

There is **no blanket repository-wide license grant** in this repository. Components retain their respective upstream licenses and notices. See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) and the license files shipped with the relevant components.
