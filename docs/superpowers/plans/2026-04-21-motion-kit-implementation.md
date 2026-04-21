# MotionKit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build MotionKit v1.0.0 — a class-driven JavaScript animation library for Squarespace 7.1 sites, with 10 effects powered by GSAP + ScrollTrigger, distributed via jsDelivr + GitHub semver tags.

**Architecture:** Single IIFE bundle built with esbuild. Exposes `window.MotionKit`. Boots on `DOMContentLoaded`, scans DOM for `mk-*` classes, routes each matched element to an effect module that creates a ScrollTrigger/listener honoring reduced-motion and mobile-breakpoint guards.

**Tech Stack:** JavaScript (ES2020 → IIFE via esbuild), GSAP 3.12 + ScrollTrigger + SplitText (loaded from unpkg CDN by consumer), Playwright for browser tests, npm, Node 20+.

**Spec reference:** `docs/superpowers/specs/2026-04-21-motion-kit-design.md`

**Working directory for all tasks:** `/Users/adrienolinger/Claude/motion-kit`

**Testing note:** All Playwright tests build fixture DOM with a safe `window.mkBuild(spec)` / `window.mkClear()` helper installed in the test harness. Tests never assign to element attributes used as HTML sinks — they construct elements with `createElement`, `classList.add`, `textContent`, and `setAttribute` only.

---

## Phase 1: Project scaffolding (Tasks 1–4)

### Task 1: Initialize repository and npm project

**Files:**
- Create: `/Users/adrienolinger/Claude/motion-kit/package.json`
- Create: `/Users/adrienolinger/Claude/motion-kit/.gitignore`
- Create: `/Users/adrienolinger/Claude/motion-kit/README.md` (stub)

- [ ] **Step 1: Initialize git repo**

Run from `/Users/adrienolinger/Claude/motion-kit`:
```bash
git init
git branch -M main
```
Expected: `Initialized empty Git repository` and branch renamed to `main`.

- [ ] **Step 2: Create package.json**

Write to `/Users/adrienolinger/Claude/motion-kit/package.json`:
```json
{
  "name": "motion-kit",
  "version": "0.1.0",
  "description": "Class-driven animation library for Squarespace 7.1 sites",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "node esbuild.config.js",
    "dev": "node esbuild.config.js --watch",
    "demo": "python3 -m http.server 5173 --directory demo",
    "test": "playwright test",
    "test:ui": "playwright test --ui"
  },
  "engines": {
    "node": ">=20"
  },
  "devDependencies": {
    "@playwright/test": "^1.47.0",
    "esbuild": "^0.23.0",
    "gsap": "^3.12.5"
  }
}
```

- [ ] **Step 3: Create .gitignore**

Write to `/Users/adrienolinger/Claude/motion-kit/.gitignore`:
```
node_modules/
.DS_Store
*.log
test-results/
playwright-report/
playwright/.cache/
```

Note: `dist/` is **not** ignored — it must be committed so jsDelivr can serve it.

- [ ] **Step 4: Create README stub**

Write to `/Users/adrienolinger/Claude/motion-kit/README.md`:
```markdown
# MotionKit

Class-driven animation library for Squarespace 7.1 sites, built on GSAP + ScrollTrigger.

**Status:** In development. See `docs/superpowers/specs/2026-04-21-motion-kit-design.md`.
```

- [ ] **Step 5: Install dependencies**

Run from `/Users/adrienolinger/Claude/motion-kit`:
```bash
npm install
```
Expected: `node_modules/` populated, `package-lock.json` created.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .gitignore README.md
git commit -m "chore: initialize motion-kit project"
```

---

### Task 2: Set up esbuild build system

**Files:**
- Create: `/Users/adrienolinger/Claude/motion-kit/esbuild.config.js`
- Create: `/Users/adrienolinger/Claude/motion-kit/src/index.js` (stub)
- Create: `/Users/adrienolinger/Claude/motion-kit/src/styles/anti-fouc.css`

- [ ] **Step 1: Create stub entry point**

Write to `/Users/adrienolinger/Claude/motion-kit/src/index.js`:
```js
(function boot() {
  if (typeof window === 'undefined') return;
  window.MotionKit = window.MotionKit || {};
  window.MotionKit.version = '0.1.0';
})();
```

- [ ] **Step 2: Create anti-FOUC stylesheet**

Write to `/Users/adrienolinger/Claude/motion-kit/src/styles/anti-fouc.css`:
```css
.mk-fade-up:not(.mk-ready),
.mk-fade-down:not(.mk-ready),
.mk-fade-in:not(.mk-ready),
.mk-slide-left:not(.mk-ready),
.mk-slide-right:not(.mk-ready),
.mk-scale-in:not(.mk-ready),
.mk-reveal-up:not(.mk-ready) {
  opacity: 0;
}
```

- [ ] **Step 3: Create esbuild config**

Write to `/Users/adrienolinger/Claude/motion-kit/esbuild.config.js`:
```js
import { build, context } from 'esbuild';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssContents = readFileSync(`${__dirname}/src/styles/anti-fouc.css`, 'utf8');
mkdirSync(`${__dirname}/dist`, { recursive: true });

const options = {
  entryPoints: [`${__dirname}/src/index.js`],
  outfile: `${__dirname}/dist/motion-kit.min.js`,
  bundle: true,
  minify: true,
  sourcemap: true,
  format: 'iife',
  target: ['es2020'],
  define: { __ANTI_FOUC_CSS__: JSON.stringify(cssContents) },
  logLevel: 'info',
};

const watch = process.argv.includes('--watch');
if (watch) {
  const ctx = await context(options);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await build(options);
  console.log('Build complete.');
}
```

- [ ] **Step 4: Run build**

Run:
```bash
npm run build
```
Expected: `Build complete.`; `dist/motion-kit.min.js` exists.

- [ ] **Step 5: Verify IIFE output**

Run:
```bash
head -c 50 dist/motion-kit.min.js
```
Expected: output begins with `(()=>{`.

- [ ] **Step 6: Commit**

```bash
git add esbuild.config.js src/index.js src/styles/anti-fouc.css dist/
git commit -m "feat: esbuild IIFE bundle with inlined anti-FOUC CSS"
```

---

### Task 3: Set up Playwright test harness with safe fixture builder

**Files:**
- Create: `/Users/adrienolinger/Claude/motion-kit/playwright.config.js`
- Create: `/Users/adrienolinger/Claude/motion-kit/tests/fixtures/harness.html`
- Create: `/Users/adrienolinger/Claude/motion-kit/tests/smoke.spec.js`

- [ ] **Step 1: Install Playwright browsers**

Run:
```bash
npx playwright install chromium
```

- [ ] **Step 2: Create Playwright config**

Write to `/Users/adrienolinger/Claude/motion-kit/playwright.config.js`:
```js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 15_000,
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    baseURL: 'http://127.0.0.1:5173',
  },
  webServer: {
    command: 'python3 -m http.server 5173 --directory tests/fixtures',
    port: 5173,
    reuseExistingServer: true,
    timeout: 5_000,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
```

- [ ] **Step 3: Create test harness with safe DOM builder**

Write to `/Users/adrienolinger/Claude/motion-kit/tests/fixtures/harness.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>MotionKit Test Harness</title>
  <script src="https://unpkg.com/gsap@3.12/dist/gsap.min.js"></script>
  <script src="https://unpkg.com/gsap@3.12/dist/ScrollTrigger.min.js"></script>
  <script src="https://unpkg.com/gsap@3.12/dist/SplitText.min.js"></script>
  <script>
    // Safe DOM fixture builder. Never uses innerHTML.
    // spec: { tag?, id?, className?, style?, attrs?, text?, children? }
    window.mkClear = function () {
      const fixture = document.getElementById('fixture');
      while (fixture.firstChild) fixture.removeChild(fixture.firstChild);
    };
    window.mkBuild = function (spec) {
      function build(node) {
        if (typeof node === 'string') return document.createTextNode(node);
        const el = document.createElement(node.tag || 'div');
        if (node.id) el.id = node.id;
        if (node.className) el.className = node.className;
        if (node.style) Object.assign(el.style, node.style);
        if (node.attrs) {
          for (const [k, v] of Object.entries(node.attrs)) el.setAttribute(k, v);
        }
        if (node.text) el.textContent = node.text;
        if (node.children) {
          for (const child of node.children) el.appendChild(build(child));
        }
        return el;
      }
      const fixture = document.getElementById('fixture');
      const list = Array.isArray(spec) ? spec : [spec];
      for (const s of list) fixture.appendChild(build(s));
    };
  </script>
</head>
<body>
  <div id="fixture"></div>
  <script src="../../dist/motion-kit.min.js"></script>
</body>
</html>
```

- [ ] **Step 4: Write smoke test**

Write to `/Users/adrienolinger/Claude/motion-kit/tests/smoke.spec.js`:
```js
import { test, expect } from '@playwright/test';

test('MotionKit global is exposed', async ({ page }) => {
  await page.goto('/harness.html');
  const version = await page.evaluate(() => window.MotionKit?.version);
  expect(version).toBe('0.1.0');
});

test('GSAP and ScrollTrigger are loaded', async ({ page }) => {
  await page.goto('/harness.html');
  const hasGsap = await page.evaluate(() => typeof window.gsap === 'object');
  const hasST = await page.evaluate(() => typeof window.ScrollTrigger === 'function');
  expect(hasGsap).toBe(true);
  expect(hasST).toBe(true);
});

test('mkBuild helper creates elements safely', async ({ page }) => {
  await page.goto('/harness.html');
  const id = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({ id: 'test', className: 'foo', text: 'hello' });
    return document.getElementById('test')?.textContent;
  });
  expect(id).toBe('hello');
});
```

- [ ] **Step 5: Run tests**

Run:
```bash
npm test
```
Expected: 3 passed.

- [ ] **Step 6: Commit**

```bash
git add playwright.config.js tests/
git commit -m "test: Playwright harness with safe DOM fixture builder"
```

---

### Task 4: Scaffold demo page

**Files:**
- Create: `/Users/adrienolinger/Claude/motion-kit/demo/index.html`

- [ ] **Step 1: Write demo page**

Write to `/Users/adrienolinger/Claude/motion-kit/demo/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>MotionKit Demo</title>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; background: #111; color: #eee; }
    .section { min-height: 100vh; padding: 4rem 2rem; border-bottom: 1px solid #333; }
    h1, h2 { margin: 0 0 1rem; }
    .spacer { height: 80vh; }
    img { max-width: 100%; display: block; }
  </style>
  <script src="https://unpkg.com/gsap@3.12/dist/gsap.min.js"></script>
  <script src="https://unpkg.com/gsap@3.12/dist/ScrollTrigger.min.js"></script>
  <script src="https://unpkg.com/gsap@3.12/dist/SplitText.min.js"></script>
</head>
<body>
  <header class="section">
    <h1>MotionKit Demo</h1>
    <p>Scroll down to see each effect.</p>
  </header>
  <div class="spacer"></div>

  <!-- DEMO_INSERTION_POINT: effect sections are appended here as implemented -->

  <footer class="section">
    <h2>End</h2>
  </footer>

  <script src="../dist/motion-kit.min.js"></script>
</body>
</html>
```

- [ ] **Step 2: Smoke-test the demo**

Run `npm run demo` in one terminal. Open `http://localhost:5173/` in a browser. Confirm the header "MotionKit Demo" loads with no console errors. Kill the server.

- [ ] **Step 3: Commit**

```bash
git add demo/
git commit -m "feat: demo page scaffold"
```

---

## Phase 2: Core runtime (Tasks 5–10)

### Task 5: Tokens module

**Files:**
- Create: `/Users/adrienolinger/Claude/motion-kit/src/core/tokens.js`
- Create: `/Users/adrienolinger/Claude/motion-kit/tests/core-tokens.spec.js`

- [ ] **Step 1: Write failing test**

Write to `/Users/adrienolinger/Claude/motion-kit/tests/core-tokens.spec.js`:
```js
import { test, expect } from '@playwright/test';

test('duration tokens', async ({ page }) => {
  await page.goto('/harness.html');
  const r = await page.evaluate(() => window.MotionKit._internals?.tokens?.DURATION);
  expect(r).toEqual({ fast: 300, base: 700, slow: 1200 });
});

test('delay tokens cover 100–800ms', async ({ page }) => {
  await page.goto('/harness.html');
  const r = await page.evaluate(() => window.MotionKit._internals?.tokens?.DELAY);
  expect(r).toEqual({ 100: 100, 200: 200, 300: 300, 400: 400, 500: 500, 600: 600, 700: 700, 800: 800 });
});

test('easing tokens include base and dramatic', async ({ page }) => {
  await page.goto('/harness.html');
  const e = await page.evaluate(() => window.MotionKit._internals?.tokens?.EASING);
  expect(e.base).toBe('power2.out');
  expect(e.dramatic).toBe('expo.out');
});
```

- [ ] **Step 2: Run test — expect fail**

```bash
npm test -- core-tokens
```
Expected: 3 failed (`_internals` undefined).

- [ ] **Step 3: Implement tokens**

Write to `/Users/adrienolinger/Claude/motion-kit/src/core/tokens.js`:
```js
export const DURATION = { fast: 300, base: 700, slow: 1200 };
export const DELAY = { 100: 100, 200: 200, 300: 300, 400: 400, 500: 500, 600: 600, 700: 700, 800: 800 };
export const EASING = { base: 'power2.out', dramatic: 'expo.out', bounce: 'back.out(1.7)', linear: 'none' };
export const DISTANCE = { sm: 20, base: 60, lg: 120 };
```

- [ ] **Step 4: Wire into index.js**

Replace `/Users/adrienolinger/Claude/motion-kit/src/index.js`:
```js
import * as tokens from './core/tokens.js';

(function boot() {
  if (typeof window === 'undefined') return;
  window.MotionKit = window.MotionKit || {};
  window.MotionKit.version = '0.1.0';
  window.MotionKit._internals = { tokens };
})();
```

- [ ] **Step 5: Build + test**

```bash
npm run build && npm test -- core-tokens
```
Expected: 3 passed.

- [ ] **Step 6: Commit**

```bash
git add src/core/tokens.js src/index.js tests/core-tokens.spec.js dist/
git commit -m "feat(core): tokens for duration/delay/easing/distance"
```

---

### Task 6: Reduced-motion module

**Files:**
- Create: `/Users/adrienolinger/Claude/motion-kit/src/core/reduced-motion.js`
- Create: `/Users/adrienolinger/Claude/motion-kit/tests/core-reduced-motion.spec.js`

- [ ] **Step 1: Write failing tests**

Write to `/Users/adrienolinger/Claude/motion-kit/tests/core-reduced-motion.spec.js`:
```js
import { test, expect } from '@playwright/test';

test('returns false when OS prefers no-preference', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  await page.goto('/harness.html');
  const r = await page.evaluate(() => window.MotionKit._internals.reducedMotion.isReducedMotion('auto'));
  expect(r).toBe(false);
  await ctx.close();
});

test('returns true when OS prefers reduce and config is auto', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/harness.html');
  const r = await page.evaluate(() => window.MotionKit._internals.reducedMotion.isReducedMotion('auto'));
  expect(r).toBe(true);
  await ctx.close();
});

test('returns true when config is always', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  await page.goto('/harness.html');
  const r = await page.evaluate(() => window.MotionKit._internals.reducedMotion.isReducedMotion('always'));
  expect(r).toBe(true);
  await ctx.close();
});

test('returns false when config is never even if OS prefers reduce', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/harness.html');
  const r = await page.evaluate(() => window.MotionKit._internals.reducedMotion.isReducedMotion('never'));
  expect(r).toBe(false);
  await ctx.close();
});
```

- [ ] **Step 2: Run — expect fail**

```bash
npm test -- core-reduced-motion
```
Expected: 4 failed.

- [ ] **Step 3: Implement**

Write to `/Users/adrienolinger/Claude/motion-kit/src/core/reduced-motion.js`:
```js
export function isReducedMotion(mode = 'auto') {
  if (mode === 'always') return true;
  if (mode === 'never') return false;
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

- [ ] **Step 4: Wire into index.js**

Replace `/Users/adrienolinger/Claude/motion-kit/src/index.js`:
```js
import * as tokens from './core/tokens.js';
import * as reducedMotion from './core/reduced-motion.js';

(function boot() {
  if (typeof window === 'undefined') return;
  window.MotionKit = window.MotionKit || {};
  window.MotionKit.version = '0.1.0';
  window.MotionKit._internals = { tokens, reducedMotion };
})();
```

- [ ] **Step 5: Build + test**

```bash
npm run build && npm test -- core-reduced-motion
```
Expected: 4 passed.

- [ ] **Step 6: Commit**

```bash
git add src/core/reduced-motion.js src/index.js tests/core-reduced-motion.spec.js dist/
git commit -m "feat(core): reduced-motion detection with auto/always/never modes"
```

---

### Task 7: Breakpoints module

**Files:**
- Create: `/Users/adrienolinger/Claude/motion-kit/src/core/breakpoints.js`
- Create: `/Users/adrienolinger/Claude/motion-kit/tests/core-breakpoints.spec.js`

- [ ] **Step 1: Write failing tests**

Write to `/Users/adrienolinger/Claude/motion-kit/tests/core-breakpoints.spec.js`:
```js
import { test, expect } from '@playwright/test';

test('isMobile at 375px with 768 breakpoint', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.goto('/harness.html');
  const r = await page.evaluate(() => window.MotionKit._internals.breakpoints.isMobile(768));
  expect(r).toBe(true);
  await ctx.close();
});

