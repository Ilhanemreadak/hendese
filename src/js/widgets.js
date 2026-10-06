/* Hendese · Widgets: interactive components (work in every mode; no motion required). */
import { $, $$, guard } from './core.js';
import { strings } from './strings.js';

/* card-mode label of a header: <th data-th> wins; otherwise its text without controls (buttons, popover notes), or all of it if that leaves nothing */
function thLabel(th) {
  if (th.hasAttribute('data-th')) return th.getAttribute('data-th');
  var c = th.cloneNode(true); $$('button,[popover]', c).forEach(function (x) { x.remove(); });
  return (c.textContent.trim() || th.textContent.trim()).replace(/\s+/g, ' ');
}
/* tables: rows become cards on narrow screens; writes each cell's header into data-th.
   Columns are counted with colspan (row headers included); a cell spanning several columns gets their labels joined. */
function tables() {
  $$('.tbl').forEach(function (w) { if (!w.hasAttribute('tabindex')) w.setAttribute('tabindex', '0'); });
  $$('.tbl table').forEach(function (t) {
    var row = $('thead tr', t), ths = [];
    if (row) Array.prototype.forEach.call(row.cells, function (th) { var l = thLabel(th); for (var k = 0; k < th.colSpan; k++) ths.push(l); });
    $$('tbody tr', t).forEach(function (tr) { var col = 0;
      Array.prototype.forEach.call(tr.cells, function (c) {
        var l = ths.slice(col, col + c.colSpan).filter(function (x, k, a) { return x && a.indexOf(x) === k; }).join(' / ');
        if (c.tagName === 'TD' && l) c.setAttribute('data-th', l); col += c.colSpan; }); });
  });
}

/* code copy: figure.code > .code-copy > span + code (the span is optional: an icon-only button with aria-label works too).
   The result is announced through a separate status node, so restoring the label is not announced. */
function copy() {
  $$('.code').forEach(function (fig) { var btn = $('.code-copy', fig), code = $('code', fig); if (!btn || !code) return;
    var label = $('span', btn), idle = label && label.textContent, status = document.createElement('span'), timer;
    status.className = 'visually-hidden'; status.setAttribute('role', 'status'); btn.after(status);
    btn.addEventListener('click', function () {
      var text = code.textContent.replace(/\n+$/, '');
      function done(ok) { var msg = ok ? strings.copied : strings.copyFail; if (label) label.textContent = msg; status.textContent = msg; btn.setAttribute('data-state', ok ? 'done' : 'fail');
        clearTimeout(timer); timer = setTimeout(function () { if (label) label.textContent = idle; status.textContent = ''; btn.removeAttribute('data-state'); }, 1600); }
      function fallback() { var ok = false; try { var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); ta.remove(); btn.focus(); } catch (e) {} done(ok); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback); else fallback();
    }); });
}

/* runbook: <div class="runbook" data-store="localStorage-key"> (the key is used as is).
   Progress is stored per item identity (id, a non-default value, else the item text), so inserting or reordering steps keeps it;
   the positional array format of earlier releases is migrated on first load.
   Every render dispatches a bubbling 'hendese:runbook' {done, total} event. */
function runbooks() {
  $$('.runbook').forEach(function (rb) {
    var boxes = $$('input[type="checkbox"]', rb).filter(function (b) { return b.closest('.runbook') === rb; }), count = $('.rb-count', rb), fill = $('.rb-bar i', rb), reset = $('.rb-reset', rb), key = rb.getAttribute('data-store');
    var ids = boxes.map(function (b) { return b.id || (b.value !== 'on' && b.value) || (b.closest('label') || b.parentNode).textContent.trim().replace(/\s+/g, ' '); });
    ids = ids.map(function (k, i) { var n = ids.slice(0, i).filter(function (x) { return x === k; }).length; return n ? k + '#' + (n + 1) : k; });
    function save() { if (key) try { var o = {}; boxes.forEach(function (b, i) { if (b.checked) o[ids[i]] = true; }); localStorage.setItem(key, JSON.stringify(o)); } catch (e) {} }
    function render() { var n = boxes.filter(function (b) { return b.checked; }).length, total = boxes.length, txt = n + ' / ' + total;
      if (count && count.textContent !== txt) count.textContent = txt;   /* rewriting an unchanged live region would announce it */
      if (fill) fill.style.width = (total ? 100 * n / total : 0) + '%'; rb.classList.toggle('complete', total > 0 && n === total);
      rb.dispatchEvent(new CustomEvent('hendese:runbook', { bubbles: true, detail: { done: n, total: total } })); }
    if (key) try { var s = JSON.parse(localStorage.getItem(key));
      if (Array.isArray(s)) { boxes.forEach(function (b, i) { b.checked = !!s[i]; }); save(); }
      else if (s && typeof s === 'object') boxes.forEach(function (b, i) { b.checked = !!s[ids[i]]; }); } catch (e) {}
    boxes.forEach(function (b) { b.addEventListener('change', function () { save(); render(); }); });
    if (reset) reset.addEventListener('click', function () { boxes.forEach(function (b) { b.checked = false; }); save(); render(); if (boxes[0]) boxes[0].focus(); });
    render();
  });
}

