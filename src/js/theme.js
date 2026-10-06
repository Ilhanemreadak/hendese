/* Hendese · Theme: persisted choice > system preference. [data-theme-toggle] buttons toggle it, persist the choice
   and dispatch 'hendese:theme'. For a flash-free load, inline dist/head.js in <head>. */
import { $$ } from './core.js';
import { strings } from './strings.js';

export function init(key) {
  var html = document.documentElement;
  if (!html.getAttribute('data-theme')) { var t0 = null; try { t0 = localStorage.getItem(key); } catch (e) {}
    html.setAttribute('data-theme', t0 === 'dark' || t0 === 'light' ? t0 : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')); }
  function labels() { var t = html.getAttribute('data-theme'); $$('[data-theme-toggle]').forEach(function (b) { var l = t === 'dark' ? strings.toLight : strings.toDark; b.setAttribute('aria-label', l); b.title = l; }); }
  $$('[data-theme-toggle]').forEach(function (b) { b.addEventListener('click', function () {
    var t = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; html.setAttribute('data-theme', t);
    try { localStorage.setItem(key, t); } catch (e) {} labels();
    document.dispatchEvent(new CustomEvent('hendese:theme', { detail: t })); }); });
  labels();
}
