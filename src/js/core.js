/* Hendese · çekirdek: yardımcılar, ortak durum, tek rAF döngüsü (boşta uyur), hareket anahtarı.
   Canlı mod = reduced-motion yok + genişlik ≥ 1100px (CSS'teki eşikle aynı; ayar değil, sözleşme). */
export const $ = (s, r) => (r || document).querySelector(s);
export const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
import { clamp01, seg, lerp, ease } from './math.js';
export { clamp01, seg, lerp, ease };
export function absTop(el) { return el.getBoundingClientRect().top + (window.scrollY || 0); }

export const MQ_RM = matchMedia('(prefers-reduced-motion: reduce)'), MQ_WIDE = matchMedia('(min-width:1100px)');
/* paylaşılan durum; modüller okur/yazar. y = scrollY, vh = viewport yüksekliği, lockUntil = parça (hash) gezinmesi kilidi */
export const S = { motion: false, y: window.scrollY || 0, vh: innerHeight, docH: 1, dirty: true, sleeping: true, last: 0, lockUntil: 0, lockId: null, anchorUntil: 0 };
export const SCENES = [];
/* kancalar (kayıt sırasıyla çalışır):
   scroll(y)        kaydırma değişince, sahnelerden önce (bölüm takibi)
   frame(t, dt)     sahnelerden sonra; true = hâlâ meşgul (HUD, Hoca)
   measure()        düzen ölçümü (sahne ölçümünden önce)
   afterMeasure()   sahne ölçümünden sonra
   motion(on)       canlı mod açılıp kapanınca, sahneler setLive'dan sonra */
export const hooks = { scroll: [], frame: [], measure: [], afterMeasure: [], motion: [] };

export function wake() { if (S.sleeping) { S.sleeping = false; S.last = performance.now(); requestAnimationFrame(frame); } }
export function poke() { S.dirty = true; wake(); }

function frame(t) {
  var dt = Math.min(64, t - S.last); S.last = t;
  if (S.dirty) { S.y = window.scrollY || 0; S.dirty = false; hooks.scroll.forEach(function (f) { f(S.y); }); }
  var busy = false;
  for (var i = 0; i < SCENES.length; i++) if (SCENES[i].tick(S.y, dt, t)) busy = true;
  hooks.frame.forEach(function (f) { if (f(t, dt)) busy = true; });
  if (busy || S.dirty) requestAnimationFrame(frame); else S.sleeping = true;
}

export function measure() {
  S.vh = innerHeight; S.docH = document.documentElement.scrollHeight;
  hooks.measure.forEach(function (f) { f(); });
  SCENES.forEach(function (sc) { sc.measure(); });
  hooks.afterMeasure.forEach(function (f) { f(); });
  poke();
}

export function evalMotion() {
  S.motion = !MQ_RM.matches && MQ_WIDE.matches;
  document.documentElement.classList.toggle('motion', S.motion);
  SCENES.forEach(function (sc) { sc.setLive(S.motion); });
  hooks.motion.forEach(function (f) { f(S.motion); });
  measure();
}
