import { test, expect } from '@playwright/test';

test('loadConfig returns defaults without user config', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const cfg = await page.evaluate(() => window.MotionKit._internals.config.loadConfig());
  expect(cfg.defaults.duration).toBe(700);
  expect(cfg.breakpoints.mobile).toBe(768);
  expect(cfg.reducedMotion).toBe('auto');
  expect(cfg.debug).toBe(false);
});

test('loadConfig merges user overrides', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const cfg = await page.evaluate(() => {
    window.MotionKit = Object.assign(window.MotionKit || {}, {
      defaults: { duration: 1000 },
      breakpoints: { mobile: 900 },
    });
    return window.MotionKit._internals.config.loadConfig();
  });
  expect(cfg.defaults.duration).toBe(1000);
  expect(cfg.breakpoints.mobile).toBe(900);
});

test('getEffectOptions: global effect override beats defaults', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const opts = await page.evaluate(() => {
    window.MotionKit = Object.assign(window.MotionKit || {}, {
      defaults: { duration: 700 },
      effects: { parallax: { duration: 300 } },
    });
    const cfg = window.MotionKit._internals.config.loadConfig();
    return window.MotionKit._internals.config.getEffectOptions('parallax', cfg);
  });
  expect(opts.duration).toBe(300);
});

test('getEffectOptions: matching selector layers on top of effect defaults', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const opts = await page.evaluate(() => {
    window.MotionKit = Object.assign(window.MotionKit || {}, {
      defaults: { duration: 700 },
      effects: { parallax: { duration: 300 } },
      selectors: { '.hero': { effect: 'parallax', duration: 100 } },
    });
    window.mkClear();
    window.mkBuild({ className: 'hero', id: 'h' });
    const cfg = window.MotionKit._internals.config.loadConfig();
    return window.MotionKit._internals.config.getEffectOptions('parallax', cfg, document.getElementById('h'));
  });
  expect(opts.duration).toBe(100); // selector wins
});

test('getEffectOptions: selector with wrong effect name is ignored', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const opts = await page.evaluate(() => {
    window.MotionKit = Object.assign(window.MotionKit || {}, {
      defaults: { duration: 700 },
      selectors: { '.hero': { effect: 'parallax', duration: 100 } },
    });
    window.mkClear();
    window.mkBuild({ className: 'hero', id: 'h' });
    const cfg = window.MotionKit._internals.config.loadConfig();
    return window.MotionKit._internals.config.getEffectOptions('fade', cfg, document.getElementById('h'));
  });
  expect(opts.duration).toBe(700); // selector ignored, defaults win
});

test('getEffectOptions: non-matching selector is ignored', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const opts = await page.evaluate(() => {
    window.MotionKit = Object.assign(window.MotionKit || {}, {
      defaults: { duration: 700 },
      selectors: { '.hero': { effect: 'parallax', duration: 100 } },
    });
    window.mkClear();
    window.mkBuild({ className: 'not-hero', id: 'n' });
    const cfg = window.MotionKit._internals.config.loadConfig();
    return window.MotionKit._internals.config.getEffectOptions('parallax', cfg, document.getElementById('n'));
  });
  expect(opts.duration).toBe(700);
});

test('getEffectOptions: selector effect dispatch key is stripped from returned options', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const opts = await page.evaluate(() => {
    window.MotionKit = Object.assign(window.MotionKit || {}, {
      selectors: { '.hero': { effect: 'parallax', duration: 100 } },
    });
    window.mkClear();
    window.mkBuild({ className: 'hero', id: 'h' });
    const cfg = window.MotionKit._internals.config.loadConfig();
    return window.MotionKit._internals.config.getEffectOptions('parallax', cfg, document.getElementById('h'));
  });
  expect(opts.effect).toBeUndefined();
  expect(opts.duration).toBe(100);
});

test('loadConfig rejects __proto__ pollution attempt', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const result = await page.evaluate(() => {
    // Simulate a user injecting a polluting config
    window.MotionKit = Object.assign(window.MotionKit || {}, JSON.parse('{"defaults":{"__proto__":{"polluted":"yes"}}}'));
    const cfg = window.MotionKit._internals.config.loadConfig();
    const sentinel = {};
    return { cfgProtoPolluted: cfg.defaults?.polluted, sentinelPolluted: sentinel.polluted };
  });
  expect(result.cfgProtoPolluted).toBeUndefined();
  expect(result.sentinelPolluted).toBeUndefined();
});
