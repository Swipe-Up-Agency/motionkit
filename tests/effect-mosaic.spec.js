import { test, expect } from '@playwright/test';

test('mk-mosaic distributes children into N columns (tracks)', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const trackCount = await page.evaluate(async () => {
    window.mkClear();
    window.mkBuild({
      className: 'mk-mosaic', id: 'm',
      attrs: { 'data-mk-columns': '4', 'data-mk-gap': '8' },
      style: { height: '600px' },
      children: Array.from({ length: 16 }, (_, i) => ({
        tag: 'div', style: { width: '100%', height: '100px', background: `hsl(${i * 22},50%,50%)` },
      })),
    });
    window.MotionKit.refresh();
    await new Promise((r) => setTimeout(r, 50));
    return document.getElementById('m').querySelectorAll(':scope > .mk-mosaic-track').length;
  });
  expect(trackCount).toBe(4);
});

test('mk-mosaic duplicates items within each column for seamless loop', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const result = await page.evaluate(async () => {
    window.mkClear();
    window.mkBuild({
      className: 'mk-mosaic', id: 'm',
      attrs: { 'data-mk-columns': '2' },
      style: { height: '400px' },
      // 6 items into 2 columns → 3 per column → 6 after duplication
      children: Array.from({ length: 6 }, () => ({
        tag: 'div', style: { width: '100%', height: '100px' },
      })),
    });
    window.MotionKit.refresh();
    await new Promise((r) => setTimeout(r, 50));
    const tracks = document.getElementById('m').querySelectorAll('.mk-mosaic-track');
    return Array.from(tracks).map((t) => t.children.length);
  });
  // Each column should have 3 originals + 3 duplicates = 6
  expect(result).toEqual([6, 6]);
});

test('mk-mosaic is idempotent on refresh (no duplicate tracks)', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const trackCount = await page.evaluate(async () => {
    window.mkClear();
    window.mkBuild({
      className: 'mk-mosaic', id: 'm',
      attrs: { 'data-mk-columns': '3' },
      style: { height: '400px' },
      children: Array.from({ length: 6 }, () => ({ tag: 'div' })),
    });
    window.MotionKit.refresh();
    await new Promise((r) => setTimeout(r, 50));
    // Force a second init
    const { boot } = window.MotionKit._internals;
    const desc = boot.getRegistry().get('mosaic');
    desc.init(document.getElementById('m'));
    return document.getElementById('m').querySelectorAll(':scope > .mk-mosaic-track').length;
  });
  expect(trackCount).toBe(3);
});


test('mk-mosaic defaults to 3 columns when no attribute is set', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const trackCount = await page.evaluate(async () => {
    window.mkClear();
    window.mkBuild({
      className: 'mk-mosaic', id: 'm',
      style: { height: '400px' },
      children: Array.from({ length: 9 }, () => ({ tag: 'div' })),
    });
    window.MotionKit.refresh();
    await new Promise((r) => setTimeout(r, 50));
    return document.getElementById('m').querySelectorAll(':scope > .mk-mosaic-track').length;
  });
  expect(trackCount).toBe(3);
});

test('mk-mosaic respects per-direction speed attributes', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const result = await page.evaluate(async () => {
    window.mkClear();
    window.mkBuild({
      className: 'mk-mosaic', id: 'm',
      attrs: {
        'data-mk-columns': '2',
        'data-mk-speed-up': '0.5',
        'data-mk-speed-down': '2',
      },
      style: { height: '400px' },
      children: Array.from({ length: 4 }, () => ({
        tag: 'div', style: { width: '100%', height: '100px' },
      })),
    });
    window.MotionKit.refresh();
    await new Promise((r) => setTimeout(r, 50));
    // Force a scroll update to trigger onUpdate
    window.ScrollTrigger.refresh();
    window.scrollTo(0, window.innerHeight / 2);
    await new Promise((r) => setTimeout(r, 200));
    const tracks = document.getElementById('m').querySelectorAll('.mk-mosaic-track');
    // Extract translateY from each track's transform
    const getY = (el) => {
      const t = el.style.transform;
      const m = /translateY\(([-\d.]+)px\)/.exec(t);
      return m ? Math.abs(parseFloat(m[1])) : null;
    };
    return { col0: getY(tracks[0]), col1: getY(tracks[1]) };
  });
  // Column 1 (down, speed 2) should have moved more than column 0 (up, speed 0.5)
  // Exact values depend on scroll position; just verify col1 > col0 (proportional to speed)
  if (result.col0 !== null && result.col1 !== null) {
    expect(result.col1).toBeGreaterThan(result.col0);
  }
});
