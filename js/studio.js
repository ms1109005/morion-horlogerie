// Page studio (jalon 1) : validation du rendu 3D des 3 familles, options, éclaté, export PNG.
import * as THREE from 'three';
import { createStage } from './stage/renderer.js';
import { FAMILIES, FINISHES, OPTIONS, STRAP_COLORS, REFERENCES } from './data/catalogue.js';
import { defaultConfig, normalize, encode, decode, price, formatPrice } from './store/config.js';
import { DIAL_FONT } from './watch/dial.js';
import { buildWatch } from './watch/build.js';

const params = new URLSearchParams(location.search);
// Même environnement lumineux que le site : les vignettes exportées montrent la montre telle qu'on la voit.
const stage = createStage(document.getElementById('stage'), { env: 'ecrin' });
let config = decode(params.get('c') || '') || defaultConfig(params.get('f') || 'PR42', params.get('fin') || 'AC');

await Promise.all([document.fonts.load(`700 40px ${DIAL_FONT}`), document.fonts.load(`400 40px ${DIAL_FONT}`)]);
const watch = buildWatch(config);
stage.scene.add(watch);
stage.onFrame((dt) => watch.userData.tick(dt));

// --- Panneau d’options ---

const $options = document.getElementById('options');
const $prix = document.getElementById('prix');
const $ref = document.getElementById('ref');
const nameOf = (table) => Object.fromEntries(Object.entries(table).map(([k, v]) => [k, v.nomComplet || v.nom]));

function field(label, control) {
  const wrap = document.createElement('label');
  wrap.className = 'champ';
  const span = document.createElement('span');
  span.textContent = label;
  wrap.append(span, control);
  $options.append(wrap);
  return control;
}

function select(key, label, choices) {
  const el = document.createElement('select');
  el.name = key;
  el.addEventListener('change', () => update({ [key]: el.value }));
  field(label, el);
  el.fill = (entries) => {
    el.replaceChildren(...Object.entries(entries).map(([v, t]) => new Option(t, v)));
  };
  el.fill(choices);
  return el;
}

const controls = {
  family: select('family', 'Famille', nameOf(FAMILIES)),
  case: select('case', 'Boîtier', nameOf(FINISHES)),
  bezel: select('bezel', 'Lunette', nameOf(FINISHES)),
  dialColor: select('dialColor', 'Cadran', nameOf(OPTIONS.dialColor)),
  dialPattern: select('dialPattern', 'Motif du cadran', nameOf(OPTIONS.dialPattern)),
  hands: select('hands', 'Aiguilles', nameOf(OPTIONS.hands)),
  strap: select('strap', 'Bracelet', nameOf(OPTIONS.strap)),
  strapColor: select('strapColor', 'Coloris', {}),
};

const explode = document.createElement('input');
explode.type = 'range';
explode.min = 0; explode.max = 1; explode.step = 0.001; explode.value = 0;
explode.addEventListener('input', () => watch.userData.setExplode(+explode.value));
field('Éclaté', explode);

function buttons(label, list) {
  const box = document.createElement('div');
  box.className = 'boutons';
  list.forEach(([text, fn]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = text;
    b.addEventListener('click', () => fn(b));
    box.append(b);
  });
  field(label, box);
  return box;
}

buttons('Vue', [
  ['Trois-quarts', () => stage.setView('trois-quarts', { duration: 900 })],
  ['Face', () => stage.setView('face', { duration: 900 })],
  ['Profil', () => stage.setView('profil', { duration: 900 })],
  ['Dos', () => stage.setView('dos', { duration: 900 })],
]);

