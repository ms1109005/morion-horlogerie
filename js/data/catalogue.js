// Catalogue MORION : données pures, sans three.js (testées sous Node).

export const FAMILIES = {
  PR42: {
    code: 'PR42', nom: 'Prisme', nomComplet: 'Prisme Chronographe 42',
    type: 'Chronographe automatique', diametre: 42, epaisseur: 11.8, etancheite: 100,
    base: { AC: 19800, CN: 25600, OJ: 51000, OR: 52600 },
  },
  MO39: {
    code: 'MO39', nom: 'Monolithe', nomComplet: 'Monolithe 39',
    type: 'Automatique extra-plate', diametre: 39, epaisseur: 8.2, etancheite: 50,
    base: { AC: 11900, CN: 15400, OJ: 32500, OR: 33900 },
  },
  AB41: {
    code: 'AB41', nom: 'Abysse', nomComplet: 'Abysse 41 GMT',
    type: 'Plongée GMT', diametre: 41, epaisseur: 12.4, etancheite: 300,
    base: { AC: 14500, CN: 18900, OJ: 39800, OR: 41200 },
  },
};

export const FINISHES = {
  AC: { nom: 'Acier', or: false },
  CN: { nom: 'Céramique noire', or: false },
  OJ: { nom: 'Or jaune', or: true },
  OR: { nom: 'Or rose', or: true },
};

// Chaque option : valeur interne → { nom, code } (code à 2 lettres pour l’URL).
export const OPTIONS = {
  dialColor: {
    noir: { nom: 'Noir laqué', code: 'NO' },
    bleu: { nom: 'Bleu nuit', code: 'BL' },
    fume: { nom: 'Fumé morion', code: 'FU' },
    vert: { nom: 'Vert sapin', code: 'VE' },
    saumon: { nom: 'Saumon', code: 'SA' },
    argent: { nom: 'Argenté', code: 'AR' },
  },
  dialPattern: {
    soleil: { nom: 'Soleillé', code: 'SO' },
    tapisserie: { nom: 'Tapisserie', code: 'TA' },
    lignes: { nom: 'Lignes', code: 'LI' },
  },
  hands: {
    acier: { nom: 'Acier rhodié', code: 'AC' },
    or: { nom: 'Or', code: 'OR' },
    lume: { nom: 'Luminescentes', code: 'LU' },
  },
  strap: {
    caoutchouc: { nom: 'Caoutchouc', code: 'CA' },
    cuir: { nom: 'Cuir', code: 'CU' },
    metal: { nom: 'Bracelet métal', code: 'ME' },
  },
  strapColor: {
    noir: { nom: 'Noir', code: 'NO' },
    bleu: { nom: 'Bleu', code: 'BL' },
    vert: { nom: 'Vert', code: 'VE' },
    sable: { nom: 'Sable', code: 'SB' },
    orange: { nom: 'Orange', code: 'OG' },
    cognac: { nom: 'Cognac', code: 'CO' },
  },
};

// Coloris disponibles selon le type de bracelet (le métal prend la matière du boîtier).
export const STRAP_COLORS = {
  caoutchouc: ['noir', 'bleu', 'vert', 'sable', 'orange'],
  cuir: ['noir', 'cognac', 'bleu'],
  metal: ['noir'],
};

export const PRICES = {
  bezelCeramic: 1200,
  bezelGoldOnNonGold: 6800,
  dialPattern: { soleil: 0, tapisserie: 600, lignes: 400 },
  hands: { acier: 0, or: 900, lume: 0 },
  strap: { caoutchouc: 0, cuir: 350 },
  strapMetal: { base: 2400, or: 5400 },
  engraving: 250,
};

export const ENGRAVING_MAX = 24;

const DEFAULT_PATTERN = { PR42: 'tapisserie', MO39: 'lignes', AB41: 'soleil' };
const DEFAULT_COLOR = { AC: 'bleu', CN: 'noir', OJ: 'noir', OR: 'fume' };

export function defaultConfig(family, finish) {
  return {
    family,
    case: finish,
    bezel: finish,
    dialColor: DEFAULT_COLOR[finish],
    dialPattern: DEFAULT_PATTERN[family],
    hands: family === 'AB41' ? 'lume' : FINISHES[finish].or ? 'or' : 'acier',
    strap: family === 'AB41' ? 'caoutchouc' : 'metal',
    strapColor: 'noir',
    engraving: '',
  };
}

export const REFERENCES = Object.keys(FAMILIES).flatMap((family) =>
  Object.keys(FINISHES).map((finish) => ({
    ref: `MOR-${family}-${finish}`,
    family,
    finish,
    config: defaultConfig(family, finish),
  })),
);
