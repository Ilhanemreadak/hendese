// Standart denetimi (STANDART.md): bileşen CSS'i yalnız token kullanır, her sınıf bir sayfada gösterilir.
// İstisna: satırda /* std:ok <gerekçe> */ — toplam sayısı sınırlıdır, sessizce çoğalamaz.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const DIR = 'src/css/';
const EXEMPT = ['tokens.css', 'fonts.css', 'print.css', 'hoca.css', 'index.css'];   // token kaynağı, font, baskı, piksel çizim (3px ızgara)
const FILES = fs.readdirSync(DIR).filter(f => f.endsWith('.css') && !EXEMPT.includes(f));
const SPACING_FILES = ['components.css', 'blueprint.css'];
const MAX_MARKERS = 15;

const RULES = [
  ['renk token dışında', (p, v) => /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i.test(v)],
  ['ham px yazı boyutu (--fs-* kullanın)', (p, v) => /^font(-size)?$/.test(p) && !/var\(--u/.test(v) && /(?<![\w.-])\d*\.?\d+px/.test(v)],
  ['ham px köşe (--r-* kullanın)', (p, v) => p === 'border-radius' && /(?<![\w.-])[1-9][\d.]*px/.test(v)],
  ['ham süre (--dur-* kullanın)', (p, v) => /^(transition|animation)(-duration|-delay)?$/.test(p) && /(?<![\w.-])\d*\.?\d+m?s\b/.test(v)],
  ['ham z-index (--z-* kullanın)', (p, v) => p === 'z-index' && /^\s*([3-9]|\d{2,})/.test(v)],
  ['kullanımdan kalkan token', (p, v) => /var\(--(t-fast|t-med|ease)\)/.test(v)],
  ['!important', (p, v) => /!important/.test(v)],
];
const SPACING = (p, v) => /^(padding|margin|gap|row-gap|column-gap|inset)(-[\w-]+)?$/.test(p) && !/var\(--u/.test(v) && /(?<![\w.-])([4-9]|\d{2,})(\.\d+)?px/.test(v);

function scan(file) {
  const hits = []; let markers = 0, inComment = false;
  fs.readFileSync(DIR + file, 'utf8').split('\n').forEach((raw, i) => {
    if (/std:ok\s+\S/.test(raw)) { markers++; return; }
    let line = '';
    for (let k = 0; k < raw.length; k++) {   // yorumları ayıkla (çok satırlı dahil)
      if (inComment) { if (raw.startsWith('*/', k)) { inComment = false; k++; } continue; }
      if (raw.startsWith('/*', k)) { inComment = true; k++; continue; }
      line += raw[k];
    }
    for (const m of line.matchAll(/(?:^|[{;])\s*([\w-]+)\s*:\s*([^;{}]+)/g)) {
      const [, p, v] = m, at = `${file}:${i + 1} ${p}:${v.trim().slice(0, 60)}`;
      for (const [name, bad] of RULES) if (bad(p, v)) hits.push(`${name} · ${at}`);
      if (SPACING_FILES.includes(file) && SPACING(p, v)) hits.push(`ham boşluk (--sp-* kullanın) · ${at}`);
    }
  });
  return { hits, markers };
}

test('bileşen CSS yalnız token kullanır', () => {
  let all = [], markers = 0;
  for (const f of FILES) { const r = scan(f); all = all.concat(r.hits); markers += r.markers; }
  assert.deepEqual(all, [], '\n' + all.join('\n'));
  assert.ok(markers <= MAX_MARKERS, `std:ok istisnası ${markers} > ${MAX_MARKERS}`);
});

// JS'in yazdığı durum sınıfları ve iç yardımcılar sayfalarda elle yazılmaz
const INTERNAL = /^(on|past|now|show|complete|done|is-live|is-right|is-up|is-active|compact|hoca-quiet|nav-open|motion|js|intro-pending|intro-go|sketch|sketch-pending|face-l|hoca|hoca-still|hoca-img|hoca-layer|hoca-bubble|hoca-tag|mono|sun|moon|k|s|c|v|ln|cur)$/;
test('her sınıf bir doküman ya da parça sayfasında gösterilir', () => {
  const css = ['components.css', 'blueprint.css'].map(f => fs.readFileSync(DIR + f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\{[^{}]*\}/g, '{}')).join('\n');
  const classes = new Set([...css.matchAll(/\.([a-z][\w-]*)/g)].map(m => m[1]).filter(c => !INTERNAL.test(c)));
  const pages = ['docs', 'demos/_src'].flatMap(d => fs.readdirSync(d).filter(f => f.endsWith('.html')).map(f => fs.readFileSync(`${d}/${f}`, 'utf8'))).join('\n');
  const used = new Set([...pages.matchAll(/class="([^"]*)"/g)].flatMap(m => m[1].split(/\s+/)));
  const missing = [...classes].filter(c => !used.has(c)).sort();
  assert.deepEqual(missing, [], 'gösterilmeyen: ' + missing.join(' '));
});
