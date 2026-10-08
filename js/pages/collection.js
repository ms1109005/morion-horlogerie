// Collection : visite par salles (par défaut) ou grille filtrable (?vue=grille).
import { html } from '../ui/html.js';
import { prepareFacette } from '../ui/split.js';
import { footer, mountFooter } from '../ui/footer.js';
import { renderGrille, mountGrille } from '../ui/grille.js';
import { createSalles, ARRETS } from '../stage/salles.js';
import { FAMILIES, FINISHES } from '../data/catalogue.js';
import { formatPrice } from '../store/config.js';
import { modal } from '../ui/focus.js';
import { DUR, EASE } from '../core/motion.js';

let facette = null;
const estGrille = (url) => url?.searchParams.get('vue') === 'grille';
const depart = (f) => Math.min(...Object.values(f.base));

const RECITS = {
  PR42: 'Le vaisseau amiral. Une lunette hexagonale tenue par six vis, un bracelet qui prolonge le boîtier, trois compteurs et la roue à colonnes du calibre MR-01.',
  MO39: 'Le plus mince de la maison. Un coussin de 39 mm pour 8,2 mm d’épaisseur, un cadran à lignes qui accroche la lumière de biais.',
  AB41: 'Pour l’eau et les fuseaux. Lunette tournante à 120 crans, insert céramique 24 heures, aiguille GMT à pointe orange, étanche à 300 m.',
};
const NOMS_ARRETS = { hall: 'Hall', PR42: 'Prisme', MO39: 'Monolithe', AB41: 'Abysse' };

function panneau(id) {
  if (id === 'hall') {
    return html`
      <h1 class="salle__titre" tabindex="-1">La collection</h1>
      <p class="salle__texte">Un hall en quartz fumé, puis une salle par famille. Faites défiler, ou choisissez une salle.</p>
      <div class="actions"><button class="btn btn--plein" type="button" data-suivante>Entrer dans les salles</button></div>`;
  }
  const f = FAMILIES[id];
  return html`
    <h2 class="salle__titre">${f.nomComplet}</h2>
    <p class="salle__prix">à partir de <span class="num">${formatPrice(depart(f))}</span></p>
    <p class="salle__spec">${f.type}, ${f.diametre} mm, étanche ${f.etancheite} m</p>
    <div class="actions">
      <button class="btn btn--plein" type="button" data-decouvrir="${id}">Découvrir</button>
      <a class="btn btn--trait" href="montre/MOR-${id}-AC">Composer</a>
    </div>`;
}

function edito(id) {
  const f = FAMILIES[id];
  return html`
    <div class="edito__carte">
      <button class="fermer edito__fermer" type="button" data-fermer-edito>Fermer</button>
      <img class="edito__rendu" src="img/rendus/mor-${id.toLowerCase()}-ac.webp" alt="${f.nomComplet} en acier" width="800" height="800">
      <div class="edito__texte">
        <h2 id="edito-titre">${f.nomComplet}</h2>
        <p class="edito__spec">${f.type}, ${f.diametre} mm, étanche ${f.etancheite} m</p>
        <p>${RECITS[id]}</p>
        <ul class="edito__finitions">
          ${Object.entries(FINISHES).map(([k, x]) => html`
          <li><a href="montre/MOR-${id}-${k}">
            <img src="img/rendus/mor-${id.toLowerCase()}-${k.toLowerCase()}.webp" alt="" width="800" height="800" loading="lazy">
            <span>${x.nom}</span><span class="num">${formatPrice(f.base[k])}</span>
          </a></li>`)}
        </ul>
        <a class="btn btn--sombre" href="montre/MOR-${id}-AC">Composer la vôtre</a>
      </div>
    </div>`;
}

