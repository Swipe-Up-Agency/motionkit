import { test, expect } from '@playwright/test';

test('mk-hscroll registers on desktop', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const a = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({
      tag: 'section', className: 'mk-hscroll', id: 'h',
      style: { height: '100vh', overflow: 'hidden' },
      children: [{ style: { width: '300vw', display: 'flex' }, children: [
        { style: { width: '100vw' } }, { style: { width: '100vw' } }, { style: { width: '100vw' } },
      ] }],
    });
    window.MotionKit.refresh();
    return window.MotionKit.getActiveEffects().some(({ effect }) => effect === 'hscroll');
  });
  expect(a).toBe(true);
});

test('mk-hscroll disabled on mobile → native overflow fallback', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.goto('/tests/fixtures/harness.html');
  const r = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({
      tag: 'section', className: 'mk-hscroll', id: 'h',
      style: { height: '100vh' },
      children: [{ style: { width: '300vw', display: 'flex' } }],
    });
    window.MotionKit.refresh();
    const h = document.getElementById('h');
    return {
      active: window.MotionKit.getActiveEffects().some(({ effect }) => effect === 'hscroll'),
      overflowX: getComputedStyle(h).overflowX,
    };
  });
  expect(r.active).toBe(false);
  expect(r.overflowX).toBe('auto');
  await ctx.close();
});
