# Fixed Background Crossfade

A fixed-position background that crossfades between multiple images as the user scrolls through the section. The effect is driven by scroll progress, so fast scrolls move through the images quickly and slow scrolls linger. Ideal for a "scroll through our story" section with a few key photographs.

## Classes

- `mk-bg-crossfade` — required on the container.
- `mk-bg-image` — required on each image "source" child element. The URL is read from the element's `data-mk-bg` attribute.

## Modifiers

No modifier classes. The number of layers and the crossfade timing is determined by how many `.mk-bg-image` elements you include.

## Mobile behavior

**Disabled by default on mobile, with a fallback.** On mobile, MotionKit applies the **first** image as a static `background-image` on the container (using `background-size: cover`, `background-position: center`). No crossfade, no scroll coupling — just a single still image.

## Markup contract

Squarespace's native section-background UI accepts only one image, so this effect requires a **Code Block** placed inside the section. The container must have a defined height (usually 100vh or taller per layer) so that the scroll progress can drive through all the images.

```html
<section class="mk-bg-crossfade" style="min-height: 300vh; position: relative;">
  <div class="mk-bg-image" data-mk-bg="https://example.com/photo-1.jpg"></div>
  <div class="mk-bg-image" data-mk-bg="https://example.com/photo-2.jpg"></div>
  <div class="mk-bg-image" data-mk-bg="https://example.com/photo-3.jpg"></div>

  <!-- Your foreground content here -->
  <div class="content">…</div>
</section>
```

At init, MotionKit:

1. Reads each `data-mk-bg` URL,
2. Replaces each `.mk-bg-image` child with a `position: fixed` layer pinned to the viewport edges (`inset: 0`), and hides the original source div,
3. Sets `position: relative` on the container if it was static,
4. Drives layer opacity by scroll progress between the container's top-top and bottom-bottom — layer N fades out as layer N+1 fades in.

## Example

In a Code Block inside a Squarespace Blank Section:

```html
<section class="mk-bg-crossfade" style="min-height: 300vh;">
  <div class="mk-bg-image" data-mk-bg="/s/hero-1.jpg"></div>
  <div class="mk-bg-image" data-mk-bg="/s/hero-2.jpg"></div>
  <div class="mk-bg-image" data-mk-bg="/s/hero-3.jpg"></div>
</section>
```

Use a height per image of roughly 100vh for a balanced pace — with three images, the section is ~300vh tall.

## Gotchas / known limitations

- **Stacking contexts trap `position: fixed`.** The crossfade layers are inserted with `position: fixed` so they stay glued to the viewport during scroll. Any **ancestor** of the section with a `transform`, `filter`, `perspective`, `will-change`, `backdrop-filter`, `contain`, or `isolation` property creates a new stacking context that **traps the fixed layers inside it**. The background will then scroll with the parent instead of staying fixed. Squarespace wrapper elements sometimes apply these on certain section types. If the crossfade is not sticking, place the Code Block as direct a descendant of `<body>` as the template allows.
- **Requires a Code Block.** The native Squarespace section-background editor only accepts one image, so you cannot achieve this with the UI — drop the HTML into a Code Block.
- **Container must have scrollable height.** If the section is only 100vh tall, there is no scroll progress to drive the crossfade. Give it at least `100vh × number-of-images`.
- **Idempotent init.** If MotionKit is re-run (e.g. by `MotionKit.refresh()`), the effect detects existing `.mk-bg-layer` elements and skips re-initialization.
- Layers are inserted at `z-index: -1` and `pointer-events: none`, so your foreground content renders above them and remains interactive.
