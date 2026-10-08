# Références mouvement : mécaniques d'animation

Analyse technique de 4 sites horlogers/luxe pour calibrer l'échelle de mouvement de MORION
(GSAP 3.12.5 + ScrollTrigger + Lenis + three.js, sans build). Aucun texte, image ou marque
n'est repris : uniquement des chiffres (durées, easings) et des mécanismes.

Méthode : Chrome DevTools MCP, `evaluate_script` sur les pages en avant-plan
(`select_page` + `bringToFront:true` avant chaque mesure), lecture directe de
`gsap.globalTimeline`, `ScrollTrigger.getAll()`, `document.getAnimations()` quand exposés,
et sinon extraction par regex du texte des bundles JS via `fetch()` (durées, `ease:"..."`,
`cubic-bezier(...)`) avec au moins 60 à 150 caractères de contexte autour de chaque
occurrence. Captures d'écran limitées à 2-3 par site, dans le dossier scratch de la session
(non commitées).

Chaque ligne est marquée **[mesuré]** (valeur lue en direct dans le DOM/le runtime ou trouvée
littéralement dans le code livré) ou **[déduit]** (inférée du comportement visuel ou d'un
nom de variable, sans lecture directe de la valeur).

---

## 1. thewatch.60fps.fr : montre 3D éclatée + line-up final

### Stack détectée
- three.js : `window.THREE` exposé, `WebGL2` actif, pas de `REVISION` accessible **[mesuré]**.
- GSAP + ScrollTrigger : bundlés (non exposés sur `window`), confirmés par grep du code
  source (`the-watch.*.js`, `index-*.js`) : littéraux `ease:"power4.out"`, `ScrollTrigger`,
  `gsap` présents en clair malgré la minification **[mesuré]**.
- Lenis 1.0.42 : `window.lenisVersion === "1.0.42"` **[mesuré]** ; classes `lenis lenis-smooth`
  sur `<html>` **[mesuré]**. Instance non exposée sur `window.lenis`, donc `lerp` /
  `wheelMultiplier` réels non lisibles ; aucun override de ces options trouvé dans le bundle
  (`lerp:`, `wheelMultiplier:` absents) → **[déduit]** Lenis tourne avec ses valeurs par défaut
  (lerp ≈ 0.1, duration ≈ 1.2s).
- Framework : bundle Vite (`assets/index-*.js`, `the-watch.*.js`), pas de Next/Nuxt détecté.

### Tableau effet | déclencheur | durée | easing | mécanique

