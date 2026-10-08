# MORION : visuels à générer (Imagen 3 et Flow)

La montre du site est en 3D temps réel : accueil, éclaté, configurateur, salles, grille,
finale, écrin et page 404 n'ont besoin d'aucune image. Les visuels ci-dessous apportent ce que
la 3D ne sait pas faire : la montre portée, l'atelier, la matière en gros plan.

**Mode d'emploi**

1. Générer l'image avec le prompt du bloc, en joignant le ou les rendus de référence indiqués
   (dossier `_sources/rendus-3d/`, PNG détourés 2048 px). Si l'outil n'accepte pas d'image de
   référence, le prompt décrit la montre assez précisément pour s'en passer.
2. Déposer le fichier dans `img/` (ou `video/`) sous le **nom exact** du tableau. L'extension
   est libre : `.jpg`, `.jpeg`, `.png`, `.webp` ou `.avif` pour les images, `.mp4` ou `.webm`
   pour les vidéos.
3. Recharger la page : `serve.py` régénère la liste des visuels présents
   (`js/data/visuels-presents.js`) et le placeholder laisse place à l'image. Sans serveur :
   `python outils/visuels.py`.
4. Facultatif, avant mise en ligne : `python outils/visuels.py --optimiser` convertit les
   images lourdes en WebP 2000 px et range les originaux dans `_sources/visuels-originaux/`.
5. Si l'outil ajoute un filigrane visible, recadrer pour l'enlever (le cadrage des blocs laisse
   de la marge sur les bords).

**Règles communes à tous les prompts** (déjà incluses dans chaque prompt)

- Aucun texte lisible, aucun logo, aucune marque réelle ; le seul mot autorisé est MORION sur le
  cadran, et il peut rester flou.
- Aucun visage. Mains et poignets de carnations variées, ongles courts et nets.
- Aucune boisson alcoolisée, aucun verre à pied, aucun bar, aucune bouteille.
- Univers MORION : quartz fumé (morion) presque noir aux reflets bruns, facettes hexagonales,
  pierre sombre, acier brossé ; lumière basse et rasante, une source principale, ombres
  denses, reflets nets sur les arêtes polies ; couleurs sourdes, jamais saturées.
- Formats Imagen 3 : 1:1, 3:4, 4:3, 9:16, 16:9. Flow : 16:9 ou 9:16, 8 s.

## Tableau

Statut : « à générer » tant que le fichier manque ; le site affiche alors un placeholder designé.

### Indispensables

| N° | Fichier | Page, emplacement | Ratio, taille | Référence à joindre | Statut |
|---|---|---|---|---|---|
| 1 | `img/poignet-pr42.jpg` | Fiche Prisme 42, galerie « Au poignet », image 1 | 3:4, 1536×2048 | `mor-pr42-ac-trois-quarts.png` | déposé (896×1200 ou 1024², vérifié) |
| 2 | `img/poignet-mo39.jpg` | Fiche Monolithe 39, galerie « Au poignet », image 1 | 3:4, 1536×2048 | `mor-mo39-or-trois-quarts.png` | déposé (896×1200 ou 1024², vérifié) |
| 3 | `img/poignet-ab41.jpg` | Fiche Abysse 41, galerie « Au poignet », image 1 | 3:4, 1536×2048 | `mor-ab41-ac-trois-quarts.png` | déposé (896×1200 ou 1024², vérifié) |
| 4 | `img/atelier-etabli.jpg` | Accueil, section « Atelier », grande image | 16:9, 2560×1440 | `mor-pr42-ac-dos.png`, `mor-pr42-ac-eclate.png` | déposé (896×1200 ou 1024², vérifié) |
| 5 | `img/atelier-loupe.jpg` | Accueil, section « Atelier », vignette gauche | 3:4, 1536×2048 | `mor-pr42-ac-dos.png` | déposé (896×1200 ou 1024², vérifié) |
| 6 | `img/atelier-reglage.jpg` | Accueil, section « Atelier », vignette droite | 3:4, 1536×2048 | `mor-pr42-ac-eclate.png` | déposé (896×1200 ou 1024², vérifié) |

### Bonus

