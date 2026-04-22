# Marquee

Infinite horizontal scroll of the container's children — classic logo ticker, press-strip, or scrolling callout. MotionKit automatically duplicates the content so the loop seams together with no visible gap.

## Classes

- `mk-marquee` — required. Turns the container into a marquee.

## Modifiers

**Speed** (seconds per full loop — lower is faster)
- `mk-marquee-slow` — 80s
- `mk-marquee-base` — 40s (default)
- `mk-marquee-fast` — 20s

**Direction**
- `mk-marquee-reverse` — scrolls right-to-left reversed (right → left content order instead of the default left → right scroll).

**Interaction**
- `mk-marquee-pause-hover` — pauses the scroll when the pointer hovers the marquee. Only effective on true-hover devices (desktop with mouse); ignored on touch.

## Mobile behavior

Runs by default on mobile.

## Markup contract

Put the items you want to scroll directly inside the `mk-marquee` container. On init, MotionKit:

1. Wraps all children in a `.mk-marquee-track` inner div,
2. Clones the children once inside the track so the loop seams,
3. Sets `overflow: hidden` on the container.

So this:

```html
<div class="mk-marquee mk-marquee-base">
  <span>Logo A</span>
  <span>Logo B</span>
  <span>Logo C</span>
</div>
```

...becomes (at runtime):

```html
<div class="mk-marquee mk-marquee-base" style="overflow: hidden;">
  <div class="mk-marquee-track" style="display: inline-flex;">
    <span>Logo A</span>…<span>Logo C</span>
    <span>Logo A</span>…<span>Logo C</span>   <!-- clones -->
  </div>
</div>
```

## Example

In a Squarespace Code Block:

```html
<div class="mk-marquee mk-marquee-fast mk-marquee-pause-hover">
  <img src="/client-logos/a.svg" alt="A" />
  <img src="/client-logos/b.svg" alt="B" />
  <img src="/client-logos/c.svg" alt="C" />
</div>
```

## Gotchas / known limitations

- **Image load awareness.** If the marquee contains `<img>` tags, MotionKit waits for them to load before measuring the track width, so the loop distance is correct. Broken image requests (404) also resolve — no hang.
- **Auto-pause when off-screen.** An IntersectionObserver pauses the tween when the marquee scrolls out of view and resumes it on re-entry. Saves CPU.
- **Hover-pause requires a real pointer.** Pause-on-hover is gated by the `(hover: hover)` media query — touch devices never trigger it.
- The loop distance is measured **once**, at build time. If your marquee children change size after init (e.g. lazy-loaded images without dimensions), the loop can drift.