test('isMobile at 1280px with 768 breakpoint', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto('/harness.html');
  const r = await page.evaluate(() => window.MotionKit._internals.breakpoints.isMobile(768));
  expect(r).toBe(false);
  await ctx.close();
});

test('resolveMobileBehavior: run default on mobile', async ({ page }) => {
  await page.goto('/harness.html');
  const r = await page.evaluate(() =>
    window.MotionKit._internals.breakpoints.resolveMobileBehavior({
      mobileDefault: 'run', isMobile: true, override: null,
    }));
  expect(r).toBe(true);
});

test('resolveMobileBehavior: disable default on mobile', async ({ page }) => {
  await page.goto('/harness.html');
  const r = await page.evaluate(() =>
    window.MotionKit._internals.breakpoints.resolveMobileBehavior({
      mobileDefault: 'disable', isMobile: true, override: null,
    }));
  expect(r).toBe(false);
});

test('resolveMobileBehavior: on override beats disable default', async ({ page }) => {
  await page.goto('/harness.html');
  const r = await page.evaluate(() =>
    window.MotionKit._internals.breakpoints.resolveMobileBehavior({
      mobileDefault: 'disable', isMobile: true, override: 'on',
    }));
  expect(r).toBe(true);
});

test('resolveMobileBehavior: off override beats everything', async ({ page }) => {
  await page.goto('/harness.html');
  const r = await page.evaluate(() =>
    window.MotionKit._internals.breakpoints.resolveMobileBehavior({
      mobileDefault: 'run', isMobile: false, override: 'off',
    }));
  expect(r).toBe(false);
});
```

- [ ] **Step 2: Run — expect fail**

```bash
npm test -- core-breakpoints
```
Expected: 6 failed.

- [ ] **Step 3: Implement**

Write to `/Users/adrienolinger/Claude/motion-kit/src/core/breakpoints.js`:
```js
export function isMobile(breakpoint = 768) {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoint;
}

export function resolveMobileBehavior({ mobileDefault, isMobile, override }) {
  if (override === 'off') return false;
  if (override === 'on') return true;
  if (!isMobile) return true;
  return mobileDefault === 'run';
}

export function readMobileOverride(element) {
  if (element.classList.contains('mk-mobile-off')) return 'off';
  if (element.classList.contains('mk-mobile-on')) return 'on';
  return null;
}
```

- [ ] **Step 4: Wire into index.js**

Replace `/Users/adrienolinger/Claude/motion-kit/src/index.js`:
```js
import * as tokens from './core/tokens.js';
import * as reducedMotion from './core/reduced-motion.js';
import * as breakpoints from './core/breakpoints.js';

(function boot() {
  if (typeof window === 'undefined') return;
  window.MotionKit = window.MotionKit || {};
  window.MotionKit.version = '0.1.0';
  window.MotionKit._internals = { tokens, reducedMotion, breakpoints };
})();
```

- [ ] **Step 5: Build + test**

```bash
npm run build && npm test -- core-breakpoints
```
Expected: 6 passed.

- [ ] **Step 6: Commit**

```bash
git add src/core/breakpoints.js src/index.js tests/core-breakpoints.spec.js dist/
git commit -m "feat(core): mobile breakpoint detection + per-element override resolver"
```

---

### Task 8: Config module

**Files:**
- Create: `/Users/adrienolinger/Claude/motion-kit/src/core/config.js`
- Create: `/Users/adrienolinger/Claude/motion-kit/tests/core-config.spec.js`

- [ ] **Step 1: Write failing tests**

Write to `/Users/adrienolinger/Claude/motion-kit/tests/core-config.spec.js`:
```js
import { test, expect } from '@playwright/test';

test('loadConfig returns defaults without user config', async ({ page }) => {
  await page.goto('/harness.html');
  const cfg = await page.evaluate(() => window.MotionKit._internals.config.loadConfig());
  expect(cfg.defaults.duration).toBe(700);
  expect(cfg.breakpoints.mobile).toBe(768);
  expect(cfg.reducedMotion).toBe('auto');
  expect(cfg.debug).toBe(false);
});