| N° | Fichier | Page, emplacement | Ratio, taille | Référence à joindre | Statut |
|---|---|---|---|---|---|
| 7 | `img/poignet-pr42-2.jpg` | Fiche Prisme 42, galerie, image 2 | 3:4, 1536×2048 | `mor-pr42-cn-trois-quarts.png` | déposé (896×1200 ou 1024², vérifié) |
| 8 | `img/poignet-mo39-2.jpg` | Fiche Monolithe 39, galerie, image 2 | 3:4, 1536×2048 | `mor-mo39-ac-face.png` | déposé (896×1200 ou 1024², vérifié) |
| 9 | `img/poignet-ab41-2.jpg` | Fiche Abysse 41, galerie, image 2 | 3:4, 1536×2048 | `mor-ab41-or-trois-quarts.png` | déposé (896×1200 ou 1024², vérifié) |
| 10 | `img/matiere-acier.jpg` | Fiches, bloc « Matières », acier ; accueil, chapitre acier (vignette, si présente) | 1:1, 2048×2048 | `mor-pr42-ac-profil.png` | déposé (896×1200 ou 1024², vérifié) |
| 11 | `img/matiere-ceramique.jpg` | Fiches, bloc « Matières », céramique ; accueil, chapitre céramique (vignette, si présente) | 1:1, 2048×2048 | `mor-pr42-cn-trois-quarts.png` | déposé (896×1200 ou 1024², vérifié) |
| 12 | `img/matiere-or-jaune.jpg` | Fiches, bloc « Matières », or jaune ; accueil, chapitre or jaune (vignette, si présente) | 1:1, 2048×2048 | `mor-mo39-oj-trois-quarts.png` | déposé (896×1200 ou 1024², vérifié) |
| 13 | `img/matiere-or-rose.jpg` | Fiches, bloc « Matières », or rose ; accueil, chapitre or rose (vignette, si présente) | 1:1, 2048×2048 | `mor-pr42-or-trois-quarts.png` | déposé (896×1200 ou 1024², vérifié) |
| 14 | `img/salon-retrait.jpg` | Commande, étape livraison, option « Retrait au salon » | 4:3, 2048×1536 | `alignement-pr42.png` | déposé, vérifié sur le site |
| 15 | `video/atelier-boucle.mp4` | Accueil, section « Atelier », fond animé derrière le titre | 16:9, 8 s, 1920×1080 | image de départ : `_sources/videos-depart/atelier-boucle-depart.jpg` (déposé, boucle raccordée, vérifié sur le site, sans personne) | déposé, boucle raccordée, vérifié sur le site |
| 16 | `video/poignet-pr42-rotation.mp4` | Fiche Prisme 42, galerie, image 3 | 9:16, 8 s, 1080×1920 | image de départ : `img/poignet-pr42.jpg` (n° 1) | déposé, vérifié sur le site |

### Produit sans générateur

| N° | Fichier | Page | Source | Statut |
|---|---|---|---|---|
| 17 | `img/partage.jpg` | Aperçu de partage (Open Graph), 1200×630 | rendus 3D du site | produit au jalon 7 |

## Rendus de référence (`_sources/rendus-3d/`)

| Fichier | Vue | Sert à |
|---|---|---|
| `mor-<famille>-<finition>-trois-quarts.png` (12) | trois-quarts avant | photos au poignet, matières |
| `mor-<famille>-<finition>-face.png` (12) | de face | poignet vue de dessus, contrôle du cadran |
| `mor-<famille>-{ac,or}-profil.png` (6) | profil couronne | épaisseur, matière acier |
| `mor-<famille>-{ac,or}-dos.png` (6) | dos, mouvement visible | atelier, loupe |
| `mor-<famille>-{ac,or}-eclate.png` (6) | éclaté axial | atelier, réglage |
| `alignement-{pr42,mo39,ab41}.png` (3) | 4 finitions alignées, 2048×1024 | salon, références de couleur |

Familles : `pr42` Prisme Chronographe 42, `mo39` Monolithe 39, `ab41` Abysse 41 GMT.
Finitions : `ac` acier, `cn` céramique noire, `oj` or jaune, `or` or rose.

---

## Blocs prêts à coller

### 1 · poignet-pr42 · Fiche Prisme 42, galerie « Au poignet »

- Fichier : `img/poignet-pr42.jpg` · 3:4 · 1536×2048 · indispensable
- Référence : `_sources/rendus-3d/mor-pr42-ac-trois-quarts.png` (et `mor-pr42-ac-face.png`)
- Cadrage : poignet gauche en plan serré, montre au tiers haut, légère plongée ; 25 % de marge
  sur les bords (recadrage possible).
- Prompt :

