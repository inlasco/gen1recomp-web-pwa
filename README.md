# Gen1Recomp Web / PWA

**English** | [Français](README.fr.md)

Play Gen1Recomp directly in your mobile browser — no sideloading, no emulator.

<p align="center">
  <a href="http://gen1recomp.inlasco.fr/"><img src="https://img.shields.io/badge/Web%20App-live-2f9e44?style=flat-square" alt="Web App: live"></a>
  <img src="https://img.shields.io/badge/Web-PWA-111827?style=flat-square" alt="Web / PWA">
  <img src="https://img.shields.io/badge/iPhone%20%2F%20Safari-hardware%20validated-0b7285?style=flat-square" alt="iPhone / Safari: hardware validated">
  <img src="https://img.shields.io/badge/Android-successfully%20tested-2f9e44?style=flat-square" alt="Android: successfully tested">
  <img src="https://img.shields.io/badge/WebGL1-supported-5c7cfa?style=flat-square" alt="WebGL1 supported">
  <img src="https://img.shields.io/badge/Touch-controls-495057?style=flat-square" alt="Touch controls">
  <img src="https://img.shields.io/badge/Controller-supported-495057?style=flat-square" alt="Controller supported">
  <img src="https://img.shields.io/badge/baseline-v1.0-862e9e?style=flat-square" alt="Baseline v1.0">
  <img src="https://img.shields.io/badge/ROM-not%20included-c92a2a?style=flat-square" alt="No ROM included">
</p>

<p align="center">
  <img src="docs/screenshots/overworld-town.jpeg"
       alt="Gen1Recomp Web/PWA voxel 3D overworld running on a mobile device"
       width="100%">
</p>

<p align="center">
  <a href="http://gen1recomp.inlasco.fr/"><img src="https://img.shields.io/badge/%E2%96%B6%20Launch%20Web%20App-gen1recomp.inlasco.fr-0b7285?style=for-the-badge" alt="Launch Web App at gen1recomp.inlasco.fr"></a>
</p>

<p align="center">
  <strong><a href="http://gen1recomp.inlasco.fr/">▶ Launch Web App — http://gen1recomp.inlasco.fr/</a></strong><br>
  <sub>Opens directly in your mobile browser. No download, no App Store, no GitHub account needed.</sub><br>
  <sub><em>Temporary access: HTTPS provisioning is still completing for this new subdomain. The app currently launches over HTTP; the link will switch back to HTTPS as soon as the certificate is fully active.</em></sub>
</p>

> [!IMPORTANT]
> **No ROM is included.** You must supply your own, legally obtained, supported game ROM. It is read locally on your device and is never uploaded to this repository or to the hosting server.

---

## I just want to play

You do not need a GitHub account, and you do not need to download this repository. Five steps, on your phone.

> [!NOTE]
> The web shell's buttons are currently labelled in French. The English meaning is given in brackets.

### Quick start

