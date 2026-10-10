// Directeur de scène : la montre persistante du site. Une pose par route, un voyage entre deux
// poses, l’inclinaison au pointeur, le changement de famille, et le halo du fond qui la suit.
import * as THREE from 'three';
import { DUR, EASE } from '../core/motion.js';
import { FAMILIES } from '../data/catalogue.js';

// x, y : position dans l’écran (-1 à 1, fractions de la demi-largeur et de la demi-hauteur).
// taille : diamètre de la tête de montre en part de la hauteur visible. Rotations en radians.
export const POSES = {
  accueil: { x: 0.3, y: 0.02, taille: 0.4, rotX: 0.12, rotY: -0.42, rotZ: 0, eclate: 0 },
  // La collection a ses propres montres (salles) ou pose celle-ci sur la carte survolée (grille).
  collection: { x: 0, y: 0, taille: 0.3, rotX: 0.16, rotY: 0.72, rotZ: 0, eclate: 0, k: 0 },
  montre: { x: 0, y: 0.14, taille: 0.34, rotX: 0.1, rotY: -0.3, rotZ: 0, eclate: 0 },
  // La commande montre ses propres vignettes rendues : la montre du site se retire.
  commande: { x: 0.62, y: 0.34, taille: 0.16, rotX: 0.16, rotY: -0.55, rotZ: 0, eclate: 0, k: 0 },
  // La montre commandée est posée dans l’écrin, à gauche du récapitulatif.
  merci: { x: -0.42, y: -0.08, taille: 0.24, rotX: 0.06, rotY: 0, rotZ: 0, eclate: 0 },
  introuvable: { x: 0.28, y: 0, taille: 0.3, rotX: 0.28, rotY: -1.1, rotZ: 0.1, eclate: 0.85 },
};
export const POSES_ETROIT = {
  accueil: { x: 0, y: 0.4, taille: 0.27, rotX: 0.1, rotY: -0.32, rotZ: 0, eclate: 0 },
  collection: { x: 0, y: 0.3, taille: 0.2, rotX: 0.14, rotY: 0.6, rotZ: 0, eclate: 0, k: 0 },
  montre: { x: 0, y: 0.47, taille: 0.21, rotX: 0.1, rotY: -0.25, rotZ: 0, eclate: 0 },
  commande: { x: 0.55, y: 0.62, taille: 0.1, rotX: 0.16, rotY: -0.55, rotZ: 0, eclate: 0, k: 0 },
  merci: { x: 0, y: 0.33, taille: 0.12, rotX: 0.06, rotY: 0, rotZ: 0, eclate: 0 },
  introuvable: { x: 0, y: 0.28, taille: 0.24, rotX: 0.28, rotY: -1.1, rotZ: 0.1, eclate: 0.85 },
};

const CAM_Z = 400;

