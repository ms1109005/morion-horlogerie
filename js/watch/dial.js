// Cadran : plaque à motif, compteurs en creux, index appliqués, réhaut gradué, date, marquages.
import * as THREE from 'three';
import {
  dialMaterial, subdialMaterial, appliqueMaterial, lumeMaterial, printMaterial, darkMaterial,
} from './materials.js';
import { Z } from './case.js';

export const DIAL_FONT = 'Syncopate';
const INK = { noir: '#efece6', bleu: '#eef0f4', fume: '#f1e6d8', vert: '#eef2ec', saumon: '#1d1a18', argent: '#1c1d20' };
const FLANGE_BG = { noir: '#101012', bleu: '#16254f', fume: '#140e0a', vert: '#15321f', saumon: '#d99a80', argent: '#c9cacb' };

const DIAL_R = { PR42: 14.6, MO39: 13.4, AB41: 14.2 };
const FLANGE = { PR42: [14.5, 15.9, 1.7], MO39: [13.3, 14.4, 1.1], AB41: [14.1, 15.5, 1.5] };

// UV planaires centrées (0..1 sur le diamètre) : soleillé et guilloché alignés sur le centre.
function planarUV(geo, R) {
  const pos = geo.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) / (2 * R) + 0.5;
    uv[i * 2 + 1] = pos.getY(i) / (2 * R) + 0.5;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geo;
}

function circle(r, path = new THREE.Path()) {
  path.absarc(0, 0, r, 0, Math.PI * 2, false);
  return path;
}

function printCanvas(n, draw) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = n;
  draw(cv.getContext('2d'), n);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// Disque imprimé transparent posé sur le cadran (UV planaire du CircleGeometry).
function printDisc(r, texture, key, zz) {
  const m = new THREE.Mesh(new THREE.CircleGeometry(r, 96), printMaterial(texture, key));
  m.position.z = zz;
  m.renderOrder = 1;
  return m;
}

// Graduation d’un compteur : traits + chiffres.
function counterPrint(ink, ticks, labels, key) {
  return printCanvas(512, (ctx, n) => {
    const c = n / 2;
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    for (let i = 0; i < ticks; i++) {
      const a = (i / ticks) * Math.PI * 2;
      const major = i % (ticks / labels.length) === 0;
      const r1 = c * 0.96, r0 = c * (major ? 0.8 : 0.87);
      ctx.lineWidth = major ? 7 : 3.5;
      ctx.beginPath();
      ctx.moveTo(c + Math.sin(a) * r0, c - Math.cos(a) * r0);
      ctx.lineTo(c + Math.sin(a) * r1, c - Math.cos(a) * r1);
      ctx.stroke();
    }
    ctx.font = `700 54px ${DIAL_FONT}, system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    labels.forEach((txt, k) => {
      const a = (k / labels.length) * Math.PI * 2;
      const r = c * 0.6;
      ctx.fillText(txt, c + Math.sin(a) * r, c - Math.cos(a) * r);
    });
  }, key);
}

// Marquages principaux (logo, lignes) sur toute la surface du cadran.
function dialPrint(family, ink, R) {
  return printCanvas(2048, (ctx, n) => {
    const mm = n / (2 * R);
    const at = (y) => n / 2 - y * mm;
    ctx.fillStyle = ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const line = (txt, y, size, weight, spacing) => {
      ctx.font = `${weight} ${size * mm}px ${DIAL_FONT}, system-ui`;
      if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing * mm}px`;
      ctx.fillText(txt, n / 2 + (spacing * mm) / 2, at(y));
    };
    if (family === 'PR42') {
      line('MORION', 8.9, 1.55, 700, 0.55);
      line('CHRONOGRAPHE  ·  GENÈVE', 7.1, 0.5, 400, 0.22);
    } else if (family === 'MO39') {
      line('MORION', 6.4, 1.4, 700, 0.5);
      line('GENÈVE', 4.8, 0.58, 400, 0.3);
      line('AUTOMATIQUE', -6.6, 0.55, 400, 0.2);
    } else {
      line('MORION', 7.0, 1.45, 700, 0.5);
      line('ABYSSE GMT', 5.3, 0.6, 400, 0.25);
      line('300 M', -5.6, 0.62, 700, 0.2);
    }
  });
}

function flangeGeometry(r0, r1, rise, zz) {
  const geo = new THREE.RingGeometry(r0, r1, 192, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const r = Math.hypot(pos.getX(i), pos.getY(i));
    pos.setZ(i, zz + ((r - r0) / (r1 - r0)) * rise);
  }
  geo.computeVertexNormals();
  return geo;
}

