# MORION, jalon 3 : fiche produit, configurateur 3D, panier. Plan d'implémentation

> **Cases cochées après coup** (jalon 7) : elles n'ont pas été tenues à jour pendant
> l'exécution. Elles ont été cochées sur vérification des livrables sur disque (fichiers,
> fonctions, rendus, captures, tests). L'état de référence reste `docs/PROGRESSION.md`
> et `docs/decisions.md`.

> **Pour l'exécutant :** superpowers:executing-plans, tâche par tâche, cases `- [x]`. Pas de
> commit. Travail autonome (le user dort) : décisions notées dans `docs/decisions.md`.

**But :** la fiche `/montre/<ref>` devient le hero configurateur (Penarosa en 3D) : pastilles
reliées par des filets aux pièces de la vraie montre, options par zone, prix décomposé animé,
gravure sur la glace du fond, ajout au panier avec vol vers le guichet, partage ; sous le pli :
éclaté court, galerie « Au poignet », fiche technique, livraison, autres familles. Le tiroir
panier affiche les lignes (vignette, options, quantité, suppression avec annulation).

**Architecture :** la page reprend la montre persistante du directeur (pas de seconde scène).
Un module `ui/configurateur.js` projette les ancres 3D à chaque image rendue (crochet
`afterRender` du renderer) et dessine les filets en SVG. Les options passent par
`director.setConfig` ; l'URL suit la config (`replaceState`). Le panier (`store/cart.js`) gagne
ajout, quantité, suppression et annulation, testés sous Node ; les vignettes sont des instantanés
du canvas pris dans la même tâche que le rendu (aucun flash).

**Technos :** celles du jalon 2. **Spec :** `docs/spec.md` §3 (options et prix), §5 (fiche,
panier). **Direction :** `docs/decisions.md` D1, échelle de mouvement du plan du jalon 2.

## Contraintes globales

Celles du jalon 2, plus : l'indicateur de sélection change instantanément, seul le résultat
s'anime (la montre, le prix) ; chaque option se choisit au clavier (groupes radio) ; la gravure
est échappée partout (`esc`) et limitée à 24 caractères ; aucun visuel absent n'est demandé.

## Carte des fichiers

| Fichier | Rôle |
|---|---|
| `js/store/cart.js` | + `add(config, { image })`, `setQty(id, q)`, `remove(id)` → `undo()`, `lines()` avec prix |
| `tests/cart.test.js` | + tests d'ajout, fusion, quantité, suppression, annulation, total |
| `js/stage/renderer.js` | + `afterRender(fn)` : crochets appelés après chaque rendu |
| `js/stage/snapshot.js` | `snapshot(stage, director, { size })` → dataURL WebP de la montre posée de face |
| `js/watch/gravure.js` + `js/watch/build.js` | gravure du texte sur la glace saphir du fond (enfant de la glace, suit l'éclaté) |
| `js/data/fiches.js` | fiche technique par famille (boîtier, mouvement, cadran, bracelet, étanchéité) |
| `js/ui/configurateur.js` | pastilles, filets, plateau d'options, prix animé, gravure, rotation au glisser |
| `js/ui/prix.js` | total animé (échappement), écart d'option affiché avant bascule |
| `js/ui/panier-lignes.js` | rendu des lignes du tiroir + annulation |
| `js/pages/product.js`, `css/pages/montre.css` | la fiche complète |
| `img/rendus/*.webp` | 12 rendus 800 px dérivés de `_sources/rendus-3d/` (vignettes de secours, autres familles) |

## Poses par zone (la montre se tourne vers la pièce que l'on compose)

| Zone | Options | Pose (rotX, rotY, taille ×) |
|---|---|---|
| Boîtier | 4 matières (fixe la base) | 0,15, -0,45, 1 |
| Lunette | 4 matières | 0,42, -0,18, 1,08 |
| Cadran | 6 couleurs × 3 motifs | 0,04, -0,06, 1,18 |
| Aiguilles | acier, or, luminescentes | 0,02, 0, 1,22 |
| Bracelet | type × coloris | 0,32, -1,05, 0,92 |
| Gravure | texte 24 caractères | 0,12, π, 1,12 |

---

### Tâche 1 : panier complet (TDD)

- [x] Ajouter à `tests/cart.test.js` :

```js
import { price } from '../js/store/config.js';
const cfgA = defaultConfig('MO39', 'AC');
const cfgB = { ...defaultConfig('PR42', 'OR'), engraving: 'A. M. 2026' };

test('ajout, fusion d\'une configuration identique, total', () => {
  const c = createCart(memoire());
  const id = c.add(cfgA);
  assert.equal(c.add(cfgA), id);
  c.add(cfgB);
  assert.equal(c.count(), 3);
  assert.equal(c.total(), price(cfgA).total * 2 + price(cfgB).total);
  assert.equal(c.lines()[0].unit, price(cfgA).total);
});
test('quantité bornée 1 à 9', () => {
  const c = createCart(memoire());
  const id = c.add(cfgA);
  c.setQty(id, 12); assert.equal(c.count(), 9);
  c.setQty(id, 0); assert.equal(c.count(), 1);
});
test('suppression puis annulation à la même place', () => {
  const c = createCart(memoire());
  const a = c.add(cfgA); c.add(cfgB);
  const undo = c.remove(a);
  assert.equal(c.items().length, 1);
  undo();
  assert.equal(c.items()[0].id, a);
});
test('persistance et relecture', () => {
  const s = memoire();
  createCart(s).add(cfgB, { image: 'data:image/webp;base64,AAAA' });
  const l = createCart(s).lines()[0];
  assert.equal(l.config.engraving, 'A. M. 2026');
  assert.equal(l.image, 'data:image/webp;base64,AAAA');
});
```
- [x] Échec attendu, puis implémenter dans `cart.js` : `add(config, { image })` (fusionne sur
      `encode(config)`, qty ≤ 9), `setQty`, `remove` → `undo`, `lines()` →
      `{ id, code, qty, image, config, unit, sum }`, `total()`. Tests verts.

### Tâche 2 : crochet après rendu, instantané, rendus WebP

- [x] `renderer.js` : `afterRender(fn)` (Set, appelé après `render()` dans `tick`).
- [x] `stage/snapshot.js` : pose canonique (face légèrement de trois-quarts) appliquée au pivot,
      rendu, `drawImage` recadré sur la montre dans un canvas 2D 320 px, `toDataURL('image/webp',
      0.86)`, restauration de la pose et nouveau rendu dans la même tâche.
- [x] `img/rendus/mor-<fam>-<fin>.webp` : 12 fichiers 800 px (Pillow) depuis
      `_sources/rendus-3d/*-trois-quarts.png`.

### Tâche 3 : gravure sur la glace du fond

- [x] `js/watch/gravure.js` : `engravingMesh(text)` → plan 22 × 5 mm, texture canvas (texte en
      capitales, blanc givré sur transparent), matière d'impression ; `build.js` : enfant de la
      glace `caseback-crystal`, face extérieure, bas de la fenêtre ; recréé quand
      `config.engraving` change (sans reconstruire le reste).
- [x] Studio : `?c=` avec gravure → capture de dos, texte lisible, pas en miroir.

### Tâche 4 : configurateur

- [x] `configurateur.js` : 6 pastilles (desktop : 3 à gauche, 3 à droite ; étroit : onglets
      défilants) reliées par un filet SVG (trait fin, point à l'ancre) aux ancres `case`,
      `bezel`, `dial`, `hands`, `strap`, `caseback`, recalculées après chaque rendu.
- [x] Plateau d'options de la zone active : groupes radio (pastilles de couleur pour cadran et
      coloris, pilules pour les matières), libellé et écart de prix de chaque choix ; changement
      instantané de l'indicateur, `director.setConfig`, petit balancement de la montre (la lumière
      glisse sur la nouvelle matière, `DUR.moyen`).
