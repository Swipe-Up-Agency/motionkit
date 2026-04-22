const VH = { 1: 1, 2: 2, 3: 3, 4: 4 };

function readDuration(el) {
  for (const k of Object.keys(VH)) if (el.classList.contains(`mk-pin-duration-${k}`)) return VH[k];
  return 1;
}

export const name = 'pin';
export const classSelectors = ['mk-pin'];
export const mobileDefault = 'disable';

export function init(element) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const vh = readDuration(element);
  ScrollTrigger.create({
    trigger: element,
    start: 'top top',
    end: `+=${vh * 100}%`,
    pin: true,
    pinSpacing: true,
  });
}
