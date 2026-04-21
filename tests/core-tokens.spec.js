import { test, expect } from '@playwright/test';

test('duration tokens', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const r = await page.evaluate(() => window.MotionKit._internals?.tokens?.DURATION);
  expect(r).toEqual({ fast: 300, base: 700, slow: 1200 });
});

test('delay tokens cover 100–800ms', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const r = await page.evaluate(() => window.MotionKit._internals?.tokens?.DELAY);
  expect(r).toEqual({ 100: 100, 200: 200, 300: 300, 400: 400, 500: 500, 600: 600, 700: 700, 800: 800 });
});

test('easing tokens include base and dramatic', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const e = await page.evaluate(() => window.MotionKit._internals?.tokens?.EASING);
  expect(e.base).toBe('power2.out');
  expect(e.dramatic).toBe('expo.out');
});
