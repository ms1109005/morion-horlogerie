// Démarrage du site : chargement suivi, scène 3D persistante, défilement, routeur, intro, nav, tiroir.
import { isReduced, DUR, EASE } from './core/motion.js';
import { createLoadTracker } from './core/loader.js';
import { createScroll } from './core/scroll.js';
import { createRouter } from './core/router.js';
import { createStage } from './stage/renderer.js';
import { createDirector } from './stage/director.js';
import { buildWatch } from './watch/build.js';
import { defaultConfig } from './store/config.js';
import { createCart } from './store/cart.js';
import { DIAL_FONT } from './watch/dial.js';
import {
  brushedLinear, polishSmudge, tapisserieNormal, azurageNormal, perlageNormal, cotesNormal, libererGPU,
} from './watch/textures.js';
import { createRehaut } from './ui/rehaut.js';
import { createTransition } from './ui/transition.js';
import { createNav } from './ui/nav.js';
import { createDrawer } from './ui/drawer.js';
import { brancherLignes } from './ui/panier-lignes.js';
import { playIntro, introDejaVue } from './ui/intro.js';

const { gsap } = window;
const reduced = isReduced();
document.documentElement.classList.toggle('reduit', reduced);

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));
const PRECHAUFFE = [brushedLinear, polishSmudge, tapisserieNormal, azurageNormal, perlageNormal, cotesNormal];
const $ = (s) => document.querySelector(s);
const tracker = createLoadTracker();
const intro = !introDejaVue() && $('#intro');

// Fontes : le texte et les impressions du cadran (dessinées dans les textures de la montre).
const FONTES = ['400 1em "Albert Sans"', '500 1em "Albert Sans"', '600 1em "Albert Sans"', '400 1em Michroma',
  `400 40px ${DIAL_FONT}`, `700 40px ${DIAL_FONT}`];
const fontsReady = tracker.track(Promise.all(FONTES.map((f) => document.fonts.load(f))), 2);

const scroll = createScroll({ reduced });
if (intro) scroll.stop();
const rehaut = createRehaut($('#rehaut'), { scroll, reduced });
scroll.onScroll((y) => document.documentElement.classList.toggle('defile', y > 40));
const cart = createCart();
const annonce = (t) => { $('#annonce').textContent = t; };

// Densité : au moins 1,5 sur écran large (netteté du métal), au plus 2 ; 1,5 au plus sur mobile.
const narrow = window.innerWidth < 720;
const dpr = narrow
  ? Math.min(window.devicePixelRatio || 1, 1.5)
  : Math.min(Math.max(window.devicePixelRatio || 1, 1.5), 2);

// Sans WebGL : le site reste complet, la montre en moins.
const directeurVide = {
  ready: Promise.resolve(), state: {}, watch: null,
  pose: () => Promise.resolve(), to: () => Promise.resolve(), setConfig: () => Promise.resolve(),
  apply() {}, setTilt() {}, current: null,
};

// Étapes du chargement 3D, déclarées d’avance : le compteur de l’intro avance à chaque étape.
const etape = (poids) => { let fin; tracker.track(new Promise((r) => { fin = r; }), poids); return fin; };
const etapes = {
  scene: etape(1),
  textures: PRECHAUFFE.map(() => etape(0.5)),
  montre: etape(1.5),
  shaders: etape(1.5),
};
const toutesEtapes = () => [etapes.scene, ...etapes.textures, etapes.montre, etapes.shaders].forEach((f) => f());

const scene3d = fontsReady.then(async () => {
  performance.mark('morion:fontes');
  await nextFrame();
  const stage = createStage($('#scene'), { controls: false, loop: 'demande', dpr, env: 'ecrin', exposure: 1.0, envIntensity: 1, keyLight: 0.7 });
  etapes.scene();
  performance.mark('morion:scene');
  // Textures générées pixel par pixel : une par image, pour que l’intro ne se fige pas.
  for (let i = 0; i < PRECHAUFFE.length; i += 1) {
    await nextFrame();
    PRECHAUFFE[i]();
    etapes.textures[i]();
  }
  performance.mark('morion:textures');
  await nextFrame();
  const watch = buildWatch(defaultConfig('PR42', 'AC'));
  etapes.montre();
  performance.mark('morion:montre');
  const director = createDirector(stage, watch, { reduced, halo: $('#halo') });
  // Une seule boucle : Lenis (ajouté par createScroll) puis la scène.
  gsap.ticker.add((time, deltaMs) => stage.tick(Math.min(deltaMs / 1000, 0.05)));
  await director.ready;
  etapes.shaders();
  performance.mark('morion:shaders');
  return { stage, director, watch };
}).catch((e) => {
  console.warn('3D indisponible :', e);
  document.documentElement.classList.add('sans-3d');
  toutesEtapes();
  return { stage: null, director: directeurVide, watch: null };
});
// La première page compte aussi dans le chargement : l’intro ne s’ouvre que sur une page montée.
let pageMontee;
tracker.track(new Promise((r) => { pageMontee = r; }), 1);

// L’intro démarre tout de suite ; son compteur suit le chargement ci-dessus.
const debutIntro = performance.now();
const introJouee = intro ? playIntro({ el: intro, tracker, reduced, onUnlock: () => scroll.start() }) : null;
if (intro) annonce('Chargement');

const { stage, director } = await scene3d;

const app = { reduced, scroll, rehaut, cart, stage, director, annonce };

const drawer = createDrawer({ panel: $('#panier'), voile: $('[data-voile]'), cart, scroll, reduced });
brancherLignes($('#panier'), cart, drawer);
app.drawer = drawer;
const nav = createNav({ nav: $('#nav'), menu: $('#menu'), cart, scroll, reduced, onOpenCart: (from) => drawer.open(from) });

const router = createRouter({
  root: new URL('.', document.baseURI).pathname,
  outlet: $('#page'),
  front: $('#avant'),
  transition: createTransition($('.rideau'), { reduced }),
  app,
  beforeLeave: () => { drawer.close({ restore: false }); nav.fermerMenu(); },
  // Les textures des montres de la page quittée (salles, vitrine, autres familles) restent sinon
  // au GPU toute la visite : sur iPhone la mémoire finit par déborder et Safari ferme la page.
  afterCleanup: () => { if (stage) libererGPU(stage.scene); },
  onRoute: (match, { first, title }) => {
    nav.setActive(match.name);
    if (!first) annonce(`Page : ${title}`);
  },
});
app.router = router;
window.__morion = app;

// Première route montée sous l’intro (ou directement), puis révélation.
if (!intro && director.state && !reduced) { director.state.k = 0; director.apply(); }
await router.start();
pageMontee();

if (intro) {
  await introJouee;
  app.mesures = { introDebut: Math.round(debutIntro), introFin: Math.round(performance.now()) };
  annonce('');
} else if (!reduced && director.watch) {
  // Visite suivante de la session : la montre s’installe d’un geste court.
  // … jusqu’à l’échelle de sa pose (0 sur la collection, qui a ses propres montres).
  const k = director.poses[director.current]?.k ?? 1;
  gsap.to(director.state, { k, duration: DUR.moyen, ease: EASE.sortie, onUpdate: director.apply });
}
router.enter();
