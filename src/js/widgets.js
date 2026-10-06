/* Hendese · etkileşimli bileşenler (her modda çalışır; hareket gerektirmez). */
import { $, $$ } from './core.js';
import { strings } from './strings.js';

/* tablolar: dar ekranda satırlar kart olur; her hücreye başlığını data-th olarak yazar */
function tables() {
  $$('.tbl').forEach(function (w) { if (!w.hasAttribute('tabindex')) w.setAttribute('tabindex', '0'); });
  $$('.tbl table').forEach(function (t) { var ths = $$('thead th', t).map(function (th) { return th.textContent.trim(); });
    $$('tbody tr', t).forEach(function (tr) { $$('td', tr).forEach(function (td, i) { if (ths[i]) td.setAttribute('data-th', ths[i]); }); }); });
}

/* kod kopyala: figure.code > .code-copy > span + code */
function copy() {
  $$('.code').forEach(function (fig) { var btn = $('.code-copy', fig), code = $('code', fig); if (!btn || !code) return; var label = $('span', btn);
    btn.addEventListener('click', function () {
      var text = code.textContent.replace(/\n+$/, '');
      function done(ok) { label.textContent = ok ? strings.copied : strings.copyFail; btn.classList.toggle('done', ok); setTimeout(function () { label.textContent = strings.copy; btn.classList.remove('done'); }, 1600); }
      function fallback() { var ok = false; try { var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); ta.remove(); } catch (e) {} done(ok); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback); else fallback();
    }); });
}

/* kontrol listesi: <div class="runbook" data-store="localStorage-anahtarı"> (anahtar olduğu gibi kullanılır).
   Her çizimde 'hendese:runbook' {done,total} olayı (kabarcıklı) yayılır. */
function runbooks() {
  $$('.runbook').forEach(function (rb) {
    var boxes = $$('input[type="checkbox"]', rb), count = $('.rb-count', rb), fill = $('.rb-bar i', rb), reset = $('.rb-reset', rb), key = rb.getAttribute('data-store');
    function save() { if (key) try { localStorage.setItem(key, JSON.stringify(boxes.map(function (b) { return b.checked; }))); } catch (e) {} }
    function render() { var n = boxes.filter(function (b) { return b.checked; }).length;
      if (count) count.textContent = n + ' / ' + boxes.length; if (fill) fill.style.width = (100 * n / boxes.length) + '%'; rb.classList.toggle('complete', n === boxes.length);
      rb.dispatchEvent(new CustomEvent('hendese:runbook', { bubbles: true, detail: { done: n, total: boxes.length } })); }
    if (key) try { var s = JSON.parse(localStorage.getItem(key)); if (Array.isArray(s)) boxes.forEach(function (b, i) { b.checked = !!s[i]; }); } catch (e) {}
    boxes.forEach(function (b) { b.addEventListener('change', function () { save(); render(); }); });
    if (reset) reset.addEventListener('click', function () { boxes.forEach(function (b) { b.checked = false; }); save(); render(); if (boxes[0]) boxes[0].focus(); });
    render();
  });
}

/* istasyon gezgini: <div data-explorer="panel-id"> içindeki [data-key] düğmeleri (aria-pressed); panelde [data-for="key"].
   Üzerine gelme / odak önizler, ayrılınca seçili olana döner, tıklama seçer ve 'hendese:explore' {key} yayar. */
function explorers() {
  $$('[data-explorer]').forEach(function (ex) {
    var panel = document.getElementById(ex.getAttribute('data-explorer')); if (!panel) return;
    var btns = $$('[data-key]', ex).filter(function (b) { return b.hasAttribute('aria-pressed'); });
    var pre = btns.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; })[0] || btns[0], selected = pre && pre.getAttribute('data-key');
    function show(key) { $$('[data-for]', panel).forEach(function (d) { d.classList.toggle('show', d.getAttribute('data-for') === key); }); }
    function select(key) { selected = key; btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-key') === key)); }); show(key); }
    btns.forEach(function (b) { var k = b.getAttribute('data-key');
      b.addEventListener('click', function () { select(k); ex.dispatchEvent(new CustomEvent('hendese:explore', { bubbles: true, detail: { key: k } })); });
      b.addEventListener('mouseenter', function () { show(k); });
      b.addEventListener('mouseleave', function () { show(selected); });
      b.addEventListener('focus', function () { show(k); });
      b.addEventListener('blur', function () { show(selected); }); });
    if (selected) select(selected);
  });
}

export function init() { tables(); copy(); runbooks(); explorers(); }
