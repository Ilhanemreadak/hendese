// Parça sayfaları (demos/): konsol hatası yok, dış istek yok, yatay taşma yok, ciddi/kritik axe bulgusu yok (açık + koyu).
// ponytail: görsel referans yok (35+ sayfa × 2 tema repoyu şişirir); docs sayfaları görsel testi zaten taşıyor.
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
    expect(errors, 'konsol hatası').toEqual([]);
    expect(external, 'dış istek').toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 'yatay taşma').toBeLessThanOrEqual(0);
    const r = await new AxeBuilder({ page }).analyze();   // axe kendi stil isteklerinde konsola CORS hatası yazar; hatalar bundan önce kontrol edildi
    errors.length = 0;
    expect(r.violations.filter(v => v.impact === 'serious' || v.impact === 'critical').map(v => `${theme} ${v.id}: ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`)).toEqual([]);
  }
});
