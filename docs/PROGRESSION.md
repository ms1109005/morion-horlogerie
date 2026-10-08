# MORION : progression (travail autonome, jalons 2 à 7)

Consigne du user (2026-09-19, nuit) : enchaîner les jalons 2 à 7 sans s'arrêter ni poser de
question. Décisions prises à sa place dans `docs/decisions.md`. Si le contexte est compacté :
relire ce fichier, puis le plan du jalon en cours, et reprendre au « Prochain pas ».

Règles à chaque fin de jalon : `node --test tests/*.test.js` vert, console sans erreur, captures
390 et 1440 dans `docs/validation/jalon-N/`, images/s mesurées (bringToFront), mouvement réduit
testé, revue `impeccable-finish-reviewer`, corrections. Pas de commit, pas de génération
payante, pas de dépendance ni de build. Serveur : `python serve.py` (port 8781).

## État

| Jalon | Plan | État |
|---|---|---|
| 1. Socle + montre 3D | `plan-jalon-1.md` | fait, validé par le user |
| 2. Direction + coquille | `plan-jalon-2.md` | fait |
| 3. Fiche produit + configurateur + panier | `plan-jalon-3.md` | fait |
| 4. Collection : grille puis salles | `plan-jalon-4.md` | fait |
| 5. Accueil : hero, assemblage, chapitres, finale | `plan-jalon-5.md` | fait |
| 6. Commande + confirmation | `plan-jalon-6.md` | fait |
| 7. Visuels (emplacements), finitions, QA, hub, PRODUCT.md, DESIGN.md, rapport final | `plan-jalon-7.md` | fait |

## Jalon 2

- [x] T1 relevé des références (`references-mouvement.md`)
- [x] T2 rendus détourés (45 PNG dans `_sources/rendus-3d/`), IMAGES.md (16 visuels + partage),
      `outils/visuels.py` + `js/data/visuels-presents.js` (serve.py le relance), spec §7
- [x] T3 direction artistique : B « Cadran fumé » (decisions.md D1, contrat dans
      `.impeccable/surfaces/index-html.md`, planches dans `_sources/directions/`)
