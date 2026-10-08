# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

HTML, CSS et modules ES sans build ; three.js 0.186.0 (importmap), GSAP 3.12.5 + ScrollTrigger
+ CustomEase, Lenis 1.3.17 ; serveur local `serve.py`. Aucun framework.

## Users

Prospects d'une agence web (marques de luxe, horlogers, commerces premium) qui parcourent le
portfolio sur ordinateur ou mobile pour juger si l'agence sait livrer un e-commerce de niveau
Awwwards. Dans la fiction du site : amateurs d'horlogerie sport-luxe qui composent leur montre.

## Product Purpose

MORION est une maison horlogère fictive et la vitrine e-commerce du portfolio : une boutique
complète (accueil immersif, collection, fiche produit avec configurateur 3D, panier, paiement de
démonstration, confirmation). Succès : l'effet « waw » dès le premier écran, et la preuve qu'un
vrai tunnel d'achat peut vivre dans une expérience 3D.

## Positioning

Mécanique empruntée aux meilleures références horlogères et 3D (montre qui se démonte au scroll,
intro chorégraphiée, configurateur, navigation par salles), identité inventée : aucune ne
possède de vrai panier, MORION si.

## Operating Context

Montré en rendez-vous ou partagé par lien, ouvert sur ordinateur et sur mobile. Paiement simulé,
aucune donnée réelle. Visuels photo générés par le propriétaire (Imagen 3, Flow) ; la montre est
un modèle 3D procédural temps réel.

## Capabilities and Constraints

- Sans build, sans dépendance ajoutée ; 60 images/s visées sur ordinateur dans les sections 3D,
  rendu à la demande au repos.
- Chaque emplacement d'image a un placeholder designé tant que le fichier manque.
- Textes en français, prix en euros TTC, sans tiret cadratin.

## Brand Commitments

- Nom : MORION, le quartz fumé presque noir à cristal hexagonal. Matières : céramique noire,
  facettes, reflets bruns. Univers sport-luxe moderne (acier, céramique, or, bracelets intégrés).
- Identité distincte des autres vitrines du portfolio (tableau de `portfolio/PRODUCT.md`).
- Trois familles : Prisme Chronographe 42 (lunette hexagonale à 6 vis), Monolithe 39 (coussin
  extra-plat), Abysse 41 GMT (plongée) ; quatre finitions : acier, céramique noire, or jaune,
  or rose.

## Evidence on Hand

Aucun client, aucune presse, aucun chiffre de vente, aucun témoignage : ne rien inventer de tel.
Prix et caractéristiques : `js/data/catalogue.js` (fiction assumée, mention « site de
démonstration »).

## Product Principles

1. La montre est l'interface : elle voyage, se démonte, se compose.
2. Chaque animation a une intention ; rien ne bouge au repos.
3. Crédible sans mentir : la maison est fictive, les faits ne le sont pas.
4. Le tunnel d'achat est aussi soigné que l'accueil.

## Accessibility & Inclusion

`prefers-reduced-motion` respecté (ni scrub, ni voyage, ni intro animée), contrastes AA,
navigation clavier complète (configurateur, salles, tiroir), formulaires étiquetés, contenu
essentiel lisible sans JavaScript.