test('loadConfig merges user overrides', async ({ page }) => {
  await page.goto('/harness.html');
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
  await page.goto('/harness.html');
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
```

- [ ] **Step 2: Run — expect fail**

```bash
npm test -- core-config
```
Expected: 3 failed.

- [ ] **Step 3: Implement**

Write to `/Users/adrienolinger/Claude/motion-kit/src/core/config.js`:
```js
const BASE_DEFAULTS = {
  defaults: { duration: 700, easing: 'power2.out' },
  effects: {},
  selectors: {},
  breakpoints: { mobile: 768 },
  reducedMotion: 'auto',
  debug: false,
};

function deepMerge(base, overlay) {
  if (!overlay || typeof overlay !== 'object') return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const key of Object.keys(overlay)) {
    const a = base?.[key];
    const b = overlay[key];
    if (b && typeof b === 'object' && !Array.isArray(b)) {
      out[key] = deepMerge(a && typeof a === 'object' ? a : {}, b);
    } else {
      out[key] = b;
    }
  }
  return out;
}

export function loadConfig() {
  const raw = (typeof window !== 'undefined' && window.MotionKit) || {};
  const user = {
    defaults: raw.defaults,
    effects: raw.effects,
    selectors: raw.selectors,
    breakpoints: raw.breakpoints,
    reducedMotion: raw.reducedMotion,
    debug: raw.debug,
  };
  return deepMerge(BASE_DEFAULTS, user);
}

export function getEffectOptions(effectName, config, element = null) {
  const layers = [config.defaults, config.effects?.[effectName] ?? {}];
  if (element && config.selectors) {
    for (const [sel, opts] of Object.entries(config.selectors)) {
      if (opts.effect === effectName && element.matches(sel)) {
        layers.push(opts);
      }
    }
  }
  return layers.reduce((acc, layer) => ({ ...acc, ...layer }), {});
}
```

- [ ] **Step 4: Wire into index.js**

Replace `/Users/adrienolinger/Claude/motion-kit/src/index.js`:
```js
import * as tokens from './core/tokens.js';
import * as reducedMotion from './core/reduced-motion.js';
import * as breakpoints from './core/breakpoints.js';
import * as config from './core/config.js';

(function boot() {
  if (typeof window === 'undefined') return;
  window.MotionKit = window.MotionKit || {};
  window.MotionKit.version = '0.1.0';
  window.MotionKit._internals = { tokens, reducedMotion, breakpoints, config };
})();
```

- [ ] **Step 5: Build + test**

```bash
npm run build && npm test -- core-config
```
Expected: 3 passed.

- [ ] **Step 6: Commit**

```bash
git add src/core/config.js src/index.js tests/core-config.spec.js dist/
git commit -m "feat(core): config loader with deep-merge and precedence resolver"
```

---

### Task 9: Boot module (scanner + registry + run/refresh)

**Files:**
- Create: `/Users/adrienolinger/Claude/motion-kit/src/core/boot.js`
- Create: `/Users/adrienolinger/Claude/motion-kit/tests/core-boot.spec.js`
- Modify: `/Users/adrienolinger/Claude/motion-kit/src/index.js`

- [ ] **Step 1: Write failing tests**

Write to `/Users/adrienolinger/Claude/motion-kit/tests/core-boot.spec.js`:
```js
import { test, expect } from '@playwright/test';

test('registerEffect adds handler to the registry', async ({ page }) => {
  await page.goto('/harness.html');
  const size = await page.evaluate(() => {
    const { boot } = window.MotionKit._internals;
    boot.registerEffect({ name: 'dummy', classSelectors: ['mk-dummy'], mobileDefault: 'run', init: () => {} });
    return boot.getRegistry().size;
  });
  expect(size).toBeGreaterThan(0);
});

test('scan finds elements by any registered class selector', async ({ page }) => {
  await page.goto('/harness.html');
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
  await page.goto('/harness.html');
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
  await page.goto('/harness.html');
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
  await page.goto('/harness.html');
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
  await page.goto('/harness.html');
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
```

- [ ] **Step 2: Run — expect fail**

```bash
npm test -- core-boot
```
Expected: 6 failed.

- [ ] **Step 3: Implement boot**

Write to `/Users/adrienolinger/Claude/motion-kit/src/core/boot.js`:
```js
import { loadConfig, getEffectOptions } from './config.js';
import { isReducedMotion } from './reduced-motion.js';
import { isMobile, resolveMobileBehavior, readMobileOverride } from './breakpoints.js';

const registry = new Map();
const initialized = new WeakSet();
const active = [];

export function registerEffect(descriptor) {
  if (!descriptor?.name) throw new Error('Effect must have a name');
  if (!Array.isArray(descriptor.classSelectors) || descriptor.classSelectors.length === 0) {
    throw new Error(`Effect "${descriptor.name}" must declare at least one classSelector`);
  }
  registry.set(descriptor.name, { mobileDefault: 'run', ...descriptor });
}

export function getRegistry() { return registry; }
export function getActiveEffects() { return active.slice(); }

export function scan(root = document) {
  const matches = [];
  for (const descriptor of registry.values()) {
    for (const cls of descriptor.classSelectors) {
      const nodes = root.querySelectorAll(`.${cls}`);
      for (const el of nodes) {
        if (initialized.has(el)) continue;
        matches.push({ element: el, descriptor, triggerClass: cls });
      }
    }
  }
  return matches;
}

export function run() {
  const cfg = loadConfig();
  if (isReducedMotion(cfg.reducedMotion)) {
    if (cfg.debug) console.log('[MotionKit] reduced-motion active; skipping animations.');
    for (const { element } of scan()) {
      element.classList.add('mk-ready');
      initialized.add(element);
    }
    return;
  }

  const mobile = isMobile(cfg.breakpoints.mobile);

  for (const { element, descriptor } of scan()) {
    const override = readMobileOverride(element);
    const shouldRun = resolveMobileBehavior({ mobileDefault: descriptor.mobileDefault, isMobile: mobile, override });
    if (!shouldRun) {
      if (typeof descriptor.mobileFallback === 'function') {
        try { descriptor.mobileFallback(element); }
        catch (e) { console.error(`[MotionKit] ${descriptor.name}: mobileFallback failed`, e); }
      }
      element.classList.add('mk-ready');
      initialized.add(element);
      if (cfg.debug) console.log(`[MotionKit] ${descriptor.name}: skipped (mobile guard)`, element);
      continue;
    }

    const options = getEffectOptions(descriptor.name, cfg, element);
    try {
      descriptor.init(element, options, cfg);
      element.classList.add('mk-ready');
      initialized.add(element);
      active.push({ element, effect: descriptor.name });
      if (cfg.debug) console.log(`[MotionKit] ${descriptor.name}: initialized`, element);
    } catch (err) {
      element.classList.add('mk-ready');
      console.error(`[MotionKit] ${descriptor.name}: init failed`, err, element);
    }
  }
}

export function refresh() { run(); }
```

- [ ] **Step 4: Wire boot into index.js + inject anti-FOUC CSS**

Replace `/Users/adrienolinger/Claude/motion-kit/src/index.js`:
```js
import * as tokens from './core/tokens.js';
import * as reducedMotion from './core/reduced-motion.js';
import * as breakpoints from './core/breakpoints.js';
import * as config from './core/config.js';
import * as boot from './core/boot.js';

// eslint-disable-next-line no-undef
const ANTI_FOUC_CSS = typeof __ANTI_FOUC_CSS__ !== 'undefined' ? __ANTI_FOUC_CSS__ : '';

function injectAntiFouc() {
  if (!ANTI_FOUC_CSS || document.getElementById('mk-anti-fouc')) return;
  const style = document.createElement('style');
  style.id = 'mk-anti-fouc';
  style.textContent = ANTI_FOUC_CSS;
  document.head.appendChild(style);
}

(function init() {
  if (typeof window === 'undefined') return;
  const existing = window.MotionKit || {};
  window.MotionKit = Object.assign(existing, {
    version: '0.1.0',
    refresh: boot.refresh,
    getRegistry: boot.getRegistry,
    getActiveEffects: boot.getActiveEffects,
    _internals: { tokens, reducedMotion, breakpoints, config, boot },
  });
  injectAntiFouc();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot.run, { once: true });
  } else {
    boot.run();
  }
})();
```

- [ ] **Step 5: Build + test**

```bash
npm run build && npm test
```
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/core/boot.js src/index.js tests/core-boot.spec.js dist/
git commit -m "feat(core): DOM scanner, effect registry, run/refresh, getActiveEffects, mobileFallback hook"
```

---

### Task 10: registerAll() helper in index.js

Prepare index.js for effect registration without duplicating the boot file later.

- [ ] **Step 1: Add registerAll() wrapper**

Replace `/Users/adrienolinger/Claude/motion-kit/src/index.js`:
```js
import * as tokens from './core/tokens.js';
import * as reducedMotion from './core/reduced-motion.js';
import * as breakpoints from './core/breakpoints.js';
import * as config from './core/config.js';
import * as boot from './core/boot.js';

// eslint-disable-next-line no-undef
const ANTI_FOUC_CSS = typeof __ANTI_FOUC_CSS__ !== 'undefined' ? __ANTI_FOUC_CSS__ : '';

function injectAntiFouc() {
  if (!ANTI_FOUC_CSS || document.getElementById('mk-anti-fouc')) return;
  const style = document.createElement('style');
  style.id = 'mk-anti-fouc';
  style.textContent = ANTI_FOUC_CSS;
  document.head.appendChild(style);
}

function registerAll() {
  // Effects register here; added in Phase 3+.
}

(function init() {
  if (typeof window === 'undefined') return;
  const existing = window.MotionKit || {};
  window.MotionKit = Object.assign(existing, {
    version: '0.1.0',
    refresh: boot.refresh,
    getRegistry: boot.getRegistry,
    getActiveEffects: boot.getActiveEffects,
    _internals: { tokens, reducedMotion, breakpoints, config, boot },
  });
  injectAntiFouc();
  registerAll();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot.run, { once: true });
  } else {
    boot.run();
  }
})();
```

- [ ] **Step 2: Build + test**

```bash
npm run build && npm test
```
Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/index.js dist/
git commit -m "refactor: extract registerAll() wrapper for upcoming effects"
```

---

## Phase 3: Simple effects (Tasks 11–13)

### Task 11: Effect — scroll reveal (fade/slide/scale)

**Files:**
- Create: `/Users/adrienolinger/Claude/motion-kit/src/effects/fade.js`
- Create: `/Users/adrienolinger/Claude/motion-kit/tests/effect-fade.spec.js`
- Modify: `/Users/adrienolinger/Claude/motion-kit/src/index.js`
- Modify: `/Users/adrienolinger/Claude/motion-kit/demo/index.html`

- [ ] **Step 1: Write failing tests**

Write to `/Users/adrienolinger/Claude/motion-kit/tests/effect-fade.spec.js`:
```js
import { test, expect } from '@playwright/test';

test('mk-fade-up hidden before init then revealed when in view', async ({ page }) => {
  await page.goto('/harness.html');
  const { before, after } = await page.evaluate(async () => {
    window.mkClear();
    window.mkBuild({ className: 'mk-fade-up', id: 'f', text: 'hi' });
    const el = document.getElementById('f');
    const b = getComputedStyle(el).opacity;
    window.MotionKit.refresh();
    window.ScrollTrigger.refresh();
    el.scrollIntoView();
    await new Promise((r) => setTimeout(r, 1200));
    return { before: b, after: getComputedStyle(el).opacity };
  });
  expect(Number(before)).toBeLessThan(0.2);
  expect(Number(after)).toBeGreaterThan(0.9);
});

test('mk-fade-up element gets mk-ready class after init', async ({ page }) => {
  await page.goto('/harness.html');
  const ok = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({ className: 'mk-fade-up', id: 'f' });
    window.MotionKit.refresh();
    return document.getElementById('f').classList.contains('mk-ready');
  });
  expect(ok).toBe(true);
});

test('reduced-motion skips animation and reveals immediately', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/harness.html');
  const op = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({ className: 'mk-fade-up', id: 'f', text: 'hi' });
    window.MotionKit.refresh();
    return getComputedStyle(document.getElementById('f')).opacity;
  });
  expect(Number(op)).toBe(1);
  await ctx.close();
});
```

- [ ] **Step 2: Run — expect fail**

```bash
npm test -- effect-fade
```
Expected: 3 failed.

- [ ] **Step 3: Implement fade**

Write to `/Users/adrienolinger/Claude/motion-kit/src/effects/fade.js`:
```js
import { DURATION, DELAY, DISTANCE, EASING } from '../core/tokens.js';

const VARIANTS = {
  'mk-fade-up':    { from: { opacity: 0, y: 'dist' },  to: { opacity: 1, y: 0 } },
  'mk-fade-down':  { from: { opacity: 0, y: '-dist' }, to: { opacity: 1, y: 0 } },
  'mk-fade-in':    { from: { opacity: 0 },             to: { opacity: 1 } },
  'mk-slide-left': { from: { opacity: 0, x: '-dist' }, to: { opacity: 1, x: 0 } },
  'mk-slide-right':{ from: { opacity: 0, x: 'dist' },  to: { opacity: 1, x: 0 } },
  'mk-scale-in':   { from: { opacity: 0, scale: 0.9 }, to: { opacity: 1, scale: 1 } },
  'mk-reveal-up':  { from: { opacity: 0, y: 'dist', clipPath: 'inset(100% 0 0 0)' }, to: { opacity: 1, y: 0, clipPath: 'inset(0 0 0 0)' } },
};

function readToken(el, prefix, table, fallback) {
  for (const key of Object.keys(table)) {
    if (el.classList.contains(`${prefix}-${key}`)) return table[key];
  }
  return fallback;
}

function pickVariant(el) {
  for (const cls of Object.keys(VARIANTS)) if (el.classList.contains(cls)) return VARIANTS[cls];
  return null;
}

function materializeCoords(spec, distance) {
  const out = { ...spec };
  if (out.y === 'dist') out.y = distance;
  if (out.y === '-dist') out.y = -distance;
  if (out.x === 'dist') out.x = distance;
  if (out.x === '-dist') out.x = -distance;
  return out;
}

export const name = 'fade';
export const classSelectors = Object.keys(VARIANTS);
export const mobileDefault = 'run';

