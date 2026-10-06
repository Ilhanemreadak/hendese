/* Hendese · scroll sahneleri. Her sahne aynı arayüzü sunar:
   {live, measure(), setLive(on), tick(y, dt, t) -> meşgul mü, hoca, hud, still, dr, aw, ah}
   hoca/hud bu karenin talepleridir: Hoca'yı ilk talep eden, HUD'u en görünür olan alır.
   render() içinde düzen OKUMAYIN (yalnız class / CSS değişkeni / transform yazın); ölçüm measure() içindir.
   CSS varsayılanı = bitmiş hal; canlı mod kapanınca setLive(false) yazılan her şeyi temizler ve reset(api) çağrılır. */
import { $, $$, S, SCENES, clamp01, seg, lerp, ease, absTop, poke } from './core.js';

/* önbellekli class anahtarı; canlı mod kapanınca hepsi geri alınır */
function flagger() {
  var flags = new Map();
  return {
    cls: function (node, c, on) { var m = flags.get(node); if (!m) flags.set(node, m = {}); if (m[c] !== on) { m[c] = on; node.classList.toggle(c, on); } },
    clear: function () { flags.forEach(function (m, node) { for (var c in m) node.classList.remove(c); }); flags.clear(); }
  };
}
/* önbellekli CSS değişkeni yazıcı (--k) */
function setter(host) {
  var vars = {};
  return { set: function (k, v) { v = Math.round(v * 1000) / 1000; if (vars[k] !== v) { vars[k] = v; host.style.setProperty('--' + k, v); } },
    clear: function () { host.removeAttribute('style'); vars = {}; } };
}
/* çizim birimindeki Hoca talebini viewport px'e çevirir */
function claim(h, x0, y0, nat, s) {
  return { x: x0 + h.x / s.aw * nat.w, y: y0 + h.y / s.ah * nat.h, pose: h.pose || 'idle', face: h.face || 1, bubble: h.bubble || null, bubbleUp: !!h.bubbleUp, tag: h.tag || null, squash: h.squash || 0, alpha: 1, hidden: !!h.hidden };
}
function base(cfg, el, dr) {
  return { live: false, hoca: null, hud: null, still: cfg.still || null, dr: dr, aw: +dr.getAttribute('data-aw') || 1000, ah: +dr.getAttribute('data-ah') || 600 };
}
/* kap sorgusu --aw/--ah'ı değiştirebilir (dar varyant): her measure() hesaplanmış değeri okur */
function readAw(s) { var cs = getComputedStyle(s.dr); s.aw = +cs.getPropertyValue('--aw') || s.aw; s.ah = +cs.getPropertyValue('--ah') || s.ah; }
function commonApi(s, el, dr, f) {
  return { el: el, drawing: dr, get aw() { return s.aw; }, get ah() { return s.ah; }, seg: seg, ease: ease, lerp: lerp, clamp01: clamp01, cls: f.cls,
    live: function () { return s.live; }, poke: poke };
}

/* Düşük seviye kayıt: kendi tick/measure/setLive'ını yazan özel sahneler için (örn. kamera hareketli bir giriş sahnesi). */
export function scene(raw) { SCENES.push(raw); return raw; }

/* ---------- pin: uzun iz (--track) + yapışkan sahne; p = 0..1 iz ilerlemesi (yumuşatılmış) ----------
   render(p, api) -> {hud?: {stage, service, tag, env, pct, fill}, tb?: 0..1 (HUD antet hali), hoca?: {x, y, pose, face, bubble, bubbleUp, tag, squash, hidden}} */
export function pinScene(cfg) {
  var el = $(cfg.el); if (!el) return null;
  var stage = $('.route-stage', el), dr = $('.drawing', el), slot = $('.hud-slot', el);
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
    if (y < top - S.vh * 1.5 || y > top + L + S.vh * 1.5) { s.hoca = s.hud = null; first = true; return false; } /* uzakta: iş yok */
    var target = clamp01((y - top) / L);
    if (first) { p = target; first = false; } else { p += (target - p) * (1 - Math.pow(0.002, dt / 1000)); if (Math.abs(target - p) < 0.0004) p = target; }
    var out = cfg.render(p, api) || {}, stY = y < top ? top - y : y > top + L ? top + L - y : 0, h = out.hoca;
    s.hoca = h && stY > -SH * .35 && stY < SH * .6 ? claim(h, SX + nat.x, stY + nat.y, nat, s) : null;
    s.hud = out.hud && slotR ? { x: SX + slotR.x, y: stY + slotR.y, w: slotR.w, tb: clamp01(out.tb || 0), alpha: clamp01(1 + stY / (SH * .12)) * clamp01(1 - stY / (SH * .4)), f: Object.assign({ chap: cfg.chap }, out.hud) } : null;
    return p !== target;
  };
  SCENES.push(s); return s;
}

/* ---------- sticky: yapışkan şekil + kayan metin beat'leri ([data-beat]) ----------
   i = okuma çizgisini (%45) geçen son beat, t = o beat içindeki ilerleme. Beat'ler .on / .past alır.
   render(i, t, api) pin ile aynı nesneyi döndürür. Dar varyant: api.aw/ah her measure()'da hesaplanmış --aw/--ah'tan güncellenir. */
export function stickyScene(cfg) {
  var el = $(cfg.el); if (!el) return null;
  var fig = $('.sticky-fig', el), dr = $('.drawing', fig), slot = $('.hud-slot', fig), beats = $$('[data-beat]', el);
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
  SCENES.push(s); return s;
}

/* ---------- fig: akıştaki etkileşimli çizim (scroll ilerlemesi yok) ----------
   Durum ve olay işleyicileri bölümündür (her modda çalışır). render(api, t, vis) ekranda ve canlıyken her kare çalışır;
   vis = görünen pay. Döner: {hoca?, busy?: zamanlı bir beat sürüyorsa true}. Durum değişince api.poke() çağırın.
   still bir fonksiyon olabilir: Hendese.refresh() her çağrıldığında yeniden okunur. */
export function figScene(cfg) {
  var el = $(cfg.el); if (!el) return null;
  var dr = $('.drawing', el);
  var s = base(cfg, el, dr), f = flagger(), nat = null;
  var api = commonApi(s, el, dr, f);
  s.setLive = function (on) { s.live = on; el.classList.toggle('is-live', on);
    if (!on) { f.clear(); s.hoca = null; if (cfg.reset) cfg.reset(api); } };
  s.measure = function () { if (!s.live) return; readAw(s); var r = dr.getBoundingClientRect(); nat = { x: r.left, y: r.top + (window.scrollY || 0), w: r.width, h: r.height }; if (cfg.measure) cfg.measure(api); };
  s.tick = function (y, dt, t) {
    if (!s.live || !nat) return false;
    var fy = nat.y - y, vis = clamp01(Math.min(S.vh - fy, fy + nat.h, nat.h, S.vh) / Math.min(nat.h, S.vh));
    if (vis <= 0) { s.hoca = null; return false; }
    var out = cfg.render(api, t, vis) || {}, h = out.hoca;
    s.hoca = h && vis > .45 ? claim(h, nat.x, fy, nat, s) : null;
    return !!out.busy;
  };
  s.poke = poke;
  SCENES.push(s); return s;
}
