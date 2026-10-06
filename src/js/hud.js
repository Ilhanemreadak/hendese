/* Hendese · HUD: tek sabit gösterge. Hero'da antet (tb=1), sahnede .hud-slot konumunda canlı gösterge (tb=0).
   HTML: #hud.hud > .hud-tb + .hud-live ([data-hud="chap|pct|stage|service|tag|env"]) + .hud-bar > i#hud-fill
   Her karede en görünür (alpha'sı en yüksek) sahnenin talebi kazanır. */
import { $, $$, SCENES, hooks } from './core.js';

var hud, fill, F = {}, V = {}, pos = '';
function set(o) { for (var k in o) { if (V[k] !== o[k]) { V[k] = o[k]; if (k === 'fill') { if (fill) fill.style.transform = 'scaleX(' + o[k] + ')'; } else if (F[k]) F[k].textContent = o[k]; } } }
function place(x, y, w, tb, alpha) {
  var key = Math.round(x) + ',' + Math.round(y) + ',' + Math.round(w) + ',' + tb.toFixed(3) + ',' + alpha.toFixed(3); if (key === pos) return; pos = key;
  hud.style.transform = 'translate3d(' + Math.round(x) + 'px,' + Math.round(y) + 'px,0)'; hud.style.width = Math.round(w) + 'px';
  hud.style.setProperty('--tb', tb.toFixed(3)); hud.style.opacity = alpha.toFixed(3); hud.style.visibility = alpha > 0 ? 'visible' : 'hidden';
}
export function init() {
  hud = $('#hud'); if (!hud) return;
  fill = $('#hud-fill', hud);
  $$('[data-hud]', hud).forEach(function (el) { F[el.getAttribute('data-hud')] = el; });
  hooks.frame.push(function () {
    var hb = null; SCENES.forEach(function (sc) { if (sc.hud && (!hb || sc.hud.alpha > hb.alpha)) hb = sc.hud; });
    if (hb) { set(hb.f); place(hb.x, hb.y, hb.w, hb.tb, hb.alpha); } else place(0, 0, 260, 0, 0);
    return false;
  });
}
