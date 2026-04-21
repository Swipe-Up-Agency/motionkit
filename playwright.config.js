import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 15_000,
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    baseURL: 'http://127.0.0.1:5173',
  },
  webServer: {
    command: 'python3 -m http.server 5173',
    port: 5173,
    reuseExistingServer: true,
    timeout: 5_000,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
