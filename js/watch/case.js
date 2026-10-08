// Tête de montre : carrure, lunette, vis, glace, couronne, poussoirs, fond.
// Unités en mm. Cadran face à +Z, 12 h = +Y, couronne à +X.
import * as THREE from 'three';
import { caseMaterial, sapphireMaterial, darkMaterial, printMaterial } from './materials.js';

// Cotes verticales partagées avec le cadran et le mouvement.
export const Z = {
  PR42: { back: -6.0, caseBottom: -4.0, caseTop: 2.6, bezelTop: 4.6, crystalTop: 4.8, dial: 0.85 },
  MO39: { back: -4.4, caseBottom: -3.0, caseTop: 1.9, bezelTop: 3.0, crystalTop: 3.3, dial: 0.55 },
  AB41: { back: -6.3, caseBottom: -4.2, caseTop: 2.4, bezelTop: 4.85, crystalTop: 5.25, dial: 0.9 },
};

// --- Tracés 2D ---

// Polygone régulier à coins arrondis, un côté à plat en haut (hexagone : sommets à 3 h et 9 h).
function roundedPolygon(path, n, apothem, r, move = true) {
  const R = apothem / Math.cos(Math.PI / n);
  const verts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return new THREE.Vector2(Math.cos(a) * R, Math.sin(a) * R);
  });
  const d = r / Math.tan((Math.PI - (2 * Math.PI) / n) / 2);
  verts.forEach((v, i) => {
    const prev = verts[(i + n - 1) % n], next = verts[(i + 1) % n];
    const a = v.clone().add(prev.clone().sub(v).setLength(d));
    const b = v.clone().add(next.clone().sub(v).setLength(d));
    if (i === 0 && move) path.moveTo(a.x, a.y); else path.lineTo(a.x, a.y);
    path.quadraticCurveTo(v.x, v.y, b.x, b.y);
  });
  path.closePath();
  return path;
}

// Glace légèrement bombée (profil de révolution autour de Y, comme un CylinderGeometry).
function domedCrystal(r, thick, dome, segs) {
  const pts = [
    [0.001, thick / 2 + dome], [r * 0.45, thick / 2 + dome * 0.82], [r * 0.75, thick / 2 + dome * 0.48],
    [r * 0.93, thick / 2 + dome * 0.14], [r, thick / 2], [r, -thick / 2], [0.001, -thick / 2],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(pts, segs);
}

function circlePath(r, path = new THREE.Path()) {
  path.absarc(0, 0, r, 0, Math.PI * 2, false);
  return path;
}

// Carrure ronde à pattes intégrées (Prisme) : cercle + trapèzes vers le bracelet.
function integratedCaseShape(R, rootHalf, tipHalf, tipY) {
  const rootY = Math.sqrt(R * R - rootHalf * rootHalf);
  const a = Math.atan2(rootY, rootHalf);
  const s = new THREE.Shape();
  s.moveTo(rootHalf, -rootY);
  s.absarc(0, 0, R, -a, a, false);
  s.lineTo(tipHalf, tipY);
  s.lineTo(-tipHalf, tipY);
  s.lineTo(-rootHalf, rootY);
  s.absarc(0, 0, R, Math.PI - a, Math.PI + a, false);
  s.lineTo(-tipHalf, -tipY);
  s.lineTo(tipHalf, -tipY);
  s.closePath();
  return s;
}

// Profil cannelé (couronne moletée).
function flutedCircle(r, flutes, depth, steps = 6) {
  const s = new THREE.Shape();
  const total = flutes * steps;
  for (let i = 0; i <= total; i++) {
    const a = (i / total) * Math.PI * 2;
    const k = Math.cos(((i % steps) / steps) * Math.PI * 2);
    const rr = r - depth * (0.5 - 0.5 * k);
    if (i === 0) s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); else s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  return s;
}

// Pattes qui plongent vers le bracelet : abaisse le dessus de la géométrie au-delà de |y| = from,
// proportionnellement à la hauteur (le dessous reste à plat sur le poignet).
function slopeLugs(geo, { from, slope, zMid, zTop }) {
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = Math.abs(pos.getY(i)), zz = pos.getZ(i);
    if (y <= from || zz <= zMid) continue;
    const k = Math.min((zz - zMid) / (zTop - zMid), 1);
    pos.setZ(i, zz - (y - from) * slope * k);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

function extrude(shape, { depth, bevel = 0, bevelSize = bevel, segments = 3, curve = 96 }) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize,
    bevelSegments: segments, curveSegments: curve, steps: 1,
  });
  g.computeVertexNormals();
  return g;
}

