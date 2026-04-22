# Staggered Grid Reveal

Reveals the direct children of a container in sequence, with a choice of patterns: left-to-right, a wave from the middle outward, a diagonal sweep, or random. Great for image grids, feature cards, and any repeating layout where you want the items to feel choreographed rather than popping in together.

## Classes

- `mk-stagger` — required on the parent container.

The direct children are animated; their descendants are not directly targeted. Each child gets a `data-mk-stagger-child="true"` attribute so the `mk-fade*` and similar effects know to skip it.

## Modifiers

**Speed** (seconds between each child's start)
- `mk-stagger-speed-fast` — 0.05s
- `mk-stagger-speed-base` — 0.1s (default)
- `mk-stagger-speed-slow` — 0.2s

**Pattern**
- (no pattern class) — **linear**: children animate in DOM order.
- `mk-stagger-wave` — starts from the middle child and expands outward in both directions.
- `mk-stagger-diagonal` — groups children by their measured row + column and animates along diagonals (top-left → bottom-right).
- `mk-stagger-random` — shuffles the order.

The diagonal pattern uses `offsetTop` / `offsetLeft` of each child at init time to detect rows and columns, so it works on any grid-like layout (CSS Grid, Flexbox, Squarespace auto-grids) without needing extra attributes.

## Mobile behavior

Runs by default on mobile.

## Markup contract

Put the items you want to reveal as **direct children** of the `mk-stagger` container:

```html
<div class="mk-stagger mk-stagger-diagonal mk-stagger-speed-slow">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
  <div class="item">5</div>
  <div class="item">6</div>
</div>
```

Nested children (grandchildren) are not animated by the stagger.

## Example

On a Squarespace Summary Block or Auto Layout block, in **Design → Add class name**:

```
mk-stagger mk-stagger-wave mk-stagger-speed-base
```

## Gotchas / known limitations

- **Stagger claims its children.** The direct children of `mk-stagger` are tagged on init with `data-mk-stagger-child="true"`. Any `mk-fade-*` class on those children is **ignored** — the stagger handles their reveal instead. This prevents both effects from competing.
- **Fixed from-state.** The animation is hardcoded to `{opacity: 0, y: 40}` → `{opacity: 1, y: 0}`. If you put `mk-scale-in` or `mk-slide-left` on a stagger child, it will not scale or slide — it will just fade up 40px. If you need scale or slide within a staggered group, the stagger effect does not currently support it.
- **Registration order matters.** Internally, `mk-stagger` is registered **before** `mk-fade*`. This ordering is what allows stagger to tag its children first so fade skips them. If you are extending MotionKit with custom effects, keep this in mind.
- **Diagonal grouping is measurement-based.** Children are grouped into diagonals by rounding `offsetTop / rowHeight + offsetLeft / columnWidth`. On layouts where children are not cleanly in a grid (e.g. masonry, floats with varied sizes), the pattern may not look as intended. Linear or wave are safer fallbacks for irregular layouts.
- **Defensive error handling.** If GSAP fails to set up the tween for any reason, children still get an `mk-ready` class so they remain visible instead of stuck at opacity 0.
