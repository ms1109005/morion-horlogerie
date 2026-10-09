// Bracelets : trajet autour d’un poignet ovale (plan YZ), maillons métal, caoutchouc, cuir.
import * as THREE from 'three';
import { braceletMaterial, strapMaterial } from './materials.js';

// Points d’attache (bout des pattes) et forme du poignet, par famille.
const ATTACH = {
  PR42: { y: 24.0, z: -2.2, w: 24, wEnd: 19 },
  MO39: { y: 19.9, z: -1.2, w: 19.6, wEnd: 16 },
  AB41: { y: 20.9, z: -1.4, w: 21.6, wEnd: 18 },
};

// Trajet complet : de la patte de 12 h, autour du poignet, jusqu’à la patte de 6 h.
export function strapCurve(family) {
  const { y, z } = ATTACH[family];
  const half = [
    [y, z], [y + 4.4, z - 3.2], [y + 7.3, z - 9.8], [y + 7.6, z - 18.5],
    [y + 4.4, z - 28.6], [y - 3.2, z - 37.2], [y - 13.2, z - 42.3], [0, z - 43.8],
  ];
  const pts = [
    ...half.map(([yy, zz]) => new THREE.Vector3(0, yy, zz)),
    ...half.slice(0, -1).reverse().map(([yy, zz]) => new THREE.Vector3(0, -yy, zz)),
  ];
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal');
}

// Repère local en un point du trajet : X = largeur, T = sens du bracelet, N = extérieur.
function frameAt(curve, u) {
  const p = curve.getPointAt(u);
  const t = curve.getTangentAt(u).normalize();
  const x = new THREE.Vector3(1, 0, 0);
  const n = new THREE.Vector3().crossVectors(x, t).normalize();
  return { p, t, x, n };
}

const widthAt = (a, u) => {
  const k = 1 - Math.min(Math.abs(u - 0.5) / 0.5, 1); // 0 aux pattes, 1 au fermoir
  return a.w + (a.wEnd - a.w) * Math.pow(k, 0.8);
};

function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

// Profil d'un maillon dans le plan (sens du bracelet, extérieur) : trapèze aux coins arrondis,
// face extérieure bombée de `crown`. Extrudé sur la largeur, puis tourné pour que X = largeur,
// Y = sens du bracelet, Z = extérieur (le repère de frameAt).
function linkGeometry(lenOut, lenIn, th, crown, width, bevel) {
  // Le biseau déborde du profil de `bs` : on le retire pour garder les cotes demandées.
  const bs = bevel * 0.8, ho = lenOut / 2 - bs, hi = lenIn / 2 - bs, h = th / 2 - bs, r = Math.min(0.32, th * 0.11);
  const s = new THREE.Shape();
  s.moveTo(-hi + r, -h);
  s.lineTo(hi - r, -h);
  s.quadraticCurveTo(hi, -h, hi + (ho - hi) * (r / th), -h + r);
  s.lineTo(ho, h - r);
  s.quadraticCurveTo(ho, h, ho - r, h);
  s.quadraticCurveTo(0, h + crown * 2, -ho + r, h);
  s.quadraticCurveTo(-ho, h, -ho, h - r);
  s.lineTo(-hi - (ho - hi) * (r / th), -h + r);
  s.quadraticCurveTo(-hi, -h, -hi + r, -h);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: width, bevelEnabled: true, bevelThickness: bevel, bevelSize: bs, bevelSegments: 3, curveSegments: 8,
  });
  g.translate(0, 0, -width / 2);
  g.applyMatrix4(new THREE.Matrix4().set(0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1));
  return g;
}

// --- Bracelet métal intégré : maillons latéraux brossés, maillons centraux polis ---

