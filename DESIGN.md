---
name: MORION
description: Maison horlogère sport-luxe dont la page entière est un cadran fumé et la montre 3D l'aiguille.
colors:
  fume-centre: "#3c424c"
  fume-milieu: "#23262c"
  fond: "#111316"
  fond-pose: "#1a1d21"
  fond-champ: "#252930"
  encre: "#eceae6"
  encre-2: "#a7a19b"
  encre-3: "#6f6964"
  filet: "rgb(236 234 230 / 0.12)"
  filet-fort: "rgb(236 234 230 / 0.28)"
  bleui: "#6d83ff"
  lume: "#d9f0cf"
  alerte: "#ff8a6b"
  rideau: "#1c1917"
  sur-encre: "#151414"
  chapitre-acier: "#5d6670"
  chapitre-acier-encre: "#f2f3f4"
  chapitre-ceramique: "#070708"
  chapitre-ceramique-encre: "#ecebe9"
  chapitre-or-jaune: "#cfa84f"
  chapitre-or-jaune-encre: "#1c1810"
  chapitre-or-rose: "#c9907d"
  chapitre-or-rose-encre: "#26160f"
typography:
  geant:
    fontFamily: "Michroma, Albert Sans, sans-serif"
    fontSize: "clamp(4.5rem, 15.5vw, 16rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.06em"
  display:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.35rem + 2.2vw, 3.25rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 1.15rem + 1.2vw, 2.25rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  petit:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0.03em"
  imprime:
    fontFamily: "Michroma, Albert Sans, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.8
    letterSpacing: "0.3em"
  cadran-3d:
    fontFamily: "Syncopate, system-ui, sans-serif"
    fontWeight: 700
    letterSpacing: "normal"
rounded:
  guichet: "2px"
  douce: "12px"
  carte: "16px"
  pilule: "999px"
spacing:
  e-1: "0.25rem"
  e-2: "0.5rem"
  e-3: "0.75rem"
  e-4: "1rem"
  e-5: "1.5rem"
  e-6: "2rem"
  e-7: "3rem"
  e-8: "4.5rem"
  e-9: "7rem"
  marge: "clamp(1.25rem, 3.6vw, 3.5rem)"
  rehaut: "clamp(0.5rem, 1vw, 0.875rem)"
components:
  btn-plein:
    backgroundColor: "{colors.encre}"
    textColor: "{colors.sur-encre}"
    rounded: "{rounded.pilule}"
    padding: "0 1.5rem"
    height: "48px"
  btn-plein-hover:
    backgroundColor: "#ffffff"
    textColor: "{colors.sur-encre}"
  btn-trait:
    textColor: "{colors.encre}"
    rounded: "{rounded.pilule}"
    padding: "0 1.5rem"
    height: "48px"
  btn-sombre:
    backgroundColor: "{colors.sur-encre}"
    textColor: "{colors.encre}"
    rounded: "{rounded.pilule}"
    padding: "0 1.5rem"
    height: "48px"
  guichet-fenetre:
    backgroundColor: "{colors.encre}"
    textColor: "{colors.sur-encre}"
    rounded: "{rounded.guichet}"
    padding: "0 6px"
    height: "26px"
  pastille:
    backgroundColor: "rgb(26 24 23 / 0.72)"
    textColor: "{colors.encre}"
    rounded: "{rounded.pilule}"
    padding: "0.5rem 1.5rem"
    height: "52px"
  pastille-active:
    backgroundColor: "rgb(30 30 40 / 0.85)"
    textColor: "{colors.encre}"
  puce:
    textColor: "{colors.encre-2}"
    rounded: "{rounded.pilule}"
    padding: "0 1rem"
    height: "40px"
  puce-active:
    textColor: "{colors.encre}"
  champ:
    backgroundColor: "{colors.fond-pose}"
    textColor: "{colors.encre}"
    rounded: "{rounded.douce}"
    padding: "0 1rem"
    height: "48px"
  carte:
    textColor: "{colors.encre}"
    rounded: "{rounded.carte}"
    padding: "1rem"
  tiroir-panier:
    backgroundColor: "{colors.fond-pose}"
    textColor: "{colors.encre}"
    padding: "2rem"
    width: "min(460px, 100vw)"
  edito-carte:
    backgroundColor: "{colors.encre}"
    textColor: "{colors.sur-encre}"
    width: "min(1040px, 100vw)"
---

# Design System: MORION

## Overview

**Creative North Star: « Le cadran fumé »**

