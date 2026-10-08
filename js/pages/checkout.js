// Commande : tunnel en trois étapes (coordonnées, livraison, paiement), récapitulatif fixe,
// erreurs en ligne, paiement simulé de 1,5 s. Démonstration : rien n’est transmis, et de la
// carte seuls les 4 derniers chiffres sont gardés pour la confirmation.
import { html } from '../ui/html.js';
import { prepareFacette } from '../ui/split.js';
import { visuel } from '../ui/visuel.js';
import { resume, vignette } from '../ui/panier-lignes.js';
import { FAMILIES, FINISHES } from '../data/catalogue.js';
import { formatPrice } from '../store/config.js';
import {
  validerEtape, creerCommande, enregistrerCommande, formaterCarte, formaterExpiration,
} from '../store/commande.js';
import { DUR, EASE } from '../core/motion.js';

let facette = null;
const ETAPES = [
  { id: 'coordonnees', titre: 'Coordonnées', suite: 'Continuer vers la livraison' },
  { id: 'livraison', titre: 'Livraison', suite: 'Continuer vers le paiement' },
  { id: 'paiement', titre: 'Paiement', suite: 'Payer' },
];

const champ = (id, libelle, { type = 'text', auto = 'off', mode, requis = true, aide = '', classe = '', max } = {}) => html`
  <div class="champ ${classe}">
    <label for="c-${id}">${libelle}${requis ? '' : html` <span class="champ__facultatif">facultatif</span>`}</label>
    ${aide ? html`<p class="champ__aide" id="a-${id}">${aide}</p>` : ''}
    <input id="c-${id}" name="${id}" type="${type}" autocomplete="${auto}" ${mode ? html`inputmode="${mode}"` : ''} ${max ? html`maxlength="${max}"` : ''}
      aria-describedby="${aide ? `a-${id} ` : ''}e-${id}" ${requis ? html`aria-required="true"` : ''}>
    <p class="champ__erreur" id="e-${id}"></p>
  </div>`;

function recap(cart) {
  const lignes = cart.lines();
  return html`
  <aside class="recap" aria-labelledby="recap-titre" data-recap>
    <h2 id="recap-titre" class="recap__titre">Récapitulatif</h2>
    <button type="button" class="recap__plier lien-texte" data-plier aria-expanded="false" aria-controls="recap-detail">Voir le détail</button>
    <div class="recap__detail" id="recap-detail">
    <ul class="recap__lignes">
      ${lignes.map((l) => html`
      <li class="recap__ligne">
        <img src="${vignette(l)}" alt="" width="72" height="72">
        <div>
          <p class="recap__nom">${FAMILIES[l.config.family].nomComplet}, ${FINISHES[l.config.case].nom.toLowerCase()}${l.qty > 1 ? html` <span class="num">× ${l.qty}</span>` : ''}</p>
          <p class="recap__options">${resume(l.config)}</p>
          ${l.config.engraving ? html`<p class="recap__options">Gravure : « ${l.config.engraving} »</p>` : ''}
        </div>
        <p class="recap__prix num">${formatPrice(l.sum)}</p>
      </li>`)}
    </ul>
    <dl class="recap__totaux">
      <div><dt>Sous-total</dt><dd class="num">${formatPrice(cart.total())}</dd></div>
      <div><dt>Livraison assurée</dt><dd>offerte</dd></div>
      <div class="recap__total"><dt>Total</dt><dd class="num">${formatPrice(cart.total())}</dd></div>
    </dl>
    <p class="recap__note">Assemblage et contrôle à l’atelier : six semaines. Garantie cinq ans.</p>
    </div>
    <p class="recap__replie num" data-replie>${lignes.length} montre${lignes.length > 1 ? 's' : ''} · ${formatPrice(cart.total())}</p>
  </aside>`;
}

