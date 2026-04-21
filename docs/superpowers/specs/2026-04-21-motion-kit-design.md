# MotionKit — Squarespace Animation Library (Design)

- **Date:** 2026-04-21
- **Status:** Approved design, ready for implementation plan
- **Codename:** MotionKit (rename trivial, whole-repo find/replace)
- **Target user:** Single agency (primary author). Internal reusable toolkit across multiple client sites. Not a commercial product in v1.

## 1. Goals and constraints

Build a reusable JavaScript animation library that can be dropped into any Squarespace 7.1 site (Business plan or higher) via Code Injection, triggered by CSS classes added through Squarespace's native block-settings UI, and serving a curated set of production-grade scroll and motion effects equivalent to or exceeding competitor Spark Plugin for this use case.

Non-goals:

- Not a productized SaaS with a visual builder / license keys / marketing site. Internal agency toolkit only. Productization can happen later without rewriting the core.
- Not a general-purpose framework. Scoped to Squarespace 7.1 + Business plan.
- Not a full-frame reinvention — it sits on top of GSAP + ScrollTrigger, which are the actual animation runtime.

Platform assumptions (locked):

- Squarespace 7.1 only (7.0 is being deprecated and has different DOM)
- Business plan or higher on every client site (required for Code Injection)
- Modern evergreen browsers (Chrome, Safari, Firefox, iOS Safari, Android Chrome — latest two versions each)

## 2. Architecture

Four layers:

1. **Browser runtime (MotionKit).** ~30KB gzipped minified JS file. On `DOMContentLoaded`: registers GSAP plugins, scans the DOM for elements with `mk-*` CSS classes, reads optional `window.MotionKit` config object, wires each matching element to its effect with appropriate mobile/a11y guards.
2. **GSAP + ScrollTrigger.** Loaded as separate `<script>` tags from GSAP's own CDN (unpkg). Not bundled into MotionKit — keeps GSAP caching shared across the broader web and lets us pick up GSAP patch releases without republishing MotionKit. GSAP and all plugins (ScrollTrigger, SplitText) are free since Webflow's 2024 acquisition.
3. **Distribution.** Source in a GitHub repo (`motion-kit`). Every release is a git tag following semver. jsDelivr serves pinned builds from `https://cdn.jsdelivr.net/gh/<handle>/motion-kit@v1.0.0/dist/motion-kit.min.js`. No hosting infrastructure.
4. **Integration.** Each client site pastes GSAP + ScrollTrigger + MotionKit script tags into Squarespace's Code Injection header, plus an optional inline `<script>` block for per-site config. Effects are triggered purely by adding CSS classes via Squarespace's built-in "Add class name" field in each block's settings — no HTML editing or Code Blocks required for standard effects.

**Execution flow per page load:**
Page loads → GSAP boots → MotionKit boots → reads `window.MotionKit` config → scans DOM for `mk-*` classes → for each match: checks reduced-motion + mobile breakpoint + `mk-mobile-*` overrides → creates ScrollTrigger / hover listener / etc. → if disabled, skips straight to end state so no flash occurs.

**Design decision — shared easing/duration tokens.** MotionKit ships with `mk-duration-fast/base/slow` and named easing tokens (e.g. `mk-easing-dramatic`) so each client site has consistent motion without hand-tuning every element. Config object can override token values per-site.

## 3. Installation & API

### 3.1 Client-site snippet

Pasted into Settings → Advanced → Code Injection → Header on every client site:

```html
<!-- GSAP core + ScrollTrigger from GSAP's CDN -->
<script src="https://unpkg.com/gsap@3.12/dist/gsap.min.js"></script>
<script src="https://unpkg.com/gsap@3.12/dist/ScrollTrigger.min.js"></script>

<!-- MotionKit, pinned to a specific tag -->
<script src="https://cdn.jsdelivr.net/gh/<your-handle>/motion-kit@v1.0.0/dist/motion-kit.min.js"></script>

<!-- Optional per-site config -->
<script>
  window.MotionKit = {
    defaults: { duration: 700, easing: 'power2.out' },
    effects: {
      parallax: { intensity: 0.3 },
      kenBurns: { scale: 1.12 }
    },
    selectors: {
      '.hero-image': { effect: 'kenBurns', intensity: 0.15 }
    },
    breakpoints: { mobile: 768 },
    reducedMotion: 'auto',
    debug: false
  };
</script>
```

### 3.2 Triggering effects on blocks

In any Squarespace 7.1 block, open block settings (gear icon) → "Add class name" field → type the effect class(es) separated by spaces. Example: `mk-fade-up mk-duration-slow mk-delay-200`.

No Code Blocks are required for standard effects. Code Blocks are only needed for effects that demand custom DOM (fixed background crossfade — see §4.8).

### 3.3 Class naming convention

