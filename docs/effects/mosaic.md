# Mosaic

Creates a multi-column vertical scroll mosaic where each column translates with scroll direction. Odd columns move up when the user scrolls down; even columns move down. All directions reverse when scrolling up. Content loops infinitely — no blank gaps at any scroll speed or position.

## Class

- `mk-mosaic` — on a container with `<img>` (or any element) children

## Data attributes

| Attribute | Default | Purpose |
|---|---|---|
| `data-mk-columns` | `3` | Number of columns |
| `data-mk-gap` | `12` | Gap between images in pixels (applied to both grid and column flex-gap) |
| `data-mk-speed` | `1` | Base scroll-to-motion multiplier (applies to both directions unless overridden) |
| `data-mk-speed-up` | inherits `data-mk-speed` | Speed for UP-moving columns (odd-indexed columns) |
| `data-mk-speed-down` | inherits `data-mk-speed` | Speed for DOWN-moving columns (even-indexed columns) |

### Different speeds per direction

Odd (up) and even (down) columns can scroll at different rates. Common patterns:

```html
<!-- Subtle: down columns slightly faster -->
<div class="mk-mosaic" data-mk-speed-up="0.9" data-mk-speed-down="1.1">...</div>

<!-- Dramatic: down columns much faster -->
<div class="mk-mosaic" data-mk-speed-up="0.6" data-mk-speed-down="1.4">...</div>
```

This asymmetry creates a subtle "drift" feeling — the mosaic feels less mechanical and more organic. Keep the difference small (±10-20%) for a natural feel, or push wider for a more stylized effect.

## Markup contract

The effect takes direct children and distributes them round-robin across N column tracks, then duplicates each column's content for infinite looping. Any direct children work — `<img>`, `<div>`, `<a>`, custom components. Give the container an explicit `height` via CSS (e.g., `100vh`) or inline style.

```html
<div class="mk-mosaic" data-mk-columns="5" data-mk-gap="12" style="height:100vh;background:#111">
  <img src="IMG-1.jpg" />
  <img src="IMG-2.jpg" />
  <img src="IMG-3.jpg" />
  <!-- more items -->
</div>
```

## Mobile

Runs by default. Columns on mobile can look crowded — consider using a smaller column count via a media-query override in Custom CSS, or hide the mosaic entirely and show a simpler grid on mobile.

## Image loading

The effect waits for all child `<img>` tags to load before measuring column heights. This prevents the classic "mosaic snaps after images load" glitch.

## Performance

Each column creates one ScrollTrigger instance with `scrub: 0.5`. For wide mosaics with many columns (e.g., 8+), expect a small perf cost. GSAP's shared ticker handles this well on modern hardware.

## Example

```html
<section class="mk-mosaic" data-mk-columns="5" data-mk-gap="8" style="height:100vh;background:#0a0a12">
  <img src="https://picsum.photos/id/101/600/400" style="width:100%;display:block;border-radius:8px" />
  <img src="https://picsum.photos/id/102/600/400" style="width:100%;display:block;border-radius:8px" />
  <img src="https://picsum.photos/id/103/600/400" style="width:100%;display:block;border-radius:8px" />
  <!-- ...repeat for 15-25 total -->
</section>
```