function metalBracelet(config, curve, a, q) {
  const group = new THREE.Group();
  const L = curve.getLength();
  const pitch = 4.3; // maillons plus courts : le galbe du poignet ne se lit plus en escalier
  const claspHalf = 12 / L; // zone du fermoir, au milieu du trajet
  const rows = [];
  for (let s = pitch * 0.55; s < L - pitch * 0.3; s += pitch) {
    const u = s / L;
    if (Math.abs(u - 0.5) < claspHalf) continue;
    rows.push(u);
  }
  // Chaque maillon est un voussoir vu de profil : plus long dehors que dedans, face extérieure
  // bombée, arêtes arrondies. Posés sur le galbe du poignet, les maillons se touchent presque
  // par leur face extérieure et le bracelet se lit comme une bande continue, au lieu d'une
  // file de cubes séparés par des vides. Le chanfrein court sur les deux flancs du maillon.
  const thick = 3.0;
  const BIS_O = 0.3, BIS_C = 0.24;
  const outerRef = a.w * 0.34 - 0.25;
  const centerRef = a.w - a.w * 0.34 * 2 - 0.5;
  const outerGeo = linkGeometry(pitch - 0.2, (pitch - 0.2) * 0.84, thick, 0.1, outerRef - BIS_O * 2, BIS_O);
  const centerGeo = linkGeometry(pitch / 2 - 0.22, (pitch / 2 - 0.22) * 0.84, thick - 0.5, 0.14, centerRef - BIS_C * 2, BIS_C);
  centerGeo.translate(0, 0, 0.42);
  // Flancs (bouchons de l'extrusion) polis, dessus brossé dans le sens du bracelet.
  const mats = [braceletMaterial(config.case, 'poli'), braceletMaterial(config.case, 'brosse')];
  const outer = new THREE.InstancedMesh(outerGeo, mats, rows.length * 2);
  const center = new THREE.InstancedMesh(centerGeo, braceletMaterial(config.case, 'poli'), rows.length * 2);
  outer.name = 'maillons-lateraux';
  center.name = 'maillons-centraux';

  const m = new THREE.Matrix4(), basis = new THREE.Matrix4(), sc = new THREE.Matrix4();
  rows.forEach((u, i) => {
    const { p, t, x, n } = frameAt(curve, u);
    const w = widthAt(a, u);
    const outerW = w * 0.34, centerW = w - outerW * 2 - 0.5;
    basis.makeBasis(x, t, n);
    [-1, 1].forEach((side, k) => {
      const pos = p.clone().addScaledVector(x, side * (w / 2 - outerW / 2));
      m.copy(basis).setPosition(pos).multiply(sc.makeScale((outerW - 0.25) / outerRef, 1, 1));
      outer.setMatrixAt(i * 2 + k, m);
      const pc = p.clone().addScaledVector(t, side * pitch / 4);
      m.copy(basis).setPosition(pc).multiply(sc.makeScale(centerW / centerRef, 1, 1));
      center.setMatrixAt(i * 2 + k, m);
    });
  });
  group.add(outer, center);
  group.add(clasp(config, curve, a, true));
  return group;
}

// Fermoir déployant : plaque brossée légèrement galbée au bas du poignet.
function clasp(config, curve, a, integrated) {
  const w = a.wEnd - (integrated ? 0.6 : 1.5);
  const geo = new THREE.ExtrudeGeometry(roundedRect(w, 26, 2), {
    depth: 1.6, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.5, bevelSegments: 3, curveSegments: 8,
  });
  const mesh = new THREE.Mesh(geo, [braceletMaterial(config.case, 'brosse'), braceletMaterial(config.case, 'poli')]);
  const { p, t, x, n } = frameAt(curve, 0.5);
  mesh.matrix.makeBasis(x, t, n).setPosition(p.clone().addScaledVector(n, -0.2));
  mesh.matrixAutoUpdate = false;
  mesh.name = 'clasp';
  return mesh;
}

// --- Caoutchouc et cuir : balayage d’un profil arrondi le long du trajet ---