La page n'imite pas une montre, elle en est une. Le fond est un dégradé radial brun-gris qui
s'assombrit vers les bords, traversé d'un soleillé très discret, exactement comme le cadran fumé
(le morion, ce quartz presque noir) des montres de la maison. Un réhaut de soixante minutes court
le long du bord de l'écran et son index bleui suit le défilement. La navigation est imprimée comme
une impression de cadran, le panier est un guichet de date, et le mot MORION en Michroma géant
passe derrière la montre. Tout ce qui est interface emprunte son vocabulaire à l'horlogerie
d'instrument des années 70, pas à la boutique de luxe.

Le système est sombre et unique : aucun mode clair global, une seule source de lumière pour tout
le site (en haut à droite, où sont centrés le soleillé, la lumière principale de la 3D et les
ombres). La densité est faible : de grands aplats de fumé, des blocs de texte courts posés en bas
ou sur une colonne, beaucoup de vide, parce que le sujet de chaque écran est la montre en trois
dimensions, pas la mise en page. Un seul accent, l'acier bleui, dit l'état actif et rien d'autre.
Les quatre aplats de chapitre (acier, céramique, or jaune, or rose) sont la seule rupture de
couleur autorisée, et elle est franche : un choix est un événement, pas un fondu.

Le site refuse explicitement deux mondes : la boutique de luxe noire à serif doré, et la page
produit blanche à grande photo centrée. La direction « Écrin » (couvercle laqué, doublure suède,
surpiqûres) a été évaluée puis écartée pour la même raison : c'est de l'emballage, pas du
sport-luxe, et la montre y perdait sa présence.

**Key Characteristics:**
- Une seule montre 3D persistante, la même du premier écran à la confirmation de commande.
- Fond en dégradé fumé soleillé qui ne s'éteint jamais, même sous le pli.
- Réhaut de soixante minutes au bord de l'écran, toujours au-dessus de tout le reste.
- Une seule encre claire, un seul accent (acier bleui), un point de luminescence.
- Michroma en capitales très espacées pour tout ce qui est « imprimé » ; Albert Sans pour lire.
- Pilule pour ce qui se touche, 16 px pour ce qui se pose, 2 px pour le guichet.
- Aucun rebond dans le mouvement : de power2 à power4, jamais autre chose.

## Colors

Une palette de cadran : un brun-gris fumé qui s'éteint vers le noir, une encre d'impression
claire, un seul accent froid et une touche de luminescence.

### Primary
- **Acier bleui** (`{colors.bleui}`) : l'unique accent. Il marque l'état actif et rien d'autre :
  contour de l'option choisie dans le configurateur et des puces de filtre, index courant du
  réhaut, numéro de l'étape en cours du tunnel de commande, soulignement du lien de page
  courante, contour de focus, index de l'étape active de l'éclaté. Il ne sert jamais de fond
  d'aplat, jamais de couleur de texte courant.

### Secondary
- **Encre d'impression** (`{colors.encre}`) : le texte principal, mais aussi la couleur des
  surfaces claires quand une surface doit devenir le premier plan absolu : le bouton plein, la
  fenêtre du guichet de date, la surimpression éditoriale de la collection. Elle est le contraire
  du fumé, donc elle attire l'œil sans consommer l'accent.
- **Luminescence** (`{colors.lume}`) : le vert pâle des index de montre dans le noir. Réservé aux
  points minuscules : les traits allumés de la minuterie de l'intro, le point posé sur chaque
  pièce de l'assemblage, l'écart de prix à la hausse dans le configurateur. Jamais un aplat.

### Tertiary
- **Aplats de chapitre** (`{colors.chapitre-acier}`, `{colors.chapitre-ceramique}`,
  `{colors.chapitre-or-jaune}`, `{colors.chapitre-or-rose}`) : quatre fonds pleine page qui
  correspondent aux quatre finitions de la collection, utilisés uniquement dans la séquence des
  chapitres de l'accueil. Chacun porte son encre dédiée (`*-encre`). Les deux ors et l'acier sont
  des fonds clairs : ils retournent la nav, le guichet et le réhaut en impression sombre
  (`[data-encre="sombre"]`). Le noir céramique est volontairement plus sombre que le fond de page
  pour ne pas se confondre avec lui.
- **Alerte** (`{colors.alerte}`) : uniquement les erreurs de formulaire (message, bordure de champ
  invalide, message du pied de la 404). Jamais décoratif.

