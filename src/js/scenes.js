/* Hendese · Scenes: scroll-driven scenes. Every scene exposes the same interface:
   {live, measure(), setLive(on), tick(y, dt, t) -> busy?, hoca, hud, still, dr, aw, ah}
   hoca/hud are this frame's claims: the first claimant gets Hoca, the most visible one gets the HUD.
   Do NOT READ layout inside render() (write only classes / CSS variables / transforms); measuring belongs in measure().
   The CSS default = the finished state; when live mode turns off, setLive(false) clears everything written and reset(api) is called. */
import { $, $$, S, SCENES, hooks, clamp01, seg, lerp, ease, absTop, poke, measure, guard } from './core.js';

/* cached class toggle; when live mode turns off every touched class returns to its authored state */
function flagger() {
  var flags = new Map();
  return {
    cls: function (node, c, on) { var m = flags.get(node); if (!m) flags.set(node, m = {}); if (!m[c]) m[c] = { had: node.classList.contains(c) }; if (m[c].on !== on) { m[c].on = on; node.classList.toggle(c, on); } },
    clear: function () { flags.forEach(function (m, node) { for (var c in m) node.classList.toggle(c, m[c].had); }); flags.clear(); }
  };
}
/* cached CSS variable writer (--k); clear() restores the authored inline style */
function setter(host) {
  var vars = {}, authored = host.getAttribute('style');
  return { set: function (k, v) { v = Math.round(v * 1000) / 1000; if (vars[k] !== v) { vars[k] = v; host.style.setProperty('--' + k, v); } },
    clear: function () { if (authored == null) host.removeAttribute('style'); else host.setAttribute('style', authored); vars = {}; } };
}
/* converts a Hoca claim from drawing units to viewport px */
function claim(h, x0, y0, nat, s) {
  return { x: x0 + h.x / s.aw * nat.w, y: y0 + h.y / s.ah * nat.h, pose: h.pose || 'idle', face: h.face || 1, bubble: h.bubble || null, bubbleUp: !!h.bubbleUp, tag: h.tag || null, squash: h.squash || 0, alpha: 1, hidden: !!h.hidden };
}
function base(cfg, el, dr) {
  return { live: false, hoca: null, hud: null, still: cfg.still || null, dr: dr, aw: +dr.getAttribute('data-aw') || 1000, ah: +dr.getAttribute('data-ah') || 600 };
}
/* a container query may change --aw/--ah (narrow variant): every measure() reads the computed value */
export function readAw(s) { var cs = getComputedStyle(s.dr); s.aw = +cs.getPropertyValue('--aw') || s.aw; s.ah = +cs.getPropertyValue('--ah') || s.ah; }
function commonApi(s, el, dr, f) {
  return { el: el, drawing: dr, get aw() { return s.aw; }, get ah() { return s.ah; }, seg: seg, ease: ease, lerp: lerp, clamp01: clamp01, cls: f.cls,
    live: function () { return s.live; }, poke: poke };
}

/* a scene registered after Hendese.start() (lazy content) joins the current mode immediately; existing scenes are not reset */
function add(s) {
  SCENES.push(s);
  if (S.started) { guard(s.setLive, s, [S.motion]); hooks.motion.forEach(function (f) { guard(f, null, [S.motion]); }); measure(); }
  return s;
}
/* a missing required child skips the scene with a warning instead of breaking start() */
function need(cfg, parts) {
  for (var k in parts) if (!parts[k]) { console.warn('Hendese: ' + cfg.el + ' has no ' + k + '; scene skipped'); return false; }
  return true;
}

/* Low-level registration for custom scenes that implement their own tick/measure/setLive (e.g. an intro scene with a moving camera). */
export function scene(raw) { return add(raw); }

/* ---------- pin: long track (--track) + sticky stage; p = 0..1 track progress (smoothed) ----------
   render(p, api) -> {hud?: {stage, service, tag, env, pct, fill}, tb?: 0..1 (HUD title block state), hoca?: {x, y, pose, face, bubble, bubbleUp, tag, squash, hidden}} */
export function pinScene(cfg) {
  var el = $(cfg.el); if (!el) return null;
  var stage = $('.route-stage', el), dr = $('.drawing', el), slot = $('.hud-slot', el);
  if (!need(cfg, { '.route-stage': stage, '.drawing': dr })) return null;
  var s = base(cfg, el, dr), f = flagger(), v = setter(stage);
  var top = 0, L = 1, p = 0, first = true, nat = null, SH = 1, SX = 0, slotR = null;
  var api = commonApi(s, el, dr, f); api.stage = stage; api.set = v.set;
  s.setLive = function (on) { s.live = on; el.classList.toggle('is-live', on); first = true;
    if (!on) { v.clear(); f.clear(); s.hoca = s.hud = null; if (cfg.reset) cfg.reset(api); } };
  s.measure = function () { if (!s.live) return; top = absTop(el); L = Math.max(1, el.offsetHeight - S.vh); readAw(s);
    var sr = stage.getBoundingClientRect(), r = dr.getBoundingClientRect(); nat = { x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height }; SH = sr.height; SX = sr.left;
    if (slot) { var q = slot.getBoundingClientRect(); slotR = { x: q.left - sr.left, y: q.top - sr.top, w: q.width }; } if (cfg.measure) cfg.measure(api); };
  s.tick = function (y, dt) {
    if (!s.live || !nat) return false;
    if (y < top - S.vh * 1.5 || y > top + L + S.vh * 1.5) { s.hoca = s.hud = null; first = true; return false; } /* far away: nothing to do */
    var target = clamp01((y - top) / L);
    if (first) { p = target; first = false; } else { p += (target - p) * (1 - Math.pow(0.002, dt / 1000)); if (Math.abs(target - p) < 0.0004) p = target; }
    var out = cfg.render(p, api) || {}, stY = y < top ? top - y : y > top + L ? top + L - y : 0, h = out.hoca;
    s.hoca = h && stY > -SH * .35 && stY < SH * .6 ? claim(h, SX + nat.x, stY + nat.y, nat, s) : null;
    s.hud = out.hud && slotR ? { x: SX + slotR.x, y: stY + slotR.y, w: slotR.w, tb: clamp01(out.tb || 0), alpha: clamp01(1 + stY / (SH * .12)) * clamp01(1 - stY / (SH * .4)), f: Object.assign({ chap: cfg.chap }, out.hud) } : null;
    return p !== target;
  };
  return add(s);
}

