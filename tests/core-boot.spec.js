import { test, expect } from '@playwright/test';

test('registerEffect adds handler to the registry', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const size = await page.evaluate(() => {
    const { boot } = window.MotionKit._internals;
    boot.registerEffect({ name: 'dummy', classSelectors: ['mk-dummy'], mobileDefault: 'run', init: () => {} });
    return boot.getRegistry().size;
  });
  expect(size).toBeGreaterThan(0);
});

test('scan finds elements by any registered class selector', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const count = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild([
      { className: 'mk-dummy', id: 'a' },
      { className: 'mk-dummy mk-mobile-on', id: 'b' },
      { className: 'not-mk', id: 'c' },
    ]);
    const { boot } = window.MotionKit._internals;
    boot.registerEffect({ name: 'dummy', classSelectors: ['mk-dummy'], mobileDefault: 'run', init: () => {} });
    return boot.scan().length;
  });
  expect(count).toBe(2);
});

test('run() invokes init for each matched element', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const seen = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild([
      { className: 'mk-dummy', id: 'a' },
      { className: 'mk-dummy', id: 'b' },
    ]);
    const { boot } = window.MotionKit._internals;
    const visited = [];
    boot.registerEffect({
      name: 'dummy',
      classSelectors: ['mk-dummy'],
      mobileDefault: 'run',
      init: (el) => { visited.push(el.id); el.classList.add('mk-ready'); },
    });
    boot.run();
    return visited;
  });
  expect(seen).toEqual(['a', 'b']);
});

test('run() skips init when reduced motion active', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/tests/fixtures/harness.html');
  const called = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({ className: 'mk-dummy', id: 'a' });
    const { boot } = window.MotionKit._internals;
    let c = false;
    boot.registerEffect({
      name: 'dummy', classSelectors: ['mk-dummy'], mobileDefault: 'run', init: () => { c = true; },
    });
    boot.run();
    return c;
  });
  expect(called).toBe(false);
  await ctx.close();
});

test('refresh() picks up dynamically added elements', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const size = await page.evaluate(() => {
    window.mkClear();
    const { boot } = window.MotionKit._internals;
    const seenIds = new Set();
    boot.registerEffect({
      name: 'dummy', classSelectors: ['mk-dummy'], mobileDefault: 'run',
      init: (el) => seenIds.add(el.id),
    });
    boot.run();
    window.mkBuild({ className: 'mk-dummy', id: 'late' });
    boot.refresh();
    return seenIds.size;
  });
  expect(size).toBe(1);
});

test('getActiveEffects lists wired elements', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const active = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild([
      { className: 'mk-dummy', id: 'a' },
      { className: 'mk-dummy', id: 'b' },
    ]);
    const { boot } = window.MotionKit._internals;
    boot.registerEffect({ name: 'dummy', classSelectors: ['mk-dummy'], mobileDefault: 'run', init: () => {} });
    boot.run();
    return boot.getActiveEffects().map(({ element, effect }) => ({ id: element.id, effect }));
  });
  expect(active).toEqual([{ id: 'a', effect: 'dummy' }, { id: 'b', effect: 'dummy' }]);
});

test('init failure does not retry on refresh (no error storm)', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const calls = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({ className: 'mk-broken', id: 'b' });
    const { boot } = window.MotionKit._internals;
    let invocations = 0;
    boot.registerEffect({
      name: 'broken', classSelectors: ['mk-broken'], mobileDefault: 'run',
      init: () => { invocations += 1; throw new Error('kaboom'); },
    });
    boot.run();
    boot.refresh();
    boot.refresh();
    return invocations;
  });
  expect(calls).toBe(1);
});

test('refresh prunes disconnected elements from active list', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const size = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild([
      { className: 'mk-dummy', id: 'keep' },
      { className: 'mk-dummy', id: 'remove' },
    ]);
    const { boot } = window.MotionKit._internals;
    boot.registerEffect({
      name: 'dummy', classSelectors: ['mk-dummy'], mobileDefault: 'run', init: () => {},
    });
    boot.run();
    const before = boot.getActiveEffects().length;
    document.getElementById('remove').remove();
    boot.refresh();
    const after = boot.getActiveEffects().length;
    return { before, after };
  });
  expect(size.before).toBe(2);
  expect(size.after).toBe(1);
});

test('run() handles null breakpoints config without crashing', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const ok = await page.evaluate(() => {
    window.MotionKit = Object.assign(window.MotionKit || {}, { breakpoints: null });
    window.mkClear();
    window.mkBuild({ className: 'mk-dummy', id: 'a' });
    const { boot } = window.MotionKit._internals;
    boot.registerEffect({
      name: 'dummy', classSelectors: ['mk-dummy'], mobileDefault: 'run', init: () => {},
    });
    try { boot.run(); return true; } catch (e) { return String(e); }
  });
  expect(ok).toBe(true);
});
