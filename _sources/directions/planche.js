// Planches de direction : la vraie montre 3D dans le premier écran de chaque direction.
import { createStage } from '../../js/stage/renderer.js';
import { buildWatch } from '../../js/watch/build.js';
import { defaultConfig } from '../../js/store/config.js';
import { DIAL_FONT } from '../../js/watch/dial.js';

export async function montrerMontre(canvas, { famille = 'PR42', finition = 'AC', camera, cible = [0, 0, -14], rotation = [0, 0, 0], env = 'clair' } = {}) {
  await Promise.all([document.fonts.load(`700 40px ${DIAL_FONT}`), document.fonts.load(`400 40px ${DIAL_FONT}`)]);
  const stage = createStage(canvas, { env, dprMax: 2 });
  stage.controls.enabled = false;
  const watch = buildWatch(defaultConfig(famille, finition));
  watch.rotation.set(...rotation);
  stage.scene.add(watch);
  stage.camera.position.set(...camera);
  stage.controls.target.set(...cible);
  stage.controls.update();
  stage.start();
  window.__planche = { stage, watch };
  return stage;
}
