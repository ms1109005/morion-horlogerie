// Mouvement automatique (calibre fictif MR-01) : platine, ponts, rouages, balancier, rotor.
// Vu côté fond (−Z). Cotes Z : platine −1.4..−0.2, rouages ≈ −2, ponts −3.4..−2.4, rotor −4.4..−3.8.
import * as THREE from 'three';
import { movementMaterial } from './materials.js';
import { suivre } from './textures.js';

const deg = (d) => (d * Math.PI) / 180;

function sectorShape(r0, r1, a0, a1) {
  const s = new THREE.Shape();
  s.absarc(0, 0, r1, deg(a0), deg(a1), false);
  s.absarc(0, 0, r0, deg(a1), deg(a0), true);
  s.closePath();
  return s;
}

// Roue dentée ajourée : n dents trapézoïdales, bras en rayons.
function gearShape(r, teeth, { spokes = 4, hub = 0.25, rim = 0.18, toothH = 0.07 } = {}) {
  const s = new THREE.Shape();
  const rr = r * (1 - toothH);
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2, da = (Math.PI * 2) / teeth;
    const pts = [[rr, a], [r, a + da * 0.22], [r, a + da * 0.5], [rr, a + da * 0.72]];
    pts.forEach(([rad, ang], k) => {
      const x = Math.cos(ang) * rad, y = Math.sin(ang) * rad;
      if (i === 0 && k === 0) s.moveTo(x, y); else s.lineTo(x, y);
    });
  }
  s.closePath();
  if (spokes > 0 && r > 1.2) {
    const inner = rr * (1 - rim), hubR = r * hub;
    const gap = 360 / spokes;
    for (let k = 0; k < spokes; k++) {
      const a0 = k * gap + gap * 0.16, a1 = (k + 1) * gap - gap * 0.16;
      const h = new THREE.Path();
      h.absarc(0, 0, inner, deg(a0), deg(a1), false);
      h.absarc(0, 0, hubR, deg(a1), deg(a0), true);
      h.closePath();
      s.holes.push(h);
    }
  }
  const axle = new THREE.Path();
  axle.absarc(0, 0, Math.min(0.28, r * 0.12), 0, Math.PI * 2, true);
  s.holes.push(axle);
  return s;
}

function ext(shape, depth, bevel = 0, curve = 48) {
  return new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, curveSegments: curve,
  });
}

const named = (obj, name) => { obj.name = name; return obj; };

// Gravure du calibre : la même sur toutes les montres, dessinée une fois. Recréée à chaque montre,
// sa texture 1024² n’était jamais libérée (une de plus par montre construite, page après page).
let gravureMat = null;
function gravureMaterial() {
  if (gravureMat) return gravureMat;
  const engr = document.createElement('canvas');
  engr.width = engr.height = 1024;
  const ctx = engr.getContext('2d');
  ctx.fillStyle = '#d9b36a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 58px Syncopate, system-ui';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '10px';
  ctx.fillText('MORION', 512, 440);
  ctx.font = '400 30px Syncopate, system-ui';
  ctx.fillText('CALIBRE MR-01  ·  33 RUBIS', 512, 520);
  const engrTex = suivre(new THREE.CanvasTexture(engr));
  engrTex.colorSpace = THREE.SRGBColorSpace;
  engrTex.anisotropy = 8;
  gravureMat = new THREE.MeshStandardMaterial({ map: engrTex, alphaToCoverage: true, metalness: 1, roughness: 0.25, polygonOffset: true, polygonOffsetUnits: -4 });
  return gravureMat;
}

