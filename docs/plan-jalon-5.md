# MORION, jalon 5 : accueil. Plan d'implémentation

> **Pour l'exécutant :** superpowers:executing-plans, tâche par tâche. Pas de commit. Travail
> autonome : décisions dans `docs/decisions.md`.

**But :** `/` devient le film de la maison, en sept temps : hero (le Prisme devant « MORION »
géant, puis derrière), assemblage épinglé (éclaté complet, étiquettes qui suivent les pièces,
compteur, remontage, fiche d'une pièce au clic), quatre chapitres couleur (aplats qui basculent
net, texte mot à mot, la montre change de matière de profil), seuil des salles (couloir
hexagonal), atelier express (mini configurateur 3 zones + photos d'atelier), finale (4 Prisme
alignés devant « PRISME », survol = pivot et avancée, bouton rond « Choisir »), pied de page.

**Architecture :** une seule montre, celle du directeur, porte le hero, l'assemblage, les
chapitres, le seuil et l'atelier ; sa pose est écrite par des segments de défilement
(ScrollTrigger, `scrub`) qui ne se chevauchent pas : à chaque position de défilement un seul
segment écrit l'état, donc un saut de défilement (touche Fin, lien d'ancre) retombe juste. La
finale ajoute quatre Prisme construits une par image au repos (`stage/vitrine.js`), rendus
seulement quand la finale est à l'écran ; la montre du directeur s'y retire (`k: 0`).
Typographie devant la montre, étiquettes et fiche des pièces : calque `#avant` (au-dessus du
canvas). Aplats, couloir, texte : `#page` (sous le canvas).

**Spec :** §5 Accueil. **Direction :** D1 (Cadran fumé). **Mouvement :** grammaire du jalon 2 ;
bascules nettes des chapitres (« menu collage » de `decisions.md`) ; couloir en CSS 3D
(transform seul, composité).

## Carte des fichiers

| Fichier | Rôle |
|---|---|
| `js/data/pieces.js` + `tests/pieces.test.js` | pièces étiquetées (id, nom, fiche), chapitres (finition, aplat, texte), `etapeAssemblage(p)` pure |
| `js/stage/vitrine.js` | 4 Prisme de la finale : construction différée, placement écran, survol |
| `js/pages/home.js` | rendu des 7 sections, segments de défilement, calque avant |
| `js/ui/pieces.js` | étiquettes projetées depuis la 3D, compteur, fiche d'une pièce |
| `css/pages/accueil.css` | toutes les sections de l'accueil, 1440 et 390 |
| `css/shell.css` | encre de la nav et du réhaut sur aplat clair (`html[data-chap]`) |

## Chorégraphie (desktop ; écran étroit entre parenthèses)

| Segment | Défilement | Montre | Page |
|---|---|---|---|
| Hero | hero haut → bas | pose accueil → pivote (rotY −0,42 → −1,2), glisse derrière le mot, puis pose d'assemblage | « MORION » plein, en `#avant`, entre par une facette à 60° |
| Assemblage | épinglé +250 % | profil (rotX 0,2, rotY −1,35) ; (écran étroit : face au ciel, rotX 1,2, éclaté vertical) ; éclaté 0 → 1 (p 0,08 → 0,5), tenue, 1 → 0 (p 0,62 → 0,92) | étiquettes, compteur « Pièce 14 sur 59 », fiche au clic |
| Entrée chapitres | haut du bloc : bas → haut | pose assemblage → pose chapitre (x 0,3 ; écran étroit y 0,34) | |
| Chapitres | épinglé +300 % | dérive lente rotY ; à chaque bascule un tour complet, la matière change au passage du profil | 4 aplats `--c-chap-*`, volet à 60°, mots en facette, visuel matière |
| Seuil | épinglé +150 % | recule vers le point de fuite (taille → 0,03, k → 0) | 9 hexagones en CSS 3D traversés, appel « Entrer dans les salles » |
| Atelier | entrée du bloc | revient à gauche (x −0,3 ; écran étroit en haut) | 3 zones (matière, cadran, bracelet), « Ouvrir l'atelier », photos |
| Finale | entrée du bloc | k → 0 | 4 Prisme de `vitrine.js`, « PRISME » géant derrière, « Choisir » |

Mouvement réduit : ni épinglage ni scrub. Montre à la pose accueil, sections empilées, aplats
statiques, pièces listées en texte, couloir figé, finale statique (sans pivot).

## Tâches

- [x] T1 données (TDD) : `pieces.js` (9 pièces étiquetées dont l'id existe dans le Prisme,
      4 chapitres), `etapeAssemblage(p)` → `{ eclate, rot, etiquettes }` ; tests.
- [x] T2 hero : mot avant en `#avant` synchronisé au défilement, volet à 60°, segment hero.
- [x] T3 assemblage : section épinglée, pose, étiquettes projetées (`ui/pieces.js`), compteur,
      fiche d'une pièce (clic, Échap, focus rendu).
- [x] T4 chapitres : aplats, volet, mots, changement de matière au profil, encre de la nav et du
      réhaut sur aplat clair, visuels matière.
- [x] T5 seuil : couloir CSS 3D, recul de la montre, appel vers `/collection`.
- [x] T6 atelier express : 3 zones branchées sur `director.setConfig`, lien vers la fiche avec
      `?c=encode(config)`, photos d'atelier (`visuel()`), vidéo derrière le titre si présente.
- [x] T7 finale : `vitrine.js` (4 Prisme construits au repos, précompilés), placement, survol et
      focus clavier, bouton rond « Choisir », mobile en 2 × 2.
- [x] T8 vérification (2 tours de revue : « recapture » puis « fix », 8 correctifs appliqués) :
      59 tests verts, console vide, 56 i/s p95 18 ms sur toute la descente, 0 rendu au repos,
      mouvement réduit testé, captures 01 à 22 reprises sur la version corrigée
      (`docs/validation/jalon-5/`). Correctifs : maillons du bracelet remodelés à leur vraie
      largeur (D20), ombre radiale sous la montre sur fond sombre (D21), finale recomposée et
      bande morte ramenée de 242 à 102 px (D22), titre de la finale sous le voile de nav à 390,
      pastilles de l'atelier fondues au bord, chapitre or rose recadré (pose étroite 0,24 /
      0,34), compteur logé dans la fiche à 390 (D23), encre de la nav remontée sur le couloir,
      tenue de l'atelier et rattrapage de bord (D24).
