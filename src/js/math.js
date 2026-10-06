/* Hendese · Math: pure functions (no DOM; tested with node:test). */
export function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
export function seg(p, a, b) { return clamp01((p - a) / (b - a)); }   /* 0..1 fraction of p within [a,b] */
export function lerp(a, b, t) { return a + (b - a) * t; }
export function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }   /* ease-in-out (quad) */
/* last section past the reading line (line); the last section at page bottom; topId if none has passed */
export function pickSection(tops, ids, line, atBottom, topId) {
  var cur = topId;
  for (var i = 0; i < tops.length; i++) if (tops[i] <= line) cur = ids[i];
  if (atBottom && ids.length) cur = ids[ids.length - 1];
  return cur;
}
