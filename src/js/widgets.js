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
  $$('.code').forEach(function (fig) { var btn = $('.code-copy', fig), code = $('code', fig); if (!btn || !code) return; var label = $('span', btn); label.setAttribute('aria-live', 'polite');
    btn.addEventListener('click', function () {
      var text = code.textContent.replace(/\n+$/, '');
      function done(ok) { label.textContent = ok ? strings.copied : strings.copyFail; btn.setAttribute('data-state', ok ? 'done' : 'fail'); setTimeout(function () { label.textContent = strings.copy; btn.removeAttribute('data-state'); }, 1600); }
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

/* sekmeler: [data-tabs] içindeki role=tab düğmeleri (roving tabindex). Klavye: oklar, Home/End. Seçilmeyen paneller hidden.
   Her seçimde 'hendese:tab' {id} olayı yayılır (açılıştaki ilk seçim hariç). */
function tabs() {
  $$('[data-tabs]').forEach(function (root) {
    var list = $$('[role="tab"]', root).filter(function (t) { return t.closest('[data-tabs]') === root; });
    list.forEach(function (t) { if (!t.hasAttribute('type')) t.type = 'button'; });
    function select(t, focus, quiet) {
      list.forEach(function (x) { var on = x === t, p = document.getElementById(x.getAttribute('aria-controls')); x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; if (p) p.hidden = !on; });
      if (focus) t.focus();
      if (!quiet) root.dispatchEvent(new CustomEvent('hendese:tab', { bubbles: true, detail: { id: t.id } }));
    }
    list.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) { var k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: list.length - 1 }[e.key]; if (k == null) return; e.preventDefault(); select(list[(k + list.length) % list.length], true); });
    });
    if (list.length) select(list.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || list[0], false, true);
  });
}

/* diyalog: tarayıcı Invoker Commands (commandfor/command) desteklemiyorsa düğmeleri bağlar */
function dialogs() {
  if ('commandForElement' in HTMLButtonElement.prototype) return;
  $$('button[commandfor]').forEach(function (b) {
    b.addEventListener('click', function () { var d = document.getElementById(b.getAttribute('commandfor')), c = b.getAttribute('command'); if (!d || !d.showModal) return; if (c === 'show-modal' && !d.open) d.showModal(); else if (c === 'close') { if (b.hasAttribute('value')) d.close(b.value); else d.close(); } else if (c === 'request-close') { if (d.requestClose) d.requestClose(); else d.close(); } });
  });
}

/* form alanı: gizli hata metni de describedby ile okunur; yalnız alan geçersizken (aria-invalid ya da :user-invalid) bağlanır */
function fields() {
  $$('.field-error[id]').forEach(function (e) {
    var c = $('[aria-describedby~="' + e.id + '"]', e.closest('.field')); if (!c) return;
    var base = c.getAttribute('aria-describedby').split(/\s+/).filter(function (x) { return x !== e.id; });
    function sync() { var bad = c.getAttribute('aria-invalid') === 'true'; try { bad = bad || c.matches(':user-invalid'); } catch (x) {}
      var ids = bad ? base.concat(e.id) : base; if (ids.length) c.setAttribute('aria-describedby', ids.join(' ')); else c.removeAttribute('aria-describedby'); }
    ['input', 'change', 'blur', 'invalid'].forEach(function (t) { c.addEventListener(t, sync); });
    if (c.form) c.form.addEventListener('reset', function () { setTimeout(sync); });   /* sıfırlama :user-invalid'i temizler */
    new MutationObserver(sync).observe(c, { attributeFilter: ['aria-invalid'] }); sync();
  });
}

export function init() { tables(); copy(); runbooks(); explorers(); tabs(); dialogs(); fields(); }
