/* Hendese · Navigation: mobile drawer, section tracking (scroll-spy), reading progress bar, hash sync, fragment (hash) navigation lock,
   and re-anchoring to the target after late layout shifts (reanchor).
   HTML: [data-section][data-title] sections · #rail .nav-link[href="#id"] · #rail-pos · #topbar-cur · #progress-bar
         In a [data-hoca="quiet"] section Hoca stays home and the rail dims. Page-top id = opts.topId (default "top"). */
import { $, $$, S, absTop, hooks, poke, MQ_WIDE } from './core.js';
import { strings } from './strings.js';
import { pickSection } from './math.js';

var sections = [], secTops = [], links = {}, rail, railPos, topCur, bar, active = null, total = 0, TOP = 'top';
export function current() { return active; }
export function isQuiet(id) { var el = id && document.getElementById(id); return !!(el && el.getAttribute('data-hoca') === 'quiet'); }

/* location.hash is percent-encoded; ids are compared decoded (non-ASCII ids) */
function hashId() { var h = location.hash.slice(1); try { return decodeURIComponent(h); } catch (e) { return h; } }

/* while a fragment navigation smooth-scrolls, the target stays active and the hash is not rewritten (writing it interrupts the scroll).
   A target inside a section (figure, footnote) locks its enclosing section. */
export function lockTo(id) {
  var el = id && document.getElementById(id); if (el && id !== TOP) el = el.closest('[data-section]');
  if (!el || !el.id) return; S.lockId = el.id; S.lockUntil = Date.now() + 1600;
}
function pad(n) { return (n < 10 ? '0' : '') + n; }


function setActive(id) {
  if (active === id) return; active = id;
  Object.keys(links).forEach(function (k) { var on = k === id; links[k].classList.toggle('is-active', on); if (on) links[k].setAttribute('aria-current', 'true'); else links[k].removeAttribute('aria-current'); });
  if (rail) { rail.classList.toggle('compact', S.motion && id === TOP); rail.classList.toggle('hoca-quiet', isQuiet(id)); }
  var sec = document.getElementById(id);
  if (id === TOP || !sec) { if (railPos) railPos.textContent = strings.intro; if (topCur) topCur.textContent = ''; }
  else { var n = sections.indexOf(sec); if (railPos) railPos.textContent = pad(n) + ' / ' + total; if (topCur) topCur.textContent = pad(n) + '  ' + (sec.getAttribute('data-title') || ''); }
  var a = links[id], nav = rail && $('.rail-nav', rail);
  if (a && nav) { var rel = a.offsetTop - nav.offsetTop;
    if (rel < nav.scrollTop + 8) nav.scrollTop = Math.max(0, rel - 8); else if (rel + a.offsetHeight > nav.scrollTop + nav.clientHeight - 8) nav.scrollTop = rel + a.offsetHeight - nav.clientHeight + 8; }
}
function syncHash(id) { var want = id === TOP ? '' : id; if (hashId() !== want) { try { history.replaceState(history.state, '', want ? '#' + want : location.pathname + location.search); } catch (e) {} } }

function clamp(v) { return Math.max(0, Math.min(100, v)); }   /* overscroll (rubber-band) yields negative y */
function update(y) {
  if (!sections.length) return;
  var max = S.docH - S.vh, cur = pickSection(secTops, sections.map(function (s) { return s.id; }), y + S.vh * 0.34, max > 0 && y + S.vh >= S.docH - 4, TOP);
  var now = Date.now(), locked = (now < S.lockUntil || now < S.anchorUntil) && S.lockId;   /* landing holds the deep-link target until the user scrolls */
  setActive(locked ? S.lockId : cur);
  if (!locked) syncHash(cur);
  if (bar) bar.style.width = (max > 0 ? clamp(100 * y / max) : 0) + '%';
}

/* while late layout (fonts, scene setup) settles, the hash target is held in place until the user scrolls */
export function reanchor() {
  if (!location.hash || Date.now() > S.anchorUntil) return;
  var el = document.getElementById(hashId());
  if (el && Math.abs(el.getBoundingClientRect().top - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0)) > 3) { lockTo(el.id); el.scrollIntoView({ behavior: 'instant', block: 'start' }); }
}

/* ---------- mobile drawer ---------- */
var openBtn, lastFocus = null;
function navOpen() { return document.body.classList.contains('nav-open'); }
function openNav() { lastFocus = document.activeElement; document.body.classList.add('nav-open'); openBtn.setAttribute('aria-expanded', 'true'); var f = $('.nav-link.is-active', rail) || $('.nav-link', rail); setTimeout(function () { if (f) f.focus(); }, 60); }
function closeNav(refocus) { document.body.classList.remove('nav-open'); openBtn.setAttribute('aria-expanded', 'false'); if (refocus !== false && lastFocus && lastFocus.focus) lastFocus.focus(); }

export function init(opts) {
  TOP = opts.topId || 'top';
  rail = $('#rail'); railPos = $('#rail-pos'); topCur = $('#topbar-cur'); bar = $('#progress-bar'); openBtn = $('#nav-open');
  sections = $$('[data-section]'); total = sections.length - 1;
  if (rail && openBtn) {
    var closeBtn = $('#nav-close'), scrim = $('#scrim');
    openBtn.addEventListener('click', openNav);
    if (closeBtn) closeBtn.addEventListener('click', function () { closeNav(); });
    if (scrim) scrim.addEventListener('click', function () { closeNav(); });
    document.addEventListener('keydown', function (e) {
      if (!navOpen()) return;
      if (e.key === 'Escape') { e.preventDefault(); closeNav(); return; }
      if (e.key === 'Tab') { var f = $$('a[href],button:not([disabled])', rail).filter(function (el) { return el.offsetParent !== null; }); if (!f.length) return; var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
    });
  }
  if (rail) $$('.nav-link[href^="#"]', rail).forEach(function (a) { var id = a.getAttribute('href').slice(1); links[id] = a;
    a.addEventListener('click', function () { lockTo(id); if (openBtn && navOpen()) closeNav(false); }); });
  $$('a.brand').forEach(function (a) { a.addEventListener('click', function () { lockTo(TOP); }); });

  hooks.scroll.push(update);
  hooks.measure.push(function () { secTops = sections.map(absTop); });
  hooks.afterMeasure.push(function () { if (S.anchorUntil) reanchor(); });
  hooks.motion.push(function () { active = null; });
  window.addEventListener('scrollend', function () { S.lockUntil = 0; if (S.anchorUntil) reanchor(); poke(); });
  window.addEventListener('hashchange', function () { lockTo(hashId()); poke(); });
  /* the drawer exists only below 1100px: leaving that range releases its focus trap */
  MQ_WIDE.addEventListener('change', function (e) { if (e.matches && openBtn && navOpen()) closeNav(false); });
}

/* on load with a hash: smooth scrolling is off for 4 s and the target is anchored; released on the first user input */
export function landing() {
  if (!location.hash) return;
  var html = document.documentElement;
  S.anchorUntil = Date.now() + 4000; lockTo(hashId()); html.style.scrollBehavior = 'auto'; setTimeout(function () { html.style.scrollBehavior = ''; }, 4000);
  addEventListener('load', reanchor);
  ['wheel', 'keydown', 'pointerdown', 'touchstart'].forEach(function (e) { addEventListener(e, function () { S.anchorUntil = 0; }, { once: true, passive: true }); });
}
