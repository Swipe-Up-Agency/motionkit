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

  const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth);
  if (getDistance() <= 0) return;

  function build() {
    gsap.to(track, {
      x: () => -getDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top top',
        end: () => `+=${getDistance()}`,
        pin: true,
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
    });
  }

  // Wait for images to load before measuring (fixes race when panels contain <img>)
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
