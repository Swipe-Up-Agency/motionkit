export const name = 'bgCrossfade';
export const classSelectors = ['mk-bg-crossfade'];
export const mobileDefault = 'disable';

export function mobileFallback(element) {
  const first = element.querySelector('.mk-bg-image');
  if (!first) return;
  const src = first.dataset.mkBg;
  if (!src) return;
  element.style.backgroundImage = `url("${src}")`;
  element.style.backgroundSize = 'cover';
  element.style.backgroundPosition = 'center';
}

export function init(element) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const sources = Array.from(element.querySelectorAll('.mk-bg-image'));
  if (!sources.length) return;

  if (getComputedStyle(element).position === 'static') element.style.position = 'relative';

  const layers = sources.map((src, i) => {
    const layer = document.createElement('div');
    layer.className = 'mk-bg-layer';
    layer.style.position = 'fixed';
    layer.style.inset = '0';
    layer.style.backgroundImage = `url("${src.dataset.mkBg}")`;
    layer.style.backgroundSize = 'cover';
    layer.style.backgroundPosition = 'center';
    layer.style.opacity = i === 0 ? '1' : '0';
    layer.style.zIndex = '-1';
    layer.style.pointerEvents = 'none';
    element.insertBefore(layer, element.firstChild);
    src.style.display = 'none';
    return layer;
  });

  const total = layers.length;
  ScrollTrigger.create({
    trigger: element,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      const progress = self.progress * (total - 1);
      const activeIdx = Math.floor(progress);
      const frac = progress - activeIdx;
      layers.forEach((layer, i) => {
        if (i === activeIdx) layer.style.opacity = String(1 - frac);
        else if (i === activeIdx + 1) layer.style.opacity = String(frac);
        else layer.style.opacity = '0';
      });
    },
  });
}
