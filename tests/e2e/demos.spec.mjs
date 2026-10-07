// Guards part pages (demos/): no console errors, no external requests, no horizontal overflow, no serious/critical axe findings (light + dark).
// ponytail: no visual baselines (35+ pages × 2 themes would bloat the repo); the docs pages already carry the visual test.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const PAGES = fs.readdirSync('demos').filter(f => f.endsWith('.html')).map(f => f.slice(0, -5));

for (const p of PAGES) test(`demos/${p}`, async ({ page }) => {
  const errors = [], external = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  page.on('request', r => { if (!/^(file|data|blob):/.test(r.url())) external.push(r.url()); });
  for (const theme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await page.goto(pathToFileURL(path.resolve('demos', p + '.html')).href);
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => page.evaluate(() => Hendese.state.idle)).toBe(true);
    expect(errors, 'console errors').toEqual([]);
    expect(external, 'external requests').toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 'horizontal overflow').toBeLessThanOrEqual(0);
    const r = await new AxeBuilder({ page }).analyze();   // axe logs CORS errors to the console for its own style requests; errors were checked before this
    errors.length = 0;
    expect(r.violations.filter(v => v.impact === 'serious' || v.impact === 'critical').map(v => `${theme} ${v.id}: ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`)).toEqual([]);
  }
});
