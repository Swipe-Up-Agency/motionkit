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
  if (pattern === 'diagonal') {
    // Group elements into diagonals by summing their measured row/column.
    // Row = floor(offsetTop / rowHeight); column = derived from offsetLeft.
    // Elements on the same diagonal share the same (row + col) value.
    const rects = children.map((c) => ({ top: c.offsetTop, left: c.offsetLeft }));
    const rowHeight = Math.max(...rects.map((r) => r.top + 1), 1);
    const colWidth = Math.max(...rects.map((r) => r.left + 1), 1);
    const rowUnit = rects.find((r) => r.top > 0)?.top || rowHeight;
    const colUnit = rects.find((r) => r.left > 0)?.left || colWidth;
    return idx
      .map((i) => ({ i, d: Math.round(rects[i].top / rowUnit) + Math.round(rects[i].left / colUnit) }))
      .sort((a, b) => a.d - b.d)
      .map((o) => o.i);
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

  try {
    gsap.fromTo(
      order.map((i) => children[i]),
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.6, stagger: speed, ease: 'power2.out',
        scrollTrigger: { trigger: element, start: 'top 80%', once: true },
        onComplete: () => { for (const c of children) c.classList.add('mk-ready'); },
      },
    );
  } catch (err) {
    for (const c of children) c.classList.add('mk-ready');
    throw err;
  }
}
