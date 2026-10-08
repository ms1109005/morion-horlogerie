# MORION : rapport final

Site terminé pendant la nuit du 19 au 20 septembre 2026, en autonomie, des jalons 2 à 7.
Le jalon 1 (socle et montre 3D) avait été validé avant.

Ce document dit ce qui a été fait, ce qui a été décidé à votre place, ce qui a été contourné,
ce qui reste ouvert, et ce que vous avez à faire aujourd'hui, dans l'ordre.

---

## 1. Où en est le site

Le site est complet et navigable de bout en bout : accueil en sept temps, collection en salles
3D et en grille filtrable, fiche produit avec configurateur et panier, tunnel de commande en
trois étapes, page de confirmation avec écrin. Toutes les pages tiennent à 1440 et à 390, en
mouvement normal et en mouvement réduit.

**Mise à jour du 20 septembre, après-midi :** les seize visuels ont été générés (Antigravity et
Flow), déposés dans `img/` et `video/`, et vérifiés dans le site à 1440 et à 390 (captures
`docs/validation/jalon-7/`). Plus aucun placeholder n'est visible. La vidéo de l'atelier a été
raccordée en boucle et ne joue pas en mouvement réduit (décision D26).

**Mise à jour du 21 septembre :** passe UI/UX sur tout le site, menée par trois revues de
finition en parallèle (accueil, collection et fiche, tunnel). Deux défauts structurels corrigés
(collisions de noms de classe entre feuilles de pages, plateau d'options qui mordait sur le prix
de 900 à 1400 px), une vingtaine de correctifs de finition, un garde-fou de syntaxe ajouté aux
tests (60 au total). Le fond passe du brun-gris à un **acier fumé** accordé au boîtier et au
cadran bleu, et un lien « Accueil » entre dans la navigation. Détail : décisions D28 à D30.

**Contraintes tenues :** aucun commit, aucune génération payante, aucune dépendance ajoutée,
aucune étape de compilation. Le site se sert en fichiers statiques : modules ES natifs,
`importmap` pour three.js 0.186, GSAP et Lenis en CDN avec empreintes SRI. Rien n'a été déposé
à la racine de `anti-stitch`. Les sources brutes sont dans `_sources/`.

---

## 2. Ce qui a été fait, jalon par jalon

### Jalon 2 : direction artistique et coquille

Choix de la direction **B, « Cadran fumé »** sur deux planches comparées (décision D1) : la page
entière est un cadran, fond en dégradé radial brun-gris avec un soleillé discret, réhaut de
soixante minutes le long du bord de l'écran dont l'index bleu suit le défilement, navigation
imprimée comme un cadran, panier en guichet de date.

