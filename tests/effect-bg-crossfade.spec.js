import { test, expect } from '@playwright/test';

test('mk-bg-crossfade creates fixed background layers', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const count = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({
      tag: 'section', className: 'mk-bg-crossfade', id: 'bg', style: { position: 'relative' },
      children: [
        { className: 'mk-bg-image', attrs: { 'data-mk-bg': 'https://via.placeholder.com/400/111' } },
        { className: 'mk-bg-image', attrs: { 'data-mk-bg': 'https://via.placeholder.com/400/222' } },
        { className: 'mk-bg-image', attrs: { 'data-mk-bg': 'https://via.placeholder.com/400/333' } },
      ],
    });
    window.MotionKit.refresh();
    return document.getElementById('bg').querySelectorAll('.mk-bg-layer').length;
  });
  expect(count).toBe(3);
});

test('mk-bg-crossfade mobile fallback sets first image as background', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.goto('/tests/fixtures/harness.html');
  const r = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({
      tag: 'section', className: 'mk-bg-crossfade', id: 'bg', style: { position: 'relative' },
      children: [
        { className: 'mk-bg-image', attrs: { 'data-mk-bg': 'https://via.placeholder.com/400/111' } },
        { className: 'mk-bg-image', attrs: { 'data-mk-bg': 'https://via.placeholder.com/400/222' } },
      ],
    });
    window.MotionKit.refresh();
    const bg = document.getElementById('bg');
    return {
      backgroundImage: getComputedStyle(bg).backgroundImage,
      layers: bg.querySelectorAll('.mk-bg-layer').length,
    };
  });
  expect(r.backgroundImage).toContain('https://via.placeholder.com/400/111');
  expect(r.layers).toBe(0);
  await ctx.close();
});

test('mk-bg-crossfade init is idempotent (no duplicate layers on re-init)', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const count = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({
      tag: 'section', className: 'mk-bg-crossfade', id: 'bg', style: { position: 'relative' },
      children: [
        { className: 'mk-bg-image', attrs: { 'data-mk-bg': 'https://via.placeholder.com/400/111' } },
        { className: 'mk-bg-image', attrs: { 'data-mk-bg': 'https://via.placeholder.com/400/222' } },
      ],
    });
    window.MotionKit.refresh();
    // Force a second init call on the same element via the internal boot
    const { boot } = window.MotionKit._internals;
    const desc = boot.getRegistry().get('bgCrossfade');
    desc.init(document.getElementById('bg'));
    return document.getElementById('bg').querySelectorAll('.mk-bg-layer').length;
  });
  expect(count).toBe(2);
});
