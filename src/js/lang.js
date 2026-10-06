/* Hendese · Lang: uppercase fix; on a lang="tr" page, CSS uppercase turns "i" into U+0130 (dotted capital I). In EVERY label rendered
   in uppercase, English technical words (no Turkish letters + a known stem) are wrapped in <span lang="en">. Explicit lang attributes win.
   Stems are project-specific: Hendese.init({englishStems:/build|deploy|…/i}). If omitted, nothing is done.
   Text nodes are filtered by stem first; getComputedStyle runs only on matches, so no selector list is needed. */
var WORD = /[A-Za-z][A-Za-z0-9_.-]*/g;
export function wrapEnglish(EN, root) {
  if (!EN) return;
  var w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT), hits = [], n;
  while ((n = w.nextNode())) if (EN.test(n.nodeValue)) hits.push(n);
  hits.forEach(function (n) {
    var b = n.parentElement;
    if (!b || b.closest('[lang]:not(html),script,style,pre,code') || getComputedStyle(b).textTransform !== 'uppercase') return;
    var s = n.nodeValue, f = document.createDocumentFragment(), k = 0, m; WORD.lastIndex = 0;
    while ((m = WORD.exec(s))) { if (!EN.test(m[0])) continue; f.appendChild(document.createTextNode(s.slice(k, m.index))); var sp = document.createElement('span'); sp.lang = 'en'; sp.textContent = m[0]; f.appendChild(sp); k = m.index + m[0].length; }
    f.appendChild(document.createTextNode(s.slice(k))); n.replaceWith(f);
  });
}
