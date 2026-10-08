// Fiche produit : configurateur 3D (hero), éclaté court au défilement, galerie « Au poignet »,
// matière, fiche technique, livraison, autres familles.
import { html } from '../ui/html.js';
import { prepareFacette } from '../ui/split.js';
import { footer, mountFooter } from '../ui/footer.js';
import { visuel } from '../ui/visuel.js';
import { createConfigurateur, ZONES } from '../ui/configurateur.js';
import { createPrix } from '../ui/prix.js';
import { FAMILIES, FINISHES, REFERENCES } from '../data/catalogue.js';
import { FICHES, MATIERES } from '../data/fiches.js';
import { decode, price, formatPrice } from '../store/config.js';
import { snapshot } from '../stage/snapshot.js';
import { DUR, EASE } from '../core/motion.js';

let facette = null;
const refOf = (params) => REFERENCES.find((r) => r.ref === params.ref);

// Configuration de départ : celle de l’URL (?c=) si elle est valide et de la bonne famille.
function configDe(params, url) {
  const r = refOf(params);
  const c = decode(url?.searchParams.get('c') || '');
  return c && c.family === r.family ? c : r.config;
}

// La vidéo est placée entre les deux photographies : au bout de la rangée elle se lisait
// comme une pièce rapportée, au milieu elle tient le rythme de la galerie.
const GALERIE = {
  PR42: ['poignet-pr42', 'poignet-pr42-rotation', 'poignet-pr42-2'],
  MO39: ['poignet-mo39', 'poignet-mo39-2'],
  AB41: ['poignet-ab41', 'poignet-ab41-2'],
};

