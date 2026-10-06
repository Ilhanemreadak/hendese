/* Hendese · Entry: public API; the IIFE build exposes it as the global `Hendese`.
   Flow: Hendese.init(opts)  →  register scenes (pinScene / stickyScene / figScene / scene)  →  Hendese.start()
   opts: { strings?, themeKey?: 'hendese-theme', topId?: 'top', englishStems?: RegExp } */
import { $, $$, S, SCENES, clamp01, seg, lerp, ease, absTop, wake, poke, measure, evalMotion, MQ_RM, MQ_WIDE } from './core.js';
import { strings } from './strings.js';
import * as theme from './theme.js';
import * as nav from './nav.js';
import * as hud from './hud.js';
import * as hocaCtl from './hoca-controller.js';
import * as widgets from './widgets.js';
import { wrapEnglish } from './lang.js';
import { pinScene, stickyScene, figScene, scene } from './scenes.js';
import { createHoca } from './hoca.js';

export const version = typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'dev';
var O = null, started = false;

export function init(opts) {
  if (O) return; O = opts || {};
  document.documentElement.classList.add('js');
  Object.assign(strings, O.strings);
  theme.init(O.themeKey || 'hendese-theme');
  nav.init(O);
  hud.init();
  widgets.init();
}

export function start() {
  if (started) return; started = true; init();
  wrapEnglish(O.englishStems);
  hocaCtl.init();
  nav.landing();
  addEventListener('scroll', poke, { passive: true });
  addEventListener('resize', measure);
  MQ_RM.addEventListener('change', evalMotion); MQ_WIDE.addEventListener('change', evalMotion);
  var main = $('main') || document.body;
  if ('ResizeObserver' in window) { var q = false; new ResizeObserver(function () { if (q) return; q = true; requestAnimationFrame(function () { q = false; measure(); }); }).observe(main); }
  evalMotion();
  nav.reanchor();
  /* web fonts arrive after the first layout: re-measure and re-anchor the hash target */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); nav.reanchor(); });
}

export { $, $$, clamp01, seg, lerp, ease, absTop, wake, poke, measure, pinScene, stickyScene, figScene, scene, createHoca, strings };
export const refresh = hocaCtl.refresh;
export const lockTo = nav.lockTo;
/* live values are exposed only through getters (a copy would go stale) */
export const state = {
  get motion() { return S.motion; }, get idle() { return S.sleeping; }, get y() { return S.y; }, get vh() { return S.vh; },
  get section() { return nav.current(); }, get scenes() { return SCENES.length; }
};
export const hoca = {
  get dismissed() { return hocaCtl.state.dismissed; }, set dismissed(v) { hocaCtl.state.dismissed = !!v; poke(); },
  dismiss: hocaCtl.dismiss
};