function sweepStrap(curve, a, { thick, u0, u1, segs = 120, ring = 28 }) {
  const L = curve.getLength() * (u1 - u0);
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= segs; i++) {
    const u = u0 + (u1 - u0) * (i / segs);
    const { p, x, n } = frameAt(curve, u);
    const w = widthAt(a, u);
    const th = thick * (1 - 0.18 * (1 - Math.min(Math.abs(u - 0.5) / 0.5, 1)));
    for (let j = 0; j <= ring; j++) {
      const ang = (j / ring) * Math.PI * 2;
      // Super-ellipse : flancs droits, arêtes adoucies.
      const cx = Math.sign(Math.cos(ang)) * Math.pow(Math.abs(Math.cos(ang)), 0.22);
      const cy = Math.sign(Math.sin(ang)) * Math.pow(Math.abs(Math.sin(ang)), 0.5);
      const v = p.clone().addScaledVector(x, cx * w / 2).addScaledVector(n, cy * th / 2);
      pos.push(v.x, v.y, v.z);
      uv.push(j / ring * 2, (i / segs) * L / 10);
    }
  }
  for (let i = 0; i < segs; i++) {
    for (let j = 0; j < ring; j++) {
      const A = i * (ring + 1) + j, B = A + ring + 1;
      idx.push(A, B, A + 1, B, B + 1, A + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function stitches(curve, a, thick, u0, u1, color) {
  const L = curve.getLength() * (u1 - u0);
  const pitch = 1.5;
  const count = Math.floor(L / pitch);
  const geo = new THREE.BoxGeometry(0.3, 0.95, 0.25);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
  const inst = new THREE.InstancedMesh(geo, mat, count * 2);
  inst.name = 'surpiqures';
  const m = new THREE.Matrix4();
  for (let i = 0; i < count; i++) {
    const u = u0 + (u1 - u0) * ((i + 0.5) / count);
    const { p, t, x, n } = frameAt(curve, u);
    const w = widthAt(a, u);
    [-1, 1].forEach((side, k) => {
      const pos = p.clone().addScaledVector(x, side * (w / 2 - 1.3)).addScaledVector(n, thick * 0.49);
      m.makeBasis(x, t, n).setPosition(pos);
      inst.setMatrixAt(i * 2 + k, m);
    });
  }
  return inst;
}

export function buildStrap(config, q = 'high') {
  const a = ATTACH[config.family];
  const curve = strapCurve(config.family);
  const parts = {};
  const group = new THREE.Group();
  group.name = 'bracelet';

  if (config.strap === 'metal') {
    parts.strap = metalBracelet(config, curve, a, q);
  } else {
    const leather = config.strap === 'cuir';
    const thick = leather ? 3.0 : 3.5;
    const mat = strapMaterial(config.strap, config.strapColor);
    const s = new THREE.Group();
    const top = new THREE.Mesh(sweepStrap(curve, a, { thick, u0: 0.004, u1: 0.47, segs: q === 'low' ? 60 : 120 }), mat);
    const bottom = new THREE.Mesh(sweepStrap(curve, a, { thick, u0: 0.53, u1: 0.996, segs: q === 'low' ? 60 : 120 }), mat);
    top.name = 'strap-top';
    bottom.name = 'strap-bottom';
    s.add(top, bottom);
    if (leather) {
      const thread = config.strapColor === 'cognac' ? '#e6d2b0' : '#2b2926';
      s.add(stitches(curve, a, thick, 0.01, 0.46, thread), stitches(curve, a, thick, 0.54, 0.99, thread));
    }
    s.add(clasp(config, curve, a, false));
    parts.strap = s;
  }
  parts.strap.name = 'strap';
  group.add(parts.strap);

  const anchors = { strap: new THREE.Object3D() };
  const { p, n } = frameAt(curve, 0.12);
  anchors.strap.position.copy(p.addScaledVector(n, 1.5));
  anchors.strap.position.x = -a.w / 2 + 2;
  group.add(anchors.strap);
  return { group, parts, anchors, curve };
}
