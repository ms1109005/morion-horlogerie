// Rideau de transition : une dalle de quartz inclinée à 60° (angle d’une facette d’hexagone)
// traverse l’écran de gauche à droite. La montre, dans le canvas au-dessus, voyage pendant ce temps.
import { DUR, EASE } from '../core/motion.js';

const HORS_GAUCHE = -200;
const HORS_DROITE = 200;

export function createTransition(rideau, { reduced }) {
  const gsap = window.gsap;
  const dalle = rideau.querySelector('.rideau__dalle');
  const pos = { x: HORS_GAUCHE };
  const set = () => {
    dalle.style.transform = `translate(-50%, -50%) rotate(30deg) translateX(${pos.x}vmax)`;
  };

  function cover() {
    rideau.classList.add('actif');
    if (reduced) {
      pos.x = 0;
      set();
      return gsap.to(dalle, { opacity: 1, duration: 0.15, ease: 'none' }).then();
    }
    pos.x = HORS_GAUCHE;
    set();
    return gsap.to(pos, { x: 0, duration: DUR.moyen, ease: EASE.traverse, onUpdate: set }).then();
  }

  function reveal() {
    const done = () => { rideau.classList.remove('actif'); pos.x = HORS_GAUCHE; set(); };
    if (reduced) {
      return gsap.to(dalle, { opacity: 0, duration: 0.15, ease: 'none' }).then(done);
    }
    return gsap.to(pos, { x: HORS_DROITE, duration: DUR.moyen, ease: EASE.traverse, onUpdate: set }).then(done);
  }

  set();
  return { cover, reveal };
}
