// Renders the README hero images (.github/assets/hero-{light,dark}.png) from .github/assets/hero.html.
// Usage: npm run build && node tools/readme-hero.mjs
import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';

const browser = await chromium.launch();
for (const scheme of ['light', 'dark']) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2, colorScheme: scheme, reducedMotion: 'reduce' });
  await page.goto(pathToFileURL('.github/assets/hero.html').href);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#hero').screenshot({ path: `.github/assets/hero-${scheme}.png` });
  await page.close();
}
await browser.close();
