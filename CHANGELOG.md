# Changelog

All notable changes to MotionKit are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/).
This project adheres to [Semantic Versioning](https://semver.org/).

## [1.3.0] — 2026-04-22

### Added

- New **Counter** effect (`mk-counter`) — animates any text element from a starting number to a target number when scrolled into view. Configurable via data attributes: `data-mk-count-to`, `data-mk-count-from`, `data-mk-count-duration`, `data-mk-count-decimals`, `data-mk-count-separator`, `data-mk-count-prefix`, `data-mk-count-suffix`. Supports any numeric format — percentages, currency, large numbers with thousands separators.
- 5 new tests covering counter initial state, animation-to-target, prefix/suffix, thousands-separator formatting, and reduced-motion short-circuit.
- Per-effect documentation at `docs/effects/counter.md`.

### Changed

- Total effect count: 10 → 11.
- `registerAll()` in `src/index.js` now registers `counter` after `text` (alphabetical ordering within the animation category).

## [1.2.0] — 2026-04-22

### Added

- `fade`, `text`, and `hover` effects now accept a `variant` option when attached via `config.selectors`. Previously these effects required a variant class on the element (e.g. `mk-fade-up`), which `config.selectors` cannot provide. Now `{ effect: 'fade', variant: 'fade-up' }` in a selector entry works the same as adding `class="mk-fade-up"` to the element.
- Variant option accepts either the bare variant name (`'fade-up'`, `'reveal'`, `'magnetic'`) or the full class name (`'mk-fade-up'`, etc.); both resolve correctly.
- 3 new tests covering selector-based attachment of fade/text/hover with variant options.

### Fixed

- Closes the last v1.0/v1.1 gap: the full v1 effect set is now attachable via `config.selectors` with no classList required. Agency workflow on Squarespace 7.1 sites no longer needs bootstrap JS workarounds for text reveals, fade-ins, or hover effects.

### Changed

- `text.js` and `hover.js` init signatures now accept an optional `options` parameter (was already accepted by `fade.js` since v1.1 polish). Class-based usage is unchanged — `options` is only consulted when no variant class is present.

## [1.1.0] — 2026-04-22

### Fixed

- `config.selectors` now actually dispatches effects to matching elements, not just modifies options on already-classed elements. Previously the spec documented this behavior but `scan()` only found elements by `mk-*` classes.

### Added

- `scan()` takes an optional `cfg` parameter so `run()` can reuse its already-loaded config.
- Invalid CSS selectors in `config.selectors` are now silently skipped (previously would throw).
- Unknown effect names in `config.selectors` are silently ignored.
- 4 new tests covering selector-based attachment, class+selector deduplication, unknown-effect handling, and invalid-selector handling.

### Docs

- README's install section now documents three real attach-to-element paths: `config.selectors` map (recommended), Code Blocks, and bootstrap JS. The v1.0.0 docs incorrectly assumed Squarespace had a universal "Add class name" UI (that's a Spark Plugin feature).

## [1.0.0] — 2026-04-22

### Added

- Core runtime: DOM scanner, effect registry, config loader, reduced-motion + mobile-breakpoint guards
- 10 effects:
  - Scroll reveal (`mk-fade-up`, `mk-fade-down`, `mk-fade-in`, `mk-slide-left`, `mk-slide-right`, `mk-scale-in`, `mk-reveal-up`)
  - Text animations (`mk-text-reveal`, `mk-text-split`, `mk-text-typewriter`) via SplitText plugin
  - Hover interactions (`mk-hover-magnetic`, `mk-hover-zoom`, `mk-hover-tilt`) — mobile-disabled
  - Marquee (`mk-marquee`) with speed/reverse/pause-on-hover + IntersectionObserver pause when off-screen
  - Parallax (`mk-parallax`) with slow/med/fast intensity — mobile-disabled
  - Ken Burns (`mk-ken-burns`) with zoom/pan modes — mobile-disabled
  - Sticky pin (`mk-pin`) with 1–4 viewport-height duration — mobile-disabled
  - Horizontal scroll pin (`mk-hscroll`) with native overflow-x fallback on mobile
  - Fixed background crossfade (`mk-bg-crossfade`) — mobile falls back to single static image
  - Staggered grid reveal (`mk-stagger`) with wave/diagonal/random patterns
- Token modifiers: `mk-duration-*`, `mk-delay-*`, `mk-distance-*`, `mk-mobile-on`, `mk-mobile-off`
- `window.MotionKit.refresh()` for re-scanning after dynamic content loads
- `window.MotionKit.getActiveEffects()` and `getRegistry()` for debugging
- `debug: true` console-logging mode
- Anti-FOUC CSS inlined in bundle
- `__booted__` idempotency guard (bundle-safe against double-loads)
- Playwright test suite (61 tests, 100% passing)
- Demo page at `demo/index.html`
- Per-effect documentation in `docs/effects/`

### Security

- Prototype-pollution protection in config loader (`__proto__` / `constructor` / `prototype` keys blocked in deepMerge)
- `loadConfig()` wrapped in try/catch with safe-default fallback

### Performance

- Bundle: ~5.5 KB gzipped (well under 30 KB target)
- Marquee auto-pauses when scrolled off-screen via IntersectionObserver
- Hover effects rAF-throttle pointer events

### Accessibility

- `prefers-reduced-motion: reduce` fully respected — all animations skip to end state
- Desktop-first graceful degradation on mobile (heavy effects disabled, lightweight effects run)
- Per-element override: `mk-mobile-on` / `mk-mobile-off`
