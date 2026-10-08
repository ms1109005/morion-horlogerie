// Monde des salles de la collection (Cartier) : un hall en quartz fumé puis une salle par
// famille, dont le décor reprend la silhouette de la montre. La caméra voyage d’un arrêt à
// l’autre le long d’une courbe ; poussière en suspension ; brouillard teinté par salle.
// La page prend la caméra et la rend intacte au démontage.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { buildWatch } from '../watch/build.js';
import { defaultConfig } from '../store/config.js';
import { DUR } from '../core/motion.js';

// Arrêts : centre de la salle, point de vue, teinte du brouillard et de la lumière.
export const ARRETS = [
  { id: 'hall', centre: [0, 0, 0], vue: [0, 70, 520], cible: [0, 40, 0], brume: '#1b1714', lumiere: '#d8b89c' },
  { id: 'PR42', centre: [0, 0, -1500], vue: [30, 38, -1230], cible: [0, 28, -1500], brume: '#15171b', lumiere: '#c9d4e6' },
  { id: 'MO39', centre: [1100, 0, -2800], vue: [1080, 40, -2530], cible: [1100, 28, -2800], brume: '#1c1712', lumiere: '#f0c98f' },
  { id: 'AB41', centre: [-500, 0, -4200], vue: [-470, 36, -3930], cible: [-500, 28, -4200], brume: '#0b1420', lumiere: '#6fa6ff' },
];

const v = (a) => new THREE.Vector3(...a);
// Écran étroit : la caméra recule et vise plus bas, la montre remonte au-dessus du texte.
const etroit = () => window.innerWidth < 720;
const vueDe = (a) => {
  if (!etroit()) return v(a.vue);
  const c = v(a.centre);
  return c.clone().add(v(a.vue).sub(c).multiplyScalar(1.85)).add(new THREE.Vector3(0, -30, 0));
};
const cibleDe = (a) => v(a.cible).add(new THREE.Vector3(0, etroit() ? -70 : 0, 0));

function hexagone(r) {
  const s = new THREE.Shape();
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const p = [Math.cos(a) * r, Math.sin(a) * r];
    if (i === 0) s.moveTo(...p); else s.lineTo(...p);
  }
  s.closePath();
  return s;
}

function anneauCrante(r, largeur, crans, prof = 2.5) {
  const s = new THREE.Shape();
  const n = crans * 2;
  for (let i = 0; i <= n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    const rr = i % 2 ? r : r - prof;
    const p = [Math.cos(a) * rr, Math.sin(a) * rr];
    if (i === 0) s.moveTo(...p); else s.lineTo(...p);
  }
  // Trou tracé point par point : un arc serait échantillonné par curveSegments (1 ici) et
  // dégénérerait en segment, l’anneau devenant un disque plein.
  const trou = new THREE.Path();
  const ri = r - largeur;
  for (let i = 0; i <= 96; i += 1) {
    const a = -(i / 96) * Math.PI * 2;
    if (i === 0) trou.moveTo(Math.cos(a) * ri, Math.sin(a) * ri); else trou.lineTo(Math.cos(a) * ri, Math.sin(a) * ri);
  }
  s.holes.push(trou);
  return s;
}

function textureParticule() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const d = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  d.addColorStop(0, 'rgba(255,255,255,1)');
  d.addColorStop(0.4, 'rgba(255,255,255,0.35)');
  d.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = d;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Caustiques d’eau (salle Abysse) : motif animé, additif, projeté sur le sol.
function materiauCaustiques() {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { t: { value: 0 }, force: { value: 0 }, teinte: { value: new THREE.Color('#3f7bd6') } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `
      varying vec2 vUv; uniform float t; uniform float force; uniform vec3 teinte;
      float c(vec2 p){ vec2 i = p; float s = 0.0;
        for (int k = 0; k < 4; k++) { float f = float(k) + 1.0;
          i = p + vec2(cos(t * 0.35 / f + i.y * f), sin(t * 0.3 / f + i.x * f));
          s += 1.0 / length(vec2(p.x / (sin(i.x + t * 0.2) / 0.05), p.y / (cos(i.y + t * 0.2) / 0.05))); }
        return s / 4.0; }
      void main(){ vec2 p = vUv * 9.0; float v = pow(clamp(1.2 - c(p), 0.0, 1.0), 6.0);
        float bord = smoothstep(0.5, 0.15, distance(vUv, vec2(0.5)));
        gl_FragColor = vec4(teinte * v * 1.4 * bord * force, 1.0); }`,
  });
}

