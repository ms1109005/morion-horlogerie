// Intro (une fois par session, environ 2,4 s, passable) : l’hexagone se trace facette par
// facette, le compteur suit le vrai chargement et l’hexagone avance de 6° à chaque dizaine (une
// seconde de cadran ; à 100 il a fait 60° et retombe sur sa symétrie), les lettres MORION se
// révèlent, puis la dalle de quartz glisse en diagonale et découvre la page.
import { DUR, EASE } from '../core/motion.js';
import { introCounter } from '../core/loader.js';

const CLE = 'morion:intro';
export const introDejaVue = () => document.documentElement.classList.contains('intro-vue');

export function playIntro({ el, tracker, reduced, onUnlock }) {
  const gsap = window.gsap;
  const hex = el.querySelector('.intro__hex');
  const compteur = el.querySelector('[data-compteur]');
  const lettres = [...el.querySelectorAll('.intro__mot i')];
  const contenu = el.querySelector('.intro__contenu');
  const dalle = el.querySelector('.intro__dalle');
  const passer = el.querySelector('.intro__passer');
  const t0 = performance.now();
  let fini = false;
  let sortieLancee = false;
  let resolve;
  const promise = new Promise((r) => { resolve = r; });

  const marquer = () => { try { sessionStorage.setItem(CLE, '1'); } catch { /* stockage bloqué */ } };

  function sortie(rapide = false) {
    if (sortieLancee) return;
    sortieLancee = true;
    marquer();
    gsap.ticker.remove(compter);
    onUnlock?.();
    const pos = { x: 0 };
    const d = rapide ? 0.4 : 0.5;
    gsap.to(contenu, { opacity: 0, y: -10, duration: DUR.court, ease: EASE.traverse });
    gsap.to(pos, {
      x: 200, duration: d, ease: EASE.traverse, delay: rapide ? 0 : 0.05,
      onUpdate: () => { dalle.style.transform = `translate(-50%, -50%) rotate(30deg) translateX(${pos.x}vmax)`; },
      onComplete: fin,
    });
  }
  function fin() {
    if (fini) return;
    fini = true;
    el.remove();
    resolve();
  }

  const passerTout = (e) => {
    if (e.type === 'keydown' && !['Enter', ' ', 'Escape'].includes(e.key)) return;
    sortie(true);
  };
  el.addEventListener('click', passerTout);
  document.addEventListener('keydown', passerTout, { once: false });
  promise.then(() => document.removeEventListener('keydown', passerTout));

  if (reduced) {
    compteur.textContent = '100';
    lettres.forEach((l) => { l.style.transform = 'none'; });
    tracker.done().then(() => {
      marquer();
      onUnlock?.();
      gsap.to(el, { opacity: 0, duration: 0.3, ease: 'none', onComplete: fin });
    });
    return promise;
  }

  // Minuterie : 60 traits ; le compteur en allume un par 1,67 %.
  const minutes = el.querySelector('[data-minutes]');
  minutes.innerHTML = Array.from({ length: 60 }, (_, m) => `<i style="--m:${m}"></i>`).join('');
  const traits = [...minutes.children];
  let allumes = 0;

  // Le tracé des 6 arêtes est une animation CSS (shell.css, @keyframes arete).
  gsap.set(lettres, { yPercent: 110, xPercent: -18 });

  // Compteur : suit le chargement réel, jamais plus vite que la chorégraphie.
  let dizaine = 0;
  let lettresParties = false;
  let sortiePrevue = false;
  // Contrôle : ?figer-intro=1.2 fige l’intro à 1,2 s pour la capturer (captures de validation).
  const figer = Number(new URLSearchParams(location.search).get('figer-intro')) || 0;
  function compter() {
    const elapsed = (performance.now() - t0) / 1000;
    if (figer && elapsed >= figer) {
      gsap.ticker.remove(compter);
      gsap.globalTimeline.pause();
      document.getAnimations().forEach((a) => a.pause());
      return;
    }
    const v = introCounter(elapsed, tracker.progress(), 1.9);
    compteur.textContent = String(v).padStart(3, '0');
    passer.style.setProperty('--p', (v / 100).toFixed(3));
    const n = Math.round(v * 0.6);
    while (allumes < n) { traits[allumes].classList.add('allume'); allumes += 1; }
    const dz = Math.floor(v / 10);
    if (dz > dizaine) {
      dizaine = dz;
      gsap.to(hex, { rotation: dz * 6, duration: DUR.court, ease: EASE.echappement, transformOrigin: '50% 50%' });
    }
    // Les lettres se révèlent pendant le chargement ; la dalle part quand tout est prêt.
    if (v >= 55 && !lettresParties) {
      lettresParties = true;
      gsap.to(lettres, { yPercent: 0, xPercent: 0, duration: DUR.vague, ease: EASE.sortie, stagger: 0.04 });
    }
    if (v >= 100 && !sortiePrevue) {
      sortiePrevue = true;
      gsap.delayedCall(0.12, () => sortie());
    }
  }
  gsap.ticker.add(compter);
  passer.tabIndex = 0;
  return promise;
}
