// Grille de la collection : 12 références, filtres, tri, état vide ; au survol, la montre
// persistante du site vient se poser sur la carte et tourne (3D temps réel, une seule montre).
import { FAMILIES, FINISHES, REFERENCES } from '../data/catalogue.js';
import { filtrer, trier, prixDepart, lireFiltres, ecrireFiltres, pistes, TRANCHES, TRIS, DIAMETRES, FILTRES_VIDES } from '../data/filtres.js';
import { formatPrice } from '../store/config.js';
import { DUR, EASE } from '../core/motion.js';
import { html } from './html.js';

export function renderGrille(url) {
  const f = lireFiltres(url.searchParams);
  const puce = (nom, valeur, libelle, coche) => html`
    <label class="puce"><input type="checkbox" name="${nom}" value="${valeur}" ${coche ? html`checked` : ''}><span>${libelle}</span></label>`;
  return html`
  <section class="grille">
    <header class="grille__entete">
      <h1 tabindex="-1">Les douze références</h1>
      <p class="grille__compte"><span class="num" data-compte></span></p>
      <a class="lien-texte" href="collection">Revenir aux salles</a>
    </header>
    <form class="filtres" data-filtres aria-label="Filtrer la collection">
      <fieldset><legend>Famille</legend><div class="puces">${Object.values(FAMILIES).map((x) => puce('famille', x.code, x.nomComplet, f.familles.includes(x.code)))}</div></fieldset>
      <fieldset><legend>Matière</legend><div class="puces">${Object.entries(FINISHES).map(([k, x]) => puce('matiere', k, x.nom, f.matieres.includes(k)))}</div></fieldset>
      <fieldset><legend>Diamètre</legend><div class="puces">${DIAMETRES.map((d) => puce('diametre', d, `${d} mm`, f.diametres.includes(d)))}</div></fieldset>
      <fieldset><legend>Prix de départ</legend><div class="puces">${TRANCHES.map((t) => puce('prix', t.id, t.nom, f.tranches.includes(t.id)))}</div></fieldset>
      <div class="filtres__bas">
        <label class="tri">Trier <select name="tri">${Object.entries(TRIS).map(([k, n]) => html`<option value="${k}" ${f.tri === k ? html`selected` : ''}>${n}</option>`)}</select></label>
        <button type="button" class="lien-texte" data-reinit>Réinitialiser</button>
      </div>
    </form>
    <ul class="cartes" data-cartes></ul>
    <div class="grille__vide" data-vide hidden>
      <h2>Aucune référence ne réunit ces critères.</h2>
      <p data-pistes-titre>Retirez un seul filtre :</p>
      <ul class="grille__pistes" data-pistes></ul>
      <button type="button" class="btn btn--trait" data-reinit>Tout réinitialiser</button>
    </div>
  </section>`;
}

const carte = (r) => html`
  <li class="carte" style="view-transition-name: ${r.ref.toLowerCase()}">
    <a href="montre/${r.ref}" data-ref="${r.ref}">
      <span class="carte__vue"><img src="img/rendus/${r.ref.toLowerCase()}.webp" alt="" width="800" height="800" loading="lazy" decoding="async"></span>
      <span class="carte__nom">${FAMILIES[r.family].nomComplet}</span>
      <span class="carte__fin">${FINISHES[r.finish].nom}</span>
      <span class="carte__prix num">à partir de ${formatPrice(prixDepart(r))}</span>
    </a>
  </li>`;

