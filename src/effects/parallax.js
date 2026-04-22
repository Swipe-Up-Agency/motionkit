const INTENSITY = { slow: 15, med: 30, fast: 50 };

function readIntensity(el) {
  for (const k of Object.keys(INTENSITY)) if (el.classList.contains(`mk-parallax-${k}`)) return INTENSITY[k];
  return INTENSITY.med;
}

export const name = 'parallax';
export const classSelectors = ['mk-parallax'];
export const mobileDefault = 'disable';

export function init(element) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const i = readIntensity(element);
  gsap.fromTo(element,
    { yPercent: i },
    {
      yPercent: -i,
      ease: 'none',
      scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: true },
    });
}
