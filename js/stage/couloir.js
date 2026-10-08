// Seuil des salles (accueil) : un couloir d’arches hexagonales en acier, celles de la salle du
// Prisme. Le visiteur avance au défilement ; les arches les plus proches s’effacent avant de
// passer la caméra, les plus lointaines sortent de la brume.
import * as THREE from 'three';

const CAM_Z = 400;
const N = 10;
const PAS = 190;

function hexagone(r) {
  const s = new THREE.Shape();
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r); else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  s.closePath();
  return s;
}

const pas = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function createCouloir(stage) {
  const { scene, camera } = stage;
  const groupe = new THREE.Group();
  groupe.name = 'couloir';

  // Rayon : l’arche la plus proche dépasse juste le cadre de l’écran.
  const h = 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const r = h * 0.62;
  const forme = hexagone(r);
  forme.holes.push(hexagone(r - 4.5));
  const geo = new THREE.ExtrudeGeometry(forme, { depth: 3, bevelEnabled: false });
  const arches = [];
  for (let i = 0; i < N; i += 1) {
    const mat = new THREE.MeshStandardMaterial({ color: '#7a8088', roughness: 0.34, metalness: 0.9, envMapIntensity: 0.5, transparent: true });
    const m = new THREE.Mesh(geo, mat);
    m.rotation.z = i * 0.06;
    groupe.add(m);
    arches.push(m);
  }

  // Compilé hors de la scène (aucun à-coup à la première arche), puis ajouté, caché.
  stage.renderer.compileAsync(groupe, camera, scene).catch(() => {}).then(() => {
    if (!groupe.userData.retire) { groupe.visible = groupe.userData.voulu ?? false; scene.add(groupe); }
  });

  // p : 0 à l’entrée du couloir, 1 au bout ; entree : 0 → 1 pendant que la section arrive.
  function avancer(p, entree = 1) {
    const offset = p * (N - 3) * PAS;
    arches.forEach((m, i) => {
      const z = -i * PAS - 120 + offset;
      const d = CAM_Z - z;
      m.position.z = z;
      const o = pas(80, 260, d) * (1 - pas(1300, 2000, d)) * entree;
      m.material.opacity = o;
      m.visible = o > 0.005;
    });
    groupe.visible = entree > 0.001;
    groupe.userData.voulu = groupe.visible;
    stage.invalidate();
  }

  return {
    avancer,
    afficher(on) { groupe.visible = on; groupe.userData.voulu = on; stage.invalidate(); },
    dispose() {
      groupe.userData.retire = true;
      scene.remove(groupe);
      geo.dispose();
      arches.forEach((m) => m.material.dispose());
      stage.invalidate();
    },
  };
}