### Neutral
- **Fumé centre** (`{colors.fume-centre}`) : le cœur du dégradé, sous la montre.
- **Fumé milieu** (`{colors.fume-milieu}`) : la zone intermédiaire du dégradé et le fond des
  cartes en dégradé radial.
- **Fond** (`{colors.fond}`) : le bord du cadran, le fond de page, le voile sous la nav.
- **Fond posé** (`{colors.fond-pose}`) : les surfaces qui se posent sur le fumé, tiroir panier,
  récapitulatif, fiche de pièce, champs de formulaire.
- **Fond champ** (`{colors.fond-champ}`) : l'état survolé ou choisi d'une carte de choix.
- **Encre 2** (`{colors.encre-2}`) : texte secondaire, légendes, libellés, liens de nav au repos.
- **Encre 3** (`{colors.encre-3}`) : titres d'étape encore inactifs, grands traits, jamais du
  texte courant.
- **Filet** et **filet fort** (`{colors.filet}`, `{colors.filet-fort}`) : les deux seules valeurs
  de trait, en encre transparente. Le filet fort est le contour au repos d'un élément cliquable,
  le filet simple sépare deux blocs.
- **Rideau** (`{colors.rideau}`) et **sur-encre** (`{colors.sur-encre}`) : la dalle de transition
  et le texte posé sur une surface claire.

### Named Rules
**La règle de l'accent unique.** L'acier bleui ne dit qu'une chose : ceci est actif. Si un écran
montre du bleui à deux endroits qui ne sont pas tous deux l'état courant, l'un des deux est faux.

**La règle du cadran jamais éteint.** Aucune section n'a de fond plat. Sous le pli, les blocs
utilisent le sol fumé (`--sol-fume` : soleillé en dégradé conique répété plus dégradé radial
centré à 72 % 0 %), qui prolonge le halo du haut de page au lieu de le couper net.

**La règle des contrastes mesurés.** Chaque couple encre/fond du build a été mesuré (encre sur
fond 15,6:1 ; encre 2 sur fond 7,3:1 ; bleui sur fond 5,7:1). Conséquence durable : encre 2 ne
tient que 3,8:1 sur le centre du fumé, donc aucun texte secondaire ne se pose au centre du halo.
Cette zone appartient à la montre.

## Typography

**Display Font :** Michroma (repli Albert Sans, sans-serif)
**Body Font :** Albert Sans (repli system-ui, sans-serif)
**Label/3D Font :** Syncopate, uniquement dans les textures de la montre 3D

**Character :** Michroma est la capitale large et monolinéaire des cadrans de chronographe : elle
ne sert jamais à faire des phrases, seulement à imprimer. Albert Sans est la voix de lecture,
neutre, un peu resserrée dans les titres (interlettrage négatif de 0,015 em). La tension entre les
deux est celle d'une montre : une inscription gravée d'un côté, une notice lisible de l'autre.

### Hierarchy
- **Géant** (Michroma 400, `clamp(4.5rem, 15.5vw, 16rem)`, interligne 1, interlettrage 0,06 em) :
  le mot MORION derrière la montre, en encre à 7,5 % d'opacité. À 390 px il bascule à la verticale
  le long du réhaut gauche (`writing-mode: vertical-rl`, 15vw) pour rester lisible en entier. Une
  copie pleine du même mot, en encre pleine, vit sur le calque avant et se découvre par une
  facette inclinée à 60 degrés pendant le défilement.
- **Display** (Albert Sans 500, `clamp(2rem, 1.35rem + 2.2vw, 3.25rem)`, interligne 1,05 à 1,08) :
  le titre unique d'un écran, hero d'accueil, titre de salle, titre de chapitre, titre de
  commande, titre de confirmation.
- **Headline** (Albert Sans 500, `clamp(1.5rem, 1.15rem + 1.2vw, 2.25rem)`) : les titres de
  section de deuxième rang, assemblage, au poignet, fiche technique, finale.
- **Title** (Albert Sans 500, `clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem)`) : titres d'étape du
  tunnel, en-têtes de groupe dépliant, nom d'une fiche de pièce.
- **Body** (Albert Sans 400, 1,0625 rem, interligne 1,55) : le texte courant, en encre 2 quand il
  accompagne un titre. Les paragraphes sont bornés par une largeur en rem (26 à 34 rem selon le
  bloc), jamais laissés courir sur toute la colonne.
- **Petit** (Albert Sans 400, 0,875 rem) : liens de nav, résumés d'étape, prix secondaires,
  détails d'option.
