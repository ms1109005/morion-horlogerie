# MORION, jalon 1 : socle + montre 3D procédurale. Plan d'implémentation

> **Cases cochées après coup** (jalon 7) : elles n'ont pas été tenues à jour pendant
> l'exécution. Elles ont été cochées sur vérification des livrables sur disque (fichiers,
> fonctions, rendus, captures, tests). L'état de référence reste `docs/PROGRESSION.md`
> et `docs/decisions.md`.

> **Pour l'exécutant :** exécuter tâche par tâche (superpowers:executing-plans). Cases `- [x]`
> pour le suivi. Pas de commit sans demande explicite du user.

**But :** un générateur three.js des 3 familles MORION (pièces séparées, 4 finitions, options du
configurateur, éclaté) et une page `studio.html` qui permet au user de valider le rendu 3D avant
la suite du site.

**Architecture :** modules ES natifs sans build ; `buildWatch(config)` pur qui renvoie un `Group`
de meshes nommés ; matières PBR et textures générées au canvas ; environnement studio fait
maison (panneaux lumineux → PMREM) pour des reflets de photo produit.

**Technos :** three.js 0.186.0 (jsdelivr, importmap), OrbitControls, `node --test` pour la
logique pure, chrome-devtools MCP pour les contrôles navigateur.

**Spec :** `docs/spec.md` (sections 3, 6, 7, 8).

## Contraintes globales

- Dossier du site : `portfolio/morion-horlogerie/`. Aucun fichier à la racine de `anti-stitch/`.
- Sans build, sans `node_modules` : three.js via `importmap` sur
  `https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.js` et `.../examples/jsm/`.
- Unités : 1 unité = 1 mm. Cadran face à +Z, 12 h = +Y, couronne à +X. Centre du boîtier à l'origine.
- Textes français, sans tiret cadratin. Aucune vraie marque, aucun logo réel.
- Serveur local : `python serve.py` (repli SPA + Range), jamais `python -m http.server`.
- Captures chrome-devtools : une à la fois, `select_page` avant si l'onglet est en arrière-plan.
- Barre de qualité : captures `scratchpad/refs/60fps-*.png` (métaux, reflets, proportions),
  sans copier leur dessin.

## Carte des fichiers

| Fichier | Rôle |
|---|---|
| `studio.html` | Page de validation : canvas plein écran + panneau d'options |
| `serve.py` | Serveur local, repli vers `index.html`, requêtes Range |
| `js/data/catalogue.js` | Familles, finitions, options, prix (données pures) |
| `js/store/config.js` | Config par défaut, validation, encodage URL, prix |
| `js/stage/renderer.js` | Renderer, environnement studio, caméra, boucle, redimensionnement |
| `js/watch/textures.js` | Générateurs canvas : brossé, soleillé, tapisserie, lignes, azurage, perlage, côtes de Genève, grain cuir, nervures caoutchouc, marquages |
| `js/watch/materials.js` | Bibliothèque de matières PBR et cache |
| `js/watch/case.js` | Carrures, lunettes, vis, glace, couronne, poussoirs, fond (3 familles) |
| `js/watch/dial.js` | Cadran, réhaut, index, compteurs, date, marquages |
| `js/watch/hands.js` | Aiguilles, `setTime` |
| `js/watch/strap.js` | Courbe de bracelet, maillons métal, caoutchouc, cuir, boucle |
| `js/watch/movement.js` | Platine, ponts, rouages, balancier, spiral, rotor, rubis, vis bleuies, roue à colonnes |
| `js/watch/build.js` | `buildWatch`, `applyConfig`, ancres, animation |
| `js/watch/explode.js` | Vecteurs et état d'éclaté |
| `js/studio.js` | Logique de la page studio |
| `tests/*.test.js` | Tests `node --test` de la logique pure |

---

### Tâche 1 : socle, serveur, renderer studio

**Fichiers :** créer `studio.html`, `serve.py`, `js/stage/renderer.js`, `js/studio.js`, `css/studio.css`.

**Produit :**
```js
// js/stage/renderer.js
export function createStage(canvas, { dprMax = 2 } = {})
// → { renderer, scene, camera, controls, envTexture, render(), start(), stop(), resize(),
//     setView(name /* 'trois-quarts'|'face'|'profil'|'dos' */), exportPNG(size) → Promise<Blob> }
```

- [x] `serve.py` : `http.server` + `SimpleHTTPRequestHandler` étendu : si le chemin n'existe pas et
      n'a pas d'extension → sert `index.html` (ou `studio.html` tant qu'`index.html` n'existe
      pas) ; gère `Range: bytes=a-b` (206). Port 8781.
