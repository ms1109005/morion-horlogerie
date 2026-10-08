// Navigation : lien actif, menu plein écran (étroit), guichet du panier dont le chiffre avance
// d’un cran (échappement) quand le compte change.
import { DUR, EASE } from '../core/motion.js';
import { FAMILIES } from '../data/catalogue.js';
import { formatPrice } from '../store/config.js';
import { modal } from './focus.js';
import { html } from './html.js';

export function createNav({ nav, menu, cart, scroll, reduced, onOpenCart }) {
  const gsap = window.gsap;
  const fen = nav.querySelector('[data-compte]');
  const sr = nav.querySelector('[data-compte-sr]');
  const boutonMenu = nav.querySelector('.nav__menu');
  const page = document.getElementById('page');

  // Menu : les trois familles et leur prix de départ.
  menu.querySelector('[data-menu-familles]').innerHTML = html`${Object.values(FAMILIES).map((f) => html`
    <li><a href="montre/MOR-${f.code}-AC"><span>${f.nomComplet}</span><span>dès ${formatPrice(Math.min(...Object.values(f.base)))}</span></a></li>`)}`;

  const dialogue = modal(menu, { onEscape: () => fermerMenu(), inertTargets: [page] });
  let menuOuvert = false;
  function ouvrirMenu() {
    if (menuOuvert) return;
    menuOuvert = true;
    boutonMenu.setAttribute('aria-expanded', 'true');
    menu.classList.add('ouvert');
    scroll.stop();
    dialogue.open(boutonMenu);
    if (!reduced) {
      gsap.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: DUR.court, ease: 'none' });
      gsap.fromTo(menu.querySelectorAll('.menu__liens a, .menu__familles li'), { yPercent: 40, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: DUR.vague, ease: EASE.sortie, stagger: 0.03 });
    }
  }
  function fermerMenu({ restore = true } = {}) {
    if (!menuOuvert) return;
    menuOuvert = false;
    boutonMenu.setAttribute('aria-expanded', 'false');
    menu.classList.remove('ouvert');
    menu.style.opacity = '';
    scroll.start();
    dialogue.close({ restore });
  }
  boutonMenu.addEventListener('click', ouvrirMenu);
  menu.querySelector('[data-fermer-menu]').addEventListener('click', () => fermerMenu());
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) fermerMenu({ restore: false }); });

  nav.querySelector('[data-ouvrir-panier]').addEventListener('click', (e) => onOpenCart(e.currentTarget));

  // Guichet : le chiffre sort vers le haut, le nouveau monte d’en bas.
  let affiche = cart.count();
  function majCompte() {
    const n = cart.count();
    sr.textContent = n ? `, ${n} article${n > 1 ? 's' : ''}` : ', vide';
    if (n === affiche) return;
    const monte = n > affiche;
    affiche = n;
    if (reduced) { fen.textContent = String(n); return; }
    gsap.timeline()
      .to(fen, { yPercent: monte ? -110 : 110, duration: DUR.court / 2, ease: 'power2.in' })
      .add(() => { fen.textContent = String(n); })
      .fromTo(fen, { yPercent: monte ? 110 : -110 }, { yPercent: 0, duration: DUR.court, ease: EASE.echappement });
  }
  fen.textContent = String(affiche);
  majCompte();
  cart.subscribe(majCompte);

  return {
    setActive(name) {
      nav.querySelectorAll('[data-route]').forEach((a) => {
        if (a.dataset.route === name) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
      menu.querySelectorAll('[data-route]').forEach((a) => {
        if (a.dataset.route === name) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
    },
    fermerMenu: () => fermerMenu({ restore: false }),
  };
}