- **Imprimé** (Michroma 400, 0,75 rem, interlettrage 0,3 em, capitales, interligne 1,8) :
  l'inscription de cadran. Légendes de compteur, numéro d'étape, index de chapitre, titre du
  récapitulatif, en-tête du tiroir, noms de zone du configurateur, points de navigation des
  salles. L'interlettrage descend à 0,24 em quand la ligne est longue, jamais en dessous.
- **Cadran 3D** (Syncopate 400/700) : uniquement dessiné dans les textures canvas de la montre
  (cadran, fond de boîtier, platine du mouvement). Ne l'utilisez jamais en HTML.

### Named Rules
**La règle de l'inscription.** Michroma est une impression, pas une typographie de texte. Elle
n'apparaît qu'en capitales espacées, à 0,75 rem au minimum (jamais plus petit : en dessous
l'interlettrage devient illisible) ou en très grand pour le mot géant et les compteurs. Aucune
phrase en Michroma.

**La règle du compteur.** Tout avancement se lit comme un compteur de cadran, en chiffres
tabulaires et avec sa légende imprimée en dessous : « pièce 14 sur 59 », « étape 2 sur 3 ». Les
classes `.num` et `.prix` forcent `font-variant-numeric: tabular-nums` pour que les chiffres ne
sautent pas en changeant.

**La règle de la ligne de spécification.** La famille et les caractéristiques d'une référence se
posent sous le nom, en petite encre secondaire, jamais au-dessus en surtitre.

## Layout

**Grille.** Douze colonnes, qui sont les douze index horaires du réhaut
(`grid-template-columns: repeat(12, minmax(0, 1fr))`), utilisées pour les blocs éditoriaux et de
galerie (au poignet, matière, fiche technique, photos de l'atelier, pied de la 404). Les blocs de
lecture face à la montre utilisent plutôt une bipartition asymétrique : 5fr / 7fr pour un chapitre,
7fr / 5fr pour le tunnel de commande et son récapitulatif, 1fr / 1fr quand la montre occupe une
moitié pleine.

**Marges.** Deux mesures fluides encadrent tout : `--rehaut` (`clamp(0.5rem, 1vw, 0.875rem)`) est
la distance du réhaut au bord physique de l'écran, et `--marge`
(`clamp(1.25rem, 3.6vw, 3.5rem)`) est la marge latérale du contenu, à l'intérieur du réhaut. Tout
ce qui est calé en bas d'écran s'ancre sur `calc(var(--rehaut) + …)` : rien ne touche jamais le
réhaut.

**Rythme.** Base de 4 px, neuf pas (0,25 rem à 7 rem). Les gouttières de grille valent e-4 ou e-5,
les respirations entre sections e-7 à e-9, les micro-écarts internes e-1 et e-2.

**Rupture.** Un seul point de bascule, 719 px (`@media (max-width: 719px)`), doublé d'une bascule
JS au même seuil (`window.innerWidth < 720`) qui fait passer la montre 3D de la table de poses
large à la table étroite. Une seule rupture intermédiaire dans tout le site, à 1100 px, pour
passer la grille de collection de quatre à trois colonnes.

**Densité en écran étroit.** Les rangées d'options ne se replient pas, elles défilent à
l'horizontale avec masque de fondu sur le bord droit (une pastille coupée net se lirait comme un
défaut, pas comme une invitation), les colonnes deviennent une seule, et les blocs de commande se
replient sur leur résumé (le récapitulatif tient sur une ligne, « 1 montre · 40 600 € », avec un
lien « Voir le détail »).

### Named Rules
**La règle de l'écran plein.** Les grands temps du site (hero, assemblage, chapitres, seuil,
atelier, configurateur, salles) font exactement `100dvh`, avec une hauteur minimale en rem, parce
que la montre y est positionnée en fraction de la hauteur visible. Un bloc de ce type qui ne fait
pas un écran plein casse la chorégraphie.

**La règle du segment unique.** La chorégraphie de l'accueil se joue en segments de défilement
contigus, un seul actif à la fois. Deux segments ne partagent jamais une borne : quand le
défilement s'arrête exactement sur une frontière, aucun déclencheur n'est actif sur sa propre
borne, donc un rattrapage écrit l'état de bord du segment le plus proche. Prévoyez toujours ce
rattrapage en ajoutant un temps.

**La règle des 44 px.** Toute cible tactile fait au moins 44 px de haut, portée à 48 px pour les
boutons et les champs. Quand la forme visible est plus petite (la pastille de pièce fait 32 px),
c'est un pseudo-élément qui étend la zone de clic, pas la pastille qui grossit.

