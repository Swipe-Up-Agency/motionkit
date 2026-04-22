# MotionKit

Class-driven animation library for Squarespace 7.1 sites, built on GSAP + ScrollTrigger.

Add a class name, get an animation. No code required in the page — everything is driven by a single DOM scan on load. 10 effects, ~5.5 KB gzipped, respects `prefers-reduced-motion`, and degrades gracefully on mobile.

## Install on a Squarespace site

**Prerequisites**

- Squarespace **Business plan** or higher (Code Injection is a paid feature).
- Squarespace 7.1 (7.0 is untested).
- GSAP 3.13 or newer (SplitText is bundled free from GSAP 3.13).

**Step 1 — Open Code Injection**

In the Squarespace admin, go to **Settings → Advanced → Code Injection → Header**.

**Step 2 — Paste this snippet into the Header field**

```html
<script src="https://unpkg.com/gsap@3.13/dist/gsap.min.js"></script>
<script src="https://unpkg.com/gsap@3.13/dist/ScrollTrigger.min.js"></script>
<script src="https://unpkg.com/gsap@3.13/dist/SplitText.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/Swipe-Up-Agency/motionkit@v1.0.0/dist/motion-kit.min.js"></script>
```

jsDelivr serves straight from the tagged Git release — no npm publish needed. Path segments:

- `/gh/Swipe-Up-Agency/` — GitHub org (hosts the repo)
- `/motionkit@v1.0.0/` — repo name + release tag (immutable once tagged)
- `/dist/motion-kit.min.js` — the committed bundle artifact

Pin to `@v1.0.0` on live client sites. The tag never changes, so clients never get surprise updates.

**Step 3 — Add effect classes in block settings**

In the editor, open any block, click **Design → Add class name**, and type an effect class such as `mk-fade-up` or `mk-parallax mk-med`. Save and reload. That's it.

### Quick examples

```html
<!-- Fade up on scroll, slower and further than default -->
<div class="mk-fade-up mk-duration-900 mk-distance-60">...</div>

<!-- Parallax background with medium intensity -->
<section class="mk-parallax mk-med">...</section>

<!-- Pin a section for 2 viewport heights -->
<section class="mk-pin mk-pin-2">...</section>

<!-- Staggered grid reveal, diagonal wave -->
<div class="mk-stagger mk-diagonal">
  <div class="card">...</div>
  <div class="card">...</div>
  <div class="card">...</div>
</div>
```

Full class modifier lists live in the per-effect docs linked below.

## Effects

Each effect is a class you add to a block. Full options and class modifiers are in the per-effect docs.

- **Scroll reveal** — fade/slide/scale blocks in as they enter the viewport. See [docs/effects/fade.md](docs/effects/fade.md).
- **Text animations** — reveal, split, or typewriter effects on headings and paragraphs. See [docs/effects/text.md](docs/effects/text.md).
- **Hover interactions** — magnetic, zoom, and tilt responses on pointer devices. See [docs/effects/hover.md](docs/effects/hover.md).
- **Marquee** — infinite horizontal ticker with speed, reverse, and pause-on-hover. See [docs/effects/marquee.md](docs/effects/marquee.md).
- **Parallax** — background-position shift on scroll with three intensity levels. See [docs/effects/parallax.md](docs/effects/parallax.md).
- **Ken Burns** — slow zoom-and-pan motion for hero images. See [docs/effects/ken-burns.md](docs/effects/ken-burns.md).
- **Sticky pin** — pin a section in the viewport for 1–4 screen-heights of scroll. See [docs/effects/pin.md](docs/effects/pin.md).
- **Horizontal scroll pin** — pin a section and translate a child horizontally as the user scrolls. See [docs/effects/hscroll.md](docs/effects/hscroll.md).
- **Fixed background crossfade** — swap fixed background images on scroll through a section. See [docs/effects/bg-crossfade.md](docs/effects/bg-crossfade.md).
- **Staggered grid reveal** — reveal grid children in wave, diagonal, or random order. See [docs/effects/stagger.md](docs/effects/stagger.md).

