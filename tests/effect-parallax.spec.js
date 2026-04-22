import { test, expect } from '@playwright/test';

test('mk-parallax registers on desktop', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const a = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({ className: 'mk-parallax', id: 'p' });
    window.MotionKit.refresh();
    return window.MotionKit.getActiveEffects().some(({ effect }) => effect === 'parallax');
  });
  expect(a).toBe(true);
});

test('mk-parallax disabled on mobile', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.goto('/tests/fixtures/harness.html');
  const a = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({ className: 'mk-parallax', id: 'p' });
    window.MotionKit.refresh();
    return window.MotionKit.getActiveEffects().some(({ effect }) => effect === 'parallax');
  });
  expect(a).toBe(false);
  await ctx.close();
});

test('mk-mobile-on forces parallax on mobile', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.goto('/tests/fixtures/harness.html');
  const a = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({ className: 'mk-parallax mk-mobile-on', id: 'p' });
    window.MotionKit.refresh();
    return window.MotionKit.getActiveEffects().some(({ effect }) => effect === 'parallax');
  });
  expect(a).toBe(true);
  await ctx.close();
});
