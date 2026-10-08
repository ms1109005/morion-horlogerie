# MORION : décisions prises en autonomie

Le user dort et a demandé (2026-09-19) d'enchaîner les jalons 2 à 7 sans question. Chaque
décision qu'il aurait prise est notée ici avec sa raison ; les blocages contournés aussi.

## D1. Direction artistique : B « Cadran fumé » (jalon 2, tâche 3)

Planches : `_sources/directions/direction-a-1440.png`, `-a-390.png`, `-b-1440.png`, `-b-390.png`.

**Choix : B, « Cadran fumé ».** La page entière est un cadran fumé : fond en dégradé radial
brun-gris vers le presque noir, centré sur la montre, avec un soleillé très discret (le motif des
cadrans soleillés) ; un réhaut de 60 minutes court le long du bord de l'écran et son index bleu
suit le défilement ; la navigation est imprimée comme un cadran (MORION à midi), le panier est un
guichet de date ; MORION en Michroma géant passe derrière la montre (comme le hero de 60fps).

Raisons :
- **Fidélité à MORION** : le fond est littéralement le cadran « fumé » de nos montres, donc le
  quartz fumé ; le réhaut et les index viennent du monde sport-luxe (chronographes des années
  70) ; les facettes hexagonales restent portées par la montre, l'intro et le rideau.
- **La 3D ressort mieux** : le métal poli se lit sur un fond moyen qui s'assombrit vers les
  bords (vignettage façon Cartier) ; sur la planche A, vue d'en haut, le bracelet écrasait la
  tête et l'écrin gris faisait catalogue.
- **Signature propre** : réhaut animé, guichet de date, Michroma (la capitale large des cadrans
  de chronographe). Aucun autre site du portfolio n'a ce fond ni cet accent.
- **Accessibilité** : encre `#eceae6` sur fumé, contraste AA largement tenu ; accent acier
  bleui `#6d83ff` réservé aux états actifs et au repère du réhaut.

**Écartée : A « Écrin »** (couvercle laqué noir, doublure en suède gris clair, coussin
hexagonal, surpiqûres) : belle idée rituelle, mais plus « emballage » que sport-luxe, et la
montre vue de dessus y perd sa présence. On garde d'elle le mot « écrin » pour le panier et
l'écrin 3D de la confirmation.

Rehaussements tirés des challengers du tirage impeccable (clé `87aada4e`) :
- *Instruments de vol de nuit* : chaque compteur montre sa tendance ; le prix du configurateur
  affiche l'écart de l'option (+1 200 €) avant de basculer.
- *Affiche noire en deux encres* : une seule source de lumière pour tout le site ; la lumière
  principale de la 3D vient d'en haut à droite, comme le centre du soleillé et les ombres de
  l'interface.
- *Menu collage* : un choix est un événement franc ; les chapitres couleur basculent net,
  l'option choisie change d'état instantanément.
- *Boîtes de baskets* : chaque référence porte le même bloc d'étiquette strict (famille,
  finition, calibre), imprimé comme le bas d'un cadran.
- *Calendrier de saumure* : l'avancement est toujours visible comme un compteur de cadran
  (pièce 14 sur 41, étape 2 sur 3).
- *Rendu ASCII* : une grille stricte ; les 12 colonnes de la mise en page sont les 12 index
  horaires du réhaut.

## Décisions techniques

- **D2.** Les images absentes ne sont jamais demandées : `js/data/visuels-presents.js` est
  régénéré par `outils/visuels.py` (relancé par `serve.py` à chaque chargement de page).
  Extensions acceptées : jpg, jpeg, png, webp, avif ; mp4, webm.
- **D4.** CustomEase retiré : l'échelle de mouvement n'utilise que `power2` à `power4` et
  `none` (relevé des références : aucun rebond). Trois scripts CDN au lieu de quatre.
- **D5.** Intro : 2,6 s mesurées au lieu de 2,4 s. Le compteur suit le vrai chargement
  (environnement 3D, 6 textures, montre, shaders : environ 2 s sur ce poste avec un serveur sans
  cache) ; la chorégraphie est calée pour 2,4 s quand le chargement est plus court. Le tracé de
  l'hexagone est une animation CSS de `transform` (jouée par le compositeur pendant la
  construction de la montre). Les lettres se révèlent pendant le chargement.
