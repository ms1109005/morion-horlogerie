// Suivi du chargement réel (fontes, three.js, environnement, montre, shaders) pour l’intro.
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
