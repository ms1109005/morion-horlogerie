// Prix animé : le total avance d’un geste court (échappement) ; l’écart du dernier choix
// s’affiche un instant à côté (« + 1 200 € »), comme la tendance d’un instrument.
import { DUR, EASE } from '../core/motion.js';
import { formatPrice } from '../store/config.js';

export function createPrix(totalEl, ecartEl, { reduced }) {
  const gsap = window.gsap;
  const etat = { v: 0 };
  let tween = null;
  let masque = null;

  function set(value, { anime = true } = {}) {
    const delta = Math.round(value - etat.v);
    tween?.kill();
    if (!anime || reduced || !etat.v) {
      etat.v = value;
      totalEl.textContent = formatPrice(value);
    } else {
      tween = gsap.to(etat, {
        v: value, duration: DUR.court, ease: EASE.echappement,
        onUpdate: () => { totalEl.textContent = formatPrice(Math.round(etat.v)); },
      });
    }
    if (!ecartEl || !anime || !delta) return;
    ecartEl.textContent = `${delta > 0 ? '+' : '−'} ${formatPrice(Math.abs(delta))}`;
    ecartEl.dataset.sens = delta > 0 ? 'plus' : 'moins';
    masque?.kill();
    gsap.fromTo(ecartEl, { opacity: 0, y: reduced ? 0 : 6 }, { opacity: 1, y: 0, duration: DUR.court, ease: EASE.sortie });
    masque = gsap.to(ecartEl, { opacity: 0, duration: DUR.vague, delay: 1.8, ease: 'none' });
  }
  return { set };
}
