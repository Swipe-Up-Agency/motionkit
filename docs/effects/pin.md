# Sticky Pin

Pins a section in place as the user scrolls past it, for a configurable distance. The page stops scrolling the section until the pin releases — good for storytelling, step-by-step reveals, or holding a hero frame in view while content changes around it.

## Classes

- `mk-pin` — required. Pins the element at the top of the viewport.

## Modifiers

**Duration** (how long the pin holds, measured in viewport heights)
- `mk-pin-duration-1` — 100vh (default). The pin releases after the user scrolls one screen height past it.
- `mk-pin-duration-2` — 200vh
- `mk-pin-duration-3` — 300vh
- `mk-pin-duration-4` — 400vh

## Mobile behavior

**Disabled by default on mobile.** ScrollTrigger pinning is unreliable on mobile Safari's address-bar-auto-hide and can cause layout jumps. Override with `mk-mobile-on` only if you have tested thoroughly.

## Example

On a section in **Design → Add class name**:

```
mk-pin mk-pin-duration-2
```

The section will pin to the top of the viewport as the user reaches it, and stay pinned for 200vh of additional scroll before releasing.

## Gotchas / known limitations

- **Ancestor gotchas.** ScrollTrigger's pinning uses `position: fixed` internally. Any ancestor in the DOM tree with:
  - `overflow: hidden`
  - `overflow-x` or `overflow-y` other than `visible`
  - a `transform`, `filter`, or `will-change: transform` applied

  ...will create a containing block or clipping context that **breaks pinning**. The pinned section will either clip, drift, or simply not pin. Squarespace sometimes applies these on wrapper elements for certain block types — if pinning does not work in your specific layout, try dropping the markup into a Code Block at the section root instead of nesting it deep.
- The effect uses `anticipatePin: 1` to minimize the visible "jump" when the pin engages. You may still see a small shift on fast scrolls.
- `pinSpacing: true` is on by default, so the scroll bar respects the pinned duration. The page remains scrollable as normal.