## Elevation & Depth

Le site n'a pas d'ombres portées d'interface au sens habituel. La profondeur vient de trois
choses, dans cet ordre : l'ordre des calques, le contour en filet, et le halo lumineux du fond.

**L'ordre des calques est la loi du site.** Le fond fumé est à `z-index: -1`. Le contenu de page
(`#page`) n'a délibérément aucun `z-index`, donc aucun contexte d'empilement : tout le contenu
passe sous le canvas de la montre (z 30). C'est la règle qui explique plusieurs choix de mise en
page : la montre de la page commande se retire (`k: 0`) parce qu'elle passait devant le
récapitulatif ; le disque « Choisir » de la finale se range sous le prix parce que posé sur la
montre il passerait derrière elle ; le compteur de l'assemblage en écran étroit migre dans la
fiche de pièce plutôt que de passer derrière la montre éclatée. Un élément de page qui doit passer
devant la montre doit porter la classe `.au-dessus` (z 42), et cette exception est réservée aux
commandes d'un configurateur. Au-dessus : le rideau de transition (z 20, sous le canvas, la montre
lui passe par-dessus), le calque avant (z 40), la nav (z 50), le réhaut (z 55, au-dessus de la nav
et du menu, parce que le cadran encadre toujours), le tiroir panier (z 60) et l'intro (z 70).

**Le contour remplace l'ombre.** Une surface posée se signale par un filet intérieur
(`box-shadow: inset 0 0 0 1px`), pas par une ombre. Le survol épaissit visuellement le contour en
le faisant passer du filet fort à l'encre 2 ; la sélection le passe à 1,5 px d'acier bleui. Les
cartes elles-mêmes n'ont qu'un dégradé radial et un filet.

**Les ombres existantes sont atmosphériques, pas structurelles.** Elles sont trois : un creux
radial très diffus posé sous la montre sur fond sombre (hero, atelier, finale) et sous la montre
sur aplat d'or, sans lequel la montre flotte ; une ombre longue et sourde sous les panneaux
flottants (tiroir, détail de prix, fiche de pièce) ; et le vignettage du fond lui-même.

### Shadow Vocabulary
- **Creux sous la montre** (`radial-gradient(38% 46% at var(--ombre-x) var(--ombre-y), rgb(0 0 0 / 0.42), transparent 72%)`) :
  posé en pseudo-élément sur la section, donc sous le canvas. Son centre suit la pose de la montre.
- **Panneau flottant** (`0 24px 48px rgb(0 0 0 / 0.35)` à `0 24px 60px rgb(0 0 0 / 0.45)`) :
  uniquement pour une surface qui se détache franchement du flux, toujours cumulée avec le filet
  intérieur.
- **Tiroir** (`-1px 0 0 var(--c-filet), -40px 0 80px rgb(0 0 0 / 0.35)`) : le panier, seul
  élément qui glisse depuis un bord.
- **Guichet de date** (`inset 0 0 0 2px var(--c-sur-encre), 0 0 0 1px var(--c-encre-2)`) : le
  double contour qui creuse la fenêtre dans le cadran.

### Named Rules
**La règle du calque.** Avant de positionner un élément par-dessus la montre, vérifiez l'ordre
des calques : tout `#page` est sous le canvas. La solution par défaut n'est pas de monter
l'élément, c'est de le déplacer là où la montre n'est pas.

**La règle du contour.** Une surface ne se soulève pas, elle se cerne. Ombre portée uniquement
pour un panneau qui flotte au-dessus du flux, jamais pour un bouton, une carte ou un champ.

## Shapes

Trois rayons, chacun avec un sens précis, et un seul filet.

- **Pilule** (`999px`) : tout ce qui se touche. Boutons, pastilles de zone, puces de filtre,
  options de choix, champ de gravure, contrôle de quantité, lien d'évitement, étiquette de pièce.
- **Carte** (`16px`) : tout ce qui se pose. Cartes de la grille, cartes d'autre famille, fiche de
  pièce, récapitulatif, panneau de détail du prix, emplacement de visuel.
- **Douce** (`12px`) : rayon intermédiaire des petites surfaces rectangulaires internes, champs de
  formulaire, vignettes de ligne de panier et de récapitulatif, encart d'annulation, finitions de
  la surimpression éditoriale. Ce rayon est écrit littéralement dans les feuilles de page, il n'a
  pas de propriété personnalisée.
