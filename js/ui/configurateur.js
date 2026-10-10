// Configurateur (Penarosa en 3D) : six pastilles reliées par des filets aux pièces de la vraie
// montre ; la montre se tourne vers la pièce que l’on compose ; plateau d’options en groupes
// radio (clavier), écart de prix de chaque choix ; rotation au glisser ; URL partageable.
import * as THREE from 'three';
import { DUR, EASE } from '../core/motion.js';
import { FAMILIES, FINISHES, OPTIONS, STRAP_COLORS, ENGRAVING_MAX } from '../data/catalogue.js';
// (FAMILIES sert aussi aux ancres du boîtier, voir PLUSIEURS.)
import { normalize, encode, price, formatPrice } from '../store/config.js';
import { STRAP_TINT } from '../watch/materials.js';
import { html } from './html.js';

// Nuanciers : l’aperçu de chaque choix dans le plateau.
const TEINTE = {
  finition: {
    AC: 'linear-gradient(135deg, #e3e6ea 0%, #9ba0a6 55%, #d2d5d9 100%)',
    CN: 'linear-gradient(135deg, #3b3b3e 0%, #0b0b0c 60%, #2a2a2c 100%)',
    OJ: 'linear-gradient(135deg, #f6dc98 0%, #b98a3a 60%, #e9c878 100%)',
    OR: 'linear-gradient(135deg, #f5cbb8 0%, #b67a66 60%, #e8b7a2 100%)',
  },
  cadran: {
    noir: '#0c0c0d', bleu: '#1f3470', fume: 'radial-gradient(circle, #7a5a40 0%, #231a14 70%, #070605 100%)',
    vert: '#1c4331', saumon: '#e7a386', argent: 'linear-gradient(135deg, #f0f0ef, #b9b9b8)',
  },
  motif: {
    soleil: 'repeating-conic-gradient(#8b8f96 0deg 4deg, #5f636a 4deg 8deg)',
    tapisserie: 'repeating-linear-gradient(0deg, #6a6e75 0 2px, transparent 2px 6px), repeating-linear-gradient(90deg, #6a6e75 0 2px, #4a4e55 2px 6px)',
    lignes: 'repeating-linear-gradient(90deg, #7a7e85 0 1.5px, #50545b 1.5px 4px)',
  },
  aiguilles: { acier: 'linear-gradient(135deg, #eef0f2, #9ea3a9)', or: 'linear-gradient(135deg, #f3d68f, #b98a3a)', lume: '#eef1e6' },
};

export const ZONES = [
  { id: 'boitier', label: 'Boîtier', ancre: 'case', cote: 'g', rang: 0, pose: { rotX: 0.15, rotY: -0.45, k: 1 },
    valeur: (c) => FINISHES[c.case].nom },
  { id: 'lunette', label: 'Lunette', ancre: 'bezel', cote: 'g', rang: 1, pose: { rotX: 0.42, rotY: -0.18, k: 1.06 },
    valeur: (c) => FINISHES[c.bezel].nom },
  { id: 'cadran', label: 'Cadran', ancre: 'dial', cote: 'g', rang: 2, pose: { rotX: 0.04, rotY: -0.06, k: 1.16 },
    valeur: (c) => `${OPTIONS.dialColor[c.dialColor].nom}, ${OPTIONS.dialPattern[c.dialPattern].nom.toLowerCase()}` },
  { id: 'aiguilles', label: 'Aiguilles', ancre: 'hands', cote: 'd', rang: 0, pose: { rotX: 0.02, rotY: 0, k: 1.2 },
    valeur: (c) => OPTIONS.hands[c.hands].nom },
  { id: 'bracelet', label: 'Bracelet', ancre: 'strap', cote: 'd', rang: 1, pose: { rotX: 0.32, rotY: -1.05, k: 0.92 },
    valeur: (c) => (c.strap === 'metal' ? `Métal, ${FINISHES[c.case].nom.toLowerCase()}` : `${OPTIONS.strap[c.strap].nom}, ${OPTIONS.strapColor[c.strapColor].nom.toLowerCase()}`) },
  { id: 'gravure', label: 'Gravure', ancre: 'caseback', cote: 'd', rang: 2, pose: { rotX: 0.1, rotY: Math.PI, k: 1.1 },
    valeur: (c) => (c.engraving ? `« ${c.engraving} »` : 'Aucune') },
];

