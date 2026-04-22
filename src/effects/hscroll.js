export const name = 'hscroll';
export const classSelectors = ['mk-hscroll'];
export const mobileDefault = 'disable';

export function mobileFallback(element) {
  element.style.overflowX = 'auto';
  element.style.overflowY = 'hidden';
  element.style.scrollSnapType = 'x mandatory';
  const track = element.firstElementChild;
  if (track) {
    for (const child of track.children) child.style.scrollSnapAlign = 'start';
  }
}

export function init(element) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const track = element.firstElementChild;
  if (!track) return;

  const distance = track.scrollWidth - window.innerWidth;
  if (distance <= 0) return;

  gsap.to(track, {
    x: -distance,
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: 'top top',
      end: () => `+=${distance}`,
      pin: true,
      scrub: 0.5,
      invalidateOnRefresh: true,
    },
  });
}
