// Guards the standard (STANDARD.md): component CSS uses tokens only, and every class is shown on some page.
// Exception: /* std:ok <reason> */ excuses the violations on its own line (one structural exception); unused markers fail,
// and the total count is capped so exceptions cannot quietly multiply.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const DIR = 'src/css/';
const EXEMPT = ['tokens.css', 'fonts.css', 'print.css', 'hoca.css', 'index.css'];   // token source, fonts, print, pixel art (3px grid)
const FILES = fs.readdirSync(DIR).filter(f => f.endsWith('.css') && !EXEMPT.includes(f));
const SPACING_FILES = ['components.css', 'blueprint.css'];   // shell geometry (layout, motion) is exempt from the spacing scale: STANDARD.md §1
const MAX_MARKERS = 15;

// values are checked without strings and custom-property names, so "content" text and token names never match
const bare = v => v.replace(/"[^"]*"|'[^']*'/g, '').replace(/--[\w-]+/g, '');
const NAMED = /\b(black|white|red|green|blue|yellow|orange|purple|pink|gr[ae]y|silver|navy|teal|maroon|olive|lime|aqua|fuchsia|cyan|magenta|brown|gold)\b/i;
const RULES = [
  ['color outside tokens', (p, v) => /#[0-9a-f]{3,8}\b|\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i.test(bare(v)) || NAMED.test(bare(v))],
  ['raw font size (use --fs-*)', (p, v) => /^font(-size)?$/.test(p) && !/var\(--u/.test(v) && /(?<![\w.])\d*\.?\d+(px|rem|pt)\b/.test(bare(v))],
  ['raw px radius (use --r-*)', (p, v) => /^border(-[\w-]+)?-radius$/.test(p) && /(?<![\w.])[1-9][\d.]*px/.test(bare(v))],
  ['raw duration (use --dur-*)', (p, v) => /^(transition|animation)(-duration|-delay)?$/.test(p) && /(?<![\w.-])\d*\.?\d+m?s\b/.test(v)],
  ['raw z-index (use --z-*)', (p, v) => p === 'z-index' && /^\s*([3-9]|\d{2,})/.test(v)],
  ['deprecated token', (p, v) => /var\(--(t-fast|t-med|ease)\)/.test(v)],
  ['!important', (p, v) => /!important/.test(v)],
];
const SPACING = (p, v) => /^(padding|margin|gap|row-gap|column-gap|inset)(-[\w-]+)?$/.test(p) && !/var\(--u/.test(v) && /(?<![\w.])-?([4-9]|\d{2,})(\.\d+)?px/.test(bare(v));

const lineOf = (s, i) => s.slice(0, i).split('\n').length;
function scan(file) {
  const src = fs.readFileSync(DIR + file, 'utf8'), hits = [];
  const markers = [...src.matchAll(/\/\*\s*std:ok\s+\S[\s\S]*?\*\//g)].map(m => lineOf(src, m.index));
  const used = new Set();
  // comments are blanked (offsets and line numbers kept), then declarations are matched across lines
  const text = src.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ' '));
  for (const m of text.matchAll(/(?:^|[{;])\s*([\w-]+)\s*:\s*([^;{}]+)/g)) {
    const [, p, v] = m, line = lineOf(text, m.index + m[0].indexOf(p)), at = `${file}:${line} ${p}:${v.trim().replace(/\s+/g, ' ').slice(0, 60)}`;
    const bad = RULES.filter(([, test]) => test(p, v)).map(([name]) => name);
    if (SPACING_FILES.includes(file) && SPACING(p, v)) bad.push('raw spacing (use --sp-*)');
    for (const name of bad) { if (markers.includes(line)) used.add(line); else hits.push(`${name} · ${at}`); }
  }
  for (const line of markers.filter(l => !used.has(l))) hits.push(`unused std:ok · ${file}:${line}`);
  return { hits, markers: markers.length };
}

test('component CSS uses tokens only', () => {
  let all = [], markers = 0;
  for (const f of FILES) { const r = scan(f); all = all.concat(r.hits); markers += r.markers; }
  assert.deepEqual(all, [], '\n' + all.join('\n'));
  assert.ok(markers <= MAX_MARKERS, `std:ok exceptions ${markers} > ${MAX_MARKERS}`);
});

// State classes set by JS and internal helpers are never hand-written in pages
const INTERNAL = /^(on|past|now|show|complete|done|is-live|is-right|is-up|is-active|compact|hoca-quiet|nav-open|motion|js|intro-pending|intro-go|sketch|sketch-pending|face-l|hoca|hoca-still|hoca-img|hoca-layer|hoca-bubble|hoca-tag|mono|sun|moon|k|s|c|v|ln|cur)$/;
test('every class is shown on a docs or part page', () => {
  const css = ['components.css', 'blueprint.css'].map(f => fs.readFileSync(DIR + f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\{[^{}]*\}/g, '{}')).join('\n');
  const classes = new Set([...css.matchAll(/\.([a-z][\w-]*)/g)].map(m => m[1]).filter(c => !INTERNAL.test(c)));
  const pages = ['docs', 'demos/_src'].flatMap(d => fs.readdirSync(d).filter(f => f.endsWith('.html')).map(f => fs.readFileSync(`${d}/${f}`, 'utf8'))).join('\n');
  const used = new Set([...pages.matchAll(/class="([^"]*)"/g)].flatMap(m => m[1].split(/\s+/)));
  const missing = [...classes].filter(c => !used.has(c)).sort();
  assert.deepEqual(missing, [], 'not shown anywhere: ' + missing.join(' '));
});
