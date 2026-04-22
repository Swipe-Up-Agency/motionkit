const SPEED = { fast: 0.05, base: 0.1, slow: 0.2 };

function readSpeed(el) {
  for (const k of Object.keys(SPEED)) if (el.classList.contains(`mk-stagger-speed-${k}`)) return SPEED[k];
  return SPEED.base;
}

function pickPattern(el) {
  if (el.classList.contains('mk-stagger-wave')) return 'wave';
  if (el.classList.contains('mk-stagger-diagonal')) return 'diagonal';
  if (el.classList.contains('mk-stagger-random')) return 'random';
  return 'linear';
}

function computeOrder(children, pattern) {
  const idx = children.map((_, i) => i);
  if (pattern === 'random') return idx.sort(() => Math.random() - 0.5);
  if (pattern === 'wave') {
    const mid = Math.floor(children.length / 2);
    const out = [];
    for (let i = 0; i < children.length; i++) {
      const offset = Math.ceil(i / 2) * (i % 2 === 0 ? -1 : 1);
      const v = mid + offset;
      if (v >= 0 && v < children.length) out.push(v);
    }
    return out;
  }
  return idx;
}

export const name = 'stagger';
export const classSelectors = ['mk-stagger'];
export const mobileDefault = 'run';

export function init(element) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const children = Array.from(element.children);
  if (!children.length) return;
  for (const c of children) c.dataset.mkStaggerChild = 'true';

  const speed = readSpeed(element);
  const pattern = pickPattern(element);
  const order = computeOrder(children, pattern);

  gsap.fromTo(
    order.map((i) => children[i]),
    { opacity: 0, y: 40 },
    {
      opacity: 1, y: 0, duration: 0.6, stagger: speed, ease: 'power2.out',
      scrollTrigger: { trigger: element, start: 'top 80%', once: true },
      onComplete: () => { for (const c of children) c.classList.add('mk-ready'); },
    },
  );
}
