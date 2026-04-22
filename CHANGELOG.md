# Changelog

All notable changes to MotionKit are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/).
This project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] — UNRELEASED

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
