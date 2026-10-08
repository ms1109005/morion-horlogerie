import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  luhn, expirationValide, cryptoValide, validerEtape, numeroCommande, creerCommande, formaterCarte,
} from '../js/store/commande.js';
import { defaultConfig, encode, price } from '../js/store/config.js';

test('Luhn : numéros de test valides, faute de frappe refusée', () => {
  assert.equal(luhn('4242 4242 4242 4242'), true);
  assert.equal(luhn('5555555555554444'), true);
  assert.equal(luhn('4242 4242 4242 4241'), false);
  assert.equal(luhn('1234'), false);
  assert.equal(luhn('abcd efgh ijkl mnop'), false);
});

test('expiration : MM/AA non passée', () => {
  const maintenant = new Date(2026, 8, 19); // septembre 2026
  assert.equal(expirationValide('09/26', maintenant), true);
  assert.equal(expirationValide('08/26', maintenant), false);
  assert.equal(expirationValide('12/31', maintenant), true);
  assert.equal(expirationValide('13/27', maintenant), false);
  assert.equal(expirationValide('1227', maintenant), true);
  assert.equal(expirationValide('', maintenant), false);
});

test('cryptogramme : 3 ou 4 chiffres', () => {
  assert.equal(cryptoValide('123'), true);
  assert.equal(cryptoValide('1234'), true);
  assert.equal(cryptoValide('12'), false);
  assert.equal(cryptoValide('12a'), false);
});

test('formatage du numéro de carte par groupes de 4', () => {
  assert.equal(formaterCarte('4242424242424242'), '4242 4242 4242 4242');
  assert.equal(formaterCarte('4242 42a4'), '4242 424');
});

test('étape 1 : coordonnées', () => {
  assert.deepEqual(validerEtape('coordonnees', { prenom: 'Lina', nom: 'Moreau', email: 'lina@exemple.fr', telephone: '' }), {});
  const e = validerEtape('coordonnees', { prenom: '', nom: 'M', email: 'lina@', telephone: '12' });
  assert.deepEqual(Object.keys(e).sort(), ['email', 'prenom', 'telephone']);
});

test('étape 2 : domicile ou salon', () => {
  assert.deepEqual(validerEtape('livraison', { mode: 'salon' }), {});
  const e = validerEtape('livraison', { mode: 'domicile', adresse: '', codePostal: '75A', ville: 'Paris', pays: 'France' });
  assert.deepEqual(Object.keys(e).sort(), ['adresse', 'codePostal']);
  assert.deepEqual(validerEtape('livraison', { mode: 'domicile', adresse: '3 rue des Arts', codePostal: '1204', ville: 'Genève', pays: 'Suisse' }), {});
});

test('étape 3 : carte ou virement', () => {
  const maintenant = new Date(2026, 8, 19);
  assert.deepEqual(validerEtape('paiement', { moyen: 'virement' }, maintenant), {});
  assert.deepEqual(validerEtape('paiement', { moyen: 'carte', titulaire: 'L Moreau', numero: '4242 4242 4242 4242', expiration: '10/28', crypto: '123' }, maintenant), {});
  const e = validerEtape('paiement', { moyen: 'carte', titulaire: '', numero: '4242 4242 4242 4241', expiration: '01/20', crypto: '1' }, maintenant);
  assert.deepEqual(Object.keys(e).sort(), ['crypto', 'expiration', 'numero', 'titulaire']);
});

test('numéro de commande : MOR- et 6 caractères sans ambiguïté', () => {
  const n = numeroCommande(() => 0.5);
  assert.match(n, /^MOR-[A-HJ-NP-Z2-9]{6}$/);
  for (let i = 0; i < 50; i += 1) assert.match(numeroCommande(), /^MOR-[A-HJ-NP-Z2-9]{6}$/);
});

test('création : lignes, total, livraison, 4 derniers chiffres seulement', () => {
  const c = defaultConfig('PR42', 'AC');
  const lignes = [{ code: encode(c), qty: 2 }];
  const cmd = creerCommande({
    lignes,
    coordonnees: { prenom: 'Lina', nom: 'Moreau', email: 'lina@exemple.fr' },
    livraison: { mode: 'salon' },
    paiement: { moyen: 'carte', numero: '4242 4242 4242 4242', crypto: '123', expiration: '10/28', titulaire: 'L Moreau' },
    alea: () => 0.1,
    date: new Date(2026, 8, 19),
  });
  assert.match(cmd.numero, /^MOR-/);
  assert.equal(cmd.total, price(c).total * 2);
  assert.equal(cmd.lignes[0].qty, 2);
  assert.equal(cmd.paiement.fin, '4242');
  assert.equal(JSON.stringify(cmd).includes('123'), false);
  assert.equal(JSON.stringify(cmd).includes('4242 4242'), false);
  assert.equal(cmd.prenom, 'Lina');
});
