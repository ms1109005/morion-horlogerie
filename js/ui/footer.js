// Pied de page commun : marque, liens, lettre d’information factice, mention de démonstration.
import { html } from './html.js';

export function footer() {
  return html`
  <footer class="pied">
    <div class="pied__marque">
      <p class="marque">MORION</p>
      <p>Maison horlogère fictive. Trois familles, quatre matières, un calibre maison, le MR-01.</p>
    </div>
    <nav class="pied__liens" aria-label="Pied de page">
      <a href="./">Accueil</a>
      <a href="collection">Collection</a>
      <a href="montre/MOR-PR42-AC">Prisme Chronographe 42</a>
      <a href="montre/MOR-MO39-AC">Monolithe 39</a>
      <a href="montre/MOR-AB41-AC">Abysse 41 GMT</a>
    </nav>
    <form class="pied__lettre" data-lettre novalidate>
      <label for="lettre-email">Recevoir les nouvelles de l’atelier</label>
      <div class="pied__champ">
        <input id="lettre-email" name="email" type="email" autocomplete="email" placeholder="adresse@exemple.fr" required>
        <button class="btn btn--trait" type="submit">S’inscrire</button>
      </div>
      <p class="pied__message" data-lettre-message aria-live="polite"></p>
    </form>
    <p class="pied__demo">Site de démonstration : aucune vente réelle, aucun paiement, aucune donnée transmise.</p>
  </footer>`;
}

// Formulaire factice : validation en ligne, envoi intercepté, message de démonstration.
export function mountFooter(root) {
  const form = root.querySelector('[data-lettre]');
  if (!form) return () => {};
  const msg = form.querySelector('[data-lettre-message]');
  const input = form.querySelector('input');
  const onSubmit = (e) => {
    e.preventDefault();
    if (!input.checkValidity()) {
      msg.textContent = 'Adresse e-mail à vérifier, par exemple prenom@exemple.fr.';
      msg.dataset.etat = 'erreur';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    msg.dataset.etat = 'ok';
    msg.textContent = 'Démonstration : aucune adresse n’est enregistrée. Merci de votre intérêt.';
    form.reset();
  };
  form.addEventListener('submit', onSubmit);
  return () => form.removeEventListener('submit', onSubmit);
}
