// Étiquettes de l’assemblage (accueil) : chaque pièce nommée suit sa position projetée depuis
// la 3D, reliée par un filet. Un clic ouvre sa fiche. Calque #avant, au-dessus du canvas.
import * as THREE from 'three';
import { PIECES } from '../data/pieces.js';
import { html } from './html.js';

export function renderPieces() {
  return html`
  <div class="pieces" data-pieces hidden>
    ${PIECES.map((p) => html`<button type="button" class="piece" data-piece="${p.id}" aria-controls="piece-fiche"><span class="piece__nom">${p.nom}</span></button>`)}
    <section class="piece-fiche" id="piece-fiche" data-fiche aria-labelledby="piece-fiche-nom" hidden>
      <h3 class="piece-fiche__nom" id="piece-fiche-nom" tabindex="-1"></h3>
      <p class="piece-fiche__texte"></p>
      <button type="button" class="fermer piece-fiche__fermer" data-fermer-fiche>Fermer</button>
    </section>
  </div>`;
}

export function createPieces(root, { stage, director, etroit, compteur = null }) {
  const boutons = [...root.querySelectorAll('[data-piece]')];
  const fiche = root.querySelector('[data-fiche]');
  // Écran étroit : la fiche occupe le bas de l’écran et le compteur, laissé en place, passerait
  // derrière la montre éclatée. Il devient l’en-tête de la fiche le temps de la lecture.
  const nid = compteur?.parentNode || null;
  const loger = (dedans) => {
    if (!etroit || !compteur || !nid) return;
    if (dedans) fiche.insertBefore(compteur, fiche.firstChild);
    else nid.appendChild(compteur);
    compteur.classList.toggle('assemblage__compteur--fiche', dedans);
  };
  const v = new THREE.Vector3();
  let visible = false;
  let source = null;

  // Sens et longueur du filet, répartis sur l’ordre réel des pièces à l’écran, pas sur leur
  // index de déclaration. L’éclaté regroupe tout le mouvement sur une bande étroite : à parité
  // d’index, six étiquettes finissaient empilées les unes sur les autres.
  const SENS = etroit ? ['gauche', 'droite'] : ['haut', 'bas'];
  const repartir = () => {
    const parts = director.watch?.userData.parts;
    if (!parts) return;
    director.pivot.updateMatrixWorld(true);
    const rangs = boutons
      .map((b) => {
        const part = parts.get(b.dataset.piece);
        if (!part) return null;
        part.getWorldPosition(v).project(stage.camera);
        return { b, k: etroit ? -v.y : v.x };
      })
      .filter(Boolean)
      .sort((a, c) => a.k - c.k);
    rangs.forEach(({ b }, i) => {
      SENS.forEach((s) => b.classList.remove(`piece--${s}`));
      b.classList.add(`piece--${SENS[i % 2]}`);
      // Deux voisins dans l’ordre ne tirent jamais le même filet : c’est ce décalage qui
      // désempile les pastilles quand les pièces sont serrées.
      const pas = Math.floor(i / 2) % 3;
      b.style.setProperty('--long', `${(etroit ? 24 : 32) + pas * (etroit ? 14 : 26)}px`);
    });
  };

  function ouvrir(b) {
    const p = PIECES.find((x) => x.id === b.dataset.piece);
    if (!p) return;
    source = b;
    fiche.querySelector('.piece-fiche__nom').textContent = p.nom;
    fiche.querySelector('.piece-fiche__texte').textContent = p.fiche;
    fiche.hidden = false;
    document.documentElement.classList.add('fiche-ouverte');
    loger(true);
    boutons.forEach((x) => x.setAttribute('aria-expanded', String(x === b)));
    fiche.querySelector('.piece-fiche__nom').focus({ preventScroll: true });
  }
  function fermer({ rendre = true } = {}) {
    if (fiche.hidden) return;
    fiche.hidden = true;
    document.documentElement.classList.remove('fiche-ouverte');
    loger(false);
    boutons.forEach((x) => x.setAttribute('aria-expanded', 'false'));
    if (rendre && source && visible) source.focus({ preventScroll: true });
    source = null;
  }
  const clic = (e) => {
    const b = e.target.closest('[data-piece]');
    if (b) ouvrir(b);
    if (e.target.closest('[data-fermer-fiche]')) fermer();
  };
  const touche = (e) => { if (e.key === 'Escape') fermer(); };
  root.addEventListener('click', clic);
  document.addEventListener('keydown', touche);

  // opacite : 0 à 1 (les étiquettes n’apparaissent que pièces écartées).
  function maj(opacite) {
    const on = opacite > 0.02;
    if (on !== visible) {
      visible = on;
      root.hidden = !on;
      // Réparti à l’apparition : stable pendant tout le défilement, aucun scintillement.
      if (on) repartir(); else fermer({ rendre: false });
    }
    if (!on) return;
    root.style.setProperty('--o', opacite.toFixed(3));
    const parts = director.watch?.userData.parts;
    if (!parts) return;
    director.pivot.updateMatrixWorld(true);
    const W = window.innerWidth;
    const H = window.innerHeight;
    boutons.forEach((b) => {
      const part = parts.get(b.dataset.piece);
      if (!part) { b.hidden = true; return; }
      part.getWorldPosition(v).project(stage.camera);
      b.style.transform = `translate3d(${((v.x + 1) / 2) * W}px, ${((1 - v.y) / 2) * H}px, 0)`;
    });
  }

  return {
    maj,
    fermer,
    dispose() {
      root.removeEventListener('click', clic);
      document.removeEventListener('keydown', touche);
      document.documentElement.classList.remove('fiche-ouverte');
      loger(false);
    },
  };
}
