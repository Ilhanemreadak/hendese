// e2e: docs/ ve starter/ sayfaları file:// üzerinden açılır (sunucu yok).
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  workers: 1,               // ponytail: tek işçi; Windows'ta paralel tarayıcı açılışı arada çöküyor, sıra önemli değil
  reporter: [['list']],
  updateSnapshots: process.env.CI ? 'none' : 'missing',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled' } },
  use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } },
});
