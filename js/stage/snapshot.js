// Instantané de la montre en cours de composition (vignette du panier, vol vers le guichet).
// La montre est posée de face au centre, rendue, recadrée dans un canvas 2D, puis la pose
// d’origine est rendue à nouveau dans la même tâche : le navigateur n’affiche jamais l’instantané.
import { FAMILIES } from '../data/catalogue.js';

export function snapshot(stage, director, { size = 320, quality = 0.86 } = {}) {
  const { renderer, camera } = stage;
  const { pivot, spin, tilt, watch } = director;
  const saved = {
    pos: pivot.position.clone(), scale: pivot.scale.clone(),
    rot: spin.rotation.clone(), tilt: tilt.rotation.clone(),
  };
  const canvas = renderer.domElement;
  const h = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
  // Tête de montre sur 44 % de la hauteur visible, au centre, légèrement de trois-quarts.
  const diametre = FAMILIES[watch.userData.config.family].diametre;
  const eclate = director.state.eclate || 0;
  pivot.position.set(0, 0, 0);
  pivot.scale.setScalar((0.44 * h) / diametre);
  spin.rotation.set(0.1, -0.32, 0);
  tilt.rotation.set(0, 0, 0);
  if (eclate) watch.userData.setExplode(0);
  pivot.visible = true;
  renderer.render(stage.scene, camera);

  const side = Math.min(canvas.width, canvas.height) * 0.78;
  const out = document.createElement('canvas');
  out.width = out.height = size;
  out.getContext('2d').drawImage(canvas, (canvas.width - side) / 2, (canvas.height - side) / 2, side, side, 0, 0, size, size);
  const url = out.toDataURL('image/webp', quality);

  pivot.position.copy(saved.pos);
  pivot.scale.copy(saved.scale);
  spin.rotation.copy(saved.rot);
  tilt.rotation.copy(saved.tilt);
  if (eclate) watch.userData.setExplode(eclate);
  director.apply();
  renderer.render(stage.scene, camera);
  return url;
}
