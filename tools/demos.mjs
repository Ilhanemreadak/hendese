// Generates part pages in two languages: demos/<name>.html from demos/_src/<name>.html (English) and
// demos/<name>.tr.html from demos/_src/tr/<name>.html (Turkish), plus a gallery per language (index.html, index.tr.html).
// Source format (skeleton, rail, icons and code boxes are never hand-written):
//   <!-- meta {"title":"Buttons","group":"Components","order":10,"tagline":"…","intro":"…","summary":"…","facts":{"Classes":"…"}} -->
//   <chapter title="Variants" lead="…"> … </chapter>            → numbered chapter, linked from the rail
//   <demo label="Example · …" view="scene-dark" nocode> … </demo> → demo box; the content is also escaped and printed as code
//   <script data-page> … </script>                              → placed between Hendese.init() and start() (scene registrations)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const OUT = path.join(root, 'demos');
const GROUPS = ['Basics', 'Components', 'Blueprint', 'Motion', 'Hoca'];   // meta.group keys, the same in both languages
const problems = [];   // structural errors are collected: pages are still generated, then the process exits with an error code
// chrome text per language; "other" is the language the switch button leads to
const LOCALES = {
  en: {
    lang: 'en', src: 'demos/_src', ext: '', other: 'tr', otherExt: '.tr', otherName: 'Türkçe',
    groups: {}, required: { 'Components': ['States', "Do / don't"], 'Blueprint': ["Do / don't"], 'Motion': ['With motion off', 'API'], 'Hoca': ['With motion off', 'API'] },
    skip: 'Skip to content', open: 'Open sections', close: 'Close sections', theme: 'Toggle theme', sections: 'Sections', contents: 'Contents',
    tagline: 'Parts, one by one', docs: 'Docs', start: 'Getting started', gallery: 'Part gallery', intro: 'Intro', thisPage: 'This page',
    between: 'Between parts', prev: 'Previous', next: 'Next', copy: 'Copy', example: 'Example', suffix: 'Hendese parts', parts: 'Parts',
    galleryTagline: 'Every part on its own page.',
    galleryIntro: n => `${n} parts; each page shows variants, states, a real context of use and what not to do. The markup under every example is ready to copy.`,
  },
  tr: {
    lang: 'tr', src: 'demos/_src/tr', ext: '.tr', other: 'en', otherExt: '', otherName: 'English',
    groups: { 'Basics': 'Temel', 'Components': 'Bileşenler', 'Motion': 'Hareket' },
    // where text is uppercased, an English name gets a dotted İ under Turkish rules (BLUEPRİNT); lang=en fixes it
    english: ['Blueprint'],
    required: { 'Components': ['Durumlar', 'Yap / yapma'], 'Blueprint': ['Yap / yapma'], 'Motion': ['Hareket kapalıyken', 'API'], 'Hoca': ['Hareket kapalıyken', 'API'] },
    skip: 'İçeriğe geç', open: 'Bölümleri aç', close: 'Bölümleri kapat', theme: 'Temayı değiştir', sections: 'Bölümler', contents: 'İçindekiler',
    tagline: 'Parçalar · tek tek', docs: 'Belgeler', start: 'Başlangıç', gallery: 'Parça galerisi', intro: 'Giriş', thisPage: 'Bu sayfa',
    between: 'Parçalar arası', prev: 'Önceki', next: 'Sonraki', copy: 'Kopyala', example: 'Örnek', suffix: 'Hendese parçaları', parts: 'Parçalar',
    galleryTagline: 'Her parça kendi sayfasında.',
    galleryIntro: n => `${n} parça; her sayfada varyantlar, durumlar, gerçek bir kullanım bağlamı ve yapılmaması gerekenler. Örneklerin altındaki işaretleme kopyalanıp kullanılabilir.`,
  },
};
const icons = fs.readFileSync(path.join(root, 'src/icons.svg'), 'utf8').split('\n').slice(1).join('\n').trim();
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attrs = s => Object.fromEntries([...s.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(m => [m[1], m[2] ?? true]));
const dedent = s => {
  const lines = s.replace(/^\s*\n|\s+$/g, '').split('\n');
  const n = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
  return lines.map(l => l.slice(n)).join('\n');
};
// rough HTML highlighting: tag name .k, quoted value .s, comment .c (applied to escaped text)
const hl = s => esc(s)
  .replace(/&lt;!--[\s\S]*?--&gt;/g, m => `<span class='c'>${m}</span>`)
  .replace(/(&lt;\/?)([\w-]+)/g, "$1<span class='k'>$2</span>")
  .replace(/="([^"]*)"/g, "=\"<span class='s'>$1</span>\"");
const codeBox = (L, code, lang = 'HTML', file = 'markup') =>
  `<figure class="code"><figcaption class="code-head"><span class="code-file">${file}</span><span class="code-lang">${lang}</span><button class="code-copy" type="button"><svg><use href="#i-copy"/></svg><span>${L.copy}</span></button></figcaption><pre tabindex="0"><code>${code}</code></pre></figure>`;