- [x] `studio.html` : `importmap` three 0.186.0 + addons, `<canvas id="stage">`, `<aside>` des
      options, `<script type="module" src="js/studio.js">`.
- [x] Renderer : `antialias: true`, `outputColorSpace = SRGBColorSpace`, `toneMapping =
      AgXToneMapping`, exposition 1.0, DPR `min(devicePixelRatio, dprMax)`, fond dégradé gris
      perle (CSS derrière un canvas `alpha: true`).
- [x] Environnement studio : scène annexe avec 3 panneaux `MeshBasicMaterial` lumineux (couleur
      × 6 à 12 pour le HDR) : grande boîte à lumière au-dessus, 2 bandes verticales latérales, sol
      sombre, puis `PMREMGenerator.fromScene(envScene, 0.02)` → `scene.environment`. Ajouter une
      `DirectionalLight` douce (intensité 1.5) pour le relief.
- [x] Ombre de contact : plan sous la montre avec texture canvas en dégradé radial noir → transparent.
- [x] Caméra `PerspectiveCamera(28°)`, `OrbitControls` amortis, vues nommées : trois-quarts
      (x 60, y 25, z 110), face (0, 0, 130), profil (130, 0, 0), dos (0, 0, -130).
- [x] Test navigateur : cube `MeshPhysicalMaterial` métal poli au centre. Lancer `python serve.py`,
      ouvrir `http://127.0.0.1:8781/studio.html`, capture 1440×900. Attendu : cube net et
      anticrénelé, avec des reflets en bandes lumineuses (pas uniformément gris). Console : 0 erreur.

### Tâche 2 : catalogue, configuration, prix (TDD)

**Fichiers :** créer `js/data/catalogue.js`, `js/store/config.js`, `tests/config.test.js`.

**Produit :**
```js
// catalogue.js
export const FAMILIES   // { PR42:{nom,diametre:42,base:{AC,CN,OJ,OR}}, MO39:{...39}, AB41:{...41} }
export const FINISHES   // { AC:{nom:'Acier'}, CN:{nom:'Céramique noire'}, OJ:{nom:'Or jaune'}, OR:{nom:'Or rose'} }
export const OPTIONS    // dialColor:[noir,bleu,fume,vert,saumon,argent], dialPattern:[soleil,tapisserie,lignes],
                        // hands:[acier,or,lume], strap:[caoutchouc,cuir,metal],
                        // strapColor:{caoutchouc:[noir,bleu,vert,sable,orange], cuir:[noir,cognac,bleu]}
export const REFERENCES // 12 entrées { ref:'MOR-PR42-OR', family, finish, config }
// config.js
export function defaultConfig(family, finish)        // → Config
export function normalize(partial)                   // → Config valide (valeurs inconnues → défaut)
export function encode(config) / decode(code)        // code URL <-> Config ; code invalide → null
export function price(config)                        // → { base, lines:[{label, amount}], total }
```

Config : `{ family, case, bezel, dialColor, dialPattern, hands, strap, strapColor, engraving }`.
Défauts : lunette = boîtier ; motif PR42 tapisserie, MO39 lignes, AB41 soleil ; couleur AC bleu,
CN noir, OJ noir, OR fume ; aiguilles lume pour AB41, or pour OJ/OR, sinon acier ; bracelet
métal pour PR42 et MO39, caoutchouc noir pour AB41 ; gravure vide.
Code : `PR42-OR-OR-FU-TA-OR-ME-NO` + `~` + gravure en base64url si non vide.

- [x] Écrire `tests/config.test.js` :
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultConfig, normalize, encode, decode, price } from '../js/store/config.js';
import { REFERENCES } from '../js/data/catalogue.js';

