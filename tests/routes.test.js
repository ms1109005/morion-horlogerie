import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchRoute, siteRoot, toRoutePath, shouldIntercept } from '../js/core/routes.js';

test('routes connues', () => {
  assert.deepEqual(matchRoute('/'), { name: 'accueil', params: {} });
  assert.deepEqual(matchRoute('/collection'), { name: 'collection', params: {} });
  assert.deepEqual(matchRoute('/collection/'), { name: 'collection', params: {} });
  assert.deepEqual(matchRoute('/montre/MOR-PR42-OR'), { name: 'montre', params: { ref: 'MOR-PR42-OR' } });
  assert.deepEqual(matchRoute('/commande'), { name: 'commande', params: {} });
  assert.deepEqual(matchRoute('/commande/merci'), { name: 'merci', params: {} });
});

test('référence ou chemin inconnus → introuvable', () => {
  for (const p of ['/montre/MOR-XX99-AC', '/montre/mor-pr42-or', '/boutique', '/collection/extra', '/commande/merci/2']) {
    assert.equal(matchRoute(p).name, 'introuvable', p);
  }
});

test('racine du site, à la racine du domaine ou dans un sous-dossier', () => {
  assert.equal(siteRoot('/'), '/');
  assert.equal(siteRoot('/montre/MOR-PR42-AC'), '/');
  assert.equal(siteRoot('/commande/merci'), '/');
  assert.equal(siteRoot('/portfolio/morion/'), '/portfolio/morion/');
  assert.equal(siteRoot('/portfolio/morion/index.html'), '/portfolio/morion/');
  assert.equal(siteRoot('/portfolio/morion/collection'), '/portfolio/morion/');
  assert.equal(siteRoot('/portfolio/morion/montre/MOR-AB41-OJ'), '/portfolio/morion/');
});

test('chemin de route relatif à la racine', () => {
  assert.equal(toRoutePath('/portfolio/morion/collection', '/portfolio/morion/'), '/collection');
  assert.equal(toRoutePath('/portfolio/morion/', '/portfolio/morion/'), '/');
  assert.equal(toRoutePath('/portfolio/morion/index.html', '/portfolio/morion/'), '/');
});

test('liens interceptés par le routeur', () => {
  const ctx = { origin: 'http://s', root: '/', current: 'http://s/collection' };
  const clic = { button: 0 };
  const lien = (href, o = {}) => ({ href, target: '', download: false, natif: false, ...o });
  assert.equal(shouldIntercept(lien('http://s/'), clic, ctx), true);
  assert.equal(shouldIntercept(lien('http://s/montre/MOR-PR42-AC?c=x'), clic, ctx), true);
  assert.equal(shouldIntercept(lien('https://ailleurs.fr/'), clic, ctx), false);
  assert.equal(shouldIntercept(lien('http://s/studio.html'), clic, ctx), false);
  assert.equal(shouldIntercept(lien('http://s/collection#grille'), clic, ctx), false);
  assert.equal(shouldIntercept(lien('http://s/', { target: '_blank' }), clic, ctx), false);
  assert.equal(shouldIntercept(lien('http://s/', { download: true }), clic, ctx), false);
  assert.equal(shouldIntercept(lien('http://s/', { natif: true }), clic, ctx), false);
  assert.equal(shouldIntercept(lien('http://s/'), { button: 0, ctrlKey: true }, ctx), false);
  assert.equal(shouldIntercept(lien('http://s/'), { button: 1 }, ctx), false);
});
