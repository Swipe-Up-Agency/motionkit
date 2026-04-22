import { test, expect } from '@playwright/test';

test('mk-ken-burns auto-adds overflow:hidden to parent', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const overflow = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({
      id: 'wrap',
      style: { width: '200px', height: '150px' },
      children: [{ tag: 'img', className: 'mk-ken-burns', id: 'k', attrs: { src: 'https://via.placeholder.com/400' } }],
    });
    window.MotionKit.refresh();
    return getComputedStyle(document.getElementById('wrap')).overflow;
  });
  expect(overflow).toBe('hidden');
});

test('mk-ken-burns disabled on mobile', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.goto('/tests/fixtures/harness.html');
  const a = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({ tag: 'img', className: 'mk-ken-burns', id: 'k', attrs: { src: 'https://via.placeholder.com/400' } });
    window.MotionKit.refresh();
    return window.MotionKit.getActiveEffects().some(({ effect }) => effect === 'kenBurns');
  });
  expect(a).toBe(false);
  await ctx.close();
});
