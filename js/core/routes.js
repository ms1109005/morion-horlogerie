// Table des routes et règles d’interception des liens. Pur : testé sous Node.
import { REFERENCES } from '../data/catalogue.js';

const REFS = new Set(REFERENCES.map((r) => r.ref));
const TABLE = [
  ['accueil', /^\/$/],
  ['collection', /^\/collection$/],
  ['montre', /^\/montre\/([A-Z0-9-]+)$/, (m) => (REFS.has(m[1]) ? { ref: m[1] } : null)],
  ['commande', /^\/commande$/],
  ['merci', /^\/commande\/merci$/],
];

// Premier segment d’une route : ce qui le précède dans l’URL est le dossier du site.
// Le script en ligne d’index.html reprend cette expression (vérifié par tests/html.test.js).
export const ROUTE_SEGMENT = /\/(collection|montre|commande)(\/|$)/;

export function matchRoute(path) {
  const p = path.length > 1 ? path.replace(/\/+$/, '') : path;
  for (const [name, re, read] of TABLE) {
    const m = p.match(re);
    if (!m) continue;
    const params = read ? read(m) : {};
    if (params) return { name, params };
  }
  return { name: 'introuvable', params: {} };
}

export function siteRoot(pathname) {
  const i = pathname.search(ROUTE_SEGMENT);
  return i >= 0 ? pathname.slice(0, i + 1) : pathname.replace(/[^/]*$/, '');
}

export function toRoutePath(pathname, root) {
  const rest = pathname.startsWith(root) ? pathname.slice(root.length) : pathname.replace(/^\//, '');
  return `/${rest.replace(/^index\.html$/, '')}`;
}

export function shouldIntercept(link, evt, { origin, root, current }) {
  if (evt.defaultPrevented || evt.button !== 0) return false;
  if (evt.metaKey || evt.ctrlKey || evt.shiftKey || evt.altKey) return false;
  if (link.natif || link.download || (link.target && link.target !== '_self')) return false;
  const url = new URL(link.href);
  if (url.origin !== origin || !url.pathname.startsWith(root)) return false;
  const rest = url.pathname.slice(root.length);
  if (/\.[a-z0-9]+$/i.test(rest) && rest !== 'index.html') return false;
  const here = new URL(current);
  if (url.hash && url.pathname === here.pathname && url.search === here.search) return false;
  return true;
}
