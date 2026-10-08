// Durées (s) et courbes du site. Miroir exact de css/tokens.css (parité testée).
// Registre relevé sur les références : power2 à power4, jamais de rebond.
export const DUR = { micro: 0.18, court: 0.3, vague: 0.45, moyen: 0.8, long: 1.2, voyage: 1.6, intro: 2.4 };

export const EASE = { sortie: 'power4.out', traverse: 'power3.inOut', echappement: 'power3.out', lineaire: 'none' };

export const EASE_CSS = {
  sortie: 'cubic-bezier(0.22, 1, 0.36, 1)',
  traverse: 'cubic-bezier(0.76, 0, 0.24, 1)',
  echappement: 'cubic-bezier(0.25, 1, 0.5, 1)',
  lineaire: 'linear',
};

// Mouvement réduit : préférence système, ou ?mouvement=reduit pour les contrôles.
export function isReduced() {
  if (typeof window === 'undefined') return false;
  if (new URLSearchParams(location.search).get('mouvement') === 'reduit') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
