// Accueil : le film de la maison en sept temps. Hero (le Prisme devant « MORION », puis
// derrière), assemblage épinglé, quatre chapitres couleur, seuil des salles, atelier express,
// finale, pied de page. Une seule montre (celle du directeur) porte les cinq premiers temps :
// sa pose est écrite par des segments de défilement contigus, un seul actif à la fois, si bien
// qu’un saut de défilement retombe toujours juste.
import { html } from '../ui/html.js';
import { prepareFacette, splitWords } from '../ui/split.js';
import { footer, mountFooter } from '../ui/footer.js';
import { visuel, estPresent } from '../ui/visuel.js';
import { renderPieces, createPieces } from '../ui/pieces.js';
import { defaultConfig, encode, price, formatPrice } from '../store/config.js';
import { FAMILIES, FINISHES, OPTIONS } from '../data/catalogue.js';
import { CHAPITRES, etapeAssemblage, chapitreDe } from '../data/pieces.js';
import { createVitrine, FINITIONS_FINALE } from '../stage/vitrine.js';
import { createCouloir } from '../stage/couloir.js';
import { POSES, POSES_ETROIT } from '../stage/director.js';
import { DUR, EASE } from '../core/motion.js';

let facette = null;
let entrer = null;

const PR = FAMILIES.PR42;
const TEINTES_CADRAN = { noir: '#141416', bleu: '#1d2f6b', fume: '#4a3b33', vert: '#1f3a2c', saumon: '#d99a80', argent: '#c9cacb' };
const BRACELETS = ['metal', 'caoutchouc', 'cuir'];

