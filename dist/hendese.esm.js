/* Hendese 0.3.0 */

// src/js/math.js
function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
function seg(p, a, b) {
  return clamp01((p - a) / (b - a));
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function ease(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
function pickSection(tops, ids, line, atBottom, topId) {
  var cur = topId;
  for (var i = 0; i < tops.length; i++) if (tops[i] <= line) cur = ids[i];
  if (atBottom && ids.length) cur = ids[ids.length - 1];
  return cur;
}

// src/js/core.js
var $ = (s, r) => (r || document).querySelector(s);
var $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
function absTop(el) {
  return el.getBoundingClientRect().top + (window.scrollY || 0);
}
var MQ_RM = matchMedia("(prefers-reduced-motion: reduce)");
var MQ_WIDE = matchMedia("(min-width:1100px)");
var S = { motion: false, y: window.scrollY || 0, vh: innerHeight, docH: 1, dirty: true, sleeping: true, last: 0, lockUntil: 0, lockId: null, anchorUntil: 0 };
var SCENES = [];
var hooks = { scroll: [], frame: [], measure: [], afterMeasure: [], motion: [] };
function wake() {
  if (S.sleeping) {
    S.sleeping = false;
    S.last = performance.now();
    requestAnimationFrame(frame);
  }
}
function poke() {
  S.dirty = true;
  wake();
}
function frame(t) {
  var dt = Math.min(64, t - S.last);
  S.last = t;
  if (S.dirty) {
    S.y = window.scrollY || 0;
    S.dirty = false;
    hooks.scroll.forEach(function(f) {
      f(S.y);
    });
  }
  var busy = false;
  for (var i = 0; i < SCENES.length; i++) if (SCENES[i].tick(S.y, dt, t)) busy = true;
  hooks.frame.forEach(function(f) {
    if (f(t, dt)) busy = true;
  });
  if (busy || S.dirty) requestAnimationFrame(frame);
  else S.sleeping = true;
}
function measure() {
  S.vh = innerHeight;
  S.docH = document.documentElement.scrollHeight;
  hooks.measure.forEach(function(f) {
    f();
  });
  SCENES.forEach(function(sc) {
    sc.measure();
  });
  hooks.afterMeasure.forEach(function(f) {
    f();
  });
  poke();
}
function evalMotion() {
  S.motion = !MQ_RM.matches && MQ_WIDE.matches;
  document.documentElement.classList.toggle("motion", S.motion);
  SCENES.forEach(function(sc) {
    sc.setLive(S.motion);
  });
  hooks.motion.forEach(function(f) {
    f(S.motion);
  });
  measure();
}

// src/js/strings.js
var strings = {
  intro: "Giriş",
  copy: "Kopyala",
  copied: "Kopyalandı",
  copyFail: "Kopyalanamadı",
  toLight: "Açık temaya geç",
  toDark: "Koyu temaya geç"
};

// src/js/theme.js
function init(key) {
  var html = document.documentElement;
  if (!html.getAttribute("data-theme")) {
    var t0 = null;
    try {
      t0 = localStorage.getItem(key);
    } catch (e) {
    }
    html.setAttribute("data-theme", t0 === "dark" || t0 === "light" ? t0 : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }
  function labels() {
    var t = html.getAttribute("data-theme");
    $$("[data-theme-toggle]").forEach(function(b) {
      var l = t === "dark" ? strings.toLight : strings.toDark;
      b.setAttribute("aria-label", l);
      b.title = l;
    });
  }
  $$("[data-theme-toggle]").forEach(function(b) {
    b.addEventListener("click", function() {
      var t = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", t);
      try {
        localStorage.setItem(key, t);
      } catch (e) {
      }
      labels();
      document.dispatchEvent(new CustomEvent("hendese:theme", { detail: t }));
    });
  });
  labels();
}

// src/js/nav.js
var sections = [];
var secTops = [];
var links = {};
var rail;
var railPos;
var topCur;
var bar;
var active = null;
var total = 0;
var TOP = "top";
function current() {
  return active;
}
function isQuiet(id) {
  var el = id && document.getElementById(id);
  return !!(el && el.getAttribute("data-hoca") === "quiet");
}
function lockTo(id) {
  if (!id || !document.getElementById(id)) return;
  S.lockId = id;
  S.lockUntil = Date.now() + 1600;
}
function pad(n) {
  return (n < 10 ? "0" : "") + n;
}
function setActive(id) {
  if (active === id) return;
  active = id;
  Object.keys(links).forEach(function(k) {
    var on = k === id;
    links[k].classList.toggle("is-active", on);
    if (on) links[k].setAttribute("aria-current", "true");
    else links[k].removeAttribute("aria-current");
  });
  if (rail) {
    rail.classList.toggle("compact", S.motion && id === TOP);
    rail.classList.toggle("hoca-quiet", isQuiet(id));
  }
  var sec = document.getElementById(id);
  if (id === TOP || !sec) {
    if (railPos) railPos.textContent = strings.intro;
    if (topCur) topCur.textContent = "";
  } else {
    var n = sections.indexOf(sec);
    if (railPos) railPos.textContent = pad(n) + " / " + total;
    if (topCur) topCur.textContent = pad(n) + "  " + (sec.getAttribute("data-title") || "");
  }
  var a = links[id], nav = rail && $(".rail-nav", rail);
  if (a && nav) {
    var rel = a.offsetTop - nav.offsetTop;
    if (rel < nav.scrollTop + 8) nav.scrollTop = Math.max(0, rel - 8);
    else if (rel + a.offsetHeight > nav.scrollTop + nav.clientHeight - 8) nav.scrollTop = rel + a.offsetHeight - nav.clientHeight + 8;
  }
}
function syncHash(id) {
  var want = id === TOP ? "" : "#" + id;
  if (location.hash !== want) {
    try {
      history.replaceState(null, "", want || location.pathname + location.search);
    } catch (e) {
    }
  }
}
function update(y) {
  if (!sections.length) return;
  var max = S.docH - S.vh, cur = pickSection(secTops, sections.map(function(s) {
    return s.id;
  }), y + S.vh * 0.34, max > 0 && y + S.vh >= S.docH - 4, TOP);
  var locked = Date.now() < S.lockUntil && S.lockId;
  setActive(locked ? S.lockId : cur);
  if (!locked) syncHash(cur);
  if (bar) bar.style.width = (max > 0 ? Math.min(100, 100 * y / max) : 0) + "%";
}
function reanchor() {
  if (!location.hash || Date.now() > S.anchorUntil) return;
  var el = document.getElementById(location.hash.slice(1));
  if (el && Math.abs(el.getBoundingClientRect().top - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0)) > 3) {
    lockTo(el.id);
    el.scrollIntoView({ behavior: "instant", block: "start" });
  }
}
var openBtn;
var lastFocus = null;
function navOpen() {
  return document.body.classList.contains("nav-open");
}
function openNav() {
  lastFocus = document.activeElement;
  document.body.classList.add("nav-open");
  openBtn.setAttribute("aria-expanded", "true");
  var f = $(".nav-link.is-active", rail) || $(".nav-link", rail);
  setTimeout(function() {
    if (f) f.focus();
  }, 60);
}
function closeNav(refocus) {
  document.body.classList.remove("nav-open");
  openBtn.setAttribute("aria-expanded", "false");
  if (refocus !== false && lastFocus && lastFocus.focus) lastFocus.focus();
}
function init2(opts) {
  TOP = opts.topId || "top";
  rail = $("#rail");
  railPos = $("#rail-pos");
  topCur = $("#topbar-cur");
  bar = $("#progress-bar");
  openBtn = $("#nav-open");
  sections = $$("[data-section]");
  total = sections.length - 1;
  if (rail && openBtn) {
    var closeBtn = $("#nav-close"), scrim = $("#scrim");
    openBtn.addEventListener("click", openNav);
    if (closeBtn) closeBtn.addEventListener("click", function() {
      closeNav();
    });
    if (scrim) scrim.addEventListener("click", function() {
      closeNav();
    });
    document.addEventListener("keydown", function(e) {
      if (!navOpen()) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeNav();
        return;
      }
      if (e.key === "Tab") {
        var f = $$("a[href],button:not([disabled])", rail).filter(function(el) {
          return el.offsetParent !== null;
        });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }
  if (rail) $$('.nav-link[href^="#"]', rail).forEach(function(a) {
    var id = a.getAttribute("href").slice(1);
    links[id] = a;
    a.addEventListener("click", function() {
      lockTo(id);
      if (openBtn && navOpen()) closeNav(false);
    });
  });
  $$("a.brand").forEach(function(a) {
    a.addEventListener("click", function() {
      lockTo(TOP);
    });
  });
  hooks.scroll.push(update);
  hooks.measure.push(function() {
    secTops = sections.map(absTop);
  });
  hooks.afterMeasure.push(function() {
    if (S.anchorUntil) reanchor();
  });
  hooks.motion.push(function() {
    active = null;
  });
  window.addEventListener("scrollend", function() {
    S.lockUntil = 0;
    if (S.anchorUntil) reanchor();
    poke();
  });
  window.addEventListener("hashchange", function() {
    lockTo(location.hash.slice(1));
    poke();
  });
}
function landing() {
  if (!location.hash) return;
  var html = document.documentElement;
  S.anchorUntil = Date.now() + 4e3;
  html.style.scrollBehavior = "auto";
  setTimeout(function() {
    html.style.scrollBehavior = "";
  }, 4e3);
  addEventListener("load", reanchor);
  ["wheel", "keydown", "pointerdown", "touchstart"].forEach(function(e) {
    addEventListener(e, function() {
      S.anchorUntil = 0;
    }, { once: true, passive: true });
  });
}

// src/js/hud.js
var hud;
var fill;
var F = {};
var V = {};
var pos = "";
function set(o) {
  for (var k in o) {
    if (V[k] !== o[k]) {
      V[k] = o[k];
      if (k === "fill") {
        if (fill) fill.style.transform = "scaleX(" + o[k] + ")";
      } else if (F[k]) F[k].textContent = o[k];
    }
  }
}
function place(x, y, w, tb, alpha) {
  var key = Math.round(x) + "," + Math.round(y) + "," + Math.round(w) + "," + tb.toFixed(3) + "," + alpha.toFixed(3);
  if (key === pos) return;
  pos = key;
  hud.style.transform = "translate3d(" + Math.round(x) + "px," + Math.round(y) + "px,0)";
  hud.style.width = Math.round(w) + "px";
  hud.style.setProperty("--tb", tb.toFixed(3));
  hud.style.opacity = alpha.toFixed(3);
  hud.style.visibility = alpha > 0 ? "visible" : "hidden";
}
function init3() {
  hud = $("#hud");
  if (!hud) return;
  fill = $("#hud-fill", hud);
  $$("[data-hud]", hud).forEach(function(el) {
    F[el.getAttribute("data-hud")] = el;
  });
  hooks.frame.push(function() {
    var hb = null;
    SCENES.forEach(function(sc) {
      if (sc.hud && (!hb || sc.hud.alpha > hb.alpha)) hb = sc.hud;
    });
    if (hb) {
      set(hb.f);
      place(hb.x, hb.y, hb.w, hb.tb, hb.alpha);
    } else place(0, 0, 260, 0, 0);
    return false;
  });
}

// src/js/hoca.js
function createHoca() {
  var S2 = 2, W = 44, H2 = 36;
  var PAL = {
    b: "#d97757",
    B: "#c2654b",
    e: "#1f1a1c",
    g: "#2b2226",
    G: "#7a3a28",
    t: "#fbfbf8",
    o: "#fc6d26",
    l: "#9aa0aa",
    r: "#9a6a3a",
    R: "#f1d08a",
    d: "#8fcfff",
    y: "#f5c542",
    n: "#a8744a",
    N: "#7a5033",
    p: "#6b4fd6",
    k: "#2a66d0",
    s: "#3b3f47",
    m: "#7ee29a"
  };
  function R(g, x, y, w, h, c) {
    for (var j = y; j < y + h; j++) for (var i = x; i < x + w; i++) if (i >= 0 && i < W && j >= 0 && j < H2) g[j][i] = c;
  }
  function P(g, x, y, rows) {
    rows.forEach(function(r, j) {
      r.split("").forEach(function(c, i) {
        if (c !== ".") R(g, x + i, y + j, 1, 1, c);
      });
    });
  }
  function body(g, o) {
    R(g, 10, 14, 24, 16, "b");
    R(g, 10, 29, 24, 1, "B");
    var L2 = o.legs || "stand";
    [12, 16, 26, 30].forEach(function(x, i) {
      var lift = L2 === "walkA" && i % 2 === 0 || L2 === "walkB" && i % 2 === 1;
      R(g, x, 30, 2, L2 === "sit" ? 6 : lift ? 3 : 4, "b");
    });
    var E = o.eyes || "n";
    [14, 28].forEach(function(x) {
      if (E === "n") R(g, x, 18, 2, 4, "e");
      else if (E === "down") R(g, x + 1, 20, 2, 2, "e");
      else if (E === "happy") {
        R(g, x, 19, 2, 1, "e");
        R(g, x - 1, 20, 1, 1, "e");
        R(g, x + 2, 20, 1, 1, "e");
      } else if (E === "worried") R(g, x, 19, 2, 3, "e");
    });
    if (o.glasses !== false) {
      [12, 26].forEach(function(x) {
        R(g, x + 1, 17, 4, 1, "G");
        R(g, x + 1, 22, 4, 1, "G");
        R(g, x, 18, 1, 4, "G");
        R(g, x + 5, 18, 1, 4, "G");
      });
      R(g, 18, 19, 8, 1, "G");
    }
    if (o.left !== false) R(g, 6, o.leftY || 22, 4, 4, "b");
    if (o.right === true || o.right == null) R(g, 34, 22, 4, 4, "b");
  }
  function crate(g) {
    P(g, 35, 15, ["NNNNNNNNN", "NnnnnnnnN", "NNNNNNNNN", "NnnttttnN", "NnnttttnN", "NNNNNNNNN", "NnnnnnnnN", "NNNNNNNNN"]);
  }
  function card(g) {
    P(g, 38, 17, ["gggggg", "gtttog", "gttoog", "gttttg", "gteeeg", "gttttg", "gteetg", "gttttg", "gggggg"]);
  }
  var POSES = {
    idle: function(g) {
      body(g, {});
    },
    carry: function(g) {
      body(g, {});
      card(g);
    },
    walkA: function(g) {
      body(g, { legs: "walkA" });
      card(g);
    },
    walkB: function(g) {
      body(g, { legs: "walkB" });
      card(g);
    },
    pointUp: function(g) {
      body(g, { right: false });
      R(g, 34, 19, 3, 4, "b");
      R(g, 36, 16, 2, 4, "b");
      [[38, 13], [39, 11], [40, 9], [41, 7], [42, 5], [43, 3]].forEach(function(c) {
        R(g, c[0], c[1], 1, 2, "r");
      });
      R(g, 43, 2, 1, 1, "R");
    },
    pointDown: function(g) {
      body(g, {});
      [[38, 25], [39, 27], [40, 29], [41, 31], [42, 33]].forEach(function(c) {
        R(g, c[0], c[1], 1, 2, "r");
      });
      R(g, 43, 35, 1, 1, "R");
    },
    glasses: function(g) {
      body(g, { right: false });
      R(g, 34, 17, 2, 8, "b");
      R(g, 31, 15, 5, 2, "b");
    },
    terminal: function(g) {
      body(g, { eyes: "down" });
      R(g, 34, 32, 10, 2, "s");
      R(g, 38, 23, 6, 9, "s");
      R(g, 39, 24, 4, 7, "#");
    },
    stamp: function(g) {
      body(g, { right: false });
      R(g, 34, 17, 4, 3, "b");
      P(g, 37, 9, [".NNNN.", "..nn..", "..nn..", "..nn..", "..nn..", "..nn..", "..nn..", "NNNNNN", "NNNNNN", "oooooo"]);
      P(g, 35, 31, ["yyyyyyyyy", "yeyyyyyyy", "yyyyyyyyy"]);
    },
    worried: function(g) {
      body(g, { eyes: "worried", leftY: 17, right: false });
      R(g, 34, 17, 4, 4, "b");
      P(g, 36, 10, [".d.", "ddd", "ddd"]);
    },
    happy: function(g) {
      body(g, { eyes: "happy", left: false, right: false });
      R(g, 8, 16, 2, 4, "b");
      R(g, 6, 12, 2, 4, "b");
      R(g, 34, 16, 2, 4, "b");
      R(g, 36, 12, 2, 4, "b");
      P(g, 2, 6, [".y.", "yyy", ".y."]);
      P(g, 39, 6, [".y.", "yyy", ".y."]);
    },
    sit: function(g) {
      body(g, { legs: "sit" });
    },
    shrug: function(g) {
      body(g, { left: false, right: false });
      R(g, 6, 19, 4, 3, "b");
      R(g, 3, 16, 3, 3, "b");
      R(g, 34, 19, 4, 3, "b");
      R(g, 38, 16, 3, 3, "b");
    },
    stepA: function(g) {
      body(g, { legs: "walkA" });
    },
    stepB: function(g) {
      body(g, { legs: "walkB" });
    },
    crateWalkA: function(g) {
      body(g, { legs: "walkA" });
      crate(g);
    },
    crateWalkB: function(g) {
      body(g, { legs: "walkB" });
      crate(g);
    },
    clipboard: function(g) {
      body(g, {});
      P(g, 37, 14, ["..lll..", "nnlllnn", "ntttttn", "nteeetn", "ntttttn", "nteeetn", "ntttttn", "nteettn", "ntttttn", "nnnnnnn"]);
    },
    keycard: function(g) {
      body(g, {});
      P(g, 38, 17, ["pppppp", "pppppp", "tttttt", "pppppp", "pttppp", "ptptpp", "pttttp", "pppppp"]);
    },
    crate: function(g) {
      body(g, {});
      crate(g);
    },
    helm: function(g) {
      body(g, {});
      P(g, 36, 15, ["...k...", "..kkk..", ".k.k.k.", "kkkkkkk", ".k.k.k.", "..kkk..", "...k..."]);
    }
  };
  var LAPTOP_SCREEN = "#1c2530";
  var anchors = {};
  for (var n in POSES) anchors[n] = n === "sit" ? { x: 44, y: 60 } : { x: 44, y: 68 };
  function paint(name) {
    var g = [];
    for (var y = 0; y < H2; y++) {
      g.push([]);
      for (var x = 0; x < W; x++) g[y].push(".");
    }
    POSES[name](g);
    var cv = document.createElement("canvas");
    cv.width = W * S2;
    cv.height = H2 * S2;
    var ctx = cv.getContext("2d");
    g.forEach(function(r, y2) {
      r.forEach(function(ch, x2) {
        if (ch === ".") return;
        ctx.fillStyle = ch === "#" ? LAPTOP_SCREEN : PAL[ch];
        ctx.fillRect(x2 * S2, y2 * S2, S2, S2);
      });
    });
    if (name === "terminal") {
      ctx.fillStyle = PAL.m;
      ctx.fillRect(40 * S2, 25 * S2, 4, 2);
      ctx.fillRect(40 * S2, 27 * S2, 6, 2);
      ctx.fillRect(40 * S2, 29 * S2, 3, 2);
    }
    return cv.toDataURL();
  }
  var layer = document.createElement("div");
  layer.className = "hoca-layer";
  layer.setAttribute("aria-hidden", "true");
  var el = document.createElement("div");
  el.className = "hoca";
  el.hidden = true;
  var img = document.createElement("img");
  img.className = "hoca-img";
  img.alt = "";
  img.width = W * S2;
  img.height = H2 * S2;
  var tag = document.createElement("span");
  tag.className = "hoca-tag";
  tag.hidden = true;
  var bub = document.createElement("div");
  bub.className = "hoca-bubble";
  el.appendChild(img);
  el.appendChild(tag);
  el.appendChild(bub);
  layer.appendChild(el);
  document.body.appendChild(layer);
  var srcs = {}, L = {};
  function setPose(p) {
    if (p !== L.pose) {
      L.pose = p;
      img.src = srcs[p];
    }
  }
  function setLook(face, squash) {
    var key = face + "|" + squash;
    if (key === L.look) return;
    L.look = key;
    img.style.transform = "scale(" + face + "," + (1 - 0.12 * squash) + ")";
    el.classList.toggle("face-l", face < 0);
  }
  function setTag(t) {
    if (t === L.tag) return;
    L.tag = t;
    tag.hidden = t == null;
    if (t != null) tag.textContent = t;
  }
  function setBubble(b) {
    if (b === L.bub) return;
    L.bub = b;
    if (b) {
      bub.textContent = b;
      bub.classList.toggle("mono", /[^\u0000-ɏ–—‘’“”…]/.test(b));
      L.bw = bub.offsetWidth;
    }
    bub.classList.toggle("on", !!b);
  }
  function setUp(up) {
    if (up !== L.up) {
      L.up = up;
      bub.classList.toggle("is-up", up);
    }
  }
  function setSide(right) {
    if (right !== L.right) {
      L.right = right;
      bub.classList.toggle("is-right", right);
    }
  }
  function render(s) {
    if (s.visible !== L.vis) {
      L.vis = s.visible;
      el.hidden = !s.visible;
    }
    if (!s.visible) return;
    setPose(s.pose);
    var a = anchors[s.pose], tx = Math.round(s.x - a.x), ty = Math.round(s.y - a.y);
    if (tx !== L.tx || ty !== L.ty) {
      L.tx = tx;
      L.ty = ty;
      el.style.transform = "translate3d(" + tx + "px," + ty + "px,0)";
    }
    setLook(s.face || 1, s.squash || 0);
    setBubble(s.bubble || null);
    if (s.bubble) setSide(s.x < L.bw + 20);
    setUp(!!s.bubbleUp);
    setTag(s.tag == null ? null : s.tag);
    var al = s.alpha == null ? 1 : s.alpha;
    if (al !== L.al) {
      L.al = al;
      el.style.opacity = al;
    }
  }
  var placed = [];
  function place2(container, o) {
    var c = document.createElement("div"), i = new Image(), a = anchors[o.pose] || anchors.idle;
    c.className = "hoca hoca-still" + ((o.face || 1) < 0 ? " face-l" : "");
    c.setAttribute("aria-hidden", "true");
    c.style.left = o.left;
    c.style.top = o.top;
    c.style.transform = "translate(" + -a.x + "px," + -a.y + "px)";
    i.className = "hoca-img";
    i.alt = "";
    i.width = W * S2;
    i.height = H2 * S2;
    i.src = srcs[o.pose] || srcs.idle;
    if ((o.face || 1) < 0) i.style.transform = "scale(-1,1)";
    c.appendChild(i);
    var bb = null;
    if (o.bubble) {
      bb = document.createElement("div");
      bb.className = "hoca-bubble on" + (o.bubbleUp ? " is-up" : "") + (/[^\u0000-ɏ–—‘’“”…]/.test(o.bubble) ? " mono" : "");
      bb.textContent = o.bubble;
      c.appendChild(bb);
    }
    if (o.tag) {
      var tg = document.createElement("span");
      tg.className = "hoca-tag";
      tg.textContent = o.tag;
      c.appendChild(tg);
    }
    container.appendChild(c);
    placed.push(c);
    if (bb && c.offsetLeft < bb.offsetWidth + 20) bb.classList.add("is-right");
  }
  function clearPlaced() {
    placed.forEach(function(c) {
      c.remove();
    });
    placed = [];
  }
  for (var n in POSES) srcs[n] = paint(n);
  return {
    render,
    place: place2,
    clearPlaced,
    size: { w: W * S2, h: H2 * S2, scale: S2 },
    anchors
  };
}

// src/js/scenes.js
function flagger() {
  var flags = /* @__PURE__ */ new Map();
  return {
    cls: function(node, c, on) {
      var m = flags.get(node);
      if (!m) flags.set(node, m = {});
      if (m[c] !== on) {
        m[c] = on;
        node.classList.toggle(c, on);
      }
    },
    clear: function() {
      flags.forEach(function(m, node) {
        for (var c in m) node.classList.remove(c);
      });
      flags.clear();
    }
  };
}
function setter(host) {
  var vars = {};
  return {
    set: function(k, v) {
      v = Math.round(v * 1e3) / 1e3;
      if (vars[k] !== v) {
        vars[k] = v;
        host.style.setProperty("--" + k, v);
      }
    },
    clear: function() {
      host.removeAttribute("style");
      vars = {};
    }
  };
}
function claim(h, x0, y0, nat, s) {
  return { x: x0 + h.x / s.aw * nat.w, y: y0 + h.y / s.ah * nat.h, pose: h.pose || "idle", face: h.face || 1, bubble: h.bubble || null, bubbleUp: !!h.bubbleUp, tag: h.tag || null, squash: h.squash || 0, alpha: 1, hidden: !!h.hidden };
}
function base(cfg, el, dr) {
  return { live: false, hoca: null, hud: null, still: cfg.still || null, dr, aw: +dr.getAttribute("data-aw") || 1e3, ah: +dr.getAttribute("data-ah") || 600 };
}
function readAw(s) {
  var cs = getComputedStyle(s.dr);
  s.aw = +cs.getPropertyValue("--aw") || s.aw;
  s.ah = +cs.getPropertyValue("--ah") || s.ah;
}
function commonApi(s, el, dr, f) {
  return {
    el,
    drawing: dr,
    get aw() {
      return s.aw;
    },
    get ah() {
      return s.ah;
    },
    seg,
    ease,
    lerp,
    clamp01,
    cls: f.cls,
    live: function() {
      return s.live;
    },
    poke
  };
}
function scene(raw) {
  SCENES.push(raw);
  return raw;
}
function pinScene(cfg) {
  var el = $(cfg.el);
  if (!el) return null;
  var stage = $(".route-stage", el), dr = $(".drawing", el), slot = $(".hud-slot", el);
  var s = base(cfg, el, dr), f = flagger(), v = setter(stage);
  var top = 0, L = 1, p = 0, first = true, nat = null, SH = 1, SX = 0, slotR = null;
  var api = commonApi(s, el, dr, f);
  api.stage = stage;
  api.set = v.set;
  s.setLive = function(on) {
    s.live = on;
    el.classList.toggle("is-live", on);
    first = true;
    if (!on) {
      v.clear();
      f.clear();
      s.hoca = s.hud = null;
      if (cfg.reset) cfg.reset(api);
    }
  };
  s.measure = function() {
    if (!s.live) return;
    top = absTop(el);
    L = Math.max(1, el.offsetHeight - S.vh);
    readAw(s);
    var sr = stage.getBoundingClientRect(), r = dr.getBoundingClientRect();
    nat = { x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height };
    SH = sr.height;
    SX = sr.left;
    if (slot) {
      var q = slot.getBoundingClientRect();
      slotR = { x: q.left - sr.left, y: q.top - sr.top, w: q.width };
    }
    if (cfg.measure) cfg.measure(api);
  };
  s.tick = function(y, dt) {
    if (!s.live || !nat) return false;
    if (y < top - S.vh * 1.5 || y > top + L + S.vh * 1.5) {
      s.hoca = s.hud = null;
      first = true;
      return false;
    }
    var target = clamp01((y - top) / L);
    if (first) {
      p = target;
      first = false;
    } else {
      p += (target - p) * (1 - Math.pow(2e-3, dt / 1e3));
      if (Math.abs(target - p) < 4e-4) p = target;
    }
    var out = cfg.render(p, api) || {}, stY = y < top ? top - y : y > top + L ? top + L - y : 0, h = out.hoca;
    s.hoca = h && stY > -SH * 0.35 && stY < SH * 0.6 ? claim(h, SX + nat.x, stY + nat.y, nat, s) : null;
    s.hud = out.hud && slotR ? { x: SX + slotR.x, y: stY + slotR.y, w: slotR.w, tb: clamp01(out.tb || 0), alpha: clamp01(1 + stY / (SH * 0.12)) * clamp01(1 - stY / (SH * 0.4)), f: Object.assign({ chap: cfg.chap }, out.hud) } : null;
    return p !== target;
  };
  SCENES.push(s);
  return s;
}
function stickyScene(cfg) {
  var el = $(cfg.el);
  if (!el) return null;
  var fig = $(".sticky-fig", el), dr = $(".drawing", fig), slot = $(".hud-slot", fig), beats = $$("[data-beat]", el);
  var s = base(cfg, el, dr), f = flagger(), v = setter(fig);
  var top = 0, bot = 1, tops = [], FH = 1, nat = null, FX = 0, slotR = null, cur = -1;
  var api = commonApi(s, el, dr, f);
  api.fig = fig;
  api.beats = beats;
  api.set = v.set;
  s.setLive = function(on) {
    s.live = on;
    el.classList.toggle("is-live", on);
    cur = -1;
    if (!on) {
      v.clear();
      f.clear();
      s.hoca = s.hud = null;
      if (cfg.reset) cfg.reset(api);
    }
  };
  s.measure = function() {
    if (!s.live) return;
    top = absTop(el);
    bot = top + el.offsetHeight;
    tops = beats.map(absTop);
    readAw(s);
    var fr = fig.getBoundingClientRect(), r = dr.getBoundingClientRect();
    nat = { x: r.left - fr.left, y: r.top - fr.top, w: r.width, h: r.height };
    FH = fr.height;
    FX = fr.left;
    if (slot) {
      var q = slot.getBoundingClientRect();
      slotR = { x: q.left - fr.left, y: q.top - fr.top, w: q.width };
    }
    if (cfg.measure) cfg.measure(api);
  };
  s.tick = function(y) {
    if (!s.live || !nat) return false;
    if (y < top - S.vh * 1.5 || y > bot + S.vh * 0.5) {
      s.hoca = s.hud = null;
      cur = -1;
      return false;
    }
    var line = y + S.vh * 0.45, i = 0;
    for (var k = 0; k < tops.length; k++) if (tops[k] <= line) i = k;
    var next = i + 1 < tops.length ? tops[i + 1] : bot, t = clamp01((line - tops[i]) / Math.max(1, next - tops[i]));
    if (i !== cur) {
      cur = i;
      beats.forEach(function(b, k2) {
        f.cls(b, "on", k2 === i);
        f.cls(b, "past", k2 < i);
      });
    }
    var out = cfg.render(i, t, api) || {}, fy = y < top ? top - y : y > bot - FH ? bot - FH - y : 0, h = out.hoca;
    s.hoca = h && fy > -FH * 0.35 && fy < S.vh * 0.6 ? claim(h, FX + nat.x, fy + nat.y, nat, s) : null;
    s.hud = out.hud && slotR ? { x: FX + slotR.x, y: fy + slotR.y, w: slotR.w, tb: clamp01(out.tb || 0), alpha: clamp01(1 + fy / (FH * 0.12)) * clamp01(1 - fy / (S.vh * 0.4)), f: Object.assign({ chap: cfg.chap }, out.hud) } : null;
    return false;
  };
  SCENES.push(s);
  return s;
}
function figScene(cfg) {
  var el = $(cfg.el);
  if (!el) return null;
  var dr = $(".drawing", el);
  var s = base(cfg, el, dr), f = flagger(), nat = null;
  var api = commonApi(s, el, dr, f);
  s.setLive = function(on) {
    s.live = on;
    el.classList.toggle("is-live", on);
    if (!on) {
      f.clear();
      s.hoca = null;
      if (cfg.reset) cfg.reset(api);
    }
  };
  s.measure = function() {
    if (!s.live) return;
    readAw(s);
    var r = dr.getBoundingClientRect();
    nat = { x: r.left, y: r.top + (window.scrollY || 0), w: r.width, h: r.height };
    if (cfg.measure) cfg.measure(api);
  };
  s.tick = function(y, dt, t) {
    if (!s.live || !nat) return false;
    var fy = nat.y - y, vis = clamp01(Math.min(S.vh - fy, fy + nat.h, nat.h, S.vh) / Math.min(nat.h, S.vh));
    if (vis <= 0) {
      s.hoca = null;
      return false;
    }
    var out = cfg.render(api, t, vis) || {}, h = out.hoca;
    s.hoca = h && vis > 0.45 ? claim(h, nat.x, fy, nat, s) : null;
    return !!out.busy;
  };
  s.poke = poke;
  SCENES.push(s);
  return s;
}

// src/js/hoca-controller.js
var hoca = null;
var homeEl;
var homePt = { x: 0, y: 0 };
var H = { owner: null, from: null, t0: 0, pos: null, fade: null };
var WALK_MAX = 260;
var state = { dismissed: false };
function tick(t) {
  if (!S.motion) return false;
  var sc = null, want = "home";
  if (Date.now() >= S.lockUntil) {
    for (var i = 0; i < SCENES.length; i++) if (SCENES[i].hoca) {
      sc = SCENES[i].hoca;
      want = SCENES[i];
      break;
    }
  }
  var tg = sc ? sc : { x: homePt.x, y: homePt.y, pose: "idle", face: 1, bubble: null, tag: null, alpha: isQuiet(current()) ? 0.45 : 1 };
  if (want !== H.owner) {
    if (H.owner && H.pos && !(sc && sc.hidden)) {
      if (H.owner === "home" || want === "home" || Math.hypot(tg.x - H.pos.x, tg.y - H.pos.y) > WALK_MAX) {
        H.fade = { x: H.pos.x, y: H.pos.y, pose: H.pos.pose, face: H.pos.face, a: H.pos.alpha, t0: t };
        H.from = null;
      } else {
        H.from = { x: H.pos.x, y: H.pos.y };
        H.t0 = t;
        H.fade = null;
      }
    }
    H.owner = want;
  }
  var s = { visible: !(sc && sc.hidden), x: tg.x, y: tg.y, pose: tg.pose, face: tg.face, bubble: tg.bubble, bubbleUp: !!tg.bubbleUp, tag: tg.tag, squash: tg.squash || 0, alpha: tg.alpha == null ? 1 : tg.alpha }, busy = false;
  if (H.fade) {
    var f = H.fade, q = (t - f.t0) / 320;
    if (q >= 1) H.fade = null;
    else {
      busy = true;
      s.bubble = null;
      s.tag = null;
      if (q < 0.5) {
        s.x = f.x;
        s.y = f.y;
        s.pose = f.pose;
        s.face = f.face;
        s.squash = 0;
        s.alpha = f.a * (1 - 2 * q);
      } else s.alpha *= 2 * q - 1;
    }
  }
  if (H.from) {
    var k = clamp01((t - H.t0) / 650);
    if (k >= 1) H.from = null;
    else {
      var e = ease(k);
      s.x = lerp(H.from.x, tg.x, e);
      s.y = lerp(H.from.y, tg.y, e);
      s.pose = Math.floor((t - H.t0) / 150) % 2 ? "walkA" : "walkB";
      s.face = tg.x < H.from.x ? -1 : 1;
      s.bubble = null;
      s.tag = null;
      s.alpha = 1;
      busy = true;
    }
  }
  H.pos = { x: s.x, y: s.y, pose: s.pose, face: s.face, alpha: s.alpha };
  hoca.render(s);
  return busy;
}
function refresh() {
  if (!hoca) return;
  var wantStatic = !S.motion && matchMedia("(min-width:1100px)").matches;
  hoca.clearPlaced();
  if (wantStatic) SCENES.forEach(function(sc) {
    if (sc.still && sc.dr) readAw(sc);
    var o = typeof sc.still === "function" ? sc.still() : sc.still;
    if (o) hoca.place(sc.dr, { left: o.x / sc.aw * 100 + "%", top: o.y / sc.ah * 100 + "%", pose: o.pose, face: o.face || 1, bubble: o.bubble || null, bubbleUp: !!o.bubbleUp, tag: o.tag || null });
  });
  if (!S.motion) {
    hoca.render({ visible: false, x: 0, y: 0, pose: "idle", face: 1, bubble: null, tag: null, squash: 0, alpha: 0 });
    H.owner = null;
    H.from = null;
    H.fade = null;
    H.pos = null;
  }
}
function init4() {
  homeEl = $("#hoca-home");
  if (!homeEl && !SCENES.some(function(sc) {
    return sc.still;
  })) return;
  hoca = createHoca();
  hooks.afterMeasure.unshift(function() {
    if (homeEl) {
      var r = homeEl.getBoundingClientRect();
      homePt = { x: r.left + r.width / 2, y: r.bottom - 22 };
    }
  });
  hooks.frame.push(tick);
  hooks.motion.push(refresh);
}
function dismiss() {
  state.dismissed = true;
  poke();
}

// src/js/widgets.js
function tables() {
  $$(".tbl").forEach(function(w) {
    if (!w.hasAttribute("tabindex")) w.setAttribute("tabindex", "0");
  });
  $$(".tbl table").forEach(function(t) {
    var ths = $$("thead th", t).map(function(th) {
      return th.textContent.trim();
    });
    $$("tbody tr", t).forEach(function(tr) {
      $$("td", tr).forEach(function(td, i) {
        if (ths[i]) td.setAttribute("data-th", ths[i]);
      });
    });
  });
}
function copy() {
  $$(".code").forEach(function(fig) {
    var btn = $(".code-copy", fig), code = $("code", fig);
    if (!btn || !code) return;
    var label = $("span", btn);
    label.setAttribute("aria-live", "polite");
    btn.addEventListener("click", function() {
      var text = code.textContent.replace(/\n+$/, "");
      function done(ok) {
        label.textContent = ok ? strings.copied : strings.copyFail;
        btn.setAttribute("data-state", ok ? "done" : "fail");
        setTimeout(function() {
          label.textContent = strings.copy;
          btn.removeAttribute("data-state");
        }, 1600);
      }
      function fallback() {
        var ok = false;
        try {
          var ta = document.createElement("textarea");
          ta.value = text;
          ta.setAttribute("readonly", "");
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          ok = document.execCommand("copy");
          ta.remove();
        } catch (e) {
        }
        done(ok);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function() {
        done(true);
      }, fallback);
      else fallback();
    });
  });
}
function runbooks() {
  $$(".runbook").forEach(function(rb) {
    var boxes = $$('input[type="checkbox"]', rb), count = $(".rb-count", rb), fill2 = $(".rb-bar i", rb), reset = $(".rb-reset", rb), key = rb.getAttribute("data-store");
    function save() {
      if (key) try {
        localStorage.setItem(key, JSON.stringify(boxes.map(function(b) {
          return b.checked;
        })));
      } catch (e) {
      }
    }
    function render() {
      var n = boxes.filter(function(b) {
        return b.checked;
      }).length;
      if (count) count.textContent = n + " / " + boxes.length;
      if (fill2) fill2.style.width = 100 * n / boxes.length + "%";
      rb.classList.toggle("complete", n === boxes.length);
      rb.dispatchEvent(new CustomEvent("hendese:runbook", { bubbles: true, detail: { done: n, total: boxes.length } }));
    }
    if (key) try {
      var s = JSON.parse(localStorage.getItem(key));
      if (Array.isArray(s)) boxes.forEach(function(b, i) {
        b.checked = !!s[i];
      });
    } catch (e) {
    }
    boxes.forEach(function(b) {
      b.addEventListener("change", function() {
        save();
        render();
      });
    });
    if (reset) reset.addEventListener("click", function() {
      boxes.forEach(function(b) {
        b.checked = false;
      });
      save();
      render();
      if (boxes[0]) boxes[0].focus();
    });
    render();
  });
}
function explorers() {
  $$("[data-explorer]").forEach(function(ex) {
    var panel = document.getElementById(ex.getAttribute("data-explorer"));
    if (!panel) return;
    var btns = $$("[data-key]", ex).filter(function(b) {
      return b.hasAttribute("aria-pressed");
    });
    var pre = btns.filter(function(b) {
      return b.getAttribute("aria-pressed") === "true";
    })[0] || btns[0], selected = pre && pre.getAttribute("data-key");
    function show(key) {
      $$("[data-for]", panel).forEach(function(d) {
        d.classList.toggle("show", d.getAttribute("data-for") === key);
      });
    }
    function select(key) {
      selected = key;
      btns.forEach(function(b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-key") === key));
      });
      show(key);
    }
    btns.forEach(function(b) {
      var k = b.getAttribute("data-key");
      b.addEventListener("click", function() {
        select(k);
        ex.dispatchEvent(new CustomEvent("hendese:explore", { bubbles: true, detail: { key: k } }));
      });
      b.addEventListener("mouseenter", function() {
        show(k);
      });
      b.addEventListener("mouseleave", function() {
        show(selected);
      });
      b.addEventListener("focus", function() {
        show(k);
      });
      b.addEventListener("blur", function() {
        show(selected);
      });
    });
    if (selected) select(selected);
  });
}
function tabs() {
  $$("[data-tabs]").forEach(function(root) {
    var list = $$('[role="tab"]', root).filter(function(t) {
      return t.closest("[data-tabs]") === root;
    });
    list.forEach(function(t) {
      if (!t.hasAttribute("type")) t.type = "button";
    });
    function select(t, focus, quiet) {
      list.forEach(function(x) {
        var on = x === t, p = document.getElementById(x.getAttribute("aria-controls"));
        x.setAttribute("aria-selected", String(on));
        x.tabIndex = on ? 0 : -1;
        if (p) p.hidden = !on;
      });
      if (focus) t.focus();
      if (!quiet) root.dispatchEvent(new CustomEvent("hendese:tab", { bubbles: true, detail: { id: t.id } }));
    }
    list.forEach(function(t, i) {
      t.addEventListener("click", function() {
        select(t);
      });
      t.addEventListener("keydown", function(e) {
        var k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: list.length - 1 }[e.key];
        if (k == null) return;
        e.preventDefault();
        select(list[(k + list.length) % list.length], true);
      });
    });
    if (list.length) select(list.filter(function(t) {
      return t.getAttribute("aria-selected") === "true";
    })[0] || list[0], false, true);
  });
}
function dialogs() {
  if ("commandForElement" in HTMLButtonElement.prototype) return;
  $$("button[commandfor]").forEach(function(b) {
    b.addEventListener("click", function() {
      var d = document.getElementById(b.getAttribute("commandfor")), c = b.getAttribute("command");
      if (!d || !d.showModal) return;
      if (c === "show-modal" && !d.open) d.showModal();
      else if (c === "close") {
        if (b.hasAttribute("value")) d.close(b.value);
        else d.close();
      } else if (c === "request-close") {
        if (d.requestClose) d.requestClose();
        else d.close();
      }
    });
  });
}
function fields() {
  $$(".field-error[id]").forEach(function(e) {
    var c = $('[aria-describedby~="' + e.id + '"]', e.closest(".field"));
    if (!c) return;
    var base2 = c.getAttribute("aria-describedby").split(/\s+/).filter(function(x) {
      return x !== e.id;
    });
    function sync() {
      var bad = c.getAttribute("aria-invalid") === "true";
      try {
        bad = bad || c.matches(":user-invalid");
      } catch (x) {
      }
      var ids = bad ? base2.concat(e.id) : base2;
      if (ids.length) c.setAttribute("aria-describedby", ids.join(" "));
      else c.removeAttribute("aria-describedby");
    }
    ["input", "change", "blur", "invalid"].forEach(function(t) {
      c.addEventListener(t, sync);
    });
    if (c.form) c.form.addEventListener("reset", function() {
      setTimeout(sync);
    });
    new MutationObserver(sync).observe(c, { attributeFilter: ["aria-invalid"] });
    sync();
  });
}
function init5() {
  tables();
  copy();
  runbooks();
  explorers();
  tabs();
  dialogs();
  fields();
}

// src/js/lang.js
var WORD = /[A-Za-z][A-Za-z0-9_.-]*/g;
function wrapEnglish(EN, root) {
  if (!EN) return;
  var w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT), hits = [], n;
  while (n = w.nextNode()) if (EN.test(n.nodeValue)) hits.push(n);
  hits.forEach(function(n2) {
    var b = n2.parentElement;
    if (!b || b.closest("[lang]:not(html),script,style,pre,code") || getComputedStyle(b).textTransform !== "uppercase") return;
    var s = n2.nodeValue, f = document.createDocumentFragment(), k = 0, m;
    WORD.lastIndex = 0;
    while (m = WORD.exec(s)) {
      if (!EN.test(m[0])) continue;
      f.appendChild(document.createTextNode(s.slice(k, m.index)));
      var sp = document.createElement("span");
      sp.lang = "en";
      sp.textContent = m[0];
      f.appendChild(sp);
      k = m.index + m[0].length;
    }
    f.appendChild(document.createTextNode(s.slice(k)));
    n2.replaceWith(f);
  });
}

// src/js/index.js
var version = true ? "0.3.0" : "dev";
var O = null;
var started = false;
function init6(opts) {
  if (O) return;
  O = opts || {};
  document.documentElement.classList.add("js");
  Object.assign(strings, O.strings);
  init(O.themeKey || "hendese-theme");
  init2(O);
  init3();
  init5();
}
function start() {
  if (started) return;
  started = true;
  init6();
  wrapEnglish(O.englishStems);
  init4();
  landing();
  addEventListener("scroll", poke, { passive: true });
  addEventListener("resize", measure);
  MQ_RM.addEventListener("change", evalMotion);
  MQ_WIDE.addEventListener("change", evalMotion);
  var main = $("main") || document.body;
  if ("ResizeObserver" in window) {
    var q = false;
    new ResizeObserver(function() {
      if (q) return;
      q = true;
      requestAnimationFrame(function() {
        q = false;
        measure();
      });
    }).observe(main);
  }
  evalMotion();
  reanchor();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function() {
    measure();
    reanchor();
  });
}
var refresh2 = refresh;
var lockTo2 = lockTo;
var state2 = {
  get motion() {
    return S.motion;
  },
  get idle() {
    return S.sleeping;
  },
  get y() {
    return S.y;
  },
  get vh() {
    return S.vh;
  },
  get section() {
    return current();
  },
  get scenes() {
    return SCENES.length;
  }
};
var hoca2 = {
  get dismissed() {
    return state.dismissed;
  },
  set dismissed(v) {
    state.dismissed = !!v;
    poke();
  },
  dismiss
};
export {
  $,
  $$,
  absTop,
  clamp01,
  createHoca,
  ease,
  figScene,
  hoca2 as hoca,
  init6 as init,
  lerp,
  lockTo2 as lockTo,
  measure,
  pinScene,
  poke,
  refresh2 as refresh,
  scene,
  seg,
  start,
  state2 as state,
  stickyScene,
  strings,
  version,
  wake
};
