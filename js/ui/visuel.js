// Visuel : l’image (ou la vidéo) si le fichier a été déposé, sinon un placeholder designé qui
// réserve exactement la même place. La liste des fichiers présents est générée par
// outils/visuels.py : aucun fichier absent n’est jamais demandé.
import { VISUELS } from '../data/visuels.js';
import { PRESENTS, MOBILES } from '../data/visuels-presents.js';
import { html } from './html.js';

export const estPresent = (id) => Boolean(PRESENTS[id]);

export function visuel(id, { classe = '', alt, eager = false } = {}) {
  const v = VISUELS[id];
  if (!v) throw new Error(`Visuel inconnu : ${id}`);
  const style = `--ratio: ${v.ratio}`;
  const src = PRESENTS[id];
  if (src && v.video) {
    // Mouvement réduit : la vidéo reste sur sa première image (#t=0.1 force son affichage sans
    // lecture) ; aucun mouvement automatique dans ce mode.
    const fixe = document.documentElement.classList.contains('reduit');
    const t = fixe ? '#t=0.1' : '';
    // Écran étroit : la version 720p de video/mobile/ si elle existe.
    const sources = html`${MOBILES[id] ? html`<source src="${MOBILES[id]}${t}" type="video/mp4" media="(max-width: 719px)">` : ''}<source src="${src}${t}" type="video/mp4">`;
    return fixe
      ? html`<div class="visuel ${classe}" style="${style}"><video muted playsinline preload="metadata" aria-label="${alt ?? v.legende}">${sources}</video></div>`
      : html`<div class="visuel ${classe}" style="${style}"><video muted loop playsinline autoplay preload="metadata" aria-label="${alt ?? v.legende}">${sources}</video></div>`;
  }
  if (src) {
    return html`<div class="visuel ${classe}" style="${style}"><img src="${src}" alt="${alt ?? v.legende}" loading="${eager ? 'eager' : 'lazy'}" decoding="async"></div>`;
  }
  return html`
  <div class="visuel visuel--attente ${classe}" style="${style}" role="img" aria-label="${alt ?? v.legende}" data-fichier="${v.fichier}">
    <span class="visuel__legende">${v.legende}</span>
    <span class="visuel__fichier">${v.video ? 'Film à venir' : 'Photographie à venir'}</span>
  </div>`;
}
