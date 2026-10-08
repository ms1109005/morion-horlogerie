// Fiches techniques des trois familles (maison fictive : caractéristiques de démonstration,
// cohérentes avec le catalogue et le modèle 3D).
export const FICHES = {
  PR42: [
    ['Boîtier', [['Diamètre', '42 mm'], ['Épaisseur', '11,8 mm'], ['Lunette', 'hexagonale, six vis apparentes'], ['Glace', 'saphir bombé, traitement antireflet'], ['Fond', 'vissé, glace saphir']]],
    ['Mouvement', [['Calibre', 'MR-01, remontage automatique'], ['Fonctions', 'chronographe à roue à colonnes, date'], ['Fréquence', '4 Hz, 28 800 alternances par heure'], ['Finitions', 'côtes de Genève, perlage, vis bleuies']]],
    ['Cadran', [['Compteurs', 'trois, azurés'], ['Date', 'guichet entre 4 et 5 heures'], ['Index', 'appliqués, insert luminescent']]],
    ['Bracelet', [['Type', 'intégré au boîtier'], ['Fermoir', 'boucle déployante']]],
    ['Étanchéité', [['Pression', '10 bar, 100 m']]],
  ],
  MO39: [
    ['Boîtier', [['Forme', 'coussin, 39 mm'], ['Épaisseur', '8,2 mm'], ['Glace', 'saphir, traitement antireflet'], ['Fond', 'vissé, glace saphir']]],
    ['Mouvement', [['Calibre', 'MR-01 en version extra-plate, automatique'], ['Fonctions', 'heures, minutes, secondes, date'], ['Fréquence', '4 Hz'], ['Finitions', 'côtes de Genève, perlage, vis bleuies']]],
    ['Cadran', [['Motif', 'lignes verticales par défaut'], ['Index', 'bâtons appliqués']]],
    ['Bracelet', [['Type', 'métal, caoutchouc ou cuir'], ['Fermoir', 'boucle déployante']]],
    ['Étanchéité', [['Pression', '5 bar, 50 m']]],
  ],
  AB41: [
    ['Boîtier', [['Diamètre', '41 mm'], ['Épaisseur', '12,4 mm'], ['Lunette', 'tournante unidirectionnelle, 120 crans, insert céramique 24 heures'], ['Couronne', 'vissée, protège-couronne'], ['Fond', 'vissé, glace saphir']]],
    ['Mouvement', [['Calibre', 'MR-01, automatique, fonction GMT'], ['Fonctions', 'heures, minutes, secondes, second fuseau, date'], ['Fréquence', '4 Hz']]],
    ['Cadran', [['Index', 'ronds luminescents, triangle à midi'], ['Aiguille GMT', 'pointe orange']]],
    ['Bracelet', [['Type', 'caoutchouc par défaut, cuir ou métal'], ['Fermoir', 'boucle déployante']]],
    ['Étanchéité', [['Pression', '30 bar, 300 m']]],
  ],
};

// Ce que dit la matière de chaque finition (bloc « Matière » de la fiche).
export const MATIERES = {
  AC: { visuel: 'matiere-acier', titre: 'Acier', texte: 'Plats satinés au grain droit, arêtes polies miroir : la lumière dessine chaque facette.' },
  CN: { visuel: 'matiere-ceramique', titre: 'Céramique noire', texte: 'Dure comme le saphir, inrayable au quotidien, polie jusqu’au noir profond du morion.' },
  OJ: { visuel: 'matiere-or-jaune', titre: 'Or jaune 18 carats', texte: 'Un or chaud, satiné sur les plats, poli sur les angles, qui ne ternit pas.' },
  OR: { visuel: 'matiere-or-rose', titre: 'Or rose 18 carats', texte: 'Allié au cuivre, un or rosé qui prend la lumière rasante.' },
};
