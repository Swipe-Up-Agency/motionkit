export const name = 'mosaic';
export const classSelectors = ['mk-mosaic'];
export const mobileDefault = 'run';

function waitForImages(imgs) {
  const pending = Array.from(imgs).filter((img) => !img.complete);
  if (!pending.length) return Promise.resolve();
  return Promise.all(
    pending.map(
      (img) =>
        new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        }),
    ),
  );
}

export function init(element, options = {}) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // Idempotency guard — skip if already initialized
  if (element.querySelector('.mk-mosaic-track')) return;

  const numColumns = Math.max(1, Number(element.dataset.mkColumns ?? options.columns ?? 3));
  const gap = Number(element.dataset.mkGap ?? options.gap ?? 12);
  const speed = Number(element.dataset.mkSpeed ?? options.speed ?? 1);
  const speedUp = Number(element.dataset.mkSpeedUp ?? options.speedUp ?? speed);
  const speedDown = Number(element.dataset.mkSpeedDown ?? options.speedDown ?? speed);

  // Duplicate content enough so the full scroll motion fits without hitting wrap boundaries.
  // For speeds ≤ 1, 2 copies (original + 1 duplicate) is enough. For higher speeds, add more.
  const maxSpeed = Math.max(speedUp, speedDown, 1);
  const numCopies = Math.max(2, Math.ceil(maxSpeed) + 1);

  const items = Array.from(element.children);
  if (!items.length) return;

  // Restructure DOM: distribute items into column tracks
  while (element.firstChild) element.removeChild(element.firstChild);

  element.style.display = 'grid';
  element.style.gridTemplateColumns = `repeat(${numColumns}, 1fr)`;
  element.style.gap = `${gap}px`;
  element.style.overflow = 'hidden';

  const tracks = [];
  for (let colIndex = 0; colIndex < numColumns; colIndex++) {
    const track = document.createElement('div');
    track.className = 'mk-mosaic-track';
    track.style.display = 'flex';
    track.style.flexDirection = 'column';
    track.style.gap = `${gap}px`;
    track.style.willChange = 'transform';
    track.style.backfaceVisibility = 'hidden';
    track.style.transform = 'translate3d(0,0,0)'; // promotes to its own GPU layer early

    // Distribute items round-robin into this column
    for (let i = colIndex; i < items.length; i += numColumns) {
      track.appendChild(items[i]);
    }
    // Duplicate (numCopies - 1) times to give enough runway for the wrap
    const originals = Array.from(track.children);
    for (let c = 1; c < numCopies; c++) {
      for (const node of originals) track.appendChild(node.cloneNode(true));
    }

    element.appendChild(track);
    tracks.push(track);
  }

  // Wait for all images to load before measuring
  const imgs = element.querySelectorAll('img');
  Promise.resolve(waitForImages(imgs)).then(() => {
    tracks.forEach((track, colIndex) => {
      const isDownCol = colIndex % 2 === 1;
      // Measure after images have loaded; scrollHeight is 2× content height
      const trackHeight = track.scrollHeight;
      const contentHeight = trackHeight / numCopies;
      if (contentHeight <= 0) return;

      // Wrap range extends over (numCopies - 1) × contentHeight so motion fits without wrapping
      // for speeds up to (numCopies - 1), which is always at least 1.
      const wrap = gsap.utils.wrap(-(numCopies - 1) * contentHeight, 0);

      ScrollTrigger.create({
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.2,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // For DOWN columns: reverse progress so content appears to move down
          // as scroll increases. On scroll-up, this naturally reverses too.
          const effective = isDownCol ? 1 - self.progress : self.progress;
          const columnSpeed = isDownCol ? speedDown : speedUp;
          const y = -effective * contentHeight * columnSpeed;
          // Use gsap.set (frame-batched, GPU-composited) instead of direct style writes
          // to avoid render stutter when scrub interpolates progress rapidly.
          gsap.set(track, { y: wrap(y), force3D: true });
        },
      });
    });
  });
}
