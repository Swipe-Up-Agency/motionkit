import { test, expect } from '@playwright/test';

test('mk-fade-up hidden before init then revealed when in view', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const { before, after } = await page.evaluate(async () => {
    window.mkClear();
    window.mkBuild({ className: 'mk-fade-up', id: 'f', text: 'hi' });
    const el = document.getElementById('f');
    const b = getComputedStyle(el).opacity;
    window.MotionKit.refresh();
    window.ScrollTrigger.refresh();
    el.scrollIntoView();
    await new Promise((r) => setTimeout(r, 1200));
    return { before: b, after: getComputedStyle(el).opacity };
  });
  expect(Number(before)).toBeLessThan(0.2);
  expect(Number(after)).toBeGreaterThan(0.9);
});

test('mk-fade-up element gets mk-ready class after init', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const ok = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({ className: 'mk-fade-up', id: 'f' });
    window.MotionKit.refresh();
    return document.getElementById('f').classList.contains('mk-ready');
  });
  expect(ok).toBe(true);
});

test('reduced-motion skips animation and reveals immediately', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/tests/fixtures/harness.html');
  const op = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({ className: 'mk-fade-up', id: 'f', text: 'hi' });
    window.MotionKit.refresh();
    return getComputedStyle(document.getElementById('f')).opacity;
  });
  expect(Number(op)).toBe(1);
  await ctx.close();
});
