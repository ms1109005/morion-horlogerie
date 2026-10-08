# MORION, jalon 2 : direction artistique + coquille. Plan d'implémentation

> **Cases cochées après coup** (jalon 7) : elles n'ont pas été tenues à jour pendant
> l'exécution. Elles ont été cochées sur vérification des livrables sur disque (fichiers,
> fonctions, rendus, captures, tests). L'état de référence reste `docs/PROGRESSION.md`
> et `docs/decisions.md`.

> **Pour l'exécutant :** exécuter tâche par tâche (superpowers:executing-plans). Cases `- [x]`
> pour le suivi. Pas de commit sans demande explicite du user. **Deux arrêts obligatoires :**
> fin de la tâche 3 (le user choisit entre 2 directions) et fin de la tâche 12 (le user valide
> le jalon avant le jalon 3).

**But :** fixer l'identité de MORION (palette, fontes, jetons, échelle de mouvement) et livrer
la coquille de l'application monopage : nav, routeur History API avec transitions, intro, tiroir
panier vide, scène 3D persistante rendue à la demande.

**Architecture :** un seul `index.html` (copié en `404.html`), modules ES sans build. Un seul
`gsap.ticker` pilote d'abord Lenis puis la scène three.js : une boucle, jamais deux
`requestAnimationFrame`. Le routeur monte des pages modules dans deux calques, `#page` sous le
canvas et `#avant` au-dessus. Un « directeur » donne à la montre une pose par route et la fait
voyager au-dessus du rideau pendant les transitions. La logique pure (routes, chargement,
panier, jetons, HTML) est testée sous `node --test`.

**Technos :** three.js 0.186.0 (importmap jsdelivr), GSAP 3.12.5 + ScrollTrigger + CustomEase
(cdnjs, SRI), Lenis 1.3.17 (SRI), Google Fonts, `node --test`, Chrome DevTools MCP.

**Spec :** `docs/spec.md` (§2 marque, §4 routes, §5 intro et panier, §6 technique, §7 visuels).
Mesures des références : `docs/references-mouvement.md` (tâche 1).

## Contraintes globales

- Dossier : `portfolio/morion-horlogerie/`. Rien à la racine d'`anti-stitch/`. Sources brutes
  (planches de direction, rendus exportés) dans `_sources/`.
- Pas de framework, pas d'étape de build, pas de `node_modules`.
- three.js : `https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.js` et
  `.../three@0.186.0/examples/jsm/` (importmap). GSAP 3.12.5 et Lenis 1.3.17 en scripts
  classiques `defer` avec `integrity` + `crossorigin="anonymous"`.
- Le générateur du jalon 1 (`js/watch/*`) n'est pas réécrit. `js/stage/renderer.js` est enrichi
  par options rétrocompatibles : `studio.html` doit fonctionner à l'identique.
- Textes en français, sans tiret cadratin. Aucun faux témoignage, fausse presse ou faux chiffre.
  Aucun alcool dans les textes ni les prompts d'images.
- Aucune génération payante. Les images (Imagen 3) et vidéos (Flow) sont générées par le user.
- Serveur : `python serve.py`, port 8781. Jamais `python -m http.server`.
- Chrome DevTools MCP : `select_page` avec `bringToFront: true` avant toute mesure d'images/s
  (sinon rAF bridé à ~1 i/s) ; une capture à la fois.
- Tests : `node --test tests/*.test.js` (le glob, pas le dossier : échoue sous Windows).
- Mouvement : chaque animation a une intention (tableau « Échelle de mouvement ») ; pas de
  fondu-montée générique ; `prefers-reduced-motion` coupe Lenis, le scrub, l'intro et les
  voyages de la montre.

## Carte des fichiers

| Fichier | Rôle |
|---|---|
| `index.html`, `404.html` | Coquille unique (404 = copie exacte, pour hébergeur statique) |
| `css/tokens.css` | Palette, fontes, échelle typo, espacements, rayons, durées, courbes |
| `css/base.css` | Remise à zéro, typographie, focus, lien d'évitement, mode réduit |
| `css/shell.css` | Calques, nav, menu mobile, rideau, intro, tiroir, visuel d'attente |
| `css/pages.css` | Pages d'attente du jalon 2 (remplacées page par page aux jalons 3 à 6) |
| `js/main.js` | Démarrage : chargement suivi, scène, défilement, routeur, intro, nav, tiroir |
| `js/core/routes.js` | Pur : table des routes, `matchRoute`, `siteRoot`, `toRoutePath`, `shouldIntercept` |
| `js/core/router.js` | History API, interception des liens, cycle de vie des pages, focus, titre |
| `js/core/motion.js` | Durées et courbes (miroir de `tokens.css`), mode réduit |
| `js/core/loader.js` | Pur : suivi pondéré du chargement, compteur de l'intro |
| `js/core/scroll.js` | Lenis + ScrollTrigger branchés sur `gsap.ticker` |
| `js/stage/renderer.js` | (modifié) options `controls`, `loop: 'demande'`, `invalidate`, `hold`, `frame`, `stats` |
| `js/stage/director.js` | Poses de la montre par route, voyage, changement de famille, inclinaison au pointeur |
| `js/ui/transition.js` | Rideau : `cover()` / `reveal()` |
| `js/ui/intro.js` | Intro : hexagone tracé, compteur, lettres, sortie en diagonale |
| `js/ui/split.js` | Découpe d'un titre en lignes masquées (révélation « facette ») |
| `js/ui/nav.js` | Nav, lien actif, menu plein écran mobile, pastille panier |
| `js/ui/drawer.js` | Tiroir panier : dialogue modal, piège du focus, état vide |
| `js/ui/visuel.js`, `js/data/visuels.js` | Emplacements d'images : manifeste + placeholder designé |
| `js/store/cart.js` | Pur : panier `localStorage` (lecture, comptage, vidage, abonnements) |
| `js/pages/*.js` | `home`, `collection`, `product`, `checkout`, `confirmation`, `notfound` (attente) |
| `serve.py` | (modifié) point d'entrée local `POST /__rendus/<nom>.png` |
| `js/studio.js` | (modifié) mode `?export=rendus` |
| `tests/*.test.js` | `routes`, `loader`, `cart`, `motion`, `html`, `visuels` |
| `docs/references-mouvement.md` | Relevé des 4 références (tâche 1) |
| `docs/IMAGES.md` | Emplacements, prompts Imagen 3 et Flow, noms de fichiers |
| `_sources/rendus-3d/` | Rendus détourés 2048 px, références pour Imagen 3 |
| `_sources/directions/` | Les 2 planches de direction et leurs captures |

## Calques et boucle

```
z 70  #intro        intro (une fois par session)
z 60  #panier       tiroir + voile
z 50  .nav          nav, menu mobile
z 40  #avant        calque typo décoratif au-dessus de la montre (aria-hidden, sans pointeur)
z 30  canvas#scene  montre 3D (pointer-events: none, sauf configurateur au jalon 3)
z 20  .rideau       rideau de transition : la montre voyage PAR-DESSUS
z 10  #page         contenu de la route
```

Boucle : `gsap.ticker` → `lenis.raf()` → `stage.frame(dt)`. `frame` exécute les fonctions
d'image (inclinaison amortie, etc.) mais ne rend que si la scène a été invalidée ou si une
animation la « tient » (`hold`). Au repos : zéro rendu.

## Échelle de mouvement

Trois gestes, chacun avec une intention. Valeurs tirées du relevé (`docs/references-mouvement.md`,
synthèse) : familles `power2` à `power4` seulement, `.out` pour les entrées, `.inOut` pour les
changements d'état, `none` pour les scrubs ; aucun `back`, `elastic` ni `bounce` (aucune des 4
références n'en utilise) ; 0,8 s par défaut pour une transition d'état visible ; textes en vagues
de petits éléments (0,1 à 0,5 s chacun, décalage 0,01 à 0,04 s). Parité CSS/JS testée (tâche 4) ;
valeurs ajustables à la tâche 3 selon la direction choisie.

| Jeton | Durée | Courbe GSAP | Courbe CSS |
|---|---|---|---|
| `micro` | 0,18 s | | survols |
| `court` | 0,3 s | | |
| `vague` | 0,45 s par élément | | |
| `moyen` | 0,8 s | | |
| `long` | 1,2 s | | |
| `voyage` | 1,6 s | | |
| `intro` | 2,4 s | | |
| `sortie` | | `power4.out` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `traverse` | | `power3.inOut` | `cubic-bezier(0.76, 0, 0.24, 1)` |
| `echappement` | | `power3.out` | `cubic-bezier(0.25, 1, 0.5, 1)` |
| `lineaire` | | `none` | `linear` |

