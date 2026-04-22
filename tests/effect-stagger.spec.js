import { test, expect } from '@playwright/test';

test('mk-stagger children become visible after reveal', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const opacities = await page.evaluate(async () => {
    window.mkClear();
    window.mkBuild({
      className: 'mk-stagger', id: 'grid',
      children: [
        { className: 'mk-fade-up', id: 'c0', text: '0' },
        { className: 'mk-fade-up', id: 'c1', text: '1' },
        { className: 'mk-fade-up', id: 'c2', text: '2' },
      ],
    });
    window.MotionKit.refresh();
    window.ScrollTrigger.refresh();
    document.getElementById('grid').scrollIntoView();
    await new Promise((r) => setTimeout(r, 1500));
    return ['c0', 'c1', 'c2'].map((id) => getComputedStyle(document.getElementById(id)).opacity);
  });
  opacities.forEach((o) => expect(Number(o)).toBeGreaterThan(0.9));
});

test('mk-stagger runs on mobile', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.goto('/tests/fixtures/harness.html');
  const a = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({
      className: 'mk-stagger', id: 'grid',
      children: [{ className: 'mk-fade-up', text: 'a' }],
    });
    window.MotionKit.refresh();
    return window.MotionKit.getActiveEffects().some(({ effect }) => effect === 'stagger');
  });
  expect(a).toBe(true);
  await ctx.close();
});
