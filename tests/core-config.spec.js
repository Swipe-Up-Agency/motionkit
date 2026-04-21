import { test, expect } from '@playwright/test';

test('loadConfig returns defaults without user config', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const cfg = await page.evaluate(() => window.MotionKit._internals.config.loadConfig());
  expect(cfg.defaults.duration).toBe(700);
  expect(cfg.breakpoints.mobile).toBe(768);
  expect(cfg.reducedMotion).toBe('auto');
  expect(cfg.debug).toBe(false);
});

test('loadConfig merges user overrides', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const cfg = await page.evaluate(() => {
    window.MotionKit = Object.assign(window.MotionKit || {}, {
      defaults: { duration: 1000 },
      breakpoints: { mobile: 900 },
    });
    return window.MotionKit._internals.config.loadConfig();
  });
  expect(cfg.defaults.duration).toBe(1000);
  expect(cfg.breakpoints.mobile).toBe(900);
});

test('getEffectOptions: global effect override beats defaults', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const opts = await page.evaluate(() => {
    window.MotionKit = Object.assign(window.MotionKit || {}, {
      defaults: { duration: 700 },
      effects: { parallax: { duration: 300 } },
    });
    const cfg = window.MotionKit._internals.config.loadConfig();
    return window.MotionKit._internals.config.getEffectOptions('parallax', cfg);
  });
  expect(opts.duration).toBe(300);
});