let spin = params.has('tourne');
let explodeAnim = null;
buttons('Animation', [
  ['Rotation', (b) => { spin = !spin; b.setAttribute('aria-pressed', spin); }],
  ['Démonter / remonter', () => {
    const from = +explode.value, to = from > 0.5 ? 0 : 1, t0 = performance.now();
    explodeAnim = (now) => {
      const k = Math.min((now - t0) / 2600, 1);
      explode.value = from + (to - from) * k;
      watch.userData.setExplode(+explode.value);
      if (k >= 1) explodeAnim = null;
    };
  }],
  ['Fond', () => { document.body.dataset.fond = document.body.dataset.fond === 'clair' ? 'sombre' : 'clair'; }],
  ['Exporter PNG', async () => {
    const blob = await stage.exportPNG(2048);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `morion-${encode(config)}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }],
]);

stage.onFrame((dt) => {
  if (spin) watch.rotation.y += dt * 0.35;
  if (explodeAnim) explodeAnim(performance.now());
});

function syncUI() {
  for (const [k, el] of Object.entries(controls)) {
    if (k === 'strapColor') {
      el.fill(Object.fromEntries(STRAP_COLORS[config.strap].map((c) => [c, OPTIONS.strapColor[c].nom])));
      el.disabled = config.strap === 'metal';
    }
    el.value = config[k];
  }
  const p = price(config);
  $prix.textContent = formatPrice(p.total);
  $ref.textContent = `MOR-${config.family}-${config.case}  ·  ${encode(config)}`;
  const url = new URL(location.href);
  url.searchParams.set('c', encode(config));
  ['f', 'fin'].forEach((k) => url.searchParams.delete(k));
  history.replaceState(null, '', url);
}

function update(partial) {
  const next = normalize({ ...config, ...partial });
  if (partial.family || partial.case) {
    // Changer de famille ou de finition repart de la configuration de référence.
    Object.assign(next, defaultConfig(next.family, next.case), partial.family ? {} : { dialColor: config.dialColor, dialPattern: config.dialPattern, strap: config.strap, strapColor: config.strapColor });
  }
  config = normalize(next);
  watch.userData.applyConfig(config);
  watch.userData.setExplode(+explode.value);
  syncUI();
}
syncUI();

// Écran étroit : montre plus petite et remontée au-dessus du panneau bas.
if (innerWidth < 720) {
  stage.camera.position.multiplyScalar(1.9);
  stage.controls.target.y -= 24;
  stage.controls.update();
}

// --- Modes de contrôle ---

if (params.get('cam')) {
  stage.camera.position.set(...params.get('cam').split(',').map(Number));
  stage.controls.target.set(...(params.get('cible') || '0,0,0').split(',').map(Number));
  stage.controls.update();
}

// Les 4 finitions alignées, comme la fin de 60fps (?alignement=1&f=PR42).
if (params.has('alignement')) {
  watch.visible = false;
  const fam = params.get('f') || config.family;
  ['AC', 'CN', 'OJ', 'OR'].forEach((fin, i) => {
    const w = buildWatch(defaultConfig(fam, fin));
    w.position.x = (i - 1.5) * 54;
    w.rotation.y = (i - 1.5) * -0.16;
    stage.scene.add(w);
    stage.onFrame((dt) => w.userData.tick(dt));
  });
  stage.camera.position.set(0, 14, 290);
  stage.controls.target.set(0, 0, -14);
  stage.controls.update();
  document.getElementById('panneau').style.display = 'none';
}

// Vue 4 angles : trois-quarts | profil / dos | face (?quad=1).
if (params.has('quad')) {
  const QUAD = [[96, 42, 128], [205, 4, -20], [0, 10, -205], [0, 0, 170]];
  const cams = QUAD.map((p) => {
    const c = new THREE.PerspectiveCamera(26, 1, 1, 2000);
    c.position.set(...p);
    c.lookAt(0, 0, -20);
    return c;
  });
  stage.stop();
  const { renderer, scene } = stage;
  renderer.setAnimationLoop(() => {
    const size = new THREE.Vector2();
    renderer.getSize(size);
    const w = size.x / 2, h = size.y / 2;
    renderer.setScissorTest(true);
    cams.forEach((cam, i) => {
      const x = (i % 2) * w, y = (i < 2 ? 1 : 0) * h;
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
      renderer.setViewport(x, y, w, h);
      renderer.setScissor(x, y, w, h);
      renderer.render(scene, cam);
    });
    renderer.setScissorTest(false);
  });
  document.getElementById('panneau').style.display = 'none';
} else {
  stage.start();
}

// Rendus de référence pour Imagen 3 (?export=rendus) : envoyés à serve.py, qui les range dans
// _sources/rendus-3d/. 12 références en trois-quarts et de face ; acier et or rose en plus de
// profil, de dos et éclatées ; puis les 4 finitions alignées de chaque famille.
if (params.get('export') === 'rendus') {
  document.getElementById('panneau').style.display = 'none';
  stage.stop();
  const CAM = { 'trois-quarts': [84, 34, 140], face: [0, 0, 170], profil: [175, 6, -18], dos: [-62, 34, -160], eclate: [150, 60, 190] };
  const shoot = async (name, cam, w = 2048, h = w) => {
    stage.camera.position.set(...cam);
    stage.controls.target.set(0, 0, -14);
    stage.controls.update();
    const res = await fetch(`/__rendus/${name}.png`, { method: 'POST', body: await stage.exportPNG(w, h) });
    if (!res.ok) throw new Error(`${name} : ${res.status}`);
  };
  let n = 0;
  for (const r of REFERENCES) {
    watch.userData.applyConfig(r.config);
    watch.userData.setExplode(0);
    const base = r.ref.toLowerCase();
    for (const v of ['trois-quarts', 'face']) { await shoot(`${base}-${v}`, CAM[v]); n += 1; }
    if (r.finish === 'AC' || r.finish === 'OR') {
      for (const v of ['profil', 'dos']) { await shoot(`${base}-${v}`, CAM[v]); n += 1; }
      watch.userData.setExplode(1);
      await shoot(`${base}-eclate`, CAM.eclate);
      n += 1;
      watch.userData.setExplode(0);
    }
  }
  watch.visible = false;
  for (const fam of Object.keys(FAMILIES)) {
    const line = ['AC', 'CN', 'OJ', 'OR'].map((fin, i) => {
      const w = buildWatch(defaultConfig(fam, fin));
      w.position.x = (i - 1.5) * 54;
      w.rotation.y = (i - 1.5) * -0.16;
      stage.scene.add(w);
      return w;
    });
    await shoot(`alignement-${fam.toLowerCase()}`, [0, 12, 212], 2048, 1024);
    line.forEach((w) => { stage.scene.remove(w); w.userData.dispose(); });
    n += 1;
  }
  watch.visible = true;
  document.title = `rendus exportés : ${n}`;
}

window.__studio = { stage, THREE, watch, get config() { return config; }, update, explode: (t) => watch.userData.setExplode(t) };
