// Éclaté axial : chaque pièce a une direction, une distance et un retard.
// Avant de la montre (+Z) : glace, lunette, aiguilles, cadran. Arrière (−Z) : mouvement, fond.
import * as THREE from 'three';

const Zp = new THREE.Vector3(0, 0, 1);
const Zm = new THREE.Vector3(0, 0, -1);
const Xp = new THREE.Vector3(1, 0, 0);

// [motif d’identifiant, direction, distance]. Le premier motif qui correspond l’emporte.
const RULES = [
  [/^crystal$/, Zp, 44],
  [/^bezel-screw-(\d)$/, 'radial-front', 36],
  [/^bezel-insert/, Zp, 33],
  [/^bezel$/, Zp, 29],
  [/^hand-seconds$/, Zp, 25],
  [/^hand-minute$/, Zp, 22.5],
  [/^hand-gmt$/, Zp, 21],
  [/^hand-hour$/, Zp, 20],
  [/^subhand-/, Zp, 17.5],
  [/^flange$/, Zp, 15],
  [/^indices$/, Zp, 12.5],
  [/^logo$/, Zp, 10.2],
  [/^dial$/, Zp, 10],
  [/^subdial-/, Zp, 7.5],
  [/^date-window$/, Zp, 5.5],
  [/^crown/, Xp, 13],
  [/^pusher-/, 'radial', 11],
  [/^mainplate$/, Zm, 6],
  [/^barrel$/, Zm, 10],
  [/^gear-/, Zm, 12],
  [/^balance-wheel$/, Zm, 15],
  [/^bridge-train$|^gravure-calibre$/, Zm, 18],
  [/^bridge-barrel$/, Zm, 19],
  [/^bridge-balance$/, Zm, 21],
  [/^jewels$|^chatons$/, Zm, 19.5],
  [/^lever-/, Zm, 22],
  [/^ratchet$/, Zm, 23.5],
  [/^column-wheel$/, Zm, 24.5],
  [/^screws$|^fentes$/, Zm, 26],
  [/^rotor$/, Zm, 30],
  [/^caseback-screw-/, Zm, 44],
  [/^caseback/, Zm, 38],
  [/^strap$/, Zm, 46],
];

export function assignExplode(parts) {
  let order = 0;
  const entries = [...parts.entries()];
  entries.forEach(([id, obj]) => {
    const rule = RULES.find(([re]) => re.test(id));
    obj.userData.basePos = obj.position.clone();
    if (!rule) { obj.userData.explode = null; return; }
    const [, dir, dist] = rule;
    let d;
    if (dir === 'radial' || dir === 'radial-front') {
      d = new THREE.Vector3(obj.position.x, obj.position.y, 0).normalize();
      if (dir === 'radial-front') d.multiplyScalar(0.12).add(Zp).normalize();
    } else d = dir.clone();
    obj.userData.explode = { dir: d, dist, rank: dist };
    order++;
  });
  // Retard : les pièces extrêmes (avant et arrière) partent d’abord, le cœur ensuite.
  const max = Math.max(...entries.map(([, o]) => o.userData.explode?.dist || 0));
  entries.forEach(([, o]) => {
    if (o.userData.explode) o.userData.explode.delay = (1 - o.userData.explode.dist / max) * 0.35;
  });
  return order;
}

const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

export function setExplode(parts, t) {
  // Les glaces s’effacent en s’écartant : isolées et vues de biais, elles ne renverraient
  // plus qu’un reflet blanc.
  const glass = parts.get('crystal');
  if (glass) glass.material.opacity = 1 - 0.94 * THREE.MathUtils.smoothstep(t, 0.05, 0.4);
  parts.forEach((obj) => {
    const e = obj.userData.explode;
    if (!e) return;
    const k = ease(THREE.MathUtils.clamp((t - e.delay) / (1 - 0.35), 0, 1));
    obj.position.copy(obj.userData.basePos).addScaledVector(e.dir, e.dist * k);
  });
}
