/* Hendese · Theme: persisted choice > system preference. [data-theme-toggle] buttons toggle it, persist the choice
   and dispatch 'hendese:theme'. For a flash-free load, inline dist/head.js in <head>. */
import { $$ } from './core.js';
import { strings } from './strings.js';

/* storage key: init({themeKey}) > <html data-theme-key> (also read by head.js) > 'hendese-theme' */
export function init(key) {
  var html = document.documentElement, sys = matchMedia('(prefers-color-scheme: dark)');
  key = key || html.getAttribute('data-theme-key') || 'hendese-theme';
  function stored() { try { var t = localStorage.getItem(key); return t === 'dark' || t === 'light' ? t : null; } catch (e) { return null; } }
  /* a stored choice always wins; otherwise keep what head.js or the page set, falling back to the system preference */
  var t0 = stored(); if (t0 || !html.getAttribute('data-theme')) html.setAttribute('data-theme', t0 || (sys.matches ? 'dark' : 'light'));
  function labels() { var t = html.getAttribute('data-theme'); $$('[data-theme-toggle]').forEach(function (b) { var l = t === 'dark' ? strings.toLight : strings.toDark; b.setAttribute('aria-label', l); b.title = l; }); }
  $$('[data-theme-toggle]').forEach(function (b) { b.addEventListener('click', function () {
    var t = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; html.setAttribute('data-theme', t);
    try { localStorage.setItem(key, t); } catch (e) {} labels();
    document.dispatchEvent(new CustomEvent('hendese:theme', { detail: t })); }); });
  labels();
}
