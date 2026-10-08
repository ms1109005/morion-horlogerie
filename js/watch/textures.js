// Textures générées au canvas : finitions horlogères (brossé, soleillé, guilloché...)
// et marquages. Chaque texture est calculée une fois puis mise en cache.
import * as THREE from 'three';

const cache = new Map();
const cached = (key, make) => {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key);
};

function canvas(size, h = size) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = h;
  return c;
}

// Bruit de valeur lissé, répétable (pas de dépendance).
function makeNoise(seed = 1) {
  const perm = new Uint8Array(512);
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const p = Array.from({ length: 256 }, (_, i) => i).sort(() => rnd() - 0.5);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const val = (x, y) => perm[(perm[x & 255] + y) & 255] / 255;
  const fade = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = fade(x - xi), yf = fade(y - yi);
    const a = val(xi, yi), b = val(xi + 1, yi), c = val(xi, yi + 1), d = val(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
}

function toTexture(cv, { color = false, repeat = false } = {}) {
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

// Carte de hauteur (Float32Array, taille n×n, périodique) → normal map.
function heightToNormal(h, n, strength) {
  const cv = canvas(n);
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(n, n);
  const at = (x, y) => h[((y + n) % n) * n + ((x + n) % n)];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * n + x) * 4;
      img.data[i] = (-dx / len * 0.5 + 0.5) * 255;
      img.data[i + 1] = (dy / len * 0.5 + 0.5) * 255;
      img.data[i + 2] = (1 / len * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}

function grayCanvas(n, fn) {
  const cv = canvas(n);
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(n, n);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const v = Math.max(0, Math.min(1, fn(x, y))) * 255;
      const i = (y * n + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}

// --- Finitions métal ---

// Rugosité d’un satiné brossé : stries parallèles à X, légère irrégularité.
export const brushedLinear = (n = 1024) => cached(`brushed${n}`, () => {
  const noise = makeNoise(7);
  const rows = new Float32Array(n);
  for (let y = 0; y < n; y++) rows[y] = Math.random();
  return toTexture(grayCanvas(n, (x, y) => {
    const streak = rows[y] * 0.5 + rows[(y + 1) % n] * 0.3 + rows[(y + n - 1) % n] * 0.2;
    return 0.72 + streak * 0.22 + noise(x / 90, y / 14) * 0.06;
  }), { repeat: true });
});

// Micro-irrégularités des surfaces polies (traces à peine visibles, casse les reflets trop parfaits).
export const polishSmudge = (n = 512) => cached(`smudge${n}`, () => {
  const noise = makeNoise(3);
  return toTexture(grayCanvas(n, (x, y) =>
    0.82 + noise(x / 60, y / 60) * 0.12 + noise(x / 9, y / 9) * 0.06), { repeat: true });
});

// Soleillé : direction d’anisotropie radiale (RG) et force (B), pour une UV planaire centrée.
export const sunburstAniso = (n = 1024, tangential = true) => cached(`sun${n}${tangential}`, () => {
  const cv = canvas(n);
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(n, n);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let dx = x / n - 0.5, dy = 0.5 - y / n;
      const r = Math.hypot(dx, dy) || 1;
      dx /= r; dy /= r;
      if (tangential) [dx, dy] = [-dy, dx];
      const i = (y * n + x) * 4;
      img.data[i] = (dx * 0.5 + 0.5) * 255;
      img.data[i + 1] = (dy * 0.5 + 0.5) * 255;
      img.data[i + 2] = 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = toTexture(cv);
  t.flipY = false;
  return t;
});

// Tapisserie : pyramides carrées séparées par de fins sillons.
export const tapisserieNormal = (n = 1024, cells = 36) => cached(`tap${n}${cells}`, () => {
  const h = new Float32Array(n * n);
  const cell = n / cells;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const u = (x % cell) / cell - 0.5, v = (y % cell) / cell - 0.5;
      const d = Math.max(Math.abs(u), Math.abs(v));
      h[y * n + x] = d > 0.43 ? 0 : (0.43 - d);
    }
  }
  return toTexture(heightToNormal(h, n, 5.5), { repeat: true });
});

// Lignes : cannelures verticales régulières.
export const lignesNormal = (n = 1024, lines = 90) => cached(`lig${n}${lines}`, () => {
  const h = new Float32Array(n * n);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) h[y * n + x] = Math.pow(Math.abs(Math.sin((x / n) * Math.PI * lines)), 0.6);
  }
  return toTexture(heightToNormal(h, n, 2.2), { repeat: true });
});

// Azurage : sillons concentriques (compteurs), UV planaire centrée.
export const azurageNormal = (n = 512, rings = 42) => cached(`azu${n}${rings}`, () => {
  const h = new Float32Array(n * n);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const r = Math.hypot(x / n - 0.5, y / n - 0.5);
      h[y * n + x] = Math.sin(r * Math.PI * 2 * rings) * 0.5 + 0.5;
    }
  }
  return toTexture(heightToNormal(h, n, 2.4));
});

// Perlage : grains circulaires qui se chevauchent (platine du mouvement).
export const perlageNormal = (n = 1024, step = 34) => cached(`per${n}${step}`, () => {
  const h = new Float32Array(n * n);
  const rad = step * 0.78;
  for (let cy = 0; cy < n + step; cy += step * 0.72) {
    for (let cx = 0; cx < n + step; cx += step * 0.72) {
      const ox = cx + (Math.random() - 0.5) * 4, oy = cy + (Math.random() - 0.5) * 4;
      for (let y = Math.floor(oy - rad); y < oy + rad; y++) {
        for (let x = Math.floor(ox - rad); x < ox + rad; x++) {
          const d = Math.hypot(x - ox, y - oy);
          if (d > rad) continue;
          const xx = (x + n) % n, yy = (y + n) % n;
          h[yy * n + xx] = (Math.sin(d * 0.9) * 0.5 + 0.5) * (1 - d / rad) + (1 - d / rad) * 0.4;
        }
      }
    }
  }
  return toTexture(heightToNormal(h, n, 1.6), { repeat: true });
});

