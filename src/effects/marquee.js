const SPEED = { slow: 80, base: 40, fast: 20 }; // seconds per loop

function readSpeed(el) {
  for (const k of Object.keys(SPEED)) if (el.classList.contains(`mk-marquee-${k}`)) return SPEED[k];
  return SPEED.base;
}

export const name = 'marquee';
export const classSelectors = ['mk-marquee'];
export const mobileDefault = 'run';

export function init(element) {
  const gsap = window.gsap;
  if (!gsap) return;

  const track = document.createElement('div');
  track.className = 'mk-marquee-track';
  track.style.display = 'inline-flex';
  track.style.willChange = 'transform';
  while (element.firstChild) track.appendChild(element.firstChild);

  const originals = Array.from(track.children);
  for (const child of originals) track.appendChild(child.cloneNode(true));

  element.appendChild(track);
  if (!element.style.overflow) element.style.overflow = 'hidden';

  const speed = readSpeed(element);
  const reverse = element.classList.contains('mk-marquee-reverse');
  const pauseOnHover = element.classList.contains('mk-marquee-pause-hover');

  const distance = track.scrollWidth / 2;
  const fromX = reverse ? -distance : 0;
  const toX = reverse ? 0 : -distance;

  const tween = gsap.fromTo(track, { x: fromX }, { x: toX, duration: speed, ease: 'none', repeat: -1 });

  if (pauseOnHover) {
    element.addEventListener('pointerenter', () => tween.pause());
    element.addEventListener('pointerleave', () => tween.resume());
  }
}
