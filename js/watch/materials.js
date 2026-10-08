// Bibliothèque de matières PBR de la montre. Une clé = une matière partagée.
import * as THREE from 'three';
import {
  brushedLinear, polishSmudge, sunburstAniso, tapisserieNormal, lignesNormal,
  azurageNormal, perlageNormal, cotesNormal, leatherNormal, rubberRibsNormal, fumeAlbedo,
} from './textures.js';

const lin = (r, g, b) => new THREE.Color().setRGB(r, g, b, THREE.LinearSRGBColorSpace);

// Réflectance (F0) linéaire des métaux et teinte des céramiques.
export const METAL_F0 = {
  AC: lin(0.58, 0.59, 0.6),
  OJ: lin(1.0, 0.7, 0.3),
  OR: lin(0.95, 0.65, 0.55),
  rhodium: lin(0.66, 0.67, 0.69),
  gilt: lin(0.95, 0.72, 0.38),
  blued: lin(0.05, 0.11, 0.42),
};

const DIAL = {
  noir: { color: '#0c0c0d', metalness: 0.25 },
  bleu: { color: '#1b2f66', metalness: 0.7 },
  fume: { color: '#ffffff', metalness: 0.65, map: 'fume' },
  vert: { color: '#1c4331', metalness: 0.7 },
  saumon: { color: '#e7a386', metalness: 0.55 },
  argent: { color: '#dcdcdb', metalness: 0.85 },
};

export const STRAP_TINT = {
  caoutchouc: { noir: '#141414', bleu: '#1c2a4d', vert: '#1f3a2c', sable: '#c7b597', orange: '#d8561c' },
  cuir: { noir: '#161412', cognac: '#7a4323', bleu: '#1a2640' },
};

const cache = new Map();
const cached = (key, make) => {
  if (!cache.has(key)) {
    const m = make();
    m.name = key;
    cache.set(key, m);
  }
  return cache.get(key);
};

const withRepeat = (tex, r) => {
  const t = tex.clone();
  t.repeat.set(r, r);
  t.needsUpdate = true;
  return t;
};

// Métal du boîtier. finish : 'poli' (miroir) ou 'brosse' (satiné). Pour la céramique : poli brillant ou satiné.
export function caseMaterial(finish, surface = 'poli') {
  return cached(`case:${finish}:${surface}`, () => {
    if (finish === 'CN') {
      return new THREE.MeshPhysicalMaterial({
        color: '#0b0b0c', metalness: 0, ior: 1.75,
        roughness: surface === 'poli' ? 0.07 : 0.34,
        roughnessMap: surface === 'poli' ? withRepeat(polishSmudge(), 1 / 30) : withRepeat(brushedLinear(), 1 / 30),
        clearcoat: surface === 'poli' ? 0.6 : 0, clearcoatRoughness: 0.04,
      });
    }
    const m = new THREE.MeshPhysicalMaterial({ color: METAL_F0[finish], metalness: 1 });
    if (surface === 'poli') {
      m.roughness = 0.1;
      m.roughnessMap = withRepeat(polishSmudge(), 1 / 30);
    } else {
      m.roughness = 0.42;
      m.roughnessMap = withRepeat(brushedLinear(), 1 / 30);
      m.anisotropy = 0.75;
      m.anisotropyRotation = Math.PI / 2;
    }
    return m;
  });
}

// Bracelet : même métal que le boîtier, mais ses maillons regardent le plafond lumineux du
// studio ; on atténue le reflet d’environnement pour que l’acier ne brûle pas au blanc.
export function braceletMaterial(finish, surface = 'poli') {
  return cached(`bracelet:${finish}:${surface}`, () => {
    const m = caseMaterial(finish, surface).clone();
    m.envMapIntensity = finish === 'CN' ? 0.85 : 0.5;
    if (finish !== 'CN') m.roughness = surface === 'poli' ? 0.2 : 0.55;
    return m;
  });
}

export function sapphireMaterial(lite = false) {
  // Noir en diffus et mélange additif sur la couleur seulement (l’alpha du canvas reste
  // intact) : seuls les reflets s’ajoutent, par-dessus le cadran comme par-dessus le fond
  // de la page. La transmission physique est écartée : sur un canvas transparent, three.js
  // remplit son tampon de blanc, et une glace isolée (éclaté) devenait un disque opaque.
  void lite;
  return cached('sapphire', () => new THREE.MeshPhysicalMaterial({
    color: '#000000', metalness: 0, roughness: 0.03, ior: 1.77, specularIntensity: 0.55,
    specularColor: '#b7bfff', transparent: true, depthWrite: false,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation,
    blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneFactor, opacity: 1,
    blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor,
  }));
}

