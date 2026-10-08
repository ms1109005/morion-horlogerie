// Accueil : pièces étiquetées de l’assemblage, chapitres couleur, et la chronologie pure de
// l’éclaté épinglé (testée sous Node).

// Pièces du Prisme étiquetées pendant l’éclaté (id = nom de la pièce dans le générateur).
export const PIECES = [
  { id: 'crystal', nom: 'Glace saphir', fiche: 'Saphir de synthèse bombé, traité antireflet sur ses deux faces. Seul le diamant le raye.' },
  { id: 'bezel', nom: 'Lunette hexagonale', fiche: 'Six facettes satinées, six arêtes polies à la main, six vis. Elle reprend le cristal du morion.' },
  { id: 'hand-minute', nom: 'Aiguilles', fiche: 'Découpées, polies, chargées de luminescent. La trotteuse du chronographe porte une pointe rouge.' },
  { id: 'dial', nom: 'Cadran', fiche: 'Motif tapisserie frappé, index appliqués, trois compteurs de chronographe.' },
  { id: 'mainplate', nom: 'Platine', fiche: 'Le socle du calibre MR-01 : perlage sur les deux faces, 25 rubis sertis.' },
  { id: 'balance-wheel', nom: 'Balancier', fiche: 'Il bat à 4 hertz, 28 800 alternances par heure. Spiral autocompensé, réglé en cinq positions.' },
  { id: 'bridge-train', nom: 'Ponts', fiche: 'Côtes de Genève, angles anglés et polis, vis bleuies au feu.' },
  { id: 'rotor', nom: 'Rotor', fiche: 'Masse oscillante squelettée : elle remonte le ressort dans les deux sens, 70 heures de réserve.' },
  { id: 'caseback', nom: 'Fond saphir', fiche: 'Vissé par six vis, il laisse voir le calibre battre.' },
];

// Chapitres couleur : un aplat et une matière par finition, dans l’ordre du catalogue.
export const CHAPITRES = [
  {
    finition: 'AC', visuel: 'matiere-acier', heure: '08:00 · lumière du matin',
    titre: 'Acier, satiné puis poli.',
    texte: 'Les plats sont brossés dans un seul sens, les arêtes polies miroir. Sur la lunette, six facettes et six reflets.',
  },
  {
    finition: 'OJ', visuel: 'matiere-or-jaune', heure: '12:00 · plein jour',
    titre: 'Or jaune, 18 carats.',
    texte: 'Un or chaud, coulé puis forgé pour la maison. Poli, il prend la couleur de la lumière qui l’entoure.',
  },
  {
    finition: 'OR', visuel: 'matiere-or-rose', heure: '19:00 · soleil couchant',
    titre: 'Or rose, 18 carats.',
    texte: 'Plus de cuivre, une teinte qui ne s’éteint pas. Sur le cadran fumé, il fait ressortir le brun du morion.',
  },
  {
    finition: 'CN', visuel: 'matiere-ceramique', heure: '23:00 · la nuit',
    titre: 'Céramique noire, plus dure que l’acier.',
    texte: 'Frittée à 1 450 °C puis polie au diamant, elle ne se raye pas et ne pâlit pas. Elle pèse moitié moins que l’acier.',
  },
];

export const chapitreDe = (p) => Math.min(CHAPITRES.length - 1, Math.floor(p * CHAPITRES.length));

const pas = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Chronologie de l’éclaté le long du bloc épinglé (p de 0 à 1) : démontage, tenue, remontage.
export function etapeAssemblage(p) {
  const eclate = pas(0.06, 0.48, p) * (1 - pas(0.62, 0.92, p));
  const phase = p < 0.5 ? 'demontage' : p < 0.62 ? 'tenue' : 'remontage';
  return { eclate, phase, etiquettes: pas(0.55, 0.85, eclate) };
}
