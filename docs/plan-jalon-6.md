# MORION, jalon 6 : commande et confirmation. Plan d'implémentation

> **Pour l'exécutant :** superpowers:executing-plans, tâche par tâche. Pas de commit. Travail
> autonome : décisions dans `docs/decisions.md`.

**But :** `/commande` devient un tunnel en 3 étapes (coordonnées, livraison, paiement) avec un
récapitulatif fixe des montres (vignettes rendues), des erreurs en ligne accessibles et un
paiement simulé de 1,5 s ; `/commande/merci` ouvre un écrin 3D sur la montre commandée, affiche
le numéro `MOR-XXXXXX` et le récapitulatif. Le panier est vidé au paiement. Bandeau permanent
« Démonstration : aucun paiement réel ».

**Architecture :** logique pure testée dans `js/store/commande.js` (Luhn, date d'expiration,
cryptogramme, validation par étape, numéro de commande, création de la commande). La commande
payée est gardée en `sessionStorage` (`morion:commande`) pour la page de confirmation ; aucune
donnée de carte n'est conservée (seulement les 4 derniers chiffres). L'écrin est un petit monde
three.js (`stage/ecrin.js`) posé autour de la montre du directeur (pose `merci`).

**Spec :** §5 Commande et Confirmation. **Direction :** D1. **Mouvement :** Échappement pour les
étapes (sortie courte, entrée en facette), le réhaut fait un tour pendant le paiement (le temps
qui passe), l'écrin s'ouvre sur une charnière (1,6 s, `EASE.traverse`).

## Carte des fichiers

| Fichier | Rôle |
|---|---|
| `js/store/commande.js` + `tests/commande.test.js` | `luhn`, `expirationValide`, `cryptoValide`, `validerEtape`, `numeroCommande`, `creerCommande`, lecture et écriture de la commande |
| `js/pages/checkout.js` | tunnel, récapitulatif, paiement simulé, état vide |
| `js/pages/confirmation.js` | écrin, numéro, récapitulatif, retour |
| `js/stage/ecrin.js` | écrin hexagonal laqué fumé, couvercle à charnière, coussin |
| `css/pages/commande.css` | tunnel, champs, erreurs, récapitulatif, confirmation, 1440 et 390 |

## Étapes

| Étape | Champs | Règles |
|---|---|---|
| 1. Coordonnées | prénom, nom, e-mail, téléphone (facultatif) | requis ; e-mail valide ; téléphone : chiffres, espaces, +, 8 à 20 |
| 2. Livraison | domicile (adresse, code postal, ville, pays) ou retrait au salon | code postal 4 à 6 chiffres ; salon : visuel `salon-retrait` |
| 3. Paiement | carte (titulaire, numéro, MM/AA, cryptogramme) ou virement | Luhn ; date non passée ; 3 ou 4 chiffres |

Erreurs : message sous le champ (`aria-describedby`), `aria-invalid`, résumé annoncé
(`role="alert"`), focus sur le premier champ fautif. Étapes validées repliées avec « Modifier ».

## Tâches

- [x] T1 logique pure (TDD) : Luhn, expiration, cryptogramme, validation des 3 étapes, numéro
      `MOR-` + 6 caractères sans 0/O/1/I, création de la commande (lignes, total, livraison,
      4 derniers chiffres), tests.
- [x] T2 tunnel : 3 étapes, récapitulatif fixe (vignettes, lignes, total), erreurs en ligne,
      formatage du numéro de carte, retrait au salon avec visuel, virement.
- [x] T3 paiement simulé 1,5 s (réhaut qui tourne, bouton occupé), commande enregistrée, panier
      vidé, navigation vers `/commande/merci`.
- [x] T4 écrin 3D et page de confirmation (mouvement réduit : écrin déjà ouvert).
- [x] T5 vérification (2 tours de revue : « recapture » puis « fix », 8 correctifs appliqués) :
      59 tests verts, console vide, captures 01 à 13 reprises sur la version corrigée
      (`docs/validation/jalon-6/`), écrin à 60 i/s p95 17 ms, 0 rendu au repos, clavier seul
      sur tout le tunnel, mouvement réduit (écrin déjà ouvert). La passe de verdict finale
      n'est pas revenue (limite de session de l'API, D25) : jalon clos après les 2 tours.
