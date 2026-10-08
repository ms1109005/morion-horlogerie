// Configuration d’une montre : validation, code d’URL partageable, prix détaillé.
import {
  FAMILIES, FINISHES, OPTIONS, STRAP_COLORS, PRICES, ENGRAVING_MAX, defaultConfig,
} from '../data/catalogue.js';

export { defaultConfig };

const FIELDS = ['dialColor', 'dialPattern', 'hands', 'strap'];

export function normalize(partial = {}) {
  const family = FAMILIES[partial.family] ? partial.family : 'PR42';
  const finish = FINISHES[partial.case] ? partial.case : 'AC';
  const c = defaultConfig(family, finish);
  if (FINISHES[partial.bezel]) c.bezel = partial.bezel;
  for (const f of FIELDS) if (OPTIONS[f][partial[f]]) c[f] = partial[f];
  const colors = STRAP_COLORS[c.strap];
  c.strapColor = colors.includes(partial.strapColor) ? partial.strapColor : colors[0];
  if (typeof partial.engraving === 'string') {
    c.engraving = Array.from(partial.engraving.trim()).slice(0, ENGRAVING_MAX).join('');
  }
  return c;
}

// --- Code d’URL : PR42-OR-OR-FU-TA-OR-ME-NO~<gravure base64url> ---

const toB64url = (str) => {
  let bin = '';
  new TextEncoder().encode(str).forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64url = (s) => {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0)));
};
const byCode = (table, code) => Object.keys(table).find((k) => table[k].code === code);

export function encode(config) {
  const c = normalize(config);
  const parts = [
    c.family, c.case, c.bezel,
    OPTIONS.dialColor[c.dialColor].code,
    OPTIONS.dialPattern[c.dialPattern].code,
    OPTIONS.hands[c.hands].code,
    OPTIONS.strap[c.strap].code,
    OPTIONS.strapColor[c.strapColor].code,
  ];
  return parts.join('-') + (c.engraving ? `~${toB64url(c.engraving)}` : '');
}

export function decode(code) {
  if (typeof code !== 'string') return null;
  const [head, eng] = code.split('~');
  const p = head.split('-');
  if (p.length !== 8) return null;
  const [family, kase, bezel, dc, dp, h, s, sc] = p;
  const raw = {
    family, case: kase, bezel,
    dialColor: byCode(OPTIONS.dialColor, dc),
    dialPattern: byCode(OPTIONS.dialPattern, dp),
    hands: byCode(OPTIONS.hands, h),
    strap: byCode(OPTIONS.strap, s),
    strapColor: byCode(OPTIONS.strapColor, sc),
  };
  if (!FAMILIES[family] || !FINISHES[kase] || !FINISHES[bezel]) return null;
  if (Object.values(raw).some((v) => v === undefined)) return null;
  if (eng) {
    try { raw.engraving = fromB64url(eng); } catch { return null; }
  }
  return normalize(raw);
}

// --- Prix ---

function bezelDelta(c) {
  if (c.bezel === c.case) return 0;
  if (c.bezel === 'CN') return PRICES.bezelCeramic;
  if (FINISHES[c.bezel].or && !FINISHES[c.case].or) return PRICES.bezelGoldOnNonGold;
  return 0;
}

export function price(config) {
  const c = normalize(config);
  const fam = FAMILIES[c.family];
  const base = fam.base[c.case];
  const lines = [{ label: `${fam.nomComplet}, ${FINISHES[c.case].nom.toLowerCase()}`, amount: base }];
  const add = (label, amount) => { if (amount) lines.push({ label, amount }); };

  add(`Lunette ${FINISHES[c.bezel].nom.toLowerCase()}`, bezelDelta(c));
  add(`Cadran ${OPTIONS.dialPattern[c.dialPattern].nom.toLowerCase()}`, PRICES.dialPattern[c.dialPattern]);
  add(`Aiguilles ${OPTIONS.hands[c.hands].nom.toLowerCase()}`, PRICES.hands[c.hands]);
  if (c.strap === 'metal') {
    add('Bracelet métal', FINISHES[c.case].or ? PRICES.strapMetal.or : PRICES.strapMetal.base);
  } else {
    add(`Bracelet ${OPTIONS.strap[c.strap].nom.toLowerCase()}`, PRICES.strap[c.strap]);
  }
  if (c.engraving) add('Gravure du fond', PRICES.engraving);

  return { base, lines, total: lines.reduce((s, l) => s + l.amount, 0) };
}

export function formatPrice(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}
