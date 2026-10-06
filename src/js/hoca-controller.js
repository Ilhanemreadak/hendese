/* Hendese · Hoca kontrolcüsü. Sprite modülü (hoca.js) yalnızca söyleneni çizer; burası kimin konuştuğuna karar verir.
   - Sahibi: Hoca'yı talep eden ilk sahne; yoksa raydaki ev (#hoca-home). [data-hoca="quiet"] bölümde evde soluk durur.
   - Devir: yakın iki sahne noktası arasında kısa yürüyüş (650 ms); eve/evden, uzak mesafe (>260 px) ya da parça gezinmesi
     sırasında olduğu yerde söner ve yeni yerde belirir (320 ms), böylece ilgisiz içeriğin üstünden geçmez.
   - Reduced motion (masaüstü): her sahnenin `still` pozunda durgun bir kopya, hareket yok. */
import { $, S, SCENES, hooks, clamp01, lerp, ease, poke } from './core.js';
import { createHoca } from './hoca.js';
import { current, isQuiet } from './nav.js';

var hoca = null, homeEl, homePt = { x: 0, y: 0 }, H = { owner: null, from: null, t0: 0, pos: null, fade: null };
var WALK_MAX = 260;
export const state = { dismissed: false };   /* sahnelerin okuduğu paylaşımlı bayrak: kullanıcı Hoca'yı kapattı; sahne talebini null döndürsün */

function tick(t) {
  if (!S.motion) return false;
  var sc = null, want = 'home';
  if (Date.now() >= S.lockUntil) for (var i = 0; i < SCENES.length; i++) if (SCENES[i].hoca) { sc = SCENES[i].hoca; want = SCENES[i]; break; }
  var tg = sc ? sc : { x: homePt.x, y: homePt.y, pose: 'idle', face: 1, bubble: null, tag: null, alpha: isQuiet(current()) ? .45 : 1 };
  if (want !== H.owner) {
    if (H.owner && H.pos && !(sc && sc.hidden)) {
      if (H.owner === 'home' || want === 'home' || Math.hypot(tg.x - H.pos.x, tg.y - H.pos.y) > WALK_MAX) { H.fade = { x: H.pos.x, y: H.pos.y, pose: H.pos.pose, face: H.pos.face, a: H.pos.alpha, t0: t }; H.from = null; }
      else { H.from = { x: H.pos.x, y: H.pos.y }; H.t0 = t; H.fade = null; } }
    H.owner = want; }
  var s = { visible: !(sc && sc.hidden), x: tg.x, y: tg.y, pose: tg.pose, face: tg.face, bubble: tg.bubble, bubbleUp: !!tg.bubbleUp, tag: tg.tag, squash: tg.squash || 0, alpha: tg.alpha == null ? 1 : tg.alpha }, busy = false;
  if (H.fade) { var f = H.fade, q = (t - f.t0) / 320;   /* ilk yarı: eski yerde söner; ikinci yarı: yenide belirir */
    if (q >= 1) H.fade = null;
    else { busy = true; s.bubble = null; s.tag = null;
      if (q < .5) { s.x = f.x; s.y = f.y; s.pose = f.pose; s.face = f.face; s.squash = 0; s.alpha = f.a * (1 - 2 * q); } else s.alpha *= 2 * q - 1; } }
  if (H.from) { var k = clamp01((t - H.t0) / 650);
    if (k >= 1) H.from = null;
    else { var e = ease(k); s.x = lerp(H.from.x, tg.x, e); s.y = lerp(H.from.y, tg.y, e); s.pose = Math.floor((t - H.t0) / 150) % 2 ? 'walkA' : 'walkB'; s.face = tg.x < H.from.x ? -1 : 1; s.bubble = null; s.tag = null; s.alpha = 1; busy = true; } }
  H.pos = { x: s.x, y: s.y, pose: s.pose, face: s.face, alpha: s.alpha }; hoca.render(s); return busy;
}

/* durgun kopyaları yeniden yerleştirir (reduced motion masaüstünde); bir fig sahnesinin durumu değişince çağırın */
export function refresh() {
  if (!hoca) return;
  var wantStatic = !S.motion && matchMedia('(min-width:1100px)').matches;
  hoca.clearPlaced();
  if (wantStatic) SCENES.forEach(function (sc) { var o = typeof sc.still === 'function' ? sc.still() : sc.still; if (o) hoca.place(sc.dr, { left: (o.x / sc.aw * 100) + '%', top: (o.y / sc.ah * 100) + '%', pose: o.pose, face: o.face || 1, bubble: o.bubble || null, bubbleUp: !!o.bubbleUp, tag: o.tag || null }); });
  if (!S.motion) hoca.render({ visible: false, x: 0, y: 0, pose: 'idle', face: 1, bubble: null, tag: null, squash: 0, alpha: 0 });
  H.owner = null; H.from = null; H.fade = null; H.pos = null;
}

/* yalnızca ev ya da `still` taşıyan bir sahne varsa oluşturulur (tüm pozları boyamak bedava değil) */
export function init() {
  homeEl = $('#hoca-home');
  if (!homeEl && !SCENES.some(function (sc) { return sc.still; })) return;
  hoca = createHoca();
  hooks.afterMeasure.unshift(function () { if (homeEl) { var r = homeEl.getBoundingClientRect(); homePt = { x: r.left + r.width / 2, y: r.bottom - 22 }; } });
  hooks.frame.push(tick);
  hooks.motion.push(refresh);
}
export function dismiss() { state.dismissed = true; poke(); }