export function createSalles(stage, { reduced = false } = {}) {
  const { scene, camera } = stage;
  const sauve = { pos: camera.position.clone(), quat: camera.quaternion.clone(), fov: camera.fov, near: camera.near, far: camera.far };
  const monde = new THREE.Group();
  monde.name = 'salles';
  scene.add(monde);
  const jetables = [];
  const garde = (x) => { jetables.push(x); return x; };

  camera.fov = 36;
  camera.near = 2;
  camera.far = 9000;
  camera.updateProjectionMatrix();
  scene.fog = new THREE.Fog(new THREE.Color(ARRETS[0].brume), 380, 2400);
  // Le ciel prend la couleur du brouillard : les salles sont un lieu fermé, pas le cadran fumé.
  const fondAvant = scene.background;
  scene.background = scene.fog.color;

  // Lumières propres au monde (retirées au démontage).
  const ciel = new THREE.HemisphereLight('#8a7b6e', '#0a0908', 0.55);
  const lampe = new THREE.PointLight(ARRETS[0].lumiere, 2.2, 1400, 1.2);
  monde.add(ciel, lampe);

  // Sol laqué commun.
  const sol = new THREE.Mesh(
    garde(new THREE.PlaneGeometry(9000, 9000)),
    garde(new THREE.MeshStandardMaterial({ color: '#0f0d0c', roughness: 0.42, metalness: 0.2, envMapIntensity: 0.06 })),
  );
  sol.rotation.x = -Math.PI / 2;
  sol.position.y = -310;
  monde.add(sol);

  const quartz = garde(new THREE.MeshPhysicalMaterial({ color: '#3a2d25', roughness: 0.14, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.08, flatShading: true, envMapIntensity: 0.55 }));
  const acier = garde(new THREE.MeshStandardMaterial({ color: '#737880', roughness: 0.36, metalness: 0.9, envMapIntensity: 0.34 }));
  // Pierre polie : la teinte monte du pied (sombre) vers la tête (couleurs de sommets).
  const pierre = garde(new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.3, metalness: 0.05, clearcoat: 0.5, clearcoatRoughness: 0.18, envMapIntensity: 0.45 }));
  // Céramique bleue des lunettes : laquée, elle prend la lumière d’eau sur ses crans.
  const abysse = garde(new THREE.MeshPhysicalMaterial({ color: '#1f3566', roughness: 0.18, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.1 }));

  // Socle hexagonal : la montre y est présentée, légèrement inclinée vers le visiteur.
  const socleGeo = garde(new THREE.CylinderGeometry(58, 64, 300, 6));
  const socleMat = garde(new THREE.MeshStandardMaterial({ color: '#221c19', roughness: 0.38, metalness: 0.1, envMapIntensity: 0.12, flatShading: true }));
  // Plateau : vu en incidence rasante, un matériau lisse y renverrait tout le studio (Fresnel).
  const plateauMat = garde(new THREE.MeshStandardMaterial({ color: '#0d0b0a', roughness: 0.92, metalness: 0, envMapIntensity: 0 }));
  function socle(centre) {
    const m = new THREE.Mesh(socleGeo, [socleMat, plateauMat, socleMat]);
    m.position.set(centre[0], -160, centre[2]);
    monde.add(m);
  }

  // --- Hall : cristaux de quartz fumé ---
  const cristaux = new THREE.Group();
  const cGeo = garde(new THREE.CylinderGeometry(1, 1, 1, 6));
  const pGeo = garde(new THREE.ConeGeometry(1, 1, 6));
  // Une grappe de cristaux derrière le point focal, jamais entre le visiteur et le fond.
  [[0, 300, -560, 46, 0], [-95, 210, -520, 32, 0.22], [90, 240, -600, 36, -0.18], [-250, 170, -680, 28, 0.1], [240, 190, -720, 30, -0.12], [40, 140, -470, 22, 0.34]]
    .forEach(([x, h, z, r, tilt]) => {
      const g = new THREE.Group();
      const corps = new THREE.Mesh(cGeo, quartz);
      corps.scale.set(r, h, r);
      corps.position.y = h / 2;
      const pointe = new THREE.Mesh(pGeo, quartz);
      pointe.scale.set(r, r * 1.6, r);
      pointe.position.y = h + r * 0.8;
      g.add(corps, pointe);
      g.position.set(x, -310, z);
      g.rotation.z = tilt;
      cristaux.add(g);
    });
  monde.add(cristaux);

  // --- Prisme : arches hexagonales emboîtées, en léger vrillage ---
  // Écran étroit : la caméra recule et le cadre est vertical ; les décors se resserrent
  // autour de la montre au lieu de sortir du champ.
  const serre = etroit();
  const [rArche, eArche] = serre ? [170, 11] : [360, 24];
  const archeGeo = garde(new THREE.ExtrudeGeometry((() => { const s = hexagone(rArche); s.holes.push(hexagone(rArche - eArche)); return s; })(), { depth: 14, bevelEnabled: false }));
  for (let i = 0; i < 9; i += 1) {
    const a = new THREE.Mesh(archeGeo, acier);
    a.position.set(0, serre ? 0 : 20, -1500 + 240 - i * 120);
    a.rotation.z = i * 0.07;
    monde.add(a);
  }

  // --- Monolithe : monolithes taillés, arêtes adoucies ---
  const pied = new THREE.Color('#1c1612');
  const tete = new THREE.Color('#5a4a3d');
  [[-300, 360, 96], [-140, 480, 118], [150, 420, 110], [310, 320, 90], [0, 560, 128]].forEach(([x, h, w], i) => {
    const g = garde(new RoundedBoxGeometry(w, h, 56, 2, 6));
    const pos = g.attributes.position;
    const teintes = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let k = 0; k < pos.count; k += 1) {
      c.copy(pied).lerp(tete, THREE.MathUtils.smoothstep(pos.getY(k) / h + 0.5, 0, 1));
      c.toArray(teintes, k * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(teintes, 3));
    const m = new THREE.Mesh(g, pierre);
    m.position.set(1100 + x, -310 + h / 2, -2800 - 460 - (i % 2) * 110);
    m.rotation.y = x * -0.0006;
    monde.add(m);
  });

  // --- Abysse : anneaux crantés et lumière d’eau ---
  const anneaux = [];
  // Trois lunettes crantées (120, 90, 60 crans) centrées sur l’axe caméra → montre : elles
  // l’encadrent sans toucher le mot-symbole, la nav ni le texte (rayons calculés pour 1440 et 390).
  [
    { r: [81, 63], l: [9, 7], crans: 120, y: [19, 22], x: -520 },
    { r: [111, 82], l: [8, 6], crans: 90, y: [15, 20], x: -532 },
    { r: [145, 104], l: [7, 6], crans: 60, y: [11, 17.5], x: -544 },
  ].forEach((a, i) => {
    const j = serre ? 1 : 0;
    const geo = new THREE.ExtrudeGeometry(anneauCrante(a.r[j], a.l[j], a.crans), {
      depth: 6, bevelEnabled: true, bevelSize: 1.2, bevelThickness: 1.6, bevelSegments: 2, curveSegments: 1,
    });
    const m = new THREE.Mesh(garde(geo), abysse);
    m.position.set(a.x, a.y[j], -4200 - 180 - i * 110);
    m.rotation.set((i - 1) * 0.06, (1 - i) * 0.08, 0);
    monde.add(m);
    anneaux.push(m);
  });
  const caustiques = garde(materiauCaustiques());
  // Lumière d’eau sur le mur du fond, derrière les anneaux : visible depuis le point de vue.
  const eau = new THREE.Mesh(garde(new THREE.PlaneGeometry(2200, 1400)), caustiques);
  eau.position.set(-500, 120, -4200 - 760);
  monde.add(eau);

  ARRETS.slice(1).forEach((a) => socle(a.centre));

  // --- Poussière en suspension ---
  const N = reduced ? 0 : 1400;
  const pts = new Float32Array(N * 3);
  for (let i = 0; i < N; i += 1) {
    pts[i * 3] = -900 + Math.random() * 2700;
    pts[i * 3 + 1] = -300 + Math.random() * 900;
    pts[i * 3 + 2] = 500 - Math.random() * 5200;
  }
  const pGeom = garde(new THREE.BufferGeometry());
  pGeom.setAttribute('position', new THREE.BufferAttribute(pts, 3));
  const tex = garde(textureParticule());
  const poussiere = new THREE.Points(pGeom, garde(new THREE.PointsMaterial({
    size: 5, map: tex, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending, color: '#d9c7b3',
  })));
  monde.add(poussiere);

  // --- Montres sur socles (construites une par image, après le rideau) ---
  const montres = {};
  const pret = (async () => {
    for (const a of ARRETS.slice(1)) {
      await new Promise((r) => requestAnimationFrame(r));
      const w = buildWatch(defaultConfig(a.id, 'AC'));
      const pivot = new THREE.Group();
      pivot.position.set(a.centre[0], 26, a.centre[2]);
      pivot.rotation.x = -0.22;
      w.userData.setExplode(0);
      pivot.add(w);
      monde.add(pivot);
      montres[a.id] = { w, pivot };
      stage.invalidate();
    }
    // Shaders de toutes les salles compilés d’avance (compile ignore le cadrage) : sans cela,
    // la première arrivée dans une salle fige l’image le temps de compiler ses matières.
    eau.visible = true;
    await stage.renderer.compileAsync(scene, camera).catch(() => {});
    eau.visible = caustiques.uniforms.force.value > 0.001;
    // Idem pour les textures (cadrans dessinés) : envoyées au GPU une par image, pas au premier affichage.
    const textures = new Set();
    monde.traverse((o) => {
      [o.material].flat().forEach((m) => m && Object.values(m).forEach((v) => { if (v?.isTexture) textures.add(v); }));
    });
    for (const t of textures) {
      await new Promise((r) => requestAnimationFrame(r));
      stage.renderer.initTexture(t);
    }
    stage.invalidate();
  })();

  // --- Caméra et voyage ---
  let index = 0;
  const cible = cibleDe(ARRETS[0]);
  camera.position.copy(vueDe(ARRETS[0]));
  camera.lookAt(cible);
  const brume = new THREE.Color();
  let voyage = null;

  function placerLumiere(t, a, b) {
    lampe.color.copy(new THREE.Color(a.lumiere)).lerp(new THREE.Color(b.lumiere), t);
    brume.copy(new THREE.Color(a.brume)).lerp(new THREE.Color(b.brume), t);
    scene.fog.color.copy(brume);
    lampe.position.set(...camera.position.toArray()).add(new THREE.Vector3(0, 220, -120));
    // La lumière d’eau n’existe que dans l’Abysse (le shader ignore le brouillard).
    const f = 1 - THREE.MathUtils.smoothstep(camera.position.distanceTo(vueDe(ARRETS[3])), 300, 1100);
    caustiques.uniforms.force.value = f;
    eau.visible = f > 0.001;
  }

  function goTo(i, { immediate = false } = {}) {
    i = Math.max(0, Math.min(ARRETS.length - 1, i));
    if (i === index && !immediate) return Promise.resolve();
    const a = ARRETS[index];
    const b = ARRETS[i];
    index = i;
    voyage?.kill();
    if (immediate || reduced) {
      camera.position.copy(vueDe(b));
      cible.copy(cibleDe(b));
      camera.lookAt(cible);
      placerLumiere(1, a, b);
      stage.invalidate();
      return Promise.resolve();
    }
    // Chemin : départ, un point relevé à mi-parcours, arrivée (segments égaux, façon Cartier).
    const p0 = camera.position.clone();
    const p2 = vueDe(b);
    const milieu = p0.clone().lerp(p2, 0.5).add(new THREE.Vector3(0, 120, 0));
    const courbe = new THREE.CatmullRomCurve3([p0, milieu, p2]);
    const c0 = cible.clone();
    const c2 = cibleDe(b);
    const etat = { t: 0 };
    const tenir = stage.hold();
    return new Promise((resolve) => {
      voyage = window.gsap.to(etat, {
        t: 1, duration: DUR.voyage * 1.3, ease: 'power3.inOut',
        onUpdate: () => {
          camera.position.copy(courbe.getPointAt(etat.t));
          cible.lerpVectors(c0, c2, etat.t);
          camera.lookAt(cible);
          placerLumiere(etat.t, a, b);
        },
        onComplete: () => { tenir(); resolve(); },
        onInterrupt: () => { tenir(); resolve(); },
      });
    });
  }

  // --- Vie des salles : rotation lente, poussière, eau ; figée après 8 s sans interaction ---
  let vivant = !reduced;
  let tenue = vivant ? stage.hold() : null;
  let dernier = performance.now();
  let temps = 0;
  const reveiller = () => {
    dernier = performance.now();
    if (!vivant && !reduced) { vivant = true; tenue = stage.hold(); }
  };
  const offFrame = stage.onFrame((dt) => {
    if (!vivant) return;
    temps += dt;
    // La montre oscille face au visiteur, sans jamais lui tourner le dos.
    Object.values(montres).forEach(({ pivot }, i) => { pivot.rotation.y = Math.sin(temps * 0.32 + i) * 0.75; });
    poussiere.rotation.y += dt * 0.004;
    poussiere.position.y = Math.sin(temps * 0.2) * 12;
    anneaux.forEach((r, i) => { r.rotation.z += dt * (i % 2 ? -0.03 : 0.02); });
    caustiques.uniforms.t.value = temps;
    if (performance.now() - dernier > 8000) { vivant = false; tenue?.(); tenue = null; }
  });
  placerLumiere(1, ARRETS[0], ARRETS[0]);
  stage.invalidate();

  return {
    ARRETS, pret, goTo, reveiller,
    get index() { return index; },
    montre: (id) => montres[id]?.w,
    dispose() {
      voyage?.kill();
      tenue?.();
      offFrame();
      Object.values(montres).forEach(({ w }) => w.userData.dispose());
      scene.remove(monde);
      jetables.forEach((x) => x.dispose?.());
      scene.fog = null;
      scene.background = fondAvant;
      camera.fov = sauve.fov;
      camera.near = sauve.near;
      camera.far = sauve.far;
      camera.position.copy(sauve.pos);
      camera.quaternion.copy(sauve.quat);
      camera.updateProjectionMatrix();
      stage.invalidate();
    },
  };
}