// the language button sits next to the theme button and leads to the same page in the other language
const langBtn = (L, slug) => `<a class="icon-btn" href="${slug}${L.otherExt}.html" hreflang="${L.other}" lang="${L.other}" title="${L.otherName}">${L.other.toUpperCase()}</a>`;
const themeBtn = L => `<button class="icon-btn" type="button" data-theme-toggle aria-label="${L.theme}"><svg class="sun"><use href="#i-sun"/></svg><svg class="moon"><use href="#i-moon"/></svg></button>`;

const head = (L, title, slug) => `<!doctype html>
<html lang="${L.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<script>(function(k){try{var t=localStorage.getItem(k);if(t!=='dark'&&t!=='light')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)}catch(e){}document.documentElement.classList.add('js')})('hendese-theme');</script>
<link rel="stylesheet" href="../dist/hendese.css">
<link rel="stylesheet" href="../docs/assets/docs.css">
</head>
<body>
${icons}
<div class="rulers" aria-hidden="true"></div>
<a class="skip" href="#content">${L.skip}</a>
<div class="progress" aria-hidden="true"><i id="progress-bar"></i></div>
<header class="topbar">
  <button class="icon-btn" id="nav-open" type="button" aria-label="${L.open}" aria-controls="rail" aria-expanded="false"><svg><use href="#i-menu"/></svg></button>
  <a class="brand" href="#top">Hendese</a>
  <span class="spacer"></span>
  <span class="cur" id="topbar-cur" aria-live="polite"></span>
  ${langBtn(L, slug)}
  ${themeBtn(L)}
</header>
<div class="shell">`;

const rail = (L, nav, slug) => `<aside class="rail" id="rail" aria-label="${L.sections}">
  <div class="rail-head">
    <a class="brand" href="index${L.ext}.html">Hendese<small>${L.tagline}</small></a>
    <button class="icon-btn rail-close" id="nav-close" type="button" aria-label="${L.close}"><svg><use href="#i-x"/></svg></button>
  </div>
  <nav class="rail-nav" aria-label="${L.contents}">
    <div class="nav-group">${L.docs}</div>
    <a class="nav-page" href="../docs/index${L.ext}.html">${L.start}</a>
    <a class="nav-page" href="index${L.ext}.html">${L.gallery}</a>
${nav}
  </nav>
  <div class="hoca-home" id="hoca-home" aria-hidden="true"><span class="hoca-plate">Hoca</span></div>
  <div class="rail-foot">
    <span class="pos" id="rail-pos">${L.intro}</span>
    ${langBtn(L, slug)}
    ${themeBtn(L)}
  </div>
</aside>
<div class="scrim" id="scrim" aria-hidden="true"></div>
<main id="content">
<div class="canvas">`;

const foot = script => `</div>
</main>
</div>
<script src="../dist/hendese.js"></script>
<script>
Hendese.init();
${script}
Hendese.start();
</script>
</body>
</html>
`;

