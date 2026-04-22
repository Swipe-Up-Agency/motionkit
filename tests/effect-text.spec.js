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

test('mk-text-typewriter keeps text visible until scrolled into view', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const textBeforeScroll = await page.evaluate(() => {
    window.mkClear();
    // Build far below viewport so onEnter doesn't fire immediately
    window.mkBuild({
      tag: 'p', className: 'mk-text-typewriter', id: 't',
      style: { marginTop: '400vh' },
      text: 'Hello typewriter world',
    });
    window.MotionKit.refresh();
    return document.getElementById('t').textContent;
  });
  expect(textBeforeScroll).toBe('Hello typewriter world');
});

test('text attaches via config.selectors with variant option', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const count = await page.evaluate(async () => {
    window.mkClear();
    window.mkBuild({ tag: 'h1', id: 'seltext', text: 'Hello' });
    window.MotionKit = Object.assign(window.MotionKit || {}, {
      selectors: { '#seltext': { effect: 'text', variant: 'reveal' } },
    });
    window.MotionKit.refresh();
    await new Promise((r) => setTimeout(r, 200));
    return document.getElementById('seltext').querySelectorAll('.mk-char').length;
  });
  expect(count).toBe(5);
});