- **D6.** `DESIGN.md` écrit au jalon 7 par `impeccable-documenter`, sur le site fini, plutôt
  qu'à chaque jalon (il décrirait des pages d'attente).
- **D7.** Éclairage du site (pas du studio) : lumière principale 0,6, exposition 0,95,
  environnement 0,85, et une variante de matière pour le bracelet (reflet 0,5, rugosité 0,2 /
  0,55) : l'acier poli brûlait au blanc sur le fond fumé (revue de finition).
- **D3.** Rendus de référence : 45 PNG (12 références de face et de trois-quarts ; acier et or
  rose de profil, de dos et éclatés ; 3 alignements de 4 finitions). La vue de dos est décalée
  de 20° : de face, le reflet du softbox brûlait le fond saphir.
- **D8.** Collection, écran étroit : la caméra recule (× 1,85), donc les décors se resserrent
  autour de la montre (arches du Prisme r 170 au lieu de 360, lunettes de l'Abysse calculées
  pour 390) au lieu de sortir du champ. Les lunettes sont centrées sur l'axe caméra → montre,
  rayons bornés pour ne toucher ni le mot-symbole ni la nav.
- **D9.** Salles : shaders et textures de tout le monde compilés et envoyés au GPU dès la
  construction (`compileAsync` puis `initTexture` une par image). Sans cela, la première
  arrivée dans l'Abysse figeait l'image 200 à 565 ms.
- **D10.** Revue du jalon 4 : deux tours (« recapture » puis « fix », 7 correctifs appliqués sans
  3e tour). Plafond non traité : arche du hall peu lisible à 390, bracelets métal en maillons
  bas-poly (hérités du générateur du jalon 1, qu'on ne réécrit pas).
- **D11.** Accueil, chapitres couleur : la vignette « matière » (visuels bonus 10 à 13) ne
  s'affiche que si le fichier est présent, sans placeholder : sur un aplat d'or, un
  placeholder fumé casserait le chapitre, et la montre 3D porte déjà la matière.
- **D12.** Accueil : les 4 Prisme de la finale (`stage/vitrine.js`, construits au repos et
  précompilés) servent aussi aux chapitres et au seuil. La matière change par échange de
  visibilité au passage du profil : reconstruire la montre du directeur coûtait 25 à 30 ms
  (accrocs de 167 à 217 ms au premier passage). Chapitres et seuil : 60 i/s, p95 17 ms.
- **D13.** Hero épinglé (+90 %) : sans épinglage, le mot « MORION » quittait l'écran avant que la
  montre ne passe derrière. Le mot plein est une copie dans `#avant` (au-dessus du canvas),
  découverte par une facette à 60° ; à 390 le texte du hero reste visible (le mot vertical ne
  le croise pas).
- **D14.** Céramique : aplat du chapitre `#070708` au lieu de `#141415`, qui se confondait avec
  le fond de page `#121213`.
- **D15.** Commande : la montre du site se retire (pose `commande` avec `k: 0`). À sa place, le
  récapitulatif montre les vignettes rendues de chaque ligne : sur cette page, la montre en 3D
  passait devant le récapitulatif (le canvas est au-dessus de `#page`).
- **D16.** Paiement de démonstration : les champs de carte portent `autocomplete="off"` et la
  page affiche la carte de test 4242 4242 4242 4242 ; aucune donnée n'est transmise ni conservée,
  la commande ne garde que les 4 derniers chiffres (`store/commande.js`). Le bandeau
  « Démonstration : aucun paiement réel » est permanent sur les deux pages.
- **D17.** Sur la commande et la confirmation, le bandeau de démonstration est collant en haut :
  posé en bas (comme sur les autres pages), il couvrait les champs du formulaire.
- **D18.** Écran étroit : le récapitulatif est replié sur une ligne (« 1 montre · 40 600 € ») avec
  « Voir le détail » ; déplié, il occupait tout le premier écran avant le formulaire.
- **D19.** Confirmation : l'écrin est construit autour de la pose `merci` (boîte hexagonale
  laquée, velours fumé, couvercle à charnière). Rayons et pose distincts en écran étroit, sinon
  la boîte dépassait l'écran et couvrait le titre.
