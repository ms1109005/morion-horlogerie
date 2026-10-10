// Scène unique du site : renderer, environnement studio, caméra, boucle.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const VIEWS = {
  'trois-quarts': [84, 34, 140],
  face: [0, 0, 170],
  profil: [175, 6, -18],
  dos: [0, 10, -175],
};
const TARGET = new THREE.Vector3(0, 0, -14);

// Environnement de photo produit : studio gris clair, boîtes à lumière émissives et
// drapeaux noirs, rendus en PMREM. Les bandes claires et sombres alternées sont ce qui
// fait lire un métal poli comme du métal (et l’or comme de l’or).
export const ENV_PRESETS = {
  clair: { room: 0.5, floor: 0.13, top: 5, left: 7, right: 5, back: 4, front: 2.2, flags: 0.05, rim: 2.6 },
  nuit: { room: 0.015, floor: 0.01, top: 6, left: 10, right: 6, back: 5, front: 0.8, flags: 0, rim: 3 },
  // Écrin : la pièce est sombre et les boîtes à lumière ont des bords doux. Un métal ne se lit
  // comme du métal que s'il reflète du clair ET du sombre ; dans une pièce grise, il vire à l'aluminium.
  ecrin: { room: 0.16, floor: 0.04, top: 6.5, left: 8.5, right: 5.5, back: 4.5, front: 4.2, flags: 0.02, rim: 3.2, doux: true },
};

// Dégradé d'une boîte à lumière : plein au centre, fondu vers les bords (aucun reflet à arête vive).
function softbox() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const d = g.createRadialGradient(64, 64, 8, 64, 64, 64);
  d.addColorStop(0, '#fff'); d.addColorStop(0.55, '#d0d0d0'); d.addColorStop(1, '#000');
  g.fillStyle = d; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function buildStudioEnv(renderer, preset = 'clair') {
  const p = ENV_PRESETS[preset];
  const env = new THREE.Scene();
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(400, 400, 400),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(p.room, p.room, p.room * 1.02), side: THREE.BackSide }),
  );
  env.add(room);

  const doux = p.doux ? softbox() : null;
  const panel = (w, h, intensity, pos, look, tint = [1, 1, 1]) => {
    // Bords doux : la boîte s'ajoute à la pièce et s'y fond, agrandie pour garder la même surface utile.
    const k = doux && intensity > 0.5 ? 1.35 : 1;
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w * k, h * k),
      new THREE.MeshBasicMaterial(k > 1
        ? { color: new THREE.Color(tint[0] * intensity, tint[1] * intensity, tint[2] * intensity), map: doux, side: THREE.DoubleSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }
        : { color: new THREE.Color(tint[0] * intensity, tint[1] * intensity, tint[2] * intensity), side: THREE.DoubleSide }),
    );
    m.position.set(...pos);
    m.lookAt(...look);
    env.add(m);
  };
  // Grande boîte au-dessus, légèrement vers l’avant.
  panel(220, 110, p.top, [0, 170, 40], [0, 0, 0]);
  // Bandes verticales latérales : les filets de lumière sur la carrure et la lunette.
  panel(26, 260, p.left, [-170, 20, 30], [0, 0, 0]);
  panel(18, 260, p.right, [175, 10, -20], [0, 0, 0], [1, 0.97, 0.93]);
  // Bande arrière haute, pour la découpe des arêtes.
  panel(260, 20, p.back, [0, 80, -180], [0, 0, 0]);
  // Réflecteur doux face à la montre (glace et cadran).
  panel(140, 70, p.front, [-40, 40, 190], [0, 0, 0]);
  // Drapeaux sombres de part et d’autre de l’axe de vue : lignes plus foncées sur le poli.
  panel(34, 320, p.flags, [-110, 0, 150], [0, 0, 0]);
  panel(34, 320, p.flags, [120, 0, 140], [0, 0, 0]);
  // Contre-jour large derrière la montre : un liseré clair détache toujours la silhouette.
  panel(320, 90, p.rim, [0, 10, -200], [0, 0, 0]);
  // Même dispositif côté fond : le mouvement et le dos restent lisibles en rotation.
  panel(140, 70, p.front * 1.4, [40, 50, -190], [0, 0, 0]);
  panel(50, 320, p.flags, [115, 0, -150], [0, 0, 0]);
  panel(50, 320, p.flags, [-120, 0, -140], [0, 0, 0]);
  // Sol sombre : l’horizon clair/sombre classique du métal chromé.
  panel(400, 400, p.floor, [0, -190, 0], [0, 0, 0]);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.045, 0.5, 1000, { size: 512 }).texture;
  pmrem.dispose();
  env.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
  doux?.dispose();
  return tex;
}

