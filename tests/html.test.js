import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import vm from 'node:vm';
import { ROUTE_SEGMENT } from '../js/core/routes.js';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const index = read('index.html');

test('404.html est une copie exacte d\'index.html', () => assert.equal(read('404.html'), index));

test('three 0.186.0 figé dans l\'importmap', () => {
  assert.match(index, /"three":\s*"https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.186\.0\/build\/three\.module\.js"/);
  assert.match(index, /"three\/addons\/":\s*"https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.186\.0\/examples\/jsm\/"/);
});

test('scripts CDN avec SRI : GSAP 3.12.5, ScrollTrigger, Lenis', () => {
  const tags = index.match(/<script[^>]+src="https:[^"]+"[^>]*>/g) || [];
  assert.equal(tags.length, 3);
  for (const t of tags) {
    assert.match(t, /integrity="sha384-[A-Za-z0-9+/=]+"/, t);
    assert.match(t, /crossorigin="anonymous"/, t);
    assert.match(t, /\sdefer[\s>]/, t);
  }
  assert.match(index, /gsap\/3\.12\.5\/gsap\.min\.js/);
  assert.match(index, /lenis@1\.3\.17/);
});

test('le script de racine pose <base> comme siteRoot()', () => {
  const src = index.match(/<script id="racine">([\s\S]*?)<\/script>/)[1];
  assert.ok(src.includes(ROUTE_SEGMENT.source), 'même expression que routes.js');
  const cas = [['/', '/'], ['/montre/MOR-PR42-AC', '/'], ['/p/morion/collection', '/p/morion/'], ['/p/morion/', '/p/morion/']];
  for (const [path, root] of cas) {
    let base = null;
    const document = {
      createElement: () => ({}),
      head: { appendChild: (el) => { base = el; } },
      documentElement: { classList: { replace() {}, add() {} } },
    };
    vm.runInNewContext(src, { location: { pathname: path, search: '' }, document, sessionStorage: { getItem: () => null }, matchMedia: () => ({ matches: false }) });
    assert.equal(base.href, root, path);
  }
});

test('aucun tiret cadratin dans les textes du site', () => {
  const walk = (d) => readdirSync(new URL(`../${d}`, import.meta.url)).flatMap((f) => {
    const p = `${d}/${f}`;
    return statSync(new URL(`../${p}`, import.meta.url)).isDirectory() ? walk(p) : [p];
  });
  const files = ['index.html', ...['js/core', 'js/ui', 'js/pages', 'js/data', 'js/stage', 'css'].flatMap(walk)];
  for (const f of files) assert.ok(!/[—]/.test(read(f)), f);
});
