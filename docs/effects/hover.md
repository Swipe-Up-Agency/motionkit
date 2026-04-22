# Hover Interactions

Pointer-driven micro-interactions for buttons, cards, and images. Three modes: magnetic pull toward the cursor, smooth zoom, and 3D tilt. Designed to make interactive elements feel responsive without being distracting.

## Classes

Apply exactly one mode class per element.

- `mk-hover-magnetic` — the element translates toward the pointer as it moves over it, and snaps back with an elastic ease on leave. Good for CTAs.
- `mk-hover-zoom` — scales up on pointer enter, scales back on pointer leave.
- `mk-hover-tilt` — tilts on X/Y axes based on pointer position relative to the element's center. Uses CSS perspective for depth.

## Modifiers

**Strength** (how strong the effect is)
- `mk-hover-strength-low` — subtle (magnetic: 0.15x pull, zoom: 1.15, tilt: ~4.5°)
- `mk-hover-strength-base` — default (magnetic: 0.3x, zoom: 1.3, tilt: ~9°)
- `mk-hover-strength-high` — pronounced (magnetic: 0.5x, zoom: 1.5, tilt: ~15°)

## Mobile behavior

**Disabled by default on mobile** (below 768px). There is no touch fallback — touch devices fire synthetic pointer events that feel glitchy with these interactions, so they are intentionally skipped. On true-hover devices (desktop with a mouse), the effect runs normally.

Override with `mk-mobile-on` if you know what you are doing.

## Example

On a button in **Design → Add class name**:

```
mk-hover-magnetic mk-hover-strength-high
```

The button will pull strongly toward the cursor when hovered, and elastic-snap back when the pointer leaves.

On an image or card:

```
mk-hover-tilt
```

## Gotchas / known limitations

- **Pointer events only.** Touch and stylus events are not wired. This is deliberate.
- Pointer-move handlers are rAF-throttled, so rapid cursor movement will not flood GSAP with tweens.
- `mk-hover-tilt` sets `transformPerspective: 800` on the element; if you have your own 3D transforms or perspective already applied, the tilt will compose with them.
- These animations mutate `transform` directly. If your element has a CSS transition on `transform`, it may fight with GSAP — prefer letting GSAP own the property.
