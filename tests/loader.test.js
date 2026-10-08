import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLoadTracker, introCounter } from '../js/core/loader.js';

test('progression pondérée', async () => {
  const t = createLoadTracker();
  let ok1;
  let ok2;
  const p1 = t.track(new Promise((r) => { ok1 = r; }), 3);
  t.track(new Promise((r) => { ok2 = r; }), 1);
  assert.equal(t.progress(), 0);
  ok1();
  await p1;
  assert.equal(t.progress(), 0.75);
  ok2();
  await t.done();
  assert.equal(t.progress(), 1);
});

test('une tâche en échec ne bloque pas le chargement', async () => {
  const t = createLoadTracker();
  t.track(Promise.reject(new Error('police')), 1);
  await t.done();
  assert.equal(t.progress(), 1);
  assert.equal(t.errors().length, 1);
});

test('compteur : jamais au-dessus du chargement réel, 100 seulement à la fin', () => {
  assert.equal(introCounter(10, 0.4), 40);
  assert.ok(introCounter(0.2, 1) < 100);
  assert.equal(introCounter(1.6, 1), 100);
  let prev = 0;
  for (let s = 0; s <= 2; s += 0.05) {
    const v = introCounter(s, Math.min(1, s));
    assert.ok(v >= prev, `recul à ${s}`);
    prev = v;
  }
});
