// Filtres et tri de la grille de la collection. Pur : testé sous Node.
import { FAMILIES, FINISHES } from './catalogue.js';

export const TRANCHES = [
  { id: 'moins-20', nom: 'Moins de 20 000 €', min: 0, max: 20000 },
  { id: '20-40', nom: '20 000 à 40 000 €', min: 20000, max: 40000 },
  { id: 'plus-40', nom: 'Plus de 40 000 €', min: 40000, max: Infinity },
];
export const TRIS = {
  famille: 'Par famille',
  'prix-croissant': 'Prix croissant',
  'prix-decroissant': 'Prix décroissant',
};
export const DIAMETRES = [...new Set(Object.values(FAMILIES).map((f) => f.diametre))].sort((a, b) => a - b);
export const FILTRES_VIDES = { familles: [], matieres: [], diametres: [], tranches: [], tri: 'famille' };

const ORDRE = Object.keys(FAMILIES);
// Prix de départ d’une référence : tête de montre et bracelet caoutchouc.
export const prixDepart = (r) => FAMILIES[r.family].base[r.finish];

export function filtrer(refs, f) {
  return refs.filter((r) => {
    if (f.familles.length && !f.familles.includes(r.family)) return false;
    if (f.matieres.length && !f.matieres.includes(r.finish)) return false;
    if (f.diametres.length && !f.diametres.includes(FAMILIES[r.family].diametre)) return false;
    if (f.tranches.length) {
      const p = prixDepart(r);
      if (!TRANCHES.some((t) => f.tranches.includes(t.id) && p >= t.min && p < t.max)) return false;
    }
    return true;
  });
}

export function trier(refs, tri) {
  const out = [...refs];
  if (tri === 'prix-croissant') out.sort((a, b) => prixDepart(a) - prixDepart(b));
  else if (tri === 'prix-decroissant') out.sort((a, b) => prixDepart(b) - prixDepart(a));
  else out.sort((a, b) => ORDRE.indexOf(a.family) - ORDRE.indexOf(b.family) || prixDepart(a) - prixDepart(b));
  return out;
}

// URL : ?famille=PR42,AB41&matiere=CN&diametre=42&prix=20-40&tri=prix-croissant
const liste = (sp, cle, valides, conv = (x) => x) => (sp.get(cle) || '').split(',').filter(Boolean).map(conv).filter((v) => valides.includes(v));

export function lireFiltres(sp) {
  return {
    familles: liste(sp, 'famille', ORDRE),
    matieres: liste(sp, 'matiere', Object.keys(FINISHES)),
    diametres: liste(sp, 'diametre', DIAMETRES, Number),
    tranches: liste(sp, 'prix', TRANCHES.map((t) => t.id)),
    tri: TRIS[sp.get('tri')] ? sp.get('tri') : 'famille',
  };
}

export function ecrireFiltres(f, base = new URLSearchParams()) {
  const sp = new URLSearchParams(base);
  const set = (cle, v) => { if (v.length) sp.set(cle, v.join(',')); else sp.delete(cle); };
  set('famille', f.familles);
  set('matiere', f.matieres);
  set('diametre', f.diametres);
  set('prix', f.tranches);
  if (f.tri && f.tri !== 'famille') sp.set('tri', f.tri); else sp.delete('tri');
  return sp;
}

// État vide : pour chaque groupe coché, ce que rendrait la grille sans lui (les plus utiles d’abord).
const GROUPES = { familles: 'Famille', matieres: 'Matière', diametres: 'Diamètre', tranches: 'Prix de départ' };
export function pistes(refs, f) {
  return Object.entries(GROUPES)
    .filter(([g]) => f[g].length)
    .map(([groupe, legende]) => ({ groupe, legende, compte: filtrer(refs, { ...f, [groupe]: [] }).length }))
    .filter((p) => p.compte > 0)
    .sort((a, b) => b.compte - a.compte);
}
