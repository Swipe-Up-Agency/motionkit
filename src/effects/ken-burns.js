const INTENSITY = { low: 0.05, base: 0.1, high: 0.2 };

function readIntensity(el) {
  for (const k of Object.keys(INTENSITY)) if (el.classList.contains(`mk-ken-burns-intensity-${k}`)) return INTENSITY[k];
  return INTENSITY.base;
}

function readMode(el) {
  if (el.classList.contains('mk-ken-burns-zoom')) return 'zoom';
  if (el.classList.contains('mk-ken-burns-pan')) return 'pan';
  return 'both';
}

export const name = 'kenBurns';
export const classSelectors = ['mk-ken-burns'];
export const mobileDefault = 'disable';

export function init(element) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const parent = element.parentElement;
  if (parent && getComputedStyle(parent).overflow !== 'hidden') parent.style.overflow = 'hidden';

  const intensity = readIntensity(element);
  const mode = readMode(element);
  const from = {}, to = {};
  if (mode === 'zoom' || mode === 'both') { from.scale = 1; to.scale = 1 + intensity; }
  if (mode === 'pan') { from.scale = 1.05; to.scale = 1.05; } // provides headroom so pan doesn't expose container edges
  if (mode === 'pan' || mode === 'both') { from.xPercent = -intensity * 30; to.xPercent = intensity * 30; }

  gsap.fromTo(element, from, {
    ...to,
    ease: 'none',
    scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: true },
  });
}
