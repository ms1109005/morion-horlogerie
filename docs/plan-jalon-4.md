# MORION, jalon 4 : collection, salles puis grille. Plan d'implémentation

> **Cases cochées après coup** (jalon 7) : elles n'ont pas été tenues à jour pendant
> l'exécution. Elles ont été cochées sur vérification des livrables sur disque (fichiers,
> fonctions, rendus, captures, tests). L'état de référence reste `docs/PROGRESSION.md`
> et `docs/decisions.md`.

> **Pour l'exécutant :** superpowers:executing-plans, tâche par tâche. Pas de commit. Travail
> autonome : décisions dans `docs/decisions.md`.

**But :** `/collection` devient une visite par salles (Cartier) : un hall en quartz fumé puis une
salle par famille dont le décor reprend la silhouette de la montre ; la caméra voyage d'une salle
à l'autre ; poussière, vignettage, surimpression éditoriale claire (« Découvrir »).
`/collection?vue=grille` : les 12 références filtrables et triables, rendus 3D du générateur, et
la montre en 3D temps réel au survol.

**Architecture :** la page prend la caméra (restituée au démontage) et ajoute au graphe de scène
un « monde » (`stage/salles.js`) : décor, trois montres sur socles, poussière. La montre du
directeur se retire (pose `collection` avec `k: 0`). Le rendu est continu tant qu'une salle vit,
puis se fige après 8 s sans interaction (rendu à la demande au repos). La grille est du DOM ; au
survol, une montre de la référence est rendue en temps réel dans la zone de la carte (découpe du
canvas, une seule montre à la fois). Filtres et tri : logique pure testée.

**Spec :** §5 Collection. **Direction :** D1. **Mouvement :** voyage caméra en segments
(relevé Cartier), `DUR.voyage` à `long`, `EASE.traverse`.

## Carte des fichiers

| Fichier | Rôle |
|---|---|
| `js/data/filtres.js` + `tests/filtres.test.js` | `filtrer(refs, filtres)`, `trier(refs, tri)`, tranches de prix |
| `js/stage/salles.js` | monde des salles : décor par famille, socles, montres, poussière, chemin caméra |
| `js/pages/collection.js` | routeur interne salles / grille, surimpression « Découvrir », navigation |
| `js/ui/grille.js` | cartes, filtres, tri, état vide, 3D au survol |
| `css/pages/collection.css` | salles (surimpressions, points, vignettage) et grille |

## Salles

| Arrêt | Décor | Lumière / brouillard |
|---|---|---|
| Hall | sol laqué, cristaux de quartz hexagonaux effilés | fumé chaud |
| Prisme | arches hexagonales emboîtées : on marche dans le cristal | acier froid |
| Monolithe | monolithes aux angles adoucis, alignés | or tiède |
| Abysse | anneaux crantés, lumière d'eau (caustiques en shader) | bleu profond |

Navigation : molette (un geste = une salle), flèches du clavier, points, boutons précédent et
suivant, balayage tactile ; URL `?salle=` en `replaceState`. Voyage : courbe Catmull-Rom par
points de passage, `DUR.voyage × 1,3`, `EASE.traverse`. Mouvement réduit : coupe franche en
fondu, ni dérive ni rotation.

## Tâches

- [x] T1 filtres et tri (TDD) : famille, matière, diamètre, tranche de prix ; tri prix
      croissant, décroissant, famille ; compte ; état vide.
- [x] T2 monde des salles (`salles.js`) : décor, socles, 3 montres (construites une par image
      après le rideau), poussière (Points, dérive du groupe), brouillard par salle, chemin caméra,
      caméra restituée au démontage.
- [x] T3 page salles : surimpressions (nom, type, « à partir de », Découvrir, Voir les 12),
      navigation, surimpression éditoriale claire (rendu, texte, 4 finitions, Composer),
      rendu figé après 8 s d'inactivité.
- [x] T4 grille : cartes (rendu WebP du générateur), filtres, tri, compte, état vide, transitions
      (View Transitions si disponibles), 3D au survol (une montre, découpe du canvas).
- [x] T5 vérification : tests, console, captures 1440 et 390 (`docs/validation/jalon-4/`),
      images/s pendant un voyage et au survol, mouvement réduit, revue, corrections.
