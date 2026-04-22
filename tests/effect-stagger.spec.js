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

test('mk-stagger-diagonal sequences children along diagonals', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const firstIdx = await page.evaluate(async () => {
    window.mkClear();
    window.mkBuild({
      className: 'mk-stagger mk-stagger-diagonal', id: 'g',
      style: { display: 'grid', gridTemplateColumns: 'repeat(3,80px)', gap: '0' },
      children: Array.from({ length: 9 }, (_, i) => ({
        className: 'mk-fade-up', id: `d${i}`, style: { width: '80px', height: '80px' },
      })),
    });
    window.MotionKit.refresh();
    window.ScrollTrigger.refresh();
    document.getElementById('g').scrollIntoView();
    await new Promise((r) => setTimeout(r, 100));
    // First child to become visible should be the top-left (index 0)
    const opacities = Array.from({ length: 9 }, (_, i) =>
      parseFloat(getComputedStyle(document.getElementById(`d${i}`)).opacity)
    );
    // Find the index with the highest current opacity — should be 0 (top-left)
    let max = 0, maxIdx = 0;
    opacities.forEach((o, i) => { if (o > max) { max = o; maxIdx = i; } });
    return maxIdx;
  });
  expect(firstIdx).toBe(0); // top-left of a 3x3 grid is the diagonal-0 element
});

test('mk-stagger defensively marks children mk-ready on init failure', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const allReady = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({
      className: 'mk-stagger', id: 'g',
      children: [
        { className: 'mk-fade-up', id: 'x0' },
        { className: 'mk-fade-up', id: 'x1' },
      ],
    });
    // Break gsap.fromTo temporarily to force a throw inside stagger.init
    const origFromTo = window.gsap.fromTo;
    window.gsap.fromTo = () => { throw new Error('synthetic failure'); };
    try {
      window.MotionKit.refresh();
    } catch (_) { /* boot swallows, but just in case */ }
    window.gsap.fromTo = origFromTo;
    return ['x0','x1'].every((id) => document.getElementById(id).classList.contains('mk-ready'));
  });
  expect(allReady).toBe(true);
});
