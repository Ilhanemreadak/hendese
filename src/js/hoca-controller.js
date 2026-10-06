/* Hendese · Hoca controller: the sprite module (hoca.js) only draws what it is told; this module decides who speaks.
   - Owner: the first scene that claims Hoca; otherwise the home position on the rail (#hoca-home). In a [data-hoca="quiet"] section it stays home, dimmed.
   - Handoff: a short walk (650 ms) between two nearby scene points; to/from home, over long distances (>260 px) or during fragment
     navigation it fades out in place and fades in at the new spot (320 ms), so it never crosses unrelated content.
   - Reduced motion (desktop): a still copy in each scene's `still` pose, no movement. */
import { $, S, SCENES, hooks, clamp01, lerp, ease, poke, MQ_WIDE } from './core.js';
import { createHoca } from './hoca.js';
import { readAw } from './scenes.js';
import { current, isQuiet } from './nav.js';

var hoca = null, homeEl, homePt = { x: 0, y: 0 }, H = { owner: null, from: null, t0: 0, pos: null, fade: null };
var WALK_MAX = 260;
export const state = { dismissed: false };   /* shared flag read by scenes: the user dismissed Hoca, so scenes should return a null claim */

var HIDDEN = { visible: false, x: 0, y: 0, pose: 'idle', face: 1, bubble: null, tag: null, squash: 0, alpha: 0 };
function hide() { if (hoca) hoca.render(HIDDEN); H.owner = null; H.from = null; H.fade = null; H.pos = null; }
/* the sprite is painted on first use (painting every pose is not free); scenes registered later can still claim it */
function ensure() { return hoca || (hoca = createHoca()); }

function tick(t) {
  if (!S.motion) return false;
  var sc = null, want = 'home';
  if (Date.now() >= S.lockUntil) for (var i = 0; i < SCENES.length; i++) if (SCENES[i].hoca) { sc = SCENES[i].hoca; want = SCENES[i]; break; }
  if (!sc && !homeEl) { if (H.owner) hide(); return false; }   /* no claim and no home position: nowhere to stand */
  ensure();
  var tg = sc ? sc : { x: homePt.x, y: homePt.y, pose: 'idle', face: 1, bubble: null, tag: null, alpha: isQuiet(current()) ? .45 : 1 };
  if (want !== H.owner) {
    if (H.owner && H.pos && !(sc && sc.hidden)) {
      if (H.owner === 'home' || want === 'home' || Math.hypot(tg.x - H.pos.x, tg.y - H.pos.y) > WALK_MAX) { H.fade = { x: H.pos.x, y: H.pos.y, pose: H.pos.pose, face: H.pos.face, a: H.pos.alpha, t0: t }; H.from = null; }
      else { H.from = { x: H.pos.x, y: H.pos.y }; H.t0 = t; H.fade = null; } }
    H.owner = want; }
  var s = { visible: !(sc && sc.hidden), x: tg.x, y: tg.y, pose: tg.pose, face: tg.face, bubble: tg.bubble, bubbleUp: !!tg.bubbleUp, tag: tg.tag, squash: tg.squash || 0, alpha: tg.alpha == null ? 1 : tg.alpha }, busy = false;
  if (H.fade) { var f = H.fade, q = (t - f.t0) / 320;   /* first half: fade out at the old spot; second half: fade in at the new one */
    if (q >= 1) H.fade = null;
    else { busy = true; s.bubble = null; s.tag = null;
      if (q < .5) { s.x = f.x; s.y = f.y; s.pose = f.pose; s.face = f.face; s.squash = 0; s.alpha = f.a * (1 - 2 * q); } else s.alpha *= 2 * q - 1; } }
  if (H.from) { var k = clamp01((t - H.t0) / 650);
    if (k >= 1) H.from = null;
    else { var e = ease(k); s.x = lerp(H.from.x, tg.x, e); s.y = lerp(H.from.y, tg.y, e); s.pose = Math.floor((t - H.t0) / 150) % 2 ? 'walkA' : 'walkB'; s.face = tg.x < H.from.x ? -1 : 1; s.bubble = null; s.tag = null; s.alpha = 1; busy = true; } }
  H.pos = { x: s.x, y: s.y, pose: s.pose, face: s.face, alpha: s.alpha }; hoca.render(s); return busy;
}

/* re-places the still copies (reduced motion on desktop); call it when a fig scene's state changes */
export function refresh() {
  var wantStatic = !S.motion && MQ_WIDE.matches;
  if (!hoca && !(wantStatic && SCENES.some(function (sc) { return sc.still && sc.dr; }))) return;
  ensure().clearPlaced();
  if (wantStatic) SCENES.forEach(function (sc) { if (!sc.still || !sc.dr) return; readAw(sc); var o = typeof sc.still === 'function' ? sc.still() : sc.still; if (o) hoca.place(sc.dr, { left: (o.x / sc.aw * 100) + '%', top: (o.y / sc.ah * 100) + '%', pose: o.pose, face: o.face || 1, bubble: o.bubble || null, bubbleUp: !!o.bubbleUp, tag: o.tag || null }); });
  if (!S.motion) hide();
}

export function init() {
  homeEl = $('#hoca-home');
  hooks.afterMeasure.unshift(function () { if (homeEl) { var r = homeEl.getBoundingClientRect(); homePt = { x: r.left + r.width / 2, y: r.bottom - 22 }; } });
  hooks.frame.push(tick);
  hooks.motion.push(refresh);
}
/* still copies are rebuilt too, so a dismissal also applies under reduced motion */
export function dismiss() { state.dismissed = true; refresh(); poke(); }