export function init(element, options) {
  if (element.dataset.mkStaggerChild === 'true') return;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const variant = pickVariant(element);
  if (!variant) return;

  const duration = readToken(element, 'mk-duration', DURATION, options.duration ?? DURATION.base) / 1000;
  const delay = readToken(element, 'mk-delay', DELAY, 0) / 1000;
  const easing = options.easing ?? EASING.base;
  const distance = readToken(element, 'mk-distance', DISTANCE, DISTANCE.base);

  const from = materializeCoords(variant.from, distance);
  const to = materializeCoords(variant.to, distance);

  gsap.fromTo(element, from, {
    ...to,
    duration,
    delay,
    ease: easing,
    scrollTrigger: { trigger: element, start: 'top 85%', once: true },
  });
}
```

- [ ] **Step 4: Register in index.js**

In `/Users/adrienolinger/Claude/motion-kit/src/index.js`, add import and call inside `registerAll`. Full file:
```js
import * as tokens from './core/tokens.js';
import * as reducedMotion from './core/reduced-motion.js';
import * as breakpoints from './core/breakpoints.js';
import * as config from './core/config.js';
import * as boot from './core/boot.js';
import * as fade from './effects/fade.js';

// eslint-disable-next-line no-undef
const ANTI_FOUC_CSS = typeof __ANTI_FOUC_CSS__ !== 'undefined' ? __ANTI_FOUC_CSS__ : '';

function injectAntiFouc() {
  if (!ANTI_FOUC_CSS || document.getElementById('mk-anti-fouc')) return;
  const style = document.createElement('style');
  style.id = 'mk-anti-fouc';
  style.textContent = ANTI_FOUC_CSS;
  document.head.appendChild(style);
}

function registerAll() {
  boot.registerEffect(fade);
}

(function init() {
  if (typeof window === 'undefined') return;
  const existing = window.MotionKit || {};
  window.MotionKit = Object.assign(existing, {
    version: '0.1.0',
    refresh: boot.refresh,
    getRegistry: boot.getRegistry,
    getActiveEffects: boot.getActiveEffects,
    _internals: { tokens, reducedMotion, breakpoints, config, boot },
  });
  injectAntiFouc();
  registerAll();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot.run, { once: true });
  } else {
    boot.run();
  }
})();
```

- [ ] **Step 5: Add demo section**

In `/Users/adrienolinger/Claude/motion-kit/demo/index.html`, find the line `<!-- DEMO_INSERTION_POINT: effect sections are appended here as implemented -->` and insert immediately before it:
```html
<section class="section" id="demo-fade">
  <h2>Scroll Reveal</h2>
  <div class="mk-fade-up"><p>mk-fade-up</p></div>
  <div class="mk-fade-down" style="margin-top:6rem"><p>mk-fade-down</p></div>
  <div class="mk-fade-in" style="margin-top:6rem"><p>mk-fade-in</p></div>
  <div class="mk-slide-left" style="margin-top:6rem"><p>mk-slide-left</p></div>
  <div class="mk-slide-right" style="margin-top:6rem"><p>mk-slide-right</p></div>
  <div class="mk-scale-in" style="margin-top:6rem"><p>mk-scale-in</p></div>
  <div class="mk-reveal-up" style="margin-top:6rem"><p>mk-reveal-up</p></div>
  <div class="mk-fade-up mk-duration-slow mk-delay-400" style="margin-top:6rem"><p>slow + delay-400</p></div>
  <div class="mk-fade-up mk-distance-lg" style="margin-top:6rem"><p>distance-lg</p></div>
</section>
```

- [ ] **Step 6: Build + test**

```bash
npm run build && npm test
```
Expected: all pass.

- [ ] **Step 7: Visual smoke test**

Run `npm run demo`. Scroll to the "Scroll Reveal" section. Each element fades/slides in as it crosses 85% of viewport. Kill server.

- [ ] **Step 8: Commit**

```bash
git add src/effects/fade.js src/index.js tests/effect-fade.spec.js demo/index.html dist/
git commit -m "feat(effects): scroll-reveal (fade/slide/scale/reveal)"
```

---

### Task 12: Effect — marquee

**Files:**
- Create: `/Users/adrienolinger/Claude/motion-kit/src/effects/marquee.js`
- Create: `/Users/adrienolinger/Claude/motion-kit/tests/effect-marquee.spec.js`
- Modify: `/Users/adrienolinger/Claude/motion-kit/src/index.js`
- Modify: `/Users/adrienolinger/Claude/motion-kit/demo/index.html`

- [ ] **Step 1: Write failing tests**

Write to `/Users/adrienolinger/Claude/motion-kit/tests/effect-marquee.spec.js`:
```js
import { test, expect } from '@playwright/test';

test('mk-marquee duplicates children in a track for seamless loop', async ({ page }) => {
  await page.goto('/harness.html');
  const result = await page.evaluate(async () => {
    window.mkClear();
    window.mkBuild({
      className: 'mk-marquee', id: 'm',
      style: { width: '400px', overflow: 'hidden', whiteSpace: 'nowrap' },
      children: [
        { tag: 'span', text: 'A' },
        { tag: 'span', text: 'B' },
        { tag: 'span', text: 'C' },
      ],
    });
    const before = document.getElementById('m').children.length;
    window.MotionKit.refresh();
    await new Promise((r) => setTimeout(r, 100));
    const track = document.getElementById('m').firstElementChild;
    return { before, after: track.children.length };
  });
  expect(result.before).toBe(3);
  expect(result.after).toBe(6);
});

test('mk-marquee-pause-hover pauses animation on pointerenter', async ({ page }) => {
  await page.goto('/harness.html');
  const paused = await page.evaluate(async () => {
    window.mkClear();
    window.mkBuild({
      className: 'mk-marquee mk-marquee-pause-hover', id: 'm',
      style: { width: '400px', overflow: 'hidden', whiteSpace: 'nowrap' },
      children: [{ tag: 'span', text: 'A' }, { tag: 'span', text: 'B' }],
    });
    window.MotionKit.refresh();
    await new Promise((r) => setTimeout(r, 100));
    const m = document.getElementById('m');
    m.dispatchEvent(new PointerEvent('pointerenter'));
    await new Promise((r) => setTimeout(r, 50));
    const tween = window.gsap.getTweensOf(m.firstElementChild)[0];
    return tween ? tween.paused() : null;
  });
  expect(paused).toBe(true);
});
```

- [ ] **Step 2: Run — expect fail**

```bash
npm test -- effect-marquee
```
Expected: 2 failed.

- [ ] **Step 3: Implement marquee**

Write to `/Users/adrienolinger/Claude/motion-kit/src/effects/marquee.js`:
```js
const SPEED = { slow: 80, base: 40, fast: 20 }; // seconds per loop

function readSpeed(el) {
  for (const k of Object.keys(SPEED)) if (el.classList.contains(`mk-marquee-${k}`)) return SPEED[k];
  return SPEED.base;
}

export const name = 'marquee';
export const classSelectors = ['mk-marquee'];
export const mobileDefault = 'run';

export function init(element) {
  const gsap = window.gsap;
  if (!gsap) return;

  const track = document.createElement('div');
  track.className = 'mk-marquee-track';
  track.style.display = 'inline-flex';
  track.style.willChange = 'transform';
  while (element.firstChild) track.appendChild(element.firstChild);

  const originals = Array.from(track.children);
  for (const child of originals) track.appendChild(child.cloneNode(true));

  element.appendChild(track);
  if (!element.style.overflow) element.style.overflow = 'hidden';

  const speed = readSpeed(element);
  const reverse = element.classList.contains('mk-marquee-reverse');
  const pauseOnHover = element.classList.contains('mk-marquee-pause-hover');

  const distance = track.scrollWidth / 2;
  const fromX = reverse ? -distance : 0;
  const toX = reverse ? 0 : -distance;

  const tween = gsap.fromTo(track, { x: fromX }, { x: toX, duration: speed, ease: 'none', repeat: -1 });

  if (pauseOnHover) {
    element.addEventListener('pointerenter', () => tween.pause());
    element.addEventListener('pointerleave', () => tween.resume());
  }
}
```

- [ ] **Step 4: Register in index.js**

In `/Users/adrienolinger/Claude/motion-kit/src/index.js`, add `import * as marquee from './effects/marquee.js';` after the fade import, and add `boot.registerEffect(marquee);` inside `registerAll()`. Final `registerAll`:
```js
function registerAll() {
  boot.registerEffect(fade);
  boot.registerEffect(marquee);
}
```

- [ ] **Step 5: Add demo section**

In `/Users/adrienolinger/Claude/motion-kit/demo/index.html`, insert before the `DEMO_INSERTION_POINT` comment:
```html
<section class="section" id="demo-marquee">
  <h2>Marquee</h2>
  <div class="mk-marquee mk-marquee-base" style="font-size:3rem">
    <span style="padding:0 2rem">ONE</span>
    <span style="padding:0 2rem">TWO</span>
    <span style="padding:0 2rem">THREE</span>
    <span style="padding:0 2rem">FOUR</span>
  </div>
  <div class="mk-marquee mk-marquee-fast mk-marquee-reverse mk-marquee-pause-hover" style="font-size:3rem;margin-top:2rem">
    <span style="padding:0 2rem">REV</span>
    <span style="padding:0 2rem">FAST</span>
    <span style="padding:0 2rem">HOVER</span>
    <span style="padding:0 2rem">PAUSE</span>
  </div>
</section>
```

- [ ] **Step 6: Build + test**

```bash
npm run build && npm test
```
Expected: all pass.

- [ ] **Step 7: Visual smoke test**

Run `npm run demo`. Both marquees scroll; hovering the second pauses it.

- [ ] **Step 8: Commit**

```bash
git add src/effects/marquee.js src/index.js tests/effect-marquee.spec.js demo/index.html dist/
git commit -m "feat(effects): marquee with speed/reverse/pause-on-hover"
```

---

### Task 13: Effect — hover interactions (magnetic/zoom/tilt)

**Files:**
- Create: `/Users/adrienolinger/Claude/motion-kit/src/effects/hover.js`
- Create: `/Users/adrienolinger/Claude/motion-kit/tests/effect-hover.spec.js`
- Modify: `/Users/adrienolinger/Claude/motion-kit/src/index.js`
- Modify: `/Users/adrienolinger/Claude/motion-kit/demo/index.html`

- [ ] **Step 1: Write failing tests**

Write to `/Users/adrienolinger/Claude/motion-kit/tests/effect-hover.spec.js`:
```js
import { test, expect } from '@playwright/test';

test('mk-hover-zoom scales on pointerenter', async ({ page }) => {
  await page.goto('/harness.html');
  const transform = await page.evaluate(async () => {
    window.mkClear();
    window.mkBuild({ className: 'mk-hover-zoom', id: 'h', style: { width: '100px', height: '100px', background: '#333' } });
    window.MotionKit.refresh();
    const el = document.getElementById('h');
    el.dispatchEvent(new PointerEvent('pointerenter'));
    await new Promise((r) => setTimeout(r, 400));
    return getComputedStyle(el).transform;
  });
  expect(transform).not.toBe('none');
});

test('hover effects are disabled on mobile viewport', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.goto('/harness.html');
  const active = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({ className: 'mk-hover-zoom', id: 'h' });
    window.MotionKit.refresh();
    return window.MotionKit.getActiveEffects().some(({ effect }) => effect === 'hover');
  });
  expect(active).toBe(false);
  await ctx.close();
});
```

- [ ] **Step 2: Run — expect fail**

```bash
npm test -- effect-hover
```
Expected: 2 failed.

- [ ] **Step 3: Implement hover**

Write to `/Users/adrienolinger/Claude/motion-kit/src/effects/hover.js`:
```js
const STRENGTH = { low: 0.15, base: 0.3, high: 0.5 };

function readStrength(el) {
  for (const k of Object.keys(STRENGTH)) if (el.classList.contains(`mk-hover-strength-${k}`)) return STRENGTH[k];
  return STRENGTH.base;
}

