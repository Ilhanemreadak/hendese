// Parça sayfaları: demos/_src/<ad>.html kaynaklarından demos/<ad>.html + demos/index.html (galeri) üretir.
// Kaynak biçimi (iskelet, ray, ikonlar, kod kutuları elle yazılmaz):
//   <!-- meta {"title":"Düğmeler","group":"Bileşenler","order":10,"tagline":"…","intro":"…","summary":"…","facts":{"Sınıflar":"…"}} -->
//   <chapter title="Varyantlar" lead="…"> … </chapter>        → numaralı bölüm, rayda bağlantı
//   <demo label="Örnek · …" view="scene-dark" nocode> … </demo>  → örnek kutusu; içerik kaçışlanıp kod olarak da basılır
//   <script data-page> … </script>                              → Hendese.init() ile start() arasına (sahne kayıtları)
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const SRC = path.join(root, 'demos/_src'), OUT = path.join(root, 'demos');
const GROUPS = ['Temel', 'Bileşenler', 'Blueprint', 'Hareket', 'Hoca'];
const problems = [];   // yapı hataları biriktirilir: sayfalar yine üretilir, süreç sonunda hata koduyla biter
const REQUIRED = { 'Bileşenler': ['Durumlar', 'Yap / yapma'], 'Blueprint': ['Yap / yapma'], 'Hareket': ['Hareket kapalıyken', 'API'], 'Hoca': ['Hareket kapalıyken', 'API'] };
// büyük harfe çevrilen yerlerde İngilizce ad Türkçe kuralla İ alır (BLUEPRİNT); lang=en düzeltir
const gName = g => g === 'Blueprint' ? '<span lang="en">Blueprint</span>' : g;
const icons = fs.readFileSync(path.join(root, 'src/icons.svg'), 'utf8').split('\n').slice(1).join('\n').trim();
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attrs = s => Object.fromEntries([...s.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(m => [m[1], m[2] ?? true]));
const dedent = s => {
  const lines = s.replace(/^\s*\n|\s+$/g, '').split('\n');
  const n = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
  return lines.map(l => l.slice(n)).join('\n');
};
// kaba HTML vurgusu: etiket adı .k, tırnaklı değer .s, yorum .c (kaçışlanmış metin üzerinde)
const hl = s => esc(s)
  .replace(/&lt;!--[\s\S]*?--&gt;/g, m => `<span class='c'>${m}</span>`)
  .replace(/(&lt;\/?)([\w-]+)/g, "$1<span class='k'>$2</span>")
  .replace(/="([^"]*)"/g, "=\"<span class='s'>$1</span>\"");
const codeBox = (code, lang = 'HTML', file = 'işaretleme') =>
  `<figure class="code"><figcaption class="code-head"><span class="code-file">${file}</span><span class="code-lang">${lang}</span><button class="code-copy" type="button"><svg><use href="#i-copy"/></svg><span>Kopyala</span></button></figcaption><pre tabindex="0"><code>${code}</code></pre></figure>`;

const pages = fs.readdirSync(SRC).filter(f => f.endsWith('.html')).map(f => {
  const raw = fs.readFileSync(path.join(SRC, f), 'utf8').replace(/\r\n/g, '\n');
  const m = raw.match(/^<!-- meta (\{[\s\S]*?\}) -->/);
  if (!m) throw new Error(`${f}: meta yorumu yok`);
  const meta = JSON.parse(m[1]);
  if (!GROUPS.includes(meta.group)) throw new Error(`${f}: bilinmeyen grup ${meta.group}`);
  for (const k of ['title', 'group', 'order', 'tagline', 'intro', 'summary']) if (meta[k] == null || meta[k] === '') problems.push(`${f}: meta.${k} eksik`);
  // STANDART.md §8: grubun zorunlu bölümleri
  const titles = [...raw.matchAll(/<chapter title="([^"]*)"/g)].map(x => x[1]);
  for (const need of REQUIRED[meta.group] || []) if (!titles.some(t => t.startsWith(need))) problems.push(`${f}: "${need}…" bölümü yok (STANDART.md §8)`);
  return { slug: f.slice(0, -5), ...meta, body: raw.slice(m[0].length) };
}).sort((a, b) => GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group) || a.order - b.order);
const dupe = pages.find((p, i) => pages.some((q, j) => j < i && q.group === p.group && q.order === p.order));
if (dupe) problems.push(`${dupe.slug}: ${dupe.group} grubunda order ${dupe.order} iki kez`);

const head = title => `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<script>(function(k){try{var t=localStorage.getItem(k);if(t!=='dark'&&t!=='light')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)}catch(e){}document.documentElement.classList.add('js')})('hendese-theme');</script>
<link rel="stylesheet" href="../dist/hendese.css">
<link rel="stylesheet" href="../docs/assets/docs.css">
</head>
<body>
${icons}
<div class="rulers" aria-hidden="true"></div>
<a class="skip" href="#content">İçeriğe geç</a>
<div class="progress" aria-hidden="true"><i id="progress-bar"></i></div>
<header class="topbar">
  <button class="icon-btn" id="nav-open" type="button" aria-label="Bölümleri aç" aria-controls="rail" aria-expanded="false"><svg><use href="#i-menu"/></svg></button>
  <a class="brand" href="#top">Hendese</a>
  <span class="spacer"></span>
  <span class="cur" id="topbar-cur" aria-live="polite"></span>
  <button class="icon-btn" type="button" data-theme-toggle aria-label="Temayı değiştir"><svg class="sun"><use href="#i-sun"/></svg><svg class="moon"><use href="#i-moon"/></svg></button>
</header>
<div class="shell">`;