test('12 références', () => assert.equal(REFERENCES.length, 12));
test('Monolithe acier par défaut sans option payante', () => {
  const c = { ...defaultConfig('MO39', 'AC'), dialPattern: 'soleil', strap: 'caoutchouc' };
  assert.equal(price(c).total, 11900);
});
test('Prisme or rose tout or gravé = 59 750', () => {
  const c = { ...defaultConfig('PR42', 'OR'), dialPattern: 'tapisserie', hands: 'or', strap: 'metal', engraving: 'A. M. 2026' };
  assert.equal(price(c).total, 59750);
});
test('Abysse céramique, lunette or, tapisserie, cuir = 26 650', () => {
  const c = { ...defaultConfig('AB41', 'CN'), bezel: 'OJ', dialPattern: 'tapisserie', hands: 'lume', strap: 'cuir', strapColor: 'cognac' };
  assert.equal(price(c).total, 26650);
});
test('lunette céramique sur acier +1 200, acier sur or 0', () => {
  const base = { ...defaultConfig('AB41', 'AC'), dialPattern: 'soleil', strap: 'caoutchouc', hands: 'lume' };
  assert.equal(price({ ...base, bezel: 'CN' }).total, 14500 + 1200);
  const gold = { ...defaultConfig('AB41', 'OJ'), dialPattern: 'soleil', strap: 'caoutchouc', hands: 'lume' };
  assert.equal(price({ ...gold, bezel: 'AC' }).total, 39800);
});
test('aller-retour encode/decode, gravure accentuée comprise', () => {
  const c = { ...defaultConfig('PR42', 'AC'), engraving: 'Élodie ♥ 12.09' };
  assert.deepEqual(decode(encode(c)), c);
});
test('code invalide → null ; valeurs inconnues normalisées', () => {
  assert.equal(decode('n-importe-quoi'), null);
  assert.equal(normalize({ family: 'PR42', case: 'XX' }).case, 'AC');
});
test('gravure tronquée à 24 caractères', () => {
  assert.equal(normalize({ family: 'MO39', engraving: 'x'.repeat(40) }).engraving.length, 24);
});
```
- [x] `node --test tests/` → échec attendu (modules absents).
- [x] Implémenter `catalogue.js` (tables de la spec §3) et `config.js`. Règles lunette :
      `bezel === case → 0 ; bezel === 'CN' → 1200 ; bezel or et boîtier non or → 6800 ; sinon 0`.
      Bracelet métal : AC/CN +2400, OJ/OR +5400 ; cuir +350 ; gravure non vide +250 ;
      tapisserie +600, lignes +400 ; aiguilles or +900.
- [x] `node --test tests/` → tout passe.

### Tâche 3 : matières et textures procédurales

**Fichiers :** créer `js/watch/textures.js`, `js/watch/materials.js` ; modifier `js/studio.js` (planche de matières).

**Produit :**
```js
// textures.js : chaque fonction renvoie une THREE.CanvasTexture mise en cache par clé
export function brushedLinear(size = 1024)        // carte de rugosité, stries parallèles
export function sunburstAniso(size = 1024)        // anisotropyMap : RG = direction radiale, B = force
export function tapisserieNormal(size = 1024, cells = 36)  // pyramides en grille
export function lignesNormal(size = 1024, lines = 90)      // cannelures verticales
export function azurageNormal(size = 512)          // sillons concentriques (compteurs)
export function perlageNormal(size = 1024)         // grains circulaires (platine)
export function cotesNormal(size = 1024)           // côtes de Genève (ponts)
export function leatherNormal(size = 1024) / rubberRibsNormal(size = 1024)
export function textDecal(lines, { width, height, font, color, align }) // marquages cadran
export function ringScale({ labels, ticks, inner, outer, color, bg })   // réhaut, lunette 24 h
// materials.js
export function getMaterial(key, opts) // clés : metal:AC|OJ|OR (poli/brossé), ceramic:CN,
  // sapphire (transmission 1, ior 1.77) ou sapphireLite (transparent, sans transmission),
  // lume (émissive vert pâle), rubber:<coloris>, leather:<coloris>, dial:<couleur>:<motif>,
  // movement:rhodium|gilt|blued|ruby
```
Valeurs de départ (linéaires) : acier `#c9ccd0` métal 1 rugosité 0.12 (poli) / 0.3 +
anisotropie 0.7 (brossé) ; or jaune `#f2c46d` ; or rose `#eab19a` ; céramique `#0b0b0c` métal 0
rugosité 0.2 clearcoat 1 ; cadran fumé = dégradé radial brun `#5a4636` → noir en bord.

- [x] Planche studio : 8 sphères + 3 disques de cadran (un par motif) alignés. Capture 1440.
      Attendu : l'or jaune et l'or rose se distinguent nettement ; le soleillé montre une croix de
      lumière qui tourne avec la caméra ; tapisserie et lignes lisibles en lumière rasante.
- [x] Charger `references/material-lighting-realism.md` du skill img2obj et corriger les valeurs
      qui trahissent un rendu « plastique ».

### Tâche 4 : tête du Prisme 42 (ébauche puis formes)

**Fichiers :** créer `js/watch/case.js`.

