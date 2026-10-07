// Guards the 0.4.0 fixes: failure isolation, keyed runbook storage, card labels, section lock, late scenes, theme key,
// narrow-screen layout and print output.
import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const url = p => pathToFileURL(path.resolve(p + '.html')).href;
const ROBUST = 'tests/e2e/fixtures/robust';

test('a failing scene does not stop the engine; an unknown pose renders as idle', async ({ page }) => {
  await page.goto(url(ROBUST));
  await page.evaluate(() => document.getElementById('good').scrollIntoView({ block: 'center' }));
  await expect.poll(() => page.evaluate(() => window.__thrown)).toBeGreaterThan(1);   // the failing scene ran again after throwing
  const before = await page.evaluate(() => window.__ticks);
  await page.mouse.wheel(0, 60);
  await expect.poll(() => page.evaluate(() => window.__ticks)).toBeGreaterThan(before);
  await expect(page.locator('.hoca-layer .hoca:not([hidden])')).toHaveCount(1);
  expect(await page.evaluate(() => [typeof window.__t, window.__raw.live])).toEqual(['number', true]);   // tick gets t; methods run with this = scene
});

test('an icon-only copy button does not break the widgets after it', async ({ page }) => {
  await page.goto(url(ROBUST));
  await expect(page.locator('#cp [role="status"]')).toHaveCount(1);
  await page.click('#t2');
  await expect(page.locator('#p2')).toBeVisible();
});

test('runbook stores by item identity: an inserted step does not appear done', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('hendese-test-robust', JSON.stringify({ bir: true, iki: true })));
  await page.goto(url(ROBUST));
  expect(await page.$$eval('#rb input', b => b.map(x => x.checked))).toEqual([false, true, true]);
  await expect(page.locator('#rb .rb-count')).toHaveText('2 / 3');
});

test('runbook: the array format of earlier releases is migrated', async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('hendese-test-robust', JSON.stringify([true, false, true])); } });
  await page.goto(url(ROBUST));
  expect(await page.$$eval('#rb input', b => b.map(x => x.checked))).toEqual([true, false, true]);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('hendese-test-robust')))).toEqual({ yeni: true, iki: true });
});

test('card labels count colspan and skip header buttons', async ({ page }) => {
  await page.goto(url(ROBUST));
  expect(await page.$$eval('.tbl td', t => t.map(x => x.dataset.th))).toEqual(['Ad', 'Açık / Koyu', 'Not']);
});

test('a lang="tr" page gets the Turkish UI strings; an English page keeps English', async ({ page }) => {
  await page.goto(url(ROBUST));
  expect(await page.evaluate(() => Hendese.strings.intro)).toBe('Giriş');
  await page.goto(url('docs/index'));
  expect(await page.evaluate(() => Hendese.strings.intro)).toBe('Intro');
});

test('navigating to a target inside a section marks the section', async ({ page }) => {
  await page.goto(url(ROBUST));
  await page.evaluate(() => { Hendese.lockTo('inner'); Hendese.poke(); });
  await expect(page.locator('#rail-pos')).toHaveText('01 / 1');
});

test('a scene registered after start() goes live at once', async ({ page }) => {
  await page.goto(url(ROBUST));
  await page.evaluate(() => Hendese.figScene({ el: '#late', render: function () { return {}; } }));
  await expect(page.locator('#late')).toHaveClass(/is-live/);
});

test('head.js and init read <html data-theme-key>', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('site-theme', 'dark'));
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(url(ROBUST));
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('narrow screen: the open drawer\'s close button is not covered by the top bar', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(url('docs/motion'));
  await page.click('#nav-open');
  await page.click('#nav-close');   // a covered button fails the actionability check
  await expect(page.locator('body')).not.toHaveClass(/nav-open/);
});

test('narrow screen: the pin frame collapses to one column', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(url('docs/motion'));
  expect(await page.$eval('.pin .frame', f => getComputedStyle(f).gridTemplateColumns.split(' ').length)).toBe(1);
});

test('print: code prints in dark ink even in the dark theme; every station description prints', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', media: 'print' });
  await page.goto(url('docs/blueprint'));
  const rgb = await page.$eval('.code pre', p => getComputedStyle(p).color.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number));
  expect(rgb.reduce((a, b) => a + b, 0)).toBeLessThan(300);
  const panels = page.locator('.st-detail [data-for]');
  for (let i = 0; i < await panels.count(); i++) await expect(panels.nth(i)).toBeVisible();
});

test('explorer: preview is silent, selection is announced by the status node', async ({ page }) => {
  await page.goto(url(ROBUST));
  const status = page.locator('#xp + [role="status"]');
  await expect(status).toHaveText('');                         // nothing is announced on load
  await page.focus('[data-key="b"]');
  await expect(page.locator('[data-for="b"]')).toBeVisible();  // focus previews
  await expect(status).toHaveText('');
  await page.keyboard.press('Enter');
  await expect(status).toHaveText('beta');
});
