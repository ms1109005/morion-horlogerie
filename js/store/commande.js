// Commande : validation des trois étapes, numéro, création et conservation de la commande payée.
// Pur (testé sous Node), sauf lire/écrire qui passent par un stockage injectable.
// Aucune donnée de carte n’est conservée : seulement les 4 derniers chiffres.
import { decode, price } from './config.js';

export const COMMANDE_KEY = 'morion:commande';
const chiffres = (v) => String(v ?? '').replace(/\D/g, '');

export function luhn(numero) {
  const s = String(numero ?? '').replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(s)) return false;
  let somme = 0;
  for (let i = 0; i < s.length; i += 1) {
    let d = Number(s[s.length - 1 - i]);
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    somme += d;
  }
  return somme % 10 === 0;
}

// MM/AA (ou MMAA) : valable jusqu’au dernier jour du mois indiqué.
export function expirationValide(v, maintenant = new Date()) {
  const d = chiffres(v);
  if (d.length !== 4) return false;
  const mois = Number(d.slice(0, 2));
  const annee = 2000 + Number(d.slice(2));
  if (mois < 1 || mois > 12) return false;
  return new Date(annee, mois, 1) > new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
}

export const cryptoValide = (v) => /^\d{3,4}$/.test(String(v ?? ''));
export const formaterCarte = (v) => chiffres(v).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
export const formaterExpiration = (v) => { const d = chiffres(v).slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };

const vide = (v) => !String(v ?? '').trim();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Renvoie { champ: message } ; objet vide = étape valide.
export function validerEtape(etape, v = {}, maintenant = new Date()) {
  const e = {};
  if (etape === 'coordonnees') {
    if (vide(v.prenom)) e.prenom = 'Indiquez votre prénom.';
    if (vide(v.nom)) e.nom = 'Indiquez votre nom.';
    if (vide(v.email)) e.email = 'Indiquez votre adresse e-mail.';
    else if (!EMAIL.test(String(v.email).trim())) e.email = 'Cette adresse e-mail semble incomplète, par exemple nom@exemple.fr.';
    if (!vide(v.telephone) && !/^\+?[\d\s.]{8,20}$/.test(String(v.telephone).trim())) e.telephone = 'Numéro de téléphone : 8 à 20 chiffres.';
  }
  if (etape === 'livraison' && v.mode !== 'salon') {
    if (vide(v.adresse)) e.adresse = 'Indiquez votre adresse.';
    if (!/^\d{4,6}$/.test(String(v.codePostal ?? '').trim())) e.codePostal = 'Code postal : 4 à 6 chiffres.';
    if (vide(v.ville)) e.ville = 'Indiquez votre ville.';
    if (vide(v.pays)) e.pays = 'Indiquez votre pays.';
  }
  if (etape === 'paiement' && v.moyen !== 'virement') {
    if (vide(v.titulaire)) e.titulaire = 'Indiquez le nom inscrit sur la carte.';
    if (!luhn(v.numero)) e.numero = 'Ce numéro de carte n’est pas valide. Pour la démonstration : 4242 4242 4242 4242.';
    if (!expirationValide(v.expiration, maintenant)) e.expiration = 'Date d’expiration au format MM/AA, non dépassée.';
    if (!cryptoValide(v.crypto)) e.crypto = 'Cryptogramme : 3 ou 4 chiffres, au dos de la carte.';
  }
  return e;
}

// Sans 0, O, 1 ni I : le numéro se lit et se dicte sans erreur.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function numeroCommande(alea = Math.random) {
  let n = '';
  for (let i = 0; i < 6; i += 1) n += ALPHABET[Math.floor(alea() * ALPHABET.length) % ALPHABET.length];
  return `MOR-${n}`;
}

export function creerCommande({ lignes, coordonnees, livraison, paiement, alea = Math.random, date = new Date() }) {
  // Les vignettes du panier (images en base64) ne sont pas recopiées : la confirmation
  // reconstruit la montre en 3D, et le stockage de session reste léger.
  const detail = lignes.map((l) => ({ code: l.code, qty: l.qty, unit: price(decode(l.code)).total }));
  return {
    v: 1,
    numero: numeroCommande(alea),
    date: date.toISOString(),
    prenom: String(coordonnees.prenom).trim(),
    email: String(coordonnees.email).trim(),
    lignes: detail,
    total: detail.reduce((s, l) => s + l.unit * l.qty, 0),
    livraison: livraison.mode === 'salon'
      ? { mode: 'salon' }
      : { mode: 'domicile', ville: String(livraison.ville).trim(), pays: String(livraison.pays).trim() },
    paiement: paiement.moyen === 'virement'
      ? { moyen: 'virement' }
      : { moyen: 'carte', fin: chiffres(paiement.numero).slice(-4) },
  };
}

function stockage() {
  try { return globalThis.sessionStorage ?? null; } catch { return null; }
}
// Renvoie false si le stockage est refusé (navigation privée, stockage bloqué). L'appelant
// doit alors garder le panier : sans la commande écrite, la page de confirmation n'aurait plus
// ni numéro ni récapitulatif, et l'écrin serait vidé pour rien.
export function enregistrerCommande(cmd, s = stockage()) {
  try {
    if (!s) return false;
    s.setItem(COMMANDE_KEY, JSON.stringify(cmd));
    return s.getItem(COMMANDE_KEY) !== null;
  } catch { return false; }
}
export function lireCommande(s = stockage()) {
  try {
    const c = JSON.parse(s?.getItem(COMMANDE_KEY) || 'null');
    return c?.v === 1 && /^MOR-/.test(c.numero) && Array.isArray(c.lignes) ? c : null;
  } catch { return null; }
}
