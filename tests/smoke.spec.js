import { test, expect } from '@playwright/test';

test('MotionKit global is exposed', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const version = await page.evaluate(() => window.MotionKit?.version);
  expect(version).toBe('1.4.1');
});

test('GSAP and ScrollTrigger are loaded', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const hasGsap = await page.evaluate(() => typeof window.gsap === 'object');
  const hasST = await page.evaluate(() => typeof window.ScrollTrigger === 'function');
  expect(hasGsap).toBe(true);
  expect(hasST).toBe(true);
});

test('mkBuild helper creates elements safely', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const id = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({ id: 'test', className: 'foo', text: 'hello' });
    return document.getElementById('test')?.textContent;
  });
  expect(id).toBe('hello');
});