| Geste | Intention | Où | Durée, courbe |
|---|---|---|---|
| **Échappement** | Battement sec, sans rebond : l'aiguille des secondes qui avance d'un cran. Un état change | chiffre du compteur, pastille panier, prix | `court`, `echappement` |
| **Facette** | La lumière balaie une facette à 60° : un titre se révèle en vague, jamais un paragraphe | un titre par écran, lettres de l'intro | mots en `vague`, décalage 0,03 s, `sortie` (bloc perçu 0,7 à 0,9 s) |
| **Remontoir** | Un geste lourd et continu : la montre ou le rideau voyage | rideau (`moyen` à l'aller, `moyen` au retour), montre (`voyage`, couvre tout le rideau), tiroir (`moyen`, `sortie` ; fermeture `vague`, `traverse`) | `traverse` |

Règles : l'indicateur de sélection (pastille, onglet, lien actif) change **instantanément** ;
seul le résultat s'anime (la montre, le prix). Textes courants sans animation au scroll ;
survols en `micro` ; une seule chorégraphie par écran ; rien ne bouge au repos. Pour la suite
(jalons 4 et 5, noté ici pour ne pas le perdre) : scrub 3D en facteur 1,5 à 2 ; chapitres
couleur en aplats pleine hauteur qui basculent net (mesuré chez Atom), pas d'interpolation de
couleur ; voyages caméra en segments égaux (5 à 8 points), pas un seul tween A → B.

---

### Tâche 1 : relevé des 4 références

Fait par un sous-agent (sonnet) avec Chrome DevTools MCP, avant ce plan.

- [x] `docs/references-mouvement.md` : une section par site (stack, tableau « effet |
      déclencheur | durée | easing | mécanique », mesuré ou déduit), synthèse chiffrée, limites
      (voyage caméra Cartier déduit du code, pas chronométré ; Lenis de 60fps non exposé).
- [x] Valeurs reportées dans « Échelle de mouvement » et dans les options Lenis (défauts de
      Lenis, `lerp` 0,1, comme 60fps). Aucun texte, image ou marque des références repris.

### Tâche 2 : rendus détourés, IMAGES.md, spec §7

**Fichiers :** modifier `serve.py`, `js/studio.js`, `docs/spec.md` ; créer `docs/IMAGES.md`,
`_sources/rendus-3d/`.

- [x] `serve.py` : ajouter la réception des rendus, locale uniquement.

```python
EXPORT_DIR = os.path.join(ROOT, "_sources", "rendus-3d")
EXPORT_NAME = re.compile(r"^[a-z0-9-]+\.png$")

    def do_POST(self):
        # Réception des rendus exportés par studio.html?export=rendus (poste local seulement).
        if not self.path.startswith("/__rendus/") or self.client_address[0] != "127.0.0.1":
            return self.send_error(404)
        name = self.path[len("/__rendus/"):]
        size = int(self.headers.get("Content-Length") or 0)
        if not EXPORT_NAME.match(name):
            return self.send_error(400, "Nom invalide")
        if size <= 0 or size > 25_000_000:
            return self.send_error(413)
        os.makedirs(EXPORT_DIR, exist_ok=True)
        with open(os.path.join(EXPORT_DIR, name), "wb") as f:
            f.write(self.rfile.read(size))
        self.send_response(201)
        self.end_headers()
```

- [x] `js/studio.js` : mode `?export=rendus` (panneau masqué, taille de bureau), après la
      construction de la montre :

```js
if (params.get('export') === 'rendus') {
  document.getElementById('panneau').style.display = 'none';
  const jobs = REFERENCES.flatMap((r) => ['trois-quarts', 'face'].map((vue) => [r, vue]));
  jobs.push([REFERENCES.find((r) => r.ref === 'MOR-PR42-AC'), 'dos']);
  for (const [r, vue] of jobs) {
    config = normalize(r.config);
    watch.userData.applyConfig(config);
    watch.userData.setExplode(0);
    stage.setView(vue);
    const blob = await stage.exportPNG(2048);
    await fetch(`/__rendus/${r.ref.toLowerCase()}-${vue}.png`, { method: 'POST', body: blob });
  }
  document.title = `rendus exportés : ${jobs.length}`;
}
```
      (importer `REFERENCES` depuis `./data/catalogue.js`).
- [x] Redémarrer le serveur (arrêter la tâche de fond, relancer `python serve.py`), ouvrir
      `http://127.0.0.1:8781/studio.html?export=rendus` à 1440×900, attendre le titre
      « rendus exportés : 25 ». Attendu : 25 PNG 2048×2048 à fond transparent dans
      `_sources/rendus-3d/`. En ouvrir 3 (Read) : montre entière, nette, sans fond.
- [x] `docs/spec.md` : §7 « Visuels (Imagen 3 et Flow, générés par le user) », Imagen 3 à la
      place de Gemini partout (§5 galerie « Au poignet », §7, §8 jalon 7) ; filigrane visible
      éventuel retiré par recadrage ; rendus de référence dans `_sources/rendus-3d/`.
- [x] `docs/IMAGES.md` : un bloc par emplacement, avec page et jalon d'intégration, fichier,
      ratio (formats Imagen 3 : 1:1, 3:4, 4:3, 9:16, 16:9), cadrage, lumière, matière, rendu de
      référence à joindre, prompt en anglais (meilleur rendu Imagen), ce qu'il faut éviter.
      Emplacements :
      - fiche produit, galerie « Au poignet » (jalon 3) : `img/poignet-pr42-1.jpg`,
        `-pr42-2`, `-mo39-1`, `-mo39-2`, `-ab41-1`, `-ab41-2` (3:4, 1536×2048) ;
      - accueil, atelier express (jalon 5) : `img/atelier-etabli.jpg` (16:9),
        `img/atelier-loupe.jpg` (3:4), `img/atelier-reglage.jpg` (3:4) ;
      - chapitres couleur et fiche (jalon 5) : `img/matiere-acier.jpg`,
        `img/matiere-ceramique.jpg`, `img/matiere-or.jpg`, `img/matiere-cadran.jpg` (1:1) ;
      - Flow, optionnels : `video/atelier-boucle.mp4` (8 s, boucle, 16:9),
        `video/poignet-rotation.mp4` (6 s, 9:16).
      Règles communes écrites en tête : aucun visage, aucune marque réelle, aucun texte lisible
      hormis MORION, aucune boisson alcoolisée ni bar, mains et poignets variés, lumière
      cohérente avec la direction choisie (complétée après la tâche 3). Exemple de bloc :

```md
### poignet-pr42-1 · Fiche Prisme 42, galerie « Au poignet » (jalon 3)
- Fichier : `img/poignet-pr42-1.jpg` · Ratio 3:4 · 1536×2048
- Référence à joindre : `_sources/rendus-3d/mor-pr42-ac-trois-quarts.png`
- Cadrage : poignet gauche en plan serré, montre au tiers haut, manche retroussée
- Lumière : fin de journée rasante, une source latérale, ombres denses
- Prompt : "Close-up editorial photograph of a left wrist wearing a steel sport-luxury
  chronograph, round 42 mm case with a faceted hexagonal bezel held by six screws, integrated
  steel bracelet, blue tapisserie dial with three sub-dials, exactly as in the reference render.
  Rolled-up charcoal wool sleeve, hand resting on dark smoked quartz stone. Low raking side
  light, deep shadows, crisp reflections on the polished facets. 85 mm lens, shallow depth of
  field, no face, no text, no logo other than the dial."
- À éviter : visage, bijou, verre ou bouteille, texte lisible, autre montre
```
- [x] Envoyer au user 3 rendus représentatifs (SendUserFile) avec le chemin du dossier.

### Tâche 3 : direction artistique, 2 directions en captures. **ARRÊT**

**Fichiers :** créer `_sources/directions/direction-a.html`, `direction-b.html`,
`_sources/directions/planche.js`, `_sources/directions/planche.css`, captures PNG.

- [x] Charger le skill `impeccable`. Lancer une fois, depuis `morion-horlogerie/` :
      `~/.claude/skills/impeccable/scripts/impeccable.cmd context --target index.html`
      (sinon `sh .../impeccable context`). Suivre ses directives (PRODUCT.md du portfolio).
- [x] Lire `reference/new-work.md` §3 « Create or replace the visual world ». Mode **Persuade**
      (boutique et accueil). Contraintes épinglées par le brief : quartz fumé (morion), facettes
      hexagonales, sport-luxe moderne ; identité distincte du tableau de `portfolio/PRODUCT.md`
      (fonds et accents déjà pris, fontes Fraunces, Manrope, Geist, Archivo, Schibsted,
      Bricolage, Playfair, Outfit, Zen Kaku, Familjen, Saira, Satoshi exclues) ; aucune fonte de
      la liste « défauts d'entraînement » de new-work §4 sans raison écrite.
- [x] Charger `design-taste-frontend` et `anti-stitch-skills:ui-ux-pro-max` (palettes,
      paires de fontes, règles UX e-commerce luxe).
- [x] new-work §3, étapes 1 à 4 : mécanisme en une phrase, scène réelle du visiteur, 7 systèmes
      visuels candidats sur au moins 3 familles de matière, puis
      `impeccable.cmd concept-seed --scope direction --mode persuade` et verdict par challenger.
- [x] Retenir **exactement 2 directions** (consigne du user, prioritaire sur la main à 3
      cartes) : la direction assignée, relevée par les challengers, et le challenger le plus
      fort (ou le choix d'impeccable s'il diffère). Chacune : thèse, palette (rôles, hex,
      contrastes AA vérifiés), fontes Google (display, texte, chiffres tabulaires), matière de
      fond de la scène 3D (préréglage `clair` ou `nuit`, couleur de fond), variante de
      l'échelle de mouvement, risque honnête.
- [x] Planches (code, pas d'image générée) servies par `serve.py` : un premier écran d'accueil
      1440×900 avec la **vraie montre 3D** (même importmap, `buildWatch`, préréglage de la
      direction), la nav, le mot MORION, une phrase, l'appel à l'action ; puis une bande
      système : palette, échelle typo, boutons, pastille d'option, prix, pastille panier,
      champ, tiroir vide en miniature, les 4 couleurs de chapitres (acier, céramique, or jaune,
      or rose) et la carte des 3 gestes de mouvement.
- [x] Captures (Chrome DevTools MCP, onglet au premier plan) : `direction-a-1440.png` (pleine
      page), `direction-a-390.png` (premier écran), idem B. Ouvrir chaque fichier et vérifier
      qu'il montre bien ce que son nom annonce (montre rendue, pas de zone noire).
- [x] Envoyer les 4 captures (SendUserFile), puis AskUserQuestion : « Direction A », « Direction
      B » (le user peut répondre « Autre » pour un mélange). **Arrêt jusqu'à la réponse.**
- [x] Après le choix : écrire le contrat de direction (6 blocs, 150 mots max, clé du tirage)
      avec `impeccable.cmd surface-brief write index.html <fichier>` puis le relire. Ne jamais le
      copier dans le code servi. Compléter la ligne « lumière » des règles de `docs/IMAGES.md`.

### Tâche 4 : jetons CSS et mouvement (TDD)

**Fichiers :** créer `css/tokens.css`, `js/core/motion.js`, `tests/motion.test.js`.

**Produit :**
```js
// js/core/motion.js (importable sous Node : aucun accès au DOM au chargement)
export const DUR          // { micro, court, vague, moyen, long, voyage, intro } en secondes
export const EASE         // noms GSAP : { sortie, traverse, echappement, lineaire }
export const EASE_CSS     // mêmes clés, équivalents cubic-bezier / linear
export function isReduced()           // matchMedia reduce OU ?mouvement=reduit (tests)
```

- [x] Écrire `tests/motion.test.js` :

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DUR, EASE, EASE_CSS } from '../js/core/motion.js';

const css = readFileSync(new URL('../css/tokens.css', import.meta.url), 'utf8');
const flat = (s) => s.replace(/\s+/g, '');

test('chaque durée JS existe dans tokens.css, en ms', () => {
  for (const [k, s] of Object.entries(DUR)) {
    const m = css.match(new RegExp(`--dur-${k}:\\s*(\\d+)ms`));
    assert.ok(m, `--dur-${k} absent de tokens.css`);
    assert.equal(Number(m[1]), Math.round(s * 1000), k);
  }
});
test('chaque courbe JS existe dans tokens.css, à l\'identique', () => {
  for (const [k, v] of Object.entries(EASE_CSS)) {
    const m = css.match(new RegExp(`--ease-${k}:\\s*([^;]+);`));
    assert.ok(m, `--ease-${k} absent de tokens.css`);
    assert.equal(flat(m[1]), flat(v), k);
  }
});
test('registre sobre : power2 à power4 ou none, aucun rebond', () => {
  assert.deepEqual(Object.keys(EASE), Object.keys(EASE_CSS));
  for (const e of Object.values(EASE)) assert.match(e, /^(power[234]\.(out|inOut)|none)$/, e);
});
```
- [x] `node --test tests/*.test.js` → échec attendu (modules absents).
- [x] Écrire `js/core/motion.js` (valeurs de l'échelle, ajustées à la direction choisie) :

```js
// Durées (s) et courbes du site. Miroir exact de css/tokens.css (parité testée).
// Registre relevé sur les références : power2 à power4, jamais de rebond.
export const DUR = { micro: 0.18, court: 0.3, vague: 0.45, moyen: 0.8, long: 1.2, voyage: 1.6, intro: 2.4 };

export const EASE = { sortie: 'power4.out', traverse: 'power3.inOut', echappement: 'power3.out', lineaire: 'none' };
export const EASE_CSS = {
  sortie: 'cubic-bezier(0.22, 1, 0.36, 1)',
  traverse: 'cubic-bezier(0.76, 0, 0.24, 1)',
  echappement: 'cubic-bezier(0.25, 1, 0.5, 1)',
  lineaire: 'linear',
};

export function isReduced() {
  if (typeof window === 'undefined') return false;
  if (new URLSearchParams(location.search).get('mouvement') === 'reduit') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```
- [x] Écrire `css/tokens.css` avec les valeurs de la direction choisie : couleurs par rôle
      (`--c-fond`, `--c-fond-2`, `--c-encre`, `--c-encre-2`, `--c-accent`, `--c-filet`,
      `--c-rideau`, 4 couleurs de chapitres `--c-chap-ac|cn|oj|or`), fontes (`--f-display`,
      `--f-texte`, `--f-chiffres`), échelle typo fluide en `clamp()`, espacements (`--e-1` à
      `--e-9`, base 4 px), rayons, épaisseurs de filet, `--dur-*` en ms, `--ease-*`, calques
      `--z-*` (tableau « Calques »). Commentaire d'en-tête : rôle de chaque groupe, contrastes
      AA mesurés.
- [x] `node --test tests/*.test.js` → tout passe.

### Tâche 5 : logique pure (routes, chargement, panier) (TDD)

**Fichiers :** créer `js/core/routes.js`, `js/core/loader.js`, `js/store/cart.js`,
`tests/routes.test.js`, `tests/loader.test.js`, `tests/cart.test.js`.

**Produit :**
```js
// routes.js
export const ROUTE_SEGMENT          // /\/(collection|montre|commande)(\/|$)/
export function matchRoute(path)    // '/montre/MOR-PR42-OR' → { name: 'montre', params: { ref } } ; inconnu → { name: 'introuvable', params: {} }
export function siteRoot(pathname)  // dossier du site, finit par '/'
export function toRoutePath(pathname, root) // chemin de route commençant par '/'
export function shouldIntercept(link /* {href,target,download,natif} */, evt, { origin, root, current }) // → boolean
// loader.js
export function createLoadTracker() // → { track(promise, weight=1) → Promise<void>, progress() → 0..1, done(), errors() }
export function introCounter(elapsed, progress, minDuration = 1.6) // → entier 0..100
// cart.js
export const CART_KEY = 'morion:panier'
export function createCart(storage) // → { items(), count(), clear(), subscribe(fn) → off }
// ligne : { id: string, code: string (encode(config)), qty: 1..9 }
```

- [x] Écrire `tests/routes.test.js` :

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchRoute, siteRoot, toRoutePath, shouldIntercept } from '../js/core/routes.js';

test('routes connues', () => {
  assert.deepEqual(matchRoute('/'), { name: 'accueil', params: {} });
  assert.deepEqual(matchRoute('/collection'), { name: 'collection', params: {} });
  assert.deepEqual(matchRoute('/collection/'), { name: 'collection', params: {} });
  assert.deepEqual(matchRoute('/montre/MOR-PR42-OR'), { name: 'montre', params: { ref: 'MOR-PR42-OR' } });
  assert.deepEqual(matchRoute('/commande'), { name: 'commande', params: {} });
  assert.deepEqual(matchRoute('/commande/merci'), { name: 'merci', params: {} });
});
test('référence ou chemin inconnus → introuvable', () => {
  for (const p of ['/montre/MOR-XX99-AC', '/montre/mor-pr42-or', '/boutique', '/collection/extra', '/commande/merci/2']) {
    assert.equal(matchRoute(p).name, 'introuvable', p);
  }
});
test('racine du site, à la racine du domaine ou dans un sous-dossier', () => {
  assert.equal(siteRoot('/'), '/');
  assert.equal(siteRoot('/montre/MOR-PR42-AC'), '/');
  assert.equal(siteRoot('/commande/merci'), '/');
  assert.equal(siteRoot('/portfolio/morion/'), '/portfolio/morion/');
  assert.equal(siteRoot('/portfolio/morion/index.html'), '/portfolio/morion/');
  assert.equal(siteRoot('/portfolio/morion/collection'), '/portfolio/morion/');
  assert.equal(siteRoot('/portfolio/morion/montre/MOR-AB41-OJ'), '/portfolio/morion/');
});
test('chemin de route relatif à la racine', () => {
  assert.equal(toRoutePath('/portfolio/morion/collection', '/portfolio/morion/'), '/collection');
  assert.equal(toRoutePath('/portfolio/morion/', '/portfolio/morion/'), '/');
  assert.equal(toRoutePath('/portfolio/morion/index.html', '/portfolio/morion/'), '/');
});
test('liens interceptés par le routeur', () => {
  const ctx = { origin: 'http://s', root: '/', current: 'http://s/collection' };
  const clic = { button: 0 };
  const lien = (href, o = {}) => ({ href, target: '', download: false, natif: false, ...o });
  assert.equal(shouldIntercept(lien('http://s/'), clic, ctx), true);
  assert.equal(shouldIntercept(lien('http://s/montre/MOR-PR42-AC?c=x'), clic, ctx), true);
  assert.equal(shouldIntercept(lien('https://ailleurs.fr/'), clic, ctx), false);
  assert.equal(shouldIntercept(lien('http://s/studio.html'), clic, ctx), false);
  assert.equal(shouldIntercept(lien('http://s/collection#grille'), clic, ctx), false);
  assert.equal(shouldIntercept(lien('http://s/', { target: '_blank' }), clic, ctx), false);
  assert.equal(shouldIntercept(lien('http://s/', { download: true }), clic, ctx), false);
  assert.equal(shouldIntercept(lien('http://s/', { natif: true }), clic, ctx), false);
  assert.equal(shouldIntercept(lien('http://s/'), { button: 0, ctrlKey: true }, ctx), false);
  assert.equal(shouldIntercept(lien('http://s/'), { button: 1 }, ctx), false);
});
```
- [x] Écrire `tests/loader.test.js` :

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLoadTracker, introCounter } from '../js/core/loader.js';