- [x] T4 jetons (`css/tokens.css`) + `js/core/motion.js`, test de parité vert
- [x] T5 logique pure (routes, chargement, panier)
- [x] T6 coquille HTML, scène persistante (rendu à la demande, 0 rendu au repos), défilement
- [x] T7 routeur, transitions (57 i/s), pages d'attente
- [x] T8 intro (2,6 s, bornée par le vrai chargement ; `?figer-intro=s` pour les captures)
- [x] T9 nav, menu, tiroir, visuels (`js/data/visuels.js`, `js/ui/visuel.js`)
- [x] T10 micro-détails
- [x] T11 revue impeccable : 2 tours (8 correctifs, 5 résolus au 1er verdict, 3 derniers
      repris : bracelet, MORION vertical à 390, gouttière de l'intro). DESIGN.md reporté au
      jalon 7 (decisions.md D6)
- [x] T12 vérification : 39 tests verts, console vide, CLS 0, transition 57 i/s (p95 18 ms),
      0 rendu au repos, intro 2,6 s, mouvement réduit (paramètre + vraie requête média)

Jalon 2 **terminé**. Captures : `docs/validation/jalon-2/01` à `07`.

## Jalon 3 (plan : `plan-jalon-3.md`)

- [x] T1 panier complet (ajout, fusion, quantité, suppression + annulation, total), tests verts
- [x] T2 crochet après rendu (`stage.afterRender`), instantané (`stage/snapshot.js`), 12 rendus
      WebP dans `img/rendus/`
- [x] T3 gravure sur la glace du fond (`watch/gravure.js`, enfant de la glace)
- [x] T4 configurateur (`ui/configurateur.js`)
- [x] T5 prix animé (`ui/prix.js`), ajout avec vol vers le guichet, partage
- [x] T6 sous le pli (éclaté épinglé 60 i/s, galerie, matière, fiche technique, service, autres)
- [x] T7 tiroir avec lignes (`ui/panier-lignes.js`)
- [x] T8 revue : 2 tours faits (budget atteint), restes corrigés sans 3e tour (panneau du prix
      masque la pastille Gravure ; ancres multiples boîtier/bracelet ; éclaté mobile 0,075).
      Captures 09 et 10 à refaire au jalon 7 (sol fumé). Ancien détail : verdict « fix », 8 correctifs APPLIQUÉS (détail du prix en panneau au-dessus
      de l'achat ; mobile : Partager + détail visibles ; sol fumé `--sol-fume` sous le pli ;
      filets masqués si la pièce est derrière ; montre remontée (pose montre y 0,14 taille 0,34) ;
      éclaté recadré ; placeholder soleillé « Photographie à venir » ; index bleu au lieu de
      bordure). RESTE : recapturer 01, 03, 05, 08, 11, 12, 13 et envoyer la passe de verdict au
      relecteur (agent de revue du jalon 3, SendMessage), puis clore le jalon 3.

## Jalon 4 (plan : `plan-jalon-4.md`)

- [x] T1 filtres et tri (`js/data/filtres.js`, 6 tests verts)
- [x] T2 monde des salles (`js/stage/salles.js`) : testé, voyage 58 i/s p95 17 ms, figé après
      8 s (0 rendu), ciel = couleur du brouillard, grappe de cristaux recalée
- [x] T3 page salles (`js/pages/collection.js`) : testée (hall, Prisme, Monolithe), captures
      `docs/validation/jalon-4/01` à `03`. Reste : voir Abysse, l'édito « Découvrir », mobile
- [x] T4 grille testée : filtres + URL, réinitialisation, survol 3D (montre du directeur posée
      sur la carte, oscille face). Captures 04 (Abysse), 05 (Découvrir), 06 (grille survol).
      Note jalon 7 : réexporter `img/rendus/*.webp` (bracelets encore blancs, rendus d'avant le
      correctif D7) via `studio.html?export=rendus` puis la conversion Pillow du jalon 3 T2.
- [x] Captures 390 : 07 (Prisme, caméra reculée sur mobile), 08 (grille).
- [x] T5 revue : 2 tours (« recapture » puis « fix », 7 correctifs appliqués : lunettes Abysse
      en céramique laquée 120/90/60 crans bornées, lumière d'eau limitée à l'Abysse, surtitre
      retiré (ligne de spécification sous le prix), voile du rail, salle qui s'efface sous la
      surimpression, un seul « Réinitialiser », monolithes taillés en pierre polie). Précompilation
      shaders + textures (D9). 46 tests verts, console vide, voyage 56 i/s p95 19 ms sans
      accroc, mouvement réduit : coupe franche, 0 rendu au repos. Captures 01 à 14.

Jalon 4 **terminé**.

## Jalon 5 (plan : `plan-jalon-5.md`)

- [x] T1 données (`js/data/pieces.js` : 9 pièces, 4 chapitres, `etapeAssemblage`, `chapitreDe`),
      4 tests verts
- [x] T2 hero épinglé +90 % : mot plein en `#avant` découvert par une facette à 60°, la montre
      pivote derrière (D13)
- [x] T3 assemblage épinglé +250 % : éclaté 0 → 1 → 0, étiquettes projetées (`ui/pieces.js`),
      compteur « Pièce 59 sur 59 », fiche au clic (Échap, focus rendu) ; éclaté vertical à 390
- [x] T4 chapitres épinglés +300 % : 4 aplats, volet à 60°, mots en facette, montre qui fait un
      tour et change de matière au profil (vitrine, D12), encre sombre de nav/guichet/réhaut sur
      l'or, voile de nav retiré pendant les blocs épinglés (`html.epingle`)
- [x] T5 seuil : couloir d'arches hexagonales en 3D (`stage/couloir.js`, précompilé), la montre
      part au point de fuite, texte au-dessus du canvas
- [x] T6 atelier express : 3 zones → `director.setConfig`, prix, lien `?c=encode(config)`,
      montre accrochée à son bloc ; photos d'atelier (placeholders) ; mobile tenu en un écran
- [x] T7 finale : `stage/vitrine.js` (4 Prisme construits au repos, précompilés), survol/focus =
      pivot + avancée + « Choisir » rond, 2 × 2 à 390
- [x] T8 vérification : 2 tours de revue (« recapture » puis « fix »), 8 correctifs appliqués
      (D20 à D24 + 3 correctifs de cadrage). 59 tests verts, console vide, 56 i/s p95 18 ms sur
      toute la descente, 0 rendu au repos, mouvement réduit testé, captures 01 à 22 reprises sur
      la version corrigée. Rendus 3D (45 PNG) et vignettes (12 WebP) réexportés après le
      correctif du bracelet.

Jalon 5 **terminé**.

Captures : `docs/validation/jalon-3/01` à `09`. Correctifs notables : `#page` sans z-index
(les commandes `.au-dessus` passent au-dessus du canvas), `.fond` en z -1, body transparent ;
CSS et `main.js` écrits par script après `<base>` (le préchargeur les demandait à la mauvaise
adresse sur les routes profondes).

## Jalon 6 (plan : `plan-jalon-6.md`)

- [x] T1 logique pure (`js/store/commande.js` : Luhn, expiration, cryptogramme, validation des
      3 étapes, numéro `MOR-XXXXXX` sans 0/O/1/I, création de commande sans données de carte),
      9 tests verts
- [x] T2 tunnel (`js/pages/checkout.js`) : 3 étapes repliables avec résumé et « Modifier »,
      récapitulatif fixe avec vignettes, erreurs en ligne (aria-invalid, focus au premier champ
      fautif, alerte comptée), formatage carte et MM/AA, retrait au salon avec visuel, virement
- [x] T3 paiement simulé 1,5 s (réhaut qui tourne, bouton occupé), commande en sessionStorage,
      panier vidé, redirection vers `/commande/merci`
- [x] T4 écrin 3D (`js/stage/ecrin.js`) et page de confirmation (numéro, récapitulatif, livraison,
      paiement) ; mouvement réduit : écrin déjà ouvert
- [x] T5 vérification : 2 tours de revue (« recapture » puis « fix »), 8 correctifs appliqués
      (laque et velours de l'écrin, cadrage, état coché non chromatique, bandeau réservé et
      opaque + décalage mesuré, bloc de notes, accords au pluriel, apostrophes typographiques).
      59 tests verts, console vide, écrin 60 i/s p95 17 ms, 0 rendu au repos, mouvement réduit
      testé, captures 01 à 13 reprises après le correctif du bracelet (D20). La passe de verdict
      finale n'est pas revenue (limite de session de l'API, D25) : jalon clos après les 2 tours.