Livré : les jetons de design (`css/tokens.css`), le vocabulaire de mouvement (`js/core/motion.js`,
l'échappement), la coquille HTML avec sa scène three.js persistante, le routeur en History API,
l'intro de 2,6 secondes bornée par le vrai chargement, la navigation, le menu, le tiroir du
panier, et le système de visuels avec placeholders.

Deux tours de revue, huit correctifs. 39 tests verts, décalage cumulé de mise en page nul,
transition à 57 images par seconde.

### Jalon 3 : fiche produit, configurateur, panier

Panier persistant complet (ajout, fusion, quantité, suppression avec annulation), configurateur
branché en direct sur la montre 3D, prix animé qui annonce l'écart de l'option avant de basculer,
gravure réelle sur la glace du fond, partage de configuration par URL, et sous le pli : éclaté
épinglé à 60 images par seconde, galerie, matière, fiche technique, service, autres familles.

Douze vignettes WebP sont dérivées automatiquement des rendus 3D (`outils/rendus.py`) et servent
partout où la 3D n'est pas là : grille, panier, récapitulatif de commande, chapitres en mouvement
réduit.

Deux tours de revue, huit correctifs appliqués.

### Jalon 4 : collection

Deux entrées pour la même collection. **Les salles** : un monde 3D en trois décors, un par
famille, traversé au défilement (hall en quartz fumé, arches du Prisme, monolithes taillés,
lunettes en céramique et lumière d'eau de l'Abysse). **La grille** : filtres par famille,
matière, diamètre et tranche de prix, reflétés dans l'URL, avec un état vide qui propose de
retirer un seul filtre plutôt que de tout réinitialiser.

Voyage mesuré à 56 images par seconde, p95 à 19 ms, sans accroc : les shaders et les textures de
tout le monde sont compilés et envoyés au GPU dès la construction (décision D9). Sans cela, la
première arrivée dans l'Abysse figeait l'image jusqu'à 565 ms.

Deux tours de revue, sept correctifs.

### Jalon 5 : l'accueil

Le film de la maison en sept temps, porté par **une seule montre** qui traverse les cinq premiers
sans jamais se recharger : hero (elle passe derrière le mot MORION géant, découvert par une
facette à 60°), assemblage épinglé (elle se démonte en cinquante-neuf pièces, chaque pièce
nommée par une étiquette projetée depuis la 3D, cliquable), quatre chapitres couleur (aplats qui
basculent net, la montre fait un tour et change de matière au passage du profil), seuil (un
couloir d'arches hexagonales, elle part au point de fuite), atelier express (trois gestes, la
montre change sous vos yeux), finale (quatre Prisme devant le mot PRISME).

Mesuré aujourd'hui sur toute la descente : 56 images par seconde, p95 à 18 ms, zéro rendu au
repos. Deux tours de revue, huit correctifs.

### Jalon 6 : commande et confirmation

Tunnel en trois étapes repliables (coordonnées, livraison, paiement) avec récapitulatif fixe,
erreurs annoncées sous le champ et focus porté sur le premier champ fautif, formatage du numéro
de carte et de la date, retrait au salon en alternative à la livraison, virement en alternative
à la carte. Paiement simulé d'une seconde et demie pendant laquelle le réhaut fait un tour.
La confirmation ouvre un écrin hexagonal laqué sur la montre commandée.

Aucune donnée de carte n'est conservée : la commande garde les quatre derniers chiffres et rien
d'autre, en `sessionStorage`. Un bandeau « Démonstration : aucun paiement réel » est permanent
sur les deux pages.

Deux tours de revue, huit correctifs.

### Jalon 7 : finitions et livraison

Les quarante-cinq rendus de référence et les douze vignettes ont été réexportés après le
correctif du bracelet, l'image de partage et la vignette du hub ont été refaites depuis le site
corrigé, MORION est entré dans `portfolio/PRODUCT.md` et dans le hub du portfolio
(`herosite/site/realisations/`), les deux captures en attente du jalon 3 ont été reprises, et la
qualité a été repassée sur toutes les routes aux deux tailles.

---

## 3. Décisions prises à votre place

Les vingt-cinq décisions sont détaillées dans `docs/decisions.md`. Les six qui engagent vraiment
le site :

| | Décision | Pourquoi |
|---|---|---|
| **D1** | Direction B « Cadran fumé » plutôt que A « Écrin » | Le fond est littéralement le cadran fumé des montres ; la 3D en métal poli se lit mieux sur un fond moyen qui s'assombrit vers les bords. De A on garde le mot « écrin » pour le panier et l'écrin 3D de la confirmation. |
| **D6** | `DESIGN.md` écrit au jalon 7, pas à chaque jalon | Écrit plus tôt, il aurait décrit des pages d'attente. |
| **D9** | Précompilation des shaders et préchargement des textures | Sans elle, la première arrivée dans une salle figeait l'image de 200 à 565 ms. |
| **D12** | Quatre montres préconstruites servent les chapitres, le seuil et la finale | Reconstruire la montre du directeur à chaque changement de matière coûtait de 167 à 217 ms au premier passage. |
| **D15** | Sur la commande, la montre 3D se retire au profit des vignettes | Tout `#page` passe sous le canvas : la montre en 3D passait devant le récapitulatif. |
| **D20** | Maillons du bracelet remodelés à leur vraie largeur | Le maillon était dessiné sur une forme de largeur 1 puis mis à l'échelle ; le chanfrein était étiré d'autant, chaque maillon dépassait de 80 % sa largeur et chevauchait son voisin. C'est ce qui donnait l'arête en escalier que la revue voyait depuis le jalon 4. |

---

## 4. Blocages contournés

- **La revue de finition du jalon 6 n'a jamais rendu son verdict final.** L'agent s'est arrêté
  sur une limite de session de l'API après l'envoi du paquet corrigé. Les deux tours prévus
  avaient eu lieu et leurs huit correctifs étaient appliqués : le jalon a été clos sans
  troisième verdict, conformément à la règle « deux tours au maximum » (décision D25).
- **Deux tours seulement au jalon 3 également**, le budget de revue étant atteint ; les restes
  ont été corrigés sans troisième tour, et les deux captures concernées ont été reprises
  aujourd'hui.
- **Un trou dans la chorégraphie de l'accueil** (décision D24) : le bloc de composition de
  l'atelier fait exactement un écran, si bien que deux bornes de segments tombaient au même
  défilement et que la tenue de la montre avait une longueur nulle. Un défilement qui s'arrêtait
  pile là laissait la montre du temps précédent à l'écran. Les bornes ont été décalées et un
  rattrapage écrit désormais l'état de bord du segment le plus proche.
- **`sed -i` bloque sur certains fichiers** dans cet environnement : les modifications passent
  par l'édition directe ou par Python.

---

## 5. Limites connues

- **Résolution des visuels générés** : 896×1200 pour les poignets et l'atelier, 1024² pour les
  matières, 1200×896 pour le salon. Suffisant à l'écran, un peu doux sur un affichage très haute
  densité. Les deux petites photos de l'atelier (loupe, réglage) montrent des mains, ce qui est
  voulu ; la vidéo, elle, ne montre personne.
- **L'arche du hall de la collection est peu lisible à 390** (relevé au jalon 4, décision D10).
  Elle n'a pas été reprise : la caméra recule déjà sur écran étroit et la resserrer davantage
  aurait déséquilibré les trois salles.
- **Le réhaut de soixante minutes est présent mais inerte** hors du paiement, alors que la page
  se présente comme un cadran. La dernière revue le relève comme une ressource non exploitée.
- **Le couloir du seuil est en filets gris uniformes**, sans la matière ni la poussière des
  salles. Même remarque de la revue, non traitée.
- **Le site n'est pas commité.** Aucun commit n'a été fait, comme demandé.

---

## 6. Mesures

| Page ou moment | Images par seconde | p95 | Au repos |
|---|---|---|---|
| Transition entre pages (jalon 2) | 57 | 18 ms | 0 rendu |
| Éclaté épinglé de la fiche (jalon 3) | 60 | | 0 rendu |
| Voyage dans les salles (jalon 4) | 56 | 19 ms | 0 rendu après 8 s |
| Descente complète de l'accueil (jalon 5, remesurée aujourd'hui) | 56 | 18,4 ms, pointe à 36 ms | 0 rendu |
| Ouverture de l'écrin, confirmation (jalon 6) | 60 | 17 ms | 0 rendu |