function pickMode(el) {
  if (el.classList.contains('mk-hover-magnetic')) return 'magnetic';
  if (el.classList.contains('mk-hover-zoom')) return 'zoom';
  if (el.classList.contains('mk-hover-tilt')) return 'tilt';
  return null;
}

export const name = 'hover';
export const classSelectors = ['mk-hover-magnetic', 'mk-hover-zoom', 'mk-hover-tilt'];
export const mobileDefault = 'disable';

export function init(element) {
  const gsap = window.gsap;
  if (!gsap) return;
  const mode = pickMode(element);
  const strength = readStrength(element);
  if (mode === 'magnetic') return wireMagnetic(gsap, element, strength);
  if (mode === 'zoom') return wireZoom(gsap, element, strength);
  if (mode === 'tilt') return wireTilt(gsap, element, strength);
}

function wireMagnetic(gsap, el, strength) {
  let raf = null;
  el.addEventListener('pointermove', (e) => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * strength;
      const dy = (e.clientY - (r.top + r.height / 2)) * strength;
      gsap.to(el, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
    });
  });
  el.addEventListener('pointerleave', () => {
    if (raf) cancelAnimationFrame(raf);
    gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
  });
}

function wireZoom(gsap, el, strength) {
  const target = 1 + strength;
  el.addEventListener('pointerenter', () => gsap.to(el, { scale: target, duration: 0.3 }));
  el.addEventListener('pointerleave', () => gsap.to(el, { scale: 1, duration: 0.3 }));
}

function wireTilt(gsap, el, strength) {
  const maxDeg = strength * 30;
  let raf = null;
  el.addEventListener('pointermove', (e) => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const relX = (e.clientX - r.left) / r.width - 0.5;
      const relY = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(el, {
        rotationX: -relY * maxDeg,
        rotationY: relX * maxDeg,
        transformPerspective: 800,
        duration: 0.3,
        ease: 'power2.out',
      });
    });
  });
  el.addEventListener('pointerleave', () => {
    if (raf) cancelAnimationFrame(raf);
    gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.5 });
  });
}
```

- [ ] **Step 4: Register in index.js**

Add `import * as hover from './effects/hover.js';` and append `boot.registerEffect(hover);` in `registerAll()`:
```js
function registerAll() {
  boot.registerEffect(fade);
  boot.registerEffect(marquee);
  boot.registerEffect(hover);
}
```

- [ ] **Step 5: Add demo section**

Insert into `demo/index.html` before `DEMO_INSERTION_POINT`:
```html
<section class="section" id="demo-hover">
  <h2>Hover</h2>
  <button class="mk-hover-magnetic" style="padding:1rem 2rem;background:#fff;color:#111;border:0;font-size:1rem">Magnetic</button>
  <div class="mk-hover-zoom" style="width:220px;height:140px;background:#555;margin-top:3rem"></div>
  <div class="mk-hover-tilt" style="width:220px;height:140px;background:#777;margin-top:3rem"></div>
</section>
```

- [ ] **Step 6: Build + test**

```bash
npm run build && npm test
```
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/effects/hover.js src/index.js tests/effect-hover.spec.js demo/index.html dist/
git commit -m "feat(effects): hover interactions (magnetic/zoom/tilt), mobile-disabled"
```

---

## Phase 4: Scroll-driven effects (Tasks 14–17)

### Task 14: Effect — parallax

**Files:**
- Create: `/Users/adrienolinger/Claude/motion-kit/src/effects/parallax.js`
- Create: `/Users/adrienolinger/Claude/motion-kit/tests/effect-parallax.spec.js`
- Modify: `/Users/adrienolinger/Claude/motion-kit/src/index.js`
- Modify: `/Users/adrienolinger/Claude/motion-kit/demo/index.html`

- [ ] **Step 1: Write failing tests**

Write to `/Users/adrienolinger/Claude/motion-kit/tests/effect-parallax.spec.js`:
```js
import { test, expect } from '@playwright/test';

test('mk-parallax registers on desktop', async ({ page }) => {
  await page.goto('/harness.html');
  const a = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({ className: 'mk-parallax', id: 'p' });
    window.MotionKit.refresh();
    return window.MotionKit.getActiveEffects().some(({ effect }) => effect === 'parallax');
  });
  expect(a).toBe(true);
});

test('mk-parallax disabled on mobile', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.goto('/harness.html');
  const a = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({ className: 'mk-parallax', id: 'p' });
    window.MotionKit.refresh();
    return window.MotionKit.getActiveEffects().some(({ effect }) => effect === 'parallax');
  });
  expect(a).toBe(false);
  await ctx.close();
});

test('mk-mobile-on forces parallax on mobile', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.goto('/harness.html');
  const a = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({ className: 'mk-parallax mk-mobile-on', id: 'p' });
    window.MotionKit.refresh();
    return window.MotionKit.getActiveEffects().some(({ effect }) => effect === 'parallax');
  });
  expect(a).toBe(true);
  await ctx.close();
});
```

- [ ] **Step 2: Run — expect fail**

```bash
npm test -- effect-parallax
```
Expected: 3 failed.

- [ ] **Step 3: Implement parallax**

Write to `/Users/adrienolinger/Claude/motion-kit/src/effects/parallax.js`:
```js
const INTENSITY = { slow: 15, med: 30, fast: 50 };

function readIntensity(el) {
  for (const k of Object.keys(INTENSITY)) if (el.classList.contains(`mk-parallax-${k}`)) return INTENSITY[k];
  return INTENSITY.med;
}

export const name = 'parallax';
export const classSelectors = ['mk-parallax'];
export const mobileDefault = 'disable';

export function init(element) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const i = readIntensity(element);
  gsap.fromTo(element,
    { yPercent: i },
    {
      yPercent: -i,
      ease: 'none',
      scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: true },
    });
}
```

- [ ] **Step 4: Register in index.js**

Add `import * as parallax from './effects/parallax.js';` and `boot.registerEffect(parallax);` in `registerAll()`:
```js
function registerAll() {
  boot.registerEffect(fade);
  boot.registerEffect(marquee);
  boot.registerEffect(hover);
  boot.registerEffect(parallax);
}
```

- [ ] **Step 5: Add demo section**

Insert into `demo/index.html` before `DEMO_INSERTION_POINT`:
```html
<section class="section" id="demo-parallax" style="position:relative;overflow:hidden;min-height:120vh">
  <h2>Parallax</h2>
  <div class="mk-parallax mk-parallax-med" style="position:absolute;inset:0;background:linear-gradient(#333,#111);z-index:-1"></div>
  <p style="margin-top:40vh">Scroll — background moves at a different rate.</p>
</section>
```

- [ ] **Step 6: Build + test**

```bash
npm run build && npm test
```
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/effects/parallax.js src/index.js tests/effect-parallax.spec.js demo/index.html dist/
git commit -m "feat(effects): parallax with slow/med/fast intensity, mobile-disabled"
```

---

### Task 15: Effect — Ken Burns

**Files:**
- Create: `/Users/adrienolinger/Claude/motion-kit/src/effects/ken-burns.js`
- Create: `/Users/adrienolinger/Claude/motion-kit/tests/effect-ken-burns.spec.js`
- Modify: `/Users/adrienolinger/Claude/motion-kit/src/index.js`
- Modify: `/Users/adrienolinger/Claude/motion-kit/demo/index.html`

- [ ] **Step 1: Write failing tests**

Write to `/Users/adrienolinger/Claude/motion-kit/tests/effect-ken-burns.spec.js`:
```js
import { test, expect } from '@playwright/test';

test('mk-ken-burns auto-adds overflow:hidden to parent', async ({ page }) => {
  await page.goto('/harness.html');
  const overflow = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({
      id: 'wrap',
      style: { width: '200px', height: '150px' },
      children: [{ tag: 'img', className: 'mk-ken-burns', id: 'k', attrs: { src: 'https://via.placeholder.com/400' } }],
    });
    window.MotionKit.refresh();
    return getComputedStyle(document.getElementById('wrap')).overflow;
  });
  expect(overflow).toBe('hidden');
});

test('mk-ken-burns disabled on mobile', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.goto('/harness.html');
  const a = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({ tag: 'img', className: 'mk-ken-burns', id: 'k', attrs: { src: 'https://via.placeholder.com/400' } });
    window.MotionKit.refresh();
    return window.MotionKit.getActiveEffects().some(({ effect }) => effect === 'kenBurns');
  });
  expect(a).toBe(false);
  await ctx.close();
});
```

- [ ] **Step 2: Run — expect fail**

```bash
npm test -- effect-ken-burns
```
Expected: 2 failed.

- [ ] **Step 3: Implement**

Write to `/Users/adrienolinger/Claude/motion-kit/src/effects/ken-burns.js`:
```js
const INTENSITY = { low: 0.05, base: 0.1, high: 0.2 };

function readIntensity(el) {
  for (const k of Object.keys(INTENSITY)) if (el.classList.contains(`mk-ken-burns-intensity-${k}`)) return INTENSITY[k];
  return INTENSITY.base;
}

function readMode(el) {
  if (el.classList.contains('mk-ken-burns-zoom')) return 'zoom';
  if (el.classList.contains('mk-ken-burns-pan')) return 'pan';
  return 'both';
}

export const name = 'kenBurns';
export const classSelectors = ['mk-ken-burns'];
export const mobileDefault = 'disable';

export function init(element) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const parent = element.parentElement;
  if (parent && getComputedStyle(parent).overflow !== 'hidden') parent.style.overflow = 'hidden';

  const intensity = readIntensity(element);
  const mode = readMode(element);
  const from = {}, to = {};
  if (mode === 'zoom' || mode === 'both') { from.scale = 1; to.scale = 1 + intensity; }
  if (mode === 'pan' || mode === 'both') { from.xPercent = -intensity * 30; to.xPercent = intensity * 30; }

  gsap.fromTo(element, from, {
    ...to,
    ease: 'none',
    scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: true },
  });
}
```

- [ ] **Step 4: Register in index.js**

Add `import * as kenBurns from './effects/ken-burns.js';` and `boot.registerEffect(kenBurns);`:
```js
function registerAll() {
  boot.registerEffect(fade);
  boot.registerEffect(marquee);
  boot.registerEffect(hover);
  boot.registerEffect(parallax);
  boot.registerEffect(kenBurns);
}
```

- [ ] **Step 5: Add demo section**

Insert into `demo/index.html`:
```html
<section class="section" id="demo-ken-burns">
  <h2>Ken Burns</h2>
  <div style="width:600px;height:400px;max-width:100%">
    <img class="mk-ken-burns mk-ken-burns-intensity-high" src="https://picsum.photos/800/600" style="width:100%;height:100%;object-fit:cover" />
  </div>
</section>
```

- [ ] **Step 6: Build + test + commit**

```bash
npm run build && npm test
git add src/effects/ken-burns.js src/index.js tests/effect-ken-burns.spec.js demo/index.html dist/
git commit -m "feat(effects): Ken Burns zoom/pan on scroll, mobile-disabled"
```

---

### Task 16: Effect — sticky pin

**Files:**
- Create: `/Users/adrienolinger/Claude/motion-kit/src/effects/pin.js`
- Create: `/Users/adrienolinger/Claude/motion-kit/tests/effect-pin.spec.js`
- Modify: `/Users/adrienolinger/Claude/motion-kit/src/index.js`
- Modify: `/Users/adrienolinger/Claude/motion-kit/demo/index.html`

- [ ] **Step 1: Write failing tests**

Write to `/Users/adrienolinger/Claude/motion-kit/tests/effect-pin.spec.js`:
```js
import { test, expect } from '@playwright/test';

test('mk-pin registers on desktop', async ({ page }) => {
  await page.goto('/harness.html');
  const a = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({ tag: 'section', className: 'mk-pin', id: 'p', style: { height: '500px' } });
    window.MotionKit.refresh();
    return window.MotionKit.getActiveEffects().some(({ effect }) => effect === 'pin');
  });
  expect(a).toBe(true);
});