- **Guichet** (`2px`) : uniquement la fenêtre du compteur de panier. C'est une citation du guichet
  de date d'une montre, pas un rayon d'usage général.
- **Cercle** (`50%`) : les pastilles de teinte, les boutons de quantité, le disque « Choisir », la
  vignette qui vole vers le panier.

Le filet est toujours de 1 px (`--filet`), porté en `box-shadow: inset` pour les éléments
interactifs et en `border` pour les champs de formulaire ; il passe à 1,5 px quand il devient
l'accent d'un état choisi.

**L'hexagone** est la géométrie signature, mais il n'est jamais un `border-radius` : il est tracé
arête par arête (six segments pivotés de 60 degrés) dans l'intro, il est la facette inclinée à 60
degrés qui découvre le mot géant, il est l'arête de la dalle du rideau, et il est porté par la
montre elle-même (lunette, boîtier, favicon).

### Named Rules
**La règle des trois rayons.** Pilule pour ce qui se touche, 16 px pour ce qui se pose, 2 px pour
le guichet. Un quatrième rayon décoratif n'a pas sa place.

## Components

### Buttons
Caractère : un bouton MORION est un galet posé, franc, sans ombre et sans dégradé.
- **Shape :** pilule pleine (`999px`), hauteur minimale 48 px, remplissage horizontal de 1,5 rem,
  Albert Sans 600 à 0,9375 rem.
- **Plein :** fond encre, texte sur-encre. Au survol, le fond passe au blanc pur. C'est le bouton
  d'action principale, un seul par écran.
- **Trait :** pas de fond, un filet fort en contour intérieur, texte encre. Au survol le contour
  passe à l'encre pleine. C'est la deuxième action.
- **Sombre :** l'inverse (fond sur-encre, texte encre), réservé à la surimpression éditoriale
  claire de la collection, qui est la seule surface claire du site.
- **Actif :** `transform: scale(0.97)` sur l'appui, avec la courbe de sortie. C'est le seul
  retour tactile.
- **Désactivé :** opacité 0,45 et `pointer-events: none`.
- **Rond « Choisir » :** disque de 68 px en fond encre, sorti sous la montre choisie de la finale
  par une bascule d'opacité et d'échelle (0,6 vers 1).

### Chips
Deux familles distinctes, même grammaire de contour.
- **Puce de filtre :** pilule de 40 px, contour en filet fort, texte petit en encre 2. Cochée :
  contour de 1,5 px en acier bleui et texte en encre pleine. Aucun fond n'est ajouté.
- **Option du configurateur :** pilule de 44 px sur fond translucide (`rgb(26 24 23 / 0.72)`) avec
  flou d'arrière-plan de 10 px, parce qu'elle est posée sur la montre en mouvement. Une pastille
  de teinte ronde de 34 px la précède quand l'option est une matière ; l'écart de prix (`+1 200 €`)
  s'affiche à droite avant que le prix ne bascule.
- **Pastille de zone :** la version haute (52 px) sur deux lignes, nom de zone imprimé en Michroma
  et valeur courante en dessous, placée de part et d'autre de la montre, trois à gauche, trois à
  droite, reliée à la montre par un filet polyligne qui devient bleui quand la zone est active.

### Cards / Containers
- **Corner Style :** 16 px.
- **Background :** un dégradé radial centré haut, jamais un aplat
  (`radial-gradient(80% 70% at 50% 42%, rgb(74 67 62 / 0.55), rgb(26 24 23 / 0.6))`), pour que la
  carte contienne son propre petit cadran fumé.
- **Shadow Strategy :** aucune ombre portée. Filet intérieur au repos, contour en encre 2 au
  survol et au focus.
- **Internal Padding :** e-4 (1 rem) pour une carte de grille, e-5 (1,5 rem) pour un panneau.
- **Signature :** au survol d'une carte de la grille, la montre 3D du site vient se poser à
  l'emplacement de la vignette et le rendu fixe s'efface en fondu.

### Inputs / Fields
- **Style :** hauteur 48 px, rayon 12 px, fond posé, bordure de 1 px en filet fort, texte encre.
  Le champ de gravure fait exception : pilule, fond translucide, interlettrage de 0,06 em, parce
  qu'il montre littéralement ce qui sera gravé.
- **Hover :** la bordure passe à l'encre 2.
- **Focus :** bordure acier bleui plus un halo de 3 px du même bleu à 25 % d'opacité, et le
  contour de focus natif est désactivé sur ce cas précis seulement.
