// Finition de l’image, sur ordinateur seulement : ombres fines dans les creux (occlusion
// ambiante) et léger débordement de lumière sur les arêtes polies. Le fond reste transparent :
// la montre se pose toujours sur le fumé de la page.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export function createPost(renderer, scene, camera) {
  const taille = renderer.getDrawingBufferSize(new THREE.Vector2());
  const cible = new THREE.WebGLRenderTarget(taille.x, taille.y, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, cible);

  const rendu = new RenderPass(scene, camera);
  rendu.clearAlpha = 0;
  composer.addPass(rendu);

  // Les creux : entre les maillons, autour de la couronne, sous la lunette.
  const creux = new GTAOPass(scene, camera, taille.x, taille.y);
  creux.blendIntensity = 0.85;
  creux.updateGtaoMaterial({ radius: 2.2, distanceExponent: 1.4, thickness: 1.2, scale: 1.1, samples: 12, screenSpaceRadius: false });
  creux.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
  composer.addPass(creux);

  // Les arêtes : seuls les reflets au-dessus du blanc débordent, d’un halo court.
  const halo = new UnrealBloomPass(new THREE.Vector2(taille.x, taille.y), 0.07, 0.3, 3.2);
  composer.addPass(halo);

  composer.addPass(new OutputPass());

  return {
    render: () => composer.render(),
    setSize(w, h, ratio) { composer.setPixelRatio(ratio); composer.setSize(w, h); },
  };
}
