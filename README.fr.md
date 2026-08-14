# Gen1Recomp Web / PWA

[English](README.md) | **Français**

Jouez à Gen1Recomp directement depuis votre navigateur mobile — sans sideloading ni émulateur.

<p align="center">
  <a href="http://gen1recomp.inlasco.fr/"><img src="https://img.shields.io/badge/Application%20Web-en%20ligne-2f9e44?style=flat-square" alt="Application Web : en ligne"></a>
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

<p align="center">
  <a href="http://gen1recomp.inlasco.fr/"><img src="https://img.shields.io/badge/%E2%96%B6%20Lancer%20l%27application%20Web-gen1recomp.inlasco.fr-0b7285?style=for-the-badge" alt="Lancer l'application Web sur gen1recomp.inlasco.fr"></a>
</p>

<p align="center">
  <strong><a href="http://gen1recomp.inlasco.fr/">▶ Lancer l'application Web — http://gen1recomp.inlasco.fr/</a></strong><br>
  <sub>S'ouvre directement dans votre navigateur mobile. Aucun téléchargement, aucun App Store, aucun compte GitHub nécessaire.</sub><br>
  <sub><em>Accès temporaire : la mise en service HTTPS de ce nouveau sous-domaine est encore en cours. L'application est actuellement accessible en HTTP ; le lien repassera en HTTPS dès que le certificat sera pleinement opérationnel.</em></sub>
</p>

> [!IMPORTANT]
> **Aucune ROM n'est fournie.** Vous devez utiliser votre propre ROM compatible, obtenue légalement. Elle est lue localement sur votre appareil et n'est jamais envoyée vers ce dépôt ni vers le serveur d'hébergement.

---

## Je veux simplement jouer

Aucun compte GitHub n'est nécessaire, et il est inutile de télécharger ce dépôt. Cinq étapes, depuis votre téléphone.

> [!NOTE]
> Les intitulés indiqués ci-dessous sont exactement ceux affichés à l'écran.

### Démarrage rapide

1. **Ouvrir l'application Web** — rendez-vous sur **[http://gen1recomp.inlasco.fr/](http://gen1recomp.inlasco.fr/)** et patientez jusqu'à ce que la ligne d'état affiche `Prêt`.
2. **Importer sa ROM** — touchez `Importer une ROM` et choisissez votre propre fichier `.gb` / `.gbc` obtenu légalement. Il doit faire exactement 1 Mio. Le jeu démarre dans la foulée.
3. **Importer Dramatic Shape** — téléchargez [`mods/DramaticShape-v1.0-widescreen-test.zip`](mods/DramaticShape-v1.0-widescreen-test.zip) depuis ce dépôt, touchez `Importer un mod` et sélectionnez-le. Ouvrez ensuite l'onglet `MODS` du launcher et activez **Dramatic Shape Voxel Mod**.
4. **Activer le preset 3D testé** — en jeu, appuyez sur `START` → `OPTION` et appliquez les valeurs de la section [Réglage 3D recommandé](#réglage-3d-recommandé) ci-dessous.
5. **Jouer** — avec les commandes tactiles à l'écran, ou avec une manette (détectée automatiquement). `Plein écran` offre un affichage immersif ; le **×** dans le coin permet d'en sortir.

### Réglage 3D recommandé

Pour obtenir un rendu proche des captures de cette page, voici le preset mobile actuellement testé avec succès avec cette build Web/PWA. Il n'a rien d'obligatoire, et il ne s'agit pas d'une configuration officielle de Dramatic Shape : c'est un point de départ que vous pouvez ensuite personnaliser.

**Où se trouvent ces réglages**

- Appuyez sur `START` (pad tactile ou manette) pour ouvrir le menu de pause, puis choisissez `OPTION`.
- Une fois Dramatic Shape activé, ses lignes apparaissent dans cette même liste `OPTION`, sous les lignes propres au moteur. Faites défiler vers le bas pour les atteindre.
- `Haut` / `Bas` déplacent le curseur, `Gauche` / `Droite` modifient la valeur sélectionnée.
- Pour revenir au jeu : appuyez sur `B` ou `START`, ou descendez sur `CANCEL` et appuyez sur `A`.

**Le preset**

| Réglage | Valeur |
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

Les autres options peuvent rester sur leurs valeurs actuelles, sauf si vous souhaitez les personnaliser.

**À quoi servent les principales options**

- `VOXEL = 50` — le cran d'angle de caméra de la vue voxel 3D (50°).
- `3D-BTL = ON` — les combats se déroulent sur la carte elle-même au lieu de l'écran de combat classique.
- `BACK SPRITES = ON` — conserve le cadrage du sprite de dos de votre propre Pokémon en combat.
- `DAYTIME = GOLDEN` — fige l'horloge jour/nuit sur la lumière dorée utilisée dans les captures.
- `G-SHADOW = ON` — active les ombres géométriques ancrées dans l'espace monde, validées sur matériel.
- `WATER = FULL` — rendu complet de l'eau, y compris les reflets de rive en espace écran.
- `AA = OFF` — pas de suréchantillonnage, ce qui conserve le rendu pixel-art net retenu pour cette baseline mobile.

> [!NOTE]
> Ce preset provient d'une utilisation mobile validée sur matériel réel, mais il ne constitue pas une promesse de fluidité sur tous les appareils. Si votre appareil manque de performances, réduisez d'abord certaines options graphiques avant de conclure à un dysfonctionnement du port Web.

### Ce qu'il vous faut

- un iPhone / iPad ou un appareil Android compatible, avec un navigateur moderne ;
- votre propre ROM compatible de Pokémon Rouge, Bleu ou Jaune, obtenue légalement — un fichier `.gb` ou `.gbc` d'exactement 1 Mio ;
- aucune installation depuis l'App Store, et aucun compte GitHub ;
- une manette Bluetooth est facultative.

### Installer comme une application

Vous pouvez l'ajouter à votre écran d'accueil et la lancer comme une application classique.

**iPhone / iPad** — ouvrez l'application dans **Safari**, touchez **Partager**, choisissez **Sur l'écran d'accueil**, puis lancez-la depuis son icône.

**Android** — ouvrez l'application dans un navigateur compatible, ouvrez le **menu du navigateur**, choisissez **Installer l'application**, **Ajouter à l'écran d'accueil** ou l'option équivalente, puis lancez-la depuis son icône.

> [!NOTE]
> L'accès HTTP temporaire est destiné à l'utilisation dans le navigateur. Selon le navigateur, l'installation complète en PWA peut nécessiter HTTPS.

### Votre ROM et vos sauvegardes restent locales

> [!IMPORTANT]
> - Aucune ROM n'est fournie, distribuée ni référencée par ce projet. Disposer d'une copie légale relève de votre responsabilité.
> - La ROM que vous sélectionnez est lue et traitée localement, dans votre navigateur, sur votre appareil : ce port ne l'envoie ni vers ce dépôt ni vers le serveur d'hébergement.
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

L'overworld voxel, le combat 3D et les commandes tactiles ci-dessus — ainsi que l'image d'en-tête — correspondent au rendu que reproduit le [Réglage 3D recommandé](#réglage-3d-recommandé).

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