test('progression pondérée', async () => {
  const t = createLoadTracker();
  let ok1, ok2;
  const p1 = t.track(new Promise((r) => { ok1 = r; }), 3);
  t.track(new Promise((r) => { ok2 = r; }), 1);
  assert.equal(t.progress(), 0);
  ok1();
  await p1;
  assert.equal(t.progress(), 0.75);
  ok2();
  await t.done();
  assert.equal(t.progress(), 1);
});
test('une tâche en échec ne bloque pas le chargement', async () => {
  const t = createLoadTracker();
  t.track(Promise.reject(new Error('police')), 1);
  await t.done();
  assert.equal(t.progress(), 1);
  assert.equal(t.errors().length, 1);
});
test('compteur : jamais au-dessus du chargement réel, 100 seulement à la fin', () => {
  assert.equal(introCounter(10, 0.4), 40);
  assert.ok(introCounter(0.2, 1) < 100);
  assert.equal(introCounter(1.6, 1), 100);
  let prev = 0;
  for (let s = 0; s <= 2; s += 0.05) {
    const v = introCounter(s, Math.min(1, s));
    assert.ok(v >= prev, `recul à ${s}`);
    prev = v;
  }
});
```
- [x] Écrire `tests/cart.test.js` :

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCart, CART_KEY } from '../js/store/cart.js';
import { defaultConfig, encode } from '../js/store/config.js';

const memoire = (init = {}) => {
  const m = new Map(Object.entries(init));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
};
const code = encode(defaultConfig('PR42', 'AC'));
const avec = (lignes) => memoire({ [CART_KEY]: JSON.stringify({ v: 1, lignes }) });

test('panier vide par défaut', () => {
  const c = createCart(memoire());
  assert.equal(c.count(), 0);
  assert.deepEqual(c.items(), []);
});
test('relit le panier enregistré', () => {
  assert.equal(createCart(avec([{ id: 'a', code, qty: 1 }, { id: 'b', code, qty: 2 }])).count(), 3);
});
test('lignes invalides écartées', () => {
  assert.equal(createCart(avec([{ id: 'x', code: 'n-importe-quoi', qty: 1 }, { id: 'y', code, qty: 0 }])).count(), 0);
});
test('données corrompues ou stockage bloqué : panier vide, sans exception', () => {
  assert.equal(createCart(memoire({ [CART_KEY]: '{oups' })).count(), 0);
  const bloque = { getItem() { throw new Error('bloqué'); }, setItem() { throw new Error('bloqué'); } };
  const c = createCart(bloque);
  assert.equal(c.count(), 0);
  assert.doesNotThrow(() => c.clear());
});
test('abonnement notifié au vidage, puis désabonnement', () => {
  const c = createCart(avec([{ id: 'a', code, qty: 1 }]));
  let n = 0;
  const off = c.subscribe(() => { n += 1; });
  c.clear();
  assert.equal(n, 1);
  assert.equal(c.count(), 0);
  off();
  c.clear();
  assert.equal(n, 1);
});
```
- [x] `node --test tests/*.test.js` → échec attendu.
- [x] Écrire `js/core/routes.js` :