> Close-up editorial photograph of a left wrist wearing a steel sport-luxury chronograph watch,
> exactly as in the reference render: round 42 mm case with integrated lugs, a faceted hexagonal
> bezel held by six screws, deep blue grid-textured dial with three sub-dials and a small date
> window, two pushers and a fluted crown on the right, integrated steel bracelet with brushed and
> polished links. The forearm rests on a slab of dark smoked quartz stone with sharp hexagonal
> facets, rolled-up charcoal merino sleeve. Low raking light from the left, one light source,
> deep shadows, crisp specular highlights on the polished bezel facets, muted colours. Shot on an
> 85 mm lens at f/2.8, shallow depth of field, calm and precise luxury mood. No face, no readable
> text, no logos, no other jewellery, no glasses or bottles, no drinks.

- À ne pas voir : visage, texte, autre montre, bijoux, verre, boisson.

### 2 · poignet-mo39 · Fiche Monolithe 39, galerie « Au poignet »

- Fichier : `img/poignet-mo39.jpg` · 3:4 · 1536×2048 · indispensable
- Référence : `mor-mo39-or-trois-quarts.png` (et `mor-mo39-or-face.png`)
- Cadrage : main posée à plat, montre au centre, vue en plongée à 45°.

> Editorial photograph of a hand resting flat on a dark smoked quartz tabletop, wearing an
> ultra-thin rose gold dress watch exactly as in the reference render: cushion-shaped rounded
> square 39 mm case, thin polished bezel, smoky brown gradient dial with fine vertical line
> texture, gold baton indices and three slim gold hands, integrated rose gold bracelet. Crisp
> white shirt cuff folded once. Soft low morning light from a window on the right, long gentle
> shadows, warm highlights on the rose gold, quiet and refined mood, muted palette. 100 mm macro
> lens, f/4. No face, no readable text, no logos, no rings, no glasses or bottles, no drinks.

- À ne pas voir : visage, bague, texte, tasse ou verre.

### 3 · poignet-ab41 · Fiche Abysse 41, galerie « Au poignet »

- Fichier : `img/poignet-ab41.jpg` · 3:4 · 1536×2048 · indispensable
- Référence : `mor-ab41-ac-trois-quarts.png` (et `mor-ab41-ac-face.png`)
- Cadrage : poignet en mouvement, fond de mer sombre flou, gouttelettes d'eau.

> Action close-up of a wet left wrist wearing a steel dive watch exactly as in the reference
> render: round 41 mm steel case with a crown guard, notched rotating bezel with a navy blue
> ceramic 24-hour insert, deep blue sunburst dial, large round luminous dots and a triangle at
> twelve, a GMT hand with an orange tip, black rubber strap. Water droplets on the crystal and
> the skin, dark blue sea and wet black volcanic rock blurred behind, dusk light low on the
> horizon, cold blue ambience with one warm rim light on the case edge, high contrast, crisp
> reflections. 85 mm lens, f/2.8, fast shutter freezing the droplets. No face, no readable text,
> no logos, no boat names, no drinks.

- À ne pas voir : visage, texte, logo de combinaison, bateau lisible.

### 4 · atelier-etabli · Accueil, section « Atelier », grande image