- **D20.** Bracelet métal : le maillon était dessiné sur une forme de largeur 1 puis mis à
  l'échelle (x8 environ). Le chanfrein d'`ExtrudeGeometry`, qui s'ajoute dans le plan de la
  forme, était étiré d'autant : chaque maillon dépassait de 80 % sa largeur voulue, chevauchait
  son voisin et l'arête se lisait en escalier. Le maillon est désormais modelé à sa vraie
  largeur (l'échelle par instance reste entre 0,8 et 1), le pas passe de 5,4 à 4,3 mm et le
  chanfrein à 3 segments. Correctif 1 de la revue du jalon 5. Les 45 rendus de `_sources/` et
  les 12 vignettes WebP ont été réexportés dans la foulée.
- **D21.** Accueil, fond sombre : une ombre radiale sourde est posée sous la montre dans le
  hero, l'atelier et la finale (`--ombre-x` / `--ombre-y` suivent la pose). C'est le geste déjà
  utilisé sur les aplats d'or ; sans lui la montre flottait sur le fumé. Correctif 8 de la revue.
- **D22.** Finale : les quatre Prisme passent à 48 vh de haut et le contenu est calé en bas de
  section (`align-content: end`). La bande morte avant le pied tombe de 242 à 102 px, et le vide
  restant remonte au-dessus du titre, là où le mot géant l'occupe. Correctif 5 de la revue.
  Le disque « Choisir » reste sous le prix : posé sur la montre il passerait derrière elle
  (tout `#page` est sous le canvas), posé sur le nom il le couvrirait.
- **D23.** Assemblage en écran étroit : quand une fiche de pièce est ouverte, le compteur
  « Pièce N sur 59 » est déplacé dans la fiche (en-tête) plutôt que laissé en place. Remonté
  sous le titre, comme le suggérait la revue, il passait derrière la montre éclatée.
  Correctif 6 de la revue.
- **D24.** Accueil : le bloc de composition de l'atelier fait exactement un écran, si bien que
  « bloc top top » et « photos top bottom » tombaient au même défilement : la tenue de la montre
  avait une longueur nulle. Les bornes sont décalées (tenue jusqu'aux photos à mi-écran) et un
  rattrapage écrit l'état de bord du segment le plus proche quand le défilement s'arrête pile
  sur une borne (aucun ScrollTrigger n'est actif sur sa propre borne). Sans cela la montre du
  temps précédent restait à l'écran.
- **D25.** Blocage : la passe de verdict du jalon 6 (3e échange avec `impeccable-finish-reviewer`
  après application des 8 correctifs) n'est jamais revenue, l'agent s'est arrêté sur une limite
  de session de l'API. Les deux tours prévus ayant eu lieu (« recapture » puis « fix ») et les
  correctifs étant appliqués, le jalon est clos sans troisième verdict, conformément à la règle
  « 2 tours max ». Les 13 captures ont été reprises sur la version corrigée après le correctif
  du bracelet (D20), qui change les vignettes du récapitulatif et la montre de l'écrin.
- **D26.** Visuels déposés par l'utilisateur (16 sur 16). Deux retouches à l'intégration :
  la vidéo de l'atelier (10 s, avec une piste audio, dernière image à 15/255 de la première)
  est raccordée par un fondu de 1,5 s (`ffmpeg xfade`, écart au raccord ramené à 1,7/255, 8,5 s,
  sans audio, 2,7 Mo) ; l'original est gardé dans `_sources/videos-depart/`. Et `visuel()` ne
  lance plus aucune vidéo en mouvement réduit : elle reste sur sa première image (`#t=0.1`),
  ce que la revue d'accessibilité aurait relevé (la lecture automatique jouait en mode réduit).
- **D27.** Configurateur, plateau d'options : deux vrais défauts, l'un dans le CSS, l'autre dans
  la façon de présenter un choix.
  1. **Collision de noms.** `.choix` désignait à la fois les rangées d'options du configurateur
     (`css/pages/montre.css`) et les cartes de mode du tunnel (`css/pages/commande.css`), chargé
     après. La grille à deux colonnes du tunnel écrasait donc la rangée du configurateur sur
     toutes les pages : six couleurs tombaient en trois rangées, le plateau montait à 310 px et
     recouvrait la montre ainsi que les ancres Cadran et Gravure. Le conteneur du tunnel est
     renommé `.cartes` (les enfants `.choix__carte` gardent leur nom).
  2. **Nuancier.** Un groupe dont aucun choix ne change le prix (couleur du cadran, coloris du
     bracelet) se réduit à une rangée de nuances sur une seule surface ; le nom du choix actif
     passe dans la légende, en ligne de spécification. Le nom reste dans le document pour nommer
     le bouton radio, la zone tactile reste à 44 px autour d'une nuance de 34 px. Les groupes qui
     portent un prix (matière, motif, aiguilles, bracelet) gardent leur nom visible.
  3. « inclus » n'est plus écrit sur chaque pastille gratuite : seuls les écarts non nuls
     s'affichent. Six « inclus » dans une rangée de couleurs étaient du bruit, pas une
     information.
  Résultat mesuré : plateau de 310 à 150 px, plus aucun chevauchement avec les ancres, nuancier
  en une rangée à 1440 comme à 390.
- **D28.** Passe UI/UX sur tout le site (trois revues `impeccable-finish-reviewer` en parallèle :
  accueil, collection et fiche, tunnel). Deux défauts de fond, invisibles à l'œil mais
  structurels, et une vingtaine de correctifs de finition.
  1. **Collisions de noms de classe entre feuilles de pages.** `.choix` était porté par le
     configurateur et par le tunnel, `.cartes` par la grille de la collection et (après mon
     premier renommage) par le tunnel. L'ordre de chargement écrit dans `index.html` fait gagner
     la dernière feuille : la grille perdait la moitié de ses colonnes et le plateau d'options
     tombait en trois rangées. Le tunnel a désormais son espace de noms `.modes*`, et un contrôle
     automatique des collisions a été passé sur les cinq feuilles de pages.
  2. **Le plateau d'options mordait sur le bloc d'achat de 900 à 1400 px** (21 px mesurés à
     1280, une résolution d'ordinateur portable courante) : sa largeur en `44vw` ignorait la
     place prise par le prix. Elle est désormais calculée à partir de cette place.
  3. **Un module cassé fait tomber la page sur « Page introuvable » sans bruit** : le routeur
     avale l'échec d'import. Une apostrophe mal échappée dans `checkout.js` a suffi. Ajout de
     `tests/syntaxe.test.js`, qui analyse les 54 modules de `js/` (60 tests au total).
  4. Correctifs de finition : acier bleui rendu à l'état choisi dans le tunnel (il marquait le
     focus et le blanc marquait le choix, l'inverse de tout le reste du site) ; bordures de
     champ remontées à 3:1 ; champ invalide qui ne vire plus au violet quand il a le focus ;
     panier plus jamais vidé si la commande n'a pas pu être écrite ; étape annoncée et focus
     porté sur son titre au lieu d'un radio invisible ; avertissement de démonstration dit deux
     fois au lieu de quatre ; confirmation sans 3D qui ne laisse plus une colonne vide ;
     menu de tri habillé ; « Réinitialiser » masqué tant qu'aucun filtre n'est posé ; macro de
     matière portée à sept colonnes ; entête collante et référence dans la fiche technique ;
     filet du boîtier qui ne traverse plus la montre ; choix actif amené dans le champ à 390 et
     rangées fondues au bord du réhaut ; étiquettes de l'éclaté réparties sur l'ordre réel à
     l'écran ; minutes du réhaut portées à 0,44 d'alpha et 7 px ; soulignement du lien rendu
     visible sur les aplats d'or ; pose de l'atelier remontée à 390 ; couture du sol fumé
     estompée ; pilules du hero égalisées à 390 ; disque « Choisir » visible au repos ;
     zones tactiles du pied et du dépliant de prix portées à 44 px ; règles du pied de page
     déplacées de `introuvable.css` vers `shell.css`, où vit la coquille.
- **D29.** Fond du site, à la demande de l'utilisateur : le fumé brun-gris devient un **acier
  fumé** (`--c-fume-c #3c424c`, `--c-fond #111316`), accordé au boîtier acier et au cadran bleu
  nuit plutôt qu'au seul nom de la marque. Le centre du halo est volontairement plus sombre que
  l'aplat du chapitre acier (`#5d6670`), sinon ce chapitre cessait de se lire comme une bascule.
  Effet mesuré : le texte secondaire au centre du fumé remonte de 3,80 à 3,96:1, tous les autres
  contrastes sont conservés. Les valeurs codées en dur qui dérivaient de l'ancien fond ont suivi.
  La variante brune est gardée dans `_sources/tokens-fume-brun.css`.
- **D30.** Un lien « Accueil » est ajouté à la navigation et au pied de page : il n'existait que
  dans le menu des écrans étroits, le mot-symbole étant le seul chemin de retour sur ordinateur.
- **D31.** Le mot « Écrin » de la navigation est remplacé par une icône de panier, à la demande
  de l'utilisateur. L'icône est **dessinée** (SVG en ligne, trait de 1,5 px à bouts ronds, comme
  les chevrons et le réhaut) : le site n'a pas de fonte d'icônes et n'en charge pas une pour un
  seul signe. Le mot reste le nom accessible du bouton (« Écrin, 3 articles »), le guichet de
  date garde son chiffre, et le tiroir garde son titre « Votre écrin » : la marque ne perd rien,
  seul l'encombrement de la nav diminue, ce qui profite surtout au 390 face au bouton « Menu ».
- **D32.** Galerie « Au poignet » de la fiche : la vidéo passe du bout de la rangée au milieu,
  entre les deux photographies. En dernière position elle se lisait comme une pièce rapportée ;
  au centre, et décalée vers le haut par la grille existante, elle tient le rythme de la galerie.
- **D33.** Mémoire sur téléphone. Safari iOS fermait l'accueil en cours de défilement (« Un
  problème est survenu à plusieurs reprises ») : mesurée à 390 px, la page montait à cinq
  montres, ~290 Mo de textures et 503 000 triangles par image à la finale. Corrections :
  - écran étroit sans **vitrine** : chapitres et seuil passent par la montre du directeur (qui
    change de matière), la finale montre les rendus `img/rendus/mor-pr42-*.webp` ;
  - **impressions** (cadran, réhaut, lunette 24 h) en 1024 px sous 720 px de large au lieu de
    2048 (`IMPRESSION` dans `textures.js`) : le cadran y mesure ~200 px à l'écran ;
  - **fuites** : matières du réhaut, de la date et de la gravure du calibre partagées au lieu
    d'être recréées (une texture 2048² de plus à chaque changement de cadran, une 1024² par
    montre construite) ; les marquages ne sont plus dessinés quand leur matière est en cache ;
  - **changement de page** : les textures qu'aucun objet de la scène n'utilise sont rendues au
    GPU (`libererGPU`, appelé par le routeur entre démontage et montage) ;
  - la **dalle du rideau** (240 × 320 vmax) n'existe plus hors transition (calque permanent).
  Résultat à 390 px : une montre, ~55 Mo de textures, 79 000 triangles ; le nombre de textures
  ne croît plus en changeant de cadran ni de page.
- **D34.** Publication : `outils/publier.py` prépare `_publie/` (index, 404, `_redirects`, css,
  js, img, video : 14 Mo) et Netlify publie ce dossier (`netlify.toml`) ; `_sources/`, `docs/`
  et `tests/` restent hors ligne. `_redirects` sert toute route par `index.html` en 200 (une
  route profonde répondait par la copie `404.html`, statut 404). Photographies converties en
  WebP par `outils/visuels.py --optimiser` (7,3 Mo → 0,9 Mo, originaux dans
  `_sources/visuels-originaux/`) ; vidéos 720p dans `video/mobile/`, servies sous 720 px de
  large par `<source media>` (atelier 2,7 → 0,8 Mo, poignet 6,8 → 1,2 Mo).
- **D35.** Fiche : le bloc d'achat devient une **carte** (fond et filet des pastilles), prix en
  `--t-2` et « Détail du prix » sur la même ligne, actions dessous, mention en pied. Le prix flottait
  en 52 px au-dessus de quatre lignes empilées : sous 760 px de haut (portables), le bloc montait sur
  la pastille Gravure (mesuré à 1536 × 730, 1366 × 680, 1280 × 680, 1024 × 700). La carte (~148 px)
  laisse la pastille libre dès 680 px, hauteur minimale du hero. Sa largeur est une variable
  (`--achat-l`) que le plateau d'options reprend ; entre 720 et 1100 px elle s'élargit pour garder
  ses deux boutons sur une ligne, et la référence du coin bas gauche, recouverte par le plateau
  calé à gauche, s'efface comme sur mobile.
- **D36.** Chargement sur téléphone : le perlage (la plus longue des textures calculées pendant
  l'intro, ~0,3 s d'un bloc) est tiré en 512 px à motif identique (grains, anneaux et relief à
  l'échelle) : 268 → 78 ms mesurés.