export function dialMaterial(color, pattern) {
  return cached(`dial:${color}:${pattern}`, () => {
    const d = DIAL[color];
    const m = new THREE.MeshPhysicalMaterial({ color: d.color, metalness: d.metalness });
    if (d.map === 'fume') m.map = fumeAlbedo();
    if (pattern === 'soleil') {
      m.roughness = 0.3;
      m.anisotropy = 0.9;
      m.anisotropyMap = sunburstAniso();
    } else if (pattern === 'tapisserie') {
      m.roughness = 0.34;
      m.normalMap = withRepeat(tapisserieNormal(), 1);
      m.normalScale.set(0.9, 0.9);
    } else {
      m.roughness = 0.3;
      m.normalMap = withRepeat(lignesNormal(), 1);
      m.normalScale.set(0.7, 0.7);
    }
    if (color === 'noir') { m.clearcoat = 0.35; m.clearcoatRoughness = 0.08; }
    return m;
  });
}

export function subdialMaterial(color) {
  return cached(`subdial:${color}`, () => {
    const d = DIAL[color];
    const m = new THREE.MeshPhysicalMaterial({
      color: d.map === 'fume' ? '#2a1f18' : d.color, metalness: d.metalness, roughness: 0.28,
    });
    m.normalMap = azurageNormal();
    m.normalScale.set(0.8, 0.8);
    return m;
  });
}

// Aiguilles et index appliqués : acier rhodié, or (suit l’or du boîtier), ou lume.
export function appliqueMaterial(kind, finish) {
  const metal = kind === 'or' ? (finish === 'OR' ? 'OR' : 'OJ') : 'rhodium';
  return cached(`applique:${metal}`, () => new THREE.MeshPhysicalMaterial({
    color: METAL_F0[metal], metalness: 1, roughness: 0.08,
  }));
}

export function lumeMaterial() {
  return cached('lume', () => new THREE.MeshStandardMaterial({
    color: '#eef1e6', roughness: 0.55, emissive: '#8dffc0', emissiveIntensity: 0,
  }));
}

// Impressions (logo, graduations, gravures) : opaques avec bord lissé par alpha-to-coverage,
// pour être vues à travers une glace à transmission (qui ne rend que les objets opaques).
// `texture` : une texture, ou une fonction qui la dessine (appelée seulement si la matière n’est
// pas encore en cache : chaque reconstruction du cadran redessinait sinon un canvas pour rien).
export function printMaterial(texture, key) {
  return cached(`print:${key}`, () => new THREE.MeshStandardMaterial({
    map: typeof texture === 'function' ? texture() : texture, alphaToCoverage: true, roughness: 0.5, metalness: 0,
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -4,
  }));
}

export function strapMaterial(type, color) {
  return cached(`strap:${type}:${color}`, () => {
    const m = new THREE.MeshPhysicalMaterial({ color: STRAP_TINT[type][color], metalness: 0 });
    if (type === 'caoutchouc') {
      m.roughness = 0.58;
      m.normalMap = rubberRibsNormal();
      m.normalScale.set(0.6, 0.6);
      m.sheen = 0.25;
      m.sheenRoughness = 0.5;
    } else {
      m.roughness = 0.62;
      m.normalMap = leatherNormal();
      m.normalScale.set(0.55, 0.55);
      m.sheen = 0.35;
      m.sheenRoughness = 0.6;
    }
    return m;
  });
}

export function movementMaterial(kind) {
  return cached(`mvt:${kind}`, () => {
    switch (kind) {
      case 'platine':
        return new THREE.MeshPhysicalMaterial({
          color: METAL_F0.rhodium, metalness: 1, roughness: 0.32,
          normalMap: withRepeat(perlageNormal(), 1 / 10), normalScale: new THREE.Vector2(0.7, 0.7),
        });
      case 'pont':
        return new THREE.MeshPhysicalMaterial({
          color: METAL_F0.rhodium, metalness: 1, roughness: 0.26,
          normalMap: withRepeat(cotesNormal(), 1 / 22), normalScale: new THREE.Vector2(1.1, 1.1),
        });
      case 'anglage':
        return new THREE.MeshPhysicalMaterial({ color: METAL_F0.rhodium, metalness: 1, roughness: 0.06 });
      case 'dore':
        return new THREE.MeshPhysicalMaterial({ color: METAL_F0.gilt, metalness: 1, roughness: 0.2 });
      case 'bleui':
        return new THREE.MeshPhysicalMaterial({ color: METAL_F0.blued, metalness: 1, roughness: 0.12 });
      case 'rubis':
        return new THREE.MeshPhysicalMaterial({
          color: '#a3101f', metalness: 0, roughness: 0.04, clearcoat: 1, ior: 1.76,
          emissive: '#3a0006', emissiveIntensity: 0.4,
        });
      case 'masse-or':
        return new THREE.MeshPhysicalMaterial({ color: METAL_F0.OJ, metalness: 1, roughness: 0.14 });
      default:
        throw new Error(`Matière de mouvement inconnue : ${kind}`);
    }
  });
}

export function darkMaterial() {
  return cached('dark', () => new THREE.MeshStandardMaterial({ color: '#050505', roughness: 0.6 }));
}
