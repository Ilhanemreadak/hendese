/* Hendese · saf fonksiyonlar (DOM yok; node:test ile test edilir). */
export function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
export function seg(p, a, b) { return clamp01((p - a) / (b - a)); }   /* p'nin [a,b] aralığındaki 0..1 payı */
export function lerp(a, b, t) { return a + (b - a) * t; }
export function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }   /* ease-in-out (quad) */
/* okuma çizgisini (line) geçen son bölüm; sayfa sonundaysa son bölüm; hiçbiri geçmediyse topId */
export function pickSection(tops, ids, line, atBottom, topId) {
  var cur = topId;
  for (var i = 0; i < tops.length; i++) if (tops[i] <= line) cur = ids[i];
  if (atBottom && ids.length) cur = ids[ids.length - 1];
  return cur;
}
