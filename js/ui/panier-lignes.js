// Contenu du tiroir panier : lignes (vignette, options, gravure, prix, quantité, suppression avec
// annulation), sous-total, livraison, passage en commande. État vide sinon.
import { FAMILIES, FINISHES, OPTIONS } from '../data/catalogue.js';
import { formatPrice } from '../store/config.js';
import { emptyState } from './drawer.js';
import { html } from './html.js';

export function resume(c) {
  const bracelet = c.strap === 'metal'
    ? `bracelet métal ${FINISHES[c.case].nom.toLowerCase()}`
    : `${OPTIONS.strap[c.strap].nom.toLowerCase()} ${OPTIONS.strapColor[c.strapColor].nom.toLowerCase()}`;
  return [
    `lunette ${FINISHES[c.bezel].nom.toLowerCase()}`,
    `cadran ${OPTIONS.dialColor[c.dialColor].nom.toLowerCase()} ${OPTIONS.dialPattern[c.dialPattern].nom.toLowerCase()}`,
    `aiguilles ${OPTIONS.hands[c.hands].nom.toLowerCase()}`,
    bracelet,
  ].join(', ');
}

export const vignette = (l) => l.image || `img/rendus/mor-${l.config.family.toLowerCase()}-${l.config.case.toLowerCase()}.webp`;

export function lignesPanier(cart, { annule } = {}) {
  const lignes = cart.lines();
  const message = annule ? html`<p class="panier__annule" role="status">${annule.texte} <button type="button" class="lien-texte" data-annuler>Annuler</button></p>` : '';
  // La dernière montre retirée : l’annulation reste proposée au-dessus de l’état vide.
  if (!lignes.length) return { corps: html`${message}${emptyState()}`, pied: '' };
  const corps = html`
  ${message}
  <ul class="lignes">
    ${lignes.map((l) => html`
    <li class="ligne" data-ligne="${l.id}">
      <img class="ligne__vignette" src="${vignette(l)}" alt="" width="96" height="96">
      <div class="ligne__texte">
        <p class="ligne__nom">${FAMILIES[l.config.family].nomComplet}, ${FINISHES[l.config.case].nom.toLowerCase()}</p>
        <p class="ligne__options">${resume(l.config)}</p>
        ${l.config.engraving ? html`<p class="ligne__gravure">Gravure : « ${l.config.engraving} »</p>` : ''}
        <div class="ligne__bas">
          <div class="quantite" role="group" aria-label="Quantité">
            <button type="button" data-moins aria-label="Retirer une montre" ${l.qty <= 1 ? html`disabled` : ''}>−</button>
            <span class="num" aria-live="polite">${l.qty}</span>
            <button type="button" data-plus aria-label="Ajouter une montre" ${l.qty >= 9 ? html`disabled` : ''}>+</button>
          </div>
          <p class="ligne__prix num">${formatPrice(l.sum)}</p>
        </div>
        <button type="button" class="ligne__retirer" data-retirer>Retirer</button>
      </div>
    </li>`)}
  </ul>`;
  const pied = html`
  <dl class="panier__totaux">
    <div><dt>Sous-total</dt><dd class="num">${formatPrice(cart.total())}</dd></div>
    <div><dt>Livraison assurée</dt><dd>offerte</dd></div>
  </dl>
  <a class="btn btn--plein panier__commande" href="commande" data-fermer-apres>Passer commande</a>
  <p class="panier__demo">Démonstration : aucun paiement réel.</p>`;
  return { corps, pied };
}

// Actions du tiroir (délégation d’événements) : quantité, retrait, annulation.
export function brancherLignes(panel, cart, drawer) {
  let annule = null;
  let timer = 0;
  drawer.setRenderer(() => lignesPanier(cart, { annule }));
  panel.addEventListener('click', (e) => {
    const li = e.target.closest('[data-ligne]');
    if (e.target.closest('[data-annuler]') && annule) {
      clearTimeout(timer);
      const u = annule.undo;
      annule = null;
      u();
      return;
    }
    if (!li) return;
    const id = li.dataset.ligne;
    const l = cart.items().find((x) => x.id === id);
    if (!l) return;
    // Le rendu remplace les boutons : le focus revient sur le même bouton de la même ligne.
    const refocus = (sel) => requestAnimationFrame(() => {
      const b = panel.querySelector(`[data-ligne="${id}"] ${sel}`);
      (b && !b.disabled ? b : panel.querySelector(`[data-ligne="${id}"] .quantite span`))?.focus?.();
    });
    if (e.target.closest('[data-plus]')) { cart.setQty(id, l.qty + 1); refocus('[data-plus]'); }
    else if (e.target.closest('[data-moins]')) { cart.setQty(id, l.qty - 1); refocus('[data-moins]'); }
    else if (e.target.closest('[data-retirer]')) {
      clearTimeout(timer);
      annule = { texte: 'Montre retirée de votre écrin.', undo: cart.remove(id) };
      timer = setTimeout(() => { annule = null; drawer.render(); }, 6000);
      drawer.render();
      panel.querySelector('[data-annuler]')?.focus();
    }
  });
}
