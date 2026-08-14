# Gen1Recomp Web / PWA

**English** | [Français](README.fr.md)

Play Gen1Recomp directly in your mobile browser — no sideloading, no emulator.

<p align="center">
  <a href="https://gen1recomp.inlasco.fr/"><img src="https://img.shields.io/badge/Web%20App-live-2f9e44?style=flat-square" alt="Web App: live"></a>
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
  <a href="https://gen1recomp.inlasco.fr/"><img src="https://img.shields.io/badge/%E2%96%B6%20Launch%20Web%20App-gen1recomp.inlasco.fr-0b7285?style=for-the-badge" alt="Launch Web App at gen1recomp.inlasco.fr"></a>
</p>

<p align="center">
  <strong><a href="https://gen1recomp.inlasco.fr/">▶ Launch Web App — https://gen1recomp.inlasco.fr/</a></strong><br>
  <sub>Opens directly in your mobile browser. No download, no App Store, no GitHub account needed.</sub>
</p>

> [!IMPORTANT]
> **No ROM is included.** You must supply your own, legally obtained, supported game ROM. It is read locally on your device and is never uploaded to this repository or to the hosting server.

---

## I just want to play

### Quick start

**Do I need to know GitHub? No.**

If you only want to play, you do not need to download this repository or understand GitHub. The green **Code → Download ZIP** button is *not* how you play — it just gives you the raw source files.

**Where do I open it?** Open the official public Web App:

> ### ▶ [https://gen1recomp.inlasco.fr/](https://gen1recomp.inlasco.fr/)

You do not need to download this GitHub repository to play — just open that address on your phone or tablet. If you would rather run your own copy instead, see *Technical / deployment information* further down.

### What you need

- a compatible iPhone / iPad or Android device;
- a compatible modern browser;
- your own legally obtained supported Pokémon Red, Blue or Yellow ROM — a `.gb` or `.gbc` file of exactly 1 MiB;
- no App Store installation required;
- a Bluetooth / game controller is optional.

**No ROM is included with this project.** This project does not tell you where to find one and does not link to one. Supplying a legal copy is your responsibility.

### First launch, step by step

> [!NOTE]
> The web shell's buttons are currently labelled in French. The English meaning is given in brackets below.

1. **Open [https://gen1recomp.inlasco.fr/](https://gen1recomp.inlasco.fr/)** in your mobile browser and wait a few seconds while it loads.
2. **Wait for the status line to say `Prêt`** *(Ready)*. The buttons stay greyed out until the engine is ready.
3. **Tap `Importer une ROM`** *(Import a ROM)* and pick your own `.gb` or `.gbc` file from your device. It must be exactly 1 MiB — the app refuses anything else.
4. **The game boots.** Your ROM is read on your device and handed straight to the local engine.
5. *(Optional, for the 3D voxel look)* **Tap `Importer un mod`** *(Import a mod)* and choose the `DramaticShape-v1.0-widescreen-test.zip` file, then turn it on from the launcher's mod section. This is what the screenshots on this page show.
6. **Tap `Plein écran`** *(Fullscreen)* for immersive play. The **×** button in the corner leaves fullscreen again.
7. **Play** using the on-screen touch controls, or connect a game controller — it is detected automatically.

### Install as an app

You can add it to your home screen and launch it like a normal app.

**iPhone / iPad**

1. Open the app in **Safari**.
2. Tap the **Share** button.
3. Choose **Add to Home Screen**.
4. Launch it from its icon.

**Android**

Wording differs between browsers, so pick the closest match:

1. Open the app in a compatible browser.
2. Open the **browser menu**.
3. Choose **Install app**, **Add to Home screen**, or the equivalent entry in your browser.
4. Launch it from its icon.

### Your ROM and saves stay local

> [!IMPORTANT]
> **Your ROM and saves stay local.**
> - No ROM is included with or distributed by this project.
> - The ROM you pick is read and processed locally, inside your browser, on your device.
> - This port does not upload your ROM to this repository or to the hosting server.
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
