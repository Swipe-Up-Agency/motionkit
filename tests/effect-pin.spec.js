import { test, expect } from '@playwright/test';

test('mk-pin registers on desktop', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const a = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({ tag: 'section', className: 'mk-pin', id: 'p', style: { height: '500px' } });
    window.MotionKit.refresh();
    return window.MotionKit.getActiveEffects().some(({ effect }) => effect === 'pin');
  });
  expect(a).toBe(true);
});

test('mk-pin disabled on mobile', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.goto('/tests/fixtures/harness.html');
  const a = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({ tag: 'section', className: 'mk-pin', id: 'p', style: { height: '500px' } });
    window.MotionKit.refresh();
    return window.MotionKit.getActiveEffects().some(({ effect }) => effect === 'pin');
  });
  expect(a).toBe(false);
  await ctx.close();
});
