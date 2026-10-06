// Paket dışarıyla paylaşılacak: kaynakta, dokümanda ve çıktıda bu adlar geçmemeli.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const BANNED = new RegExp(['mat', 'l[iı]|cla', 'ude'].join(''), 'i');   // kelimeler bu dosyada da geçmesin diye parçalı
const ROOTS = ['src', 'docs', 'starter', 'dist', 'tools', 'tests', 'README.md', 'CHANGELOG.md', 'package.json'];
function* walk(p) {
  if (!fs.existsSync(p)) return;
  if (fs.statSync(p).isDirectory()) { for (const f of fs.readdirSync(p)) yield* walk(path.join(p, f)); return; }
  if (/\.(css|js|mjs|html|md|json|svg|txt)$/.test(p)) yield p;
}
test('yasaklı adlar geçmiyor', () => {
  const hits = [];
  for (const r of ROOTS) for (const f of walk(r)) {
    fs.readFileSync(f, 'utf8').split('\n').forEach((l, i) => { if (BANNED.test(l)) hits.push(`${f}:${i + 1}`); });
  }
  assert.deepEqual(hits, []);
});
