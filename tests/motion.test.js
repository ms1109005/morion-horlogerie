import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DUR, EASE, EASE_CSS } from '../js/core/motion.js';

const css = readFileSync(new URL('../css/tokens.css', import.meta.url), 'utf8');
const flat = (s) => s.replace(/\s+/g, '');

test('chaque durée JS existe dans tokens.css, en ms', () => {
  for (const [k, s] of Object.entries(DUR)) {
    const m = css.match(new RegExp(`--dur-${k}:\\s*(\\d+)ms`));
    assert.ok(m, `--dur-${k} absent de tokens.css`);
    assert.equal(Number(m[1]), Math.round(s * 1000), k);
  }
});

test('chaque courbe JS existe dans tokens.css, à l\'identique', () => {
  for (const [k, v] of Object.entries(EASE_CSS)) {
    const m = css.match(new RegExp(`--ease-${k}:\\s*([^;]+);`));
    assert.ok(m, `--ease-${k} absent de tokens.css`);
    assert.equal(flat(m[1]), flat(v), k);
  }
});

test('registre sobre : power2 à power4 ou none, aucun rebond', () => {
  assert.deepEqual(Object.keys(EASE), Object.keys(EASE_CSS));
  for (const e of Object.values(EASE)) assert.match(e, /^(power[234]\.(out|inOut)|none)$/, e);
});