export function mountGrille(el, app) {
  const form = el.querySelector('[data-filtres]');
  const liste = el.querySelector('[data-cartes]');
  const vide = el.querySelector('[data-vide]');
  const compte = el.querySelector('[data-compte]');
  const pistesEl = el.querySelector('[data-pistes]');
  const reinitBarre = el.querySelector('.filtres__bas [data-reinit]');
  const pistesTitre = el.querySelector('[data-pistes-titre]');
  const offs = [];
  const NOMS = { familles: 'famille', matieres: 'matiere', diametres: 'diametre', tranches: 'prix' };

  function lire() {
    const fd = new FormData(form);
    return {
      familles: fd.getAll('famille'), matieres: fd.getAll('matiere'),
      diametres: fd.getAll('diametre').map(Number), tranches: fd.getAll('prix'), tri: fd.get('tri') || 'famille',
    };
  }
  function afficher() {
    const f = lire();
    const refs = trier(filtrer(REFERENCES, f), f.tri);
    const maj = () => {
      liste.innerHTML = html`${refs.map(carte)}`;
      compte.textContent = `${refs.length} référence${refs.length > 1 ? 's' : ''}`;
      vide.hidden = refs.length > 0;
      // Une seule réinitialisation à l’écran : celle de l’état vide quand il s’affiche.
      // Et rien à réinitialiser tant qu’aucun filtre n’est posé et que le tri est celui d’origine.
      const vierge = !f.familles.length && !f.matieres.length && !f.diametres.length
        && !f.tranches.length && f.tri === FILTRES_VIDES.tri;
      reinitBarre.hidden = !refs.length || vierge;
      if (!refs.length) {
        const p = pistes(REFERENCES, f);
        pistesEl.innerHTML = html`${p.map((x) => html`<li><button type="button" data-retirer="${x.groupe}">Sans « ${x.legende} » <span class="num">${x.compte}</span></button></li>`)}`;
        pistesTitre.hidden = !p.length;
      }
    };
    // Transitions de vue quand le navigateur les connaît : les cartes glissent à leur place.
    if (document.startViewTransition && !app.reduced && liste.children.length) document.startViewTransition(maj);
    else maj();
    const u = new URL(location.href);
    u.search = ecrireFiltres(f, new URLSearchParams({ vue: 'grille' })).toString().replace(/%2C/g, ',');
    history.replaceState(history.state, '', u);
  }
  form.addEventListener('change', afficher);
  pistesEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-retirer]');
    if (!b) return;
    form.querySelectorAll(`input[name="${NOMS[b.dataset.retirer]}"]`).forEach((i) => { i.checked = false; });
    afficher();
    el.querySelector('.carte a')?.focus({ preventScroll: true });
  });
  el.querySelectorAll('[data-reinit]').forEach((b) => b.addEventListener('click', () => {
    form.querySelectorAll('input').forEach((i) => { i.checked = false; });
    form.querySelector('select').value = FILTRES_VIDES.tri;
    afficher();
  }));
  afficher();

  // ---- 3D au survol : la montre du site se pose sur la carte ----
  const d = app.director;
  const fin = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!d.watch || !fin || app.reduced) return () => offs.forEach((x) => x());
  const gsap = window.gsap;
  let active = null;
  let tourne = null;
  const poser = (vue, immediat) => {
    const r = vue.getBoundingClientRect();
    const x = ((r.left + r.width / 2) / window.innerWidth) * 2 - 1;
    const y = 1 - ((r.top + r.height / 2) / window.innerHeight) * 2;
    const cible = { x, y, taille: (r.height / window.innerHeight) * 0.46, k: 1, visible: 1, rotX: 0.12, eclate: 0 };
    if (immediat) { Object.assign(d.state, cible); d.apply(); } else d.to(cible, { duration: DUR.court, ease: EASE.sortie });
  };
  const entrer = (a) => {
    const r = REFERENCES.find((x) => x.ref === a.dataset.ref);
    if (!r) return;
    active = a;
    const vue = a.querySelector('.carte__vue');
    d.watch.userData.applyConfig(r.config);
    Object.assign(d.state, { rotY: -0.9 });
    poser(vue, false);
    a.classList.add('en-3d');
    tourne?.kill();
    // Elle oscille face au visiteur : la lumière glisse sur la lunette, jamais le dos.
    tourne = gsap.to(d.state, { rotY: 0.35, duration: 2.6, ease: 'power2.inOut', yoyo: true, repeat: -1, onUpdate: d.apply });
  };
  const sortir = (a) => {
    if (active !== a) return;
    active = null;
    tourne?.kill();
    a.classList.remove('en-3d');
    d.to({ k: 0 }, { duration: DUR.court, ease: EASE.traverse });
  };
  const over = (e) => { const a = e.target.closest?.('[data-ref]'); if (a && a !== active) { if (active) sortir(active); entrer(a); } };
  const out = (e) => { const a = e.target.closest?.('[data-ref]'); if (a && !a.contains(e.relatedTarget)) sortir(a); };
  liste.addEventListener('pointerover', over);
  liste.addEventListener('pointerout', out);
  offs.push(app.scroll.onScroll(() => { if (active) poser(active.querySelector('.carte__vue'), true); }));
  offs.push(() => { tourne?.kill(); });
  return () => offs.forEach((x) => x());
}