// Poses de la chorégraphie (x, y en fractions de demi-écran ; taille en part de la hauteur).
const POSES_ACCUEIL = {
  large: {
    milieu: { x: 0.03, y: 0.08, taille: 0.33, rotX: 0.14, rotY: -1.05, rotZ: 0 },
    assemblage: { x: 0.14, y: -0.04, taille: 0.25, rotX: 0.2, rotY: -1.38, rotZ: 0 },
    chapitre: { x: 0.33, y: -0.02, taille: 0.44, rotX: 0.12, rotY: -0.35, rotZ: 0 },
    seuil: { x: 0, y: 0.05, taille: 0.3, rotX: 0.1, rotY: -0.2, rotZ: 0 },
    atelier: { x: -0.3, y: -0.02, taille: 0.4, rotX: 0.12, rotY: 0.42, rotZ: 0 },
  },
  etroit: {
    milieu: { x: -0.62, y: 0.3, taille: 0.22, rotX: 0.14, rotY: -1.05, rotZ: 0 },
    assemblage: { x: 0, y: -0.2, taille: 0.18, rotX: 1.22, rotY: 0.12, rotZ: 0 },
    chapitre: { x: 0, y: 0.24, taille: 0.34, rotX: 0.12, rotY: -0.35, rotZ: 0 },
    seuil: { x: 0, y: 0.12, taille: 0.2, rotX: 0.1, rotY: -0.2, rotZ: 0 },
    // y 0,48 plaçait le haut du boîtier sous la bande opaque de la nav : la montre que l'on
    // compose était décapitée pendant toute la tenue. Les zones démarrent à 40 vh, la place existe.
    atelier: { x: 0, y: 0.30, taille: 0.22, rotX: 0.12, rotY: 0.42, rotZ: 0 },
  },
};
const CLES = ['x', 'y', 'taille', 'rotX', 'rotY', 'rotZ'];
const melange = (a, b, t) => Object.fromEntries(CLES.map((k) => [k, a[k] + (b[k] - a[k]) * t]));
const pas = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function renderAccueil() {
  const puce = (nom, valeur, contenu, coche, extra = '') => html`
    <label class="puce ${extra}"><input type="radio" name="${nom}" value="${valeur}" ${coche ? html`checked` : ''}><span>${contenu}</span></label>`;
  return html`
  <section class="hero-accueil" data-hero data-pose-reduite="accueil">
    <p class="geant" aria-hidden="true">MORION</p>
    <div class="hero-accueil__texte">
      <h1 tabindex="-1">Une montre se compose pièce par pièce.</h1>
      <p>Trois familles, quatre matières, un calibre maison. Vous choisissez chaque pièce, l’atelier l’assemble.</p>
      <div class="actions">
        <a class="btn btn--plein" href="montre/MOR-PR42-AC">Composer la vôtre</a>
        <a class="btn btn--trait" href="collection">Voir la collection</a>
      </div>
    </div>
    <div class="etiquette hero-accueil__etiquette"><b>Prisme Chronographe 42</b><span>Acier, calibre MR-01</span></div>
  </section>

  <section class="assemblage" data-assemblage aria-labelledby="assemblage-titre" data-pose-reduite="assemblage">
    <div class="assemblage__texte">
      <h2 id="assemblage-titre">Le morion a six faces. Le Prisme, cinquante-neuf pièces.</h2>
      <p>Le Prisme se démonte sous vos yeux, de la glace saphir au rotor, puis se remonte. Touchez une pièce pour lire sa fiche.</p>
    </div>
    <p class="assemblage__compteur"><span class="assemblage__legende">Pièce</span> <span class="num" data-compteur>00</span> <span class="assemblage__legende">sur <span class="num" data-total>59</span></span></p>
    <p class="assemblage__phase" data-phase aria-hidden="true">Démontage</p>
  </section>

  <section class="chapitres" data-chapitres aria-label="Les quatre matières du Prisme">
    ${CHAPITRES.map((c, i) => html`
    <article class="chapitre chapitre--${c.finition.toLowerCase()}" data-chapitre="${i}" aria-labelledby="chapitre-${i}">
      <p class="chapitre__index num" aria-hidden="true">0${i + 1} <span>sur 04</span></p>
      <div class="chapitre__texte">
        <h2 class="chapitre__titre" id="chapitre-${i}">${c.titre}</h2>
        <p class="chapitre__corps">${c.texte}</p>
        <p class="chapitre__prix">Prisme Chronographe 42 en ${FINISHES[c.finition].nom.toLowerCase()}, à partir de <span class="num">${formatPrice(PR.base[c.finition])}</span></p>
        <a class="lien-texte" href="montre/MOR-PR42-${c.finition}">Voir cette référence</a>
      </div>
      ${estPresent(c.visuel) ? visuel(c.visuel, { classe: 'chapitre__visuel' }) : ''}
      <img class="chapitre__rendu" src="img/rendus/mor-pr42-${c.finition.toLowerCase()}.webp" alt="" width="800" height="800" loading="lazy" decoding="async">
    </article>`)}
  </section>

  <section class="seuil" data-seuil aria-labelledby="seuil-titre">
    <div class="seuil__texte au-dessus" data-seuil-texte>
      <h2 id="seuil-titre">Trois salles, une par famille.</h2>
      <p>Le hall en quartz fumé, puis le Prisme, le Monolithe et l’Abysse, chacune dans le décor de sa forme.</p>
      <a class="btn btn--plein" href="collection">Entrer dans les salles</a>
    </div>
  </section>

  <section class="atelier" data-atelier aria-labelledby="atelier-titre" data-pose-reduite="atelier">
    <div class="atelier__config" data-atelier-config>
      <div class="atelier__texte">
        <h2 id="atelier-titre">L’atelier, en trois gestes.</h2>
        <p>La matière, le cadran, le bracelet : la montre change sous vos yeux. Le reste, lunette, aiguilles, gravure, se règle dans l’atelier complet.</p>
      </div>
      <form class="atelier__zones" data-atelier-zones aria-label="Composer un Prisme Chronographe 42">
        <fieldset><legend>Matière</legend><div class="puces">${Object.entries(FINISHES).map(([k, f]) => puce('matiere', k, f.nom, k === 'AC'))}</div></fieldset>
        <fieldset><legend>Cadran</legend><div class="puces puces--teintes">${Object.entries(OPTIONS.dialColor).map(([k, o]) => puce('cadran', k, html`<i class="teinte" style="--teinte: ${TEINTES_CADRAN[k]}"></i>${o.nom}`, k === 'bleu', 'puce--teinte'))}</div></fieldset>
        <fieldset><legend>Bracelet</legend><div class="puces">${BRACELETS.map((k) => puce('bracelet', k, OPTIONS.strap[k].nom, k === 'metal'))}</div></fieldset>
      </form>
      <div class="atelier__achat">
        <p class="atelier__prix">Votre Prisme <span class="num" data-atelier-prix>${formatPrice(price(defaultConfig('PR42', 'AC')).total)}</span></p>
        <a class="btn btn--plein" data-atelier-lien href="montre/MOR-PR42-AC">Ouvrir l’atelier</a>
      </div>
    </div>
    <div class="atelier__photos" data-atelier-photos>
      <header class="atelier__entete">
        <h3>À l’établi, une seule main.</h3>
        <p>Chaque Prisme est monté, réglé et contrôlé par la même personne, du rotor à la glace. Six semaines séparent la commande de l’écrin.</p>
      </header>
      <div class="atelier__grand">
        ${visuel(estPresent('atelier-boucle') ? 'atelier-boucle' : 'atelier-etabli', { classe: 'atelier__visuel' })}
      </div>
      ${visuel('atelier-loupe', { classe: 'atelier__vignette' })}
      ${visuel('atelier-reglage', { classe: 'atelier__vignette' })}
    </div>
  </section>

  <section class="finale" data-finale aria-labelledby="finale-titre">
    <p class="geant finale__mot" aria-hidden="true">PRISME</p>
    <h2 class="finale__titre" id="finale-titre">Quatre matières, un seul Prisme.</h2>
    <ul class="finale__rang">
      ${FINITIONS_FINALE.map((f, i) => html`
      <li class="finale__place">
        <a class="finale__zone" href="montre/MOR-PR42-${f}" data-place="${i}">
          <span class="finale__vue" data-vue></span>
          <span class="finale__nom">${FINISHES[f].nom}</span>
          <span class="finale__prix num">${formatPrice(PR.base[f])}</span>
          <span class="finale__choisir" aria-hidden="true">Choisir</span>
        </a>
      </li>`)}
    </ul>
  </section>
  ${footer()}`;
}

