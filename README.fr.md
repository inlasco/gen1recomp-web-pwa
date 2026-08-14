# Gen1Recomp Web / PWA pour iPhone

[English](README.md) | **Français**

Adaptation Web/PWA de [Gen1Recomp](https://github.com/bryanthaboi/gen1recomp), pensée pour exécuter le projet directement dans Safari sur iPhone, sans sideloading.

Ce dépôt contient la **baseline de déploiement Web v1.0 validée sur un véritable iPhone**.

> **Aucune ROM n'est incluse.** L'utilisateur doit sélectionner localement une ROM compatible obtenue légalement. Le port Web n'envoie pas la ROM vers ce dépôt ni vers le serveur d'hébergement.

## Ce que ce port ajoute

- runtime WebAssembly + WebGL1 pour Safari/iPhone
- PWA installable sur l'écran d'accueil
- import local de ROM depuis l'app Fichiers d'iOS
- import local de mods
- persistance IndexedDB / IDBFS
- contrôles tactiles et prise en charge des manettes
- viewport paysage adaptatif pour les écrans iPhone modernes
- rendu 2D natif sans étirement
- overworld voxel 3D large
- build Web/iPhone de Dramatic Shape Voxel Mod incluse

## Baseline v1.0 validée

La baseline actuelle a été validée matériellement sur Safari/iPhone avec :

- démarrage de Gen1Recomp et du launcher
- import local de ROM
- import local de mod
- contrôles tactiles
- WebGL1
- viewport large adaptatif
- overworld voxel Dramatic Shape
- fleurs animées
- `DAYTIME = GOLDEN`
- `G-SHADOW` géométrique ancré dans l'espace monde
- `VOID FILL = TREES`
- combats 3D
- transitions intérieur/extérieur

Les SHA-256 exacts et les décisions techniques de la baseline sont documentés dans [`docs/BASELINE-v1.0.md`](docs/BASELINE-v1.0.md).

## Exécution / déploiement

Il s'agit d'une application Web statique. Servez la racine du dépôt en **HTTPS** en conservant l'arborescence des fichiers.

Le shell actuel charge :

```text
game-v13.3-viewport-final.love
11.5/love.js
11.5/love.wasm
```

Ouvrez ensuite l'URL de déploiement dans Safari.

Lors de la première utilisation :

1. Sélectionnez une ROM compatible depuis le sélecteur de fichiers iOS.
2. Importez le ZIP Dramatic Shape si souhaité.
3. Lancez le jeu.
4. Utilisez **Ajouter à l'écran d'accueil** dans Safari pour installer la PWA.

Le cache dérivé de la ROM, les réglages et les sauvegardes sont conservés localement par le navigateur via IndexedDB / IDBFS. La suppression des données du site peut donc les effacer.

## Dramatic Shape

Le dépôt contient :

```text
mods/DramaticShape-v1.0-widescreen-test.zip
```

Il s'agit de la build Web/iPhone exacte utilisée pour la validation matérielle v1.0. Son SHA-256 figure dans `docs/BASELINE-v1.0.md`.

Le mod est basé sur **Dramatic Shape Voxel Mod** par DramaticShape. L'archive incluse conserve sa licence et ses attributions amont.

## Limitation actuelle importante

Certaines géométries auxiliaires voxel, notamment `G-SHADOW` et `VOID FILL = TREES`, peuvent apparaître avec un délai après certaines transitions intérieur/extérieur. La baseline v1.0 conserve volontairement le comportement validé plutôt que d'intégrer des optimisations expérimentales non validées.

## Origine du projet

Ce dépôt est une adaptation Web/PWA indépendante et **n'est pas le dépôt officiel de Gen1Recomp**.

Principaux projets/composants amont :

- Gen1Recomp — `bryanthaboi/gen1recomp`
- Dramatic Shape Voxel Mod — `DramaticShape/DramaticShapeVoxelMod`
- runtime LÖVE 11.5 / love.js — licence conservée dans `11.5/license.txt`

Voir [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

## ROM et marques

Aucune ROM n'est distribuée dans ce dépôt. Les utilisateurs doivent fournir leur propre ROM compatible obtenue légalement.

Pokémon, Nintendo, Game Boy ainsi que les noms, marques et éléments de propriété intellectuelle associés appartiennent à leurs titulaires respectifs. Ce projet est non officiel et n'est ni affilié ni approuvé par Nintendo, The Pokémon Company ou Game Freak.

## Licence

Ce dépôt n'accorde **aucune licence globale unique** sur l'ensemble de son contenu. Chaque composant conserve les droits, licences et mentions de son projet d'origine. Voir [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) et les fichiers de licence fournis avec les composants concernés.
