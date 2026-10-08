import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FINISHES } from '../js/data/catalogue.js';
import { PIECES, CHAPITRES, etapeAssemblage, chapitreDe } from '../js/data/pieces.js';

test('pièces étiquetées : 9, identifiants uniques, fiches courtes, sans tiret long', () => {
  assert.equal(PIECES.length, 9);
  assert.equal(new Set(PIECES.map((p) => p.id)).size, 9);
  PIECES.forEach((p) => {
    assert.ok(p.nom && p.fiche, p.id);
    assert.ok(p.fiche.length <= 160, `${p.id} : fiche trop longue`);
    assert.ok(!/[—–]/.test(p.nom + p.fiche), `${p.id} : tiret long`);
  });
});

test('chapitres : les 4 finitions dans l\'ordre, un visuel matière chacun', () => {
  assert.deepEqual(CHAPITRES.map((c) => c.finition), Object.keys(FINISHES));
  CHAPITRES.forEach((c) => {
    assert.match(c.visuel, /^matiere-/);
    assert.ok(!/[—–]/.test(c.titre + c.texte));
  });
});

test('chapitre selon la progression du bloc épinglé', () => {
  assert.equal(chapitreDe(0), 0);
  assert.equal(chapitreDe(0.24), 0);
  assert.equal(chapitreDe(0.25), 1);
  assert.equal(chapitreDe(0.74), 2);
  assert.equal(chapitreDe(1), 3);
});

test('assemblage : démontage, tenue, remontage', () => {
  assert.equal(etapeAssemblage(0).eclate, 0);
  assert.equal(etapeAssemblage(0.55).eclate, 1);
  assert.equal(etapeAssemblage(1).eclate, 0);
  assert.equal(etapeAssemblage(0.3).phase, 'demontage');
  assert.equal(etapeAssemblage(0.55).phase, 'tenue');
  assert.equal(etapeAssemblage(0.8).phase, 'remontage');
  // Étiquettes seulement quand les pièces sont écartées.
  assert.equal(etapeAssemblage(0.1).etiquettes, 0);
  assert.equal(etapeAssemblage(0.55).etiquettes, 1);
  // Monotone à l'aller.
  let avant = -1;
  for (let p = 0; p <= 0.5; p += 0.05) {
    const e = etapeAssemblage(p).eclate;
    assert.ok(e >= avant);
    avant = e;
  }
});