```js
// Table des routes et règles d'interception des liens. Pur : testé sous Node.
import { REFERENCES } from '../data/catalogue.js';

const REFS = new Set(REFERENCES.map((r) => r.ref));
const TABLE = [
  ['accueil', /^\/$/],
  ['collection', /^\/collection$/],
  ['montre', /^\/montre\/([A-Z0-9-]+)$/, (m) => (REFS.has(m[1]) ? { ref: m[1] } : null)],
  ['commande', /^\/commande$/],
  ['merci', /^\/commande\/merci$/],
];

// Premier segment d'une route : ce qui le précède dans l'URL est le dossier du site.
// Le script en ligne d'index.html reprend cette expression (vérifié par tests/html.test.js).
export const ROUTE_SEGMENT = /\/(collection|montre|commande)(\/|$)/;

export function matchRoute(path) {
  const p = path.length > 1 ? path.replace(/\/+$/, '') : path;
  for (const [name, re, read] of TABLE) {
    const m = p.match(re);
    if (!m) continue;
    const params = read ? read(m) : {};
    if (params) return { name, params };
  }
  return { name: 'introuvable', params: {} };
}

export function siteRoot(pathname) {
  const i = pathname.search(ROUTE_SEGMENT);
  return i >= 0 ? pathname.slice(0, i + 1) : pathname.replace(/[^/]*$/, '');
}

export function toRoutePath(pathname, root) {
  const rest = pathname.startsWith(root) ? pathname.slice(root.length) : pathname.replace(/^\//, '');
  return `/${rest.replace(/^index\.html$/, '')}`;
}

export function shouldIntercept(link, evt, { origin, root, current }) {
  if (evt.defaultPrevented || evt.button !== 0) return false;
  if (evt.metaKey || evt.ctrlKey || evt.shiftKey || evt.altKey) return false;
  if (link.natif || link.download || (link.target && link.target !== '_self')) return false;
  const url = new URL(link.href);
  if (url.origin !== origin || !url.pathname.startsWith(root)) return false;
  const rest = url.pathname.slice(root.length);
  if (/\.[a-z0-9]+$/i.test(rest) && rest !== 'index.html') return false;
  const here = new URL(current);
  if (url.hash && url.pathname === here.pathname && url.search === here.search) return false;
  return true;
}
```
- [x] Écrire `js/core/loader.js` :

```js
// Suivi du chargement réel (fontes, three.js, environnement, montre, shaders) pour l'intro.
export function createLoadTracker() {
  let total = 0;
  let loaded = 0;
  const pending = new Set();
  const errs = [];
  return {
    track(promise, weight = 1) {
      total += weight;
      const p = Promise.resolve(promise)
        .then(() => {}, (e) => { errs.push(e); })
        .then(() => { loaded += weight; pending.delete(p); });
      pending.add(p);
      return p;
    },
    progress: () => (total ? loaded / total : 0),
    done: () => Promise.all([...pending]),
    errors: () => errs.slice(),
  };
}

// Le compteur ne dépasse jamais le chargement réel, et suit une courbe temporelle pour que la
// chorégraphie garde son rythme quand tout est déjà en cache.
export function introCounter(elapsed, progress, minDuration = 1.6) {
  const k = Math.min(1, Math.max(0, elapsed / minDuration));
  const time = 1 - (1 - k) ** 3;
  return Math.floor(100 * Math.min(progress, time) + 1e-9);
}
```
- [x] Écrire `js/store/cart.js` :

