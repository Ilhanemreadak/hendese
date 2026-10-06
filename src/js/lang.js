/* Hendese · büyük harf düzeltmesi: lang="tr" sayfada CSS uppercase "i"yi "İ" yapar. Büyük harfle basılan etiketlerdeki
   İngilizce teknik kelimeler (Türkçe harfsiz + bilinen kök) <span lang="en"> içine alınır. Açık lang öznitelikleri kazanır.
   Kökler projeye özgüdür: Hendese.init({englishStems:/build|deploy|…/i}). Verilmezse hiçbir şey yapılmaz. */
import { $$ } from './core.js';

var WORD = /[A-Za-z][A-Za-z0-9_.-]*/g;
export function wrapEnglish(EN, sel) {
  if (!EN) return;
  $$(sel || '.drawing *,.sticky-fig *,.beats *,.chip,.hud *,.route-stage *').forEach(function (b) {
    if (b.closest('[lang]:not(html)') || getComputedStyle(b).textTransform !== 'uppercase') return;
    Array.prototype.slice.call(b.childNodes).forEach(function (n) {
      if (n.nodeType !== 3 || !EN.test(n.nodeValue)) return; var s = n.nodeValue, f = document.createDocumentFragment(), k = 0, m; WORD.lastIndex = 0;
      while ((m = WORD.exec(s))) { if (!EN.test(m[0])) continue; f.appendChild(document.createTextNode(s.slice(k, m.index))); var sp = document.createElement('span'); sp.lang = 'en'; sp.textContent = m[0]; f.appendChild(sp); k = m.index + m[0].length; }
      f.appendChild(document.createTextNode(s.slice(k))); n.replaceWith(f);
    });
  });
}