Intro : 2,6 s, bornée par le vrai chargement. Décalage cumulé de mise en page : 0.
Mouvement réduit : coupe franche partout, aucun épinglage, aucun défilement lié.
Console : vide sur toutes les routes, aux deux tailles.
Tests : 59 verts (`node --test tests/*.test.js`).

---

## 7. Ce que vous avez à faire, dans l'ordre

1. ~~Générer les seize visuels.~~ **Fait.** Ouvrez `docs/IMAGES.md` : chaque emplacement a son nom de
   fichier exact, son ratio, son prompt anglais complet prêt à coller, et les rendus 3D de
   référence à joindre (dans `_sources/rendus-3d/`). Rappel des règles déjà incluses dans les
   prompts : aucun visage, aucun texte lisible, aucune marque, **aucun alcool**.
2. **Déposer les fichiers dans `img/`** (ou `video/` pour la boucle d'atelier) sous le nom exact
   du tableau. L'extension est libre : `.jpg`, `.png`, `.webp`, `.avif`, `.mp4`, `.webm`.
3. **Recharger une page du site.** `serve.py` régénère tout seul la liste des visuels présents
   et le placeholder laisse place à l'image. Sans serveur : `python outils/visuels.py`.
4. **Alléger les images** avant mise en ligne : `python outils/visuels.py --optimiser` les
   convertit en WebP 2000 px et range les originaux dans `_sources/visuels-originaux/`.
5. **Regarder le site en entier**, à 1440 et à 390, avec les images en place. Les trois endroits
   à surveiller en priorité, parce que ce sont eux qui changent le plus une fois les
   photographies posées : le bloc « À l'établi » de l'accueil, la galerie de la fiche produit,
   et le visuel du retrait au salon dans le tunnel de commande.
6. **Lire `DESIGN.md`** (système de design dérivé du site livré) et `docs/decisions.md` (les
   vingt-cinq décisions, avec leur raison) si un choix vous surprend.
7. **Commiter**, si le résultat vous va. Rien n'a été commité.
8. **Facultatif :** si vous voulez traiter les trois limites de la partie 5 (arche du hall à 390,
   réhaut inerte, couloir sans matière), c'est le premier chantier d'une suite.

---

## 8. Repères utiles

- Serveur local : `python serve.py` dans `portfolio/morion-horlogerie/` (port 8781). Il régénère
  la liste des visuels présents à chaque chargement de page et reçoit les exports du studio.
- Tests : `node --test tests/*.test.js` depuis le dossier du site.
- Rendus 3D : `studio.html?export=rendus` exporte les quarante-cinq PNG détourés dans
  `_sources/rendus-3d/`, puis `python outils/rendus.py` en tire les douze vignettes WebP.
  À relancer si vous touchez au générateur de montre.
- Captures de validation : `docs/validation/jalon-2/` à `jalon-6/`, à 1440 et à 390.
- Plans d'implémentation : `docs/plan-jalon-2.md` à `plan-jalon-7.md`, toutes les cases cochées.
- Suivi : `docs/PROGRESSION.md`.
- Hub du portfolio : `herosite/site/realisations/index.html`, régénéré par
  `python site-src/build.py` depuis `herosite/`.
