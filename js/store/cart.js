// Panier persistant. Ligne : { id, code (encode(config)), qty, image? }. Stockage localStorage
// protégé : navigation privée ou stockage bloqué → panier en mémoire, sans exception.
import { decode, encode, price } from './config.js';

export const CART_KEY = 'morion:panier';
const QTE_MAX = 9;

const valid = (l) => l && typeof l.id === 'string' && Number.isInteger(l.qty)
  && l.qty >= 1 && l.qty <= QTE_MAX && typeof l.code === 'string' && decode(l.code) !== null;

function defaultStorage() {
  try { return globalThis.localStorage ?? null; } catch { return null; }
}

const newId = () => `l${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function createCart(storage = defaultStorage()) {
  const subs = new Set();
  const read = () => {
    try {
      const d = JSON.parse(storage?.getItem(CART_KEY) || 'null');
      return Array.isArray(d?.lignes) ? d.lignes.filter(valid) : [];
    } catch { return []; }
  };
  let lignes = read();
  const write = () => {
    try { storage?.setItem(CART_KEY, JSON.stringify({ v: 1, lignes })); } catch { /* stockage bloqué : mémoire seule */ }
  };
  const commit = () => { write(); subs.forEach((fn) => fn()); };

  return {
    items: () => lignes.map((l) => ({ ...l })),
    count: () => lignes.reduce((n, l) => n + l.qty, 0),
    lines: () => lignes.map((l) => {
      const config = decode(l.code);
      const unit = price(config).total;
      return { ...l, config, unit, sum: unit * l.qty };
    }),
    total() { return this.lines().reduce((n, l) => n + l.sum, 0); },

    // Une configuration identique s’ajoute à la ligne existante.
    add(config, { image } = {}) {
      const code = encode(config);
      const same = lignes.find((l) => l.code === code);
      if (same) {
        same.qty = Math.min(QTE_MAX, same.qty + 1);
        if (image) same.image = image;
        commit();
        return same.id;
      }
      const ligne = { id: newId(), code, qty: 1 };
      if (image) ligne.image = image;
      lignes = [...lignes, ligne];
      commit();
      return ligne.id;
    },
    setQty(id, qty) {
      const l = lignes.find((x) => x.id === id);
      if (!l) return;
      l.qty = Math.min(QTE_MAX, Math.max(1, Math.round(qty) || 1));
      commit();
    },
    // Retire une ligne ; la fonction renvoyée la remet à sa place.
    remove(id) {
      const i = lignes.findIndex((x) => x.id === id);
      if (i < 0) return () => {};
      const [ligne] = lignes.splice(i, 1);
      lignes = [...lignes];
      commit();
      return () => {
        if (lignes.some((x) => x.id === ligne.id)) return;
        lignes = [...lignes.slice(0, i), ligne, ...lignes.slice(i)];
        commit();
      };
    },
    clear() { lignes = []; commit(); },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  };
}
