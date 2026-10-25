// Défilement doux : Lenis sur gsap.ticker, ScrollTrigger synchronisé. Défilement natif en mode réduit.
export function createScroll({ reduced }) {
  const { gsap, ScrollTrigger, Lenis } = window;
  gsap.registerPlugin(ScrollTrigger);
  const listeners = new Set();
  // la position est transmise par l'appelant quand il la connaît (Lenis) : relire window.scrollY ici
  // forcerait un recalcul des styles à chaque abonné.
  const emit = (y = window.scrollY) => listeners.forEach((fn) => fn(y));

  if (reduced || !Lenis) {
    window.addEventListener('scroll', () => { ScrollTrigger.update(); emit(); }, { passive: true });
    return {
      lenis: null,
      to: (y) => window.scrollTo(0, y),
      stop() {}, start() {},
      onScroll(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    };
  }

  // Réglages de Lenis par défaut (lerp 0,1), comme 60fps (docs/references-mouvement.md).
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.4 });
  // ScrollTrigger lit la position chez Lenis (un nombre) au lieu de window.scrollY : cette lecture
  // force le navigateur à recalculer les styles dès qu'une écriture la précède dans l'image
  // (mesuré : ~1,5 s de recalculs forcés pour 3 s de défilement, téléphone au processeur ÷4).
  // taille de la fenêtre relevée au redimensionnement : relire innerWidth à chaque image peut, lui
  // aussi, forcer la mise en page
  const vue = { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
  window.addEventListener('resize', () => { vue.width = window.innerWidth; vue.height = window.innerHeight; });
  ScrollTrigger.scrollerProxy(document.scrollingElement || document.documentElement, {
    scrollTop(v) {
      if (arguments.length) { lenis.scrollTo(v, { immediate: true, force: true }); return undefined; }
      return lenis.scroll;
    },
    getBoundingClientRect: () => vue,
    pinType: 'fixed',
  });
  lenis.on('scroll', () => { ScrollTrigger.update(); emit(lenis.scroll); });
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return {
    lenis,
    to: (y, { immediate = true, duration } = {}) => lenis.scrollTo(y, { immediate, force: true, duration }),
    stop: () => lenis.stop(),
    start: () => lenis.start(),
    onScroll(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
}
