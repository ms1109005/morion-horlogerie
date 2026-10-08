// Confirmation : l’écrin s’ouvre sur la montre commandée, numéro, récapitulatif. La commande
// vient de sessionStorage (écrite au paiement) ; sans commande, la page reste une page simple.
import { html } from '../ui/html.js';
import { prepareFacette } from '../ui/split.js';
import { resume } from '../ui/panier-lignes.js';
import { FAMILIES, FINISHES } from '../data/catalogue.js';
import { decode, formatPrice } from '../store/config.js';
import { lireCommande } from '../store/commande.js';
import { createEcrin } from '../stage/ecrin.js';

let facette = null;
let ecrin = null;
let ouvrirEcrin = null;

const commande = () => lireCommande();

function renderCommande(cmd) {
  const pieces = cmd.lignes.reduce((n, l) => n + l.qty, 0);
  const livraison = cmd.livraison.mode === 'salon'
    ? 'Retrait au salon MORION, Genève : nous vous appelons pour fixer le rendez-vous.'
    : `Livraison assurée à ${cmd.livraison.ville}, ${cmd.livraison.pays}, contre signature.`;
  const paiement = cmd.paiement.moyen === 'carte'
    ? `Carte se terminant par ${cmd.paiement.fin}`
    : 'Virement : les coordonnées suivent par e-mail';
  return html`
  <p class="bandeau-demo bandeau-demo--haut">Démonstration : aucun paiement réel.</p>
  <section class="merci">
    <div class="merci__texte">
      <h1 tabindex="-1">Merci, ${cmd.prenom}.</h1>
      <p class="merci__numero"><span class="num">${cmd.numero}</span><span>Numéro de commande</span></p>
      <p class="merci__chapo">${pieces > 1
        ? `Vos ${pieces} montres partent à l’atelier. Un horloger les monte, les règle et les contrôle une par une : comptez six semaines.`
        : 'Votre montre part à l’atelier. Un horloger la monte, la règle et la contrôle : comptez six semaines.'} Nous écrivons à ${cmd.email} à chaque étape.</p>
      <ul class="merci__lignes">
        ${cmd.lignes.map((l) => {
    const c = decode(l.code);
    return html`<li><span>${FAMILIES[c.family].nomComplet}, ${FINISHES[c.case].nom.toLowerCase()}${l.qty > 1 ? html` × ${l.qty}` : ''}<br>${resume(c)}</span><span class="num">${formatPrice(l.unit * l.qty)}</span></li>`;
  })}
        <li class="merci__total"><span>Total réglé</span><span class="num">${formatPrice(cmd.total)}</span></li>
      </ul>
      <div class="merci__notes">
        <p>${livraison}</p>
        <p>${paiement}</p>
      </div>
      ${pieces > 1 ? html`<p class="merci__notes"><span>Dans l’écrin ci-contre : ${FAMILIES[decode(cmd.lignes[0].code).family].nomComplet}. Les autres montres suivent dans le même envoi.</span></p>` : ''}
      <div class="actions">
        <a class="btn btn--plein" href="collection">Voir la collection</a>
        <a class="btn btn--trait" href="./">Revenir à l’accueil</a>
      </div>
    </div>
  </section>`;
}

function renderVide() {
  return html`
  <p class="bandeau-demo bandeau-demo--haut">Démonstration : aucun paiement réel.</p>
  <section class="page-simple page-simple--centre">
    <h1 tabindex="-1">Merci.</h1>
    <p class="page-simple__chapo">Aucune commande en cours sur ce navigateur.</p>
    <a class="btn btn--trait" href="./">Revenir à l’accueil</a>
  </section>`;
}

export default {
  title: () => 'Merci',
  pose: 'merci',
  // La montre du site prend la configuration commandée.
  config: () => { const c = commande(); return c ? decode(c.lignes[0].code) : undefined; },
  render: () => ({ page: commande() ? renderCommande(commande()) : renderVide() }),

  mount({ el, app }) {
    facette = prepareFacette(el.querySelector('h1'), { reduced: app.reduced });
    ouvrirEcrin = null;
    if (!commande() || !app.stage || !app.director.watch) {
      // Pas d'écrin : le texte reprend toute la largeur au lieu de laisser une colonne vide.
      el.querySelector('.merci')?.classList.add('merci--sans-ecrin');
      return () => { facette?.revert(); };
    }
    ecrin = createEcrin(app.stage, app.director);
    // La montre attend au fond de l’écrin, puis s’avance quand le couvercle se lève.
    const d = app.director;
    const pose = d.poses.merci;
    const petite = { ...pose, k: 1, visible: 1, taille: pose.taille * 0.88, eclate: 0 };
    d.to(petite, { immediate: true });
    ouvrirEcrin = async () => {
      if (app.reduced) {
        await ecrin.ouvrir({ immediat: true });
        d.to({ ...pose, k: 1, visible: 1 }, { immediate: true });
        return;
      }
      await ecrin.ouvrir();
      await d.to({ ...pose, k: 1, visible: 1 }, { duration: 0.9, ease: 'power2.out' });
    };
    return () => {
      facette?.revert();
      ecrin?.dispose();
      ecrin = null;
      ouvrirEcrin = null;
    };
  },
  enter() {
    facette?.play();
    ouvrirEcrin?.();
  },
};
