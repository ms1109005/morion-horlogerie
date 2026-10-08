# MORION, jalon 7 : visuels, finitions, QA, livraison. Plan d'implémentation

> **Pour l'exécutant :** superpowers:executing-plans, tâche par tâche. Pas de commit. Travail
> autonome : décisions dans `docs/decisions.md`.

**But :** le site est complet et se tient sans intervention. Tous les emplacements d'images sont
prêts à recevoir les visuels que l'utilisateur génère lui-même (bloc prêt à coller dans
`docs/IMAGES.md`, placeholder dessiné à chaque emplacement). Les rendus 3D dérivés sont à jour,
le portfolio référence MORION, `DESIGN.md` et `docs/RAPPORT-FINAL.md` sont écrits.

**Architecture :** rien de neuf. Ce jalon régénère les dérivés (rendus, vignettes, image de
partage, hub), passe la QA aux deux tailles et écrit la documentation de sortie.

**Spec :** §7 Visuels et §8 Livraison. **Direction :** D1.

## Carte des fichiers

| Fichier | Rôle |
|---|---|
| `_sources/rendus-3d/*.png` | 45 rendus détourés exportés par `studio.html?export=rendus` |
| `img/rendus/*.webp` | 12 vignettes dérivées (`outils/rendus.py`) |
| `img/partage.jpg` | image Open Graph, 1200 x 630 |
| `herosite/site/assets/work/morion-horlogerie.webp` | vignette du hub, 1280 x 800 |
| `docs/IMAGES.md` | emplacements vides : nom de fichier, ratio, prompt complet |
| `DESIGN.md` | système de design dérivé de l'artefact livré |
| `docs/RAPPORT-FINAL.md` | ce qui est fait, décidé, contourné, mesuré, et ce qui reste |

## Tâches

- [x] T1 dérivés 3D : réexporter les 45 rendus après le correctif du bracelet (D20), régénérer
      les 12 vignettes WebP (`outils/rendus.py`), l'image de partage et la vignette du hub.
- [x] T2 portfolio : ligne d'identité dans `portfolio/PRODUCT.md`, entrée MORION dans
      `herosite/site-src/build.py`, `python site-src/build.py`, vérifier la page
      `site/realisations/index.html`.
- [x] T3 reliquats : reprendre les captures 09 et 10 du jalon 3 (sol fumé), notées en attente.
- [x] T4 QA : toutes les routes à 1440 et 390 (accueil, collection, les trois familles, filtre,
      commande, page introuvable, retour), console vide, aucun débordement horizontal.
- [x] T5 emplacements d'images : les 16 identifiants de `js/data/visuels.js` ont leur bloc dans
      `docs/IMAGES.md` (nom exact, emplacement, ratio, prompt anglais complet) ; aucun fichier
      n'est encore déposé (`visuels-presents.js` ne contient que `partage`), donc chaque
      emplacement affiche son placeholder dessiné.
- [x] T6 `DESIGN.md` écrit par `impeccable-documenter` sur le site livré (8 sections, 10
      composants autonomes, 16 règles nommées) plus son sidecar `.impeccable/design.json`.
      Non canonisé volontairement : le jeton `--z-page` déclaré dans `css/tokens.css` mais
      utilisé nulle part, la règle réelle étant l'inverse (`#page` sans z-index, ce qui fonde
      D15, D22 et D23).
- [x] T7 `docs/RAPPORT-FINAL.md` écrit : état du site, les sept jalons, les 6 décisions
      structurantes sur 25, les blocages contournés, les limites connues, le tableau des mesures,
      les 8 étapes à suivre par l'utilisateur, les repères utiles.
- [x] T8 clôture : 59 tests verts, `refresh_projects.py` relancé (1253 nœuds, 2050 arêtes,
      137 articles de wiki), mémoire du projet à jour.
