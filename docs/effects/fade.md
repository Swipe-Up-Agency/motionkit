# Scroll Reveal (fade / slide / scale)

Fades, slides, scales, or clips elements into view as they enter the viewport. The animation plays once per element when the top of the element crosses 85% of the viewport height on scroll. Use this on headings, paragraphs, images, and any block you want to appear with a bit of life instead of popping in.

## Classes

Apply one variant class per element.

- `mk-fade-up` — fades in while moving upward into place.
- `mk-fade-down` — fades in while moving downward into place.
- `mk-fade-in` — fades in without any movement.
- `mk-slide-left` — fades in while sliding in from the right.
- `mk-slide-right` — fades in while sliding in from the left.
- `mk-scale-in` — fades in while scaling up from 90%.
- `mk-reveal-up` — fades and slides up with a clip-path mask (stronger "curtain lift" feel).

## Modifiers

Combine freely with a variant class.

**Duration** (how long the animation takes)
- `mk-duration-fast` — 300ms
- `mk-duration-base` — 700ms (default)
- `mk-duration-slow` — 1200ms

**Delay** (wait before animating, in ms)
- `mk-delay-100`, `mk-delay-200`, `mk-delay-300`, `mk-delay-400`, `mk-delay-500`, `mk-delay-600`, `mk-delay-700`, `mk-delay-800`

**Distance** (how far "up", "down", "left", "right" travels)
- `mk-distance-sm` — 20px
- `mk-distance-base` — 60px (default)
- `mk-distance-lg` — 120px

## Mobile behavior

Runs by default on mobile. Add `mk-mobile-off` on the element to disable, or `mk-mobile-on` to force run when the effect is globally disabled.

## Example

In the block settings on any Squarespace 7.1 block, open **Design → Add class name** and type:

```
mk-fade-up mk-duration-slow mk-delay-200
```

The block will fade up from 60px below its final position, over 1.2s, starting 200ms after it scrolls into view.

## Gotchas / known limitations

- **Stagger claims its children.** If an element is a direct child of a `mk-stagger` container, fade skips it — the parent stagger handles the reveal instead. This is intentional so both effects do not compete. If you want a fade on a stagger child, move the child out of the stagger container.
- Units in the `duration` config value are **milliseconds**, not seconds. The class modifiers (`mk-duration-fast/base/slow`) wrap this so you rarely need to touch the raw value.
- Animation plays **once** per element. Reloading the page or scrolling away and back does not replay it.
