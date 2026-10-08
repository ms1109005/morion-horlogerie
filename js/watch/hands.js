// Aiguilles facettées avec inserts luminescents, et mise à l’heure.
import * as THREE from 'three';
import { appliqueMaterial, lumeMaterial, METAL_F0 } from './materials.js';
import { Z } from './case.js';

// Lame en pointe : largeur de base w0, largeur avant la pointe w1, longueur L, queue t.
function bladeShape(L, w0, w1, tail, tip = 1.4) {
  const s = new THREE.Shape();
  s.moveTo(-w0 / 2, -tail);
  s.lineTo(w0 / 2, -tail);
  s.lineTo(w1 / 2, L - tip);
  s.lineTo(0, L);
  s.lineTo(-w1 / 2, L - tip);
  s.closePath();
  return s;
}

function extrudeHand(shape, depth, bevel = 0.08) {
  return new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, curveSegments: 16,
  });
}

function handMaterial(config) {
  return appliqueMaterial(config.hands === 'or' ? 'or' : 'acier', config.case);
}

// Aiguille principale : lame métal + insert lume + canon central.
function mainHand(name, config, { L, w0, w1, tail, zz, lume = true }) {
  const g = new THREE.Group();
  g.name = name;
  const metal = new THREE.Mesh(extrudeHand(bladeShape(L, w0, w1, tail), 0.14), handMaterial(config));
  g.add(metal);
  if (lume) {
    const ins = new THREE.Mesh(
      extrudeHand(bladeShape(L - 2.6, w0 * 0.45, w1 * 0.5, -2.2, 0.9), 0.1, 0.02),
      lumeMaterial(),
    );
    ins.position.z = 0.16;
    g.add(ins);
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(w0 * 0.75, w0 * 0.75, 0.3, 32), handMaterial(config));
  hub.rotation.x = Math.PI / 2;
  hub.position.z = 0.07;
  g.add(hub);
  g.position.z = zz;
  return g;
}

// Trotteuse ou aiguille de compteur : aiguille fine avec contrepoids.
function needle(name, material, { L, tail, w = 0.28, zz, disc = 0.55 }) {
  const g = new THREE.Group();
  g.name = name;
  const s = new THREE.Shape();
  s.moveTo(-w / 2, -tail);
  s.lineTo(w / 2, -tail);
  s.lineTo(w * 0.3, L);
  s.lineTo(-w * 0.3, L);
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: false });
  g.add(new THREE.Mesh(geo, material));
  const c = new THREE.Mesh(new THREE.CylinderGeometry(disc, disc, 0.18, 24), material);
  c.rotation.x = Math.PI / 2;
  c.position.set(0, -tail * 0.72, 0.04);
  g.add(c);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.26, 24), material);
  hub.rotation.x = Math.PI / 2;
  hub.position.z = 0.1;
  g.add(hub);
  g.position.z = zz;
  return g;
}

const accentMaterial = (() => {
  let m;
  return () => (m ??= new THREE.MeshPhysicalMaterial({ color: '#d4552a', roughness: 0.35, metalness: 0.2, clearcoat: 0.6 }));
})();

export function buildHands(config) {
  const fam = config.family;
  const z = Z[fam].dial;
  const parts = {};
  const group = new THREE.Group();
  group.name = 'aiguilles';
  const len = { PR42: [8.6, 13.0, 14.3], MO39: [8.2, 12.0, 12.8], AB41: [8.4, 12.6, 13.8] }[fam];

  parts['hand-hour'] = mainHand('hand-hour', config, { L: len[0], w0: 1.45, w1: 1.05, tail: 1.6, zz: z + 0.35 });
  parts['hand-minute'] = mainHand('hand-minute', config, { L: len[1], w0: 1.2, w1: 0.8, tail: 1.8, zz: z + 0.62 });
  const metal = handMaterial(config);
  parts['hand-seconds'] = needle('hand-seconds', fam === 'PR42' ? accentMaterial() : metal, { L: len[2], tail: 3.6, zz: z + 0.95 });
  if (fam === 'AB41') {
    parts['hand-gmt'] = needle('hand-gmt', accentMaterial(), { L: 12.2, tail: 0.6, w: 0.34, zz: z + 0.2, disc: 0.01 });
  }
  if (fam === 'PR42') {
    [[-7.2, 0, 9], [7.2, 0, 3], [0, -7.2, 6]].forEach(([x, y, h]) => {
      const n = needle(`subhand-${h}`, metal, { L: 3.7, tail: 0.9, w: 0.3, zz: z - 0.2, disc: 0.01 });
      n.position.x = x;
      n.position.y = y;
      parts[`subhand-${h}`] = n;
    });
  }
  Object.values(parts).forEach((p) => group.add(p));

  // Heure de vitrine : 10 h 10, trotteuse de chrono à 12 h, compteurs lisibles.
  function setTime(h = 10, m = 10, s = 0) {
    const turn = (x) => -x * Math.PI * 2;
    parts['hand-hour'].rotation.z = turn(((h % 12) + m / 60) / 12);
    parts['hand-minute'].rotation.z = turn((m + s / 60) / 60);
    parts['hand-seconds'].rotation.z = fam === 'PR42' ? 0 : turn(s / 60);
    if (parts['hand-gmt']) parts['hand-gmt'].rotation.z = turn(((h + 3) % 24 + m / 60) / 24);
    if (fam === 'PR42') {
      parts['subhand-9'].rotation.z = turn(s / 60);
      parts['subhand-3'].rotation.z = turn(12 / 30);
      parts['subhand-6'].rotation.z = turn(2 / 12);
    }
  }
  setTime();

  const anchors = { hands: new THREE.Object3D() };
  anchors.hands.position.set(2.2, 3.6, z + 0.8);
  group.add(anchors.hands);
  return { group, parts, anchors, setTime };
}

export { METAL_F0 };