// Options : `controls` (OrbitControls, studio) ; `loop` : 'continu' (studio, setAnimationLoop) ou
// 'demande' (site : frame(dt) appelé par gsap.ticker, rendu seulement si invalidé ou tenu) ;
// `dpr` : densité voulue (le site la calcule), sinon min(devicePixelRatio, dprMax) ;
// `post` : finition de l’image (creux et arêtes, voir post.js), chargée à part, ordinateur seulement.
export function createStage(canvas, {
  dprMax = 2, dpr, env = 'clair', controls: withControls = true, loop = 'continu', exposure = 1.0, envIntensity = 1,
  keyLight = 1.4, post: withPost = false,
} = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // Neutral (Khronos PBR Neutral) : conçu pour des couleurs de produit fidèles, l’or reste or.
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = exposure;
  let pixelRatio = dpr ?? Math.min(window.devicePixelRatio || 1, dprMax);
  renderer.setPixelRatio(pixelRatio);

  const scene = new THREE.Scene();
  const envTexture = buildStudioEnv(renderer, env);
  scene.environment = envTexture;
  // Sur le fond fumé du site, un studio un peu moins intense : l’acier poli ne brûle pas au blanc.
  scene.environmentIntensity = envIntensity;

  const key = new THREE.DirectionalLight(0xffffff, keyLight);
  key.position.set(40, 90, 70);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xfff1e0, 0.8);
  rim.position.set(-80, 20, -60);
  scene.add(rim);

  const camera = new THREE.PerspectiveCamera(28, 1, 1, 3000);
  camera.position.set(...VIEWS['trois-quarts']);
  const controls = withControls ? new OrbitControls(camera, canvas) : null;
  if (controls) {
    controls.target.copy(TARGET);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 40;
    controls.maxDistance = 420;
    controls.update();
  } else {
    camera.lookAt(TARGET);
  }

  const frameFns = new Set();
  const afterFns = new Set();   // après chaque rendu (projection d’ancres vers le DOM)
  const timer = new THREE.Timer();
  // Rendu à la demande : `dirty` (une image demandée) ou `holds` (animation en cours).
  let dirty = 1;
  let holds = 0;
  const stats = { renders: 0, frames: 0 };
  const invalidate = () => { dirty = 1; };
  const hold = () => {
    holds += 1;
    let released = false;
    return () => { if (!released) { released = true; holds -= 1; dirty = 1; } };
  };

  let post = null;
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    post?.setSize(w, h, pixelRatio);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    dirty = 1;
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  function render() {
    if (post) post.render(); else renderer.render(scene, camera);
    stats.renders += 1;
  }
  // La finition arrive après la première image : si elle échoue, le rendu simple reste.
  if (withPost) {
    import('./post.js').then(({ createPost }) => { post = createPost(renderer, scene, camera); resize(); }).catch(() => {});
  }

  // Une image : fonctions d’image toujours (elles décident d’invalider), rendu si nécessaire.
  function tick(dt) {
    stats.frames += 1;
    frameFns.forEach((fn) => fn(dt));
    controls?.update();
    if (loop === 'continu' || dirty || holds > 0) {
      dirty = 0;
      render();
      afterFns.forEach((fn) => fn());
      return true;
    }
    return false;
  }

  function frame(ts) {
    timer.update(ts);
    tick(Math.min(timer.getDelta(), 0.05));
  }

  function setPixelRatio(r) {
    pixelRatio = r;
    renderer.setPixelRatio(r);
    resize();
  }

  function setView(name, { duration = 0 } = {}) {
    const to = VIEWS[name];
    if (!to) return;
    if (!duration) {
      camera.position.set(...to);
      if (controls) { controls.target.copy(TARGET); controls.update(); } else camera.lookAt(TARGET);
      dirty = 1;
      return;
    }
    const from = camera.position.clone();
    const end = new THREE.Vector3(...to);
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min((now - t0) / duration, 1);
      const e = 1 - Math.pow(1 - k, 4);
      camera.position.lerpVectors(from, end, e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Rendu haute définition sur fond transparent (références pour Gemini).
  function exportPNG(size = 2048, height = size) {
    const prev = new THREE.Vector2();
    renderer.getSize(prev);
    const prevRatio = renderer.getPixelRatio();
    const prevAspect = camera.aspect;
    renderer.setPixelRatio(1);
    renderer.setSize(size, height, false);
    camera.aspect = size / height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        renderer.setPixelRatio(prevRatio);
        renderer.setSize(prev.x, prev.y, false);
        camera.aspect = prevAspect;
        camera.updateProjectionMatrix();
        render();
        resolve(blob);
      }, 'image/png');
    });
  }

  return {
    renderer, scene, camera, controls, envTexture, stats,
    render, resize, setView, exportPNG, invalidate, hold, tick, setPixelRatio,
    get pixelRatio() { return pixelRatio; },
    onFrame: (fn) => { frameFns.add(fn); return () => frameFns.delete(fn); },
    afterRender: (fn) => { afterFns.add(fn); return () => afterFns.delete(fn); },
    start: () => { if (loop === 'continu') { timer.reset?.(); renderer.setAnimationLoop(frame); } },
    stop: () => renderer.setAnimationLoop(null),
  };
}
