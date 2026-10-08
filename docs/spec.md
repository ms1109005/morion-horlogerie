# MORION, maison horlogère : spec de conception

Date : 2026-09-19. Statut : validée par le user en conversation (périmètre, univers, approche 3D,
marque, catalogue). Le reste (parcours, effets, technique) suit mes recommandations, le user
ayant dit « tu peux commencer ».

## 1. Objectif

Premier site **e-commerce** du portfolio : prouver qu'on sait faire une boutique complète, au
niveau d'un site de l'année Awwwards. Démo : paiement simulé, aucune donnée réelle.

Références et ce qu'on en garde (choix du user) :

| Référence | À reprendre |
|---|---|
| thewatch.60fps.fr | Montre en vraie 3D qui se démonte et se remonte au scroll ; finale avec les 4 finitions en 3D |
| atom.uprock.pro | Animation d'entrée ; chapitres au scroll où le fond change de couleur avec des textes animés |
| penarosawatches.com | Hero configurateur : pastilles reliées par des filets aux zones de la montre, personnalisation poussée |
| cartier-waw-0225.dev.60fps.fr | Navigation par salles 3D, décor qui épouse la silhouette de la montre, poussière, vignettage, overlay éditorial |

Aucune de ces références n'a de vrai panier : le tunnel d'achat est notre valeur ajoutée.

