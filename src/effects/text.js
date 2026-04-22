function pickMode(el, options) {
  if (el.classList.contains('mk-text-reveal')) return 'reveal';
  if (el.classList.contains('mk-text-split')) return 'split';
  if (el.classList.contains('mk-text-typewriter')) return 'typewriter';
  if (options?.variant) {
    const v = String(options.variant).replace(/^mk-text-/, '').replace(/^mk-/, '');
    if (v === 'reveal' || v === 'split' || v === 'typewriter') return v;
  }
  return null;
}

export const name = 'text';
export const classSelectors = ['mk-text-reveal', 'mk-text-split', 'mk-text-typewriter'];
export const mobileDefault = 'run';

export function init(element, options = {}) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const SplitText = window.SplitText;
  if (!gsap || !ScrollTrigger || !SplitText) {
    console.warn('[MotionKit:text] GSAP/ScrollTrigger/SplitText missing; skipping.');
    return;
  }
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const mode = pickMode(element, options);
  if (mode === 'reveal') return wireReveal(gsap, SplitText, element);
  if (mode === 'split') return wireSplit(gsap, SplitText, element);
  if (mode === 'typewriter') return wireTypewriter(gsap, ScrollTrigger, element);
}

function wireReveal(gsap, SplitText, el) {
  const split = new SplitText(el, { type: 'chars', charsClass: 'mk-char' });
  gsap.fromTo(split.chars, { opacity: 0, yPercent: 100 }, {
    opacity: 1, yPercent: 0, duration: 0.6, stagger: 0.02, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 80%', once: true },
  });
}

function wireSplit(gsap, SplitText, el) {
  const split = new SplitText(el, { type: 'words', wordsClass: 'mk-word' });
  gsap.fromTo(split.words, { opacity: 0, y: 20 }, {
    opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out',
    scrollTrigger: { trigger: el, start: 'top 80%', once: true },
  });
}

function wireTypewriter(gsap, ScrollTrigger, el) {
  ScrollTrigger.create({
    trigger: el, start: 'top 80%', once: true,
    onEnter: () => {
      const full = el.textContent;
      el.textContent = '';
      let i = 0;
      const tick = () => {
        if (!el.isConnected) return;
        if (i > full.length) return;
        el.textContent = full.slice(0, i);
        i += 1;
        gsap.delayedCall(0.04, tick);
      };
      tick();
    },
  });
}
