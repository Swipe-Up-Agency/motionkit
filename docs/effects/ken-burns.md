# Ken Burns

Continuous zoom and/or pan on an image, tied to scroll position. Named after the documentary filmmaker whose animated-still technique it mimics. Use on hero images or editorial photography where you want a cinematic feel without a full video asset.

## Classes

- `mk-ken-burns` — required. By default performs both zoom **and** pan.

## Modifiers

**Mode** (pick at most one — omit for combined zoom + pan)
- `mk-ken-burns-zoom` — zoom only, no horizontal drift.
- `mk-ken-burns-pan` — horizontal pan only, no zoom-in.

**Intensity**
- `mk-ken-burns-intensity-low` — 5% range
- `mk-ken-burns-intensity-base` — 10% range (default)
- `mk-ken-burns-intensity-high` — 20% range

## Mobile behavior

**Disabled by default on mobile.** Scroll-driven scale transforms are expensive on mobile compositors. Override with `mk-mobile-on` if you accept the cost.

## Example

On an image block in **Design → Add class name**:

```
mk-ken-burns mk-ken-burns-intensity-high
```

For pan-only:

```
mk-ken-burns mk-ken-burns-pan
```

## Gotchas / known limitations

- **Parent gets `overflow: hidden` automatically.** On init, MotionKit sets `overflow: hidden` on the immediate parent element (if it was not already hidden). This prevents the scaled image from spilling out. If you need the parent to remain overflow-visible, use this effect inside a dedicated wrapper that you are happy to have clipped.
- **Pan-only uses a 1.05× base scale.** Pure pan without zoom would expose the container edges as the image slides. To avoid this, pan-only mode holds the image at 1.05× scale throughout, giving it enough headroom that edges never reveal.
- Like parallax, this is driven by `scrub` — the motion is coupled to scroll position, not to a fixed timeline.
- Works best on images with a consistent subject in the frame; strong perspective can make the scale drift look unnatural.
