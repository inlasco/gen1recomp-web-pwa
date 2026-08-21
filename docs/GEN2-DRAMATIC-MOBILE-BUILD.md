# inlasComp — Gen2 Dramatic Mobile candidate build

This branch is an isolated build harness only. It does not change production files on `main` and does not deploy anything.

The workflow builds an importable Gen2 graphics-mod candidate from public upstream work, with mobile/Web/PWA defaults and automated static validation.

Target games: Pokémon Gold, Silver and Crystal (Gen2 runtime gate).

The resulting candidate is emitted only as a GitHub Actions artifact for physical testing before any production integration.
