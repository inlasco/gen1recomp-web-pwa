# Gen1Recomp Web / PWA

[English](README.md) | **Français**

Jouez à Gen1Recomp directement depuis votre navigateur mobile — sans sideloading ni émulateur.

<p align="center">
  <img src="https://img.shields.io/badge/Web-PWA-111827?style=flat-square" alt="Web / PWA">
  <img src="https://img.shields.io/badge/iPhone%20%2F%20Safari-valid%C3%A9%20sur%20mat%C3%A9riel-0b7285?style=flat-square" alt="iPhone / Safari : validé sur matériel réel">
  <img src="https://img.shields.io/badge/Android-test%C3%A9%20avec%20succ%C3%A8s-2f9e44?style=flat-square" alt="Android : testé avec succès">
  <img src="https://img.shields.io/badge/WebGL1-pris%20en%20charge-5c7cfa?style=flat-square" alt="WebGL1 pris en charge">
  <img src="https://img.shields.io/badge/Tactile-commandes-495057?style=flat-square" alt="Commandes tactiles">
  <img src="https://img.shields.io/badge/Manette-prise%20en%20charge-495057?style=flat-square" alt="Manette prise en charge">
  <img src="https://img.shields.io/badge/baseline-v1.0-862e9e?style=flat-square" alt="Baseline v1.0">
  <img src="https://img.shields.io/badge/ROM-non%20fournie-c92a2a?style=flat-square" alt="Aucune ROM fournie">
</p>

<p align="center">
  <img src="docs/screenshots/overworld-town.jpeg"
       alt="Overworld voxel 3D de Gen1Recomp Web/PWA sur appareil mobile"
       width="100%">
</p>

> [!IMPORTANT]
> **Aucune ROM n'est fournie.** Vous devez utiliser votre propre ROM compatible, obtenue légalement. Elle est lue localement sur votre appareil et n'est jamais envoyée vers ce dépôt ni vers le serveur d'hébergement.

---

## Je veux simplement jouer

### Démarrage rapide

**Faut-il connaître GitHub ? Non.**

Si vous voulez simplement jouer, vous n'avez pas besoin de télécharger ce dépôt ni de comprendre GitHub. Le bouton vert **Code → Download ZIP** n'est *pas* la façon de jouer : il ne fait que récupérer les fichiers sources bruts.

**Où ouvrir l'application ?** Ce dépôt contient les fichiers de l'application. Il ne publie pas d'instance publique officielle, et aucune URL de production n'est indiquée ici. Donc :

- si quelqu'un vous a communiqué un lien vers une copie en ligne, ouvrez **ce lien** sur votre téléphone ou votre tablette ;
- si vous souhaitez héberger votre propre copie, voir *Informations techniques / déploiement* plus bas.

Tout ce qui suit suppose que l'application est déjà ouverte dans votre navigateur.

### Ce qu'il vous faut

- un iPhone / iPad ou un appareil Android compatible ;
- un navigateur moderne compatible ;
- votre propre ROM compatible de Pokémon Rouge, Bleu ou Jaune, obtenue légalement — un fichier `.gb` ou `.gbc` d'exactement 1 Mio ;
- aucune installation depuis l'App Store n'est nécessaire ;
- une manette Bluetooth est facultative.

**Aucune ROM n'est fournie avec ce projet.** Ce projet n'indique pas où en trouver une et ne fournit aucun lien vers une ROM. Disposer d'une copie légale relève de votre responsabilité.

### Premier lancement, étape par étape

> [!NOTE]
> Les intitulés indiqués ci-dessous sont exactement ceux affichés par l'application.

