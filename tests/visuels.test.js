import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { VISUELS } from '../js/data/visuels.js';
import { PRESENTS } from '../js/data/visuels-presents.js';

const doc = readFileSync(new URL('../docs/IMAGES.md', import.meta.url), 'utf8');

test('chaque emplacement a son bloc et son fichier dans IMAGES.md', () => {
  for (const [id, v] of Object.entries(VISUELS)) {
    assert.ok(doc.includes(v.fichier), `fichier ${v.fichier}`);
    if (v.priorite !== 'produit') assert.ok(doc.includes(` · ${id} · `), `bloc ${id}`);
  }
});

test('chaque fichier cité dans IMAGES.md est un emplacement du site', () => {
  const files = [...doc.matchAll(/`((?:img|video)\/[a-z0-9-]+\.(?:jpg|mp4))`/g)].map((m) => m[1]);
  const known = new Set(Object.values(VISUELS).map((v) => v.fichier));
  for (const f of files) assert.ok(known.has(f), f);
});

test('le nom de fichier est la clé de l\'emplacement', () => {
  for (const [id, v] of Object.entries(VISUELS)) {
    assert.equal(v.fichier.replace(/^(img|video)\//, '').replace(/\.[a-z0-9]+$/, ''), id);
  }
});

test('un visuel présent existe sur le disque', () => {
  for (const chemin of Object.values(PRESENTS)) {
    assert.ok(existsSync(new URL(`../${chemin}`, import.meta.url)), chemin);
  }
});