export default {
  title: () => 'Maison horlogère',
  pose: 'accueil',
  config: () => defaultConfig('PR42', 'AC'),
  render: () => ({
    page: renderAccueil(),
    avant: html`
      <div class="avant-hero" data-avant-hero aria-hidden="true"><p class="geant geant--plein">MORION</p></div>
      ${renderPieces()}`,
  }),

  mount({ el, front, app }) {
    const offs = [];
    const gsap = window.gsap;
    const d = app.director;
    const etroit = window.innerWidth < 720;
    const P = etroit ? POSES_ACCUEIL.etroit : POSES_ACCUEIL.large;
    const depart = (etroit ? POSES_ETROIT : POSES).accueil;
    const $ = (s) => el.querySelector(s);

    facette = prepareFacette($('h1'), { reduced: app.reduced });
    offs.push(mountFooter(el));
    const atelier = monterAtelier(el, app);
    offs.push(atelier.dispose);

    // Finale : quatre Prisme construits au repos (précompilés : ils compilent aussi les matières
    // or et céramique que la montre du directeur prendra dans les chapitres).
    const vitrine = app.stage ? createVitrine(app.stage) : null;
    offs.push(() => vitrine?.dispose());
    offs.push(monterFinale(el, app, vitrine));

    if (app.reduced || !d.watch) {
      offs.push(reduit(el, front, app, P, depart, etroit));
      return () => { offs.forEach((f) => f()); facette?.revert(); };
    }

    const { ScrollTrigger } = window;
    const couloir = createCouloir(app.stage);
    offs.push(() => couloir.dispose());
    const pieces = createPieces(front.querySelector('[data-pieces]'), {
      stage: app.stage, director: d, etroit, compteur: $('.assemblage__compteur'),
    });
    offs.push(() => pieces.dispose());

    // Écrit la pose de la montre du directeur (tue tout voyage en cours) : k et visible compris.
    const poser = (etat) => {
      d.to({ k: 1, visible: 1, eclate: 0, ...etat }, { immediate: true });
      vitrine?.solo(null);
    };
    // Chapitres et seuil : un des quatre Prisme de la vitrine, déjà construits et compilés ; la
    // matière change par échange de visibilité (aucune reconstruction pendant le défilement).
    // Tant que la vitrine n’est pas prête, la montre du directeur change de configuration.
    let vitrinePrete = false;
    vitrine?.pret.then(() => { vitrinePrete = true; });
    let montreChap = 0;
    const montrer = (etat) => {
      if (!vitrinePrete) { poser(etat); d.setConfig(cfgChap(montreChap)); return; }
      d.to({ ...etat, k: 0, visible: 0, eclate: 0 }, { immediate: true });
      vitrine.solo(montreChap, { ...etat, tiltX: d.tilt.rotation.x, tiltY: d.tilt.rotation.y });
    };
    const segments = [];
    let vivant = true;
    // quitter : remet les effets de page (jamais la pose) à l’état de bord quand le segment
    // cesse d’être actif, pour qu’un saut de défilement ne laisse rien à mi-course.
    const segment = (vars, ecrire, { config, quitter } = {}) => {
      const seg = { ecrire, config };
      seg.st = ScrollTrigger.create({
        ...vars,
        scrub: vars.scrub ?? true,
        onUpdate: (st) => { if (st.isActive) ecrire(st.progress); },
        onToggle: (st) => {
          // Bloc épinglé : rien ne défile sous la nav, son voile n’a pas lieu d’être.
          if (vars.pin) document.documentElement.classList.toggle('epingle', st.isActive);
          if (st.isActive && config) d.setConfig(config());
          if (!st.isActive) quitter?.(st.progress > 0.5 ? 1 : 0);
        },
      });
      segments.push(seg);
      return seg;
    };

    // 1. Hero : la montre pivote et passe derrière « MORION », que le calque avant remplit
    // par une facette à 60°, puis rejoint la pose d’assemblage.
    const hero = $('[data-hero]');
    const avantHero = front.querySelector('[data-avant-hero]');
    const motPlein = avantHero.querySelector('.geant--plein');
    const suivreHero = () => {
      const r = hero.getBoundingClientRect();
      avantHero.style.transform = `translate3d(0, ${r.top}px, 0)`;
      avantHero.style.visibility = r.bottom > 0 ? 'visible' : 'hidden';
    };
    offs.push(app.scroll.onScroll(suivreHero));
    suivreHero();
    // Épinglé : le texte s’efface, le mot se remplit, la montre pivote et passe derrière lui.
    const texteHero = [$('.hero-accueil__texte'), $('.hero-accueil__etiquette')];
    const effetsHero = (p) => {
      // Écran étroit : le mot court à la verticale le long du bord et ne croise pas le texte.
      const o = etroit ? 1 : 1 - pas(0, 0.3, p);
      texteHero.forEach((t) => { if (t) { t.style.opacity = o.toFixed(3); t.style.visibility = o < 0.01 ? 'hidden' : ''; } });
      // Bord de la facette : de la droite vers la gauche, incliné à 60°.
      const x = (1 - pas(0.22, 0.62, p)) * 130;
      motPlein.style.clipPath = `polygon(${x}% 0, 130% 0, 130% 100%, ${x - 30}% 100%)`;
    };
    segment({ trigger: hero, start: 'top top', end: '+=90%', pin: true }, (p) => {
      poser(melange(depart, P.milieu, gsap.parseEase('power2.inOut')(pas(0.05, 0.8, p))));
      effetsHero(p);
    }, { config: () => defaultConfig('PR42', 'AC'), quitter: effetsHero });
    // Sortie : le hero part vers le haut avec son mot ; la montre rejoint l’assemblage.
    segment({ trigger: $('[data-assemblage]'), start: 'top bottom', end: 'top top' }, (p) => {
      poser(melange(P.milieu, P.assemblage, gsap.parseEase('power2.inOut')(p)));
    }, { config: () => defaultConfig('PR42', 'AC') });

    // 2. Assemblage épinglé : éclaté complet, étiquettes, compteur, remontage.
    const compteur = $('[data-compteur]');
    const total = d.watch.userData.parts.size;
    $('[data-total]').textContent = String(total);
    const phase = $('[data-phase]');
    const PHASES = { demontage: 'Démontage', tenue: 'Toutes les pièces', remontage: 'Remontage' };
    segment({ trigger: $('[data-assemblage]'), start: 'top top', end: '+=250%', pin: true }, (p) => {
      const e = etapeAssemblage(p);
      poser({ ...P.assemblage, rotY: P.assemblage.rotY + (etroit ? 0 : (p - 0.5) * 0.3), eclate: e.eclate });
      compteur.textContent = String(Math.round(e.eclate * total)).padStart(2, '0');
      phase.textContent = PHASES[e.phase];
      pieces.maj(e.etiquettes);
    }, { config: () => defaultConfig('PR42', 'AC'), quitter: () => pieces.maj(0) });
    // Les étiquettes n’existent que pendant l’assemblage.
    offs.push(() => pieces.maj(0));

    // 3. Chapitres : entrée, puis bloc épinglé (4 aplats, bascules nettes).
    const blocChap = $('[data-chapitres]');
    const chapitres = [...el.querySelectorAll('[data-chapitre]')];
    const mots = chapitres.map((c) => {
      const t = splitWords(c.querySelector('.chapitre__titre'));
      const corps = splitWords(c.querySelector('.chapitre__corps'));
      return [...t.words, ...corps.words];
    });
    let actif = -1;
    let dansChap = false;
    const tour = { v: 0 };
    let tourTween = null;
    const cfgChap = (i) => defaultConfig('PR42', CHAPITRES[i].finition);
    const html0 = document.documentElement;
    const encre = (i) => {
      if (i < 0) { delete html0.dataset.chap; delete html0.dataset.encre; return; }
      html0.dataset.chap = CHAPITRES[i].finition.toLowerCase();
      if (['OJ', 'OR'].includes(CHAPITRES[i].finition)) html0.dataset.encre = 'sombre'; else delete html0.dataset.encre;
    };
    offs.push(() => encre(-1));
    const S = () => window.innerHeight / Math.tan(Math.PI / 3);
    const volet = (c, v) => {
      // v : 0 caché, 1 plein. Le bord du volet est incliné à 60°, comme une facette.
      const W = window.innerWidth;
      const x = (1 - v) * (W + S());
      c.style.clipPath = v >= 1 ? 'none' : `polygon(${x}px 0, ${W}px 0, ${W}px 100%, ${x - S()}px 100%)`;
    };
    gsap.set(mots.flat(), { yPercent: 105, xPercent: -18 });
    chapitres.forEach((c, i) => volet(c, i === 0 ? 1 : 0));
    function basculer(i) {
      const avant = actif;
      actif = i;
      if (dansChap) encre(i);
      chapitres.forEach((c, j) => { c.inert = j !== i; });
      if (avant >= 0) gsap.to(mots[avant], { yPercent: -105, xPercent: 18, duration: DUR.court * 0.7, ease: EASE.traverse, overwrite: true });
      if (i > avant && i > 0) {
        const c = chapitres[i];
        const o = { v: 0 };
        gsap.to(o, { v: 1, duration: DUR.moyen * 0.7, ease: 'power3.inOut', onUpdate: () => volet(c, o.v), overwrite: true });
      } else if (i < avant) {
        for (let j = avant; j > i; j -= 1) {
          const c = chapitres[j];
          const o = { v: 1 };
          gsap.to(o, { v: 0, duration: DUR.moyen * 0.6, ease: 'power3.inOut', onUpdate: () => volet(c, o.v), overwrite: true });
        }
      }
      gsap.fromTo(mots[i], { yPercent: 105, xPercent: -18 }, { yPercent: 0, xPercent: 0, duration: 0.45, ease: 'power4.out', stagger: 0.025, delay: 0.18, overwrite: true });
      // La montre fait un tour ; la matière change quand elle passe de profil (bascule cachée).
      if (avant >= 0) {
        tourTween?.kill();
        let change = false;
        const sens = i > avant ? 1 : -1;
        tour.v = 0;
        tourTween = gsap.to(tour, {
          v: sens, duration: DUR.moyen, ease: 'power3.inOut',
          onUpdate: () => {
            if (!change && Math.abs(tour.v) > 0.3) { change = true; montreChap = i; }
            ecrireChap(dernierP);
          },
          onComplete: () => { tour.v = 0; ecrireChap(dernierP); },
        });
      } else montreChap = i;
    }
    let dernierP = 0;
    const ecrireChap = (p) => {
      dernierP = p;
      const local = p * CHAPITRES.length - Math.max(0, actif);
      montrer({ ...P.chapitre, rotY: P.chapitre.rotY + (local - 0.5) * 0.5 + tour.v * Math.PI * 2 });
    };
    segment({ trigger: blocChap, start: 'top bottom', end: 'top top' }, (p) => {
      poser(melange({ ...P.assemblage }, P.chapitre, gsap.parseEase('power2.inOut')(p)));
    }, { config: () => defaultConfig('PR42', 'AC') });
    segment({ trigger: blocChap, start: 'top top', end: '+=300%', pin: true }, (p) => {
      const i = chapitreDe(p);
      if (i !== actif) basculer(i);
      ecrireChap(p);
    });
    // Hors des chapitres : encre normale.
    ScrollTrigger.create({
      trigger: blocChap, start: 'top top', end: '+=300%',
      onToggle: (st) => { dansChap = st.isActive; encre(dansChap ? actif : -1); },
    });
    const premierMot = ScrollTrigger.create({
      trigger: blocChap, start: 'top 60%',
      onEnter: () => { if (actif < 0) basculer(0); },
    });
    offs.push(() => premierMot.kill());

    // 4. Seuil : couloir d’arches ; la montre part devant et disparaît au point de fuite.
    const seuil = $('[data-seuil]');
    const texteSeuil = $('[data-seuil-texte]');
    const effetsSeuil = (p) => {
      const t = pas(0.62, 0.9, p);
      texteSeuil.style.opacity = t.toFixed(3);
      texteSeuil.style.transform = `translate3d(0, ${(1 - t) * 24}px, 0)`;
    };
    segment({ trigger: seuil, start: 'top bottom', end: 'top top' }, (p) => {
      montrer(melange({ ...P.chapitre }, P.seuil, gsap.parseEase('power2.inOut')(p)));
      couloir.avancer(0, pas(0.3, 1, p));
      texteSeuil.style.opacity = '0';
    });
    segment({ trigger: seuil, start: 'top top', end: '+=150%', pin: true }, (p) => {
      const fuite = gsap.parseEase('power2.in')(pas(0, 0.75, p));
      montrer({ ...P.seuil, taille: P.seuil.taille * (1 - fuite * 0.93) * (1 - pas(0.6, 0.78, p)), y: P.seuil.y * (1 - fuite) });
      // Au bout du couloir, les arches s’estompent : le texte reste seul.
      couloir.avancer(p, 1 - 0.65 * pas(0.62, 0.9, p));
      effetsSeuil(p);
    }, { quitter: effetsSeuil });
    // Le couloir éclaire le haut de l'écran : la nav remonte son encre secondaire, comme sur
    // l'aplat acier, sinon « Collection » et « Composer » se perdent dans les filets.
    const stCouloir = ScrollTrigger.create({
      trigger: seuil, start: 'top bottom', end: '+=250%',
      onToggle: (st) => {
        html0.classList.toggle('couloir', st.isActive);
        if (!st.isActive) couloir.afficher(false);
      },
    });
    offs.push(() => { stCouloir.kill(); html0.classList.remove('couloir'); });

    // 5. Atelier : la montre est accrochée à son bloc (elle arrive, se tient et repart avec lui) ;
    // sur écran étroit le bloc dépasse l’écran, les zones ne passent donc jamais sous elle.
    const blocAtelier = $('[data-atelier]');
    const configAtelier = $('[data-atelier-config]');
    const photos = $('[data-atelier-photos]');
    const kAtelier = { ...P.atelier };
    const yBloc = () => kAtelier.y - (2 * configAtelier.getBoundingClientRect().top) / window.innerHeight;
    segment({ trigger: blocAtelier, start: 'top bottom', end: 'top top' }, (p) => {
      poser({ ...kAtelier, y: yBloc(), k: gsap.parseEase('power2.out')(pas(0.2, 1, p)) });
    }, { config: () => atelier.config() });
    // Le bloc de composition fait exactement un écran : « blocAtelier top top » et « photos top
    // bottom » tombent au même défilement. La tenue prendrait une longueur nulle, aucun segment
    // ne serait actif à ce pixel et la montre du temps précédent resterait à l’écran. La tenue
    // court donc jusqu’à ce que les photos soient à mi-écran.
    segment({ trigger: blocAtelier, start: 'top top', endTrigger: photos, end: 'top 45%' }, () => {
      poser({ ...kAtelier, y: yBloc() });
    }, { config: () => atelier.config() });
    segment({ trigger: photos, start: 'top 45%', end: 'top 5%' }, (p) => {
      poser({ ...kAtelier, y: yBloc(), k: 1 - gsap.parseEase('power2.in')(p) });
    });
    // 6. Au-delà : la montre du directeur s’est retirée ; la finale a ses quatre Prisme.
    segment({ trigger: photos, start: 'top 5%', endTrigger: el, end: 'bottom bottom' }, () => {
      poser({ ...kAtelier, k: 0, visible: 0 });
    });

    // Un ScrollTrigger n’est jamais actif sur sa propre borne : un défilement qui s’arrête pile
    // dessus ne serait écrit par personne et la montre garderait la pose de mi-course. Les
    // segments étant contigus, on écrit alors l’état de bord du segment le plus proche.
    const rattraper = () => {
      if (!vivant || segments.some((s) => s.st.isActive)) return;
      const y = window.scrollY;
      let proche = null;
      let ecart = 3; // pixels : au-delà, on est hors de la chorégraphie (pied de page)
      segments.forEach((s) => {
        [[s.st.start, 0], [s.st.end, 1]].forEach(([borne, bord]) => {
          const d = Math.abs(y - borne);
          if (d <= ecart) { ecart = d; proche = { s, bord }; }
        });
      });
      proche?.s.ecrire(proche.bord);
    };
    offs.push(app.scroll.onScroll(rattraper));

    // Retour sur la page avec un défilement restauré : le segment actif reprend la main.
    entrer = () => {
      const s = segments.find((x) => x.st.isActive);
      if (s && window.scrollY > 10) s.ecrire(s.st.progress);
      else rattraper();
    };
    return () => {
      vivant = false; // plus aucune pose écrite pendant le démontage des segments
      offs.forEach((f) => f());
      document.documentElement.classList.remove('epingle');
      facette?.revert();
      entrer = null;
    };
  },
  enter() {
    facette?.play();
    entrer?.();
  },
};