1. **Ouvrez l'application** dans votre navigateur mobile et patientez quelques secondes pendant le chargement.
2. **Attendez que la ligne d'état affiche `Prêt`.** Les boutons restent inactifs tant que le moteur n'est pas prêt.
3. **Touchez `Importer une ROM`** et choisissez votre propre fichier `.gb` ou `.gbc` depuis votre appareil. Il doit faire exactement 1 Mio — l'application refuse tout autre fichier.
4. **Le jeu démarre.** Votre ROM est lue sur votre appareil puis transmise directement au moteur local.
5. *(Facultatif, pour le rendu voxel 3D)* **Touchez `Importer un mod`** et sélectionnez le fichier `DramaticShape-v1.0-widescreen-test.zip`, puis activez-le depuis la section mods du launcher. C'est ce que montrent les captures de cette page.
6. **Touchez `Plein écran`** pour un affichage immersif. Le bouton **×** dans le coin permet d'en sortir.
7. **Jouez** avec les commandes tactiles à l'écran, ou branchez une manette : elle est détectée automatiquement.

### Installer comme une application

Vous pouvez l'ajouter à votre écran d'accueil et la lancer comme une application classique.

**iPhone / iPad**

1. Ouvrez l'application dans **Safari**.
2. Touchez le bouton **Partager**.
3. Choisissez **Sur l'écran d'accueil**.
4. Lancez-la ensuite depuis son icône.

**Android**

L'intitulé varie selon les navigateurs ; choisissez l'entrée la plus proche :

1. Ouvrez l'application dans un navigateur compatible.
2. Ouvrez le **menu du navigateur**.
3. Choisissez **Installer l'application**, **Ajouter à l'écran d'accueil**, ou l'option équivalente de votre navigateur.
4. Lancez-la ensuite depuis son icône.

### Votre ROM et vos sauvegardes restent locales

> [!IMPORTANT]
> **Votre ROM et vos sauvegardes restent locales.**
> - Aucune ROM n'est fournie ni distribuée par ce projet.
> - La ROM que vous sélectionnez est lue et traitée localement, dans votre navigateur, sur votre appareil.
> - Ce port n'envoie pas votre ROM vers ce dépôt ni vers le serveur d'hébergement.
> - Les données générées, les réglages et les sauvegardes sont conservés localement via le stockage de votre navigateur.
> - **Supprimer les données du site peut effacer vos sauvegardes locales.** Il n'existe aucune sauvegarde côté serveur.

---

## Compatibilité

| Plateforme / Fonction | Statut |
| --- | --- |
| iPhone / Safari | ✅ Validé sur matériel réel |
| Android | ✅ Testé avec succès |
| Commandes tactiles | ✅ Prises en charge |
| Manette de jeu | ✅ Prise en charge |
| PWA installable | ✅ |
| Import local de ROM | ✅ |
| Import local de mod | ✅ |
| Voxel 3D Dramatic Shape | ✅ |
| WebGL1 | ✅ |

**iPhone / Safari** est la plateforme qui a fait l'objet de la campagne matérielle approfondie à l'origine de la baseline v1.0. **Android** a été testé avec succès. Cela ne constitue pas une garantie de compatibilité avec tous les appareils ou navigateurs Android.

## Aperçu du jeu

<table>
  <tr>
    <td width="50%" align="center" valign="top">
      <img src="docs/screenshots/battle-3d-touch.jpeg" alt="Combat voxel 3D entre Salamèche et Roucool avec commandes tactiles à l'écran" width="100%">
      <br><sub>Combat voxel 3D avec commandes tactiles</sub>
    </td>
    <td width="50%" align="center" valign="top">
      <img src="docs/screenshots/overworld-touch-dialogue.jpeg" alt="Overworld voxel 3D avec boîte de dialogue et commandes tactiles à l'écran" width="100%">
      <br><sub>Overworld voxel avec commandes tactiles mobiles</sub>
    </td>
  </tr>
</table>

## Fonctionnalités

**Dans le navigateur**

- runtime LÖVE 11.5 / WebAssembly
- WebGL1
- import local de ROM
- import local de mods
- persistance IndexedDB / locale au navigateur
- commandes tactiles
- prise en charge des manettes
- PWA installable
- viewport mobile adaptatif
- rendu 2D Gen1 au format natif

**Rendu / Dramatic Shape**

