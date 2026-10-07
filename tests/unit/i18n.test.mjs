// Every page ships in English and Turkish (<name>.tr.html) with the same markup skeleton: only the text differs.
// The skeleton is the sequence of elements with their id and class; phrasing tags without id/class (b, code, em…) may differ.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const PHRASING = new Set(['a', 'abbr', 'b', 'br', 'code', 'em', 'i', 'kbd', 'small', 'span', 'strong', 'wbr']);
const skeleton = f => [...fs.readFileSync(f, 'utf8')
  .replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g, '<$1>')
  .matchAll(/<([a-z][\w-]*)((?:\s+[^\s=>]+(?:="[^"]*")?)*)\s*\/?>/g)]
  .map(m => {
    const a = Object.fromEntries([...m[2].matchAll(/([^\s=]+)(?:="([^"]*)")?/g)].map(x => [x[1], x[2] ?? '']));
    return PHRASING.has(m[1]) && !a.id && !a.class ? null : [m[1], a.id ? '#' + a.id : '', a.class ? '.' + a.class : ''].join('');
  }).filter(Boolean);

const pairs = [
  ...fs.readdirSync('docs').filter(f => /^[a-z]+\.html$/.test(f)).map(f => [`docs/${f}`, `docs/${f.replace('.html', '.tr.html')}`]),
  ...fs.readdirSync('demos/_src').filter(f => f.endsWith('.html')).map(f => [`demos/_src/${f}`, `demos/_src/tr/${f}`]),
  ['starter/index.html', 'starter/index.tr.html'],
];

for (const [en, tr] of pairs) test(`${tr} matches ${en}`, () => {
  assert.ok(fs.existsSync(tr), `${tr} is missing`);
  const a = skeleton(en), b = skeleton(tr);
  const i = a.findIndex((x, k) => x !== b[k]);
  if (i >= 0 || a.length !== b.length) {
    const at = i >= 0 ? i : Math.min(a.length, b.length);
    assert.fail(`first difference at element ${at}:\n  en: ${a.slice(at, at + 4).join(' ')}\n  tr: ${b.slice(at, at + 4).join(' ')}`);
  }
});
test('no Turkish source without an English page', () => {
  for (const f of fs.readdirSync('demos/_src/tr')) assert.ok(fs.existsSync(`demos/_src/${f}`), f);
});