function etape(e, i, contenu) {
  return html`
  <form class="etape" data-etape="${e.id}" novalidate aria-labelledby="etape-${e.id}">
    <div class="etape__tete">
      <h2 id="etape-${e.id}" class="etape__titre" tabindex="-1"><span class="etape__num num">0${i + 1}</span> ${e.titre}</h2>
      <p class="etape__resume" data-resume></p>
      <button type="button" class="lien-texte etape__modifier" data-modifier hidden>Modifier<span class="sr"> : ${e.titre.toLowerCase()}</span></button>
    </div>
    <div class="etape__corps" data-corps hidden>
      ${contenu}
      <p class="etape__alerte" data-alerte role="alert"></p>
      <button type="submit" class="btn btn--plein etape__suite" data-suite>${e.suite}</button>
    </div>
  </form>`;
}

function renderTunnel(cart) {
  const total = formatPrice(cart.total());
  return html`
  <p class="bandeau-demo bandeau-demo--haut">Démonstration : aucun paiement réel.</p>
  <section class="commande">
    <header class="commande__entete">
      <h1 tabindex="-1">Votre commande</h1>
      <p class="commande__cadran num" aria-hidden="true"><span data-compteur-etape>01</span> sur 03</p>
    </header>
    <div class="commande__corps">
      <div class="commande__etapes">
        ${etape(ETAPES[0], 0, html`
          <div class="champs">
            ${champ('prenom', 'Prénom', { auto: 'given-name' })}
            ${champ('nom', 'Nom', { auto: 'family-name' })}
            ${champ('email', 'Adresse e-mail', { type: 'email', auto: 'email', mode: 'email', classe: 'champ--large' })}
            ${champ('telephone', 'Téléphone', { type: 'tel', auto: 'tel', mode: 'tel', requis: false, classe: 'champ--large' })}
          </div>`)}
        ${etape(ETAPES[1], 1, html`
          <fieldset class="modes">
            <legend class="sr">Mode de livraison</legend>
            <label class="modes__carte"><input type="radio" name="mode" value="domicile" checked>
              <span class="modes__titre">Livraison à domicile, assurée</span>
              <span class="modes__detail">Remise en main propre contre signature, 3 à 5 jours ouvrés après l’assemblage. Offerte.</span></label>
            <label class="modes__carte"><input type="radio" name="mode" value="salon">
              <span class="modes__titre">Retrait au salon MORION</span>
              <span class="modes__detail">Sur rendez-vous : un horloger vous remet la montre et ajuste le bracelet à votre poignet.</span></label>
          </fieldset>
          <div class="champs" data-si="domicile">
            ${champ('adresse', 'Adresse', { auto: 'street-address', classe: 'champ--large' })}
            ${champ('codePostal', 'Code postal', { auto: 'postal-code', mode: 'numeric', max: 6 })}
            ${champ('ville', 'Ville', { auto: 'address-level2' })}
            ${champ('pays', 'Pays', { auto: 'country-name', classe: 'champ--large' })}
          </div>
          <div class="salon" data-si="salon" hidden>
            ${visuel('salon-retrait', { classe: 'salon__visuel' })}
            <p class="salon__adresse">Salon MORION, quai des Horlogers, Genève. Nous vous appelons pour fixer le rendez-vous.</p>
          </div>`)}
        ${etape(ETAPES[2], 2, html`
          <fieldset class="modes">
            <legend class="sr">Moyen de paiement</legend>
            <label class="modes__carte"><input type="radio" name="moyen" value="carte" checked>
              <span class="modes__titre">Carte bancaire</span>
              <span class="modes__detail">Débit à la commande, assemblage lancé aussitôt.</span></label>
            <label class="modes__carte"><input type="radio" name="moyen" value="virement">
              <span class="modes__titre">Virement</span>
              <span class="modes__detail">Coordonnées envoyées par e-mail ; l’assemblage commence à réception.</span></label>
          </fieldset>
          <div class="champs" data-si="carte">
            ${champ('titulaire', 'Titulaire de la carte', { classe: 'champ--large' })}
            ${champ('numero', 'Numéro de carte', { mode: 'numeric', max: 23, classe: 'champ--large', aide: 'Carte de test : 4242 4242 4242 4242.' })}
            ${champ('expiration', 'Expiration', { mode: 'numeric', max: 5, aide: 'MM/AA' })}
            ${champ('crypto', 'Cryptogramme', { mode: 'numeric', max: 4, aide: '3 ou 4 chiffres, au dos' })}
          </div>
          <p class="etape__total">À régler : <span class="num">${total}</span></p>`)}
      </div>
      ${recap(cart)}
    </div>
  </section>`;
}