test('mk-pin disabled on mobile', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.goto('/harness.html');
  const a = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({ tag: 'section', className: 'mk-pin', id: 'p', style: { height: '500px' } });
    window.MotionKit.refresh();
    return window.MotionKit.getActiveEffects().some(({ effect }) => effect === 'pin');
  });
  expect(a).toBe(false);
  await ctx.close();
});
```

- [ ] **Step 2: Run — expect fail**

```bash
npm test -- effect-pin
```
Expected: 2 failed.

- [ ] **Step 3: Implement**

Write to `/Users/adrienolinger/Claude/motion-kit/src/effects/pin.js`:
```js
const VH = { 1: 1, 2: 2, 3: 3, 4: 4 };

function readDuration(el) {
  for (const k of Object.keys(VH)) if (el.classList.contains(`mk-pin-duration-${k}`)) return VH[k];
  return 1;
}

export const name = 'pin';
export const classSelectors = ['mk-pin'];
export const mobileDefault = 'disable';

export function init(element) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const vh = readDuration(element);
  ScrollTrigger.create({
    trigger: element,
    start: 'top top',
    end: `+=${vh * 100}%`,
    pin: true,
    pinSpacing: true,
  });
}
```

- [ ] **Step 4: Register in index.js**

Add `import * as pin from './effects/pin.js';` and `boot.registerEffect(pin);`:
```js
function registerAll() {
  boot.registerEffect(fade);
  boot.registerEffect(marquee);
  boot.registerEffect(hover);
  boot.registerEffect(parallax);
  boot.registerEffect(kenBurns);
  boot.registerEffect(pin);
}
```

- [ ] **Step 5: Add demo section**

Insert into `demo/index.html`:
```html
<section class="mk-pin mk-pin-duration-2 section" style="background:#222;height:100vh;display:grid;place-items:center">
  <h2>Pinned section — 2 viewport-heights</h2>
</section>
```

- [ ] **Step 6: Build + test + commit**

```bash
npm run build && npm test
git add src/effects/pin.js src/index.js tests/effect-pin.spec.js demo/index.html dist/
git commit -m "feat(effects): sticky pin (mk-pin), mobile-disabled"
```

---

### Task 17: Effect — staggered grid reveal

**Files:**
- Create: `/Users/adrienolinger/Claude/motion-kit/src/effects/stagger.js`
- Create: `/Users/adrienolinger/Claude/motion-kit/tests/effect-stagger.spec.js`
- Modify: `/Users/adrienolinger/Claude/motion-kit/src/index.js`
- Modify: `/Users/adrienolinger/Claude/motion-kit/demo/index.html`

Note: stagger must register **before** fade so it claims children first and marks `dataset.mkStaggerChild` before fade sees them.

- [ ] **Step 1: Write failing tests**

Write to `/Users/adrienolinger/Claude/motion-kit/tests/effect-stagger.spec.js`:
```js
import { test, expect } from '@playwright/test';

test('mk-stagger children become visible after reveal', async ({ page }) => {
  await page.goto('/harness.html');
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
  await page.goto('/harness.html');
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
```

- [ ] **Step 2: Run — expect fail**

```bash
npm test -- effect-stagger
```
Expected: 2 failed.

- [ ] **Step 3: Implement**

Write to `/Users/adrienolinger/Claude/motion-kit/src/effects/stagger.js`:
```js
const SPEED = { fast: 0.05, base: 0.1, slow: 0.2 };

function readSpeed(el) {
  for (const k of Object.keys(SPEED)) if (el.classList.contains(`mk-stagger-speed-${k}`)) return SPEED[k];
  return SPEED.base;
}

function pickPattern(el) {
  if (el.classList.contains('mk-stagger-wave')) return 'wave';
  if (el.classList.contains('mk-stagger-diagonal')) return 'diagonal';
  if (el.classList.contains('mk-stagger-random')) return 'random';
  return 'linear';
}

function computeOrder(children, pattern) {
  const idx = children.map((_, i) => i);
  if (pattern === 'random') return idx.sort(() => Math.random() - 0.5);
  if (pattern === 'wave') {
    const mid = Math.floor(children.length / 2);
    const out = [];
    for (let i = 0; i < children.length; i++) {
      const offset = Math.ceil(i / 2) * (i % 2 === 0 ? -1 : 1);
      const v = mid + offset;
      if (v >= 0 && v < children.length) out.push(v);
    }
    return out;
  }
  return idx;
}

export const name = 'stagger';
export const classSelectors = ['mk-stagger'];
export const mobileDefault = 'run';

export function init(element) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const children = Array.from(element.children);
  if (!children.length) return;
  for (const c of children) c.dataset.mkStaggerChild = 'true';

  const speed = readSpeed(element);
  const pattern = pickPattern(element);
  const order = computeOrder(children, pattern);

  gsap.fromTo(
    order.map((i) => children[i]),
    { opacity: 0, y: 40 },
    {
      opacity: 1, y: 0, duration: 0.6, stagger: speed, ease: 'power2.out',
      scrollTrigger: { trigger: element, start: 'top 80%', once: true },
      onComplete: () => { for (const c of children) c.classList.add('mk-ready'); },
    },
  );
}
```

- [ ] **Step 4: Register in index.js (stagger BEFORE fade)**

Replace `registerAll()`:
```js
function registerAll() {
  boot.registerEffect(stagger); // must run before fade so children are tagged
  boot.registerEffect(fade);
  boot.registerEffect(marquee);
  boot.registerEffect(hover);
  boot.registerEffect(parallax);
  boot.registerEffect(kenBurns);
  boot.registerEffect(pin);
}
```

Also add import: `import * as stagger from './effects/stagger.js';`.

- [ ] **Step 5: Add demo section**

Insert into `demo/index.html`:
```html
<section class="section" id="demo-stagger">
  <h2>Staggered Grid</h2>
  <div class="mk-stagger mk-stagger-wave" style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;max-width:600px">
    <div class="mk-fade-up" style="height:80px;background:#444"></div>
    <div class="mk-fade-up" style="height:80px;background:#555"></div>
    <div class="mk-fade-up" style="height:80px;background:#666"></div>
    <div class="mk-fade-up" style="height:80px;background:#777"></div>
    <div class="mk-fade-up" style="height:80px;background:#888"></div>
    <div class="mk-fade-up" style="height:80px;background:#999"></div>
    <div class="mk-fade-up" style="height:80px;background:#aaa"></div>
    <div class="mk-fade-up" style="height:80px;background:#bbb"></div>
  </div>
</section>
```

- [ ] **Step 6: Build + test + commit**

```bash
npm run build && npm test
git add src/effects/stagger.js src/index.js tests/effect-stagger.spec.js demo/index.html dist/
git commit -m "feat(effects): staggered grid reveal with wave/diagonal/random patterns"
```

---

## Phase 5: Complex effects (Tasks 18–20)

### Task 18: Effect — text animations (uses SplitText)

**Files:**
- Create: `/Users/adrienolinger/Claude/motion-kit/src/effects/text.js`
- Create: `/Users/adrienolinger/Claude/motion-kit/tests/effect-text.spec.js`
- Modify: `/Users/adrienolinger/Claude/motion-kit/src/index.js`
- Modify: `/Users/adrienolinger/Claude/motion-kit/demo/index.html`

(Harness already includes SplitText from Task 3.)

- [ ] **Step 1: Write failing tests**

Write to `/Users/adrienolinger/Claude/motion-kit/tests/effect-text.spec.js`:
```js
import { test, expect } from '@playwright/test';

test('mk-text-reveal splits text into characters', async ({ page }) => {
  await page.goto('/harness.html');
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
  await page.goto('/harness.html');
  const count = await page.evaluate(async () => {
    window.mkClear();
    window.mkBuild({ tag: 'h1', className: 'mk-text-split', id: 't', text: 'Hello world now' });
    window.MotionKit.refresh();
    await new Promise((r) => setTimeout(r, 200));
    return document.getElementById('t').querySelectorAll('.mk-word').length;
  });
  expect(count).toBe(3);
});
```

- [ ] **Step 2: Run — expect fail**

```bash
npm test -- effect-text
```
Expected: 2 failed.

- [ ] **Step 3: Implement**

Write to `/Users/adrienolinger/Claude/motion-kit/src/effects/text.js`:
```js
function pickMode(el) {
  if (el.classList.contains('mk-text-reveal')) return 'reveal';
  if (el.classList.contains('mk-text-split')) return 'split';
  if (el.classList.contains('mk-text-typewriter')) return 'typewriter';
  return null;
}

export const name = 'text';
export const classSelectors = ['mk-text-reveal', 'mk-text-split', 'mk-text-typewriter'];
export const mobileDefault = 'run';

export function init(element) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const SplitText = window.SplitText;
  if (!gsap || !ScrollTrigger || !SplitText) {
    console.warn('[MotionKit:text] GSAP/ScrollTrigger/SplitText missing; skipping.');
    return;
  }
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const mode = pickMode(element);
  if (mode === 'reveal') return wireReveal(gsap, SplitText, element);
  if (mode === 'split') return wireSplit(gsap, SplitText, element);
  if (mode === 'typewriter') return wireTypewriter(gsap, ScrollTrigger, element);
}

function wireReveal(gsap, SplitText, el) {
  const split = new SplitText(el, { type: 'chars', charsClass: 'mk-char' });
  gsap.fromTo(split.chars, { opacity: 0, yPercent: 100 }, {
    opacity: 1, yPercent: 0, duration: 0.6, stagger: 0.02, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 80%', once: true },
  });
}

function wireSplit(gsap, SplitText, el) {
  const split = new SplitText(el, { type: 'words', wordsClass: 'mk-word' });
  gsap.fromTo(split.words, { opacity: 0, y: 20 }, {
    opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out',
    scrollTrigger: { trigger: el, start: 'top 80%', once: true },
  });
}

function wireTypewriter(gsap, ScrollTrigger, el) {
  const full = el.textContent;
  el.textContent = '';
  ScrollTrigger.create({
    trigger: el, start: 'top 80%', once: true,
    onEnter: () => {
      let i = 0;
      const tick = () => {
        if (i > full.length) return;
        el.textContent = full.slice(0, i);
        i += 1;
        gsap.delayedCall(0.04, tick);
      };
      tick();
    },
  });
}
```

- [ ] **Step 4: Register in index.js**

Add `import * as text from './effects/text.js';` and `boot.registerEffect(text);` after `fade` in `registerAll`:
```js
function registerAll() {
  boot.registerEffect(stagger);
  boot.registerEffect(fade);
  boot.registerEffect(text);
  boot.registerEffect(marquee);
  boot.registerEffect(hover);
  boot.registerEffect(parallax);
  boot.registerEffect(kenBurns);
  boot.registerEffect(pin);
}
```

- [ ] **Step 5: Add demo section**

Insert into `demo/index.html`:
```html
<section class="section" id="demo-text">
  <h2>Text Animations</h2>
  <h3 class="mk-text-reveal">Reveal by character</h3>
  <h3 class="mk-text-split" style="margin-top:4rem">Split by word for smoother fades</h3>
  <p class="mk-text-typewriter" style="margin-top:4rem;font-family:monospace">Typewriter effect — types character by character.</p>
</section>
```

- [ ] **Step 6: Build + test + commit**

```bash
npm run build && npm test
git add src/effects/text.js src/index.js tests/effect-text.spec.js demo/index.html dist/
git commit -m "feat(effects): text animations (reveal/split/typewriter) via SplitText"
```

---

### Task 19: Effect — horizontal scroll pin (with mobile fallback)

**Files:**
- Create: `/Users/adrienolinger/Claude/motion-kit/src/effects/hscroll.js`
- Create: `/Users/adrienolinger/Claude/motion-kit/tests/effect-hscroll.spec.js`
- Modify: `/Users/adrienolinger/Claude/motion-kit/src/index.js`
- Modify: `/Users/adrienolinger/Claude/motion-kit/demo/index.html`

- [ ] **Step 1: Write failing tests**

Write to `/Users/adrienolinger/Claude/motion-kit/tests/effect-hscroll.spec.js`:
```js
import { test, expect } from '@playwright/test';