function flangePrint(family, color) {
  const ink = INK[color];
  return printCanvas(2048, (ctx, n) => {
    const c = n / 2;
    const [r0, r1] = FLANGE[family];
    const inner = (r0 / r1) * c, outer = c;
    ctx.fillStyle = FLANGE_BG[color];
    ctx.beginPath();
    ctx.arc(c, c, outer, 0, Math.PI * 2);
    ctx.arc(c, c, inner, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    const ticks = family === 'PR42' ? 240 : 60;
    for (let i = 0; i < ticks; i++) {
      const a = (i / ticks) * Math.PI * 2;
      const sec = family === 'PR42' ? i % 4 === 0 : true;
      const five = family === 'PR42' ? i % 20 === 0 : i % 5 === 0;
      const len = five ? 0.34 : sec ? 0.22 : 0.12;
      const rA = inner + (outer - inner) * 0.08, rB = rA + (outer - inner) * len;
      ctx.lineWidth = five ? 5 : sec ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(c + Math.sin(a) * rA, c - Math.cos(a) * rA);
      ctx.lineTo(c + Math.sin(a) * rB, c - Math.cos(a) * rB);
      ctx.stroke();
    }
    ctx.font = `700 34px ${DIAL_FONT}, system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let k = 1; k <= 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      const r = inner + (outer - inner) * 0.72;
      ctx.save();
      ctx.translate(c + Math.sin(a) * r, c - Math.cos(a) * r);
      ctx.rotate(a);
      ctx.fillText(String(k * 5).padStart(2, '0'), 0, 0);
      ctx.restore();
    }
  });
}

// Index appliqués (bâtons facettés) + inserts luminescents, en InstancedMesh.
function buildIndices(config, zTop, positions) {
  const group = new THREE.Group();
  const bar = new THREE.Shape();
  bar.moveTo(-0.55, 0); bar.lineTo(0.55, 0); bar.lineTo(0.55, 1); bar.lineTo(-0.55, 1); bar.closePath();
  const geo = new THREE.ExtrudeGeometry(bar, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.14, bevelSegments: 1, curveSegments: 1 });
  const lumeGeo = new THREE.BoxGeometry(0.46, 1, 0.12);
  const metal = appliqueMaterial(config.hands === 'or' ? 'or' : 'acier', config.case);
  const idx = new THREE.InstancedMesh(geo, metal, positions.length);
  const lume = new THREE.InstancedMesh(lumeGeo, lumeMaterial(), positions.length);
  idx.name = 'indices';
  lume.name = 'index-lume';
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  positions.forEach(({ a, r0, r1, dx = 0 }, i) => {
    const len = r1 - r0;
    q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -a);
    const dir = new THREE.Vector3(Math.sin(a), Math.cos(a), 0);
    const side = new THREE.Vector3(Math.cos(a), -Math.sin(a), 0).multiplyScalar(dx);
    p.copy(dir).multiplyScalar(r0).add(side).setZ(zTop + 0.12);
    s.set(1, len, 1);
    idx.setMatrixAt(i, m.compose(p, q, s));
    p.copy(dir).multiplyScalar(r0 + len / 2).add(side).setZ(zTop + 0.47);
    s.set(1, len * 0.72, 1);
    lume.setMatrixAt(i, m.compose(p, q, s));
  });
  group.add(idx, lume);
  return { group, idx, lume };
}

// Abysse : pastilles rondes serties (lume) et triangle à midi.
function diveIndices(config, zTop, R) {
  const g = new THREE.Group();
  const metal = appliqueMaterial(config.hands === 'or' ? 'or' : 'acier', config.case);
  const hours = [1, 2, 4, 5, 7, 8, 10, 11];
  const cup = new THREE.InstancedMesh(new THREE.CylinderGeometry(1.25, 1.3, 0.5, 32), metal, hours.length);
  const dot = new THREE.InstancedMesh(new THREE.CylinderGeometry(1.0, 1.0, 0.2, 32), lumeMaterial(), hours.length);
  const m = new THREE.Matrix4(), rot = new THREE.Matrix4().makeRotationX(Math.PI / 2);
  hours.forEach((h, i) => {
    const a = (h / 12) * Math.PI * 2, r = R - 2.6;
    cup.setMatrixAt(i, m.copy(rot).setPosition(Math.sin(a) * r, Math.cos(a) * r, zTop + 0.25));
    dot.setMatrixAt(i, m.copy(rot).setPosition(Math.sin(a) * r, Math.cos(a) * r, zTop + 0.47));
  });
  const tri = new THREE.Shape();
  tri.moveTo(0, R - 5.0); tri.lineTo(-1.9, R - 1.2); tri.lineTo(1.9, R - 1.2); tri.closePath();
  const triMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.2, bevelSegments: 1 }), metal);
  triMesh.position.z = zTop + 0.12;
  const triIn = new THREE.Shape();
  triIn.moveTo(0, R - 4.2); triIn.lineTo(-1.25, R - 1.7); triIn.lineTo(1.25, R - 1.7); triIn.closePath();
  const triLume = new THREE.Mesh(new THREE.ExtrudeGeometry(triIn, { depth: 0.12, bevelEnabled: false }), lumeMaterial());
  triLume.position.z = zTop + 0.55;
  g.add(cup, dot, triMesh, triLume);
  return g;
}

export function buildDial(config, q = 'high') {
  const fam = config.family;
  const z = Z[fam];
  const R = DIAL_R[fam];
  const parts = {};
  const group = new THREE.Group();
  group.name = 'cadran';
  const ink = INK[config.dialColor];

  // Plaque : disque percé des compteurs (PR42) et du guichet de date.
  const plate = circle(R, new THREE.Shape());
  const subs = fam === 'PR42' ? [[-7.2, 0, 60, ['60', '20', '40']], [7.2, 0, 30, ['30', '10', '20']], [0, -7.2, 12, ['12', '3', '6', '9']]] : [];
  subs.forEach(([x, y]) => {
    const h = new THREE.Path();
    h.absarc(x, y, 4.3, 0, Math.PI * 2, true);
    plate.holes.push(h);
  });
  const dateAt = fam === 'PR42' ? [6.9, -6.9, -Math.PI / 4] : fam === 'MO39' ? [9.6, 0, 0] : [9.4, 0, 0];
  const win = new THREE.Path();
  const [dxw, dyw, aw] = dateAt;
  const W = 1.5, H = 1.15;
  const corners = [[-W, -H], [W, -H], [W, H], [-W, H]].map(([u, v]) => [
    dxw + u * Math.cos(aw) - v * Math.sin(aw), dyw + u * Math.sin(aw) + v * Math.cos(aw),
  ]);
  win.moveTo(...corners[0]);
  corners.slice(1).forEach((c) => win.lineTo(...c));
  win.closePath();
  plate.holes.push(win);

  const plateGeo = planarUV(new THREE.ExtrudeGeometry(plate, {
    depth: 0.3, bevelEnabled: false, curveSegments: q === 'low' ? 48 : 128,
  }), R);
  const dial = new THREE.Mesh(plateGeo, dialMaterial(config.dialColor, config.dialPattern));
  dial.name = 'dial';
  dial.position.z = z.dial - 0.3;
  parts.dial = dial;

  // Compteurs azurés en creux + graduations.
  subs.forEach(([x, y, ticks, labels], i) => {
    const hour = x < 0 ? 9 : x > 0 ? 3 : 6;
    const sd = new THREE.Group();
    sd.name = `subdial-${hour}`;
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(4.3, 4.3, 0.1, 64), subdialMaterial(config.dialColor));
    disc.rotation.x = Math.PI / 2;
    disc.position.z = z.dial - 0.36;
    sd.add(disc, printDisc(4.2, counterPrint(ink, ticks, labels, `sub${i}${config.dialColor}`), `sub${ticks}${config.dialColor}`, z.dial - 0.3));
    sd.position.set(x, y, 0);
    parts[`subdial-${hour}`] = sd;
  });

  // Disque de date sous le guichet.
  const dateTex = printCanvas(256, (ctx, n) => {
    ctx.fillStyle = '#f4f2ed';
    ctx.fillRect(0, 0, n, n);
    ctx.fillStyle = '#16161a';
    ctx.font = `700 118px ${DIAL_FONT}, system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('17', n / 2, n / 2 + 6);
  });
  const date = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), new THREE.MeshStandardMaterial({ map: dateTex, roughness: 0.6 }));
  date.name = 'date-window';
  date.position.set(dxw, dyw, z.dial - 0.4);
  date.rotation.z = aw;
  parts['date-window'] = date;

  // Réhaut conique gradué.
  const [f0, f1, rise] = FLANGE[fam];
  const flange = new THREE.Mesh(
    flangeGeometry(f0, f1, rise, z.dial),
    new THREE.MeshStandardMaterial({ map: flangePrint(fam, config.dialColor), roughness: 0.55, metalness: 0.2 }),
  );
  flange.name = 'flange';
  parts.flange = flange;

  // Index : 12 bâtons (double à midi), raccourcis là où passent les compteurs.
  const positions = [];
  for (let h = 0; h < 12; h++) {
    const a = (h / 12) * Math.PI * 2;
    const short = fam === 'PR42' && (h === 3 || h === 6 || h === 9);
    const dateGap = (fam !== 'PR42' && h === 3);
    if (dateGap) continue;
    if (fam === 'AB41' && h !== 6 && h !== 9) continue; // plongée : pastilles rondes ailleurs
    const r0 = short ? R - 2.4 : fam === 'AB41' ? R - 4.4 : R - 3.3, r1 = R - 0.9;
    if (h === 0) {
      positions.push({ a, r0, r1, dx: -0.8 }, { a, r0, r1, dx: 0.8 });
    } else positions.push({ a, r0, r1 });
  }
  const indices = buildIndices(config, z.dial, positions);
  parts.indices = indices.group;
  if (fam === 'AB41') parts.indices.add(diveIndices(config, z.dial, R));

  // Marquages.
  parts.logo = printDisc(R, dialPrint(fam, ink, R), `dial-${fam}-${config.dialColor}`, z.dial + 0.005);
  parts.logo.name = 'logo';

  Object.values(parts).forEach((p) => group.add(p));
  const anchors = { dial: new THREE.Object3D() };
  anchors.dial.position.set(-6.5, -8.5, z.dial);
  group.add(anchors.dial);
  return { group, parts, anchors };
}

export { INK, darkMaterial };
