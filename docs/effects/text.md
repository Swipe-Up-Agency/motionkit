# Text Animations

Animates headings and paragraphs on scroll-in with one of three treatments: character-by-character reveal, word-by-word fade, or a typewriter effect. Best on hero headlines, section intros, and short callouts. Runs once when the element reaches 80% of the viewport height.

## Classes

Apply exactly one mode class to a text element (usually an `h1`, `h2`, `h3`, or `p`).

- `mk-text-reveal` — splits the text into individual characters and slides each one up from below while fading in. Fast stagger for a cinematic feel.
- `mk-text-split` — splits the text into words. Each word fades up with a slightly longer stagger. Less frenetic than reveal, better for long lines.
- `mk-text-typewriter` — types the text out one character at a time after it scrolls into view.

## Modifiers

No per-element modifier classes for text. Timing and stagger are fixed to hand-tuned values for each mode.

## Mobile behavior

Runs by default on mobile.

## Dependency

The reveal and split modes require the GSAP **SplitText** plugin to be loaded on the page before MotionKit runs. Typewriter does not need SplitText. If SplitText is missing, reveal and split will log a warning and skip; other MotionKit effects continue to work.

## Example

In **Design → Add class name** on a text block:

```
mk-text-reveal
```

The heading will animate its characters into place the first time it scrolls into view.

For typewriter on a paragraph:

```
mk-text-typewriter
```

## Gotchas / known limitations

- **Typewriter captures text on scroll-in, not on page load.** The text stays visible in its original form until the user scrolls it into view — at that moment, the text is cleared and retyped. This avoids the flash of blank text during page load.
- SplitText wraps each character (`.mk-char`) or word (`.mk-word`) in a span. If your CSS targets the raw text node (not the child span), it may need updating.
- The typewriter interval is a fixed 40ms per character; long paragraphs will feel slow. Prefer short strings.
- The reveal and split modes play **once** per element and do not re-run on revisit.