- **Effect trigger:** `mk-<effect>` — e.g. `mk-fade-up`, `mk-parallax`, `mk-ken-burns`, `mk-marquee`
- **Direction:** `mk-<effect>-<dir>` — e.g. `mk-slide-left`, `mk-reveal-up`
- **Duration tokens:** `mk-duration-fast` (300ms), `mk-duration-base` (700ms), `mk-duration-slow` (1200ms)
- **Delay tokens:** `mk-delay-100` through `mk-delay-800` in 100ms steps
- **Mobile override:** `mk-mobile-on` (force effect on mobile) or `mk-mobile-off` (force disable on all viewports)
- **Stagger parent:** `mk-stagger` on a container, combined with any reveal class on children

### 3.4 Config object schema (all fields optional)

- `defaults` — global duration/easing for all effects
- `effects` — per-effect option overrides, keyed by effect name (`parallax`, `kenBurns`, etc.)
- `selectors` — programmatically attach effects to elements whose markup you can't edit (Squarespace-generated selectors)
- `breakpoints` — override the mobile breakpoint, default `{ mobile: 768 }`
- `reducedMotion` — `'auto'` (default, respects OS setting) | `'always'` | `'never'`
- `debug` — when `true`, logs every scanned element and its effect to the console

**Precedence order (highest wins):**
1. Per-element class modifier (e.g. `mk-parallax-slow` on the element itself)
2. `config.selectors` match (e.g. `'.hero-image': { effect: 'kenBurns', intensity: 0.15 }`)
3. `config.effects.<effectName>` global override
4. `config.defaults` (duration / easing only)
5. Built-in token values

The exact option names accepted under each `config.effects.<effectName>` block map 1:1 to internal effect parameters and are documented per-effect in `/docs/effects/`. The example values shown in §3.1 (`intensity: 0.3`, `scale: 1.12`) are illustrative — authoritative option names are in the per-effect docs.

### 3.5 Runtime API

`window.MotionKit` also exposes:

- `MotionKit.refresh()` — re-scans the DOM and re-initializes effects (call after dynamically loaded content)
- `MotionKit.version` — current library version string
- `MotionKit.getRegistry()` — returns the internal map of elements → active effects for debugging

## 4. Effect specifications

All effects respect `prefers-reduced-motion`. When reduced motion is active, effects skip straight to their end state instantly.

### 4.1 Scroll reveal
- **Classes:** `mk-fade-up`, `mk-fade-down`, `mk-fade-in`, `mk-slide-left`, `mk-slide-right`, `mk-scale-in`, `mk-reveal-up`
- **Modifiers:** `mk-duration-*`, `mk-delay-*`, `mk-distance-sm/base/lg`
- **Mobile:** runs (core UX)
- **Implementation:** ScrollTrigger with `start: "top 85%"` default, `once: true`

### 4.2 Parallax
- **Classes:** `mk-parallax` on image or section
- **Modifiers:** `mk-parallax-slow` (yPercent -15), `mk-parallax-med` (-30), `mk-parallax-fast` (-50). Default `med`.
- **Mobile:** disabled by default (iOS Safari transform quirks)
- **Implementation:** ScrollTrigger scrub, tween on `yPercent`

### 4.3 Text animation
- **Classes:** `mk-text-reveal` (letter-by-letter fade/slide up), `mk-text-split` (word-level fade), `mk-text-typewriter`
- **Modifiers:** stagger auto-computed from char/word count. Respects existing line breaks.
- **Mobile:** `reveal` and `split` run; `typewriter` simplified to fade
- **Implementation:** SplitText plugin, then stagger tween. SplitText lazy-loaded only if `mk-text-*` present.

### 4.4 Hover interactions
- **Classes:** `mk-hover-magnetic` (buttons pull toward cursor), `mk-hover-zoom` (image zooms on hover), `mk-hover-tilt` (3D card tilt)
- **Modifiers:** `mk-hover-strength-low/base/high`
- **Mobile:** disabled (no hover on touch)
- **Implementation:** pointer-move listeners with `requestAnimationFrame` throttling, GSAP tweens for return-to-rest

### 4.5 Marquee
- **Classes:** `mk-marquee` on container with repeatable children
- **Modifiers:** `mk-marquee-slow/base/fast`, `mk-marquee-reverse`, `mk-marquee-pause-hover`
- **Mobile:** runs
- **Implementation:** duplicate children at init to create seamless loop, GSAP linear tween, `will-change: transform`

### 4.6 Sticky pin
- **Classes:** `mk-pin` on a section
- **Modifiers:** `mk-pin-duration-*` (in viewport heights)
- **Mobile:** disabled (scroll-jacking hostile to touch)
- **Implementation:** ScrollTrigger `pin: true`

