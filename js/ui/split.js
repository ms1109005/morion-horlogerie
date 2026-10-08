// Découpe d’un titre en mots masqués, pour la révélation « facette » : chaque mot glisse hors de
// son masque selon l’angle d’une facette (60°). Aucun découpage en mode réduit.
export function splitWords(el) {
  const original = el.innerHTML;
  const words = [];
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const mask = document.createElement('span');
          mask.className = 'mot';
          const inner = document.createElement('span');
          inner.textContent = part;
          mask.append(inner);
          frag.append(mask);
          words.push(inner);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
        walk(child);
      }
    });
  };
  walk(el);
  return { words, revert: () => { el.innerHTML = original; } };
}

// Pose l’état initial (mots sous leur masque) et renvoie la révélation à jouer après le rideau.
export function prepareFacette(el, { reduced, delay = 0 } = {}) {
  const gsap = window.gsap;
  if (!el || reduced) return { play: () => Promise.resolve(), revert() {} };
  const { words, revert } = splitWords(el);
  // Décalage le long d’une facette : vers le bas et vers la gauche (60°).
  gsap.set(words, { yPercent: 105, xPercent: -18 });
  return {
    play: () => gsap.to(words, {
      yPercent: 0, xPercent: 0, duration: 0.45, ease: 'power4.out', stagger: 0.03, delay,
    }).then(),
    revert,
  };
}
