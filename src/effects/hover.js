const STRENGTH = { low: 0.15, base: 0.3, high: 0.5 };

function readStrength(el) {
  for (const k of Object.keys(STRENGTH)) if (el.classList.contains(`mk-hover-strength-${k}`)) return STRENGTH[k];
  return STRENGTH.base;
}

function pickMode(el) {
  if (el.classList.contains('mk-hover-magnetic')) return 'magnetic';
  if (el.classList.contains('mk-hover-zoom')) return 'zoom';
  if (el.classList.contains('mk-hover-tilt')) return 'tilt';
  return null;
}

export const name = 'hover';
export const classSelectors = ['mk-hover-magnetic', 'mk-hover-zoom', 'mk-hover-tilt'];
export const mobileDefault = 'disable';

export function init(element) {
  const gsap = window.gsap;
  if (!gsap) return;
  const mode = pickMode(element);
  const strength = readStrength(element);
  if (mode === 'magnetic') return wireMagnetic(gsap, element, strength);
  if (mode === 'zoom') return wireZoom(gsap, element, strength);
  if (mode === 'tilt') return wireTilt(gsap, element, strength);
}

function wireMagnetic(gsap, el, strength) {
  let raf = null;
  el.addEventListener('pointermove', (e) => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * strength;
      const dy = (e.clientY - (r.top + r.height / 2)) * strength;
      gsap.to(el, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
    });
  });
  el.addEventListener('pointerleave', () => {
    if (raf) cancelAnimationFrame(raf);
    gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
  });
}

function wireZoom(gsap, el, strength) {
  const target = 1 + strength;
  el.addEventListener('pointerenter', () => gsap.to(el, { scale: target, duration: 0.3 }));
  el.addEventListener('pointerleave', () => gsap.to(el, { scale: 1, duration: 0.3 }));
}

function wireTilt(gsap, el, strength) {
  const maxDeg = strength * 30;
  let raf = null;
  el.addEventListener('pointermove', (e) => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const relX = (e.clientX - r.left) / r.width - 0.5;
      const relY = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(el, {
        rotationX: -relY * maxDeg,
        rotationY: relX * maxDeg,
        transformPerspective: 800,
        duration: 0.3,
        ease: 'power2.out',
      });
    });
  });
  el.addEventListener('pointerleave', () => {
    if (raf) cancelAnimationFrame(raf);
    gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.5 });
  });
}