// Place une géométrie extrudée entre zBottom et zTop (bevel compris).
function placeZ(mesh, zBottom, bevel) {
  mesh.position.z = zBottom + bevel;
  return mesh;
}

const mesh = (geo, mat, name) => {
  const m = new THREE.Mesh(geo, mat);
  m.name = name;
  return m;
};

// Matières du boîtier : [faces planes brossées, flancs et chanfreins polis].
export const caseMats = (finish) => [caseMaterial(finish, 'brosse'), caseMaterial(finish, 'poli')];

// --- Prisme 42 ---

function buildPrisme(config, q) {
  const z = Z.PR42;
  const curve = q === 'low' ? 48 : 96;
  const parts = {};
  const group = new THREE.Group();
  group.name = 'tete';

  // Carrure ronde r 20.2, évidée pour cadran et mouvement, et deux pattes intégrées qui en
  // sortent en plongeant vers le bracelet (plans propres : 4 sommets par dessus).
  const bevelC = 0.6;
  const depthC = z.caseTop - z.caseBottom - bevelC * 2;
  const caseShape = circlePath(20.2, new THREE.Shape());
  caseShape.holes.push(circlePath(17.2));
  const caseGroup = new THREE.Group();
  caseGroup.name = 'case';
  caseGroup.add(placeZ(mesh(
    extrude(caseShape, { depth: depthC, bevel: bevelC, segments: 3, curve }), caseMats(config.case), 'case-carrure',
  ), z.caseBottom, bevelC));
  // Racine en arc r 17.4 (hors de l’ouverture du cadran, cachée dans la carrure).
  const rootY = Math.sqrt(17.4 ** 2 - 13.4 ** 2);
  const lugShape = new THREE.Shape();
  lugShape.moveTo(13.4, rootY);
  lugShape.lineTo(12.0, 23.8);
  lugShape.lineTo(-12.0, 23.8);
  lugShape.lineTo(-13.4, rootY);
  lugShape.absarc(0, 0, 17.4, Math.PI - Math.atan2(rootY, 13.4), Math.atan2(rootY, 13.4), true);
  const lugGeo = slopeLugs(
    extrude(lugShape, { depth: depthC - 0.1, bevel: bevelC, segments: 3, curve: 24 }),
    { from: rootY - 0.5, slope: 0.22, zMid: depthC * 0.25, zTop: depthC + bevelC },
  );
  [0, Math.PI].forEach((rot, i) => {
    const lug = placeZ(mesh(lugGeo, caseMats(config.case), `case-corne-${i ? 'bas' : 'haut'}`), z.caseBottom, bevelC);
    lug.rotation.z = rot;
    caseGroup.add(lug);
  });
  parts.case = caseGroup;

  // Lunette hexagonale : double chanfrein vif (facettes de cristal), dessus brossé.
  const bevelB = 0.8, bevelBS = 1.0;
  const bezelShape = roundedPolygon(new THREE.Shape(), 6, 17.5 - bevelBS, 2.4);
  bezelShape.holes.push(circlePath(16.2));
  parts.bezel = placeZ(mesh(
    extrude(bezelShape, { depth: z.bezelTop - z.caseTop - bevelB * 2, bevel: bevelB, bevelSize: bevelBS, segments: 1, curve }),
    caseMats(config.bezel), 'bezel',
  ), z.caseTop, bevelB);

  // 6 vis sur les sommets, fentes alignées vers le centre.
  const screwGeo = new THREE.CylinderGeometry(0.95, 1.0, 0.5, 32);
  const slotGeo = new THREE.BoxGeometry(1.25, 0.24, 0.16);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const s = mesh(screwGeo, caseMaterial(config.bezel, 'brosse'), `bezel-screw-${i}`);
    s.rotation.x = Math.PI / 2;
    s.position.set(Math.cos(a) * 17.6, Math.sin(a) * 17.6, z.bezelTop + 0.2);
    const slot = mesh(slotGeo, darkMaterial(), `bezel-screw-${i}-fente`);
    slot.rotation.set(-Math.PI / 2, a, 0);
    slot.position.y = 0.2;
    s.add(slot);
    parts[`bezel-screw-${i}`] = s;
  }

  // Glace saphir, affleurant la lunette.
  const crystal = mesh(domedCrystal(16.3, 0.8, 0.4, curve), sapphireMaterial(q === 'low'), 'crystal');
  crystal.rotation.x = Math.PI / 2;
  crystal.position.z = z.crystalTop - 0.5;
  crystal.renderOrder = 2;
  parts.crystal = crystal;

  // Couronne moletée et son tube, à 3 h, à mi-hauteur de carrure.
  const midZ = (z.caseTop + z.caseBottom) / 2;
  const crownGeo = extrude(flutedCircle(3.1, 34, 0.22), { depth: 2.8, bevel: 0.35, segments: 2, curve: 12 });
  const crown = mesh(crownGeo, caseMaterial(config.case, 'poli'), 'crown');
  crown.rotation.y = Math.PI / 2;
  crown.position.set(21.3, 0, midZ);
  const neck = mesh(new THREE.CylinderGeometry(1.5, 1.5, 1.6, 32), caseMaterial(config.case, 'poli'), 'crown-tube');
  neck.rotation.z = Math.PI / 2;
  neck.position.set(20.4, 0, midZ);
  parts.crown = crown;
  parts['crown-tube'] = neck;

  // Poussoirs de chronographe à 2 h et 4 h.
  const pusherBody = new THREE.CylinderGeometry(1.7, 1.7, 2.4, 40);
  const pusherCap = extrude(circlePath(2.05, new THREE.Shape()), { depth: 0.6, bevel: 0.3, segments: 3, curve: 40 });
  [[2, Math.PI / 6], [4, -Math.PI / 6]].forEach(([h, a]) => {
    const p = new THREE.Group();
    p.name = `pusher-${h}`;
    const body = mesh(pusherBody, caseMaterial(config.case, 'brosse'), `pusher-${h}-corps`);
    body.rotation.z = -Math.PI / 2;
    body.position.x = 1.1;
    const cap = mesh(pusherCap, caseMaterial(config.case, 'poli'), `pusher-${h}-tete`);
    cap.rotation.y = Math.PI / 2;
    cap.position.x = 2.3;
    p.add(body, cap);
    p.position.set(Math.cos(a) * 19.4, Math.sin(a) * 19.4, midZ);
    p.rotation.z = a;
    parts[`pusher-${h}`] = p;
  });

  // Fond vissé à fenêtre saphir, 6 vis traversantes, marquages gravés.
  const bevelF = 0.5;
  const backShape = circlePath(19.2, new THREE.Shape());
  backShape.holes.push(circlePath(12.4));
  parts.caseback = placeZ(mesh(
    extrude(backShape, { depth: z.caseBottom - z.back - bevelF * 2, bevel: bevelF, segments: 2, curve }),
    caseMats(config.case), 'caseback',
  ), z.back, bevelF);
  const window_ = mesh(new THREE.CylinderGeometry(12.7, 12.7, 0.8, curve), sapphireMaterial(q === 'low'), 'caseback-crystal');
  window_.rotation.x = Math.PI / 2;
  window_.position.z = z.back + 0.5;
  window_.renderOrder = 2;
  parts['caseback-crystal'] = window_;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const s = mesh(screwGeo, caseMaterial(config.case, 'poli'), `caseback-screw-${i}`);
    s.rotation.x = Math.PI / 2;
    s.position.set(Math.cos(a) * 16.6, Math.sin(a) * 16.6, z.back - 0.15);
    parts[`caseback-screw-${i}`] = s;
  }
  const marks = mesh(
    new THREE.RingGeometry(13.2, 15.4, curve, 1),
    printMaterial(backMarks('PR42'), 'back-PR42'),
    'caseback-marks',
  );
  marks.rotation.y = Math.PI;
  marks.position.z = z.back - 0.01;
  parts['caseback-marks'] = marks;

  Object.values(parts).forEach((p) => group.add(p));

  const anchors = {
    case: anchor(-20.6, -6, midZ),
    bezel: anchor(-15.2, 8.8, z.bezelTop),
    caseback: anchor(0, 0, z.back),
  };
  Object.values(anchors).forEach((a) => group.add(a));
  return { group, parts, anchors };
}

