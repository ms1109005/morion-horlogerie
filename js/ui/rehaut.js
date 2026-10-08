// Réhaut : 60 minutes tracées le long du bord de l’écran, index épais toutes les 5 minutes.
// Le repère bleu (acier bleui) suit l’avancement de la page ; pendant une transition il fait
// un tour complet, comme une trotteuse.
export function createRehaut(svg, { scroll, reduced }) {
  const NS = 'http://www.w3.org/2000/svg';
  let path = null;
  let length = 0;
  let marker = null;
  let progress = 0;
  let sweep = 0;

  function draw() {
    const { width: w, height: h } = svg.getBoundingClientRect();
    if (!w || !h) return;
    const narrow = w < 700;
    const r = narrow ? 16 : 22;
    // Départ à midi, sens horaire.
    const d = `M${w / 2} 0H${w - r}A${r} ${r} 0 0 1 ${w} ${r}V${h - r}A${r} ${r} 0 0 1 ${w - r} ${h}`
      + `H${r}A${r} ${r} 0 0 1 0 ${h - r}V${r}A${r} ${r} 0 0 1 ${r} 0Z`;
    svg.replaceChildren();
    path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', 'trace');
    svg.append(path);
    length = path.getTotalLength();
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 60; i += 1) {
      const s = (i / 60) * length;
      const a = path.getPointAtLength(s);
      const b = path.getPointAtLength(Math.min(s + 1, length - 0.01));
      let nx = -(b.y - a.y);
      let ny = b.x - a.x;
      const n = Math.hypot(nx, ny) || 1;
      nx /= n; ny /= n;
      const cinq = i % 5 === 0;
      const len = cinq ? (narrow ? 8 : 12) : (narrow ? 4 : 7);
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', a.x.toFixed(1));
      line.setAttribute('y1', a.y.toFixed(1));
      line.setAttribute('x2', (a.x + nx * len).toFixed(1));
      line.setAttribute('y2', (a.y + ny * len).toFixed(1));
      line.setAttribute('class', cinq ? 'cinq' : 'minute');
      frag.append(line);
    }
    svg.append(frag);
    marker = document.createElementNS(NS, 'circle');
    marker.setAttribute('r', narrow ? '3' : '4');
    marker.setAttribute('class', 'repere');
    svg.append(marker);
    place();
  }

  function place() {
    if (!marker) return;
    const t = ((progress + sweep) % 1 + 1) % 1;
    const p = path.getPointAtLength(t * length);
    marker.setAttribute('cx', p.x.toFixed(1));
    marker.setAttribute('cy', p.y.toFixed(1));
  }

  function fromScroll(y) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    place();
  }

  new ResizeObserver(draw).observe(svg);
  scroll.onScroll(fromScroll);
  draw();

  return {
    refresh: () => fromScroll(window.scrollY),
    // Un tour complet du repère pendant une transition (remontoir).
    tour(duration) {
      if (reduced) return;
      const proxy = { v: 0 };
      window.gsap.to(proxy, {
        v: 1, duration, ease: 'power3.inOut',
        onUpdate: () => { sweep = proxy.v; place(); },
        onComplete: () => { sweep = 0; place(); },
      });
    },
  };
}