- [x] Zone active → pose de la zone (tableau ci-dessus), voyage `DUR.long`.
- [x] Glisser sur la montre : rotation Y (et X limitée), inertie amortie ; `touch-action: pan-y`.
- [x] Gravure : champ (24 max, compteur), la montre se retourne, texte appliqué à la saisie
      (anti-rebond 120 ms).
- [x] URL : `replaceState` vers `montre/MOR-<fam>-<boîtier>?c=<code>` à chaque changement.

### Tâche 5 : résumé, prix, ajout, partage

- [x] Prix total animé (compteur échappement) + écart du dernier choix (« + 1 200 € ») ;
      décomposition dépliable (lignes de `price()`).
- [x] « Ajouter à l'écrin » : instantané, vignette qui vole de la montre au guichet (arc,
      `DUR.long`, `EASE.traverse`), puis le chiffre du guichet avance d'un cran ; annonce
      « Ajoutée à votre écrin ».
- [x] « Partager » : copie l'URL (`navigator.clipboard`, repli `execCommand`), message « Lien
      copié ».

### Tâche 6 : sous le pli

- [x] Éclaté court : section épinglée ; au défilement la montre passe en profil et s'éclate
      (0 → 0,85 → 0), compteur réel de pièces (`parts.size`), 3 étiquettes (glace, cadran,
      calibre MR-01).
- [x] Galerie « Au poignet » : `visuel('poignet-<fam>')`, `-2`, et la vidéo pour PR42.
- [x] Fiche technique : accordéons `<details>` par groupe (données `fiches.js`).
- [x] Matière de la finition : `visuel('matiere-<…>')` + texte.
- [x] Livraison et garantie (démonstration) ; autres familles (rendus WebP, prix de départ).

### Tâche 7 : tiroir avec lignes

- [x] `panier-lignes.js` : vignette, nom, options, gravure, prix, quantité (− / +), supprimer
      → message « Retirée de votre écrin. Annuler » 6 s ; sous-total ; « Livraison assurée
      offerte » ; « Passer commande » vers `commande`.

### Tâche 8 : vérification du jalon

- [x] Tests verts ; console sans erreur ; captures 1440 et 390 dans `docs/validation/jalon-3/`
      (fiche, chaque zone, gravure de dos, tiroir plein, éclaté) ; images/s pendant rotation,
      changement d'option et éclaté (onglet au premier plan) ; mouvement réduit ; revue
      `impeccable-finish-reviewer` et corrections ; `PROGRESSION.md`.
