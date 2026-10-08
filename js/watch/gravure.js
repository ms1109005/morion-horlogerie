// Gravure du client sur la glace saphir du fond : texte givré, sous la fenêtre du mouvement.
// Le plan est un enfant de la glace (il suit l’éclaté) ; voir build.js.
import * as THREE from 'three';

const W = 1024;
const H = 176;

function texture(text) {
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  let size = H * 0.5;
  const font = (s) => `500 ${s}px "Albert Sans", system-ui, sans-serif`;
  ctx.font = font(size);
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${Math.round(size * 0.12)}px`;
  // Le texte tient toujours sur la largeur (24 caractères au plus).
  while (ctx.measureText(text).width > W * 0.94 && size > 20) { size -= 2; ctx.font = font(size); }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Saphir gravé : blanc givré, halo très léger.
  ctx.shadowColor = 'rgba(255, 255, 255, 0.35)';
  ctx.shadowBlur = 3;
  ctx.fillStyle = 'rgba(236, 240, 244, 0.9)';
  ctx.fillText(text, W / 2, H / 2);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// Plan à poser comme enfant de la glace `caseback-crystal` (cylindre tourné de 90° sur X) :
// face extérieure du fond, tiers bas de la fenêtre, lisible depuis le dos de la montre.
export function engravingMesh(text, { largeur = 17, y = -6.6 } = {}) {
  const mat = new THREE.MeshBasicMaterial({
    map: texture(text), transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(largeur, (largeur * H) / W), mat);
  mesh.name = 'engraving';
  mesh.rotation.x = Math.PI / 2;
  mesh.scale.set(-1, -1, 1);
  mesh.position.set(0, -0.37, -y);
  mesh.renderOrder = 3;
  return mesh;
}

export function disposeEngraving(mesh) {
  if (!mesh) return;
  mesh.parent?.remove(mesh);
  mesh.geometry.dispose();
  mesh.material.map?.dispose();
  mesh.material.dispose();
}
