# Horizontal Scroll Pin

Pins a section vertically while its inner track scrolls sideways — the classic "scroll down to scroll right" panel experience. Good for portfolio showcases, timeline narratives, or feature galleries on desktop.

## Classes

- `mk-hscroll` — required. Wraps the horizontal scroll section.

## Modifiers

No class modifiers. The horizontal distance is computed from the width of the inner track, and the pin duration follows naturally.

## Mobile behavior

**Disabled by default on mobile, with a native fallback.** On mobile, MotionKit applies:

- `overflow-x: auto` on the outer container,
- `overflow-y: hidden`,
- `scroll-snap-type: x mandatory`,
- `scroll-snap-align: start` on each child panel.

The user gets a native horizontal swipe with snap points — much more reliable than a GSAP pin on touch devices.

## Markup contract

The effect requires exactly one direct child, which is the **track** that contains the panels:

```html
<section class="mk-hscroll">
  <div class="mk-hscroll-track">
    <div class="panel">Panel 1</div>
    <div class="panel">Panel 2</div>
    <div class="panel">Panel 3</div>
  </div>
</section>
```

The track must be wider than the viewport, usually achieved by setting `.mk-hscroll-track { display: flex; }` with fixed-width panels. The distance scrolled equals `track.scrollWidth - window.innerWidth`, recomputed on resize via ScrollTrigger's `invalidateOnRefresh`.

## Example

In a Squarespace Code Block:

```html
<section class="mk-hscroll">
  <div style="display: flex;">
    <div style="width: 100vw; height: 100vh;">Panel 1</div>
    <div style="width: 100vw; height: 100vh;">Panel 2</div>
    <div style="width: 100vw; height: 100vh;">Panel 3</div>
  </div>
</section>
```

## Gotchas / known limitations

- **First direct child is treated as the track.** If your markup has multiple direct children under `mk-hscroll`, only the first is scrolled. Wrap them in a single container.
- **Stacking context / overflow ancestors kill the pin.** Same gotcha as `mk-pin`: an ancestor with `overflow: hidden`, `transform`, `filter`, or `will-change` will break the ScrollTrigger pin. Squarespace section wrappers sometimes apply these. If the pin does not engage, move the markup into a Code Block at the section root.
- **Image load awareness.** If the track contains `<img>` tags, the effect waits for them to load before measuring `scrollWidth` — otherwise the computed distance would be wrong.
- **Track must exceed viewport width.** If `scrollWidth <= window.innerWidth` at init, nothing animates (there is nothing to scroll).
- On desktop, the user scrolls vertically and the track moves horizontally. This can confuse first-time visitors — consider adding a visual cue (e.g. a "scroll →" indicator).