// Atelier express : trois zones branchées sur la montre, prix et lien vers l’atelier complet.
function monterAtelier(el, app) {
  const form = el.querySelector('[data-atelier-zones]');
  const prix = el.querySelector('[data-atelier-prix]');
  const lien = el.querySelector('[data-atelier-lien]');
  const config = () => {
    const fd = new FormData(form);
    const c = defaultConfig('PR42', fd.get('matiere') || 'AC');
    c.dialColor = fd.get('cadran') || c.dialColor;
    c.strap = fd.get('bracelet') || c.strap;
    c.strapColor = 'noir';
    return c;
  };
  const maj = () => {
    const c = config();
    prix.textContent = formatPrice(price(c).total);
    lien.href = `montre/MOR-PR42-${c.case}?c=${encode(c)}`;
    // Seulement si la montre est à l’atelier (sinon elle porte un autre temps de la page).
    const r = el.querySelector('[data-atelier-config]').getBoundingClientRect();
    if (r.top < window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.4) app.director.setConfig(c);
  };
  form.addEventListener('change', maj);
  return { config, dispose: () => form.removeEventListener('change', maj) };
}

// Finale : les quatre Prisme sur leurs places ; survol ou focus = la montre pivote et s’avance.
function monterFinale(el, app, vitrine) {
  const finale = el.querySelector('[data-finale]');
  const zones = [...finale.querySelectorAll('[data-place]')];
  if (!vitrine) return () => {};
  const gsap = window.gsap;
  let visible = false;
  const placer = () => {
    if (!visible) return;
    vitrine.montres.forEach((m, i) => {
      const vue = zones[i]?.querySelector('[data-vue]');
      if (!vue) return;
      const r = vue.getBoundingClientRect();
      m.etat.x = ((r.left + r.width / 2) / window.innerWidth) * 2 - 1;
      m.etat.y = 1 - ((r.top + r.height / 2) / window.innerHeight) * 2;
      m.etat.taille = (r.height / window.innerHeight) * 0.5;
      vitrine.placer(m);
    });
  };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    vitrine.pret.then(() => {
      // Les chapitres et le seuil ont pu tourner ces montres : chacune reprend sa place au rang.
      if (visible) vitrine.montres.forEach((m, i) => {
        if (!zones[i]?.classList.contains('choisie')) Object.assign(m.etat, { rotX: 0.12, rotY: -0.45, avance: 0 });
        Object.assign(m.etat, { tiltX: 0, tiltY: 0 });
      });
      vitrine.finale(visible);
      placer();
    });
  }, { rootMargin: '10% 0px' });
  io.observe(finale);
  const offScroll = app.scroll.onScroll(placer);
  const onResize = () => placer();
  window.addEventListener('resize', onResize);

  const choisir = (i, on) => {
    const m = vitrine.montres[i];
    zones.forEach((z, j) => z.classList.toggle('choisie', on && j === i));
    if (!m || app.reduced) return;
    gsap.to(m.etat, {
      rotY: on ? 0.28 : -0.45, rotX: on ? 0.05 : 0.12, avance: on ? 1 : 0,
      duration: on ? DUR.moyen * 0.8 : DUR.court, ease: on ? EASE.sortie : EASE.traverse, overwrite: true,
      onUpdate: () => vitrine.placer(m),
    });
  };
  const handlers = zones.map((z, i) => {
    const on = () => choisir(i, true);
    const off = () => choisir(i, false);
    z.addEventListener('pointerenter', on);
    z.addEventListener('pointerleave', off);
    z.addEventListener('focus', on);
    z.addEventListener('blur', off);
    return () => {
      z.removeEventListener('pointerenter', on);
      z.removeEventListener('pointerleave', off);
      z.removeEventListener('focus', on);
      z.removeEventListener('blur', off);
    };
  });
  return () => {
    io.disconnect();
    offScroll();
    window.removeEventListener('resize', onResize);
    handlers.forEach((f) => f());
  };
}

