// Page introuvable : la montre s’est démontée, ses pièces flottent en éclaté.
import { html } from '../ui/html.js';
import { prepareFacette } from '../ui/split.js';

let facette = null;

export default {
  title: () => 'Page introuvable',
  pose: 'introuvable',
  render: () => ({
    page: html`
    <section class="introuvable">
      <h1 tabindex="-1">Cette page s’est démontée.</h1>
      <p>Erreur 404 : l’adresse ne correspond à aucune page de la maison. Toutes ses pièces sont pourtant là, à droite.</p>
      <div class="actions">
        <a class="btn btn--plein" href="./">Revenir à l’accueil</a>
        <a class="btn btn--trait" href="collection">Voir la collection</a>
      </div>
    </section>`,
  }),
  mount({ el, app }) {
    facette = prepareFacette(el.querySelector('h1'), { reduced: app.reduced });
    return () => facette?.revert();
  },
  enter() { facette?.play(); },
};