```js
// Panier persistant. Ligne : { id, code (encode(config)), qty }. Jalon 2 : lecture, comptage,
// vidage ; ajout, quantité et suppression arrivent au jalon 3.
import { decode } from './config.js';

export const CART_KEY = 'morion:panier';

const valid = (l) => l && typeof l.id === 'string' && Number.isInteger(l.qty)
  && l.qty >= 1 && l.qty <= 9 && typeof l.code === 'string' && decode(l.code) !== null;

function defaultStorage() {
  try { return globalThis.localStorage ?? null; } catch { return null; }
}

export function createCart(storage = defaultStorage()) {
  const subs = new Set();
  const read = () => {
    try {
      const d = JSON.parse(storage?.getItem(CART_KEY) || 'null');
      return Array.isArray(d?.lignes) ? d.lignes.filter(valid) : [];
    } catch { return []; }
  };
  const write = () => {
    try { storage?.setItem(CART_KEY, JSON.stringify({ v: 1, lignes })); } catch { /* stockage bloqué : mémoire seule */ }
  };
  let lignes = read();
  return {
    items: () => lignes.map((l) => ({ ...l })),
    count: () => lignes.reduce((n, l) => n + l.qty, 0),
    clear() { lignes = []; write(); subs.forEach((fn) => fn()); },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  };
}
```
- [x] `node --test tests/*.test.js` → tout passe (y compris les 10 tests du jalon 1).

### Tâche 6 : coquille HTML, scène persistante, défilement

**Fichiers :** créer `index.html`, `404.html`, `css/base.css`, `css/shell.css`,
`js/core/scroll.js`, `js/stage/director.js`, `js/main.js`, `tests/html.test.js` ; modifier
`js/stage/renderer.js`.

**Produit :**
```js
// renderer.js (ajouts, valeurs par défaut = comportement du jalon 1)
createStage(canvas, { dprMax = 2, env = 'clair', controls = true, loop = 'continu' })
// loop 'demande' : pas de setAnimationLoop ; stage.frame(dt) est appelé par gsap.ticker et ne
// rend que si invalidé ou tenu. Ajouts : invalidate(), hold() → release, frame(dt), stats.renders
// director.js
export const POSES, POSES_ETROIT   // { accueil, collection, montre, commande, merci, introuvable }
export function createDirector(stage, watch, { reduced })
// → { pose(name, { immediate }) → Promise, setConfig(config) → Promise, ready: Promise, get current() }
// scroll.js
export function createScroll({ reduced }) // → { lenis|null, to(y, { immediate }), stop(), start() }
```

- [x] Écrire `tests/html.test.js` :

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';
import { ROUTE_SEGMENT } from '../js/core/routes.js';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const index = read('index.html');

