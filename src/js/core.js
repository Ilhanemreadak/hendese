/* Hendese · Core: helpers, shared state, a single rAF loop (sleeps when idle) and the motion switch.
   Live mode = no reduced motion + width ≥ 1100px (matches the CSS breakpoint; a contract, not a setting). */
/* an explicit null root (a missing container) matches nothing instead of falling back to the whole document */
export const $ = (s, r) => r === null ? null : (r || document).querySelector(s);
export const $$ = (s, r) => r === null ? [] : Array.prototype.slice.call((r || document).querySelectorAll(s));
import { clamp01, seg, lerp, ease } from './math.js';
export { clamp01, seg, lerp, ease };
export function absTop(el) { return el.getBoundingClientRect().top + (window.scrollY || 0); }

/* module evaluation must not touch the DOM (server rendering, Node test runners); outside a browser the queries never match */
function mq(q) { return typeof matchMedia === 'function' ? matchMedia(q) : { matches: false, addEventListener: function () {} }; }
export const MQ_RM = mq('(prefers-reduced-motion: reduce)'), MQ_WIDE = mq('(min-width:1100px)');
/* shared state; modules read and write it. y = scrollY, vh = viewport height, lockUntil = fragment (hash) navigation lock */
export const S = { motion: false, started: false, y: 0, vh: 0, docH: 1, dirty: true, sleeping: true, last: 0, lockUntil: 0, lockId: null, anchorUntil: 0 };
export const SCENES = [];
/* hooks (run in registration order):
   scroll(y)        on scroll change, before scenes (section tracking)
   frame(t, dt)     after scenes; true = still busy (HUD, Hoca)
   measure()        layout measurement (before scene measurement)
   afterMeasure()   after scene measurement
   motion(on)       when live mode toggles, after the scenes' setLive */
export const hooks = { scroll: [], frame: [], measure: [], afterMeasure: [], motion: [] };

/* runs one callback in isolation (this = ctx, arguments = args): a failing scene or hook is reported and the rest of the page keeps working.
   A failing callback is retried on the next frame (transient errors recover); each distinct error is reported once, not every frame. */
var reported = new Set();
export function guard(f, ctx, args) {
  try { return f.apply(ctx, args); }
  catch (e) { var k = String(e && e.stack || e); if (reported.has(k)) return; reported.add(k); if (typeof reportError === 'function') reportError(e); else console.error(e); }
}

export function wake() { if (S.sleeping) { S.sleeping = false; S.last = performance.now(); requestAnimationFrame(frame); } }
export function poke() { S.dirty = true; wake(); }

function frame(t) {
  var dt = Math.max(0, Math.min(64, t - S.last)); S.last = t;
  if (S.dirty) { S.y = window.scrollY || 0; S.dirty = false; hooks.scroll.forEach(function (f) { guard(f, null, [S.y]); }); }
  var busy = false;
  for (var i = 0; i < SCENES.length; i++) if (guard(SCENES[i].tick, SCENES[i], [S.y, dt, t])) busy = true;
  hooks.frame.forEach(function (f) { if (guard(f, null, [t, dt])) busy = true; });
  if (busy || S.dirty) requestAnimationFrame(frame); else S.sleeping = true;
}

export function measure() {
  S.vh = innerHeight; S.docH = document.documentElement.scrollHeight;
  hooks.measure.forEach(function (f) { guard(f); });
  SCENES.forEach(function (sc) { guard(sc.measure, sc); });
  hooks.afterMeasure.forEach(function (f) { guard(f); });
  poke();
}

export function evalMotion() {
  S.motion = !MQ_RM.matches && MQ_WIDE.matches;
  document.documentElement.classList.toggle('motion', S.motion);
  SCENES.forEach(function (sc) { guard(sc.setLive, sc, [S.motion]); });
  hooks.motion.forEach(function (f) { guard(f, null, [S.motion]); });
  measure();
}
