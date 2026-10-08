// Défilement doux : Lenis sur gsap.ticker, ScrollTrigger synchronisé. Défilement natif en mode réduit.
export function createScroll({ reduced }) {
  const { gsap, ScrollTrigger, Lenis } = window;
  gsap.registerPlugin(ScrollTrigger);
  const listeners = new Set();
  const emit = () => listeners.forEach((fn) => fn(window.scrollY));

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
  lenis.on('scroll', () => { ScrollTrigger.update(); emit(); });
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
