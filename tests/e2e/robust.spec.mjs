// Guards the 0.4.0 fixes: failure isolation, keyed runbook storage, card labels, section lock, late scenes, theme key,
// narrow-screen layout and print output.
import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const url = p => pathToFileURL(path.resolve(p + '.html')).href;
const ROBUST = 'tests/e2e/fixtures/robust';

test('hatalı sahne motoru durdurmaz; bilinmeyen poz idle olarak çizilir', async ({ page }) => {
  await page.goto(url(ROBUST));
  await page.evaluate(() => document.getElementById('good').scrollIntoView({ block: 'center' }));
  await expect.poll(() => page.evaluate(() => window.__thrown)).toBeGreaterThan(1);   // the failing scene ran again after throwing
  const before = await page.evaluate(() => window.__ticks);
  await page.mouse.wheel(0, 60);
  await expect.poll(() => page.evaluate(() => window.__ticks)).toBeGreaterThan(before);
  await expect(page.locator('.hoca-layer .hoca:not([hidden])')).toHaveCount(1);
  expect(await page.evaluate(() => [typeof window.__t, window.__raw.live])).toEqual(['number', true]);   // tick gets t; methods run with this = scene
});

test('yalnız ikonlu kopyala düğmesi sonraki bileşenlerin kurulumunu bozmaz', async ({ page }) => {
  await page.goto(url(ROBUST));
  await expect(page.locator('#cp [role="status"]')).toHaveCount(1);
  await page.click('#t2');
  await expect(page.locator('#p2')).toBeVisible();
});

test('kontrol listesi öğe kimliğiyle saklanır: araya eklenen adım yapılmış görünmez', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('hendese-test-robust', JSON.stringify({ bir: true, iki: true })));
  await page.goto(url(ROBUST));
  expect(await page.$$eval('#rb input', b => b.map(x => x.checked))).toEqual([false, true, true]);
  await expect(page.locator('#rb .rb-count')).toHaveText('2 / 3');
});

test('kontrol listesi: önceki sürümün dizi kaydı kimlikli biçime taşınır', async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('hendese-test-robust', JSON.stringify([true, false, true])); } });
  await page.goto(url(ROBUST));
  expect(await page.$$eval('#rb input', b => b.map(x => x.checked))).toEqual([true, false, true]);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('hendese-test-robust')))).toEqual({ yeni: true, iki: true });
});

test("kart etiketleri colspan'ı sayar ve başlıktaki düğmeyi almaz", async ({ page }) => {
  await page.goto(url(ROBUST));
  expect(await page.$$eval('.tbl td', t => t.map(x => x.dataset.th))).toEqual(['Ad', 'Açık / Koyu', 'Not']);
});

test('bölüm içindeki bir hedefe gidiş, bölümü işaretler', async ({ page }) => {
  await page.goto(url(ROBUST));
  await page.evaluate(() => { Hendese.lockTo('inner'); Hendese.poke(); });
  await expect(page.locator('#rail-pos')).toHaveText('01 / 1');
});

test('start() sonrasında kaydedilen sahne hemen canlı moda girer', async ({ page }) => {
  await page.goto(url(ROBUST));
  await page.evaluate(() => Hendese.figScene({ el: '#late', render: function () { return {}; } }));
  await expect(page.locator('#late')).toHaveClass(/is-live/);
});

test('head.js ve init, <html data-theme-key> anahtarını okur', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('site-theme', 'dark'));
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(url(ROBUST));
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('dar ekran: açık çekmecenin kapat düğmesi üst çubuğun altında kalmaz', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(url('docs/motion'));
  await page.click('#nav-open');
  await page.click('#nav-close');   // a covered button fails the actionability check
  await expect(page.locator('body')).not.toHaveClass(/nav-open/);
});

test('dar ekran: pin çerçevesi tek sütuna iner', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(url('docs/motion'));
  expect(await page.$eval('.pin .frame', f => getComputedStyle(f).gridTemplateColumns.split(' ').length)).toBe(1);
});

test('baskı: kod koyu temada da koyu mürekkeple, istasyon açıklamalarının hepsi basılır', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', media: 'print' });
  await page.goto(url('docs/blueprint'));
  const rgb = await page.$eval('.code pre', p => getComputedStyle(p).color.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number));
  expect(rgb.reduce((a, b) => a + b, 0)).toBeLessThan(300);
  const panels = page.locator('.st-detail [data-for]');
  for (let i = 0; i < await panels.count(); i++) await expect(panels.nth(i)).toBeVisible();
});

test('gezgin: önizleme sessiz, seçim durum düğümünden duyurulur', async ({ page }) => {
  await page.goto(url(ROBUST));
  const status = page.locator('#xp + [role="status"]');
  await expect(status).toHaveText('');                         // nothing is announced on load
  await page.focus('[data-key="b"]');
  await expect(page.locator('[data-for="b"]')).toBeVisible();  // focus previews
  await expect(status).toHaveText('');
  await page.keyboard.press('Enter');
  await expect(status).toHaveText('beta');
});
