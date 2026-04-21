import { test, expect } from '@playwright/test';

test('isMobile at 375px with 768 breakpoint', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.goto('/tests/fixtures/harness.html');
  const r = await page.evaluate(() => window.MotionKit._internals.breakpoints.isMobile(768));
  expect(r).toBe(true);
  await ctx.close();
});

test('isMobile at 1280px with 768 breakpoint', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto('/tests/fixtures/harness.html');
  const r = await page.evaluate(() => window.MotionKit._internals.breakpoints.isMobile(768));
  expect(r).toBe(false);
  await ctx.close();
});

test('resolveMobileBehavior: run default on mobile', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const r = await page.evaluate(() =>
    window.MotionKit._internals.breakpoints.resolveMobileBehavior({
      mobileDefault: 'run', isMobile: true, override: null,
    }));
  expect(r).toBe(true);
});

test('resolveMobileBehavior: disable default on mobile', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const r = await page.evaluate(() =>
    window.MotionKit._internals.breakpoints.resolveMobileBehavior({
      mobileDefault: 'disable', isMobile: true, override: null,
    }));
  expect(r).toBe(false);
});

test('resolveMobileBehavior: on override beats disable default', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const r = await page.evaluate(() =>
    window.MotionKit._internals.breakpoints.resolveMobileBehavior({
      mobileDefault: 'disable', isMobile: true, override: 'on',
    }));
  expect(r).toBe(true);
});

test('resolveMobileBehavior: off override beats everything', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const r = await page.evaluate(() =>
    window.MotionKit._internals.breakpoints.resolveMobileBehavior({
      mobileDefault: 'run', isMobile: false, override: 'off',
    }));
  expect(r).toBe(false);
});