function renderVide() {
  return html`
  <p class="bandeau-demo bandeau-demo--haut">Démonstration : aucun paiement réel.</p>
  <section class="page-simple">
    <h1 tabindex="-1">Votre commande</h1>
    <p class="page-simple__chapo">Votre écrin est vide. Composez une montre pour passer commande.</p>
    <a class="btn btn--plein" href="collection">Voir la collection</a>
  </section>`;
}

export default {
  title: () => 'Commande',
  pose: 'commande',
  // La montre du site prend la configuration de la première ligne du panier.
  config: () => window.__morion?.cart.lines()[0]?.config,
  render: () => {
    const cart = window.__morion?.cart;
    return { page: cart?.count() ? renderTunnel(cart) : renderVide() };
  },
  mount({ el, app }) {
    facette = prepareFacette(el.querySelector('h1'), { reduced: app.reduced });
    if (!el.querySelector('.commande')) return () => facette?.revert();
    return monterTunnel(el, app);
  },
  enter() { facette?.play(); },
};

function monterTunnel(el, app) {
  const gsap = window.gsap;
  const formes = ETAPES.map((e) => el.querySelector(`[data-etape="${e.id}"]`));
  const compteur = el.querySelector('[data-compteur-etape]');
  const donnees = {};
  let courante = 0;
  let paiementEnCours = false;

  const lire = (f) => Object.fromEntries(new FormData(f).entries());
  const resumes = {
    coordonnees: (v) => `${v.prenom} ${v.nom}, ${v.email}`,
    livraison: (v) => (v.mode === 'salon' ? 'Retrait au salon MORION, Genève' : `${v.adresse}, ${v.codePostal} ${v.ville}, ${v.pays}`),
  };

  // Champs conditionnels (domicile / salon, carte / virement).
  function basculer(f) {
    const v = lire(f);
    f.querySelectorAll('[data-si]').forEach((b) => { b.hidden = ![v.mode, v.moyen].includes(b.dataset.si); });
  }

  function afficher(i, { focus = true } = {}) {
    courante = i;
    compteur.textContent = `0${i + 1}`;
    formes.forEach((f, j) => {
      const corps = f.querySelector('[data-corps]');
      const actif = j === i;
      const fait = j < i;
      f.classList.toggle('etape--active', actif);
      f.classList.toggle('etape--faite', fait);
      corps.hidden = !actif;
      f.querySelector('[data-modifier]').hidden = !fait;
      f.querySelector('[data-resume]').textContent = fait && resumes[ETAPES[j].id] ? resumes[ETAPES[j].id](donnees[ETAPES[j].id]) : '';
      if (actif) f.setAttribute('aria-current', 'step'); else f.removeAttribute('aria-current');
    });
    const f = formes[i];
    basculer(f);
    if (!app.reduced) {
      gsap.fromTo(f.querySelector('[data-corps]'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: DUR.court, ease: EASE.sortie, clearProps: 'transform,opacity' });
    }
    if (focus) {
      // Le titre de l'étape, pas le premier champ : aux étapes 2 et 3 c'est un bouton radio
      // masqué, qui ne nomme rien. Le titre porte le numéro, le nom, et son propre décalage.
      app.annonce(`Étape ${i + 1} sur ${ETAPES.length} : ${ETAPES[i].titre}.`);
      (f.querySelector('.etape__titre') || f.querySelector('input'))?.focus({ preventScroll: true });
      // Hauteur réelle de la bande du haut (nav + bandeau), jamais une constante.
      const bas = Math.max(
        document.getElementById('nav')?.getBoundingClientRect().bottom || 0,
        el.querySelector('.bandeau-demo')?.getBoundingClientRect().bottom || 0,
      ) + 24;
      const r = f.getBoundingClientRect();
      if (r.top < bas || r.top > window.innerHeight * 0.6) app.scroll.to(window.scrollY + r.top - bas, { immediate: false, duration: 0.6 });
    }
  }

  function montrerErreurs(f, erreurs) {
    f.querySelectorAll('input').forEach((i) => {
      const msg = erreurs[i.name];
      const p = f.querySelector(`#e-${i.name}`);
      if (p) p.textContent = msg || '';
      if (msg) i.setAttribute('aria-invalid', 'true'); else i.removeAttribute('aria-invalid');
    });
    const n = Object.keys(erreurs).length;
    f.querySelector('[data-alerte]').textContent = n ? `${n} champ${n > 1 ? 's' : ''} à corriger.` : '';
    if (n) f.querySelector('[aria-invalid="true"]')?.focus();
  }

  // Formatage à la frappe : numéro par groupes de 4, date MM/AA.
  const formater = (e) => {
    const i = e.target;
    if (i.name === 'numero') i.value = formaterCarte(i.value);
    if (i.name === 'expiration') i.value = formaterExpiration(i.value);
    if (i.name === 'crypto' || i.name === 'codePostal') i.value = i.value.replace(/\D/g, '');
    // Une erreur corrigée disparaît dès que le champ redevient valide.
    if (i.getAttribute('aria-invalid') === 'true') {
      const f = i.form;
      const err = validerEtape(ETAPES[courante].id, lire(f));
      if (!err[i.name]) { i.removeAttribute('aria-invalid'); f.querySelector(`#e-${i.name}`).textContent = ''; }
    }
  };

  async function payer(f) {
    if (paiementEnCours) return;
    paiementEnCours = true;
    const bouton = f.querySelector('[data-suite]');
    bouton.disabled = true;
    bouton.setAttribute('aria-busy', 'true');
    bouton.textContent = 'Paiement en cours';
    app.annonce('Paiement en cours.');
    app.rehaut.tour(1.5);
    await new Promise((r) => setTimeout(r, 1500));
    const cmd = creerCommande({
      lignes: app.cart.items(),
      coordonnees: donnees.coordonnees,
      livraison: donnees.livraison,
      paiement: donnees.paiement,
    });
    if (!enregistrerCommande(cmd)) {
      // Stockage refusé : on rend la main plutôt que de vider l'écrin sur une commande perdue.
      paiementEnCours = false;
      bouton.disabled = false;
      bouton.removeAttribute('aria-busy');
      bouton.textContent = 'Payer';
      const alerte = f.querySelector('[data-alerte]');
      if (alerte) alerte.textContent = "Votre navigateur bloque le stockage de session : la commande ne peut pas être enregistrée. Autorisez le stockage, ou quittez la navigation privée, puis réessayez.";
      app.annonce('Le paiement n’a pas pu être finalisé.');
      return;
    }
    app.cart.clear();
    app.router.navigate('commande/merci');
  }

  const soumettre = (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const i = formes.indexOf(f);
    if (i !== courante) return;
    const v = lire(f);
    const erreurs = validerEtape(ETAPES[i].id, v);
    montrerErreurs(f, erreurs);
    if (Object.keys(erreurs).length) return;
    donnees[ETAPES[i].id] = v;
    if (i < ETAPES.length - 1) afficher(i + 1);
    else payer(f);
  };

  // Récapitulatif replié sur écran étroit : le détail s’ouvre au besoin.
  const aside = el.querySelector('[data-recap]');
  const plier = aside.querySelector('[data-plier]');
  plier.addEventListener('click', () => {
    const ouvert = aside.classList.toggle('recap--ouvert');
    plier.setAttribute('aria-expanded', String(ouvert));
    plier.textContent = ouvert ? 'Masquer le détail' : 'Voir le détail';
  });

  formes.forEach((f, i) => {
    f.addEventListener('submit', soumettre);
    f.addEventListener('input', formater);
    f.addEventListener('change', (e) => { if (e.target.type === 'radio') basculer(f); });
    f.querySelector('[data-modifier]').addEventListener('click', () => { if (!paiementEnCours) afficher(i); });
  });
  // Le prix affiché sur le bouton de paiement.
  const suite = formes[2].querySelector('[data-suite]');
  suite.textContent = `Payer ${formatPrice(app.cart.total())}`;
  afficher(0, { focus: false });
  return () => facette?.revert();
}
