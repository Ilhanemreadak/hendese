import test from 'node:test';
import assert from 'node:assert/strict';
import { clamp01, seg, lerp, ease, pickSection } from '../../src/js/math.js';

test('clamp01 / seg / lerp edge cases', () => {
  assert.equal(clamp01(-1), 0); assert.equal(clamp01(2), 1); assert.equal(clamp01(.3), .3);
  assert.equal(seg(.1, .2, .4), 0); assert.ok(Math.abs(seg(.3, .2, .4) - .5) < 1e-9); assert.equal(seg(.9, .2, .4), 1);
  assert.equal(lerp(10, 20, .25), 12.5);
  assert.equal(clamp01(NaN), 0); assert.equal(seg(1, 1, 1), 0);   // degenerate input must not leak NaN into styles
});
test('ease: 0→0, ½→½, 1→1, monotonic', () => {
  assert.equal(ease(0), 0); assert.equal(ease(.5), .5); assert.equal(ease(1), 1);
  for (let t = 0; t < 1; t += .05) assert.ok(ease(t + .05) >= ease(t));
});
test('pickSection: last section past the line, topId at the top, last section at the bottom', () => {
  const tops = [100, 500, 900], ids = ['a', 'b', 'c'];
  assert.equal(pickSection(tops, ids, 50, false, 'top'), 'top');
  assert.equal(pickSection(tops, ids, 600, false, 'top'), 'b');
  assert.equal(pickSection(tops, ids, 200, true, 'top'), 'c');
  assert.equal(pickSection([], [], 200, true, 'top'), 'top');
});