### 4.7 Horizontal scroll pin
- **Classes:** `mk-hscroll` on container with children
- **Modifiers:** auto-calculates pin length from total children width
- **Mobile:** disabled, falls back to native `overflow-x: auto` with `scroll-snap` for touch panning
- **Implementation:** ScrollTrigger `pin: true` + horizontal transform tween
- **Known fragility:** Squarespace wraps sections in their own transforms. v1 targets standard Blank Section blocks. Document markup contract clearly; flag unsupported block types.

### 4.8 Fixed background crossfade
- **Classes:** `mk-bg-crossfade` on section, `mk-bg-image` on children (one per image) with `data-mk-bg="<image-url>"` attribute
- **Modifiers:** optional `mk-bg-blend-*` for color blend modes
- **Mobile:** disabled — shows first image only, no crossfade, no fixed positioning
- **Requires Code Block** in Squarespace because native section-background UI accepts only one image per section.

### 4.9 Ken Burns
- **Classes:** `mk-ken-burns` on `<img>`
- **Modifiers:** `mk-ken-burns-zoom`, `mk-ken-burns-pan`, `mk-ken-burns-intensity-low/base/high`
- **Mobile:** disabled
- **Implementation:** ScrollTrigger scrub on a scale+translate tween. Auto-adds `overflow: hidden` to parent if missing.

### 4.10 Staggered grid reveal
- **Classes:** `mk-stagger` on container + any reveal class (e.g. `mk-fade-up`) on children
- **Modifiers:** `mk-stagger-wave`, `mk-stagger-diagonal`, `mk-stagger-random`, `mk-stagger-speed-*`
- **Mobile:** runs
- **Implementation:** ScrollTrigger on container, single GSAP stagger tween targeting children with computed order per modifier

## 5. Mobile, accessibility, and performance

**Reduced-motion handling.** At boot: read `window.matchMedia('(prefers-reduced-motion: reduce)')`. When true and `config.reducedMotion !== 'never'`, every effect skips to end state instantly. Live listener re-applies on next navigation (not mid-session — simpler + safer than hot-swapping ScrollTrigger instances).

**Mobile breakpoint logic.** Single `isMobile` check at init: `window.innerWidth < config.breakpoints.mobile`. Effects declared as mobile-disabled skip registration entirely (zero runtime cost). Resize across the breakpoint does not hot-swap modes — refresh takes effect on next page navigation.

**Per-element overrides.** `mk-mobile-on` forces an effect on mobile even if the effect type is disabled by default. `mk-mobile-off` disables it on all viewports.

**Performance guardrails.**
- SplitText lazy-init — only loads if `mk-text-*` classes present on page
- IntersectionObserver-gated init for heavy effects (Ken Burns, horizontal scroll pin, fixed bg crossfade) — ScrollTrigger instance only created when section is within ~2 viewport heights
- Single DOM scan pass on `DOMContentLoaded`; `MotionKit.refresh()` is the only way to re-scan
- No FOUC on reveals — tiny inline stylesheet injected at script load sets `opacity: 0` on `.mk-fade-*` / `.mk-slide-*` / `.mk-reveal-*` until MotionKit boots
- Bundle budget: MotionKit ≤30KB gzipped. With GSAP + ScrollTrigger (~60KB) and optional SplitText (~10KB), fully-loaded page tops out ~100KB of motion JS.

## 6. Repository layout

```
motion-kit/
├── src/
│   ├── core/
│   │   ├── boot.js            # scan + init
│   │   ├── config.js          # reads window.MotionKit, merges defaults
│   │   ├── reduced-motion.js  # a11y check
│   │   ├── breakpoints.js     # mobile detection
│   │   └── tokens.js          # duration/delay/easing presets
│   ├── effects/
│   │   ├── fade.js
│   │   ├── parallax.js
│   │   ├── text.js
│   │   ├── hover.js
│   │   ├── marquee.js
│   │   ├── pin.js
│   │   ├── hscroll.js
│   │   ├── bg-crossfade.js
│   │   ├── ken-burns.js
│   │   └── stagger.js
│   ├── styles/
│   │   └── anti-fouc.css      # inlined at build time
│   └── index.js               # entry, registers effects
├── demo/                      # static HTML pages simulating SS markup
│   └── index.html
├── dist/                      # committed; this is what jsDelivr serves
│   ├── motion-kit.min.js
│   └── motion-kit.min.js.map
├── docs/
│   └── effects/<effect>.md    # per-effect usage docs
├── tests/                     # Playwright specs (§8)
├── .github/workflows/
│   └── release.yml            # builds + tags on push to main (optional)
├── package.json
├── esbuild.config.js
├── CHANGELOG.md
└── README.md
```

**Build tooling.** Single-command esbuild bundle. Minifies JS. Inlines `anti-fouc.css` as a string that `boot.js` injects into a `<style>` tag at runtime. No TypeScript in v1.