export default {
  title: (params) => 'Collection',
  pose: 'collection',
  render: (params, url) => {
    if (estGrille(url)) return { page: html`${renderGrille(url)}${footer()}` };
    return {
      page: html`
      <section class="salles" data-salles>
        <div class="salles__vignette" aria-hidden="true"></div>
        <div class="salles__ui au-dessus">
          <div class="salle" data-panneau aria-live="polite"></div>
          <nav class="salles__points" aria-label="Salles de la collection">
            ${ARRETS.map((a, i) => html`<button type="button" data-arret="${i}"><span>${NOMS_ARRETS[a.id]}</span></button>`)}
          </nav>
          <div class="salles__fleches">
            <button type="button" class="btn btn--trait" data-precedente>Précédente</button>
            <button type="button" class="btn btn--trait" data-suivante>Suivante</button>
          </div>
          <a class="salles__grille lien-texte" href="collection?vue=grille">Voir les 12 références</a>
        </div>
        <div class="edito" data-edito role="dialog" aria-modal="true" aria-labelledby="edito-titre" inert></div>
      </section>`,
    };
  },

  mount({ el, url, app }) {
    const offs = [];
    if (estGrille(url)) {
      offs.push(mountGrille(el, app));
      offs.push(mountFooter(el));
      facette = prepareFacette(el.querySelector('h1'), { reduced: app.reduced });
      return () => { offs.forEach((f) => f()); facette?.revert(); };
    }

    const gsap = window.gsap;
    const racine = el.querySelector('[data-salles]');
    const panneauEl = el.querySelector('[data-panneau]');
    const editoEl = el.querySelector('[data-edito]');
    const points = [...el.querySelectorAll('[data-arret]')];
    // Plein écran : la molette change de salle, la page ne défile pas.
    app.scroll.stop();
    document.documentElement.classList.add('salles-actives');
    offs.push(() => { app.scroll.start(); document.documentElement.classList.remove('salles-actives'); });

    const salles = app.stage ? createSalles(app.stage, { reduced: app.reduced }) : null;
    offs.push(() => salles?.dispose());
    const depuisUrl = ARRETS.findIndex((a) => a.id === (url.searchParams.get('salle') || '').toUpperCase());
    let index = Math.max(0, depuisUrl);

    function afficher(i, { premier = false } = {}) {
      points.forEach((b, k) => b.setAttribute('aria-current', k === i ? 'true' : 'false'));
      el.querySelector('[data-precedente]').disabled = i === 0;
      el.querySelectorAll('[data-suivante]').forEach((b) => { b.disabled = i === ARRETS.length - 1; });
      const remplir = () => {
        panneauEl.innerHTML = panneau(ARRETS[i].id);
        const t = panneauEl.querySelector('.salle__titre');
        const fac = prepareFacette(t, { reduced: app.reduced, delay: premier ? 0 : DUR.long * 0.6 });
        gsap.fromTo(panneauEl, { opacity: 0 }, { opacity: 1, duration: DUR.court, ease: 'none', delay: premier ? 0 : DUR.long * 0.55 });
        if (premier) facette = fac; else fac.play();
      };
      if (premier || app.reduced) remplir();
      else gsap.to(panneauEl, { opacity: 0, duration: DUR.court * 0.8, ease: 'none', onComplete: remplir });
      const u = new URL(location.href);
      if (i) u.searchParams.set('salle', ARRETS[i].id.toLowerCase()); else u.searchParams.delete('salle');
      history.replaceState(history.state, '', u);
    }

    let verrou = 0;
    function aller(i) {
      i = Math.max(0, Math.min(ARRETS.length - 1, i));
      if (i === index || performance.now() < verrou) return;
      verrou = performance.now() + (app.reduced ? 250 : DUR.voyage * 1000 * 0.9);
      index = i;
      salles?.reveiller();
      salles?.goTo(i);
      afficher(i);
      app.annonce(`Salle ${NOMS_ARRETS[ARRETS[i].id]}`);
    }

    // Molette : un geste = une salle.
    let cumul = 0;
    const molette = (e) => {
      if (editoEl.classList.contains('ouvert')) return;
      e.preventDefault();
      salles?.reveiller();
      cumul += e.deltaY + e.deltaX;
      if (Math.abs(cumul) > 40) { aller(index + Math.sign(cumul)); cumul = 0; }
    };
    racine.addEventListener('wheel', molette, { passive: false });
    // Balayage tactile.
    let t0 = null;
    racine.addEventListener('touchstart', (e) => { t0 = e.touches[0]; salles?.reveiller(); }, { passive: true });
    racine.addEventListener('touchend', (e) => {
      if (!t0) return;
      const t1 = e.changedTouches[0];
      const dx = t1.clientX - t0.clientX;
      const dy = t1.clientY - t0.clientY;
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 50) aller(index + (Math.abs(dx) > Math.abs(dy) ? -Math.sign(dx) : -Math.sign(dy)));
      t0 = null;
    }, { passive: true });
    const touches = (e) => {
      if (editoEl.classList.contains('ouvert') || e.target.closest('input, select, textarea')) return;
      if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) { e.preventDefault(); aller(index + 1); }
      if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); aller(index - 1); }
    };
    document.addEventListener('keydown', touches);
    offs.push(() => document.removeEventListener('keydown', touches));
    const reveil = () => salles?.reveiller();
    racine.addEventListener('pointermove', reveil, { passive: true });

    racine.addEventListener('click', (e) => {
      const p = e.target.closest('[data-arret]');
      if (p) aller(Number(p.dataset.arret));
      if (e.target.closest('[data-suivante]')) aller(index + 1);
      if (e.target.closest('[data-precedente]')) aller(index - 1);
      const d = e.target.closest('[data-decouvrir]');
      if (d) ouvrirEdito(d.dataset.decouvrir, d);
      if (e.target.closest('[data-fermer-edito]')) fermerEdito();
    });

    // Surimpression éditoriale claire : entre en biais, à l’angle d’une facette.
    const dialogue = modal(editoEl, { onEscape: () => fermerEdito(), inertTargets: [el.querySelector('.salles__ui'), document.getElementById('nav')] });
    function ouvrirEdito(id, from) {
      editoEl.innerHTML = edito(id);
      editoEl.classList.add('ouvert');
      racine.classList.add('edito-ouvert');
      dialogue.open(from);
      if (!app.reduced) {
        gsap.fromTo(editoEl.querySelector('.edito__carte'), { clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' },
          { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', duration: DUR.moyen, ease: EASE.traverse });
      }
    }
    function fermerEdito() {
      if (!editoEl.classList.contains('ouvert')) return;
      const fin = () => { editoEl.classList.remove('ouvert'); editoEl.innerHTML = ''; };
      racine.classList.remove('edito-ouvert');
      dialogue.close();
      if (app.reduced) fin();
      else gsap.to(editoEl.querySelector('.edito__carte'), { clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)', duration: DUR.vague, ease: EASE.traverse, onComplete: fin });
    }

    afficher(index, { premier: true });
    if (index) salles?.goTo(index, { immediate: true });
    return () => { offs.forEach((f) => f()); facette?.revert(); };
  },
  enter() { facette?.play(); },
};