Jalon 6 **terminé**.

## Jalon 7 (plan : `plan-jalon-7.md`)

- [x] T1 dérivés 3D réexportés après le correctif du bracelet (45 PNG, 12 WebP, `img/partage.jpg`,
      vignette du hub 1280 x 800)
- [x] T2 portfolio : `PRODUCT.md`, entrée dans `herosite/site-src/build.py`, `build.py` relancé
      (18 pages), MORION présent dans `site/realisations/index.html`
- [x] T3 captures 09 et 10 du jalon 3 reprises
- [x] T4 QA : 7 routes à 1440 et 7 à 390, console vide, aucun débordement horizontal
- [x] T5 les 16 emplacements d'images ont leur bloc dans `IMAGES.md`, placeholder partout
- [x] T6 `DESIGN.md` + `.impeccable/design.json` (8 sections, 10 composants, 16 règles)
- [x] T7 `docs/RAPPORT-FINAL.md`
- [x] T8 clôture : 59 tests verts, graphe des projets relancé (1253 nœuds), mémoire à jour

- [x] Cases des plans 1 à 4 cochées après vérification des livrables sur disque (une note le dit
      en tête de chaque plan) : les sept plans n'ont plus aucune case ouverte.

Jalon 7 **terminé**. Le site est complet.

## Prochain pas

Rien côté site : les sept jalons sont clos et les 16 visuels sont déposés et vérifiés (20
septembre). Il reste le commit, qui n'a pas été fait. Tout le récapitulatif est dans `docs/RAPPORT-FINAL.md`. Pièges : éditer avec Edit (pas python sur un fichier lu, le harnais renvoie
tout le fichier) ; GSAP lit une translation CSS en px (poser les états initiaux par gsap.set) ;
`index.html` modifié → `cp index.html 404.html` (test) ; captures de l'intro :
`?figer-intro=<s>` dans un contexte isolé avec `sessionStorage.clear()` en initScript.
