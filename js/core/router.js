// Routeur History API. Chaque route charge un module de page (js/pages/*.js) qui rend son HTML
// dans deux calques : #page (sous la montre) et #avant (typographie au-dessus de la montre).
// Transition : le rideau couvre, la montre voyage vers sa nouvelle pose, la page change sous le
// rideau, le rideau découvre, le titre se révèle.
import { matchRoute, toRoutePath, shouldIntercept } from './routes.js';

const LOADERS = {
  accueil: () => import('../pages/home.js'),
  collection: () => import('../pages/collection.js'),
  montre: () => import('../pages/product.js'),
  commande: () => import('../pages/checkout.js'),
  merci: () => import('../pages/confirmation.js'),
  introuvable: () => import('../pages/notfound.js'),
};

export function createRouter({ root, outlet, front, transition, app, onRoute, beforeLeave }) {
  let current = null; // { match, url, mod, cleanup }
  let busy = false;
  let queued = null;
  const positions = new Map();
  const newKey = () => Math.random().toString(36).slice(2, 10);
  let key = history.state?.key ?? newKey();
  history.replaceState({ ...(history.state || {}), key }, '');
  history.scrollRestoration = 'manual';

  const load = (name) => LOADERS[name]().catch((e) => { console.warn('Page non chargée', name, e); return LOADERS.introuvable(); });

  async function go(url, { replace = false, pop = false, first = false } = {}) {
    if (busy) { queued = [url, { replace, pop }]; return; }
    const match = matchRoute(toRoutePath(url.pathname, root));
    if (current && !pop && url.pathname === current.url.pathname && url.search === current.url.search) {
      app.scroll.to(0, { immediate: false });
      return;
    }
    busy = true;
    beforeLeave?.();
    positions.set(key, window.scrollY);
    if (pop) key = history.state?.key ?? newKey();
    else if (!first) { key = newKey(); history[replace ? 'replaceState' : 'pushState']({ key }, '', url); }

    const mod = (await load(match.name)).default;
    const cfg = mod.config?.(match.params, url);

    if (!first) {
      // La montre voyage pendant que le rideau couvre puis découvre : on ne l’attend pas.
      const travel = (cfg ? app.director.setConfig(cfg) : Promise.resolve()).then(() => app.director.pose(mod.pose));
      travel.catch(() => {});
      app.rehaut.tour(1.6);
      await transition.cover();
      try { current?.cleanup?.(); } catch (e) { console.warn(e); }
      window.ScrollTrigger.getAll().forEach((t) => t.kill());
    } else {
      if (cfg) await app.director.setConfig(cfg);
      app.director.pose(mod.pose, { immediate: true });
    }

    const { page, avant = '' } = mod.render(match.params, url);
    outlet.innerHTML = page;
    front.innerHTML = avant;
    document.title = `${mod.title(match.params)} · MORION`;
    app.scroll.to(pop ? (positions.get(key) ?? 0) : 0);
    let cleanup = null;
    try {
      cleanup = mod.mount?.({ el: outlet, front, params: match.params, url, app }) || null;
    } catch (e) { console.error(e); }
    window.ScrollTrigger.refresh();
    app.rehaut.refresh();
    current = { match, url, mod, cleanup };
    onRoute?.(match, { first, title: mod.title(match.params) });

    if (!first) {
      outlet.querySelector('h1')?.focus({ preventScroll: true });
      await transition.reveal();
    }
    busy = false;
    // Première page : la révélation attend la fin de l’intro (main.js appelle enter()).
    if (!first) enterCurrent();
    if (queued) { const q = queued; queued = null; go(...q); }
  }

  function enterCurrent() {
    try { current?.mod.enter?.(outlet); } catch (e) { console.warn(e); }
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
    if (!a) return;
    const url = new URL(a.href);
    if (url.origin !== location.origin) return;
    LOADERS[matchRoute(toRoutePath(url.pathname, root)).name]?.();
  }

  return {
    start() {
      document.addEventListener('click', onClick);
      document.addEventListener('pointerover', prefetch, { passive: true });
      window.addEventListener('popstate', () => go(new URL(location.href), { pop: true }));
      return go(new URL(location.href), { first: true });
    },
    navigate: (href, opts) => go(new URL(href, document.baseURI), opts),
    enter: enterCurrent,
    get route() { return current?.match; },
    get url() { return current?.url; },
  };
}
