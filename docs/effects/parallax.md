# Parallax

Moves an element vertically at a different rate than the page scroll, creating a sense of depth. Best used on background-style imagery, decorative shapes, or a hero image that should feel "floaty" as the user scrolls past.

## Classes

- `mk-parallax` — required. Ties the element's vertical offset to scroll progress of its parent section.

## Modifiers

**Intensity** (how far the element drifts, as a percent of its own height)
- `mk-parallax-slow` — ±15% drift
- `mk-parallax-med` — ±30% drift (default)
- `mk-parallax-fast` — ±50% drift

The element starts shifted down (entering from below) and scrolls to shifted up (exiting above) over the span of its trigger area — standard GSAP `scrub` behavior tied to scroll position.

## Mobile behavior

**Disabled by default on mobile.** Parallax on mobile is janky (browser scrollbar quirks, smaller viewport, no compositor help) and not worth the trade-off. Override with `mk-mobile-on` at your own risk.

## Example

In **Design → Add class name** on an image block:

```
mk-parallax mk-parallax-fast
```

Works especially well on a background image inside a `position: relative` Squarespace section — the image drifts past the viewport as the user scrolls.

## Gotchas / known limitations

- Parallax uses GSAP's `scrub: true`, so the motion is directly tied to scroll position — no easing, no inertia. Scrolling fast scrolls the effect fast.
- Because the animation shifts the element vertically, make sure the **parent has enough height** (or `overflow: hidden`) to absorb the drift, or you will see the element escape its container.
