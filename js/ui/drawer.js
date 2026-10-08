// Tiroir panier (« écrin ») : dialogue modal à droite, geste remontoir à l’ouverture.
// Le contenu est rendu par `renderContent` (état vide ici ; lignes au jalon 3).
import { DUR, EASE } from '../core/motion.js';
import { modal } from './focus.js';
import { html } from './html.js';

const hexVide = html`<svg viewBox="-54 -48 108 96" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M50 0 25 43.3h-50L-50 0l25-43.3h50z"/></svg>`;

export function emptyState() {
  return html`
  <div class="panier__vide">
    ${hexVide}
    <strong>Votre écrin est vide.</strong>
    <p>Chaque montre MORION se compose à l’atelier, pièce par pièce.</p>
    <a class="btn btn--plein" href="collection" data-fermer-apres>Voir la collection</a>
  </div>`;
}

export function createDrawer({ panel, voile, cart, scroll, reduced, renderContent = () => ({ corps: emptyState(), pied: '' }) }) {
  const gsap = window.gsap;
  const corps = panel.querySelector('[data-panier-corps]');
  const pied = panel.querySelector('[data-panier-pied]');
  const dialogue = modal(panel, { onEscape: () => close(), inertTargets: [document.getElementById('page'), document.getElementById('nav')] });
  let ouvert = false;
  let tl = null;
  gsap.set(panel, { xPercent: 100 });

  function render() {
    const { corps: c, pied: p } = renderContent(cart);
    corps.innerHTML = c;
    pied.innerHTML = p || '';
    pied.hidden = !p;
  }

  function open(from) {
    if (ouvert) return;
    ouvert = true;
    render();
    scroll.stop();
    panel.style.visibility = 'visible';
    voile.style.visibility = 'visible';
    dialogue.open(from);
    tl?.kill();
    if (reduced) {
      gsap.set(panel, { xPercent: 0 });
      gsap.set(voile, { opacity: 1 });
      return;
    }
    tl = gsap.timeline()
      .fromTo(voile, { opacity: 0 }, { opacity: 1, duration: DUR.vague, ease: 'none' }, 0)
      .fromTo(panel, { xPercent: 100 }, { xPercent: 0, duration: DUR.moyen, ease: EASE.sortie }, 0)
      .fromTo(panel.querySelectorAll('.panier__tete, .panier__corps > *, .panier__pied'), { x: 36, opacity: 0 },
        { x: 0, opacity: 1, duration: DUR.vague, ease: EASE.sortie, stagger: 0.03 }, 0.12);
  }

  function close({ restore = true } = {}) {
    if (!ouvert) return;
    ouvert = false;
    scroll.start();
    dialogue.close({ restore });
    tl?.kill();
    const fin = () => { panel.style.visibility = 'hidden'; voile.style.visibility = 'hidden'; };
    if (reduced) { gsap.set(panel, { xPercent: 100 }); gsap.set(voile, { opacity: 0 }); fin(); return; }
    tl = gsap.timeline({ onComplete: fin })
      .to(panel, { xPercent: 100, duration: DUR.vague, ease: EASE.traverse }, 0)
      .to(voile, { opacity: 0, duration: DUR.vague, ease: 'none' }, 0);
  }

  voile.addEventListener('click', () => close());
  panel.querySelector('[data-fermer-panier]').addEventListener('click', () => close());
  panel.addEventListener('click', (e) => { if (e.target.closest('[data-fermer-apres]')) close({ restore: false }); });
  cart.subscribe(() => { if (ouvert) render(); });

  return {
    open, close, render,
    setRenderer(fn) { renderContent = fn; if (ouvert) render(); },
    get isOpen() { return ouvert; },
  };
}
