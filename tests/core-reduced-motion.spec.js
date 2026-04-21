import { test, expect } from '@playwright/test';

test('returns false when OS prefers no-preference', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  await page.goto('/tests/fixtures/harness.html');
  const r = await page.evaluate(() => window.MotionKit._internals.reducedMotion.isReducedMotion('auto'));
  expect(r).toBe(false);
  await ctx.close();
});

test('returns true when OS prefers reduce and config is auto', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/tests/fixtures/harness.html');
  const r = await page.evaluate(() => window.MotionKit._internals.reducedMotion.isReducedMotion('auto'));
  expect(r).toBe(true);
  await ctx.close();
});

test('returns true when config is always', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  await page.goto('/tests/fixtures/harness.html');
  const r = await page.evaluate(() => window.MotionKit._internals.reducedMotion.isReducedMotion('always'));
  expect(r).toBe(true);
  await ctx.close();
});

test('returns false when config is never even if OS prefers reduce', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/tests/fixtures/harness.html');
  const r = await page.evaluate(() => window.MotionKit._internals.reducedMotion.isReducedMotion('never'));
  expect(r).toBe(false);
  await ctx.close();
});
