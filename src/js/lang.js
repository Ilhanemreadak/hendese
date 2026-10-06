/* Hendese · büyük harf düzeltmesi: lang="tr" sayfada CSS uppercase "i"yi "İ" yapar. Büyük harfle basılan HER etiketteki
   İngilizce teknik kelimeler (Türkçe harfsiz + bilinen kök) <span lang="en"> içine alınır. Açık lang öznitelikleri kazanır.
   Kökler projeye özgüdür: Hendese.init({englishStems:/build|deploy|…/i}). Verilmezse hiçbir şey yapılmaz.
   Önce metin düğümleri kökle süzülür; getComputedStyle yalnız eşleşenlerde çağrılır, seçici listesi gerekmez. */
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