export default {
  title: (params) => { const r = refOf(params); return `${FAMILIES[r.family].nomComplet}, ${FINISHES[r.finish].nom.toLowerCase()}`; },
  pose: 'montre',
  config: configDe,
  render: (params, url) => {
    const r = refOf(params);
    const f = FAMILIES[r.family];
    const c = configDe(params, url);
    const m = MATIERES[c.case];
    const autres = Object.values(FAMILIES).filter((x) => x.code !== f.code);
    return {
      page: html`
      <section class="config" data-config>
        <div class="config__ui au-dessus">
          <div class="config__glisser" data-glisser aria-hidden="true"></div>
          <svg class="config__filets" data-filets aria-hidden="true"></svg>
          <header class="config__entete">
            <h1 tabindex="-1">${f.nomComplet}</h1>
            <p class="config__type">${f.type}, ${f.diametre} mm</p>
          </header>
          <div class="config__pastilles" role="group" aria-label="Pièces à composer">
            ${ZONES.map((z) => html`
            <button class="pastille pastille--${z.cote}" style="--rang: ${z.rang}" type="button" data-zone="${z.id}" aria-pressed="false" aria-controls="plateau">
              <span class="pastille__nom">${z.label}</span>
              <span class="pastille__valeur" data-valeur></span>
            </button>`)}
          </div>
          <div class="config__plateau" id="plateau" data-plateau></div>
          <div class="config__achat">
            <p class="config__prix"><span class="prix" data-total>${formatPrice(price(c).total)}</span><span class="config__ecart num" data-ecart aria-hidden="true"></span></p>
            <details class="config__detail">
              <summary>Détail du prix</summary>
              <dl data-lignes></dl>
            </details>
            <div class="config__actions">
              <button class="btn btn--plein" type="button" data-ajouter>Ajouter à l’écrin</button>
              <button class="btn btn--trait" type="button" data-partager>Partager</button>
            </div>
            <p class="config__note">Livraison assurée offerte. Site de démonstration : aucune vente réelle.</p>
          </div>
          <p class="etiquette config__ref"><b data-ref>MOR-${c.family}-${c.case}</b><span>Calibre MR-01</span></p>
        </div>
      </section>

      <section class="eclate-court" data-eclate aria-labelledby="eclate-titre">
        <div class="eclate-court__texte">
          <h2 id="eclate-titre">Démontée, pièce par pièce.</h2>
          <ol class="eclate-court__etapes">
            <li data-etape><b>La glace saphir</b><span>Bombée, traitée antireflet des deux côtés.</span></li>
            <li data-etape><b>Le cadran</b><span>Posé sur son réhaut, index appliqués un à un.</span></li>
            <li data-etape><b>Le calibre MR-01</b><span>Ponts à côtes de Genève, rubis sertis d’or, vis bleuies.</span></li>
          </ol>
        </div>
      </section>

      <section class="poignet" aria-labelledby="poignet-titre">
        <h2 id="poignet-titre">Au poignet</h2>
        <div class="poignet__galerie">
          ${GALERIE[f.code].map((id, i) => visuel(id, { classe: `poignet__vue poignet__vue--${i}` }))}
        </div>
      </section>

      <section class="matiere">
        ${visuel(m.visuel, { classe: 'matiere__vue' })}
        <div class="matiere__texte">
          <h2>${m.titre}</h2>
          <p>${m.texte}</p>
        </div>
      </section>

      <section class="fiche" aria-labelledby="fiche-titre">
        <div class="fiche__entete">
          <h2 id="fiche-titre">Fiche technique</h2>
          <p class="etiquette fiche__ref"><b>MOR-${f.code}-${c.case}</b><span>Calibre MR-01</span></p>
        </div>
        <div class="fiche__groupes">
          ${FICHES[f.code].map(([titre, lignes], i) => html`
          <details class="fiche__groupe" ${i === 0 ? html`open` : ''}>
            <summary>${titre}</summary>
            <dl>${lignes.map(([k, v]) => html`<div><dt>${k}</dt><dd>${v}</dd></div>`)}</dl>
          </details>`)}
        </div>
      </section>

      <section class="service">
        <div><h3>Livraison assurée</h3><p>Offerte, remise en main propre, sous trois semaines après l’assemblage.</p></div>
        <div><h3>Retour sous 30 jours</h3><p>La montre revient dans son écrin, sans frais.</p></div>
        <div><h3>Garantie cinq ans</h3><p>Révision du calibre MR-01 comprise la cinquième année.</p></div>
      </section>

      <section class="autres" aria-labelledby="autres-titre">
        <h2 id="autres-titre">Les autres familles</h2>
        <div class="autres__cartes">
          ${autres.map((x) => html`
          <a class="autre" href="montre/MOR-${x.code}-AC">
            <img src="img/rendus/mor-${x.code.toLowerCase()}-ac.webp" alt="" width="800" height="800" loading="lazy" decoding="async">
            <span class="autre__nom">${x.nomComplet}</span>
            <span class="autre__prix">à partir de ${formatPrice(Math.min(...Object.values(x.base)))}</span>
          </a>`)}
        </div>
      </section>
      ${footer()}`,
    };
  },

  mount({ el, params, url, app }) {
    const offs = [];
    const gsap = window.gsap;
    const hero = el.querySelector('[data-config]');
    const prix = createPrix(el.querySelector('[data-total]'), el.querySelector('[data-ecart]'), { reduced: app.reduced });
    const lignes = el.querySelector('[data-lignes]');
    const refEl = el.querySelector('[data-ref]');
    const majLignes = (c) => {
      const p = price(c);
      lignes.innerHTML = html`${p.lines.map((l, i) => html`<div><dt>${l.label}</dt><dd class="num">${i ? '+ ' : ''}${formatPrice(l.amount)}</dd></div>`)}
        <div class="detail__total"><dt>Total TTC</dt><dd class="num">${formatPrice(p.total)}</dd></div>`;
      refEl.textContent = `MOR-${c.family}-${c.case}`;
    };
    majLignes(configDe(params, url));

    const conf = app.director.watch
      ? createConfigurateur({ root: hero, app, config: configDe(params, url), prix, onChange: (c) => majLignes(c) })
      : null;

    // Ajouter : instantané de la montre, qui vole jusqu’au guichet du panier.
    el.querySelector('[data-ajouter]').addEventListener('click', () => {
      const c = conf?.config || configDe(params, url);
      let image = null;
      try { image = app.stage ? snapshot(app.stage, app.director) : null; } catch { image = null; }
      app.cart.add(c, { image });
      app.annonce(`${FAMILIES[c.family].nomComplet} ajoutée à votre écrin.`);
      if (image && !app.reduced) voler(image);
    });
    el.querySelector('[data-partager]').addEventListener('click', async (e) => {
      const b = e.currentTarget;
      try { await navigator.clipboard.writeText(location.href); } catch {
        const t = document.createElement('textarea');
        t.value = location.href; document.body.append(t); t.select();
        try { document.execCommand('copy'); } catch { /* rien */ }
        t.remove();
      }
      const avant = b.textContent;
      b.textContent = 'Lien copié';
      app.annonce('Lien de cette configuration copié.');
      setTimeout(() => { b.textContent = avant; }, 2200);
    });

    // Défilement : les commandes s’effacent, la montre passe de profil et se démonte, puis se
    // retire avant la galerie. Rien de tout cela en mouvement réduit.
    if (!app.reduced && conf) {
      const { ScrollTrigger } = window;
      const ui = hero.querySelector('.config__ui');
      const eclate = el.querySelector('[data-eclate]');
      const etapes = [...el.querySelectorAll('[data-etape]')];
      const d = app.director;
      const narrow = window.innerWidth < 720;
      const cible = narrow
        ? { x: -0.06, y: 0.34, taille: 0.075, rotX: 0.25, rotY: -1.25 }
        : { x: 0.2, y: 0, taille: 0.23, rotX: 0.18, rotY: -1.3 };
      const mix = (a, b, t) => a + (b - a) * t;
      let pa = 0; let pb = 0; let pc = 0;
      const poser = () => {
        const p0 = conf.poseCourante();
        const t = gsap.parseEase('power2.inOut')(pa);
        const s = d.state;
        ['x', 'y', 'taille', 'rotX', 'rotY'].forEach((k) => { s[k] = mix(p0[k], cible[k], t); });
        // Éclaté : 0 → 0,9 → 0 le long de la section épinglée.
        s.eclate = Math.sin(Math.PI * pb) * 0.9;
        s.k = 1 - gsap.parseEase('power2.in')(pc);
        d.apply();
      };
      offs.push(() => { gsap.set(ui, { clearProps: 'opacity' }); });
      ScrollTrigger.create({
        trigger: hero, start: 'top top', end: 'bottom top', scrub: true,
        onUpdate: (st) => { pa = st.progress; gsap.set(ui, { opacity: 1 - Math.min(1, st.progress * 2.2) }); poser(); },
      });
      ScrollTrigger.create({
        trigger: eclate, start: 'top top', end: '+=160%', pin: true, scrub: true,
        onUpdate: (st) => {
          pb = st.progress;
          const n = Math.min(etapes.length - 1, Math.floor(st.progress * etapes.length));
          etapes.forEach((e, i) => e.classList.toggle('actif', i === n));
          poser();
        },
      });
      ScrollTrigger.create({
        trigger: el.querySelector('.poignet'), start: 'top bottom', end: 'top 55%', scrub: true,
        onUpdate: (st) => { pc = st.progress; poser(); },
      });
    }

    facette = prepareFacette(el.querySelector('h1'), { reduced: app.reduced });
    offs.push(mountFooter(el));
    return () => { offs.forEach((f) => f()); conf?.destroy(); facette?.revert(); };

    function voler(image) {
      const gsapV = window.gsap;
      const cible = document.querySelector('.guichet__fen').getBoundingClientRect();
      const taille = Math.min(window.innerHeight * 0.34, 300);
      const img = document.createElement('img');
      img.src = image;
      img.alt = '';
      img.className = 'vol';
      const x0 = window.innerWidth * (0.5 + app.director.state.x / 2) - taille / 2;
      const y0 = window.innerHeight * (0.5 - app.director.state.y / 2) - taille / 2;
      Object.assign(img.style, { width: `${taille}px`, height: `${taille}px`, left: '0px', top: '0px' });
      document.body.append(img);
      const x1 = cible.left + cible.width / 2 - taille / 2;
      const y1 = cible.top + cible.height / 2 - taille / 2;
      gsapV.set(img, { x: x0, y: y0 });
      gsapV.timeline({ onComplete: () => img.remove() })
        .to(img, { x: x1, duration: DUR.long, ease: EASE.traverse }, 0)
        .to(img, { y: y1, duration: DUR.long, ease: 'power2.in' }, 0)
        .to(img, { scale: 0.08, duration: DUR.long, ease: 'power2.in' }, 0)
        .to(img, { opacity: 0, duration: 0.2, ease: 'none' }, DUR.long - 0.2);
    }
  },
  enter() { facette?.play(); },
};