- **Erreur :** bordure et message en alerte, message sous le champ, masqué quand il est vide.
- **Focus global :** partout ailleurs, `outline: 1.5px solid` acier bleui avec un décalage de
  3 px, qui suit l'arrondi de l'élément y compris les pilules.

### Navigation
- **Style :** barre fixe, trois colonnes (liens à gauche, marque au centre comme le MORION de
  midi sur un cadran, guichet à droite), hauteur 48 px, ancrée sous le réhaut. La barre elle-même
  n'intercepte pas le pointeur, seuls ses enfants le font.
- **Marque :** Michroma à 1,0625 rem avec un interlettrage de 0,42 em compensé par une marge
  négative égale, pour que le bloc reste optiquement centré.
- **Liens :** encre 2 au repos, encre pleine au survol et pour la page courante, qui porte en
  plus un soulignement acier bleui.
- **Voile :** dès que la page défile (`html.defile`), un dégradé fumé apparaît sous la nav pour
  que le contenu ne passe plus sous les liens. Il disparaît sur les chapitres couleur et les
  blocs épinglés, où rien ne défile dessous.
- **Inversion :** sur un aplat clair (`[data-encre="sombre"]`), la nav et le réhaut redéfinissent
  localement leurs variables d'encre et s'impriment en sombre, comme sur un cadran clair.
- **Étroit :** les liens disparaissent, un bouton « Menu » ouvre un dialogue plein écran sur un
  dégradé fumé, avec les liens en Albert Sans 500 taille display et la liste des familles sous un
  filet.

### Réhaut
Le composant signature. Un SVG en position fixe le long des quatre bords de l'écran, à l'intérieur
de `--rehaut`, qui porte soixante graduations : les minutes en encre à 30 % et 1 px, les cinq en
encre à 62 % et 2 px. Un repère en acier bleui y marque la progression. Il est au-dessus de la nav
et du menu (z 55) : il encadre toujours, rien ne le recouvre. C'est le seul élément présent sur
absolument toutes les routes.

### Guichet de date (panier)
Le compteur du panier n'est pas une bulle. C'est une fenêtre rectangulaire de 32 × 26 px à rayon
de 2 px, fond encre, chiffre tabulaire en sur-encre, creusée par un double contour (2 px
intérieur en sur-encre, 1 px extérieur en encre 2). Le libellé « Écrin » l'accompagne et disparaît
en écran étroit. Quand une montre est ajoutée, une vignette ronde vole de la montre 3D jusqu'au
guichet.

### Emplacement de visuel
Tant qu'une photographie n'est pas livrée, son emplacement est dessiné, jamais laissé vide et
jamais remplacé par un gris neutre : c'est un petit cadran fumé soleillé (le motif de la maison),
au ratio final de l'image, bordé d'un filet, portant sa légende en Albert Sans 500 et le nom de
fichier attendu en Michroma espacé. Dix-sept emplacements sont déclarés ; ils s'affichent en
image dès que le fichier existe. Exception : sur un aplat de chapitre coloré, aucun placeholder
n'est affiché, parce qu'un rectangle fumé casserait l'aplat.

### Named Rules
**La règle de l'étiquette.** Toute référence porte le même bloc d'étiquette, centré, en capitales
Michroma : le nom en encre à 0,3 em d'interlettrage, la spécification en encre 2 à 0,26 em. Le
même bloc partout, imprimé comme le bas d'un cadran.

### Mouvement

Le vocabulaire de mouvement est partagé par tous les composants. Le mouvement est un échappement : il avance par crans nets, il ne rebondit jamais. Les durées et
les courbes existent en double, en CSS et en JavaScript, et cette parité est testée
(`tests/motion.test.js`) : toute modification doit être faite des deux côtés.