const hero = (L, label, title, tagline, intro, facts) => `<section class="hero" id="top" data-section data-title="${L.intro}">
  <div class="hero-copy">
    <p class="hero-label">${label}</p>
    <h1>${title}<em>${tagline}</em></h1>
    <p class="intro">${intro}</p>${facts ? `\n<dl class="kv">${Object.entries(facts).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>` : ''}
  </div>
</section>`;

const keep = new Set();
for (const L of Object.values(LOCALES)) {
  const SRC = path.join(root, L.src);
  const gText = g => L.groups[g] || g;   // plain text, for attributes
  const gName = g => L.english?.includes(g) ? `<span lang="en">${g}</span>` : gText(g);
  const href = slug => `${slug}${L.ext}.html`;
  const pages = fs.readdirSync(SRC).filter(f => f.endsWith('.html')).map(f => {
    const raw = fs.readFileSync(path.join(SRC, f), 'utf8').replace(/\r\n/g, '\n');
    const m = raw.match(/^<!-- meta (\{[\s\S]*?\}) -->/);
    if (!m) throw new Error(`${L.src}/${f}: no meta comment`);
    let meta; try { meta = JSON.parse(m[1]); } catch (e) { throw new Error(`${L.src}/${f}: invalid meta JSON: ${e.message}`); }
    if (!GROUPS.includes(meta.group)) throw new Error(`${L.src}/${f}: unknown group ${meta.group}`);
    for (const k of ['title', 'group', 'order', 'tagline', 'intro', 'summary']) if (meta[k] == null || meta[k] === '') problems.push(`${L.src}/${f}: meta.${k} is missing`);
    // STANDARD.md §8: required chapters for the group
    const titles = [...raw.matchAll(/<chapter title="([^"]*)"/g)].map(x => x[1]);
    for (const need of L.required[meta.group] || []) if (!titles.some(t => t.startsWith(need))) problems.push(`${L.src}/${f}: no "${need}…" chapter (STANDARD.md §8)`);
    return { slug: f.slice(0, -5), ...meta, body: raw.slice(m[0].length) };
  }).sort((a, b) => GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group) || a.order - b.order);
  pages.forEach((p, i) => { if (pages.some((q, j) => j < i && q.group === p.group && q.order === p.order)) problems.push(`${L.src}/${p.slug}: order ${p.order} used twice in ${p.group}`); });
  pages.forEach(p => keep.add(href(p.slug)));
  keep.add(href('index'));

  for (const [i, p] of pages.entries()) {
    let n = 0, script = '';
    const chapters = [];
    let body = p.body
      .replace(/<script data-page>([\s\S]*?)<\/script>/g, (_, s) => { script += dedent(s) + '\n'; return ''; })
      // a ">" inside an attribute value must not close the tag: a quoted value is matched as a whole
      .replace(/<demo((?:\s+[\w-]+(?:="[^"]*")?)*)\s*>([\s\S]*?)<\/demo>/g, (_, a, html) => {
        const o = attrs(a), src = dedent(html);
        return `<div class="demo">
  <span class="demo-label">${o.label || L.example}</span>
  <div class="demo-view${o.view ? ' ' + o.view : ''}">
${src}
  </div>${o.nocode ? '' : '\n  ' + codeBox(L, hl(src))}
</div>`;
      })
      .replace(/<chapter((?:\s+[\w-]+(?:="[^"]*")?)*)\s*>([\s\S]*?)<\/chapter>/g, (_, a, inner) => {
        const o = attrs(a), num = String(++n).padStart(2, '0'), id = `p${n}`;
        chapters.push(`    <a class="nav-link" href="#${id}"><span class="num">${num}</span><span>${o.title}</span></a>`);
        return `<article class="chapter" id="${id}" data-section data-title="${o.title}"${o.hoca ? ` data-hoca="${o.hoca}"` : ''}>
  <header class="ch-head"><p class="ch-num">${num}</p><h2>${o.title}</h2>${o.lead ? `<p class="lead">${o.lead}</p>` : ''}</header>
${inner.trim()}
</article>`;
      });
    const sib = pages.filter(q => q.group === p.group).map(q =>
      `    <a class="nav-page" href="${href(q.slug)}"${q === p ? ' aria-current="page"' : ''}>${q.title}</a>`).join('\n');
    const nav = `    <div class="nav-group">${gName(p.group)}</div>\n${sib}\n    <div class="nav-group">${L.thisPage}</div>\n${chapters.join('\n')}`;
    const prev = pages[i - 1], next = pages[i + 1];
    const pager = `<nav class="pager" aria-label="${L.between}">${prev ? `<a href="${href(prev.slug)}" rel="prev"><small>${L.prev} · ${gName(prev.group)}</small>${prev.title}</a>` : '<span></span>'}${next ? `<a href="${href(next.slug)}" rel="next"><small>${L.next} · ${gName(next.group)}</small>${next.title}</a>` : ''}</nav>`;
    const html = head(L, `${p.title} · ${L.suffix}`, p.slug) + rail(L, nav, p.slug) + '\n'
      + hero(L, `Hendese · ${gName(p.group)}`, p.title, p.tagline, p.intro, p.facts) + '\n\n' + body.trim() + '\n\n' + pager + '\n' + foot(script.trim());
    fs.writeFileSync(path.join(OUT, href(p.slug)), html);
  }

  // gallery
  const navAll = GROUPS.map(g => `    <div class="nav-group">${gName(g)}</div>\n` + pages.filter(p => p.group === g)
    .map(p => `    <a class="nav-page" href="${href(p.slug)}">${p.title}</a>`).join('\n')).join('\n');
  const gallery = GROUPS.map((g, gi) => {
    const list = pages.filter(p => p.group === g);
    if (!list.length) return '';
    const num = String(gi + 1).padStart(2, '0');
    return `<article class="chapter" id="g${gi + 1}" data-section data-title="${gText(g)}">
  <header class="ch-head"><p class="ch-num">${num}</p><h2>${gName(g)}</h2></header>
  <ul class="parts">
${list.map(p => `    <li><a href="${href(p.slug)}"><b>${p.title}</b><span>${p.summary}</span></a></li>`).join('\n')}
  </ul>
</article>`;
  }).join('\n\n');
  fs.writeFileSync(path.join(OUT, href('index')), head(L, `${L.gallery} · Hendese`, 'index') + rail(L, navAll, 'index') + '\n'
    + hero(L, `Hendese · ${L.parts}`, L.gallery, L.galleryTagline, L.galleryIntro(pages.length)) + '\n\n' + gallery + '\n' + foot(''));
  console.log(`demos (${L.lang}): ${pages.length} part pages + ${href('index')}`);
}
// pages whose source was deleted must not linger in demos/ (they would ship)
for (const f of fs.readdirSync(OUT)) if (f.endsWith('.html') && !keep.has(f)) fs.rmSync(path.join(OUT, f));
if (problems.length) { console.error('STANDARD.md §8 violations:\n  ' + problems.join('\n  ')); process.exit(1); }