// Groupes d’options d’une zone : { cle, legende, type, choix: [{ v, nom, teinte }] }.
function groupes(zone, c) {
  const fin = (cle, legende) => ({ cle, legende, type: 'teinte', choix: Object.keys(FINISHES).map((v) => ({ v, nom: FINISHES[v].nom, teinte: TEINTE.finition[v] })) });
  switch (zone) {
    case 'boitier': return [fin('case', 'Matière du boîtier')];
    case 'lunette': return [fin('bezel', 'Matière de la lunette')];
    case 'cadran': return [
      { cle: 'dialColor', legende: 'Couleur du cadran', type: 'teinte', choix: Object.keys(OPTIONS.dialColor).map((v) => ({ v, nom: OPTIONS.dialColor[v].nom, teinte: TEINTE.cadran[v] })) },
      { cle: 'dialPattern', legende: 'Motif', type: 'teinte', choix: Object.keys(OPTIONS.dialPattern).map((v) => ({ v, nom: OPTIONS.dialPattern[v].nom, teinte: TEINTE.motif[v] })) },
    ];
    case 'aiguilles': return [{ cle: 'hands', legende: 'Aiguilles', type: 'teinte', choix: Object.keys(OPTIONS.hands).map((v) => ({ v, nom: OPTIONS.hands[v].nom, teinte: TEINTE.aiguilles[v] })) }];
    case 'bracelet': {
      const g = [{ cle: 'strap', legende: 'Bracelet', type: 'pilule', choix: Object.keys(OPTIONS.strap).map((v) => ({ v, nom: OPTIONS.strap[v].nom })) }];
      if (c.strap !== 'metal') {
        g.push({ cle: 'strapColor', legende: 'Coloris', type: 'teinte', choix: STRAP_COLORS[c.strap].map((v) => ({ v, nom: OPTIONS.strapColor[v].nom, teinte: STRAP_TINT[c.strap][v] })) });
      }
      return g;
    }
    default: return [];
  }
}

const ecart = (c, partial) => price(normalize({ ...c, ...partial })).total - price(c).total;
const ecartTexte = (d, zero = 'inclus') => (d === 0 ? zero : `${d > 0 ? '+' : '−'} ${formatPrice(Math.abs(d))}`);

// Un groupe dont aucun choix ne change le prix est purement esthétique : ses pastilles se
// réduisent à leur nuance (le nom du choix actif se lit dans la légende, en ligne de
// spécification). Sinon chaque pastille garde son nom et son écart, qui doivent rester lisibles.
function affichage(g, c) {
  if (g.type !== 'teinte') return g.type;
  return g.choix.every((ch) => ecart(c, { [g.cle]: ch.v }) === 0) ? 'nuance' : 'teinte';
}

