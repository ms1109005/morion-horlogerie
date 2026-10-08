import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCart, CART_KEY } from '../js/store/cart.js';
import { defaultConfig, encode, price } from '../js/store/config.js';

const memoire = (init = {}) => {
  const m = new Map(Object.entries(init));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
};
const code = encode(defaultConfig('PR42', 'AC'));
const avec = (lignes) => memoire({ [CART_KEY]: JSON.stringify({ v: 1, lignes }) });

test('panier vide par défaut', () => {
  const c = createCart(memoire());
  assert.equal(c.count(), 0);
  assert.deepEqual(c.items(), []);
});

test('relit le panier enregistré', () => {
  assert.equal(createCart(avec([{ id: 'a', code, qty: 1 }, { id: 'b', code, qty: 2 }])).count(), 3);
});

test('lignes invalides écartées', () => {
  assert.equal(createCart(avec([{ id: 'x', code: 'n-importe-quoi', qty: 1 }, { id: 'y', code, qty: 0 }])).count(), 0);
});

test('données corrompues ou stockage bloqué : panier vide, sans exception', () => {
  assert.equal(createCart(memoire({ [CART_KEY]: '{oups' })).count(), 0);
  const bloque = { getItem() { throw new Error('bloqué'); }, setItem() { throw new Error('bloqué'); } };
  const c = createCart(bloque);
  assert.equal(c.count(), 0);
  assert.doesNotThrow(() => c.clear());
});

const cfgA = defaultConfig('MO39', 'AC');
const cfgB = { ...defaultConfig('PR42', 'OR'), engraving: 'A. M. 2026' };

test('ajout, fusion d\'une configuration identique, total', () => {
  const c = createCart(memoire());
  const id = c.add(cfgA);
  assert.equal(c.add(cfgA), id);
  c.add(cfgB);
  assert.equal(c.count(), 3);
  assert.equal(c.total(), price(cfgA).total * 2 + price(cfgB).total);
  assert.equal(c.lines()[0].unit, price(cfgA).total);
  assert.equal(c.lines()[0].sum, price(cfgA).total * 2);
});

test('quantité bornée de 1 à 9', () => {
  const c = createCart(memoire());
  const id = c.add(cfgA);
  c.setQty(id, 12);
  assert.equal(c.count(), 9);
  c.setQty(id, 0);
  assert.equal(c.count(), 1);
});

test('suppression puis annulation à la même place', () => {
  const c = createCart(memoire());
  const a = c.add(cfgA);
  c.add(cfgB);
  const undo = c.remove(a);
  assert.equal(c.items().length, 1);
  undo();
  assert.equal(c.items()[0].id, a);
  assert.equal(c.items().length, 2);
});

test('persistance et relecture, vignette comprise', () => {
  const s = memoire();
  createCart(s).add(cfgB, { image: 'data:image/webp;base64,AAAA' });
  const l = createCart(s).lines()[0];
  assert.equal(l.config.engraving, 'A. M. 2026');
  assert.equal(l.image, 'data:image/webp;base64,AAAA');
});

test('abonnement notifié au vidage, puis désabonnement', () => {
  const c = createCart(avec([{ id: 'a', code, qty: 1 }]));
  let n = 0;
  const off = c.subscribe(() => { n += 1; });
  c.clear();
  assert.equal(n, 1);
  assert.equal(c.count(), 0);
  off();
  c.clear();
  assert.equal(n, 1);
});
