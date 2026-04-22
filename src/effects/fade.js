import { DURATION, DELAY, DISTANCE, EASING } from '../core/tokens.js';

const VARIANTS = {
  'mk-fade-up':    { from: { opacity: 0, y: 'dist' },  to: { opacity: 1, y: 0 } },
  'mk-fade-down':  { from: { opacity: 0, y: '-dist' }, to: { opacity: 1, y: 0 } },
  'mk-fade-in':    { from: { opacity: 0 },             to: { opacity: 1 } },
  'mk-slide-left': { from: { opacity: 0, x: '-dist' }, to: { opacity: 1, x: 0 } },
  'mk-slide-right':{ from: { opacity: 0, x: 'dist' },  to: { opacity: 1, x: 0 } },
  'mk-scale-in':   { from: { opacity: 0, scale: 0.9 }, to: { opacity: 1, scale: 1 } },
  'mk-reveal-up':  { from: { opacity: 0, y: 'dist', clipPath: 'inset(100% 0 0 0)' }, to: { opacity: 1, y: 0, clipPath: 'inset(0 0 0 0)' } },
};

function readToken(el, prefix, table, fallback) {
  for (const key of Object.keys(table)) {
    if (el.classList.contains(`${prefix}-${key}`)) return table[key];
  }
  return fallback;
}

function pickVariant(el) {
  for (const cls of Object.keys(VARIANTS)) if (el.classList.contains(cls)) return VARIANTS[cls];
  return null;
}

function materializeCoords(spec, distance) {
  const out = { ...spec };
  if (out.y === 'dist') out.y = distance;
  if (out.y === '-dist') out.y = -distance;
  if (out.x === 'dist') out.x = distance;
  if (out.x === '-dist') out.x = -distance;
  return out;
}

export const name = 'fade';
export const classSelectors = Object.keys(VARIANTS);
export const mobileDefault = 'run';

export function init(element, options) {
  if (element.dataset.mkStaggerChild === 'true') return;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const variant = pickVariant(element);
  if (!variant) return;

  const duration = readToken(element, 'mk-duration', DURATION, options.duration ?? DURATION.base) / 1000;
  const delay = readToken(element, 'mk-delay', DELAY, 0) / 1000;
  const easing = options.easing ?? EASING.base;
  const distance = readToken(element, 'mk-distance', DISTANCE, DISTANCE.base);

  const from = materializeCoords(variant.from, distance);
  const to = materializeCoords(variant.to, distance);

  gsap.fromTo(element, from, {
    ...to,
    duration,
    delay,
    ease: easing,
    scrollTrigger: { trigger: element, start: 'top 85%', once: true },
  });
}
