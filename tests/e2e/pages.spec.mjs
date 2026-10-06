// Guards every docs page: no console errors, no external requests, no horizontal overflow, no serious/critical axe findings, visual baseline.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const PAGES = ['docs/index', 'docs/tokens', 'docs/components', 'docs/blueprint', 'docs/motion', 'docs/hoca', 'starter/index'];
const url = p => pathToFileURL(path.resolve(p + '.html')).href;

async function open(page, p) {
  const errors = [], external = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  page.on('request', r => { if (!/^(file|data|blob):/.test(r.url())) external.push(r.url()); });
  await page.goto(url(p));
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.evaluate(() => Hendese.state.idle)).toBe(true);
  return { errors, external };
}

for (const p of PAGES) {
  test.describe(p, () => {
    for (const [w, theme] of [[1440, 'light'], [1440, 'dark'], [1000, 'light']]) {
      test(`temiz · ${w} · ${theme}`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: 900 });
        await page.emulateMedia({ colorScheme: theme });
        const { errors, external } = await open(page, p);
        expect(errors, 'konsol hatası').toEqual([]);
        expect(external, 'dış istek').toEqual([]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 'yatay taşma').toBeLessThanOrEqual(0);
      });
    }
    // axe runs in the accessible base state (reduced motion): in live mode, inactive beats are deliberately dimmed
    for (const theme of ['light', 'dark']) test(`erişilebilirlik (axe) · ${theme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      await open(page, p);
      const r = await new AxeBuilder({ page }).analyze();
      const bad = r.violations.filter(v => v.impact === 'serious' || v.impact === 'critical').map(v => `${v.id}: ${v.nodes.length} öğe · ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`);
      expect(bad).toEqual([]);
    });
    test('görsel (reduced motion, açık + koyu)', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      for (const theme of ['light', 'dark']) {
        await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
        await open(page, p);
        await expect(page).toHaveScreenshot(`${p.replace('/', '-')}-${theme}.png`, { fullPage: true });
      }
    });
  });
}
