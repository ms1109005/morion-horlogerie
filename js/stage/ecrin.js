// Écrin de la confirmation : une boîte hexagonale laquée, intérieur de velours fumé, posée
// autour de la montre du directeur (pose `merci`). Le couvercle, charnière sur l’arête du haut,
// se lève et découvre la montre.
import * as THREE from 'three';

const CAM_Z = 400;

// Hexagone à plat en haut : l’arête supérieure porte la charnière.
function hexagone(r) {
  const s = new THREE.Shape();
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2;
    if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r); else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  s.closePath();
  return s;
}

export function createEcrin(stage, director) {
  const { scene, camera } = stage;
  const groupe = new THREE.Group();
  groupe.name = 'ecrin';
  const jetables = [];
  const garde = (x) => { jetables.push(x); return x; };

  // Laque sourde : un vernis trop net brûlait au blanc sur la paroi intérieure (même panne que
  // le bracelet, D7). Velours fumé : la teinte du sol du site, et un duvet (sheen) pour la matière.
  const laque = garde(new THREE.MeshPhysicalMaterial({ color: '#16110e', roughness: 0.34, metalness: 0.05, clearcoat: 0.35, clearcoatRoughness: 0.25, envMapIntensity: 0.45 }));
  const velours = garde(new THREE.MeshPhysicalMaterial({
    color: '#423b35', roughness: 0.95, metalness: 0, envMapIntensity: 0.1,
    sheen: 1, sheenRoughness: 0.9, sheenColor: new THREE.Color('#6d635b'),
  }));
  const acier = garde(new THREE.MeshStandardMaterial({ color: '#b9bec4', roughness: 0.22, metalness: 1, envMapIntensity: 1 }));

  // Dimensions en unités de la scène, calées sur la hauteur visible (même repère que la montre).
  const h = 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const R = h * (window.innerWidth < 720 ? 0.185 : 0.26);
  const PROF = 56; // profondeur de la boîte : la montre (z = 0) est dedans
  const BORD = 7;

  // Parois : un anneau hexagonal extrudé vers l’arrière.
  const paroiForme = hexagone(R);
  paroiForme.holes.push(hexagone(R - BORD));
  const paroi = new THREE.Mesh(garde(new THREE.ExtrudeGeometry(paroiForme, { depth: PROF, bevelEnabled: true, bevelSize: 1.2, bevelThickness: 1.2, bevelSegments: 2 })), laque);
  paroi.position.z = 22 - PROF;
  // Fond de velours, et un coussin où repose la montre.
  const fond = new THREE.Mesh(garde(new THREE.ShapeGeometry(hexagone(R - BORD))), velours);
  fond.position.z = 22 - PROF + 0.5;
  const coussin = new THREE.Mesh(garde(new THREE.CylinderGeometry(R * 0.36, R * 0.4, 18, 6, 1)), velours);
  coussin.rotation.x = Math.PI / 2;
  coussin.rotation.y = Math.PI / 6;
  coussin.position.z = 22 - PROF + 9;
  // Filet d’acier poli sur le bord avant.
  const filetForme = hexagone(R + 0.6);
  filetForme.holes.push(hexagone(R - 1.4));
  const filet = new THREE.Mesh(garde(new THREE.ExtrudeGeometry(filetForme, { depth: 1.2, bevelEnabled: false })), acier);
  filet.position.z = 22;

  // Couvercle : charnière sur l’arête du haut (y = R·sin 60°), face laquée et filet d’acier.
  const charniere = new THREE.Group();
  charniere.position.set(0, R * Math.sin(Math.PI / 3), 23.5);
  const plaque = new THREE.Mesh(garde(new THREE.ExtrudeGeometry(hexagone(R + 0.8), { depth: 6, bevelEnabled: true, bevelSize: 1.4, bevelThickness: 1.4, bevelSegments: 2 })), laque);
  plaque.position.set(0, -R * Math.sin(Math.PI / 3), 0);
  const filetCouvercle = new THREE.Mesh(garde(new THREE.ExtrudeGeometry((() => { const f = hexagone(R * 0.5); f.holes.push(hexagone(R * 0.5 - 1.6)); return f; })(), { depth: 1, bevelEnabled: false })), acier);
  filetCouvercle.position.set(0, -R * Math.sin(Math.PI / 3), 7.6);
  charniere.add(plaque, filetCouvercle);

  groupe.add(paroi, fond, coussin, filet, charniere);
  scene.add(groupe);

  // Posée là où se tient la montre (pose du directeur), mise à l’échelle avec l’écran.
  function placer() {
    const pose = director.poses.merci;
    const w = h * camera.aspect;
    // Décalée vers l’intérieur : ouvert, le couvercle ne doit sortir ni par la gauche ni par le haut.
    groupe.position.set((pose.x * w) / 2 + R * 0.28, (pose.y * h) / 2 - R * 0.1, 0);
    stage.invalidate();
  }
  placer();
  window.addEventListener('resize', placer);

  const etat = { ouverture: 0 };
  const appliquer = () => { charniere.rotation.x = -etat.ouverture * 1.35; stage.invalidate(); };
  appliquer();
  stage.renderer.compileAsync(scene, camera).catch(() => {});

  return {
    ouvrir({ immediat = false } = {}) {
      if (immediat) { etat.ouverture = 1; appliquer(); return Promise.resolve(); }
      const tenir = stage.hold();
      return new Promise((resolve) => {
        window.gsap.to(etat, {
          ouverture: 1, duration: 1.6, ease: 'power3.inOut', onUpdate: appliquer,
          onComplete: () => { tenir(); resolve(); },
          onInterrupt: () => { tenir(); resolve(); },
        });
      });
    },
    dispose() {
      window.removeEventListener('resize', placer);
      window.gsap.killTweensOf(etat);
      scene.remove(groupe);
      jetables.forEach((x) => x.dispose());
      stage.invalidate();
    },
  };
}
