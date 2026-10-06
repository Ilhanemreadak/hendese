// Davranış: çekmece (klavye), tema düğmesi, pin sahnesi ilerlemesi, reduced-motion durgun Hoca, seçim grubu.
import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const url = p => pathToFileURL(path.resolve(p + '.html')).href;
const idle = page => expect.poll(() => page.evaluate(() => Hendese.state.idle)).toBe(true);

test('çekmece klavyeyle açılır ve Esc ile kapanır (1000px)', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.goto(url('docs/index'));
  await page.focus('#nav-open'); await page.keyboard.press('Enter');
  await expect(page.locator('body')).toHaveClass(/nav-open/);
  await expect(page.locator('#nav-open')).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('body')).not.toHaveClass(/nav-open/);
  await expect(page.locator('#nav-open')).toBeFocused();
});

test('tema düğmesi temayı değiştirir, saklar ve olay yayar', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(url('docs/index'));
  await page.evaluate(() => { window.__t = null; document.addEventListener('hendese:theme', e => { window.__t = e.detail; }); });
  await page.click('.rail-foot [data-theme-toggle]');
  expect(await page.evaluate(() => [document.documentElement.dataset.theme, localStorage.getItem('hendese-theme'), window.__t])).toEqual(['dark', 'dark', 'dark']);
});

test('pin sahnesi: kaydırma mürekkebi ilerletir, HUD aşamayı yazar', async ({ page }) => {
  await page.goto(url('docs/motion'));
  const ink = page.locator('#m-pin .m-ink');
  const [top, len] = await page.evaluate(() => { const el = document.querySelector('#m-pin'); return [el.getBoundingClientRect().top + scrollY, el.offsetHeight - innerHeight]; });
  const at = async k => { await page.evaluate(y => scrollTo(0, y), Math.round(top + len * k)); await idle(page);
    return { off: +(await ink.evaluate(e => e.style.strokeDashoffset)), stage: await page.locator('[data-hud="stage"]').textContent() }; };
  const a = await at(0), b = await at(.5), c = await at(1);
  expect(a.off).toBeGreaterThan(b.off); expect(b.off).toBeGreaterThan(c.off); expect(c.off).toBe(0);
  expect(c.stage).toBe('Dağıtım');
});

test('reduced motion: sahne son halde, durgun Hoca kopyaları yerinde', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(url('docs/motion'));
  expect(await page.evaluate(() => Hendese.state.motion)).toBe(false);
  expect(await page.locator('#m-pin .m-ink').evaluate(e => e.style.strokeDashoffset)).toBe('');
  expect(await page.locator('.hoca-still').count()).toBeGreaterThanOrEqual(3);
});

test('seçim grubu okla değişir, sonuç satırı güncellenir', async ({ page }) => {
  await page.goto(url('docs/motion'));
  await page.focus('[name=m-rep][value="3"]');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('[name=m-rep][value="2"]')).toBeChecked();
  await expect(page.locator('#m-readout')).toContainText('Fark var');
});
