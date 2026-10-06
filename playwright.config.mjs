// e2e: docs/ and starter/ pages are opened over file:// (no server).
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  workers: 1,               // ponytail: single worker; parallel browser launches crash intermittently on Windows, order does not matter
  reporter: [['list']],
  updateSnapshots: process.env.CI ? 'none' : 'missing',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled' } },
  use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } },
});