- overworld voxel 3D large
- build Web/mobile de Dramatic Shape
- fleurs animées
- `DAYTIME = GOLDEN`
- `G-SHADOW` géométrique ancré dans l'espace monde
- `VOID FILL = TREES`
- combats 3D

## Dramatic Shape

Le dépôt contient :

```text
mods/DramaticShape-v1.0-widescreen-test.zip
```

Il s'agit de la build Web/mobile exacte utilisée pour la validation matérielle v1.0. Son SHA-256 figure dans [`docs/BASELINE-v1.0.md`](docs/BASELINE-v1.0.md).

Le mod est basé sur **Dramatic Shape Voxel Mod** par DramaticShape — dépôt amont : <https://github.com/DramaticShape/DramaticShapeVoxelMod>. L'archive incluse conserve sa licence et ses attributions amont.

---

## Informations techniques / déploiement

### Exécuter ou déployer soi-même

Il s'agit d'une **application Web statique**. Servez la racine du dépôt en **HTTPS** en conservant l'arborescence des fichiers.

Le shell actuel charge :

```text
game-v13.3-viewport-final.love
11.5/love.js
11.5/love.wasm
```

Ouvrez ensuite l'URL de déploiement dans un navigateur mobile compatible.

Le runtime est LÖVE 11.5 compilé en **WebAssembly** (`love.js` / `love.wasm`), avec un rendu **WebGL1**, le jeu étant livré sous forme d'archive `.love`. Le cache dérivé de la ROM, les réglages et les sauvegardes sont conservés localement par le navigateur via IndexedDB / IDBFS. Aucune synchronisation des sauvegardes côté serveur ne fait partie de la v1.0.

### Baseline v1.0 validée

La baseline technique v1.0 a été **validée en profondeur sur du matériel Safari/iPhone réel** :

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

Elle a **depuis été testée avec succès sur Android**. Cela ne constitue pas une garantie universelle pour tous les appareils ou navigateurs Android, et la campagne matérielle consignée dans le document de baseline reste celle menée sur Safari/iPhone.

Les SHA-256 exacts des artefacts et les décisions techniques sont documentés dans [`docs/BASELINE-v1.0.md`](docs/BASELINE-v1.0.md). Les empreintes par fichier de l'ensemble de l'arborescence publiée figurent dans [`SHA256SUMS`](SHA256SUMS).

### Limitation connue

Certaines géométries auxiliaires voxel, notamment `G-SHADOW` et `VOID FILL = TREES`, peuvent apparaître avec un délai après certaines transitions intérieur → extérieur. La baseline v1.0 conserve volontairement le comportement validé plutôt que d'intégrer des optimisations expérimentales non validées.

## Origine du projet

Ce dépôt est une adaptation Web/PWA indépendante et **n'est pas le dépôt officiel de Gen1Recomp**. Nous ne sommes ni les auteurs originaux de Gen1Recomp, ni ceux de Dramatic Shape, et ce projet n'est pas officiellement affilié aux projets amont.

Principaux projets/composants amont :

- Gen1Recomp — <https://github.com/bryanthaboi/gen1recomp>
- Dramatic Shape Voxel Mod — <https://github.com/DramaticShape/DramaticShapeVoxelMod>
- runtime LÖVE 11.5 / love.js — licence conservée dans [`11.5/license.txt`](11.5/license.txt)

Voir [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

## ROM et marques

Aucune ROM n'est distribuée dans ce dépôt. Les utilisateurs doivent fournir leur propre ROM compatible obtenue légalement.

Pokémon, Nintendo, Game Boy ainsi que les noms, marques et éléments de propriété intellectuelle associés appartiennent à leurs titulaires respectifs. Ce projet est non officiel et n'est ni affilié ni approuvé par Nintendo, The Pokémon Company ou Game Freak.

## Licence

Ce dépôt n'accorde **aucune licence globale unique** sur l'ensemble de son contenu. Chaque composant conserve les droits, licences et mentions de son projet d'origine. Voir [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) et les fichiers de licence fournis avec les composants concernés.
