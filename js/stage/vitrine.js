// Quatre Prisme de l’accueil (acier, céramique, or jaune, or rose). Construits au repos, une
// montre par créneau libre, hors de la scène ; shaders compilés et textures envoyées au GPU avant
// la première apparition. Placés en coordonnées d’écran comme la montre du directeur.
// Deux usages : « solo » (chapitres et seuil : une seule montre, la matière change par échange
// de visibilité, sans reconstruction) et « finale » (les quatre alignées).
import * as THREE from 'three';
import { buildWatch } from '../watch/build.js';
import { defaultConfig } from '../store/config.js';
import { FAMILIES } from '../data/catalogue.js';

const CAM_Z = 400;
export const FINITIONS_FINALE = ['AC', 'CN', 'OJ', 'OR'];

export function createVitrine(stage) {
  const { scene, camera, renderer } = stage;
  const groupe = new THREE.Group();
  groupe.name = 'vitrine';
  const montres = [];
  const diametre = FAMILIES.PR42.diametre;
  let detruite = false;
  let mode = null;

  const hauteur = () => 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  // etat : x, y en fractions de demi-écran ; taille = diamètre en part de la hauteur visible ;
  // avance : 0 au rang, 1 sortie vers le visiteur.
  function placer(m) {
    const h = hauteur();
    const w = h * camera.aspect;
    const e = m.etat;
    m.pivot.rotation.set(e.tiltX || 0, e.tiltY || 0, 0);
    // En avançant, la montre monte un peu : son nom, dessous, reste lisible.
    m.pivot.position.set((e.x * w) / 2, ((e.y + e.avance * 0.035) * h) / 2, e.avance * 22);
    m.pivot.scale.setScalar(Math.max(1e-4, (e.taille * (1 + e.avance * 0.12) * h) / diametre));
    m.spin.rotation.set(e.rotX, e.rotY, 0);
    stage.invalidate();
  }

  const creneau = (fn) => (window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout: 900 }) : setTimeout(fn, 60));
  const pret = new Promise((resolve) => {
    let i = 0;
    const suivante = async () => {
      if (detruite) { resolve(); return; }
      const w = buildWatch(defaultConfig('PR42', FINITIONS_FINALE[i]));
      const pivot = new THREE.Group();
      const spin = new THREE.Group();
      pivot.add(spin);
      spin.add(w);
      groupe.add(pivot);
      const m = { finition: FINITIONS_FINALE[i], w, pivot, spin, etat: { x: 0, y: 0, taille: 0.2, rotX: 0.12, rotY: -0.45, avance: 0 } };
      montres.push(m);
      placer(m);
      i += 1;
      if (i < FINITIONS_FINALE.length) { creneau(suivante); return; }
      // Hors de la scène : compilées avec ses lumières et son environnement, sans être rendues.
      await renderer.compileAsync(groupe, camera, scene).catch(() => {});
      const textures = new Set();
      groupe.traverse((o) => {
        [o.material].flat().forEach((mat) => mat && Object.values(mat).forEach((v) => { if (v?.isTexture) textures.add(v); }));
      });
      for (const t of textures) {
        if (detruite) break;
        await new Promise((r) => requestAnimationFrame(r));
        renderer.initTexture(t);
      }
      if (!detruite) {
        groupe.visible = mode !== null;
        scene.add(groupe);
      }
      resolve();
    };
    creneau(suivante);
  });

  return {
    pret, montres, placer,
    // Finale : les quatre montres (leurs places sont écrites par la page).
    finale(on) {
      if (!on && mode !== 'finale') return;
      mode = on ? 'finale' : null;
      montres.forEach((m) => { m.pivot.visible = true; });
      groupe.visible = on;
      stage.invalidate();
    },
    // Solo : la montre i seule, à la pose donnée ; null la retire.
    solo(i, etat) {
      if (i === null) {
        if (mode !== 'solo') return;
        mode = null;
        groupe.visible = false;
        stage.invalidate();
        return;
      }
      mode = 'solo';
      groupe.visible = true;
      montres.forEach((m, j) => {
        m.pivot.visible = j === i;
        if (j === i) { Object.assign(m.etat, { avance: 0 }, etat); placer(m); }
      });
    },
    dispose() {
      detruite = true;
      scene.remove(groupe);
      montres.forEach((m) => m.w.userData.dispose());
      stage.invalidate();
    },
  };
}