## Configuration

Configuration is optional. Defaults are tuned to feel right on Squarespace. To override, set `window.MotionKit` **before** the `motion-kit.min.js` script tag:

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

- `defaults` — merged over built-in defaults and applied to every effect.
- `effects.<name>` — per-effect overrides (e.g. `effects.marquee.speed`). These win over `defaults`.
- Per-selector overrides can be added under `effects.<name>.selectors` keyed by CSS selector, if you need one block to behave differently from the rest.
- `breakpoints.mobile` — the px width below which mobile-disabled effects (parallax, hover, ken-burns, pin, bg-crossfade) are skipped.
- `debug: true` — logs every scan, registration, and skip decision to the browser console. Useful when a class isn't taking effect.

### Re-scanning after dynamic content

If you inject new blocks after page load (e.g. a lightbox, AJAX content, a tabs component), call:

```js
window.MotionKit.refresh();
```

This re-runs the DOM scan and binds any new `mk-*` classes. Running it when nothing has changed is cheap — it skips already-registered elements via an internal WeakSet.

## Gotchas and known limitations

Read this before wiring up complex scenes.

- **Pin requires a clean ancestor chain.** Any ancestor with `overflow: hidden` or a CSS `transform` will break `position: sticky` internally. If pinning doesn't work, inspect parents — Squarespace sections sometimes set transforms.
- **Fixed background crossfade breaks inside stacking contexts.** `mk-bg-crossfade` uses fixed-position layers. If the block sits inside an ancestor that creates a stacking context (transform, filter, will-change), the fixed layers render relative to that ancestor, not the viewport. Move the block up the tree.
- **Stagger overrides child reveal classes.** When a container has `mk-stagger`, MotionKit drives the children directly — don't also put `mk-fade-up` on the children, you'll get double animations.
- **Mobile disables heavy effects by default.** Parallax, hover, ken-burns, pin, hscroll (uses native overflow-x), and bg-crossfade (single static image) are reduced or skipped on mobile. Use `mk-mobile-on` on an element to force-enable, or `mk-mobile-off` to force-disable.
- **`_internals` is not public API.** Anything under `window.MotionKit._internals` may change in any minor release. Use only the documented surface: `refresh()`, `getActiveEffects()`, `getRegistry()`.
- **`prefers-reduced-motion: reduce` wins.** If the user has reduced motion enabled, all animations skip to their end state. This is intentional and not configurable.

## Development

```bash
npm install
npm run build      # one-off build
npm run dev        # watch mode
npm run demo       # serves demo/ on :5173 — open http://localhost:5173/demo/index.html
npm test           # Playwright tests
```

`npm run demo` requires `python3` on the host (it runs `python3 -m http.server`). macOS and most Linux distros ship with it.

Current state: 61 Playwright tests passing, bundle ~5.5 KB gzipped.

### Debugging a broken class

1. Open DevTools console and re-enable with `window.MotionKit = { debug: true };` (before the MotionKit script). Reload.
2. Look for a `[mk] skipped` or `[mk] registered` line for the element.
3. Check `window.MotionKit.getActiveEffects()` to see what actually bound.
4. If the element has `mk-pin` or `mk-bg-crossfade` and isn't animating, inspect the ancestor chain for `overflow: hidden` or `transform` — see **Gotchas** above.

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

jsDelivr picks up the new tag automatically within ~10 minutes. Existing sites pinned to an older `@vX.Y.Z` tag continue to serve the older bundle — upgrades are opt-in per client.

## Semver policy

- **Patch** (`v1.0.1`) — bugfix only. Safe to update every client.
- **Minor** (`v1.1.0`) — new effects or options, backwards-compatible. Existing class names keep working.
- **Major** (`v2.0.0`) — breaking class-name or API changes. Old clients stay on `v1` until you update their snippet.

## Browser support

Modern evergreen browsers: last 2 versions of Chrome, Safari, Firefox, iOS Safari, and Android Chrome. No IE, no legacy Edge.

## License

MIT. Update this section before first public use if you need a different license.
