# Counter

Animates a number from a starting value to a target value when the element enters the viewport. Useful for "stats" sections, KPIs, social-proof counters.

## Classes

- `mk-counter` — on any text element

## Data attributes (per-element configuration)

| Attribute | Default | Purpose |
|---|---|---|
| `data-mk-count-to` | `0` | Target number (required) |
| `data-mk-count-from` | `0` | Starting number |
| `data-mk-count-duration` | `2000` | Animation duration in milliseconds |
| `data-mk-count-decimals` | `0` | Decimal places (e.g. `2` for `99.95`) |
| `data-mk-count-separator` | (none) | Thousands separator, e.g. `,` → `1,000,000` |
| `data-mk-count-prefix` | (none) | Text prepended to number, e.g. `$` |
| `data-mk-count-suffix` | (none) | Text appended to number, e.g. `+`, `%`, `k` |

## Mobile

Runs by default (it's a lightweight tween).

## Accessibility

Respects `prefers-reduced-motion` — the effect short-circuits at the framework level and the original text content remains. Set the element's initial text to the target value if you want it to show the final number for reduced-motion users:

```html
<span class="mk-counter" data-mk-count-to="500">500</span>
```

The animation replaces the text on scroll-in; the initial HTML content only shows for reduced-motion users and as a fallback before the first render.

## Examples

Single number:
```html
<span class="mk-counter" data-mk-count-to="500">0</span>+ clients served
```

Formatted currency:
```html
<span
  class="mk-counter"
  data-mk-count-to="1250000"
  data-mk-count-prefix="$"
  data-mk-count-separator=","
>0</span>
```

Percentage with decimal:
```html
<span
  class="mk-counter"
  data-mk-count-to="98.5"
  data-mk-count-decimals="1"
  data-mk-count-suffix="%"
>0</span>
```
