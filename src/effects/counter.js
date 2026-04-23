export const name = 'counter';
export const classSelectors = ['mk-counter'];
export const mobileDefault = 'run';

function formatNumber(value, decimals, separator) {
  const fixed = value.toFixed(decimals);
  if (!separator) return fixed;
  const [whole, dec] = fixed.split('.');
  const wholeWithSep = whole.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return dec != null ? `${wholeWithSep}.${dec}` : wholeWithSep;
}

export function init(element, options = {}) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const data = element.dataset;
  const to = Number(data.mkCountTo ?? options.to ?? 0);
  const from = Number(data.mkCountFrom ?? options.from ?? 0);
  const durationMs = Number(data.mkCountDuration ?? options.duration ?? 2000);
  const duration = durationMs / 1000;
  const decimals = Number(data.mkCountDecimals ?? options.decimals ?? 0);
  const separator = data.mkCountSeparator ?? options.separator ?? '';
  const prefix = data.mkCountPrefix ?? options.prefix ?? '';
  const suffix = data.mkCountSuffix ?? options.suffix ?? '';

  const render = (value) => {
    element.textContent = `${prefix}${formatNumber(value, decimals, separator)}${suffix}`;
  };

  // Start at "from" so anti-FOUC and initial paint are predictable.
  render(from);

  const state = { value: from };

  ScrollTrigger.create({
    trigger: element,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      gsap.to(state, {
        value: to,
        duration,
        ease: 'power2.out',
        onUpdate: () => render(state.value),
        onComplete: () => render(to), // ensure we end exactly on target
      });
    },
  });
}
