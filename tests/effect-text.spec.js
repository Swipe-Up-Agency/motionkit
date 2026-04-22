import { test, expect } from '@playwright/test';

test('mk-text-reveal splits text into characters', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const count = await page.evaluate(async () => {
    window.mkClear();
    window.mkBuild({ tag: 'h1', className: 'mk-text-reveal', id: 't', text: 'Hello' });
    window.MotionKit.refresh();
    await new Promise((r) => setTimeout(r, 200));
    return document.getElementById('t').querySelectorAll('.mk-char').length;
  });
  expect(count).toBe(5);
});

test('mk-text-split splits into words', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const count = await page.evaluate(async () => {
    window.mkClear();
    window.mkBuild({ tag: 'h1', className: 'mk-text-split', id: 't', text: 'Hello world now' });
    window.MotionKit.refresh();
    await new Promise((r) => setTimeout(r, 200));
    return document.getElementById('t').querySelectorAll('.mk-word').length;
  });
  expect(count).toBe(3);
});