1. **Open the Web App** — go to **[http://gen1recomp.inlasco.fr/](http://gen1recomp.inlasco.fr/)** and wait until the status line reads `Prêt` *(Ready)*.
2. **Import your ROM** — tap `Importer une ROM` *(Import a ROM)* and pick your own legally obtained `.gb` / `.gbc` file. It must be exactly 1 MiB. The game boots straight after.
3. **Import Dramatic Shape** — download [`mods/DramaticShape-v1.0-widescreen-test.zip`](mods/DramaticShape-v1.0-widescreen-test.zip) from this repository, tap `Importer un mod` *(Import a mod)* and select it. Then open the launcher's `MODS` tab and switch **Dramatic Shape Voxel Mod** on.
4. **Enable the tested 3D preset** — in game, press `START` → `OPTION` and apply the values in [Recommended 3D preset](#recommended-3d-preset) below.
5. **Play** — use the on-screen touch controls, or connect a game controller (detected automatically). `Plein écran` *(Fullscreen)* gives an immersive view; the **×** in the corner leaves it.

### Recommended 3D preset

For a result close to the screenshots on this page, this is the mobile preset currently tested successfully with this Web/PWA build. It is not mandatory, and it is not an official Dramatic Shape configuration — it is a starting point you can customize afterwards.

**Where these settings live**

- Press `START` (touch pad or controller) to open the pause menu, then select `OPTION`.
- Once Dramatic Shape is enabled, its rows appear on that same `OPTION` list, below the engine's own rows. Scroll down to reach them.
- `Up` / `Down` move the cursor, `Left` / `Right` change the highlighted value.
- To go back to the game: press `B` or `START`, or move down to `CANCEL` and press `A`.

**The preset**

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

Other options can be left at their existing values unless you specifically want to customize them.

**What the main options do**

- `VOXEL = 50` — the camera angle rung of the voxel 3D view (50°).
- `3D-BTL = ON` — battles are staged on the map itself instead of the flat battle screen.
- `BACK SPRITES = ON` — keeps your own Pokémon's back sprite framing in battle.
- `DAYTIME = GOLDEN` — pins the day/night clock to the golden-hour lighting used in the screenshots.
- `G-SHADOW = ON` — enables the validated geometric world-space shadows.
- `WATER = FULL` — full water rendering, including the screen-space shoreline reflections.
- `AA = OFF` — no supersampling, which keeps the sharp pixel-art presentation used for this mobile baseline.

> [!NOTE]
> This preset comes from hardware-validated mobile use, but it is not a framerate promise for every device. If your device struggles, reduce rendering options before assuming the Web port is malfunctioning.

### What you need

- a compatible iPhone / iPad or Android device with a modern browser;
- your own legally obtained supported Pokémon Red, Blue or Yellow ROM — a `.gb` or `.gbc` file of exactly 1 MiB;
- no App Store installation, and no GitHub account;
- a Bluetooth / game controller is optional.

### Install as an app

You can add it to your home screen and launch it like a normal app.

**iPhone / iPad** — open the app in **Safari**, tap **Share**, choose **Add to Home Screen**, then launch it from its icon.

**Android** — open the app in a compatible browser, open the **browser menu**, choose **Install app**, **Add to Home screen**, or the equivalent entry, then launch it from its icon.

> [!NOTE]
> The temporary HTTP endpoint is intended for browser access. Full PWA installation behavior may require HTTPS depending on the browser.

### Your ROM and saves stay local

> [!IMPORTANT]
> - No ROM is included with, distributed by, or linked to from this project. Supplying a legal copy is your responsibility.
> - The ROM you pick is read and processed locally, inside your browser, on your device — this port does not upload it to this repository or to the hosting server.
> - Generated data, settings and saves are kept locally through your browser's storage.
> - **Clearing the site's browser data can delete your local saves.** There is no server-side save backup.

---

## Compatibility

| Platform / Feature | Status |
| --- | --- |
| iPhone / Safari | ✅ Hardware validated |
| Android | ✅ Successfully tested |
| Touch controls | ✅ Supported |
| Game controller | ✅ Supported |
| Installable PWA | ✅ |
| Local ROM import | ✅ |
| Local mod import | ✅ |
| Dramatic Shape voxel 3D | ✅ |
| WebGL1 | ✅ |

**iPhone / Safari** is the platform that went through the in-depth hardware campaign behind the v1.0 baseline. **Android** has been tested successfully. That is not a guarantee of compatibility with every Android device or browser.

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

The voxel overworld, the 3D battle and the touch controls shown above — and in the header image — are what the [Recommended 3D preset](#recommended-3d-preset) reproduces.

## Features

**In the browser**

- LÖVE 11.5 / WebAssembly runtime
- WebGL1
- local ROM import
- local mod import
- IndexedDB / browser-local persistence
- touch controls
- game controller support
- installable PWA
- adaptive mobile viewport
- native-aspect Gen1 2D rendering

**Rendering / Dramatic Shape**

- wide voxel 3D overworld
- Dramatic Shape Web/mobile build
- animated flowers
- `DAYTIME = GOLDEN`
- geometric world-space `G-SHADOW`
- `VOID FILL = TREES`
- 3D battles

## Dramatic Shape

The repository includes:

```text
mods/DramaticShape-v1.0-widescreen-test.zip
```

This is the exact Web/mobile build used for the v1.0 hardware validation. Its SHA-256 is documented in [`docs/BASELINE-v1.0.md`](docs/BASELINE-v1.0.md).

The mod is based on **Dramatic Shape Voxel Mod** by DramaticShape — upstream: <https://github.com/DramaticShape/DramaticShapeVoxelMod>. The included mod archive retains its upstream license and attribution.

---

## Technical / deployment information

### Running or deploying it yourself

This is a **static web application**. Serve the repository root over **HTTPS** with the existing directory structure intact.

The current shell loads:

```text
game-v13.3-viewport-final.love
11.5/love.js
11.5/love.wasm
```

Then open the deployment URL in a compatible mobile browser.

The runtime is LÖVE 11.5 compiled to **WebAssembly** (`love.js` / `love.wasm`), rendering through **WebGL1**, with the game shipped as a packaged `.love` archive. ROM-derived generated data, options and saves are stored locally by the browser through IndexedDB / IDBFS. No server-side save synchronization is part of v1.0.

### v1.0 validated baseline

The v1.0 technical baseline was **validated in depth on physical Safari/iPhone hardware**:

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

It has **since been tested successfully on Android**. That does not constitute a universal guarantee for every Android device or browser, and the hardware campaign recorded in the baseline document remains the Safari/iPhone one.

See [`docs/BASELINE-v1.0.md`](docs/BASELINE-v1.0.md) for the exact artifact SHA-256 hashes and implementation notes. Per-file hashes for the whole published tree are listed in [`SHA256SUMS`](SHA256SUMS).

### Known limitation

Some voxel auxiliary geometry, notably `G-SHADOW` and `VOID FILL = TREES`, can take additional time to appear after certain indoor-to-outdoor transitions. The current v1.0 baseline is intentionally preserved instead of shipping unvalidated optimization experiments.

## Project provenance

This repository is an independent Web/PWA adaptation and is **not the official Gen1Recomp repository**. We are not the original authors of Gen1Recomp, nor of Dramatic Shape, and this project is not officially affiliated with the upstream projects.

Upstream projects/components include:

- Gen1Recomp — <https://github.com/bryanthaboi/gen1recomp>
- Dramatic Shape Voxel Mod — <https://github.com/DramaticShape/DramaticShapeVoxelMod>
- LÖVE 11.5 / love.js runtime — license text retained under [`11.5/license.txt`](11.5/license.txt)

See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

## ROMs and trademarks

No ROM is distributed by this repository. Users are responsible for supplying their own legally obtained compatible ROM.

Pokémon, Nintendo, Game Boy and related names, marks and game intellectual property belong to their respective owners. This project is unofficial and is not affiliated with or endorsed by Nintendo, The Pokémon Company or Game Freak.

## License

There is **no blanket repository-wide license grant** in this repository. Components retain their respective upstream licenses and notices. See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) and the license files shipped with the relevant components.
