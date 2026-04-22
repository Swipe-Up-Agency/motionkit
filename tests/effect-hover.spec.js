import { test, expect } from '@playwright/test';

test('mk-hover-zoom scales on pointerenter', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const transform = await page.evaluate(async () => {
    window.mkClear();
    window.mkBuild({ className: 'mk-hover-zoom', id: 'h', style: { width: '100px', height: '100px', background: '#333' } });
    window.MotionKit.refresh();
    const el = document.getElementById('h');
    el.dispatchEvent(new PointerEvent('pointerenter'));
    await new Promise((r) => setTimeout(r, 400));
    return getComputedStyle(el).transform;
  });
  expect(transform).not.toBe('none');
});

test('hover effects are disabled on mobile viewport', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.goto('/tests/fixtures/harness.html');
  const active = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({ className: 'mk-hover-zoom', id: 'h' });
    window.MotionKit.refresh();
    return window.MotionKit.getActiveEffects().some(({ effect }) => effect === 'hover');
  });
  expect(active).toBe(false);
  await ctx.close();
});