**Dependencies.** `esbuild` as the only build-time dep. `gsap` included as a `devDependency` (for local `/demo` page — production bundles load GSAP from unpkg).

## 7. Versioning and release process

**Semver, strictly enforced:**
- **Patch (v1.0.x)** — bug fixes only, safe to update any client site
- **Minor (v1.x.0)** — new effects or new config options, backwards-compatible. New client sites use the new tag; old sites keep their pinned version.
- **Major (v2.0.0)** — breaking class-name changes or removed effects. Old sites stay on v1 forever; new sites opt into v2 at install time.

**Release workflow:**
1. Work on `main`; commit changes
2. Bump version in `package.json`, run `npm run build`, commit the updated `/dist`
3. `git tag vX.Y.Z && git push --tags`
4. jsDelivr picks up the tag automatically (within ~10 min)

**CHANGELOG.md is mandatory.** Every release documents what changed, what's breaking, migrations required.

**Client migration policy.** Do not proactively upgrade old client sites when shipping a new version. Upgrade only when you're already in a client's admin for other work, and always test visually before leaving. Blast radius of a bad release = zero client sites by default.

## 8. Testing strategy

**Demo page (primary dev environment).** `/demo/index.html` mimics Squarespace 7.1's DOM structure (sections, blocks, image wrappers — mirror real SS class names). Every effect gets a section with every modifier variant side-by-side. Run locally, scroll in browser, verify visually. Daily feedback loop.

**Playwright mechanical tests.** ~15–20 tests covering non-visual correctness:
- Element matching: N elements with `mk-fade-up` → N ScrollTrigger instances
- Config merging: `window.MotionKit.defaults` overrides baseline; `config.selectors` applies; per-site overrides beat defaults
- Reduced-motion short-circuit: with emulated `prefers-reduced-motion: reduce`, no ScrollTriggers register
- Mobile breakpoint: at viewport 375px, parallax/pin/kenBurns/hscroll/bg-crossfade don't register; at 1280px they do
- `MotionKit.refresh()` re-scans and picks up dynamically added elements
- Per-element overrides: `mk-mobile-on` and `mk-mobile-off` work as documented

**Real Squarespace sandbox site.** Maintain one Business-plan sandbox site with every effect live. Before tagging a minor or major release: push pre-release bundle to a staging path (`dist/next/`), point sandbox's code injection at it, manually smoke-test every effect visually. Promote to tagged release only after sandbox passes. This is the single biggest safeguard against Squarespace DOM changes breaking the library.

**`debug: true`** config logs every element matched, every ScrollTrigger created, every effect skipped and why. First line of defense for client-site troubleshooting.

**Manual cross-browser sweep on major releases.** Chrome / Safari / Firefox desktop + iOS Safari + Android Chrome. ~20 min per major release.

**Explicitly not in v1 testing:** visual regression testing (Percy, Chromatic), unit tests for GSAP's own behavior, automated Squarespace site testing.

## 9. Out of scope for v1

- Admin UI / visual builder — Spark's core product, intentionally skipped for an agency toolkit.
- License key / domain locking — internal toolkit.
- Page transitions (Barba-style) — Squarespace's page-swap mechanics make this brittle on 7.1.
- Image sequence scrubbing, sticky-caption-moving-image, custom cursor, lottie, WebGL, video backgrounds — deferred.
- TypeScript — revisit if/when productized.
- Per-client bundled variants — monolithic bundle chosen.
- Automated client-site migration tooling — manual discipline is sufficient at agency scale.
- Analytics / telemetry — zero phone-home by design.
- Visual regression testing — demo page + manual sweep is enough for v1.

## 10. Open decisions deferred to implementation

- **Exact GSAP version to pin** (recommend latest in the 3.12.x line at implementation time).
- **Whether to bundle SplitText into the main MotionKit file or lazy-load it as a separate script.** Lazy-load keeps the base bundle smaller for sites that don't use text effects but adds a request. Decide after benchmarking.
- **CI auto-release via GitHub Actions vs manual `npm run release`.** Default to manual for v1; add automation if release cadence makes it worth it.
- **Final name.** MotionKit is a codename. Easy rename via find/replace when the real brand is chosen.

## 11. Success criteria for v1

- All 10 effects from §4 implemented and working on the demo page
- Bundle is ≤30KB gzipped (excluding GSAP)
- `prefers-reduced-motion` fully respected on every effect
- Mobile breakpoint correctly enables/disables effects per the table
- Library installs on a real Business-plan Squarespace 7.1 site via Code Injection and effects fire correctly on blocks tagged with `mk-*` classes
- Playwright test suite passes
- v1.0.0 tagged on GitHub; jsDelivr serves the build at the expected URL
- README.md and per-effect docs in `/docs/effects/` complete enough that future-you can install MotionKit on a new client site in under 10 minutes without re-reading this design doc