**Plan de secours validé par le user** : si la montre 3D n'est pas assez belle au jalon 1, on
remplace la 3D par des vidéos Flow scrubbées (et des calques d'images pour le configurateur).

## 2. Marque

- **MORION**, maison fictive (pas d'homonyme horloger trouvé le 2026-09-19). Le morion est un
  quartz fumé presque noir à cristal hexagonal : céramique noire, facettes, reflets.
- Univers : **sport-luxe moderne** (acier, céramique, or, bracelets intégrés, chronographe).
- Textes en français, prix en euros TTC, pas de tiret cadratin. Aucun faux témoignage, fausse
  presse ou faux chiffre de vente.
- Palette et fontes : fixées au jalon 2 par la direction impeccable, distinctes des identités
  déjà prises (tableau de `portfolio/PRODUCT.md`).

## 3. Catalogue

3 familles × 4 finitions (acier, céramique noire, or jaune, or rose) = **12 références**.

| Famille | Réf. | Montre | Salle (collection) |
|---|---|---|---|
| **Prisme Chronographe 42** (vaisseau amiral) | PR42 | Boîtier rond 42 mm, lunette hexagonale facettée à 6 vis, bracelet intégré, 3 compteurs, date. Seule à avoir l'éclaté complet du mouvement | Arches hexagonales emboîtées : on marche dans le cristal |
| **Monolithe 39** | MO39 | Automatique 3 aiguilles ultra-plate, boîtier coussin, cadran à motif | Monolithes aux angles adoucis |
| **Abysse 41 GMT** | AB41 | Plongée, lunette tournante crantée 24 h, aiguille GMT, index luminescents | Salle sombre, anneaux crantés, lumière d'eau bleutée |

Référence produit : `MOR-<famille>-<finition>` (ex. `MOR-PR42-OR` pour or rose ; codes finition
`AC` acier, `CN` céramique noire, `OJ` or jaune, `OR` or rose).

**Prix de base** (tête de montre + bracelet caoutchouc), dans `js/data/catalogue.js` :

| | Acier | Céramique | Or jaune | Or rose |
|---|---|---|---|---|
| Monolithe 39 | 11 900 | 15 400 | 32 500 | 33 900 |
| Abysse 41 GMT | 14 500 | 18 900 | 39 800 | 41 200 |
| Prisme 42 | 19 800 | 25 600 | 51 000 | 52 600 |

**Options du configurateur** (6 zones), deltas de prix :

| Zone | Choix | Delta |
|---|---|---|
| Boîtier | 4 matières (fixe la base) | table ci-dessus |
| Lunette | 4 matières ; même matière que le boîtier = 0 | céramique +1 200, or sur acier/céramique +6 800 |
| Cadran | 6 couleurs × 3 motifs (soleillé, tapisserie, lignes) | tapisserie +600, lignes +400 |
| Aiguilles | acier, or, luminescentes | or +900 |
| Bracelet | caoutchouc (5 coloris), cuir (3 coloris), métal intégré (matière du boîtier) | cuir +350, métal acier/céramique +2 400, métal or +5 400 |
| Gravure du fond | texte libre, 24 caractères max | +250 |

Maximum atteint : Prisme or rose, cadran tapisserie, aiguilles or, bracelet or, gravé = 59 750 €.

## 4. Parcours (routes)

Application monopage, History API, un seul canvas WebGL persistant : la montre « voyage » d'une
page à l'autre.

| Route | Page |
|---|---|
| `/` | Accueil immersif |
| `/collection` | Collection, mode « Salles » par défaut, `?vue=grille` pour la grille filtrable |
| `/montre/<ref>` | Fiche produit + configurateur, config dans `?c=<code>` (partageable) |
| `/commande` | Tunnel de paiement en 3 étapes |
| `/commande/merci` | Confirmation |
| autre | 404 |

Panier : tiroir latéral global, pas de route. Transitions entre pages : rideau couleur quartz
fumé + la montre 3D qui se replace (pas de rechargement).

## 5. Pages et effets

### Accueil `/`
1. **Intro (Atom)** : un hexagone se trace facette par facette, un compteur 000 → 100 suit le vrai
   chargement (géométrie, fontes), les lettres MORION se révèlent, puis un rideau se retire en
   diagonale. Environ 2,4 s, passable au clic, une fois par session (`sessionStorage`).
2. **Hero (60fps)** : Prisme 42 en 3D devant « MORION » géant. Au scroll la montre pivote et passe
   derrière la typo (couche de texte avant/arrière du canvas).
3. **Assemblage (60fps)** : section épinglée. La montre se démonte en éclaté axial (bracelet, fond
   saphir, rotor, ponts, rouages, balancier, platine, cadran, aiguilles, lunette et ses 6 vis,
   glace), étiquettes de pièces qui suivent la 3D, compteur de pièces, puis remontage. Clic sur
   une pièce = sa fiche.
4. **Chapitres couleur (Atom)** : 4 chapitres épinglés, un par finition. Le fond plein écran
   change de couleur par volet, texte animé mot à mot, et la montre 3D change de matière en même
   temps.
5. **Seuil des salles** : couloir 3D qui mène vers `/collection`.
6. **Atelier express (Penarosa)** : mini configurateur (3 zones) et appel « Ouvrir l'atelier ».
7. **Finale (60fps)** : 4 Prisme alignés en 3D (acier, noir, or, or rose) devant la typo géante ;
   survol = la montre pivote et s'avance ; bouton rond « Choisir » vers la fiche.
8. **Pied de page** : newsletter factice, liens, mention « site de démonstration ».

### Collection `/collection`
- **Mode Salles (Cartier)** : hall en quartz fumé puis 3 salles dont le décor reprend la
  silhouette de la famille. Navigation par scènes (molette, flèches, points, boutons), caméra
  animée entre les points de vue, poussière volumétrique, vignettage. Chaque salle : montre sur
  socle en rotation lente, nom, « à partir de », « Découvrir » (overlay éditorial clair : rendu,
  texte, 4 finitions, « Composer ») et « Voir les 12 références ».
- **Mode Grille** : 12 cartes, rendu 3D réel de chaque référence (un seul renderer découpé en
  vues), rotation au survol ; filtres famille, matière, diamètre, prix ; tri ; nombre de
  résultats ; état vide.

### Fiche produit `/montre/<ref>`
- **Hero configurateur (Penarosa en 3D)** : montre au centre sur fond sombre avec halo ; pastilles
  en pilules reliées par des filets SVG aux ancres des 6 zones, recalculées depuis la 3D. Sur
  mobile : onglets de zones dans un panneau bas.
- Résumé : nom, référence, prix décomposé, total animé, gravure (la montre se retourne et le texte
  se grave sur le fond), « Ajouter au panier » (la montre vole vers l'icône panier), « Partager »
  (copie l'URL).
- Sous le pli : fiche technique en accordéons, éclaté court, galerie « Au poignet » (Imagen 3),
  livraison et garantie, autres familles.

### Panier (tiroir)
Ligne = image de la configuration (rendu du canvas), nom, résumé des options, gravure, prix,
quantité, supprimer (avec annulation). Sous-total, livraison assurée offerte, bouton commande.
Persisté en `localStorage`, pastille de compte dans la nav.

### Commande `/commande`
3 étapes : coordonnées → livraison (domicile sécurisé ou retrait en boutique fictive) → paiement
(carte factice validée : Luhn, date, cryptogramme ; ou virement). Récapitulatif fixe avec les
rendus. Erreurs en ligne, accessibles. « Payer » simule 1,5 s puis confirmation. Bandeau
permanent « Démonstration : aucun paiement réel ».

### Confirmation `/commande/merci`
Écrin 3D qui s'ouvre sur la montre commandée, numéro `MOR-XXXXXX`, récapitulatif, panier vidé.

## 6. Architecture technique

- **Sans build**, comme les autres vitrines : modules ES natifs, `importmap` pour three.js (version
  figée, jsdelivr), GSAP 3.12.5 + ScrollTrigger + Lenis en CDN avec SRI.
- `serve.py` local : repli SPA vers `index.html` + requêtes Range (vidéos). `404.html` = copie
  d'`index.html` pour les hébergeurs statiques.

```
morion-horlogerie/
  index.html  404.html  serve.py
  css/            base, layout, composants, une feuille par page
  js/
    main.js       démarrage : intro, routeur, Lenis, scène
    router.js     History API, transitions, mount/unmount des pages
    data/catalogue.js   familles, finitions, options, prix
    store/config.js     modèle de configuration, encodage URL, calcul du prix
    store/cart.js       panier localStorage + abonnements
    watch/        générateur procédural
      materials.js  acier, céramique, or jaune, or rose, saphir, lume, caoutchouc, cuir
      case.js bezel.js dial.js hands.js strap.js movement.js caseback.js
      build.js      buildWatch(config) → Group aux pièces nommées, ancres, vecteurs d'éclaté
      explode.js    état d'éclaté 0 → 1
    stage/
      renderer.js   renderer unique, environnement, redimensionnement, qualité adaptative
      views.js      vues découpées (grille, finale)
      snapshot.js   rendu → image (panier, commande)
      scenes/       studio, salles, finale, écrin
    pages/        home, collection, product, checkout, confirmation, notfound
    ui/           pastilles et filets, tiroir, prix animé, texte découpé
  img/  video/  docs/  _sources/
```

- **Montre** : chaque pièce est un `Mesh` nommé ; `buildWatch(config)` est pur (même config =
  même montre) ; changer une option remplace la matière sans reconstruire la géométrie quand
  c'est possible.
- **Performance** : DPR plafonné (2 desktop, 1,5 mobile), géométrie allégée sur mobile, rendu à
  la demande au repos, pause onglet caché. Cible 60 i/s desktop.
- **Accessibilité** : `prefers-reduced-motion` (pas de scrub ni d'épinglage, rendus fixes,
  transitions instantanées), AA, formulaires étiquetés, navigation clavier (salles et
  configurateur), `noscript` avec l'essentiel.

## 7. Visuels (Imagen 3 et Flow, générés par le user)

Ordre obligatoire : la montre 3D d'abord, puis les rendus studio détourés (PNG 2048 px) de
chaque famille et finition, exportés par `studio.html?export=rendus` dans
`_sources/rendus-3d/` ; le user les donne à Imagen 3 comme référence pour les photos au
poignet, d'atelier et de matières, puis à Flow pour les vidéos. Prompts, emplacements, ratios
et rendu de référence de chaque visuel dans `docs/IMAGES.md`. Chaque emplacement a un
placeholder designé tant que le fichier manque ; un fichier déposé sous son nom dans `img/` ou
`video/` s'affiche sans autre modification (liste régénérée par `outils/visuels.py`, relancé
par `serve.py`). Filigrane visible éventuel retiré par recadrage. Sources brutes dans
`_sources/`.

## 8. Jalons

1. **Socle + montre 3D** : squelette, générateur des 3 familles, studio (rotation, 4 finitions,
   éclaté, options). **Validation du user : 3D ou plan vidéo.**
2. Direction artistique (impeccable : palette, fontes, tokens) + coquille (nav, routeur,
   transitions, intro, tiroir panier).
3. Fiche produit + configurateur + panier.
4. Collection : grille puis salles.
5. Accueil : hero, assemblage, chapitres, finale.
6. Commande + confirmation.
7. Visuels Imagen 3/Flow (emplacements et prompts), finitions, QA 390 et 1440 px, revue impeccable, hub du portfolio et
   `PRODUCT.md` mis à jour.

## 9. Hors périmètre

Vrai paiement, comptes clients, back-office, stock réel, multilingue.
