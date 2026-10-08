// Assemblage d’une montre MORION à partir d’une configuration.
// buildWatch(config) → Group ; tout le pilotage passe par group.userData.
import * as THREE from 'three';
import { normalize } from '../store/config.js';
import { FINISHES } from '../data/catalogue.js';
import { buildCase, applyCaseFinish } from './case.js';
import { buildDial } from './dial.js';
import { buildHands } from './hands.js';
import { buildStrap } from './strap.js';
import { buildMovement } from './movement.js';
import { assignExplode, setExplode } from './explode.js';
import { engravingMesh, disposeEngraving } from './gravure.js';

const SUBS = ['head', 'dial', 'hands', 'strap', 'movement'];

export function buildWatch(config, { quality = 'high' } = {}) {
  const root = new THREE.Group();
  const state = { config: normalize(config), explode: 0, time: [10, 10, 0], subs: {} };
  const parts = new Map();
  const anchors = {};

  const makers = {
    head: (c) => buildCase(c, quality),
    dial: (c) => buildDial(c, quality),
    hands: (c) => buildHands(c),
    strap: (c) => buildStrap(c, quality),
    movement: (c) => buildMovement(c, quality),
  };

  function indexParts() {
    parts.clear();
    for (const key of SUBS) {
      const sub = state.subs[key];
      Object.entries(sub.parts).forEach(([id, obj]) => parts.set(id, obj));
      Object.assign(anchors, sub.anchors || {});
    }
    // Glaces : une matière propre à cette montre (son opacité suit l’éclaté).
    ['crystal', 'caseback-crystal'].forEach((id) => {
      const g = parts.get(id);
      if (!g) return;
      state.glass ??= g.material.clone();
      g.material = state.glass;
    });
    assignExplode(parts);
    setExplode(parts, state.explode);
    updateEngraving();
  }

  // Gravure : un plan enfant de la glace du fond, recréé seulement quand le texte change.
  let engraving = null;
  function updateEngraving() {
    disposeEngraving(engraving);
    engraving = null;
    const crystal = parts.get('caseback-crystal');
    if (!state.config.engraving || !crystal) return;
    engraving = engravingMesh(state.config.engraving);
    crystal.add(engraving);
  }

  function build(keys) {
    for (const key of keys) {
      const old = state.subs[key];
      if (old) {
        root.remove(old.group);
        disposeGroup(old.group);
      }
      const sub = makers[key](state.config);
      state.subs[key] = sub;
      root.add(sub.group);
    }
    root.name = `montre-${state.config.family}`;
    state.subs.hands.setTime(...state.time);
    indexParts();
  }

  // Change la configuration : matières échangées sur place quand c’est possible,
  // sinon seuls les sous-ensembles concernés sont reconstruits.
  function applyConfig(partial) {
    const prev = state.config;
    const next = normalize({ ...prev, ...partial });
    state.config = next;
    if (next.family !== prev.family) return build(SUBS);

    const rebuild = new Set();
    const goldChanged = FINISHES[next.case].or !== FINISHES[prev.case].or || (next.case !== prev.case && next.hands === 'or');
    if (next.case !== prev.case || next.bezel !== prev.bezel) {
      applyCaseFinish(state.subs.head.parts, next);
      if (next.strap === 'metal' || next.strap !== prev.strap) rebuild.add('strap');
      if (goldChanged) { rebuild.add('hands'); rebuild.add('dial'); }
      if (next.family === 'AB41') rebuild.add('head');
    }
    if (next.dialColor !== prev.dialColor || next.dialPattern !== prev.dialPattern) {
      rebuild.add('dial');
      if (next.family === 'AB41' && next.dialColor !== prev.dialColor) rebuild.add('head');
    }
    if (next.hands !== prev.hands) { rebuild.add('hands'); rebuild.add('dial'); }
    if (next.strap !== prev.strap || next.strapColor !== prev.strapColor) rebuild.add('strap');
    if (rebuild.size) build([...rebuild]);
    else if (next.engraving !== prev.engraving) updateEngraving();
  }

  build(SUBS);

  root.userData = {
    get config() { return state.config; },
    parts,
    anchors,
    applyConfig,
    setTime(h, m, s) { state.time = [h, m, s]; state.subs.hands.setTime(h, m, s); },
    setExplode(t) { state.explode = t; setExplode(parts, t); },
    tick(dt) { state.subs.movement.tick(dt); },
    dispose() { disposeGroup(root); },
  };
  return root;
}

// Libère les géométries propres au groupe (les matières et textures sont en cache partagé).
function disposeGroup(group) {
  group.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
}