export function createDirector(stage, watch, { reduced = false, halo = null } = {}) {
  const { scene, camera } = stage;
  const gsap = window.gsap;
  camera.position.set(0, 0, CAM_Z);
  camera.lookAt(0, 0, 0);

  // pose (position, échelle) → inclinaison (pointeur) → rotation de la pose → montre
  const pivot = new THREE.Group();
  const tilt = new THREE.Group();
  const spin = new THREE.Group();
  pivot.add(tilt);
  tilt.add(spin);
  spin.add(watch);
  scene.add(pivot);

  // Ombre portée : une tache douce derrière la montre, un peu plus bas, qui la détache du fond.
  // Elle reste fixe quand la montre s’incline au pointeur : c’est ce décalage qui donne la profondeur.
  const ombre = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const d = g.createRadialGradient(64, 64, 6, 64, 64, 64);
    d.addColorStop(0, 'rgba(0,0,0,0.62)'); d.addColorStop(0.45, 'rgba(0,0,0,0.3)'); d.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = d; g.fillRect(0, 0, 128, 128);
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, toneMapped: false }),
    );
    m.renderOrder = -1;
    pivot.add(m);
    return m;
  })();

  const narrow = () => window.innerWidth < 720;
  const table = () => (narrow() ? POSES_ETROIT : POSES);
  let current = 'accueil';
  const state = { ...table().accueil, k: 1, visible: 1 };
  let tween = null;

  const visibleHeight = () => 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));

  function apply() {
    const h = visibleHeight();
    const w = h * camera.aspect;
    const diametre = FAMILIES[watch.userData.config.family].diametre;
    pivot.position.set((state.x * w) / 2, (state.y * h) / 2, 0);
    pivot.scale.setScalar(Math.max(1e-4, (state.taille * state.k * h) / diametre));
    pivot.visible = state.visible > 0.001 && state.k > 0.001;
    spin.rotation.set(state.rotX, state.rotY, state.rotZ);
    watch.userData.setExplode(state.eclate);
    ombre.scale.set(diametre * 2.1, diametre * 2.9, 1);
    ombre.position.set(diametre * 0.07, -diametre * 0.16, -diametre * 0.9);
    ombre.material.opacity = 1 - Math.min(1, state.eclate * 1.5);
    if (halo) {
      // Le centre du fumé suit la montre : translation composée par le GPU, aucun repeint.
      halo.style.transform = `translate3d(calc(-50% + ${state.x * 50}vw), calc(-50% + ${-state.y * 50}dvh), 0)`;
    }
    stage.invalidate();
  }

  function to(target, { duration = DUR.voyage, ease = EASE.traverse, immediate = false } = {}) {
    tween?.kill();
    if (immediate || reduced) {
      Object.assign(state, target);
      apply();
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      tween = gsap.to(state, { ...target, duration, ease, onUpdate: apply, onComplete: resolve, onInterrupt: resolve });
    });
  }

  function pose(name, opts = {}) {
    current = name;
    // Une pose remet toujours la montre entière et visible (une page a pu la réduire).
    return to({ k: 1, visible: 1, ...table()[name] }, opts);
  }

  async function setConfig(config) {
    const cfg = watch.userData.config;
    const same = Object.keys(config).every((k) => cfg[k] === config[k]);
    if (same) return;
    if (config.family === cfg.family || reduced) {
      watch.userData.applyConfig(config);
      apply();
      return;
    }
    // Autre famille : la montre se retire d’un geste court, change, puis reprend sa place.
    await new Promise((r) => gsap.to(state, { k: 0, duration: DUR.court, ease: EASE.traverse, onUpdate: apply, onComplete: r }));
    watch.userData.applyConfig(config);
    await new Promise((r) => gsap.to(state, { k: 1, duration: DUR.moyen, ease: EASE.sortie, onUpdate: apply, onComplete: r }));
  }

  // Inclinaison au pointeur (souris seulement) : amortie, et rien à rendre une fois posée.
  const aim = { x: 0, y: 0 };
  let tiltOn = !reduced && window.matchMedia('(pointer: fine)').matches;
  window.addEventListener('pointermove', (e) => {
    if (!tiltOn || e.pointerType !== 'mouse') return;
    aim.x = (e.clientY / window.innerHeight - 0.5) * 0.16;
    aim.y = (e.clientX / window.innerWidth - 0.5) * 0.24;
  }, { passive: true });
  stage.onFrame((dt) => {
    const tx = tiltOn ? aim.x : 0;
    const ty = tiltOn ? aim.y : 0;
    const dx = tx - tilt.rotation.x;
    const dy = ty - tilt.rotation.y;
    if (Math.abs(dx) < 1e-4 && Math.abs(dy) < 1e-4) return;
    const k = 1 - Math.exp(-dt * 5);
    tilt.rotation.x += dx * k;
    tilt.rotation.y += dy * k;
    stage.invalidate();
  });

  window.addEventListener('resize', () => apply());
  apply();

  // Shaders compilés pendant l’intro : aucun à-coup à la première apparition.
  const ready = stage.renderer.compileAsync(scene, camera).catch(() => {}).then(() => { stage.invalidate(); });

  return {
    watch, state, ready, pivot, spin, tilt,
    pose, to, apply, setConfig,
    setTilt(on) { tiltOn = on && !reduced; stage.invalidate(); },
    get current() { return current; },
    get poses() { return table(); },
  };
}
