# v1.0 hardware baseline

This document records the artifacts intentionally published as the initial Web/PWA baseline.

## Runtime

- LÖVE 11.5
- WebGL1
- Safari/iPhone target
- PWA / Home Screen shell

## Key artifacts

| File | SHA-256 |
|---|---|
| `game-v13.3-viewport-final.love` | `854a27848e573832f6a9a5be7762aaa63686cb65afb61338959431e3333c494b` |
| `11.5/love.js` | `34b300f06ecb44d92edb1183c11a38c1cc324ba10a9f7af96b8efa1d1df15147` |
| `11.5/love.wasm` | `304f195f36d163f3bb2127e7c232fd1fd0791ee2ab61ba003d47096003b53bf1` |
| `player.js` | `fd8c0391855467307ae92abcdd31a814a60a3ec049e3113fdc1f78b824d356cf` |
| `mods/DramaticShape-v1.0-widescreen-test.zip` | `80c4073e6facead052ac16d3d7cab0d355bc530fb41b76949dfd1b9306c24782` |

## Validated behavior

Material testing on Safari/iPhone validated:

- launcher boot
- ROM import
- mod import
- local persistence
- touch input
- adaptive wide landscape viewport
- native-aspect 2D rendering without horizontal stretching
- voxel overworld using the additional horizontal field of view
- animated flowers
- GOLDEN daytime profile
- geometric world-space G-SHADOW
- VOID FILL TREES
- 3D battles
- indoor/outdoor transitions

## Architectural decisions

### Adaptive viewport

The final wide viewport keeps the vertical world framing and expands horizontal visibility. The LÖVE/SDL runtime owns the render geometry; CSS presents that geometry using a uniform scale. The DOM backing store is not independently forced wider than the logical LÖVE surface.

### Web shadowing

The historical Web ShadowMap path is intentionally not used. The validated Web build uses geometric projected world-space shadows (`G-SHADOW`).

### PWA storage

ROM-derived generated data, options and saves are stored locally through the browser storage used by LÖVE / IDBFS. No server-side save synchronization is part of v1.0.

## Known performance issue

`G-SHADOW` and `VOID FILL = TREES` may appear with a delay after some interior-to-exterior transitions. Experimental persistence/prewarm patches were not promoted into this v1.0 baseline because their material performance did not meet the target.
