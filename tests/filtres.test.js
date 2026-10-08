import { test } from 'node:test';
import assert from 'node:assert/strict';
import { REFERENCES } from '../js/data/catalogue.js';
import { filtrer, trier, prixDepart, lireFiltres, ecrireFiltres, pistes, FILTRES_VIDES } from '../js/data/filtres.js';

test('sans filtre : les 12 références', () => {
  assert.equal(filtrer(REFERENCES, FILTRES_VIDES).length, 12);
});

test('filtres par famille, matière, diamètre', () => {
  assert.equal(filtrer(REFERENCES, { ...FILTRES_VIDES, familles: ['PR42'] }).length, 4);
  assert.equal(filtrer(REFERENCES, { ...FILTRES_VIDES, matieres: ['OJ', 'OR'] }).length, 6);
  assert.equal(filtrer(REFERENCES, { ...FILTRES_VIDES, diametres: [39] }).length, 4);
});

test('tranche de prix de départ', () => {
  const r = filtrer(REFERENCES, { ...FILTRES_VIDES, tranches: ['moins-20'] });
  assert.deepEqual(r.map((x) => x.ref).sort(), ['MOR-AB41-AC', 'MOR-AB41-CN', 'MOR-MO39-AC', 'MOR-MO39-CN', 'MOR-PR42-AC']);
  assert.equal(filtrer(REFERENCES, { ...FILTRES_VIDES, familles: ['PR42'], tranches: ['moins-20'] }).length, 1);
});

test('aucun résultat possible', () => {
  assert.equal(filtrer(REFERENCES, { ...FILTRES_VIDES, familles: ['MO39'], tranches: ['plus-40'] }).length, 0);
});

test('tri par prix et par famille', () => {
  const asc = trier(REFERENCES, 'prix-croissant');
  assert.equal(asc[0].ref, 'MOR-MO39-AC');
  assert.equal(asc.at(-1).ref, 'MOR-PR42-OR');
  assert.equal(trier(REFERENCES, 'prix-decroissant')[0].ref, 'MOR-PR42-OR');
  assert.equal(prixDepart(asc[0]), 11900);
  assert.deepEqual(trier(REFERENCES, 'famille').slice(0, 4).map((r) => r.family), ['PR42', 'PR42', 'PR42', 'PR42']);
});

test('filtres dans l\'URL, aller-retour', () => {
  const f = { familles: ['PR42', 'AB41'], matieres: ['CN'], diametres: [42], tranches: ['20-40'], tri: 'prix-croissant' };
  const sp = ecrireFiltres(f);
  assert.deepEqual(lireFiltres(new URLSearchParams(sp.toString())), f);
  assert.deepEqual(lireFiltres(new URLSearchParams('famille=XX&tri=n-importe')), { ...FILTRES_VIDES });
});

test('état vide : pistes en retirant un groupe de filtres', () => {
  const f = { ...FILTRES_VIDES, familles: ['AB41'], matieres: ['OJ'], tranches: ['moins-20'] };
  assert.equal(filtrer(REFERENCES, f).length, 0);
  const p = pistes(REFERENCES, f);
  // Retirer le prix rend l'Abysse or jaune ; retirer la matière rend les deux Abysse sous 20 000 €.
  assert.deepEqual(p.map((x) => [x.groupe, x.compte]), [['matieres', 2], ['tranches', 1]]);
  assert.equal(p[0].legende, 'Matière');
  assert.deepEqual(pistes(REFERENCES, FILTRES_VIDES), []);
});