// Côtes de Genève : bandes ondulées parallèles (ponts du mouvement).
export const cotesNormal = (n = 1024, bands = 9) => cached(`cot${n}${bands}`, () => {
  const h = new Float32Array(n * n);
  const noise = makeNoise(11);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const t = ((x + y * 0.35) / n) * bands;
      const f = t - Math.floor(t);
      h[y * n + x] = Math.sin(f * Math.PI) * 0.97 + noise(x / 6, y / 60) * 0.03;
    }
  }
  return toTexture(heightToNormal(h, n, 3), { repeat: true });
});

// Grain de cuir : cellules irrégulières.
export const leatherNormal = (n = 1024) => cached(`lea${n}`, () => {
  const noise = makeNoise(5);
  const h = new Float32Array(n * n);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const a = noise(x / 7, y / 7), b = noise(x / 2.5 + 40, y / 2.5);
      h[y * n + x] = Math.pow(1 - Math.abs(a - 0.5) * 2, 3) * 0.7 + b * 0.3;
    }
  }
  return toTexture(heightToNormal(h, n, 2.2), { repeat: true });
});

// Nervures du caoutchouc : côtes transversales arrondies.
export const rubberRibsNormal = (n = 512, ribs = 18) => cached(`rub${n}${ribs}`, () => {
  const h = new Float32Array(n * n);
  for (let y = 0; y < n; y++) {
    const v = Math.abs(Math.sin((y / n) * Math.PI * ribs));
    for (let x = 0; x < n; x++) h[y * n + x] = Math.pow(v, 0.35);
  }
  return toTexture(heightToNormal(h, n, 2.8), { repeat: true });
});

// Fumé : dégradé radial du centre clair vers un bord noir (albédo du cadran).
export const fumeAlbedo = (n = 1024, center = '#7a5a40', edge = '#070605') => cached(`fume${n}${center}`, () => {
  const cv = canvas(n);
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
  g.addColorStop(0, center);
  g.addColorStop(0.55, '#3b2b20');
  g.addColorStop(1, edge);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, n, n);
  return toTexture(cv, { color: true });
});

// --- Marquages ---

// Texte centré sur un canvas transparent (logo, mentions du cadran).
export function textDecal(lines, { width = 1024, height = 256, color = '#f2f0ea', align = 'center' } = {}) {
  const key = `txt${JSON.stringify(lines)}${width}${height}${color}${align}`;
  return cached(key, () => {
    const cv = canvas(width, height);
    const ctx = cv.getContext('2d');
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    const x = align === 'center' ? width / 2 : align === 'left' ? 0 : width;
    for (const l of lines) {
      ctx.font = l.font;
      if ('letterSpacing' in ctx) ctx.letterSpacing = l.spacing || '0px';
      ctx.fillText(l.text, x, l.y * height);
    }
    return toTexture(cv, { color: true });
  });
}

// Échelle circulaire (réhaut, lunette 24 h, compteurs) : dessin polaire sur canvas carré,
// pour une géométrie annulaire à UV planaire (RingGeometry).
export function ringScale({
  n = 2048, inner = 0.7, outer = 1, ticks = 60, major = 5, labels = null, labelEvery = 5,
  color = '#e9e6df', bg = null, font = '600 64px system-ui', tickLen = [0.08, 0.16], labelR = 0.84,
  tickW = [3, 6], startAngle = 0,
} = {}) {
  const key = `ring${JSON.stringify(arguments[0])}`;
  return cached(key, () => {
    const cv = canvas(n);
    const ctx = cv.getContext('2d');
    const c = n / 2;
    const R = c;
    if (bg) {
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(c, c, R * outer, 0, Math.PI * 2);
      ctx.arc(c, c, R * inner, 0, Math.PI * 2, true);
      ctx.fill();
    }
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineCap = 'butt';
    for (let i = 0; i < ticks; i++) {
      const a = startAngle + (i / ticks) * Math.PI * 2;
      const isMajor = i % major === 0;
      const len = isMajor ? tickLen[1] : tickLen[0];
      const r1 = R * outer * 0.985, r0 = r1 - R * len * (outer - inner) / 0.3;
      ctx.lineWidth = isMajor ? tickW[1] : tickW[0];
      ctx.beginPath();
      ctx.moveTo(c + Math.sin(a) * r0, c - Math.cos(a) * r0);
      ctx.lineTo(c + Math.sin(a) * r1, c - Math.cos(a) * r1);
      ctx.stroke();
    }
    if (labels) {
      ctx.font = font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      labels.forEach((txt, k) => {
        if (txt === null || txt === '') return;
        const i = k * labelEvery;
        const a = startAngle + (i / ticks) * Math.PI * 2;
        const r = R * labelR;
        ctx.save();
        ctx.translate(c + Math.sin(a) * r, c - Math.cos(a) * r);
        ctx.rotate(a);
        ctx.fillText(txt, 0, 0);
        ctx.restore();
      });
    }
    return toTexture(cv, { color: true });
  });
}

export function disposeTextures() {
  cache.forEach((t) => t.dispose());
  cache.clear();
}