**Produit :**
```js
export function buildCase(family, q) // → { group, parts: { case, bezel, 'bezel-screw-0..5', crystal,
  // crown, 'pusher-2', 'pusher-4', caseback, 'caseback-crystal' }, anchors: { case, bezel, caseback } }
```
Cotes PR42 : carrure `Shape` cercle r 20.5 + pattes intégrées (trapèzes 26 → 24 mm vers ±Y,
longueur 5), extrusion 6.2 mm, biseau 0.6 (3 segments) ; lunette hexagone plat-à-plat 37 mm,
coins arrondis r 2, trou r 15.6, extrusion 1.8, biseau 1.1 en 1 segment (facettes vives) ;
6 vis r 0.85 sur les coins, fente sombre ; glace r 15.8 ép. 1.2 bombée (Lathe) ; couronne r 3.1
L 3.6 moletée (48 cannelures) avec épaulements ; poussoirs à 2 h et 4 h ; fond vissé avec
fenêtre saphir r 12. Épaisseur totale visée 11.8 mm.

- [x] Ébauche : volumes simples aux bonnes cotes, rendu 2×2 (trois-quarts | profil / dos | face).
      Attendu : silhouette sport-luxe, hexagone lisible, proportions épaisseur/diamètre correctes.
- [x] Formes : biseaux, facettes, moletage, épaulements. Rendu 2×2 et comparaison avec la
      capture `60fps-13-end.png` (niveau de détail, pas le dessin).

### Tâche 5 : cadran et aiguilles

**Fichiers :** créer `js/watch/dial.js`, `js/watch/hands.js`.

**Produit :**
```js
export function buildDial(config, q) // → { group, parts: { dial, flange, indices, 'index-lume',
  // 'subdial-3|6|9' (PR42), 'date-window', logo }, anchors: { dial } }
export function buildHands(config, q) // → { group, parts: { 'hand-hour', 'hand-minute',
  // 'hand-seconds', 'hand-gmt' (AB41), 'subhand-3|6|9' (PR42) }, setTime(h, m, s), anchors: { hands } }
```
- Cadran r 15.2 ép. 0.4, matière `dial:<couleur>:<motif>` ; réhaut conique avec échelle des
  minutes (`ringScale`) ; index appliqués `InstancedMesh` (bâtons 1 × 3.6 × 0.5, double à 12 h)
  avec insert lume ; PR42 : 3 compteurs azurés en creux (9 h petite seconde, 3 h 30 min,
  6 h 12 h) + guichet date à 4 h 30 ; marquages « MORION » (logo), nom de famille,
  « AUTOMATIQUE », « GENÈVE » par `textDecal`.
- Aiguilles : `Shape` extrudées 0.3 mm à facette centrale (biseau), insert lume ; heure 10 h 10,
  seconde de chrono à 12 h ; AB41 aiguille GMT flèche rouge-orangé.
- [x] Rendu face + trois-quarts. Attendu : marquages nets à 1440 (texture ≥ 2048 px), aiguilles
      qui projettent une ombre fine, aucun z-fighting.

### Tâche 6 : bracelets

**Fichiers :** créer `js/watch/strap.js`.

**Produit :**
```js
export function strapCurve(family) // → CatmullRomCurve3 dans le plan YZ : patte → poignet ovale
export function buildStrap(config, q) // → { group, parts: { 'strap-top', 'strap-bottom', clasp },
  // anchors: { strap } }
```
- Courbe : part de la patte (y ±24, z −2), prolonge la tangente, puis ovale de poignet
  (demi-axes Y 32, Z 26) ; chaque brin s'arrête à 35 % du tour (bracelet ouvert, lisible en vue
  de face).
- Métal : 2 `InstancedMesh` (maillon central poli, maillons latéraux brossés) posés par
  abscisse curviligne (`getPointAt`, `getTangentAt`), rotation autour de X.
- Caoutchouc et cuir : balayage d'un profil rectangle arrondi (24 → 20 mm, ép. 3.5 / 3.0) le
  long de la courbe (générateur `sweepProfile`), nervures ou grain en normal map, surpiqûres cuir
  en `InstancedMesh`. Boucle déployante simplifiée.
- [x] Rendu trois-quarts pour les 3 types. Attendu : raccord patte/bracelet sans jour ni
      interpénétration visible, maillons réguliers.

### Tâche 7 : mouvement

**Fichiers :** créer `js/watch/movement.js`.

**Produit :**
```js
export function buildMovement(family, q) // → { group, parts: { mainplate, 'bridge-barrel',
  // 'bridge-train', 'bridge-balance', 'gear-0..n', barrel, 'balance-wheel', hairspring, rotor,
  // 'rotor-weight', jewels, screws, 'column-wheel' (PR42) }, tick(dt) }
```
- Platine r 13 ép. 1.2 perlée (rhodium) ; ponts en `Shape` organiques ép. 1, côtes de Genève,
  anglage poli ; roues `Shape` dentées (dents trapézoïdales) ajourées de 4 à 5 bras, dorées ;
  balancier (serge + 3 bras) + spiral (`TubeGeometry` sur spirale, bleui) ; rotor demi-disque
  ajouré avec masse en or ; rubis en `InstancedMesh` ; vis bleuies ; roue à colonnes (PR42).