export function createConfigurateur({ root, app, config: initial, onChange, prix }) {
  const gsap = window.gsap;
  const { director, stage, reduced } = app;
  const watch = director.watch;
  let config = normalize(initial);
  let zone = null;
  let base = { ...director.poses.montre };
  const plateau = root.querySelector('[data-plateau]');
  const svg = root.querySelector('[data-filets]');
  const pastilles = [...root.querySelectorAll('[data-zone]')];
  const cleanups = [];
  const narrow = () => window.innerWidth < 720;

  // ---- Pose de la zone ----
  const poseDe = (id) => {
    const p = ZONES.find((z) => z.id === id)?.pose || { rotX: base.rotX, rotY: base.rotY, k: 1 };
    return { ...base, rotX: p.rotX, rotY: p.rotY, taille: base.taille * p.k, eclate: 0 };
  };
  const strap = () => watch?.userData.parts.get('strap');

  // Écran étroit : les rangées défilent à l'horizontale. Sans cela le choix en cours est
  // justement celui qui reste hors champ, coupé par le bord de l'écran.
  const amener = (e) => {
    if (!e || !narrow()) return;
    e.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
  };

  function setZone(id, { focus = false } = {}) {
    const prev = zone;
    zone = id;
    pastilles.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.zone === id)));
    amener(pastilles.find((b) => b.dataset.zone === id));
    renderPlateau();
    if (!watch) return;
    const cible = poseDe(id);
    // Vue du fond : le bracelet s’efface le temps de la gravure (la boucle cacherait la glace).
    if (id === 'gravure') gsap.delayedCall(reduced ? 0 : DUR.long * 0.35, () => { if (zone === 'gravure' && strap()) { strap().visible = false; stage.invalidate(); } });
    else if (prev === 'gravure' && strap()) { strap().visible = true; stage.invalidate(); }
    director.to(cible, { duration: DUR.long, ease: EASE.traverse });
    if (focus) plateau.querySelector('input:checked, input')?.focus({ preventScroll: true });
  }

  // ---- Plateau d’options ----
  function renderPlateau() {
    const z = ZONES.find((x) => x.id === zone);
    if (!z) { plateau.innerHTML = ''; return; }
    if (z.id === 'gravure') {
      plateau.innerHTML = html`
      <div class="groupe groupe--gravure">
        <label class="groupe__legende" for="gravure">Gravure sur la glace du fond</label>
        <div class="gravure">
          <input id="gravure" name="engraving" type="text" maxlength="${ENGRAVING_MAX}" autocomplete="off" spellcheck="false"
            value="${config.engraving}" placeholder="Initiales, date, un mot" aria-describedby="gravure-aide">
          <span class="gravure__compte num" data-compte-gravure>${config.engraving.length} / ${ENGRAVING_MAX}</span>
        </div>
        <p class="groupe__aide" id="gravure-aide">${ENGRAVING_MAX} caractères au plus, gravés en blanc givré sous le mouvement. ${ecartTexte(ecart({ ...config, engraving: '' }, { engraving: 'x' }))}.</p>
      </div>`;
      return;
    }
    plateau.innerHTML = html`${groupes(z.id, config).map((g) => {
      const mode = affichage(g, config);
      const actif = g.choix.find((ch) => ch.v === config[g.cle]);
      return html`
      <fieldset class="groupe">
        <legend class="groupe__legende">${g.legende}${mode === 'nuance'
          ? html` <span class="groupe__valeur" data-valeur-groupe="${g.cle}">${actif ? actif.nom : ''}</span>` : ''}</legend>
        <div class="choix choix--${mode}">
          ${g.choix.map((ch) => html`
          <label class="choix__item" title="${ch.nom}">
            <input type="radio" name="${g.cle}" value="${ch.v}" data-nom="${ch.nom}" ${config[g.cle] === ch.v ? html`checked` : ''}>
            ${mode === 'pilule' ? '' : html`<span class="choix__teinte" style="--teinte: ${ch.teinte}"></span>`}
            <span class="choix__nom">${ch.nom}</span>
            <span class="choix__ecart num" data-ecart-choix="${g.cle}:${ch.v}">${config[g.cle] === ch.v ? '' : ecartTexte(ecart(config, { [g.cle]: ch.v }), '')}</span>
          </label>`)}
        </div>
      </fieldset>`;
    })}`;
    amener(plateau.querySelector('input:checked')?.closest('.choix__item'));
  }

  // Écarts et coches mis à jour sur place (le focus clavier reste dans le groupe).
  function refreshPlateau() {
    plateau.querySelectorAll('[data-ecart-choix]').forEach((el) => {
      const [cle, v] = el.dataset.ecartChoix.split(':');
      el.textContent = config[cle] === v ? '' : ecartTexte(ecart(config, { [cle]: v }), '');
    });
    plateau.querySelectorAll('input[type="radio"]').forEach((i) => { i.checked = config[i.name] === i.value; });
    // Nuancier : la légende porte le nom du choix actif, puisque les pastilles ne l'écrivent pas.
    plateau.querySelectorAll('[data-valeur-groupe]').forEach((el) => {
      const i = plateau.querySelector(`input[name="${el.dataset.valeurGroupe}"]:checked`);
      el.textContent = i ? i.dataset.nom : '';
    });
    amener(plateau.querySelector('input:checked')?.closest('.choix__item'));
  }

  function refreshPastilles() {
    pastilles.forEach((b) => {
      const z = ZONES.find((x) => x.id === b.dataset.zone);
      b.querySelector('[data-valeur]').textContent = z.valeur(config);
    });
  }

  // ---- Changement d’option ----
  let urlTimer = 0;
  async function update(partial, { structure = false } = {}) {
    const prev = config;
    let next = normalize({ ...config, ...partial });
    // La lunette assortie au boîtier suit le boîtier.
    if (partial.case && prev.bezel === prev.case) next = normalize({ ...next, bezel: partial.case });
    config = next;
    if (structure) renderPlateau(); else refreshPlateau();
    refreshPastilles();
    prix?.set(price(config).total);
    await director.setConfig(config);
    if (!reduced && watch && !('engraving' in partial)) {
      // La lumière glisse sur la nouvelle matière : un léger balancement, puis la pose.
      const cible = poseDe(zone);
      director.to({ rotY: cible.rotY + 0.16 }, { duration: DUR.vague, ease: EASE.echappement })
        .then(() => { if (director.state.rotY === cible.rotY + 0.16) director.to({ rotY: cible.rotY }, { duration: DUR.moyen, ease: EASE.traverse }); });
    }
    clearTimeout(urlTimer);
    urlTimer = setTimeout(() => {
      const url = new URL(location.href);
      url.pathname = url.pathname.replace(/MOR-[A-Z0-9]+-[A-Z]{2}\/?$/, `MOR-${config.family}-${config.case}`);
      url.searchParams.set('c', encode(config));
      history.replaceState(history.state, '', url);
    }, 150);
    onChange?.(config, prev);
  }

  plateau.addEventListener('change', (e) => {
    const t = e.target;
    if (t.type !== 'radio') return;
    update({ [t.name]: t.value }, { structure: t.name === 'strap' });
  });
  let gravureTimer = 0;
  plateau.addEventListener('input', (e) => {
    if (e.target.name !== 'engraving') return;
    const v = e.target.value.slice(0, ENGRAVING_MAX);
    const compte = plateau.querySelector('[data-compte-gravure]');
    if (compte) compte.textContent = `${v.length} / ${ENGRAVING_MAX}`;
    clearTimeout(gravureTimer);
    gravureTimer = setTimeout(() => update({ engraving: v }), 120);
  });

  pastilles.forEach((b) => b.addEventListener('click', () => setZone(b.dataset.zone, { focus: false })));

  // ---- Rotation au glisser (souris, stylet, doigt à l’horizontale) ----
  const CRAN = Math.PI / 12;
  const glisser = root.querySelector('[data-glisser]');
  if (glisser && watch) {
    let drag = null;
    const down = (e) => {
      drag = { x: e.clientX, y: e.clientY, t: performance.now(), vx: 0 };
      glisser.setPointerCapture(e.pointerId);
      director.setTilt(false);
    };
    const move = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      const now = performance.now();
      drag.vx = dx / Math.max(1, now - drag.t);
      drag.x = e.clientX; drag.y = e.clientY; drag.t = now;
      director.state.rotY += dx * 0.009;
      director.state.rotX = THREE.MathUtils.clamp(director.state.rotX + dy * 0.004, -0.4, 0.9);
      director.apply();
    };
    const up = () => {
      if (!drag) return;
      const v = drag.vx;
      drag = null;
      director.setTilt(true);
      // La montre s’arrête sur un cran, comme une lunette : vingt-quatre positions par tour.
      const lance = !reduced && Math.abs(v) > 0.05 ? v * 0.9 : 0;
      director.to({ rotY: Math.round((director.state.rotY + lance) / CRAN) * CRAN }, { duration: lance ? DUR.moyen : DUR.court, ease: EASE.echappement });
    };
    glisser.addEventListener('pointerdown', down);
    glisser.addEventListener('pointermove', move);
    glisser.addEventListener('pointerup', up);
    glisser.addEventListener('pointercancel', up);
    glisser.addEventListener('dblclick', () => director.to(poseDe(zone), { duration: DUR.moyen }));
  }

  // ---- Filets : de chaque pastille à son ancre 3D, recalculés après chaque rendu ----
  const NS = 'http://www.w3.org/2000/svg';
  const traits = pastilles.map((b) => {
    const g = document.createElementNS(NS, 'g');
    const line = document.createElementNS(NS, 'polyline');
    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('r', '3');
    g.append(line, dot);
    g.dataset.zone = b.dataset.zone;
    svg.append(g);
    return { b, g, line, dot, zone: ZONES.find((z) => z.id === b.dataset.zone) };
  });
  const v3 = new THREE.Vector3();
  const centre = new THREE.Vector3();
  const versCam = new THREE.Vector3();
  const normale = new THREE.Vector3();
  // Face visible de chaque pièce, dans le repère de la montre (cadran vers +Z).
  const NORMALES = { bezel: [0, 0, 1], dial: [0, 0, 1], hands: [0, 0, 1], caseback: [0, 0, -1] };
  // Points candidats [position, normale] en mm dans le repère de la montre (r : demi-diamètre).
  const PLUSIEURS = {
    case: (r) => [[[-r - 0.4, -6, -0.5], [-1, 0, 0.25]], [[r + 0.4, -9, -0.5], [1, 0, 0.25]], [[-8, -r - 0.4, -0.5], [0, -1, 0.25]], [[-9, -9, -4], [0, 0, -1]]],
    strap: (r) => [[[0, r + 6, 0.5], [0, 1, 0.45]], [[0, -r - 6, 0.5], [0, -1, 0.45]]],
  };
  function filets() {
    if (!watch || narrow()) return;
    const r = root.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    director.pivot.getWorldPosition(centre);
    versCam.copy(stage.camera.position).sub(centre).normalize();
    traits.forEach(({ b, g, line, dot, zone: z }) => {
      const a = watch.userData.anchors[z.ancre];
      // Pièce absente (bracelet effacé pendant la gravure) : pas de filet.
      if (!a || (z.ancre === 'strap' && strap() && !strap().visible)) { g.style.display = 'none'; return; }
      a.getWorldPosition(v3);
      // Bracelet : son ancre est au dos de la boucle ; on vise plutôt son départ, sous la patte.
      // Boîtier et bracelet : plusieurs points possibles, on vise celui qui fait face à la caméra.
      // Les autres pièces n’ont qu’une face (lunette et cadran devant, fond derrière).
      let derriere;
      const cote = z.cote === 'g' ? -1 : 1;
      const multi = PLUSIEURS[z.ancre]?.(FAMILIES[watch.userData.config.family].diametre / 2);
      if (multi) {
        let mieux = -2;
        multi.forEach(([p, n]) => {
          normale.set(...n).transformDirection(watch.matrixWorld);
          // Le point doit faire face à la caméra ET se trouver du côté de sa pastille : sinon
          // le filet traverse le produit de part en part pour rejoindre le flanc opposé.
          const d = normale.dot(versCam) + (Math.sign(p[0]) === cote ? 0.5 : 0);
          if (d > mieux) { mieux = d; v3.set(...p).applyMatrix4(watch.matrixWorld); }
        });
        derriere = mieux < -0.15;
      } else {
        normale.set(...NORMALES[z.ancre]).transformDirection(watch.matrixWorld);
        derriere = normale.dot(versCam) < -0.15;
      }
      g.style.display = derriere ? 'none' : '';
      if (derriere) return;
      v3.project(stage.camera);
      const ax = ((v3.x + 1) / 2) * window.innerWidth - r.left;
      const ay = ((1 - v3.y) / 2) * window.innerHeight - r.top;
      const br = b.getBoundingClientRect();
      const gauche = z.cote === 'g';
      const px = (gauche ? br.right : br.left) - r.left;
      const py = br.top + br.height / 2 - r.top;
      const kx = px + (gauche ? 22 : -22);
      line.setAttribute('points', `${px.toFixed(1)},${py.toFixed(1)} ${kx.toFixed(1)},${py.toFixed(1)} ${ax.toFixed(1)},${ay.toFixed(1)}`);
      dot.setAttribute('cx', ax.toFixed(1));
      dot.setAttribute('cy', ay.toFixed(1));
      g.classList.toggle('actif', z.id === zone);
    });
  }
  cleanups.push(stage.afterRender(filets));
  cleanups.push(app.scroll.onScroll(filets));
  const onResize = () => { base = { ...director.poses.montre }; filets(); };
  window.addEventListener('resize', onResize);
  cleanups.push(() => window.removeEventListener('resize', onResize));

  // ---- Démarrage ----
  refreshPastilles();
  prix?.set(price(config).total, { anime: false });
  setZone('cadran');

  return {
    get config() { return config; },
    poseCourante: () => poseDe(zone),
    setZone,
    destroy() {
      cleanups.forEach((f) => f());
      clearTimeout(urlTimer);
      clearTimeout(gravureTimer);
      if (strap()) strap().visible = true;
      director.setTilt(true);
    },
  };
}
