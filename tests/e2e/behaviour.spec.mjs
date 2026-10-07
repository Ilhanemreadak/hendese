// Guards behaviour: drawer (keyboard), theme button, pin scene progress, reduced-motion still Hoca, choice group.
import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const url = p => pathToFileURL(path.resolve(p + '.html')).href;
const idle = page => expect.poll(() => page.evaluate(() => Hendese.state.idle)).toBe(true);

test('drawer opens from the keyboard and closes with Esc (1000px)', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.goto(url('docs/index'));
  await page.focus('#nav-open'); await page.keyboard.press('Enter');
  await expect(page.locator('body')).toHaveClass(/nav-open/);
  await expect(page.locator('#nav-open')).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('body')).not.toHaveClass(/nav-open/);
  await expect(page.locator('#nav-open')).toBeFocused();
});

test('theme button switches, persists and dispatches an event', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(url('docs/index'));
  await page.evaluate(() => { window.__t = null; document.addEventListener('hendese:theme', e => { window.__t = e.detail; }); });
  await page.click('.rail-foot [data-theme-toggle]');
  expect(await page.evaluate(() => [document.documentElement.dataset.theme, localStorage.getItem('hendese-theme'), window.__t])).toEqual(['dark', 'dark', 'dark']);
});

test('pin scene: scrolling advances the ink and the HUD writes the stage', async ({ page }) => {
  await page.goto(url('docs/motion'));
  const ink = page.locator('#m-pin .m-ink');
  const [top, len] = await page.evaluate(() => { const el = document.querySelector('#m-pin'); return [el.getBoundingClientRect().top + scrollY, el.offsetHeight - innerHeight]; });
  const at = async k => { await page.evaluate(y => scrollTo(0, y), Math.round(top + len * k)); await idle(page);
    return { off: +(await ink.evaluate(e => e.style.strokeDashoffset)), stage: await page.locator('[data-hud="stage"]').textContent() }; };
  const a = await at(0), b = await at(.5), c = await at(1);
  expect(a.off).toBeGreaterThan(b.off); expect(b.off).toBeGreaterThan(c.off); expect(c.off).toBe(0);
  expect(c.stage).toBe('Deploy');
});

test('reduced motion: scenes in the finished state, still Hoca copies in place', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(url('docs/motion'));
  expect(await page.evaluate(() => Hendese.state.motion)).toBe(false);
  expect(await page.locator('#m-pin .m-ink').evaluate(e => e.style.strokeDashoffset)).toBe('');
  expect(await page.locator('.hoca-still').count()).toBeGreaterThanOrEqual(3);
});

test('choice group changes with arrow keys and updates the readout', async ({ page }) => {
  await page.goto(url('docs/motion'));
  await page.focus('[name=m-rep][value="3"]');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('[name=m-rep][value="2"]')).toBeChecked();
  await expect(page.locator('#m-readout')).toContainText('Mismatch');
});

// 0.1.1 regressions
test('runbook keeps authored checked state without storage; table container is focusable', async ({ page }) => {
  await page.goto(url('tests/e2e/fixtures/regress'));
  await page.evaluate(() => localStorage.removeItem('hendese-test-regress'));
  await page.reload();
  await expect(page.locator('#rb .rb-count')).toHaveText('1 / 2');
  await expect(page.locator('#tb')).toHaveAttribute('tabindex', '0');
});

test('a scene\'s hidden claim hides Hoca (live mode)', async ({ page }) => {
  await page.goto(url('tests/e2e/fixtures/regress'));
  await page.evaluate(() => scrollTo(0, 200)); await idle(page);
  await expect(page.locator('.hoca-layer > .hoca')).toBeVisible();
  await page.evaluate(() => { window.__hidden = true; Hendese.refresh(); scrollBy(0, 2); }); await idle(page);
  await expect(page.locator('.hoca-layer > .hoca')).toBeHidden();
});

test('English words in every uppercase label get lang=en', async ({ page }) => {
  await page.goto(url('tests/e2e/fixtures/lang'));
  expect(await page.evaluate(() => ['#a', '#b', '#c'].map(s => document.querySelectorAll(s + ' [lang="en"]').length))).toEqual([1, 1, 0]);
});

// 0.3 parts
test('tabs: arrow keys and End select, the panel changes, roving tabindex', async ({ page }) => {
  await page.goto(url('tests/e2e/fixtures/forms'));
  await expect(page.locator('#p2')).toBeHidden();
  await page.focus('#t1'); await page.keyboard.press('ArrowRight');
  await expect(page.locator('#t2')).toBeFocused();
  await expect(page.locator('#t2')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#p2')).toBeVisible(); await expect(page.locator('#p1')).toBeHidden();
  await page.keyboard.press('End'); await expect(page.locator('#t3')).toHaveAttribute('tabindex', '0');
  await page.keyboard.press('ArrowRight'); await expect(page.locator('#t1')).toBeFocused();
});

test('tabs without JS: the strip is hidden and every panel is visible', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false }), page = await ctx.newPage();
  await page.goto(url('tests/e2e/fixtures/forms'));
  await expect(page.locator('[role="tablist"]')).toBeHidden();
  for (const id of ['#p1', '#p2', '#p3']) await expect(page.locator(id)).toBeVisible();
  await ctx.close();
});

test('dialog: commandfor opens, Esc closes, focus returns', async ({ page }) => {
  await page.goto(url('tests/e2e/fixtures/forms'));
  await page.click('#open');
  await expect(page.locator('#dlg')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#dlg')).toBeHidden();
  await expect(page.locator('#open')).toBeFocused();
});

test('form field: aria-invalid shows the error text', async ({ page }) => {
  await page.goto(url('tests/e2e/fixtures/forms'));
  await expect(page.locator('#f1-e')).toBeHidden();
  await expect(page.locator('#f1')).not.toHaveAttribute('aria-describedby', /f1-e/);   // a hidden error must not be announced
  await page.evaluate(() => document.getElementById('f1').setAttribute('aria-invalid', 'true'));
  await expect(page.locator('#f1-e')).toBeVisible();
  await expect(page.locator('#f1')).toHaveAttribute('aria-describedby', /f1-e/);
});