- `tick(dt)` : balancier oscille à 4 Hz (±270°), roues tournent, rotor au repos.
- [x] Rendu dos (à travers le fond saphir) + mouvement seul en trois-quarts. Attendu : lecture
      « haute horlogerie » : plans étagés, contraste rhodium/or/rubis/bleu.

### Tâche 8 : Monolithe 39 et Abysse 41

**Fichiers :** modifier `js/watch/case.js`, `js/watch/dial.js`, `js/watch/hands.js`.

- MO39 : carrure coussin (`Shape` carré arrondi 39 mm r 9) ép. 8.2, lunette fine polie en
  coussin, 4 cornes (bracelet non intégré), 3 aiguilles, cadran lignes, pas de compteurs.
- AB41 : carrure ronde r 20.5 avec protège-couronne, lunette tournante crantée (120 crans),
  insert céramique 24 h (`ringScale`), gros index lume ronds + triangle à 12 h, aiguille GMT,
  couronne vissée.
- [x] Rendu 2×2 de chaque famille. Attendu : trois silhouettes immédiatement distinctes.

### Tâche 9 : assemblage, configuration, éclaté, page studio

**Fichiers :** créer `js/watch/build.js`, `js/watch/explode.js` ; modifier `js/studio.js`, `studio.html`, `css/studio.css`.

**Produit :**
```js
// build.js
export function buildWatch(config, { quality = 'high' } = {})
// → THREE.Group ; group.userData = { config, parts: Map<string, Object3D>,
//    anchors: { case, bezel, dial, hands, strap, caseback }, // Object3D vides, positions monde à projeter
//    applyConfig(partial) /* change matières sans reconstruire si la famille ne change pas */,
//    setTime(h, m, s), setExplode(t /* 0..1 */), tick(dt), dispose() }
// explode.js
export function assignExplode(parts, family) // pose userData.explode = { dir, dist, delay }
export function setExplode(parts, t)          // interpolation décalée par pièce, easing expo
```
Ordre d'éclaté (axe Z, de l'avant vers l'arrière) : glace +42, vis +36 (légère ouverture
radiale), lunette +30, aiguilles +22 à +18 (échelonnées), réhaut +16, cadran et index +12,
platine 0, ponts −10 à −16, roues −20 à −26, balancier −24, rotor −34, fond −44 ; bracelet :
les deux brins s'écartent de ±18 en Y.

Page studio : sélecteurs famille, finition, lunette, couleur et motif du cadran, aiguilles,
bracelet et coloris, gravure ; curseur d'éclaté ; boutons de vue ; rotation auto ; heure réelle
ou 10 h 10 ; « Exporter PNG » (2048 px, fond transparent) ; prix courant via `price()` ; config
dans l'URL (`?c=`). `window.__studio = { watch, stage, config }` pour les contrôles.

- [x] Contrôles chrome-devtools (evaluate_script) : pour chaque famille, toutes les pièces
      attendues présentes dans `parts` ; largeur de boîte englobante du boîtier seul = diamètre ±0.6 ;
      `setExplode(1)` allonge la boîte en Z d'au moins 70 mm ; `applyConfig({case:'OR'})` ne
      recrée aucune géométrie (mêmes uuid) ; 0 erreur console ; > 50 images/s à 1440×900.
- [x] Changer chaque option une fois et capturer : la montre suit, le prix suit.

### Tâche 10 : passe de rendu, relecture indépendante, livraison au user

- [x] Captures finales à 1440 : pour chaque famille, planche 2×2 ; Prisme éclaté ; alignement des
      4 finitions du Prisme (vue façon finale 60fps) ; une capture 390 × 844 du studio.
- [x] Relecture indépendante : sous-agent (sonnet) qui reçoit uniquement les captures et
      `60fps-13-end.png`, `60fps-04*.png` (mouvement), et juge le réalisme (métaux, arêtes,
      proportions, lisibilité) avec au plus 7 corrections prioritaires. Appliquer en un lot,
      recapturer.
- [x] Performances : mesurer images/s desktop et en émulation mobile (CPU ×4) ; si < 45 mobile,
      qualité `low` (moins de segments, `sapphireLite`, DPR 1.5).
- [x] Livrer au user les captures + le lien `studio.html` et demander la décision : **3D validée**
      (jalon 2) ou **plan vidéo**. Ne pas enchaîner sans réponse.
