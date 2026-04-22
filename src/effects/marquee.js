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

  function build() {
    const distance = track.scrollWidth / 2;
    const fromX = reverse ? -distance : 0;
    const toX = reverse ? 0 : -distance;

    const tween = gsap.fromTo(track, { x: fromX }, { x: toX, duration: speed, ease: 'none', repeat: -1 });

    if (typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) tween.resume();
          else tween.pause();
        }
      });
      io.observe(element);
    }

    const hasTrueHover = typeof window.matchMedia === 'function'
      && window.matchMedia('(hover: hover)').matches;
    if (pauseOnHover && hasTrueHover) {
      element.addEventListener('pointerenter', () => tween.pause());
      element.addEventListener('pointerleave', () => tween.resume());
    }
  }

  const imgs = Array.from(track.querySelectorAll('img'));
  const pending = imgs.filter((img) => !img.complete);
  if (pending.length === 0) {
    build();
  } else {
    Promise.all(pending.map((img) => new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    }))).then(build);
  }
}