- **Durées :** micro 180 ms (changement de couleur ou de contour), court 300 ms (apparition,
  bascule d'état), vague 450 ms (tracé d'une arête de l'intro), moyen 800 ms (déplacement d'un
  objet 3D), long 1200 ms, voyage 1600 ms (passage d'une pose de montre à une autre), intro
  2400 ms.
- **Courbes :** sortie `cubic-bezier(0.22, 1, 0.36, 1)` / `power4.out` pour tout ce qui arrive ;
  traversée `cubic-bezier(0.76, 0, 0.24, 1)` / `power3.inOut` pour ce qui passe d'un bord à
  l'autre (le rideau) ; échappement `cubic-bezier(0.25, 1, 0.5, 1)` / `power3.out` pour les
  indexations courtes ; linéaire pour les fondus de couleur et d'opacité.
- **Rideau de transition :** une dalle de quartz de 240 × 320 vmax inclinée à 30 degrés, traversée
  en `--dur-voyage`, avec une arête lumineuse sur chaque bord. À mi-course, l'arête coupe le
  centre de l'écran à 60 degrés. La montre lui passe par-dessus, puisqu'il est sous le canvas.
- **Découpe des titres :** chaque mot est enfermé dans un masque (`.mot`, `overflow: clip`) et son
  contenu monte depuis le bas ; c'est la seule animation d'entrée de texte du site.

**La règle de l'échappement.** Uniquement power2 à power4 et le linéaire. Aucun rebond, aucun
élastique, aucune courbe personnalisée. Un rebond ferait de la montre un jouet.

**La règle du repos absolu.** La scène 3D est rendue à la demande : chaque changement d'état
appelle `invalidate()`, et rien n'est rendu au repos. Une animation en boucle permanente sur le
canvas est interdite par construction.

**La règle de la coupe franche.** En mouvement réduit (préférence système ou `?mouvement=reduit`),
rien n'est animé et rien n'est épinglé : les durées tombent à 0,01 ms, les blocs épinglés
reprennent une hauteur naturelle, la dalle du rideau ne traverse plus, les disques « Choisir »
sont déjà là, et un rendu fixe remplace la montre 3D dans les chapitres. Le contenu est intégral,
jamais dégradé : l'état réduit est une mise en page à part entière, pas une animation coupée.

## Do's and Don'ts

### Do:
- **Do** poser toute nouvelle surface sur le sol fumé (`--sol-fume`) plutôt que sur un aplat,
  pour que le cadran ne s'éteigne jamais entre deux sections.
- **Do** ancrer tout élément calé en bord d'écran sur `calc(var(--rehaut) + …)`, jamais sur le
  bord physique : le réhaut doit rester dégagé.
- **Do** réserver l'acier bleui (`{colors.bleui}`) à l'état actif, au focus et au repère du
  réhaut.
- **Do** vérifier l'ordre des calques avant de positionner quoi que ce soit près de la montre :
  tout `#page` passe sous le canvas, et la sortie par défaut est de déplacer l'élément, pas de le
  monter d'un calque.
- **Do** dimensionner une nouvelle pose de montre dans les deux tables (large et étroite), en
  fractions de l'écran et en part de la hauteur visible, et appeler `invalidate()` après tout
  changement d'état.
- **Do** donner 44 px de zone tactile minimum, en étendant la zone par un pseudo-élément quand la
  forme visible est plus petite.
- **Do** écrire toute nouvelle durée ou courbe dans `css/tokens.css` et `js/core/motion.js` à la
  fois.
- **Do** dessiner l'emplacement d'une image manquante comme un cadran fumé légendé, avec le nom de
  fichier attendu.

### Don't:
- **Don't** poser du texte secondaire (`{colors.encre-2}`) au centre du halo fumé : le contraste
  n'y est que de 3,8:1, et cette zone appartient à la montre.
- **Don't** écrire une phrase en Michroma, ni la descendre sous 0,75 rem.
- **Don't** introduire un surtitre ou un bandeau de rappel au-dessus d'un titre : la famille et la
  spécification se posent sous le nom, en ligne de spécification.
- **Don't** ajouter une deuxième couleur d'accent, ni utiliser la luminescence
  (`{colors.lume}`) en aplat : c'est un point, pas une surface.
- **Don't** donner une ombre portée à un bouton, une carte ou un champ. Le contour en filet est la
  seule élévation de ces objets.
- **Don't** inventer un quatrième rayon : pilule, 16 px, 12 px pour les petites surfaces internes,
  2 px pour le guichet seul.
- **Don't** animer en rebond ou en élastique, ni faire tourner la montre en boucle au repos.
- **Don't** faire dépendre un écran d'une animation : en mouvement réduit, tout doit être lisible
  en coupe franche, sans épinglage.
- **Don't** introduire un mode clair global. La seule surface claire du site est la surimpression
  éditoriale de la collection, et c'est une décision assumée, pas un thème.
- **Don't** ajouter une étape de compilation ou une dépendance installée : le site est en modules
  ES natifs, avec un importmap pour three 0.186 et trois scripts CDN (GSAP, ScrollTrigger, Lenis)
  portant leur empreinte d'intégrité.