| Effet | Déclencheur | Durée | Easing | Mécanique |
|---|---|---|---|---|
| Éclaté axial de la montre | scroll (scrub) | scrub `2` (lissage ~2s de retard sur le scroll) **[mesuré]** | `power3.inOut` sur les couleurs de fond associées **[mesuré]** | `<canvas>` en `position:fixed` plein écran par-dessus un conteneur de scroll factice très haut (29132px desktop / 31571px mobile, soit ~40x la hauteur de viewport) **[mesuré]**. Le scroll ne fait qu'avancer la progression 0→1 d'une timeline GSAP qui pilote les transforms three.js des pièces ; pas de `ScrollTrigger.create` avec `pin:` trouvé : le pin est inutile car le canvas est déjà fixed **[mesuré]**. |
| Durée totale de la timeline d'éclaté | n/a | `this.tlD = sectionHeight + viewportHeight` (en pixels de scroll, pas en secondes) **[mesuré]** | n/a | La timeline principale utilise une unité "pixel de scroll" : tous les sous-tweens sont exprimés en fractions de `tlD` (`.1*tlD`, `.25*tlD`, `.6*tlD`...), donc la vitesse perçue dépend de la hauteur de la section, pas d'une durée fixe. |
| Titres qui balaient à l'écran pendant l'éclaté | scroll (dans la timeline `tlD`) | `duration: window.innerHeight` (en "pixels"), stagger `tlD*.005` **[mesuré]** | `power4.out` (entrée), `power4.in` (sortie) **[mesuré]** | Split par caractères (`titleSplit.chars`), `x/y` de ±50% avec stagger proportionnel à la durée totale de la scène. |
| Changement de couleur du fond au scroll (bandeau bas) | `ScrollTrigger` scrub sur des blocs texte | scrub `2`, `start:"-100% 55%"`, `end:"100% 45%"` **[mesuré]** | `power3.inOut` **[mesuré]** | Anime la propriété `color` du texte (pas du fond) entre deux teintes fixes selon la position de l'élément par rapport au centre du viewport. |
| Curseur qui suit la souris (icônes hover) | mousemove | `1.3s` **[mesuré]** | `power4.out` **[mesuré]** | `gsap.quickTo()` sur x/y, lissage classique du curseur custom, sans lien avec la 3D. |
| Changement de configuration (couleurs cadran/bracelet) | clic sur un swatch | `1.2s` (transition CSS vars couleur), texte croisé en `0.5s` **[mesuré]** | `power3.inOut` (couleurs), `none` (texte) **[mesuré]** | `changeConfigTl` : tween simultané des `--first-color`/`--second-color` (CSS custom properties) et fondu enchaîné du texte descriptif. |
| Bloc "bas de page" (dial + wrappers) qui apparaît | scroll dans le viewport | scrub `true` (lié au scroll, pas de durée fixe), `start:"top 90%"`, `end:"bottom 10%"` **[mesuré]** | n/a (fromTo opacity, pas d'ease spécifié = défaut GSAP `power1.out`) | Stagger `0.15` entre 3 blocs. |

### Notes 3D / rendu
- 1 seul canvas WebGL2, rendu continu confirmé : ~121 frames en 2s au repos (~60fps) **[mesuré]**
  avec l'onglet au premier plan (sans `bringToFront:true`, ce chiffre tombe à ~1-2 fps, artefact
  d'exécution en arrière-plan à ne pas confondre avec le vrai framerate).
- `devicePixelRatio` machine de test = 1.25 ; le canvas est rendu exactement à ce ratio
  (1785×920 pour un CSS de 1428.8×736) **[mesuré]**, sans cap volontaire au-delà du DPR réel
  observé ici (à vérifier sur un écran Retina 2x/3x, non testé).
- Mobile (390px) : même mécanique (canvas fixed + scroll factice), DPR pleinement appliqué
  (780×1688 pour 390×844 @2x), la page de scroll est même légèrement plus longue qu'en desktop
  (31571px vs 29132px) **[mesuré]**.
- Alignement final des 4 montres : atteint en toute fin de scroll factice (~92% de la hauteur
  totale) ; capturé en screenshot mais timeline précise non isolée (mécanique déduite comme la
  suite logique du même système de scrub, pas un composant séparé) **[déduit]**.

---

## 2. atom.uprock.pro : intro d'entrée + fonds qui changent de couleur au scroll

### Stack détectée
- GSAP 3.13.0 exposé (`window.gsap.version`), ScrollTrigger + ScrollToPlugin chargés depuis
  jsDelivr **[mesuré]**.
- Pas de Lenis, pas de three.js, pas de canvas (0) **[mesuré]**.
- jQuery 1.10.2 + bundle maison (`common.min.js`) + Lottie Player 2.0.4 (probablement pour de
  petites icônes animées annexes, non liées à l'intro principale) **[mesuré]**.
- Marqueurs de classes (`div--u-xxxxx`, `section--u-xxxxx`, `dark-area`/`light-area`) typiques
  d'un site construit avec **Tilda** **[déduit, fort]**.
- Seulement 4 `ScrollTrigger` actifs sur toute la page (dont 1 seul avec `pin:true`, sur
  `.section-essence__sticky-wrapper`) **[mesuré]** : la plupart des effets de section ne passent
  pas par ScrollTrigger mais par le moteur interne de Tilda.

### Tableau effet | déclencheur | durée | easing | mécanique

| Effet | Déclencheur | Durée | Easing | Mécanique |
|---|---|---|---|---|
| Intro / preloader au chargement | chargement de page (auto, scroll bloqué par `body.no-scroll`) **[mesuré]** | **~6,6s** du chargement à la fin du fondu, déblocage du scroll dès **~5,3s** (avant la fin visuelle) **[mesuré]** | Courbes de type ease-out sur les fondus (valeurs d'opacité mesurées à 0,29 / 0,63 / 0,76 / 0,8 sur 600ms : décélération nette, cohérent avec `power2`/`power3.out`) **[déduit de l'échantillonnage]** | Voir chronologie détaillée ci-dessous. |
| Carré rouge (accent) qui tourne puis disparaît | pendant l'intro, ~t=2,6s | rotation 90° en ~200ms (2,6→2,8s), fondu 1→0 en ~100-150ms (2,9→3,0s) **[mesuré]** | rotation quasi linéaire (accélération non résolue à cette résolution d'échantillonnage) | `transform: rotate()` + `opacity` sur `.section-preloader__anim-red`. |
| Icône "+" qui sort du cadre | pendant l'intro, ~t=3,3-3,4s | saut net, non interpolé à notre résolution de 100ms (probablement < 100ms, un `.set()` plutôt qu'un tween) **[déduit]** | n/a | `translateY(-900px)` en une seule fois. |
| Carré blanc (accent) qui tourne | pendant l'intro, ~t=3,3-3,6s | rotation 90° en ~300ms **[mesuré]** | n/a | Idem carré rouge, décalé dans le temps. |
| Crossfade montre 1 → montre 2 (visuel final de l'intro) | pendant l'intro | montre 1 : 0→0,8 en ~600ms (3,4→4,0s), palier jusqu'à 5,4s, puis 0,8→0 en ~1,2s (5,4→6,6s). Montre 2 : 0→1 en ~2,1s (4,2→6,3s) **[mesuré]** | ease-out prononcé sur les deux fondus (déduit des valeurs intermédiaires) | Deux `<img>` superposées, opacité pilotée indépendamment ; le chevauchement réel des deux fondus ne couvre que le dernier tiers (~5,4-6,3s). |
| Changement de couleur de fond/texte au scroll | une nouvelle section (`dark-area`/`light-area`) entre dans le viewport | **instantané, 0 interpolation** : `transition-duration: 0s` mesuré sur la section couleur, le header et son logo **[mesuré]** | n/a | Chaque section a une couleur de fond plate fixe (`rgb(242,242,242)` clair / `rgb(15,15,15)` ou `rgb(0,0,0)` sombre) posée en CSS ; il n'y a pas de dégradé de couleur scrubé au scroll, seulement un panneau opaque qui succède au précédent. Le "changement" perçu est un effet de bord du scroll (nouveau panneau plein cadre), pas une interpolation `rgb()`. |

### Chronologie mesurée de l'intro (échantillonnage 100-200ms, 0 → 6,6s)
0-0,5s : état initial (montre 1 visible à 0,8 d'opacité) → fondu à 0 en ~300-400ms.
0,5-2,6s : palier statique (~2,1s), probablement le temps du dessin du logo/de la police
(classe `wf-inactive` = webfonts pas encore chargées au 1er sample).
2,6-3,0s : carré rouge tourne puis disparaît.
3,3-3,4s : icône "+" saute hors cadre ; montre 1 recommence à apparaître.
3,3-3,6s : carré blanc tourne.
3,4-4,0s : montre 1 remonte à 0,8 d'opacité.
4,0-5,3s : palier (montre 1 à 0,8), montre 2 commence à apparaître dès 4,2s.
5,3s : scroll débloqué (`no-scroll` retiré), **avant** la fin du fondu visuel.
5,4-6,6s : montre 1 termine son fondu vers 0 pendant que montre 2 termine vers 1.

**Rejoue à chaque visite ?** Aucune clé `sessionStorage`/`localStorage` trouvée avant ou après
l'intro **[mesuré]** → l'intro rejoue à chaque chargement, elle n'est pas mémorisée.
**Passable ?** Le scroll est débloqué dès 5,3s, donc un utilisateur peut scroller pour
"passer" la fin du fondu, mais aucun bouton "skip" explicite trouvé.

### Mobile (390px)
L'intro est **désactivée** en dessous du breakpoint mobile : `.section-preloader` est en
`display:none` dès le premier échantillon (t=275ms) et le reste sur toute la fenêtre de test
(4s) **[mesuré]**. Ce n'est pas un intro accéléré, c'est un intro purement supprimé sur mobile.

---

## 3. penarosawatches.com : configurateur hero (montre)

### Stack détectée
- Pas de GSAP, pas de ScrollTrigger, pas de Lenis, pas de three.js, 0 canvas **[mesuré]**.
- Bundle maison (`app.min*.js`), pas de framework JS moderne détecté.
- Un unique `<video>` (`intro_create_your_look.mp4`, 29,48s) présent dans le DOM mais **non
  lié** au changement de couleur du configurateur, testé en cliquant deux swatches différents
  (`Ring_Emberglow`, `Ring_Lavender`) : `currentTime` reste à 0 et `paused` reste `true` dans
  les deux cas **[mesuré]**. Cette vidéo appartient probablement à la fonctionnalité séparée
  "360° Personalization" (page dédiée `/360-personalization/`), pas au configurateur du hero.

### Tableau effet | déclencheur | durée | easing | mécanique

| Effet | Déclencheur | Durée | Easing | Mécanique |
|---|---|---|---|---|
| Changement de matière/couleur (cadran, boîtier, bracelet, anneau) | clic sur un swatch de couleur | **0,8s** **[mesuré]** | `ease` CSS par défaut (`cubic-bezier(0.25,0.1,0.25,1)`) **[mesuré]** | 4 calques (`part-layer` : `part-cat-1` à `4` = anneau/cadran/boîtier/bracelet), chacun contient un `<div class="part">` par option de couleur en `background-image` (PNG statique pré-rendu à un angle fixe). Un seul `.part` a la classe `is-active` (opacity 1) à la fois par catégorie ; le changement = simple crossfade CSS `opacity` (`transition: all 0.8s ease`) entre l'ancien et le nouveau calque, pas une interpolation de couleur ni un rendu 3D temps réel. |
| Feedback sur le swatch cliqué (highlight) | clic | **instantané, 0s** **[mesuré]** | n/a | Le swatch actif change de classe (`is-active`) sans transition ; seul le rendu de la montre est animé, pas l'UI de sélection. |
| Bouton "360° Video Personalization" | clic | non testé (fonctionnalité séparée, hors du hero) | n/a | Renvoie vers une expérience dédiée avec la vraie vidéo scrubbable ; distinct du configurateur simple du hero. |

### Mesuré vs déduit
Tout le tableau ci-dessus est **mesuré** directement (attributs `data-code`, classes
`is-active`, `getComputedStyle().transition`). Rien n'a dû être déduit ici : le mécanisme est
une simple superposition de PNG avec crossfade CSS, sans bibliothèque de mouvement.

### Mobile (390px)
Les swatches de couleur ne sont pas affichés par défaut : seuls des points tactiles blancs
neutres restent visibles sur la montre (`is-active-mobile`), qui doivent être tapés pour
révéler la liste de couleurs correspondante **[mesuré via capture]** : un pattern de
divulgation progressive absent du desktop où tous les swatches sont visibles d'emblée.

---

## 4. cartier-waw-0225.dev.60fps.fr : navigation par scènes

### Stack détectée
- Application **Svelte** (classes `svelte-xxxxx`) encapsulée dans un web component
  `<sixtyfps-app>` avec **Shadow DOM ouvert** (invisible à un simple
  `document.querySelectorAll`, il faut traverser les `shadowRoot` pour trouver le canvas et
  les vidéos) **[mesuré]**.
- three.js + GSAP + ScrollTrigger réels, confirmés par grep du bundle principal
  (`sixftyfps-waw-app.js`, 1,3 Mo) : occurrences littérales de `THREE`, `gsap`/`GSAP`,
  `ScrollTrigger.create`, `fov:81.2` **[mesuré]**. Le second bundle (`App-*.js`, 237 Ko)
  contient un système d'easing maison nommé `immg.cubicOut` utilisé en parallèle des eases
  GSAP classiques, probablement un fallback CSS pour les éléments hors WebGL.
- Navigation par **hash + History API** : le bundle contient littéralement `location.hash`,
  `popstate` et `pushState` **[mesuré]**. `/#tank-lc` charge directement une scène produit
  (Tank Louis Cartier), confirmant le hash-routing pour le deep-linking.
- Shadow DOM contient aussi 5 `<video>` (dont `tankguichet/tunel.mp4`, 118,84s, et deux vidéos
  "outro" 2023/2024 de ~10s et ~5,6s), utilisées comme habillage de certaines scènes plutôt
  que tout en WebGL **[mesuré]**.

### Tableau effet | déclencheur | durée | easing | mécanique

| Effet | Déclencheur | Durée | Easing | Mécanique |
|---|---|---|---|---|
| Ouverture de rideau ("curtainsLR") | entrée dans une scène / intro | **0,2s** **[mesuré dans le code]** | `linear` **[mesuré]** | Deux panneaux (gauche/droite) pilotés par un uniform shader `uOpenProgress2`, stagger `0,01s` entre les deux. Très rapide et net, pas de ease visible (linéaire). |
| Transition du sol ("uGroundTransition") | changement de scène | non isolée avec précision (coupée dans l'extraction) | `power2.inOut` (déduit du nom de variable coupé "power2.i...") **[déduit]** | Fondu/uniform shader sur le matériau du sol, 0→1. |
| Apparition du texte éditorial (lignes) | entrée de section | **0,12s** par élément, stagger **0,01s** **[mesuré]** | `none` (fondu linéaire d'opacité, pas de courbe) **[mesuré]** | `autoAlpha` (opacity+visibility) sur les enfants d'un conteneur (`r.children`), démarré à `+0,4s` dans la timeline locale. Un second groupe fantôme (probablement un flou/ghost dupliqué) fait le même mouvement vers une opacité plafonnée à 0,3, avec une durée doublée (`0,12*2` = 0,24s). |
| Timeline de progression du loader | chargement | **3,3s** de montée vers une valeur de 0,6, stagger 0,1s, ease composite `uM("power2.inOut","power3.out","power1.out")` (mélange de 3 eases nommées, fonction maison) **[mesuré dans le code]**, déclenché à `+2,5s` | n/a | Semble piloter une barre ou un halo de progression pendant le chargement des assets 3D. |
| Voyage caméra dans une scène produit ("tankguichet") | scroll / auto | chaque segment du trajet = fraction `120/720` (= 1/6) du parcours total, avec angle et point de visée (`lookAt`) définis par segment **[mesuré dans le code]** | non explicité en tant que GSAP `ease` pour ce tableau de points (probablement interpolé par une spline Catmull-Rom ou équivalent, pas un tween ease-in/out classique) **[déduit]** | La caméra suit un chemin scripté à 6 points de contrôle (angle + `lookAt`) autour de la vitrine produit, pas une orbite libre. |
| Rendu WebGL | continu | ~113 frames / 2s au repos (~56 fps) **[mesuré]**, canvas rendu à **1,5x** la taille CSS sur desktop bien que `devicePixelRatio` réel = 1.0 (`2400×1350` pour un CSS de `1600×900`) **[mesuré]** ; sur mobile le canvas colle exactement au DPR natif (`780×1688` pour `390×844 @2x`, soit 2x sans facteur supplémentaire) **[mesuré]** | n/a | Cap de qualité adaptatif : supersampling forcé à 1,5x minimum sur desktop (au lieu de suivre le DPR réel de l'écran), mais pas au-delà de 2x sur mobile, probablement `clamp(dpr, 1.5, 2)` ou équivalent. |

### Limite mesurée : navigation scène-à-scène non déclenchable automatiquement
Les boutons "Découvrir" (CTA internes, classe `sixtyfps-universe-cta`) n'ont pas réagi à un
`.click()` JavaScript direct (aucun changement de `location.href`/`pushState` observé sur
plusieurs tentatives), et le seul bouton qui a réagi dans la scène `#tank-lc`
("La collection Panthère de Cartier") s'est avéré être un lien externe vers cartier.com
(`data-link`), pas une navigation interne. La durée réelle, chronométrée à l'horloge, d'un
voyage caméra entre deux salles n'a donc **pas pu être mesurée en direct**, probablement parce
que le framework attend un vrai geste pointeur (pointerdown/pointerup avec coordonnées) plutôt
qu'un `.click()` synthétique. Les chiffres de trajectoire caméra ci-dessus viennent uniquement
de l'analyse statique du bundle, pas d'un chronométrage à l'écran.

### Mobile (390px)
Rendu WebGL confirmé actif (canvas présent avec DPR natif appliqué), scène d'accueil identique
structurellement au desktop dans la capture ; navigation tactile non testée en profondeur pour
la même raison que ci-dessus (gestes synthétiques non pris en compte par le framework).

---

## Synthèse : échelle de mouvement pour MORION

### Durées et easings récurrents observés
- **Crossfades / changements d'état ponctuels : 0,2 à 1,2s.** Penarosa (0,8s ease), 60fps
  (config 1,2s `power3.inOut` / texte 0,5s `none`), Cartier (rideau 0,2s `linear`, sol
  probablement `power2.inOut`).
- **Reveals de texte : très courts par élément (0,1-0,15s) avec stagger minuscule (0,01-0,03s).**
  Cartier : 0,12s par ligne, stagger 0,01s, ease `none`. 60fps : stagger `0,03` à `0,15` selon
  le bloc, ease `power3`/`power4.out`.
  → Un reveal "premium" n'est pas un long fondu individuel, c'est une **vague rapide** de
  petits fondus quasi simultanés.
- **Easings dominants : familles `power2`/`power3`/`power4`, variantes `.out` à l'entrée,
  `.inOut` pour les transitions d'état, `none`/`linear` pour les scrubs liés au scroll et les
  ouvertures nettes (rideaux).** Aucun `elastic`/`bounce` observé sur ces 4 sites : le registre
  horloger reste sobre, jamais ludique.
- **Scrub scroll : facteur 2 (60fps) ou `true` (lissage par défaut GSAP ~0,5-1s de retard).**
  Pas de valeurs > 2 observées : un scrub trop lourd (retard > 2s) n'a pas été jugé nécessaire
  même sur une séquence 3D complexe.
- **Intro d'entrée : ordre de grandeur 6-7s tout compris (Atom), mais utilisable dès ~5,3s**
  (déblocage du scroll avant la fin visuelle). Aucun des 4 sites n'a une intro de 1-2s : quand
  il y en a une, elle est longue et chorégraphiée, jamais un simple spinner.
- **Configurateur (changement d'option) : 0,8s.** Seule donnée directement comparable au futur
  configurateur MORION (changement de couleur/matière) : Penarosa règle ça en 0,8s ease CSS
  simple, sans bibliothèque de easing dédiée.
- **Changement de couleur au scroll : net, pas interpolé.** Contrairement à l'intuition d'un
  dégradé `rgb()` scrubé, Atom bascule les couleurs de fond de façon abrupte à chaque nouvelle
  section (transition CSS à 0s), l'impression de fluidité venant du scroll physique du panneau
  suivant, pas d'une interpolation de couleur.

### 8 enseignements chiffrés pour l'échelle de mouvement MORION

1. **Intro d'ouverture ≈ 2,4s visée** : plus courte que les 6-7s d'Atom (qui est un cas extrême
   avec scroll bloqué), mais garder le principe d'un déblocage du scroll/interaction *avant* la
   toute fin du fondu (comme Atom à 5,3s/6,6s, soit ~80% du temps total) pour ne jamais donner
   l'impression que l'utilisateur attend inutilement.
2. **Transitions de page/section : 0,6 à 1,2s, `power2.out` ou `power3.inOut`.** Aligné avec le
   `1,2s power3.inOut` du changement de config 60fps et le `0,8s ease` de Penarosa : viser
   **0,8s** comme valeur par défaut pour toute transition d'état visible (couleur, calque,
   contenu).
3. **Reveals de texte : 0,6 à 0,9s par bloc perçu, mais construits avec des sous-éléments de
   0,1-0,15s chacun et un stagger de 0,02-0,04s.** Ne jamais faire un seul fondu de paragraphe
   de 0,8s : découper en lignes/mots avec un stagger court donne le même rythme perçu mais
   paraît plus "fait main".
4. **Changement d'option du configurateur (matière/couleur bracelet, cadran) : 0,8s crossfade
   CSS simple, `ease` par défaut.** Ne pas complexifier avec GSAP si un simple `transition:
   opacity 0.8s ease` suffit (cas Penarosa), réserver GSAP aux séquences avec plusieurs
   propriétés liées (comme 60fps qui anime couleur + texte en parallèle en 1,2s/0,5s).
5. **Scrub de scroll pour une séquence 3D (montage/démontage) : facteur 1,5 à 2, jamais au-delà.**
   Reprendre le principe 60fps : canvas `fixed`, un conteneur de scroll factice dont la hauteur
   égale `hauteur de la scène + 1 viewport`, timeline exprimée en fractions de cette hauteur
   plutôt qu'en secondes fixes.
6. **Voyage caméra entre "scènes"/sections 3D : découper en segments égaux (5-8 points de
   contrôle), pas un unique tween ease-in-out d'un point A à un point B.** Cartier utilise 6
   segments de poids égal (1/6 chacun) avec angle + point de visée par segment : un chemin
   scripté donne un rendu plus cinématographique qu'une orbite libre.
7. **Changement de couleur de fond au scroll (si repris) : basculer net entre sections, pas
   interpoler en `rgb()`.** Si MORION veut un effet Atom-like (fond qui change en scrollant),
   prévoir des sections pleine hauteur à couleur plate, pas un scrub de couleur continu,
   moins coûteux à calculer et fidèle à ce qui a été mesuré chez Atom.
8. **Rendu WebGL : cap de qualité `clamp(devicePixelRatio, 1.5, 2)`.** Reprendre le choix
   Cartier plutôt que suivre le DPR brut : force au moins 1,5x sur un écran standard (netteté)
   sans jamais dépasser 2x même sur mobile haute densité (coût de rendu maîtrisé).
9. **Registre d'easing : familles `power2`/`power3`/`power4` uniquement, `.out` pour les
   entrées, `.inOut` pour les états, `none`/`linear` pour les scrubs et les ouvertures nettes.**
   Bannir `elastic`/`bounce`/`back` : aucun des 4 sites horlogers/luxe analysés n'en utilise.
10. **Feedback UI de sélection (swatch actif) : instantané (0s), jamais animé.** Sur Penarosa
    comme sur 60fps, seul le résultat (montre/couleur) est animé ; l'indicateur de sélection
    lui-même change d'état sans transition : réserve le "poids" de l'animation à ce qui a de la
    valeur visuelle, pas à l'accusé de réception du clic.

---

## Limites de cette analyse

- **Cartier** : impossible de déclencher une navigation scène-à-scène par `.click()`
  synthétique (le framework attend probablement un vrai geste pointeur) → durée réelle d'un
  voyage caméra non chronométrée à l'écran, seulement déduite des poids de segments trouvés
  dans le bundle.
- **60fps / Cartier** : GSAP et Lenis ne sont pas exposés sur `window`, donc `lerp`/`duration`
  Lenis réels et le détail complet des `ScrollTrigger` (start/end exacts de chaque section) ne
  sont connus que pour les instances retrouvées littéralement dans le code minifié ; d'autres
  triggers peuvent exister sans laisser de trace textuelle exploitable par regex.
- **Atom** : la chronologie de l'intro a été reconstruite par échantillonnage every ~100-200ms ;
  des transitions plus courtes que cette résolution (notamment le saut du "+") peuvent être
  legèrement moins nettes qu'elles ne le sont réellement.
- Aucun asset (image, vidéo, police) n'a été téléchargé ; toutes les URLs de bundles ont été
  lues via `fetch()` en mémoire uniquement, jamais sauvegardées sur disque.