function anchor(x, y, zz) {
  const o = new THREE.Object3D();
  o.position.set(x, y, zz);
  o.name = 'ancre';
  return o;
}

// Texte circulaire gravé sur le fond (canvas carré, UV planaire du RingGeometry).
function backMarks(family) {
  return ringText(`back-${family}`, 1024, [
    'MORION', 'GENÈVE',
    { PR42: 'PRISME CHRONOGRAPHE', MO39: 'MONOLITHE AUTOMATIQUE', AB41: 'ABYSSE GMT' }[family],
    'SAPHIR', { PR42: 'ÉTANCHE 100 M', MO39: 'ÉTANCHE 50 M', AB41: 'ÉTANCHE 300 M' }[family],
  ]);
}

const ringCache = new Map();
function ringText(key, n, words) {
  if (ringCache.has(key)) return ringCache.get(key);
  const cv = document.createElement('canvas');
  cv.width = cv.height = n;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = 'rgba(30,30,32,0.85)';
  ctx.font = '600 34px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const text = words.join('   ·   ') + '   ·   ';
  const chars = Array.from(text);
  const r = n * 0.46 * (14.3 / 15.4);
  chars.forEach((ch, i) => {
    const a = (i / chars.length) * Math.PI * 2;
    ctx.save();
    ctx.translate(n / 2 + Math.sin(a) * r, n / 2 - Math.cos(a) * r);
    ctx.rotate(a);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  ringCache.set(key, t);
  return t;
}

// --- Éléments partagés par Monolithe et Abysse ---

function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

// 4 cornes classiques (bracelet entre les cornes), qui plongent vers le poignet.
function horns(config, z, { inner, width, y0, y1, from, slope }) {
  const bevel = 0.45;
  const depth = z.caseTop - z.caseBottom - bevel * 2 - 0.3;
  const group = new THREE.Group();
  [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([sx, sy], i) => {
    const s = new THREE.Shape();
    const xa = sx * inner, xb = sx * (inner + width);
    s.moveTo(xa, sy * y0); s.lineTo(xb, sy * y0); s.lineTo(xb, sy * (y1 - 1.2));
    s.quadraticCurveTo(xb, sy * y1, (xa + xb) / 2, sy * y1);
    s.quadraticCurveTo(xa, sy * y1, xa, sy * (y1 - 1.2));
    s.closePath();
    const geo = slopeLugs(extrude(s, { depth, bevel, segments: 3, curve: 8 }),
      { from, slope, zMid: depth * 0.2, zTop: depth + bevel });
    group.add(placeZ(mesh(geo, caseMats(config.case), `case-corne-${i}`), z.caseBottom, bevel));
  });
  return group;
}

function crystalPart(r, z, q) {
  const c = mesh(domedCrystal(r, 0.7, 0.35, q === 'low' ? 48 : 96), sapphireMaterial(q === 'low'), 'crystal');
  c.rotation.x = Math.PI / 2;
  c.position.z = z.crystalTop - 0.45;
  c.renderOrder = 2;
  return c;
}

function crownPart(config, x, zz, r, len, flutes = 30) {
  const g = new THREE.Group();
  g.name = 'crown';
  const head = mesh(extrude(flutedCircle(r, flutes, 0.2), { depth: len, bevel: 0.35, segments: 2, curve: 12 }),
    caseMaterial(config.case, 'poli'), 'crown-tete');
  head.rotation.y = Math.PI / 2;
  head.position.x = 0.9;
  const tube = mesh(new THREE.CylinderGeometry(r * 0.48, r * 0.48, 1.6, 24), caseMaterial(config.case, 'poli'), 'crown-tube');
  tube.rotation.z = Math.PI / 2;
  g.add(head, tube);
  g.position.set(x, 0, zz);
  return g;
}

function casebackParts(config, z, rOuter, rWindow, q, family) {
  const parts = {};
  const bevel = 0.45;
  const shape = circlePath(rOuter, new THREE.Shape());
  shape.holes.push(circlePath(rWindow));
  parts.caseback = placeZ(mesh(
    extrude(shape, { depth: z.caseBottom - z.back - bevel * 2, bevel, segments: 2, curve: q === 'low' ? 48 : 96 }),
    caseMats(config.case), 'caseback',
  ), z.back, bevel);
  const w = mesh(new THREE.CylinderGeometry(rWindow + 0.3, rWindow + 0.3, 0.7, 64), sapphireMaterial(q === 'low'), 'caseback-crystal');
  w.rotation.x = Math.PI / 2;
  w.position.z = z.back + 0.45;
  w.renderOrder = 2;
  parts['caseback-crystal'] = w;
  const marks = mesh(new THREE.RingGeometry(rWindow + 0.8, rOuter - 1.2, 96, 1),
    printMaterial(backMarks(family), `back-${family}`), 'caseback-marks');
  marks.rotation.y = Math.PI;
  marks.position.z = z.back - 0.01;
  parts['caseback-marks'] = marks;
  return parts;
}

// --- Monolithe 39 : coussin extra-plat ---

function buildMonolithe(config, q) {
  const z = Z.MO39;
  const curve = q === 'low' ? 48 : 96;
  const parts = {};
  const group = new THREE.Group();
  group.name = 'tete';
  const bevel = 0.5;
  const depth = z.caseTop - z.caseBottom - bevel * 2;
  const cs = roundedRectShape(39 - bevel * 2, 39 - bevel * 2, 9);
  cs.holes.push(circlePath(16.4));
  const caseGroup = new THREE.Group();
  caseGroup.name = 'case';
  caseGroup.add(placeZ(mesh(extrude(cs, { depth, bevel, segments: 3, curve }), caseMats(config.case), 'case-carrure'), z.caseBottom, bevel));
  caseGroup.add(horns(config, z, { inner: 10.1, width: 2.5, y0: 15.5, y1: 24.2, from: 18.6, slope: 0.3 }));
  parts.case = caseGroup;

  const bs = roundedRectShape(37.2 - 0.9, 37.2 - 0.9, 8.2);
  bs.holes.push(circlePath(15.2));
  parts.bezel = placeZ(mesh(
    extrude(bs, { depth: z.bezelTop - z.caseTop - 0.9, bevel: 0.45, segments: 3, curve }),
    caseMats(config.bezel), 'bezel',
  ), z.caseTop, 0.45);

  parts.crystal = crystalPart(15.3, z, q);
  parts.crown = crownPart(config, 19.4, (z.caseTop + z.caseBottom) / 2, 2.5, 2.2);
  Object.assign(parts, casebackParts(config, z, 16.8, 11.6, q, 'MO39'));

  Object.values(parts).forEach((p) => group.add(p));
  const anchors = {
    case: anchor(-19.6, -8, (z.caseTop + z.caseBottom) / 2),
    bezel: anchor(-13.5, 13.5, z.bezelTop),
    caseback: anchor(0, 0, z.back),
  };
  Object.values(anchors).forEach((a) => group.add(a));
  return { group, parts, anchors };
}

// --- Abysse 41 GMT : plongée, lunette tournante crantée à insert 24 h ---

function notchedRing(rOut, rIn, notches, depth) {
  const s = new THREE.Shape();
  const steps = notches * 4;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const r = (i % 4 === 1 || i % 4 === 2) ? rOut - depth : rOut;
    if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r); else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  s.holes.push(circlePath(rIn));
  return s;
}

function gmtScale(color) {
  const ink = '#ecebe6';
  return ringScale24(color, ink);
}

const ring24Cache = new Map();
function ringScale24(bg, ink) {
  const key = `${bg}${ink}`;
  if (ring24Cache.has(key)) return ring24Cache.get(key);
  const n = 2048;
  const cv = document.createElement('canvas');
  cv.width = cv.height = n;
  const ctx = cv.getContext('2d');
  const c = n / 2;
  const inner = c * (16.4 / 19.9);
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 104px Syncopate, system-ui';
  for (let h = 0; h < 24; h++) {
    const a = (h / 24) * Math.PI * 2;
    const r = (inner + c) / 2;
    ctx.save();
    ctx.translate(c + Math.sin(a) * r, c - Math.cos(a) * r);
    ctx.rotate(a);
    if (h === 0) {
      ctx.beginPath();
      ctx.moveTo(0, 48); ctx.lineTo(-44, -40); ctx.lineTo(44, -40); ctx.closePath();
      ctx.fill();
    } else if (h % 2 === 0) {
      ctx.fillText(String(h), 0, 4);
    } else {
      ctx.fillRect(-8, -26, 16, 52);
    }
    ctx.restore();
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  ring24Cache.set(key, t);
  return t;
}

function buildAbysse(config, q) {
  const z = Z.AB41;
  const curve = q === 'low' ? 48 : 128;
  const parts = {};
  const group = new THREE.Group();
  group.name = 'tete';
  const bevel = 0.55;
  const depth = z.caseTop - z.caseBottom - bevel * 2;

  // Carrure ronde avec protège-couronne à 3 h.
  const R = 20.5 - bevel;
  const a0 = Math.asin(6.0 / R);
  const cs = new THREE.Shape();
  cs.moveTo(Math.cos(a0) * R, Math.sin(a0) * R);
  cs.absarc(0, 0, R, a0, Math.PI * 2 - a0, false);
  cs.quadraticCurveTo(21.2, -6.4, 21.7, -4.4);
  cs.lineTo(21.7, 4.4);
  cs.quadraticCurveTo(21.2, 6.4, Math.cos(a0) * R, Math.sin(a0) * R);
  cs.holes.push(circlePath(17.2));
  const caseGroup = new THREE.Group();
  caseGroup.name = 'case';
  caseGroup.add(placeZ(mesh(extrude(cs, { depth, bevel, segments: 3, curve }), caseMats(config.case), 'case-carrure'), z.caseBottom, bevel));
  caseGroup.add(horns(config, z, { inner: 11.0, width: 3.4, y0: 15.6, y1: 23.6, from: 17.2, slope: 0.44 }));
  parts.case = caseGroup;

  // Lunette crantée (120 crans) et insert céramique gradué 24 h.
  parts.bezel = placeZ(mesh(
    extrude(notchedRing(20.9 - 0.35, 16.4, 120, 0.4), { depth: 2.0 - 0.7, bevel: 0.35, segments: 2, curve }),
    caseMats(config.bezel), 'bezel',
  ), z.caseTop, 0.35);
  const insertColor = config.dialColor === 'bleu' ? '#15224a' : config.dialColor === 'vert' ? '#123325' : '#0c0c0d';
  const insertShape = circlePath(19.9, new THREE.Shape());
  insertShape.holes.push(circlePath(16.4));
  const insert = mesh(extrude(insertShape, { depth: 0.35, bevel: 0.08, segments: 1, curve }),
    new THREE.MeshPhysicalMaterial({ color: insertColor, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }), 'bezel-insert');
  insert.position.z = z.caseTop + 2.0;
  parts['bezel-insert'] = insert;
  const print = mesh(new THREE.RingGeometry(16.5, 19.8, curve, 1), printMaterial(gmtScale(insertColor), `gmt-${insertColor}`), 'bezel-insert-print');
  print.position.z = z.caseTop + 2.0 + 0.44;
  parts['bezel-insert-print'] = print;

  parts.crystal = crystalPart(16.2, z, q);
  parts.crown = crownPart(config, 21.9, (z.caseTop + z.caseBottom) / 2, 3.3, 2.6, 26);
  Object.assign(parts, casebackParts(config, z, 19.4, 12.2, q, 'AB41'));

  Object.values(parts).forEach((p) => group.add(p));
  const anchors = {
    case: anchor(-20.6, -6, (z.caseTop + z.caseBottom) / 2),
    bezel: anchor(-14.6, 12.2, z.bezelTop),
    caseback: anchor(0, 0, z.back),
  };
  Object.values(anchors).forEach((a) => group.add(a));
  return { group, parts, anchors };
}

export function buildCase(config, q = 'high') {
  switch (config.family) {
    case 'MO39': return buildMonolithe(config, q);
    case 'AB41': return buildAbysse(config, q);
    default: return buildPrisme(config, q);
  }
}

// Change les matières sans reconstruire (finitions boîtier et lunette).
export function applyCaseFinish(parts, config) {
  const brosseOuPoli = (m) => (m.name.endsWith(':brosse') ? 'brosse' : 'poli');
  for (const [id, obj] of Object.entries(parts)) {
    const finish = id.startsWith('bezel') ? config.bezel : config.case;
    obj.traverse((o) => {
      if (!o.isMesh || id.includes('crystal') || id.includes('marks') || id.includes('insert') || o.name.endsWith('-fente')) return;
      o.material = Array.isArray(o.material)
        ? caseMats(finish)
        : caseMaterial(finish, brosseOuPoli(o.material));
    });
  }
}