test('mk-hscroll registers on desktop', async ({ page }) => {
  await page.goto('/harness.html');
  const a = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({
      tag: 'section', className: 'mk-hscroll', id: 'h',
      style: { height: '100vh', overflow: 'hidden' },
      children: [{ style: { width: '300vw', display: 'flex' }, children: [
        { style: { width: '100vw' } }, { style: { width: '100vw' } }, { style: { width: '100vw' } },
      ] }],
    });
    window.MotionKit.refresh();
    return window.MotionKit.getActiveEffects().some(({ effect }) => effect === 'hscroll');
  });
  expect(a).toBe(true);
});

test('mk-hscroll disabled on mobile → native overflow fallback', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.goto('/harness.html');
  const r = await page.evaluate(() => {
    window.mkClear();
    window.mkBuild({
      tag: 'section', className: 'mk-hscroll', id: 'h',
      style: { height: '100vh' },
      children: [{ style: { width: '300vw', display: 'flex' } }],
    });
    window.MotionKit.refresh();
    const h = document.getElementById('h');
    return {
      active: window.MotionKit.getActiveEffects().some(({ effect }) => effect === 'hscroll'),
      overflowX: getComputedStyle(h).overflowX,
    };
  });
  expect(r.active).toBe(false);
  expect(r.overflowX).toBe('auto');
  await ctx.close();
});
```

- [ ] **Step 2: Run — expect fail**

```bash
npm test -- effect-hscroll
```
Expected: 2 failed.

- [ ] **Step 3: Implement**

Write to `/Users/adrienolinger/Claude/motion-kit/src/effects/hscroll.js`:
```js
export const name = 'hscroll';
export const classSelectors = ['mk-hscroll'];
export const mobileDefault = 'disable';

export function mobileFallback(element) {
  element.style.overflowX = 'auto';
  element.style.overflowY = 'hidden';
  element.style.scrollSnapType = 'x mandatory';
  const track = element.firstElementChild;
  if (track) {
    for (const child of track.children) child.style.scrollSnapAlign = 'start';
  }
}

export function init(element) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const track = element.firstElementChild;
  if (!track) return;

  const distance = track.scrollWidth - window.innerWidth;
  if (distance <= 0) return;

  gsap.to(track, {
    x: -distance,
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: 'top top',
      end: () => `+=${distance}`,
      pin: true,
      scrub: 0.5,
      invalidateOnRefresh: true,
    },
  });
}
```

- [ ] **Step 4: Register in index.js**

Add `import * as hscroll from './effects/hscroll.js';` and `boot.registerEffect(hscroll);`:
```js
function registerAll() {
  boot.registerEffect(stagger);
  boot.registerEffect(fade);
  boot.registerEffect(text);
  boot.registerEffect(marquee);
  boot.registerEffect(hover);
  boot.registerEffect(parallax);
  boot.registerEffect(kenBurns);
  boot.registerEffect(pin);
  boot.registerEffect(hscroll);
}
```

- [ ] **Step 5: Add demo section**

Insert into `demo/index.html`:
```html
<section class="mk-hscroll" style="height:100vh;overflow:hidden">
  <div style="width:400vw;display:flex;height:100%">
    <div style="width:100vw;background:#222;display:grid;place-items:center"><h2>Panel 1</h2></div>
    <div style="width:100vw;background:#333;display:grid;place-items:center"><h2>Panel 2</h2></div>
    <div style="width:100vw;background:#444;display:grid;place-items:center"><h2>Panel 3</h2></div>
    <div style="width:100vw;background:#555;display:grid;place-items:center"><h2>Panel 4</h2></div>
  </div>
</section>
```

- [ ] **Step 6: Build + test + commit**

```bash
npm run build && npm test
git add src/effects/hscroll.js src/index.js tests/effect-hscroll.spec.js demo/index.html dist/
git commit -m "feat(effects): horizontal scroll pin with native mobile fallback"
```

---

### Task 20: Effect — fixed background crossfade

**Files:**
- Create: `/Users/adrienolinger/Claude/motion-kit/src/effects/bg-crossfade.js`
- Create: `/Users/adrienolinger/Claude/motion-kit/tests/effect-bg-crossfade.spec.js`
- Modify: `/Users/adrienolinger/Claude/motion-kit/src/index.js`
- Modify: `/Users/adrienolinger/Claude/motion-kit/demo/index.html`

- [ ] **Step 1: Write failing tests**

Write to `/Users/adrienolinger/Claude/motion-kit/tests/effect-bg-crossfade.spec.js`:
```js
import { test, expect } from '@playwright/test';

test('mk-bg-crossfade creates fixed background layers', async ({ page }) => {
  await page.goto('/harness.html');
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
  await page.goto('/harness.html');
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
```

- [ ] **Step 2: Run — expect fail**

```bash
npm test -- effect-bg-crossfade
```
Expected: 2 failed.

- [ ] **Step 3: Implement**

Write to `/Users/adrienolinger/Claude/motion-kit/src/effects/bg-crossfade.js`:
```js
export const name = 'bgCrossfade';
export const classSelectors = ['mk-bg-crossfade'];
export const mobileDefault = 'disable';

export function mobileFallback(element) {
  const first = element.querySelector('.mk-bg-image');
  if (!first) return;
  const src = first.dataset.mkBg;
  if (!src) return;
  element.style.backgroundImage = `url("${src}")`;
  element.style.backgroundSize = 'cover';
  element.style.backgroundPosition = 'center';
}

export function init(element) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const sources = Array.from(element.querySelectorAll('.mk-bg-image'));
  if (!sources.length) return;

  if (getComputedStyle(element).position === 'static') element.style.position = 'relative';

  const layers = sources.map((src, i) => {
    const layer = document.createElement('div');
    layer.className = 'mk-bg-layer';
    layer.style.position = 'fixed';
    layer.style.inset = '0';
    layer.style.backgroundImage = `url("${src.dataset.mkBg}")`;
    layer.style.backgroundSize = 'cover';
    layer.style.backgroundPosition = 'center';
    layer.style.opacity = i === 0 ? '1' : '0';
    layer.style.zIndex = '-1';
    layer.style.pointerEvents = 'none';
    element.insertBefore(layer, element.firstChild);
    src.style.display = 'none';
    return layer;
  });

  const total = layers.length;
  ScrollTrigger.create({
    trigger: element,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      const progress = self.progress * (total - 1);
      const activeIdx = Math.floor(progress);
      const frac = progress - activeIdx;
      layers.forEach((layer, i) => {
        if (i === activeIdx) layer.style.opacity = String(1 - frac);
        else if (i === activeIdx + 1) layer.style.opacity = String(frac);
        else layer.style.opacity = '0';
      });
    },
  });
}
```

- [ ] **Step 4: Register in index.js**

Add `import * as bgCrossfade from './effects/bg-crossfade.js';` and `boot.registerEffect(bgCrossfade);`:
```js
function registerAll() {
  boot.registerEffect(stagger);
  boot.registerEffect(fade);
  boot.registerEffect(text);
  boot.registerEffect(marquee);
  boot.registerEffect(hover);
  boot.registerEffect(parallax);
  boot.registerEffect(kenBurns);
  boot.registerEffect(pin);
  boot.registerEffect(hscroll);
  boot.registerEffect(bgCrossfade);
}
```

- [ ] **Step 5: Add demo section**

Insert into `demo/index.html`:
```html
<section class="mk-bg-crossfade" style="position:relative;min-height:200vh">
  <div class="mk-bg-image" data-mk-bg="https://picsum.photos/id/1018/1600/900"></div>
  <div class="mk-bg-image" data-mk-bg="https://picsum.photos/id/1025/1600/900"></div>
  <div class="mk-bg-image" data-mk-bg="https://picsum.photos/id/1043/1600/900"></div>
  <div style="padding:30vh 2rem;color:#fff">
    <h2>Fixed Background Crossfade</h2>
    <p style="max-width:40ch">Scroll — the fixed background crossfades between images.</p>
  </div>
</section>
```

- [ ] **Step 6: Build + test + commit**

```bash
npm run build && npm test
git add src/effects/bg-crossfade.js src/index.js tests/effect-bg-crossfade.spec.js demo/index.html dist/
git commit -m "feat(effects): fixed background crossfade with mobile fallback"
```

---

## Phase 6: Documentation and release (Tasks 21–23)

### Task 21: Per-effect documentation

**Files:** create one markdown file per effect in `/Users/adrienolinger/Claude/motion-kit/docs/effects/`.

- [ ] **Step 1: Create `fade.md`**

Write to `/Users/adrienolinger/Claude/motion-kit/docs/effects/fade.md`:
```markdown
# Scroll Reveal (fade/slide/scale)

Fades, slides, or scales elements into view as they enter the viewport (top 85%).

## Classes
- `mk-fade-up` — fade in + translate up from below
- `mk-fade-down` — fade in + translate down from above
- `mk-fade-in` — opacity only, no translate
- `mk-slide-left` — fade in + slide from the right
- `mk-slide-right` — fade in + slide from the left
- `mk-scale-in` — fade in + scale from 0.9 → 1
- `mk-reveal-up` — fade + translate + clip-path mask

## Modifiers
- `mk-duration-fast` / `mk-duration-base` / `mk-duration-slow` — 300 / 700 / 1200 ms
- `mk-delay-100` … `mk-delay-800` — delay in 100ms steps
- `mk-distance-sm` / `mk-distance-base` / `mk-distance-lg` — 20 / 60 / 120 px
- `mk-mobile-on` / `mk-mobile-off` — override mobile behavior

## Mobile
Runs by default.

## Example (Squarespace 7.1)
In block settings → "Add class name": `mk-fade-up mk-duration-slow mk-delay-200`
```

- [ ] **Step 2: Create `parallax.md`**

Write to `/Users/adrienolinger/Claude/motion-kit/docs/effects/parallax.md`:
```markdown
# Parallax

Moves an element at a different rate than the page scroll.

## Classes
- `mk-parallax` — base class

## Modifiers
- `mk-parallax-slow` (15%), `mk-parallax-med` (30%, default), `mk-parallax-fast` (50%)
- `mk-mobile-on` to force on mobile

## Mobile
Disabled by default.

## Example
`mk-parallax mk-parallax-fast` on a background image inside a `position: relative` section.
```

- [ ] **Step 3: Create `text.md`**

Write to `/Users/adrienolinger/Claude/motion-kit/docs/effects/text.md`:
```markdown
# Text Animations

Animates headings and paragraphs on entry.

## Classes
- `mk-text-reveal` — characters fade up one by one
- `mk-text-split` — words fade up with stagger
- `mk-text-typewriter` — types out character by character

## Requires
SplitText script tag (already in the standard install snippet).

## Mobile
Runs for `reveal` and `split`. `typewriter` simplifies to fade.

## Example
`<h1 class="mk-text-reveal">Hello</h1>`
```

- [ ] **Step 4: Create `hover.md`**

Write to `/Users/adrienolinger/Claude/motion-kit/docs/effects/hover.md`:
```markdown
# Hover Interactions

## Classes
- `mk-hover-magnetic` — element pulls toward the cursor
- `mk-hover-zoom` — scales up on hover
- `mk-hover-tilt` — 3D tilt follows cursor

## Modifiers
- `mk-hover-strength-low` / `-base` / `-high`

## Mobile
Disabled (no hover on touch devices).

## Example
`<button class="mk-hover-magnetic">Click me</button>`
```

- [ ] **Step 5: Create `marquee.md`**

Write to `/Users/adrienolinger/Claude/motion-kit/docs/effects/marquee.md`:
```markdown
# Marquee

Infinite horizontal scroll of child elements.

## Classes
- `mk-marquee` — on the container

## Modifiers
- `mk-marquee-slow` / `mk-marquee-base` / `mk-marquee-fast` — speed
- `mk-marquee-reverse` — reverse direction
- `mk-marquee-pause-hover` — pause on hover

## Mobile
Runs.