/* ---------- sticky: sticky figure + scrolling text beats ([data-beat]) ----------
   i = last beat past the reading line (45%), t = progress within that beat. Beats get .on / .past.
   render(i, t, api) returns the same object as pin. Narrow variant: api.aw/ah update from the computed --aw/--ah on every measure(). */
export function stickyScene(cfg) {
  var el = $(cfg.el); if (!el) return null;
  var fig = $('.sticky-fig', el), dr = $('.drawing', fig), slot = $('.hud-slot', fig), beats = $$('[data-beat]', el);
  if (!need(cfg, { '.sticky-fig': fig, '.drawing': dr })) return null;
  var s = base(cfg, el, dr), f = flagger(), v = setter(fig);
  var top = 0, bot = 1, tops = [], FH = 1, nat = null, FX = 0, slotR = null, cur = -1;
  var api = commonApi(s, el, dr, f); api.fig = fig; api.beats = beats; api.set = v.set;
  s.setLive = function (on) { s.live = on; el.classList.toggle('is-live', on); cur = -1;
    if (!on) { v.clear(); f.clear(); s.hoca = s.hud = null; if (cfg.reset) cfg.reset(api); } };
  s.measure = function () { if (!s.live) return; top = absTop(el); bot = top + el.offsetHeight; tops = beats.map(absTop); readAw(s);
    var fr = fig.getBoundingClientRect(), r = dr.getBoundingClientRect(); nat = { x: r.left - fr.left, y: r.top - fr.top, w: r.width, h: r.height }; FH = fr.height; FX = fr.left;
    if (slot) { var q = slot.getBoundingClientRect(); slotR = { x: q.left - fr.left, y: q.top - fr.top, w: q.width }; } if (cfg.measure) cfg.measure(api); };
  s.tick = function (y) {
    if (!s.live || !nat) return false;
    if (y < top - S.vh * 1.5 || y > bot + S.vh * .5) { s.hoca = s.hud = null; cur = -1; return false; }
    var line = y + S.vh * .45, i = 0; for (var k = 0; k < tops.length; k++) if (tops[k] <= line) i = k;
    var next = i + 1 < tops.length ? tops[i + 1] : bot, t = clamp01((line - tops[i]) / Math.max(1, next - tops[i]));
    if (i !== cur) { cur = i; beats.forEach(function (b, k) { f.cls(b, 'on', k === i); f.cls(b, 'past', k < i); }); }
    var out = cfg.render(i, t, api) || {}, fy = y < top ? top - y : y > bot - FH ? bot - FH - y : 0, h = out.hoca;
    s.hoca = h && fy > -FH * .35 && fy < S.vh * .6 ? claim(h, FX + nat.x, fy + nat.y, nat, s) : null;
    s.hud = out.hud && slotR ? { x: FX + slotR.x, y: fy + slotR.y, w: slotR.w, tb: clamp01(out.tb || 0), alpha: clamp01(1 + fy / (FH * .12)) * clamp01(1 - fy / (S.vh * .4)), f: Object.assign({ chap: cfg.chap }, out.hud) } : null;
    return false;
  };
  return add(s);
}

/* ---------- fig: interactive in-flow drawing (no scroll progress) ----------
   State and event handlers belong to the section (they run in every mode). render(api, t, vis) runs every frame while on screen and live;
   vis = visible fraction. Returns {hoca?, busy?: true while a timed beat is running}. Call api.poke() when state changes.
   still may be a function: it is re-read on every Hendese.refresh() call. */
export function figScene(cfg) {
  var el = $(cfg.el); if (!el) return null;
  var dr = $('.drawing', el);
  if (!need(cfg, { '.drawing': dr })) return null;
  var s = base(cfg, el, dr), f = flagger(), nat = null;
  var api = commonApi(s, el, dr, f);
  s.setLive = function (on) { s.live = on; el.classList.toggle('is-live', on);
    if (!on) { f.clear(); s.hoca = null; if (cfg.reset) cfg.reset(api); } };
  s.measure = function () { if (!s.live) return; readAw(s); var r = dr.getBoundingClientRect(); nat = { x: r.left, y: r.top + (window.scrollY || 0), w: r.width, h: r.height }; if (cfg.measure) cfg.measure(api); };
  s.tick = function (y, dt, t) {
    if (!s.live || !nat || !nat.h) return false;   /* a collapsed drawing (closed details, hidden tab) has nothing to show */
    var fy = nat.y - y, vis = clamp01(Math.min(S.vh - fy, fy + nat.h, nat.h, S.vh) / Math.min(nat.h, S.vh));
    if (vis <= 0) { s.hoca = null; return false; }
    var out = cfg.render(api, t, vis) || {}, h = out.hoca;
    s.hoca = h && vis > .45 ? claim(h, nat.x, fy, nat, s) : null;
    return !!out.busy;
  };
  s.poke = poke;
  return add(s);
}