export function buildMovement(config, q = 'high') {
  const fam = config.family;
  const curve = q === 'low' ? 24 : 64;
  const parts = {};
  const group = new THREE.Group();
  group.name = 'mouvement';
  const bridgeMats = [movementMaterial('pont'), movementMaterial('anglage')];
  const scale = fam === 'MO39' ? 0.92 : 1;

  // Platine perlée.
  const plateShape = new THREE.Shape();
  plateShape.absarc(0, 0, 13.6, 0, Math.PI * 2, false);
  const plate = named(new THREE.Mesh(ext(plateShape, 1.2, 0, curve), [movementMaterial('platine'), movementMaterial('anglage')]), 'mainplate');
  plate.position.z = -1.4;
  parts.mainplate = plate;

  // Rouages dorés (entre platine et ponts).
  const gearDefs = [
    ['gear-centre', 0, 0, 4.4, 80], ['gear-moyenne', 4.6, 5.4, 3.1, 70], ['gear-secondes', 7.0, 1.1, 2.6, 60],
    ['gear-echappement', 7.6, -3.3, 1.7, 20], ['barrel', -5.8, 1.6, 5.8, 96], ['gear-remontoir', -6.4, -6.4, 2.2, 40],
  ];
  gearDefs.forEach(([id, x, y, r, n]) => {
    const g = named(new THREE.Mesh(ext(gearShape(r, n, { spokes: id === 'barrel' ? 0 : 4 }), 0.32, 0, 24), movementMaterial('dore')), id);
    g.position.set(x, y, id === 'barrel' ? -2.35 : -2.05);
    g.userData.speed = { 'gear-centre': 0.02, 'gear-moyenne': -0.15, 'gear-secondes': 1.05, 'gear-echappement': -3.2, barrel: 0.004, 'gear-remontoir': 0 }[id];
    parts[id] = g;
  });

  // Ponts côtes de Genève, anglage poli.
  const bridges = {
    'bridge-barrel': sectorShape(3.2, 13.1, 104, 236),
    'bridge-train': sectorShape(2.2, 12.2, -8, 88),
  };
  // Coq de balancier : bras depuis le bord jusqu’au-dessus du balancier.
  const cock = new THREE.Shape();
  cock.moveTo(12.6, -9.2); cock.lineTo(8.2, -3.4); cock.quadraticCurveTo(7.4, -2.4, 6.3, -3.3);
  cock.lineTo(5.6, -5.4); cock.quadraticCurveTo(5.4, -6.6, 6.2, -7.2); cock.lineTo(10.2, -12.3);
  cock.closePath();
  bridges['bridge-balance'] = cock;
  Object.entries(bridges).forEach(([id, sh]) => {
    const b = named(new THREE.Mesh(ext(sh, 0.8, 0.12, curve), bridgeMats), id);
    b.position.z = -3.3;
    parts[id] = b;
  });
  parts['bridge-balance'].position.z = -3.9;

  // Rochet poli sur le pont de barillet.
  const ratchet = named(new THREE.Mesh(ext(gearShape(4.2, 60, { spokes: 0 }), 0.35, 0.05, 24), movementMaterial('anglage')), 'ratchet');
  ratchet.position.set(-5.8, 1.6, -3.85);
  parts.ratchet = ratchet;

  // Balancier (serge dorée, 3 bras) et spiral bleui, sous le coq.
  const balance = new THREE.Group();
  balance.name = 'balance-wheel';
  const rimShape = new THREE.Shape();
  rimShape.absarc(0, 0, 3.3, 0, Math.PI * 2, false);
  const rimHole = new THREE.Path();
  rimHole.absarc(0, 0, 2.85, 0, Math.PI * 2, true);
  rimShape.holes.push(rimHole);
  balance.add(new THREE.Mesh(ext(rimShape, 0.45, 0.04, curve), movementMaterial('dore')));
  for (let k = 0; k < 3; k++) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.34, 2.9, 0.3), movementMaterial('dore'));
    arm.position.set(Math.cos(deg(k * 120)) * 1.45, Math.sin(deg(k * 120)) * 1.45, 0.2);
    arm.rotation.z = deg(k * 120 - 90);
    balance.add(arm);
  }
  const spiralPts = [];
  for (let i = 0; i <= 260; i++) {
    const a = (i / 260) * Math.PI * 2 * 11;
    const r = 0.45 + (i / 260) * 2.0;
    spiralPts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, -0.25));
  }
  const spiral = named(new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spiralPts), 520, 0.035, 5, false),
    movementMaterial('bleui'),
  ), 'hairspring');
  balance.add(spiral);
  balance.position.set(7.2, -6.3, -3.2);
  parts['balance-wheel'] = balance;

  // Roue à colonnes (chronographe) et deux leviers polis.
  if (fam === 'PR42') {
    const cw = new THREE.Group();
    cw.name = 'column-wheel';
    cw.add(new THREE.Mesh(ext(gearShape(1.9, 18, { spokes: 0 }), 0.3, 0, 24), movementMaterial('bleui')));
    for (let k = 0; k < 6; k++) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.8, 12), movementMaterial('anglage'));
      col.rotation.x = Math.PI / 2;
      col.position.set(Math.cos(deg(k * 60)) * 1.2, Math.sin(deg(k * 60)) * 1.2, -0.35);
      cw.add(col);
    }
    cw.position.set(-1.8, -8.6, -3.6);
    parts['column-wheel'] = cw;
    const lever = (pts, id) => {
      const s = new THREE.Shape();
      s.moveTo(...pts[0]);
      pts.slice(1).forEach((p) => s.lineTo(...p));
      s.closePath();
      const m = named(new THREE.Mesh(ext(s, 0.25, 0.06, 8), movementMaterial('anglage')), id);
      m.position.z = -3.75;
      return m;
    };
    parts['lever-a'] = lever([[-0.4, -8.0], [3.6, -10.8], [4.6, -10.1], [0.4, -7.2]], 'lever-a');
    parts['lever-b'] = lever([[-3.2, -7.4], [-9.4, -4.1], [-9.0, -3.3], [-2.6, -6.6]], 'lever-b');
  }

  // Rotor ajouré (secteur inférieur) et sa masse en or.
  const rotor = new THREE.Group();
  rotor.name = 'rotor';
  const rotorShape = sectorShape(2.6, 10.8, 192, 348);
  [[210, 238], [252, 288], [302, 330]].forEach(([a0, a1]) => {
    const h = new THREE.Path();
    h.absarc(0, 0, 9.2, deg(a0), deg(a1), false);
    h.absarc(0, 0, 4.4, deg(a1), deg(a0), true);
    h.closePath();
    rotorShape.holes.push(h);
  });
  rotor.add(new THREE.Mesh(ext(rotorShape, 0.4, 0.08, curve), bridgeMats));
  const weight = named(new THREE.Mesh(ext(sectorShape(10.6, 12.7, 186, 354), 0.7, 0.12, curve), movementMaterial('masse-or')), 'rotor-weight');
  weight.position.z = -0.15;
  rotor.add(weight);
  const hubShape = new THREE.Shape();
  hubShape.absarc(0, 0, 2.7, 0, Math.PI * 2, false);
  rotor.add(new THREE.Mesh(ext(hubShape, 0.5, 0.08, 32), movementMaterial('anglage')));
  rotor.position.z = -4.45;
  parts.rotor = rotor;
  parts['rotor-weight'] = weight;

  // Rubis sertis et vis bleuies, en InstancedMesh.
  const jewelAt = [[4.6, 5.4], [7.0, 1.1], [7.6, -3.3], [7.2, -6.3], [-5.8, 1.6], [-6.4, -6.4], [2.4, 9.8], [-9.6, 7.1]];
  const jewels = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.42, 0.42, 0.14, 20), movementMaterial('rubis'), jewelAt.length);
  jewels.name = 'jewels';
  const screwAt = [[10.2, 6.9], [-3.2, 11.8], [-11.9, 3.6], [-8.9, -8.6], [11.4, -1.4], [3.1, 11.2], [9.9, -10.7], [-12.4, -1.8]];
  const screws = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.62, 0.62, 0.3, 24), movementMaterial('bleui'), screwAt.length);
  screws.name = 'screws';
  const chatons = new THREE.InstancedMesh(new THREE.TorusGeometry(0.62, 0.2, 10, 28), movementMaterial('dore'), jewelAt.length);
  chatons.name = 'chatons';
  const slots = new THREE.InstancedMesh(new THREE.BoxGeometry(1.0, 0.18, 0.2), movementMaterial('bleui'), screwAt.length);
  slots.name = 'fentes';
  const m = new THREE.Matrix4(), rot = new THREE.Matrix4().makeRotationX(Math.PI / 2);
  jewelAt.forEach(([x, y], i) => {
    jewels.setMatrixAt(i, m.copy(rot).setPosition(x, y, -3.47));
    chatons.setMatrixAt(i, m.identity().setPosition(x, y, -3.48));
  });
  screwAt.forEach(([x, y], i) => {
    screws.setMatrixAt(i, m.copy(rot).setPosition(x, y, -3.5));
    slots.setMatrixAt(i, m.makeRotationZ(Math.atan2(y, x)).setPosition(x, y, -3.66));
  });
  parts.jewels = jewels;
  parts.screws = screws;
  parts.chatons = chatons;
  parts.fentes = slots;

  // Gravure dorée du calibre sur le pont de rouage (lue depuis le fond).
  const engraving = named(new THREE.Mesh(new THREE.PlaneGeometry(13, 13), gravureMaterial()), 'gravure-calibre');
  engraving.rotation.set(0, Math.PI, deg(-40));
  engraving.position.set(5.2, 4.6, -3.42);
  parts['gravure-calibre'] = engraving;

  Object.entries(parts).forEach(([id, p]) => { if (id !== 'rotor-weight') group.add(p); });
  // Monolithe extra-plate : calibre aminci pour tenir entre cadran et fond.
  if (fam === 'MO39') {
    group.scale.set(scale, scale, 0.62);
    group.position.z = 0.05;
  }

  let t = 0;
  function tick(dt) {
    t += dt;
    balance.rotation.z = Math.sin(t * Math.PI * 2 * 3) * 1.6;
    for (const [id] of gearDefs) {
      const g = parts[id];
      if (id === 'gear-echappement') g.rotation.z = -Math.floor(t * 6) * (Math.PI * 2 / 20);
      else g.rotation.z += (g.userData.speed || 0) * dt;
    }
  }
  return { group, parts, tick };
}