const rail = nav => `<aside class="rail" id="rail" aria-label="Bölümler">
  <div class="rail-head">
    <a class="brand" href="index.html">Hendese<small>Parçalar · tek tek</small></a>
    <button class="icon-btn rail-close" id="nav-close" type="button" aria-label="Bölümleri kapat"><svg><use href="#i-x"/></svg></button>
  </div>
  <nav class="rail-nav" aria-label="İçindekiler">
    <div class="nav-group">Belgeler</div>
    <a class="nav-page" href="../docs/index.html">Başlangıç</a>
    <a class="nav-page" href="index.html">Parça galerisi</a>
${nav}
  </nav>
  <div class="hoca-home" id="hoca-home" aria-hidden="true"><span class="hoca-plate">Hoca</span></div>
  <div class="rail-foot">
    <span class="pos" id="rail-pos">Giriş</span>
    <button class="icon-btn" type="button" data-theme-toggle aria-label="Temayı değiştir"><svg class="sun"><use href="#i-sun"/></svg><svg class="moon"><use href="#i-moon"/></svg></button>
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

const hero = (label, title, tagline, intro, facts) => `<section class="hero" id="top" data-section data-title="Giriş">
  <div class="hero-copy">
    <p class="hero-label">${label}</p>
    <h1>${title}<em>${tagline}</em></h1>
    <p class="intro">${intro}</p>${facts ? `\n<dl class="kv">${Object.entries(facts).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>` : ''}
  </div>
</section>`;

for (const [i, p] of pages.entries()) {
  let n = 0, script = '';
  const chapters = [];
  let body = p.body
    .replace(/<script data-page>([\s\S]*?)<\/script>/g, (_, s) => { script += dedent(s) + '\n'; return ''; })
    .replace(/<demo([^>]*)>([\s\S]*?)<\/demo>/g, (_, a, html) => {
      const o = attrs(a), src = dedent(html);
      return `<div class="demo">
  <span class="demo-label">${o.label || 'Örnek'}</span>
  <div class="demo-view${o.view ? ' ' + o.view : ''}">
${src}
  </div>${o.nocode ? '' : '\n  ' + codeBox(hl(src))}
</div>`;
    })
    .replace(/<chapter([^>]*)>([\s\S]*?)<\/chapter>/g, (_, a, inner) => {
      const o = attrs(a), num = String(++n).padStart(2, '0'), id = `p${n}`;
      chapters.push(`    <a class="nav-link" href="#${id}"><span class="num">${num}</span><span>${o.title}</span></a>`);
      return `<article class="chapter" id="${id}" data-section data-title="${o.title}"${o.hoca ? ` data-hoca="${o.hoca}"` : ''}>
  <header class="ch-head"><p class="ch-num">${num}</p><h2>${o.title}</h2>${o.lead ? `<p class="lead">${o.lead}</p>` : ''}</header>
${inner.trim()}
</article>`;
    });
  const sib = pages.filter(q => q.group === p.group).map(q =>
    `    <a class="nav-page" href="${q.slug}.html"${q === p ? ' aria-current="page"' : ''}>${q.title}</a>`).join('\n');
  const nav = `    <div class="nav-group">${gName(p.group)}</div>\n${sib}\n    <div class="nav-group">Bu sayfa</div>\n${chapters.join('\n')}`;
  const prev = pages[i - 1], next = pages[i + 1];
  const pager = `<nav class="pager" aria-label="Parçalar arası">${prev ? `<a href="${prev.slug}.html" rel="prev"><small>Önceki · ${gName(prev.group)}</small>${prev.title}</a>` : '<span></span>'}${next ? `<a href="${next.slug}.html" rel="next"><small>Sonraki · ${gName(next.group)}</small>${next.title}</a>` : ''}</nav>`;
  const html = head(`${p.title} · Hendese parçaları`) + rail(nav) + '\n'
    + hero(`Hendese · ${gName(p.group)}`, p.title, p.tagline, p.intro, p.facts) + '\n\n' + body.trim() + '\n\n' + pager + '\n' + foot(script.trim());
  fs.writeFileSync(path.join(OUT, `${p.slug}.html`), html);
}

// galeri
const navAll = GROUPS.map(g => `    <div class="nav-group">${gName(g)}</div>\n` + pages.filter(p => p.group === g)
  .map(p => `    <a class="nav-page" href="${p.slug}.html">${p.title}</a>`).join('\n')).join('\n');
const gallery = GROUPS.map((g, gi) => {
  const list = pages.filter(p => p.group === g);
  if (!list.length) return '';
  const num = String(gi + 1).padStart(2, '0');
  return `<article class="chapter" id="g${gi + 1}" data-section data-title="${g}">
  <header class="ch-head"><p class="ch-num">${num}</p><h2>${g}</h2></header>
  <ul class="parts">
${list.map(p => `    <li><a href="${p.slug}.html"><b>${p.title}</b><span>${p.summary}</span></a></li>`).join('\n')}
  </ul>
</article>`;
}).join('\n\n');
fs.writeFileSync(path.join(OUT, 'index.html'), head('Parça galerisi · Hendese') + rail(navAll) + '\n'
  + hero('Hendese · Parçalar', 'Parça galerisi', 'Her parça kendi sayfasında.', `${pages.length} parça; her sayfada varyantlar, durumlar, gerçek bir kullanım bağlamı ve yapılmaması gerekenler. Örneklerin altındaki işaretleme kopyalanıp kullanılabilir.`) + '\n\n' + gallery + '\n' + foot(''));
console.log(`demos: ${pages.length} parça sayfası + index.html`);
if (problems.length) { console.error('STANDART.md §8 ihlalleri:\n  ' + problems.join('\n  ')); process.exit(1); }