- Fichier : `img/atelier-etabli.jpg` · 16:9 · 2560×1440 · indispensable
- Références : `mor-pr42-ac-dos.png` (le mouvement), `mor-pr42-ac-eclate.png` (les pièces)
- Cadrage : établi d'horloger vu de trois-quarts, mains au centre, profondeur de champ courte ;
  tiers gauche plus sombre et calme (le titre de la section s'y pose).

> Wide cinematic photograph of a watchmaker's bench in a dark workshop. Two hands in the centre
> hold fine steel tweezers above an open mechanical watch movement like the one in the reference
> render: rhodium-plated bridges with Geneva stripes, gold gear wheels, red jewels, blued screws,
> a gold balance wheel. Loose watch parts laid out in a neat row on a dark smoked quartz tray with
> hexagonal compartments: a hexagonal bezel with six screws, a sapphire crystal, small hands. A
> brass loupe and a small steel screwdriver set nearby. One focused lamp from the upper right,
> deep shadows, the left third of the frame dark and empty, precise and calm mood, muted palette
> of graphite, brass and smoky brown. 50 mm lens, f/2.8. No face, no readable text, no logos, no
> cups, no drinks.

- À ne pas voir : visage, texte, écran, tasse, boisson.

### 5 · atelier-loupe · Accueil, section « Atelier », vignette gauche

- Fichier : `img/atelier-loupe.jpg` · 3:4 · 1536×2048 · indispensable
- Référence : `mor-pr42-ac-dos.png`

> Extreme macro photograph through a watchmaker's loupe: the rhodium bridges with Geneva stripes,
> a gold balance wheel caught mid-swing, a blued hairspring, bright red jewels in polished gold
> chatons and blued screws of a mechanical watch movement like the reference render. The loupe
> rim frames the image in a soft dark circle. Single cold light from above left, jewel-like
> highlights, very shallow depth of field, graphite and gold palette. No text, no logos, no face.

- À ne pas voir : texte gravé lisible, logo.

### 6 · atelier-reglage · Accueil, section « Atelier », vignette droite

- Fichier : `img/atelier-reglage.jpg` · 3:4 · 1536×2048 · indispensable
- Référence : `mor-pr42-ac-eclate.png`

> Close photograph of a watchmaker's fingertips placing the faceted hexagonal steel bezel of a
> chronograph onto its round case, the six bezel screws waiting in a small dark smoked quartz dish
> with hexagonal facets, the parts matching the exploded reference render. Clean dark workbench,
> one narrow raking light from the right that draws a bright line along each bezel facet, deep
> shadows, precise and quiet mood. 100 mm macro lens, f/4. No face, no readable text, no logos,
> no drinks.

- À ne pas voir : visage, texte, outil électrique.

### 7 · poignet-pr42-2 · Fiche Prisme 42, galerie, image 2 (bonus)

- Fichier : `img/poignet-pr42-2.jpg` · 3:4 · 1536×2048
- Référence : `mor-pr42-cn-trois-quarts.png`

> Editorial photograph of a wrist in a navy technical jacket, sleeve pulled back, wearing a black
> ceramic sport-luxury chronograph exactly as in the reference render: round 42 mm black ceramic
> case, faceted hexagonal black ceramic bezel with six screws, black grid-textured dial with
> three sub-dials, integrated black ceramic bracelet. Hand gripping the edge of a raw concrete
> wall, city at blue hour blurred behind, cold ambient light with one warm reflection sliding
> along the bezel facets, high contrast, glossy ceramic highlights. 85 mm lens, f/2.8. No face,
> no readable text, no logos, no drinks.

### 8 · poignet-mo39-2 · Fiche Monolithe 39, galerie, image 2 (bonus)

- Fichier : `img/poignet-mo39-2.jpg` · 3:4 · 1536×2048
- Référence : `mor-mo39-ac-face.png`

> Top-down photograph of a wrist resting on an open hardback sketchbook with blank pages, wearing
> an ultra-thin steel dress watch exactly as in the reference render: cushion-shaped rounded
> square 39 mm steel case, blue dial with fine vertical line texture, steel baton indices, three
> slim hands, integrated steel bracelet. A graphite pencil beside it. Soft overcast daylight,
> gentle shadows, calm architectural mood, palette of paper white, graphite and steel blue.
> 50 mm lens, f/5.6. No face, no readable text or drawings, no logos, no cups, no drinks.

### 9 · poignet-ab41-2 · Fiche Abysse 41, galerie, image 2 (bonus)

- Fichier : `img/poignet-ab41-2.jpg` · 3:4 · 1536×2048
- Référence : `mor-ab41-or-trois-quarts.png`

> Photograph of a forearm resting on the teak rail of a sailing boat at golden hour, wearing a
> rose gold dive watch exactly as in the reference render: round 41 mm rose gold case, notched
> rotating bezel with a black ceramic 24-hour insert, smoky brown gradient dial with round
> luminous dots, black rubber strap. Sea spray in the air, deep blue water behind, warm low sun
> from the right, rich shadows, relaxed sporty luxury mood. 85 mm lens, f/2.8. No face, no
> readable text, no logos, no drinks, no glasses.

### 10 · matiere-acier · Fiches, bloc « Matières » ; accueil, chapitre couleur (bonus)

- Fichier : `img/matiere-acier.jpg` · 1:1 · 2048×2048
- Référence : `mor-pr42-ac-profil.png`

> Abstract macro photograph of brushed and mirror-polished stainless steel meeting at a sharp
> bevel, like the case flank of the reference render: fine straight satin grain on one plane, a
> mirror facet on the other, one bright line of light along the edge. Graphite background, cold
> neutral light, extreme detail, minimal composition. No text, no logos.

### 11 · matiere-ceramique · Fiches, bloc « Matières » ; accueil, chapitre couleur (bonus)

- Fichier : `img/matiere-ceramique.jpg` · 1:1 · 2048×2048
- Référence : `mor-pr42-cn-trois-quarts.png`

> Abstract macro photograph of polished black ceramic with hexagonal facets, like the bezel of the
> reference render, glossy and deep, a single soft reflection of a window gliding across two
> facets, near-black background with a faint smoky brown glow. Minimal, extreme detail. No text,
> no logos.

### 12 · matiere-or-jaune · Fiches, bloc « Matières » ; accueil, chapitre couleur (bonus)

- Fichier : `img/matiere-or-jaune.jpg` · 1:1 · 2048×2048
- Référence : `mor-mo39-oj-trois-quarts.png`

> Abstract macro photograph of 18k yellow gold: a polished rounded edge meeting a satin-brushed
> flat surface, like the cushion case of the reference render, warm highlight rolling along the
> curve, dark smoked quartz background. Minimal, extreme detail, rich but not saturated. No text,
> no logos.

### 13 · matiere-or-rose · Fiches, bloc « Matières » ; accueil, chapitre couleur (bonus)

- Fichier : `img/matiere-or-rose.jpg` · 1:1 · 2048×2048
- Référence : `mor-pr42-or-trois-quarts.png`

> Abstract macro photograph of 18k rose gold hexagonal bezel facets with a screw head, like the
> reference render, alternating mirror-polished and brushed planes, a soft pink-copper highlight
> on one facet, graphite background. Minimal, extreme detail. No text, no logos.

### 14 · salon-retrait · Commande, option « Retrait au salon » (bonus)

- Fichier : `img/salon-retrait.jpg` · 4:3 · 2048×1536
- Référence : `alignement-pr42.png` (les 4 montres à exposer)

> Interior photograph of a small, quiet watch salon: a long low display table carved from dark
> smoked quartz with hexagonal facets, four sport-luxury chronographs laid on it like in the
> reference render (steel, black ceramic, yellow gold, rose gold), walls in dark stone, narrow
> vertical light slits, warm spotlights on each watch, deep shadows, nobody in the room.
> Architectural 24 mm lens, f/8, calm and exclusive mood. No people, no readable text, no logos,
> no bar, no bottles, no drinks.

- À ne pas voir : personnes, comptoir de bar, bouteilles, enseigne lisible.

### 15 · atelier-boucle · Accueil, section « Atelier », fond animé (Flow, bonus)

- Fichier : `video/atelier-boucle.mp4` · 16:9 · 8 s · 1920×1080, sans son
- **Aucune personne, aucune main.** Image de départ à générer d'abord (prompt ci-dessous, 16:9),
  à ranger dans `_sources/videos-depart/atelier-boucle-depart.jpg`.
- Caméra : travelling latéral très lent de gauche à droite ; aucun mouvement brusque ; dernière
  image proche de la première (boucle).

**Image de départ (à générer, 16:9) :**

> Photograph of an empty watchmaker's bench in a dark workshop, nobody in the frame. On a grey
> leather mat lies a luxury steel chronograph watch, its case back removed, held in a movement
> holder; the open mechanical movement is visible with a golden balance wheel, blue screws and
> red jewels. Beside it: steel tweezers, a brass loupe, small screwdrivers, and a dark tray with
> hexagonal compartments holding a hexagonal steel bezel, a sapphire crystal and tiny hands.
> A single desk lamp from the upper right, deep shadows, dust particles floating in the light
> beam, dark wooden bench, calm and precise mood. 35 mm lens, shallow depth of field. No person,
> no hands, no face, no text, no logos, no drinks.

**Vidéo (Flow, image vers vidéo) :**

> Slow cinematic dolly shot moving a few centimetres from left to right across an empty
> watchmaker's bench in a dark workshop. The open watch movement stays in focus, the golden
> balance wheel keeps oscillating, a slow beam of light slides across the steel tools and the
> tray, dust particles float in the lamp light. Calm and precise mood. Seamless loop, the last
> frame matches the first. Nobody in the frame, no person, no hands, no face, no text, no logos,
> no cuts.

### 16 · poignet-pr42-rotation · Fiche Prisme 42, galerie, image 3 (Flow, bonus)

- Fichier : `video/poignet-pr42-rotation.mp4` · 9:16 · 8 s · 1080×1920, sans son
- Image de départ : `img/poignet-pr42.jpg` (n° 1) ; première image de secours :
  `_sources/rendus-3d/mor-pr42-ac-trois-quarts.png`.
- Caméra : fixe ; c'est le poignet qui pivote lentement de 30° vers la caméra, la lumière glisse
  sur les facettes de la lunette.

> Vertical slow-motion shot: the wrist wearing the steel chronograph slowly rotates about thirty
> degrees towards the camera, the raking light slides across each facet of the hexagonal bezel
> and makes the blue dial flash once, then settles. Static camera, shallow depth of field, dark
> smoked quartz background. No face, no text, no logos, no cuts.

