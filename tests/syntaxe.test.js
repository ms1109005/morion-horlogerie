// Garde-fou : tout module de js/ doit être analysable. Une apostrophe mal échappée dans une
// chaîne suffit à faire tomber une page entière sur « Page introuvable », sans qu'aucun autre
// test ne s'en aperçoive : le routeur avale l'échec d'import et affiche la page de repli.
// L'analyse tourne dans un node fils, avec le drapeau qu'elle exige : `node --test tests/*.test.js`
// reste la seule commande à connaître.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RACINE = fileURLToPath(new URL('../js/', import.meta.url));

const ANALYSE = `
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const racine = process.argv[1];
const casses = [];
let n = 0;
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.js')) {
      n += 1;
      try { new vm.SourceTextModule(fs.readFileSync(p, 'utf8'), { identifier: p }); }
      catch (err) { casses.push(path.relative(racine, p) + ' : ' + err.message); }
    }
  }
})(racine);
process.stdout.write(JSON.stringify({ n, casses }));
`;

test('tous les modules de js/ sont syntaxiquement valides', () => {
  const sortie = execFileSync(process.execPath, ['--experimental-vm-modules', '-e', ANALYSE, RACINE], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  const { n, casses } = JSON.parse(sortie);
  assert.ok(n > 20, `trop peu de modules analysés : ${n}`);
  assert.deepEqual(casses, []);
});