## Example
A container with repeatable logo spans: `<div class="mk-marquee mk-marquee-base"><span>…</span>…</div>`
```

- [ ] **Step 6: Create `pin.md`**

Write to `/Users/adrienolinger/Claude/motion-kit/docs/effects/pin.md`:
```markdown
# Sticky Pin

Pins a section vertically for a configurable scroll distance.

## Classes
- `mk-pin` — on the section to pin

## Modifiers
- `mk-pin-duration-1` (default, 1 viewport height) / `-2` / `-3` / `-4`

## Mobile
Disabled (scroll-jacking is hostile to touch devices).

## Example
`<section class="mk-pin mk-pin-duration-2">…</section>`
```

- [ ] **Step 7: Create `hscroll.md`**

Write to `/Users/adrienolinger/Claude/motion-kit/docs/effects/hscroll.md`:
```markdown
# Horizontal Scroll Pin

Section pins vertically while its children scroll sideways as the user scrolls down.

## Markup contract
The container's first child must be a horizontally-laid-out track wider than the viewport.
```html
<section class="mk-hscroll" style="height:100vh;overflow:hidden">
  <div style="display:flex;width:400vw">
    <div style="width:100vw">Panel 1</div>
    <div style="width:100vw">Panel 2</div>
  </div>
</section>
```

## Mobile
Disabled. Falls back to native `overflow-x: auto` with scroll-snap — users pan the track with touch.

## Known fragility on Squarespace
Squarespace wraps sections in its own transforms on some block types. v1 targets standard Blank Section blocks (added via Insert → Section → Blank). If pinning doesn't work on a specific block type, use a Code Block to drop in the container markup directly.
```

- [ ] **Step 8: Create `bg-crossfade.md`**

Write to `/Users/adrienolinger/Claude/motion-kit/docs/effects/bg-crossfade.md`:
```markdown
# Fixed Background Crossfade

Fixed background crossfades between multiple images as the section scrolls.

## Markup contract
Requires a Code Block in Squarespace (native section-background UI only accepts one image).

```html
<section class="mk-bg-crossfade" style="position:relative;min-height:200vh">
  <div class="mk-bg-image" data-mk-bg="https://…/image1.jpg"></div>
  <div class="mk-bg-image" data-mk-bg="https://…/image2.jpg"></div>
  <div class="mk-bg-image" data-mk-bg="https://…/image3.jpg"></div>
  <div>Your content here.</div>
</section>
```

## Mobile
Disabled. Falls back to showing the first image as a static background.
```

- [ ] **Step 9: Create `ken-burns.md`**

Write to `/Users/adrienolinger/Claude/motion-kit/docs/effects/ken-burns.md`:
```markdown
# Ken Burns

Subtle continuous zoom/pan on images tied to scroll position.

## Classes
- `mk-ken-burns` — on an `<img>`

## Modifiers
- `mk-ken-burns-zoom` / `mk-ken-burns-pan` / (default: both)
- `mk-ken-burns-intensity-low` / `-base` / `-high`

## Mobile
Disabled.

## Example
`<img class="mk-ken-burns mk-ken-burns-intensity-high" src="…">` inside a `width`/`height`-constrained container.
```

- [ ] **Step 10: Create `stagger.md`**

Write to `/Users/adrienolinger/Claude/motion-kit/docs/effects/stagger.md`:
```markdown
# Staggered Grid Reveal

Children of a container reveal in a wave, diagonal, or random pattern.

## Classes
- `mk-stagger` on the grid/container; combine with any reveal class (e.g. `mk-fade-up`) on children

## Modifiers
- `mk-stagger-wave` / `mk-stagger-diagonal` / `mk-stagger-random` — default: linear
- `mk-stagger-speed-fast` / `-base` / `-slow`

## Mobile
Runs.

## Example
```html
<div class="mk-stagger mk-stagger-wave">
  <div class="mk-fade-up">…</div>
  <div class="mk-fade-up">…</div>
</div>
```
```

- [ ] **Step 11: Commit**

```bash
git add docs/effects/
git commit -m "docs: per-effect usage documentation"
```

---

### Task 22: README and CHANGELOG

**Files:**
- Modify: `/Users/adrienolinger/Claude/motion-kit/README.md`
- Create: `/Users/adrienolinger/Claude/motion-kit/CHANGELOG.md`

- [ ] **Step 1: Write full README**

Replace `/Users/adrienolinger/Claude/motion-kit/README.md`:
```markdown
# MotionKit

Class-driven animation library for Squarespace 7.1 sites, powered by GSAP + ScrollTrigger.

## Install on a Squarespace site

Requires Business plan or higher (for Code Injection) and Squarespace 7.1.

1. Settings → Advanced → Code Injection → Header.
2. Paste:

```html
<script src="https://unpkg.com/gsap@3.12/dist/gsap.min.js"></script>
<script src="https://unpkg.com/gsap@3.12/dist/ScrollTrigger.min.js"></script>
<script src="https://unpkg.com/gsap@3.12/dist/SplitText.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/<your-handle>/motion-kit@v1.0.0/dist/motion-kit.min.js"></script>
```

3. On any block, open its settings → "Add class name" → type an effect class (e.g. `mk-fade-up`).

## Effects

See `/docs/effects/` for usage docs. v1 includes:

- Scroll reveal (fade/slide/scale)
- Parallax
- Text animations (reveal/split/typewriter)
- Hover interactions (magnetic/zoom/tilt)
- Marquee
- Sticky pin
- Horizontal scroll pin
- Fixed background crossfade
- Ken Burns
- Staggered grid reveal

## Configuration

Optional. Add after the MotionKit script tag:

```html
<script>
  window.MotionKit = {
    defaults: { duration: 700, easing: 'power2.out' },
    effects: { parallax: { intensity: 0.3 } },
    breakpoints: { mobile: 768 },
    debug: false,
  };
</script>
```

## Development

```bash
npm install
npm run build      # one-off build
npm run dev        # watch mode
npm run demo       # serves demo/ on :5173
npm test           # Playwright tests
```

## Releasing a version

```bash
# 1. Bump version in package.json
# 2. Update CHANGELOG.md
npm run build
git add package.json CHANGELOG.md dist/
git commit -m "release: vX.Y.Z"
git tag vX.Y.Z
git push origin main --tags
```

jsDelivr picks up the new tag automatically within ~10 minutes.

## License

MIT (update before first public use).
```

- [ ] **Step 2: Create CHANGELOG**

Write to `/Users/adrienolinger/Claude/motion-kit/CHANGELOG.md`:
```markdown
# Changelog

## [1.0.0] — UNRELEASED

### Added
- Core runtime: DOM scanner, effect registry, config loader, reduced-motion + mobile-breakpoint guards
- 10 effects: fade/slide/scale reveals, parallax, text animations (reveal/split/typewriter), hover (magnetic/zoom/tilt), marquee, sticky pin, horizontal scroll pin with native mobile fallback, fixed background crossfade, Ken Burns, staggered grid reveal
- `window.MotionKit.refresh()` for dynamic content
- `window.MotionKit.getActiveEffects()` and `getRegistry()` for debugging
- `debug: true` console logging
- Anti-FOUC CSS inlined in bundle
- Playwright test suite
- Demo page
```

- [ ] **Step 3: Commit**

```bash
git add README.md CHANGELOG.md
git commit -m "docs: README and CHANGELOG"
```

---

### Task 23: Bump to v1.0.0 and tag release

**Files:**
- Modify: `/Users/adrienolinger/Claude/motion-kit/package.json`
- Modify: `/Users/adrienolinger/Claude/motion-kit/src/index.js`
- Modify: `/Users/adrienolinger/Claude/motion-kit/CHANGELOG.md`

- [ ] **Step 1: Bump package version**

In `/Users/adrienolinger/Claude/motion-kit/package.json`, change `"version": "0.1.0"` to `"version": "1.0.0"`.

- [ ] **Step 2: Bump runtime version string**

In `/Users/adrienolinger/Claude/motion-kit/src/index.js`, change `version: '0.1.0'` to `version: '1.0.0'`.

- [ ] **Step 3: Date the CHANGELOG entry**

In `/Users/adrienolinger/Claude/motion-kit/CHANGELOG.md`, change `## [1.0.0] — UNRELEASED` to `## [1.0.0] — 2026-04-21` (or today's date if different).

- [ ] **Step 4: Final build and full test run**

```bash
npm run build && npm test
```
Expected: build completes, all tests pass.

- [ ] **Step 5: Visual sweep of demo page**

Run `npm run demo`. Scroll through every section and confirm each effect works as expected. Then open DevTools, toggle device emulation at 375px width, reload, and confirm:
- Disabled on mobile: parallax, pin, hscroll, bg-crossfade, ken-burns, hover
- Still running on mobile: fade, marquee, text, stagger
Kill the server.

- [ ] **Step 6: Verify bundle size ≤ 30KB gzipped**

```bash
wc -c dist/motion-kit.min.js
gzip -c dist/motion-kit.min.js | wc -c
```
Expected: the gzipped byte count (second command) prints a number ≤ 30720. If over, investigate before tagging.

- [ ] **Step 7: Commit and tag**

```bash
git add package.json src/index.js CHANGELOG.md dist/
git commit -m "release: v1.0.0"
git tag v1.0.0
```

- [ ] **Step 8: (Optional, when GitHub remote is ready) push and verify jsDelivr**

```bash
git remote add origin git@github.com:<your-handle>/motion-kit.git
git push -u origin main --tags
```

After ~10 minutes, verify:
```bash
curl -I "https://cdn.jsdelivr.net/gh/<your-handle>/motion-kit@v1.0.0/dist/motion-kit.min.js"
```
Expected: `HTTP/2 200`.

---

## Spec coverage review

| Spec section | Covered by |
|---|---|
| §2 Architecture (4 layers) | Tasks 2, 3, 9, 22 |
| §3.1 Install snippet | Task 22 |
| §3.2 Class-based trigger API | Task 9 + each effect task |
| §3.3 Class naming convention | Task 5 (tokens) + each effect task |
| §3.4 Config schema + precedence | Task 8 |
| §3.5 Runtime API (`refresh`, `getActiveEffects`, `getRegistry`, `version`) | Tasks 9, 10 |
| §4.1 Scroll reveals | Task 11 |
| §4.2 Parallax | Task 14 |
| §4.3 Text animations | Task 18 |
| §4.4 Hover interactions | Task 13 |
| §4.5 Marquee | Task 12 |
| §4.6 Sticky pin | Task 16 |
| §4.7 Horizontal scroll pin + mobile fallback | Task 19 (+ mobileFallback hook in Task 9) |
| §4.8 Fixed bg crossfade | Task 20 |
| §4.9 Ken Burns | Task 15 |
| §4.10 Staggered grid | Task 17 |
| §5 Reduced-motion handling | Tasks 6, 9 |
| §5 Mobile breakpoint logic | Tasks 7, 9 |
| §5 Per-element overrides (`mk-mobile-on/off`) | Tasks 7, 9 |
| §5 Anti-FOUC CSS | Tasks 2, 9 |
| §6 Repo layout | Task 1 + every file-creation task |
| §7 Build tooling (esbuild) | Task 2 |
| §7 Semver release workflow | Task 23 |
| §8 Demo page | Task 4 + every effect task |
| §8 Playwright mechanical tests | Task 3 + every effect task |
| §8 Sandbox SS site | Task 23 step 8 (external — user maintains) |
| §8 `debug: true` logging | Tasks 8, 9 |
| §11 Success criteria | Task 23 steps 5, 6 |

**Intentionally deferred per spec §9 / §10:**
- CI auto-release via GitHub Actions
- Lazy-loading SplitText as separate script
- IntersectionObserver-gated init for heavy effects

**Type consistency verified:** `descriptor` shape, `getEffectOptions` signature, `isMobile` signature, `resolveMobileBehavior` signature, and effect names (`fade`, `marquee`, `hover`, `parallax`, `kenBurns`, `pin`, `hscroll`, `bgCrossfade`, `text`, `stagger`) are consistent across all tasks.
