import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultConfig, normalize, encode, decode, price } from '../js/store/config.js';
import { REFERENCES } from '../js/data/catalogue.js';

test('12 références', () => assert.equal(REFERENCES.length, 12));

test('Monolithe acier par défaut sans option payante', () => {
  const c = { ...defaultConfig('MO39', 'AC'), dialPattern: 'soleil', strap: 'caoutchouc' };
  assert.equal(price(c).total, 11900);
});

test('Prisme or rose tout or gravé = 59 750', () => {
  const c = { ...defaultConfig('PR42', 'OR'), dialPattern: 'tapisserie', hands: 'or', strap: 'metal', engraving: 'A. M. 2026' };
  assert.equal(price(c).total, 59750);
});

test('Abysse céramique, lunette or, tapisserie, cuir = 26 650', () => {
  const c = { ...defaultConfig('AB41', 'CN'), bezel: 'OJ', dialPattern: 'tapisserie', hands: 'lume', strap: 'cuir', strapColor: 'cognac' };
  assert.equal(price(c).total, 26650);
});

test('lunette céramique sur acier +1 200, acier sur or 0', () => {
  const base = { ...defaultConfig('AB41', 'AC'), dialPattern: 'soleil', strap: 'caoutchouc', hands: 'lume' };
  assert.equal(price({ ...base, bezel: 'CN' }).total, 14500 + 1200);
  const gold = { ...defaultConfig('AB41', 'OJ'), dialPattern: 'soleil', strap: 'caoutchouc', hands: 'lume' };
  assert.equal(price({ ...gold, bezel: 'AC' }).total, 39800);
});

test('aller-retour encode/decode, gravure accentuée comprise', () => {
  const c = { ...defaultConfig('PR42', 'AC'), engraving: 'Élodie ♥ 12.09' };
  assert.deepEqual(decode(encode(c)), c);
});

test('code invalide → null ; valeurs inconnues normalisées', () => {
  assert.equal(decode('n-importe-quoi'), null);
  assert.equal(normalize({ family: 'PR42', case: 'XX' }).case, 'AC');
});

test('gravure tronquée à 24 caractères', () => {
  assert.equal(normalize({ family: 'MO39', engraving: 'x'.repeat(40) }).engraving.length, 24);
});

test('coloris de bracelet cohérent avec le type', () => {
  const c = normalize({ family: 'AB41', strap: 'cuir', strapColor: 'orange' });
  assert.equal(c.strapColor, 'noir');
});

test('le prix détaille chaque option payante', () => {
  const c = { ...defaultConfig('PR42', 'AC'), engraving: 'M' };
  const { lines, total } = price(c);
  assert.equal(lines.reduce((s, l) => s + l.amount, 0), total);
  assert.ok(lines.some((l) => l.label.includes('Gravure')));
});
