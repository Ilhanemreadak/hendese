/* Hendese · Hoca sprite: piksel maskot, canvas ile boyanır (görsel dosyası yok). Tek bir sabit katman + durgun kopyalar.
   API: render({visible,x,y,pose,face,squash,bubble,bubbleUp,tag,alpha}) viewport px; place(kap,{left,top,pose,face,bubble,bubbleUp,tag});
   clearPlaced(); size; anchors (bağlantı noktası = ayakların alt ortası, sit için oturma noktası). */
export function createHoca() {
  // Hoca = an orange pixel block mascot (flat block body, two eye slits, side nubs, four legs), drawn at 2x cell
  // resolution. Teacher personality comes only from glasses, props and poses. Grid 44x36 cells, drawn at x2.
  var S = 2, W = 44, H = 36;
  var PAL = { b: '#d97757', B: '#c2654b', e: '#1f1a1c', g: '#2b2226', G: '#7a3a28', t: '#fbfbf8', o: '#fc6d26', l: '#9aa0aa',
    r: '#9a6a3a', R: '#f1d08a', d: '#8fcfff', y: '#f5c542', n: '#a8744a', N: '#7a5033', p: '#6b4fd6', k: '#2a66d0',
    s: '#3b3f47', m: '#7ee29a' };
  function R(g, x, y, w, h, c) { for (var j = y; j < y + h; j++) for (var i = x; i < x + w; i++) if (i >= 0 && i < W && j >= 0 && j < H) g[j][i] = c; }
  function P(g, x, y, rows) { rows.forEach(function (r, j) { r.split('').forEach(function (c, i) { if (c !== '.') R(g, x + i, y + j, 1, 1, c); }); }); }

  /* the canonical mascot: body cols 10-33 rows 14-29, nubs rows 22-25, legs rows 30-33 */
  function body(g, o) {
    R(g, 10, 14, 24, 16, 'b'); R(g, 10, 29, 24, 1, 'B');
    var L = o.legs || 'stand';
    [12, 16, 26, 30].forEach(function (x, i) {
      var lift = (L === 'walkA' && i % 2 === 0) || (L === 'walkB' && i % 2 === 1);
      R(g, x, 30, 2, L === 'sit' ? 6 : lift ? 3 : 4, 'b');
    });
    var E = o.eyes || 'n';
    [14, 28].forEach(function (x) {
      if (E === 'n') R(g, x, 18, 2, 4, 'e');
      else if (E === 'down') R(g, x + 1, 20, 2, 2, 'e');
      else if (E === 'happy') { R(g, x, 19, 2, 1, 'e'); R(g, x - 1, 20, 1, 1, 'e'); R(g, x + 2, 20, 1, 1, 'e'); }
      else if (E === 'worried') R(g, x, 19, 2, 3, 'e');
    });
    if (o.glasses !== false) { /* small teacher glasses: rounded thin frames (dark terracotta) so the black eye slits stay the strongest feature */
      [12, 26].forEach(function (x) { R(g, x + 1, 17, 4, 1, 'G'); R(g, x + 1, 22, 4, 1, 'G'); R(g, x, 18, 1, 4, 'G'); R(g, x + 5, 18, 1, 4, 'G'); });
      R(g, 18, 19, 8, 1, 'G');
    }
    if (o.left !== false) R(g, 6, o.leftY || 22, 4, 4, 'b');
    if (o.right === true || o.right == null) R(g, 34, 22, 4, 4, 'b');
  }
  function crate(g) { P(g, 35, 15, ['NNNNNNNNN', 'NnnnnnnnN', 'NNNNNNNNN', 'NnnttttnN', 'NnnttttnN', 'NNNNNNNNN', 'NnnnnnnnN', 'NNNNNNNNN']); }
  function card(g) { P(g, 38, 17, ['gggggg', 'gtttog', 'gttoog', 'gttttg', 'gteeeg', 'gttttg', 'gteetg', 'gttttg', 'gggggg']); }

  var POSES = {
    idle: function (g) { body(g, {}); },
    carry: function (g) { body(g, {}); card(g); },
    walkA: function (g) { body(g, { legs: 'walkA' }); card(g); },
    walkB: function (g) { body(g, { legs: 'walkB' }); card(g); },
    pointUp: function (g) { body(g, { right: false }); R(g, 34, 19, 3, 4, 'b'); R(g, 36, 16, 2, 4, 'b');
      [[38, 13], [39, 11], [40, 9], [41, 7], [42, 5], [43, 3]].forEach(function (c) { R(g, c[0], c[1], 1, 2, 'r'); }); R(g, 43, 2, 1, 1, 'R'); },
    pointDown: function (g) { body(g, {});
      [[38, 25], [39, 27], [40, 29], [41, 31], [42, 33]].forEach(function (c) { R(g, c[0], c[1], 1, 2, 'r'); }); R(g, 43, 35, 1, 1, 'R'); },
    glasses: function (g) { body(g, { right: false }); R(g, 34, 17, 2, 8, 'b'); R(g, 31, 15, 5, 2, 'b'); },
    terminal: function (g) { body(g, { eyes: 'down' }); R(g, 34, 32, 10, 2, 's'); R(g, 38, 23, 6, 9, 's'); R(g, 39, 24, 4, 7, '#'); },
    stamp: function (g) { body(g, { right: false }); R(g, 34, 17, 4, 3, 'b');
      P(g, 37, 9, ['.NNNN.', '..nn..', '..nn..', '..nn..', '..nn..', '..nn..', '..nn..', 'NNNNNN', 'NNNNNN', 'oooooo']);
      P(g, 35, 31, ['yyyyyyyyy', 'yeyyyyyyy', 'yyyyyyyyy']); },
    worried: function (g) { body(g, { eyes: 'worried', leftY: 17, right: false }); R(g, 34, 17, 4, 4, 'b');
      P(g, 36, 10, ['.d.', 'ddd', 'ddd']); },
    happy: function (g) { body(g, { eyes: 'happy', left: false, right: false });
      R(g, 8, 16, 2, 4, 'b'); R(g, 6, 12, 2, 4, 'b'); R(g, 34, 16, 2, 4, 'b'); R(g, 36, 12, 2, 4, 'b');
      P(g, 2, 6, ['.y.', 'yyy', '.y.']); P(g, 39, 6, ['.y.', 'yyy', '.y.']); },
    sit: function (g) { body(g, { legs: 'sit' }); },
    shrug: function (g) { body(g, { left: false, right: false }); R(g, 6, 19, 4, 3, 'b'); R(g, 3, 16, 3, 3, 'b'); R(g, 34, 19, 4, 3, 'b'); R(g, 38, 16, 3, 3, 'b'); },
    stepA: function (g) { body(g, { legs: 'walkA' }); },
    stepB: function (g) { body(g, { legs: 'walkB' }); },
    crateWalkA: function (g) { body(g, { legs: 'walkA' }); crate(g); },
    crateWalkB: function (g) { body(g, { legs: 'walkB' }); crate(g); },
    clipboard: function (g) { body(g, {}); P(g, 37, 14, ['..lll..', 'nnlllnn', 'ntttttn', 'nteeetn', 'ntttttn', 'nteeetn', 'ntttttn', 'nteettn', 'ntttttn', 'nnnnnnn']); },
    keycard: function (g) { body(g, {}); P(g, 38, 17, ['pppppp', 'pppppp', 'tttttt', 'pppppp', 'pttppp', 'ptptpp', 'pttttp', 'pppppp']); },
    crate: function (g) { body(g, {}); crate(g); },
    helm: function (g) { body(g, {}); P(g, 36, 15, ['...k...', '..kkk..', '.k.k.k.', 'kkkkkkk', '.k.k.k.', '..kkk..', '...k...']); }
  };
  var LAPTOP_SCREEN = '#1c2530';
  var anchors = {};
  for (var n in POSES) anchors[n] = n === 'sit' ? { x: 44, y: 60 } : { x: 44, y: 68 }; // feet bottom-centre (row 34) / seat point (row 30)

  function paint(name) {
    var g = []; for (var y = 0; y < H; y++) { g.push([]); for (var x = 0; x < W; x++) g[y].push('.'); }
    POSES[name](g);
    var cv = document.createElement('canvas'); cv.width = W * S; cv.height = H * S;
    var ctx = cv.getContext('2d');
    g.forEach(function (r, y) { r.forEach(function (ch, x) {
      if (ch === '.') return;
      ctx.fillStyle = ch === '#' ? LAPTOP_SCREEN : PAL[ch]; ctx.fillRect(x * S, y * S, S, S);
    }); });
    if (name === 'terminal') { ctx.fillStyle = PAL.m; ctx.fillRect(40 * S, 25 * S, 4, 2); ctx.fillRect(40 * S, 27 * S, 6, 2); ctx.fillRect(40 * S, 29 * S, 3, 2); }
    return cv.toDataURL();
  }

  var layer = document.createElement('div');
  layer.className = 'hoca-layer';
  layer.setAttribute('aria-hidden', 'true');
  var el = document.createElement('div');
  el.className = 'hoca';
  el.hidden = true;
  var img = document.createElement('img');
  img.className = 'hoca-img';
  img.alt = '';
  img.width = W * S; img.height = H * S;
  var tag = document.createElement('span');
  tag.className = 'hoca-tag';
  tag.hidden = true;
  var bub = document.createElement('div');
  bub.className = 'hoca-bubble';
  el.appendChild(img); el.appendChild(tag); el.appendChild(bub);
  layer.appendChild(el);
  document.body.appendChild(layer);

  var srcs = {}, L = {};

  function setPose(p) { if (p !== L.pose) { L.pose = p; img.src = srcs[p]; } }
  function setLook(face, squash) {
    var key = face + '|' + squash;
    if (key === L.look) return;
    L.look = key;
    img.style.transform = 'scale(' + face + ',' + (1 - 0.12 * squash) + ')';
    el.classList.toggle('face-l', face < 0);
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
      // Pixelify Sans only covers Latin/Latin-ext (+ common punctuation); e.g. '≠' falls back to mono
      bub.classList.toggle('mono', /[^\u0000-ɏ–—‘’“”…]/.test(b));
      L.bw = bub.offsetWidth;
    }
    bub.classList.toggle('on', !!b);
  }
  function setUp(up) { if (up !== L.up) { L.up = up; bub.classList.toggle('is-up', up); } }
  function setSide(right) { if (right !== L.right) { L.right = right; bub.classList.toggle('is-right', right); } }

  function render(s) {
    if (s.visible !== L.vis) { L.vis = s.visible; el.hidden = !s.visible; }
    if (!s.visible) return;
    setPose(s.pose);
    var a = anchors[s.pose], tx = Math.round(s.x - a.x), ty = Math.round(s.y - a.y);
    if (tx !== L.tx || ty !== L.ty) { L.tx = tx; L.ty = ty; el.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0)'; }
    setLook(s.face || 1, s.squash || 0);
    setBubble(s.bubble || null);
    if (s.bubble) setSide(s.x < L.bw + 20);
    setUp(!!s.bubbleUp);
    setTag(s.tag == null ? null : s.tag);
    var al = s.alpha == null ? 1 : s.alpha;
    if (al !== L.al) { L.al = al; el.style.opacity = al; }
  }

  /* reduced motion: still copies of Hoca placed inside scene drawings (one per scene), never moved */
  var placed = [];
  function place(container, o) {
    var c = document.createElement('div'), i = new Image(), a = anchors[o.pose] || anchors.idle;
    c.className = 'hoca hoca-still' + ((o.face || 1) < 0 ? ' face-l' : '');
    c.setAttribute('aria-hidden', 'true');
    c.style.left = o.left; c.style.top = o.top; c.style.transform = 'translate(' + -a.x + 'px,' + -a.y + 'px)';
    i.className = 'hoca-img'; i.alt = ''; i.width = W * S; i.height = H * S; i.src = srcs[o.pose] || srcs.idle;
    if ((o.face || 1) < 0) i.style.transform = 'scale(-1,1)';
    c.appendChild(i);
    var bb = null;
    if (o.bubble) { bb = document.createElement('div'); bb.className = 'hoca-bubble on' + (o.bubbleUp ? ' is-up' : '') + (/[^\u0000-ɏ–—‘’“”…]/.test(o.bubble) ? ' mono' : ''); bb.textContent = o.bubble; c.appendChild(bb); }
    if (o.tag) { var tg = document.createElement('span'); tg.className = 'hoca-tag'; tg.textContent = o.tag; c.appendChild(tg); }
    container.appendChild(c); placed.push(c);
    if (bb && c.offsetLeft < bb.offsetWidth + 20) bb.classList.add('is-right');
  }
  function clearPlaced() { placed.forEach(function (c) { c.remove(); }); placed = []; }

  for (var n in POSES) srcs[n] = paint(n);
  return { render: render, place: place, clearPlaced: clearPlaced,
    size: { w: W * S, h: H * S, scale: S }, anchors: anchors };
}
