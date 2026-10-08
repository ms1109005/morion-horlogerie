// Dialogue modal accessible : piège du focus, Échap, arrière-plan inerte, focus rendu à la sortie.
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function modal(panel, { onEscape, inertTargets = [] } = {}) {
  let last = null;
  const onKey = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); onEscape?.(); return; }
    if (e.key !== 'Tab') return;
    const items = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const end = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); end.focus(); }
    else if (!e.shiftKey && document.activeElement === end) { e.preventDefault(); first.focus(); }
  };
  return {
    open(from) {
      last = from || document.activeElement;
      panel.inert = false;
      inertTargets.forEach((t) => { if (t) t.inert = true; });
      document.addEventListener('keydown', onKey);
      requestAnimationFrame(() => panel.querySelector(FOCUSABLE)?.focus({ preventScroll: true }));
    },
    close({ restore = true } = {}) {
      panel.inert = true;
      inertTargets.forEach((t) => { if (t) t.inert = false; });
      document.removeEventListener('keydown', onKey);
      if (restore && last?.isConnected) last.focus({ preventScroll: true });
      last = null;
    },
  };
}