test('404.html est une copie exacte d\'index.html', () => assert.equal(read('404.html'), index));
test('three 0.186.0 figé dans l\'importmap', () => {
  assert.match(index, /"three":\s*"https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.186\.0\/build\/three\.module\.js"/);
  assert.match(index, /"three\/addons\/":\s*"https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.186\.0\/examples\/jsm\/"/);
});
test('scripts CDN avec SRI', () => {
  const tags = index.match(/<script[^>]+src="https:[^"]+"[^>]*>/g) || [];
  assert.ok(tags.length >= 4, 'gsap, ScrollTrigger, CustomEase, lenis');
  for (const t of tags) {
    assert.match(t, /integrity="sha384-[A-Za-z0-9+/=]+"/, t);
    assert.match(t, /crossorigin="anonymous"/, t);
  }
  assert.match(index, /gsap\/3\.12\.5\//);
});
test('le script de racine pose <base> comme siteRoot()', () => {
  const src = index.match(/<script id="racine">([\s\S]*?)<\/script>/)[1];
  assert.ok(src.includes(ROUTE_SEGMENT.source), 'même expression que routes.js');
  for (const [path, root] of [['/', '/'], ['/montre/MOR-PR42-AC', '/'], ['/p/morion/collection', '/p/morion/'], ['/p/morion/', '/p/morion/']]) {
    let base = null;
    const document = {
      createElement: () => ({}),
      head: { appendChild: (el) => { base = el; } },
      documentElement: { classList: { replace() {} } },
    };
    vm.runInNewContext(src, { location: { pathname: path }, document, sessionStorage: { getItem: () => null } });
    assert.equal(base.href, root, path);
  }
});
test('aucun tiret cadratin dans les textes du site', () => {
  const files = ['index.html', ...['js/core', 'js/ui', 'js/pages', 'js/data'].flatMap((d) =>
    readdirSync(new URL(`../${d}`, import.meta.url)).map((f) => `${d}/${f}`))];
  for (const f of files) assert.ok(!read(f).includes('\u2014'), f);
});
```
- [x] `node --test tests/*.test.js` → échec attendu.
- [x] Calculer les SRI : pour chaque URL,
      `curl -s <url> | openssl dgst -sha384 -binary | openssl base64 -A`. URLs :
      `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js` (attendu
      `g4NTh/Iv5PPU4xPyhEWqPcwtNXOvdaDI8LLnyYfyNZOjKJeYQyjzQ9X5275eBjpt`, déjà utilisé dans le
      portfolio), `.../ScrollTrigger.min.js` (attendu `Z3REaz79l2IaAZqJsSABtTbhjgOUYyV3p90XNnAPCSHg3EMTz1fouunq9WZRtj3d`),
      `.../CustomEase.min.js` (à calculer), `https://unpkg.com/lenis@1.3.17/dist/lenis.min.js`
      (attendu `4EgXbGZLDwcPHcRGrHOxm1OvumWUqhr/ts6eapdZnak6ORZAsSE3fMd0niykaSkw`).
- [x] `index.html` :
  - `<html lang="fr" class="no-js">` ; en premier dans `<head>` le script `#racine` :

```html
<script id="racine">
  (function () {
    // Dossier du site, même servi dans un sous-dossier : les URL relatives partent de là.
    var p = location.pathname, i = p.search(/\/(collection|montre|commande)(\/|$)/);
    var b = document.createElement('base');
    b.href = i >= 0 ? p.slice(0, i + 1) : p.replace(/[^/]*$/, '');
    document.head.appendChild(b);
    document.documentElement.classList.replace('no-js', 'js');
    try { if (sessionStorage.getItem('morion:intro')) document.documentElement.classList.add('intro-vue'); } catch (e) {}
  })();
</script>
```
  - `title`, `meta description`, `theme-color` (= `--c-fond`), favicon SVG hexagonal en data URI,
    `preconnect` + feuille Google Fonts (fontes de la direction et `Syncopate:wght@400;700`
    pour le cadran), `css/tokens.css`, `base.css`, `shell.css`, `pages.css`, l'importmap three,
    `modulepreload` de `js/main.js`, les 4 scripts CDN `defer` avec SRI, puis
    `<script type="module" src="js/main.js">` (les modules s'exécutent après les scripts
    `defer`, dans l'ordre : les globales `gsap`, `ScrollTrigger`, `CustomEase`, `Lenis` existent).
  - `<body>` : lien d'évitement « Aller au contenu », `header.nav`, `main#page` (`tabindex="-1"`),
    `div.rideau` (`aria-hidden`), `canvas#scene` (`aria-hidden`), `div#avant` (`aria-hidden`),
    `aside#panier`, `div#intro`, `p#annonce` (`aria-live="polite"`, masqué visuellement),
    `<noscript>` : la marque, les 12 références avec leur prix, la mention démonstration.
- [x] `css/base.css` : remise à zéro, `html { scrollbar-gutter: stable }` (pas de saut quand le
      défilement se bloque), classes Lenis recommandées (`html.lenis`, `.lenis-stopped`),
      typographie par jetons, `:focus-visible` dessiné, `.sr` (masquage accessible), mode réduit
      `@media (prefers-reduced-motion: reduce)` et `html.reduit` : durées ramenées à 0,01 ms,
      aucun `transform` animé.
- [x] `css/shell.css` : calques du tableau (positions fixes, `z-index` par jetons), `canvas#scene`
      en `position: fixed; inset: 0; pointer-events: none`.
- [x] `js/stage/renderer.js` : ajouts sans changer les valeurs par défaut.

```js
export function createStage(canvas, { dprMax = 2, env = 'clair', controls: withControls = true, loop = 'continu' } = {}) {
  // ... inchangé jusqu'à la caméra ...
  const controls = withControls ? new OrbitControls(camera, canvas) : null;
  if (controls) { /* réglages du jalon 1 inchangés */ } else { camera.lookAt(TARGET); }
  let dirty = 1;
  let holds = 0;
  const stats = { renders: 0 };
  const invalidate = () => { dirty = Math.max(dirty, 1); };
  const hold = () => { holds += 1; let done = false; return () => { if (!done) { done = true; holds -= 1; invalidate(); } }; };
  function render() { renderer.render(scene, camera); stats.renders += 1; }
  function frame(dt) {
    frameFns.forEach((fn) => fn(dt));
    controls?.update();
    if (loop === 'continu' || dirty > 0 || holds > 0) { render(); dirty = 0; }
  }
  // resize() appelle invalidate() ; setView() sans contrôles : camera.lookAt(TARGET)
  // start() : en mode 'continu' seulement, setAnimationLoop((ts) => { timer.update(ts); frame(min(timer.getDelta(), 0.05)); })
  return { /* ...existant... */, invalidate, hold, frame, stats };
}
```
- [x] `js/core/scroll.js` :

```js
// Défilement doux : Lenis sur gsap.ticker, ScrollTrigger synchronisé. Rien en mode réduit.
export function createScroll({ reduced }) {
  const { gsap, ScrollTrigger, Lenis } = window;
  gsap.registerPlugin(ScrollTrigger);
  if (reduced) {
    return { lenis: null, to: (y) => window.scrollTo(0, y), stop() {}, start() {} };
  }
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.4 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return {
    lenis,
    to: (y, { immediate = true } = {}) => lenis.scrollTo(y, { immediate, force: true }),
    stop: () => lenis.stop(),
    start: () => lenis.start(),
  };
}
```
      (options Lenis ajustées d'après `docs/references-mouvement.md`).
- [x] `js/stage/director.js` : scène `pose → inclinaison → montre` (3 groupes emboîtés).
  - `POSES` en coordonnées d'écran : `x`, `y` dans [-1, 1] (fraction de la demi-largeur et de la
    demi-hauteur visibles), `taille` = part de la hauteur visible occupée par la sphère
    englobante de la montre, `rotX`, `rotY`, `eclate`. Valeurs de départ, réglées à l'œil :
    `accueil {x .3, y 0, taille .8, rotY -.5, rotX .2}`, `collection {x -.36, y -.04, taille .5,
    rotY .9}`, `montre {x 0, y .02, taille .72, rotY -.35, rotX .18}`, `commande {x .4, y .2,
    taille .32}`, `merci {x 0, y 0, taille .62}`, `introuvable {x .2, y 0, taille .62, rotY -.9,
    eclate .85}`. `POSES_ETROIT` (< 720 px) : montre centrée en haut, `taille` 0,42 à 0,5.
  - Conversion : caméra fixe `(0, 0, 400)`, fov 28 ; hauteur visible `h = 2·400·tan(14°)` ;
    échelle `taille·h / diamètre englobant` ; position `x·h·aspect/2`, `y·h/2`.
  - `pose(name)` : `gsap.to(state, { ...cible, duration: DUR.voyage, ease: EASE.traverse,
    onStart: hold, onUpdate: appliquer, onComplete: release })` ; `immediate` ou mode réduit =
    application directe + `invalidate()`.
  - `setConfig(config)` : même famille → `applyConfig` puis `invalidate()` ; autre famille → la
    montre se réduit en `DUR.court` (`EASE.traverse`), `applyConfig`, remesure du diamètre,
    puis reprend sa pose.
  - Inclinaison : pointeur fin seulement (`matchMedia('(pointer: fine)')`), cible ±0,12 rad,
    amortissement exponentiel dans une fonction d'image ; `invalidate()` tant que l'écart
    dépasse 1e-4 ; arrêt en mode réduit.
  - `ready` : promesse résolue après `renderer.compileAsync(scene, camera)` (shaders compilés
    pendant l'intro : aucun à-coup à la première apparition).
- [x] `js/main.js` (version tâche 6) : `isReduced()` → classe `reduit` sur `<html>` ;
      `createLoadTracker()` qui suit fontes (`document.fonts.load` pour
      chaque fonte), environnement et montre ; `createStage(canvas, { controls: false, loop:
      'demande', env: <préréglage de la direction>, dprMax }` avec `dprMax` = `min(devicePixelRatio, 1.5)` sous 720 px, sinon `clamp(devicePixelRatio, 1.5, 2)` (suréchantillonnage relevé chez Cartier : 1,5 minimum sur écran standard) ; `setPixelRatio(dprMax)` ;
      `buildWatch(defaultConfig('PR42', 'AC'))` ; `createDirector` ; `createScroll` ;
      `gsap.ticker.add((t, dtMs) => stage.frame(Math.min(dtMs / 1000, 0.05)))` ajouté **après**
      Lenis ; `document.addEventListener('visibilitychange', …)` : rien à faire (rAF suspendu).
      `window.__morion = { stage, director, scroll, tracker }` pour les contrôles.
- [x] `cp index.html 404.html` ; `node --test tests/*.test.js` → tout passe.
- [x] Navigateur : `http://127.0.0.1:8781/` à 1440×900. Attendu : montre en pose `accueil`,
      console sans erreur, `studio.html` inchangé (ouvrir, tourner, éclater).
      `evaluate_script` : lire `__morion.stage.stats.renders`, attendre 2 s sans rien toucher,
      relire : écart **0**.

### Tâche 7 : routeur, transitions, pages d'attente

**Fichiers :** créer `js/core/router.js`, `js/ui/transition.js`, `js/ui/split.js`,
`js/pages/home.js`, `collection.js`, `product.js`, `checkout.js`, `confirmation.js`,
`notfound.js`, `css/pages.css` ; modifier `js/main.js`.

**Produit :**
```js
// Contrat d'une page (js/pages/*.js)
export default {
  title: (params) => 'Collection',        // document.title = `${title} · MORION`
  pose: 'collection',                      // pose de la montre
  config: (params) => Config | undefined,  // montre à afficher (défaut : celle en place)
  render: (params) => ({ page: '<html…>', avant: '<html…>' | undefined }),
  mount({ el, front, params, app }) {      // app = { router, stage, director, scroll, cart, drawer }
    // sous le rideau : découpe du titre et état initial (lignes masquées), aucun flash
    return () => {};                       // nettoyage ; les animations vivent dans gsap.context(…, el)
  },
  enter(el) { return gsap.timeline(); },   // joué après le rideau : révélation facette du h1
};
// router.js
export function createRouter({ root, outlet, front, transition, app, onRoute })
// → { start(), navigate(href, { replace = false } = {}), get route() }
// transition.js
export function createTransition(rideau, { reduced }) // → { cover() → Promise, reveal() → Promise }
// split.js
export function splitLines(el) // → { lines: HTMLElement[], revert() } ; lignes enveloppées dans un masque
```

- [x] `js/ui/transition.js` : le rideau est une dalle de quartz (couleur `--c-rideau`) plus large
      que l'écran, inclinée à 60° (angle d'une facette d'hexagone), qui traverse l'écran en
      `transform` (jamais `clip-path` animé : moins coûteux). Son bord d'attaque porte un filet de
      lumière de 1 px (dégradé `--c-accent` → transparent) : la facette qui accroche la lumière.
      `cover()` : entrée de la gauche vers le centre en `DUR.moyen`, `EASE.traverse`.
      `reveal()` : sortie vers la droite, même geste. Mode réduit : fondu d'opacité de 150 ms.
- [x] `js/ui/split.js` : mots enveloppés, regroupés en lignes par `offsetTop`, chaque ligne dans
      un masque `overflow: clip` ; `revert()` rétablit le HTML d'origine ; redécoupe au
      redimensionnement (anti-rebond 150 ms) ; mode réduit : aucune découpe.
- [x] `js/core/router.js` :

```js
import { matchRoute, toRoutePath, shouldIntercept } from './routes.js';

const LOADERS = {
  accueil: () => import('../pages/home.js'),
  collection: () => import('../pages/collection.js'),
  montre: () => import('../pages/product.js'),
  commande: () => import('../pages/checkout.js'),
  merci: () => import('../pages/confirmation.js'),
  introuvable: () => import('../pages/notfound.js'),
};

export function createRouter({ root, outlet, front, transition, app, onRoute }) {
  let current = null;   // { match, url, mod, cleanup }
  let busy = false;
  let queued = null;
  // Position de défilement par entrée d'historique (clé posée dans history.state).
  const positions = new Map();
  const newKey = () => Math.random().toString(36).slice(2, 10);
  let key = history.state?.key ?? newKey();
  history.replaceState({ key }, '');
  history.scrollRestoration = 'manual';

  const load = (name) => LOADERS[name]().catch(() => LOADERS.introuvable());

  async function go(url, { replace = false, pop = false, first = false } = {}) {
    if (busy) { queued = [url, { replace, pop }]; return; }
    const match = matchRoute(toRoutePath(url.pathname, root));
    if (current && !pop && url.href === current.url.href) { app.scroll.to(0, { immediate: false }); return; }
    busy = true;
    positions.set(key, window.scrollY);
    if (pop) key = history.state?.key ?? newKey();
    else if (!first) { key = newKey(); history[replace ? 'replaceState' : 'pushState']({ key }, '', url); }
    const mod = (await load(match.name)).default;
    const cfg = mod.config?.(match.params);
    if (!first) {
      // La montre voyage pendant que le rideau couvre puis découvre : on ne l'attend pas.
      const travel = (cfg ? app.director.setConfig(cfg) : Promise.resolve()).then(() => app.director.pose(mod.pose));
      travel.catch(() => {});
      await transition.cover();
      current?.cleanup?.();
    } else {
      if (cfg) await app.director.setConfig(cfg);
      app.director.pose(mod.pose, { immediate: true });
    }
    const { page, avant = '' } = mod.render(match.params);
    outlet.innerHTML = page;
    front.innerHTML = avant;
    document.title = `${mod.title(match.params)} · MORION`;
    app.scroll.to(pop ? (positions.get(key) ?? 0) : 0);
    const cleanup = mod.mount?.({ el: outlet, front, params: match.params, app });
    window.ScrollTrigger.refresh();
    current = { match, url, mod, cleanup };
    onRoute(match, { first });
    if (!first) {
      outlet.querySelector('h1')?.focus({ preventScroll: true });
      await transition.reveal();
    }
    mod.enter?.(outlet);
    busy = false;
    if (queued) { const q = queued; queued = null; go(...q); }
  }

  function onClick(evt) {
    const a = evt.target.closest?.('a[href]');
    if (!a) return;
    const link = { href: a.href, target: a.target, download: a.hasAttribute('download'), natif: a.hasAttribute('data-natif') };
    if (!shouldIntercept(link, evt, { origin: location.origin, root, current: location.href })) return;
    evt.preventDefault();
    go(new URL(a.href));
  }

  function prefetch(evt) {
    const a = evt.target.closest?.('a[href]');
    if (!a || new URL(a.href).origin !== location.origin) return;
    const { name } = matchRoute(toRoutePath(new URL(a.href).pathname, root));
    LOADERS[name]?.();
  }

  return {
    start() {
      document.addEventListener('click', onClick);
      document.addEventListener('pointerenter', prefetch, { capture: true, passive: true });
      window.addEventListener('popstate', () => go(new URL(location.href), { pop: true }));
      return go(new URL(location.href), { first: true });
    },
    navigate: (href, opts) => go(new URL(href, document.baseURI), opts),
    get route() { return current?.match; },
  };
}
```
      Le `h1` de chaque page porte `tabindex="-1"`. `onRoute` (dans `main.js`) : lien actif de la
      nav, fermeture du tiroir et du menu, annonce « Page : <titre> » dans `#annonce`.
- [x] Pages d'attente (textes réels, sans mention de jalon ni de « bientôt » générique) :
  - `home.js` : le premier écran de la direction choisie (MORION, phrase, appel « Découvrir la
    collection »), une section « manifeste » (titre révélé en facette, 3 courts paragraphes sur
    la maison fictive : quartz fumé, facettes, mouvement MR-01), pied de page avec la mention
    « Site de démonstration : aucune vente réelle ». Pose `accueil`.
  - `collection.js` : « La collection », 3 familles avec nom complet, caractéristiques et prix
    « à partir de » calculé depuis `PRICES`, chacune liée à `montre/MOR-<fam>-AC`. Pose
    `collection`.
  - `product.js` : nom complet + finition, référence, prix de la config par défaut
    (`price` + `formatPrice`), lien retour. `config` = celle de la référence. Pose `montre`.
  - `checkout.js` : bandeau « Démonstration : aucun paiement réel », état panier vide avec lien
    vers la collection. Pose `commande`.
  - `confirmation.js` : « Merci », numéro d'exemple marqué comme tel. Pose `merci`.
  - `notfound.js` : « Cette page s'est démontée. » La montre en pose `introuvable` (éclatée),
    lien « Revenir à l'accueil ».
  - `enter()` de chaque page : un seul titre révélé en facette (`splitLines` : mots masqués, vague de
    `DUR.vague` par mot, décalage 0,03 s, `EASE.sortie`, masque qui glisse selon l'angle de 60°).
- [x] `js/main.js` : `createTransition`, `createRouter({ root: new URL('.', document.baseURI).pathname, … })`,
      `router.start()` après le chargement (première route montée sous l'intro).
- [x] `cp index.html 404.html` si modifié ; `node --test tests/*.test.js` → tout passe.
- [x] Navigateur 1440×900 (l'intro n'existe pas encore : première route montée directement).
      Contrôles (`evaluate_script` + captures) : chaque lien de nav, précédent/suivant, chargement direct
      de chaque route (`/collection`, `/montre/MOR-AB41-OJ`, `/commande`, `/commande/merci`,
      `/nimporte`), route inconnue → 404 dessinée. Pas de rechargement : une variable posée sur
      `window` au départ existe toujours après 6 navigations, et
      `performance.getEntriesByType('navigation').length === 1`. Console : 0 erreur. Clics
      rapides pendant une transition : la dernière destination gagne, aucune page doublée.

### Tâche 8 : intro

**Fichiers :** créer `js/ui/intro.js` ; modifier `js/main.js`, `css/shell.css`.

**Produit :**
```js
export function playIntro({ el, tracker, director, reduced }) // → Promise<void> : résolue quand la page est visible
```

- [x] Déroulé visé (cache chaud, bureau), environ 2,4 s :

| Temps | Geste | Détail |
|---|---|---|
| 0 → 0,7 s | Tracé | Hexagone SVG, 6 segments tracés l'un après l'autre (`stroke-dashoffset`), `DUR.vague` chacun, décalage 0,05 s, `EASE.sortie` |
| 0 → 1,6 s et plus | Compteur | `000` → `100` en chiffres tabulaires, valeur = `introCounter(écoulé, tracker.progress())` à chaque image ; à chaque dizaine franchie, l'hexagone bat d'un cran sec (rotation de 6°, `DUR.court`, `EASE.echappement`, sans rebond) |
| 1,6 → 2,0 s | Lettres | M O R I O N révélées en vague par des masques en facette, `DUR.vague` par lettre, décalage 0,04 s, `EASE.sortie` |
| 1,9 → 2,4 s | Sortie | Le calque d'intro glisse en diagonale à 60° (même dalle que le rideau), page et montre découvertes, `EASE.traverse` |

  - 6° par battement = une seconde sur un cadran ; 10 battements = 60°, l'hexagone retombe sur
    sa propre symétrie à 100.
  - Si le chargement dure plus longtemps, le compteur attend le vrai chargement (l'hexagone bat
    toujours) ; les lettres ne partent qu'à 100.
  - Clics et défilement débloqués dès le début de la sortie (vers 80 % de la durée, comme Atom
    qui rend la main avant la fin visuelle).
  - Passable : clic, toucher, Entrée, Espace ou Échap → si tout est chargé, saut direct à la
    sortie (0,4 s) ; sinon sortie immédiate et la montre apparaît dès `director.ready`.
  - Une fois par session : `sessionStorage['morion:intro'] = '1'` au début de la sortie (dans un
    `try`). Visite suivante : la classe `intro-vue` (posée par le script `#racine`) masque
    l'intro dès le premier rendu, la page apparaît par `transition.reveal()` quand la montre est
    prête (attente plafonnée à 1,2 s).
  - Accessibilité : lettres `aria-hidden`, texte « MORION » pour les lecteurs d'écran,
    « Chargement » annoncé une fois dans `#annonce`, focus rendu au `main` à la sortie.
  - Mode réduit : pas de tracé ni de lettres animées ; hexagone et mot fixes, fondu de sortie
    de 300 ms dès le chargement terminé.
- [x] Navigateur, nouvel onglet (nouvelle session) : 3 captures à 0,5 s, 1,4 s et 2,1 s ;
      mesurer la durée réelle (horodatage `performance.now()` début → résolution de
      `playIntro`) : 2,2 à 2,6 s cache chaud. Recharger : pas d'intro. Nouvel onglet puis clic à
      0,4 s : page visible en moins de 0,5 s.

### Tâche 9 : nav, menu mobile, tiroir panier, visuel d'attente

**Fichiers :** créer `js/ui/nav.js`, `js/ui/drawer.js`, `js/ui/visuel.js`,
`js/data/visuels.js`, `tests/visuels.test.js` ; modifier `js/main.js`, `css/shell.css`,
`index.html` (+ `404.html`).

**Produit :**
```js
export function createNav(el, { cart, drawer }) // → { setActive(routeName) }
export function createDrawer(el, { cart, scroll, reduced }) // → { open(trigger), close(), get isOpen() }
export const VISUELS // { id: { fichier, ratio, legende, jalon, present: false } }, ids = blocs de docs/IMAGES.md
export function visuel(id, { classe = '' } = {}) // → HTML : <img> si present, sinon placeholder designé
```

- [x] Écrire `tests/visuels.test.js` :

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { VISUELS } from '../js/data/visuels.js';

const doc = readFileSync(new URL('../docs/IMAGES.md', import.meta.url), 'utf8');

test('chaque emplacement a son bloc dans IMAGES.md', () => {
  for (const [id, v] of Object.entries(VISUELS)) {
    assert.ok(doc.includes(`### ${id} `), `bloc ${id}`);
    assert.ok(doc.includes(v.fichier), `fichier ${v.fichier}`);
  }
});
test('chaque fichier d\'IMAGES.md est dans le manifeste', () => {
  const files = [...doc.matchAll(/`((?:img|video)\/[a-z0-9-]+\.(?:jpg|webp|mp4))`/g)].map((m) => m[1]);
  const known = new Set(Object.values(VISUELS).map((v) => v.fichier));
  for (const f of files) assert.ok(known.has(f), f);
});
test('un visuel marqué présent existe sur le disque', () => {
  for (const v of Object.values(VISUELS)) {
    if (v.present) assert.ok(existsSync(new URL(`../${v.fichier}`, import.meta.url)), v.fichier);
  }
});
```
      (Le manifeste évite de demander des fichiers absents : aucune erreur 404 en console.)
- [x] `node --test tests/*.test.js` → échec attendu, puis écrire `visuels.js` et `visuel.js` →
      tout passe.
- [x] Placeholder designé (`.visuel`) : ratio réservé (`aspect-ratio`, aucun saut quand l'image
      arrive), fond en facettes hexagonales dessiné en CSS dans la palette, légende de
      l'emplacement, nom de fichier et ratio en petit. `role="img"` + `aria-label` = légende.
- [x] Nav : marque (hexagone + MORION) vers l'accueil, « Collection », « Composer » (vers
      `montre/MOR-PR42-AC`), bouton « Écrin » avec pastille du compte (`aria-label` « Écrin, 0
      article »), lien actif marqué (`aria-current="page"`). La pastille change en geste
      échappement. Sous 720 px : marque, bouton panier, bouton « Menu » → menu plein écran
      (`role="dialog"`, `aria-modal`), liens en grand corps, les 3 familles avec leur prix « à
      partir de », fermeture Échap / bouton / navigation, focus piégé puis rendu au bouton,
      défilement bloqué (`scroll.stop()`).
- [x] Tiroir `#panier` : `role="dialog"`, `aria-modal="true"`, `aria-labelledby` ; voile
      cliquable ; panneau à droite `min(440px, 100vw)` avec `data-lenis-prevent` ; ouverture en
      `DUR.moyen`, `EASE.sortie` (fermeture `DUR.vague`, `EASE.traverse`), contenu en vague (`DUR.vague`, décalage 0,03 s) ; Échap,
      voile et bouton ferment ; focus piégé, rendu au déclencheur ; `inert` sur `main` et la
      nav pendant l'ouverture ; `scroll.stop()`/`start()`. État vide dessiné : hexagone vide
      en filet, « Votre écrin est vide. », une ligne sur la composition pièce par pièce, bouton
      « Voir la collection » (ferme le tiroir et navigue). Le tiroir s'abonne au panier.
- [x] Navigateur 1440 et 390 : tiroir au clavier seul (Tab, Maj+Tab, Échap), menu mobile,
      captures. Console : 0 erreur.

### Tâche 10 : micro-détails

- [x] Charger le skill `ecc:make-interfaces-feel-better`. Passer sur nav, boutons, pastilles,
      tiroir, menu, rideau, intro : zones de clic ≥ 44 px, états `:hover`/`:active`/
      `:focus-visible`, retour tactile (`:active` en `--dur-micro`), ombres et filets cohérents,
      rayons concentriques, `font-variant-numeric: tabular-nums` sur prix et compteurs,
      `text-wrap: balance` sur les titres, `-webkit-tap-highlight-color`, `touch-action`,
      sélection de texte et curseurs. Un seul lot de corrections, puis une capture 1440 + 390.

### Tâche 11 : revue impeccable, corrections, DESIGN.md

- [x] `impeccable.cmd detect --json` sur `index.html`, `css/`, `js/ui/`, `js/pages/` ; corriger
      ce qui est mécanique.
- [x] Captures valides (animations d'entrée terminées) : `.impeccable/review/desktop.png`
      (1440, pleine page, accueil) et `mobile.png` (390).
- [x] Lancer l'agent `impeccable-finish-reviewer` (contexte neuf) avec : la demande du user, le
      choix de direction, le chemin du site, les captures, le contrat de direction, les
      résultats du détecteur, la planche choisie (`_sources/directions/direction-<x>-1440.png`)
      comme référence de critique (construction pilotée par le code), le chemin de
      `craft-floor.md`.
- [x] Appliquer sa disposition (`fix` : un lot, recapture, passe de verdict par le même agent ;
      deux tours au plus). Rapporter le verdict tel quel.
- [x] Lancer `impeccable-documenter` : `DESIGN.md` et son fichier compagnon écrits depuis le
      site construit. Vérifier que `css/tokens.css` et `DESIGN.md` concordent.

### Tâche 12 : vérification et livraison. **ARRÊT**

- [x] Chrome DevTools MCP, onglet au premier plan, 1440×900 puis 390×844 (émulation mobile +
      tactile). Captures dans `docs/validation/` :
      `jalon2-01-intro-1440.jpeg` (compteur en cours), `jalon2-02-accueil-1440`,
      `jalon2-03-collection-1440`, `jalon2-04-montre-1440`, `jalon2-05-transition-1440` (rideau
      à mi-course, montre au-dessus), `jalon2-06-ecrin-1440`, `jalon2-07-introuvable-1440`,
      `jalon2-08-accueil-390`, `jalon2-09-menu-390`, `jalon2-10-ecrin-390`,
      `jalon2-11-reduit-1440`. Ouvrir chaque fichier et vérifier son contenu.
- [x] Console : `list_console_messages` → 0 erreur, 0 avertissement du site, sur tout le
      parcours (intro, 6 routes, tiroir, menu, précédent/suivant).
- [x] Images/s (`evaluate_script`, rAF sur 3 s, moyenne et 95e centile des intervalles) :
      pendant une transition de page, pendant un défilement Lenis de toute la page d'accueil,
      pendant l'intro. Attendu bureau : moyenne ≥ 58 i/s, 95e centile ≤ 20 ms. Au repos 3 s :
      `stats.renders` inchangé.
- [x] Mise en page : `PerformanceObserver('layout-shift')` sur tout le parcours, cumul < 0,01.
- [x] Mouvement réduit : `?mouvement=reduit` → pas d'intro animée, pas de Lenis
      (`__morion.scroll.lenis === null`), transitions en fondu, montre posée sans voyage. Puis
      preuve de la vraie requête média : Chrome sans tête avec le drapeau
      `--force-prefers-reduced-motion`
      (`"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --force-prefers-reduced-motion --virtual-time-budget=6000 --dump-dom http://127.0.0.1:8781/`)
      → `<html` porte la classe `reduit`.
- [x] `node --test tests/*.test.js` → tout vert (10 du jalon 1 + les nouveaux).
- [x] Depuis la racine `anti-stitch/` : `python3 graphify-out/refresh_projects.py`.
- [x] Mettre à jour la mémoire `morion-watch-ecommerce.md` (jalon 2 livré, direction choisie,
      pièges nouveaux).
- [x] Livrer au user : captures clés (SendUserFile), lien `http://127.0.0.1:8781/`, mesures
      (images/s, durée de l'intro, cumul de décalage), verdict du relecteur, écarts restants.
      **Ne pas commencer le jalon 3 sans son feu vert.**