// Mouvement réduit : ni épinglage ni défilement lié. La montre prend la pose de la section la
// plus visible (accueil ou atelier), sinon elle se retire ; tout le reste est statique.
function reduit(el, front, app, P, depart, etroit) {
  const d = app.director;
  const pieces = d.watch ? createPieces(front.querySelector('[data-pieces]'), { stage: app.stage, director: d, etroit }) : null;
  // Les aplats des chapitres comptent chacun pour eux : l’encre de la nav suit celui qu’on lit.
  const sections = [...el.querySelectorAll('section:not([data-chapitres]), [data-chapitre]')];
  const html0 = document.documentElement;
  const vis = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => vis.set(e.target, e.intersectionRatio));
    let best = null;
    let r = 0;
    vis.forEach((ratio, s) => { if (ratio > r) { r = ratio; best = s; } });
    const pose = best?.dataset.poseReduite;
    if (pose === 'accueil') d.to({ ...depart, k: 1, visible: 1, eclate: 0 }, { immediate: true });
    else if (pose === 'assemblage') d.to({ ...P.assemblage, k: 1, visible: 1, eclate: 0.85 }, { immediate: true });
    else if (pose === 'atelier') d.to({ ...P.atelier, k: 1, visible: 1, eclate: 0 }, { immediate: true });
    else d.to({ k: 0, visible: 0 }, { immediate: true });
    // Étiquettes posées une fois sur l’éclaté fixe.
    pieces?.maj(pose === 'assemblage' ? 1 : 0);
    const chap = best?.dataset.chapitre !== undefined ? CHAPITRES[Number(best.dataset.chapitre)].finition : null;
    if (chap) {
      html0.dataset.chap = chap.toLowerCase();
      if (['OJ', 'OR'].includes(chap)) html0.dataset.encre = 'sombre'; else delete html0.dataset.encre;
    } else { delete html0.dataset.chap; delete html0.dataset.encre; }
  }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
  sections.forEach((s) => io.observe(s));
  document.documentElement.classList.add('accueil-reduit');
  const total = d.watch?.userData.parts.size;
  if (total) {
    el.querySelector('[data-compteur]').textContent = String(total);
    el.querySelector('[data-total]').textContent = String(total);
  }
  return () => {
    io.disconnect(); pieces?.maj(0); pieces?.dispose();
    html0.classList.remove('accueil-reduit');
    delete html0.dataset.chap; delete html0.dataset.encre;
  };
}