/* station explorer: [data-key] buttons (aria-pressed) inside <div data-explorer="panel-id">; [data-for="key"] in the panel.
   Hover / focus previews, leaving reverts to the selection, click selects and dispatches 'hendese:explore' {key}.
   Previews are visual only: if the panel was authored as a live region, a status node reads selections, not every hover or focus move. */
function explorers() {
  $$('[data-explorer]').forEach(function (ex) {
    var panel = document.getElementById(ex.getAttribute('data-explorer')); if (!panel) return;
    var btns = $$('[data-key]', ex).filter(function (b) { return b.hasAttribute('aria-pressed'); });
    var pre = btns.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; })[0] || btns[0], selected = pre && pre.getAttribute('data-key');
    var status = null;
    if (panel.hasAttribute('aria-live')) { panel.removeAttribute('aria-live'); status = document.createElement('span'); status.className = 'visually-hidden'; status.setAttribute('role', 'status'); panel.after(status); }
    function show(key) { $$('[data-for]', panel).forEach(function (d) { d.classList.toggle('show', d.getAttribute('data-for') === key); }); }
    function select(key, quiet) { selected = key; btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-key') === key)); }); show(key);
      if (status && !quiet) { var d = $('[data-for="' + CSS.escape(key) + '"]', panel); status.textContent = d ? d.textContent.trim().replace(/\s+/g, ' ') : ''; } }
    btns.forEach(function (b) { var k = b.getAttribute('data-key');
      b.addEventListener('click', function () { select(k); ex.dispatchEvent(new CustomEvent('hendese:explore', { bubbles: true, detail: { key: k } })); });
      b.addEventListener('mouseenter', function () { show(k); });
      b.addEventListener('mouseleave', function () { show(selected); });
      b.addEventListener('focus', function () { show(k); });
      b.addEventListener('blur', function () { show(selected); }); });
    if (selected) select(selected, true);
  });
}

/* tabs: role=tab buttons inside [data-tabs] (roving tabindex). Keyboard: arrows, Home/End. Unselected panels are hidden.
   Every change of selection dispatches 'hendese:tab' {id} (not the initial selection on load). Modified keys (Alt+Left = Back) are left alone. */
function tabs() {
  $$('[data-tabs]').forEach(function (root) {
    var list = $$('[role="tab"]', root).filter(function (t) { return t.closest('[data-tabs]') === root; });
    list.forEach(function (t) { if (!t.hasAttribute('type')) t.type = 'button'; });
    function select(t, focus, quiet) {
      var changed = t.getAttribute('aria-selected') !== 'true';
      list.forEach(function (x) { var on = x === t, p = document.getElementById(x.getAttribute('aria-controls')); x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; if (p) p.hidden = !on; });
      if (focus) t.focus();
      if (!quiet && changed) root.dispatchEvent(new CustomEvent('hendese:tab', { bubbles: true, detail: { id: t.id } }));
    }
    list.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) { if (e.altKey || e.ctrlKey || e.metaKey) return; var k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: list.length - 1 }[e.key]; if (k == null) return; e.preventDefault(); select(list[(k + list.length) % list.length], true); });
    });
    if (list.length) select(list.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || list[0], false, true);
  });
}

/* dialog: wires the buttons when the browser lacks Invoker Commands (commandfor/command) */
function dialogs() {
  if ('commandForElement' in HTMLButtonElement.prototype) return;
  $$('button[commandfor]').forEach(function (b) {
    b.addEventListener('click', function () { var d = document.getElementById(b.getAttribute('commandfor')), c = b.getAttribute('command'); if (!d || !d.showModal) return; if (c === 'show-modal' && !d.open) d.showModal(); else if (c === 'close') { if (b.hasAttribute('value')) d.close(b.value); else d.close(); } else if (c === 'request-close') { if (d.requestClose) d.requestClose(); else d.close(); } });
  });
}

/* form field: hidden error text is also announced via describedby; linked only while the field is invalid (aria-invalid or :user-invalid) */
function fields() {
  $$('.field-error[id]').forEach(function (e) {
    var c = $('[aria-describedby~="' + CSS.escape(e.id) + '"]', e.closest('.field')); if (!c) return;
    /* the other ids are re-read on every sync, so ids the page adds later are kept */
    function sync() { var bad = c.getAttribute('aria-invalid') === 'true'; try { bad = bad || c.matches(':user-invalid'); } catch (x) {}
      var ids = (c.getAttribute('aria-describedby') || '').split(/\s+/).filter(function (x) { return x && x !== e.id; }); if (bad) ids.push(e.id); if (ids.length) c.setAttribute('aria-describedby', ids.join(' ')); else c.removeAttribute('aria-describedby'); }
    ['input', 'change', 'blur', 'invalid'].forEach(function (t) { c.addEventListener(t, sync); });
    if (c.form) c.form.addEventListener('reset', function () { setTimeout(sync); });   /* reset clears :user-invalid */
    new MutationObserver(sync).observe(c, { attributeFilter: ['aria-invalid'] }); sync();
  });
}

/* each widget initializes in isolation: one malformed component does not disable the others */
export function init() { [tables, copy, runbooks, explorers, tabs, dialogs, fields].forEach(function (f) { guard(f); }); }
