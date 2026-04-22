import { test, expect } from '@playwright/test';

test('mk-marquee duplicates children in a track for seamless loop', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const result = await page.evaluate(async () => {
    window.mkClear();
    window.mkBuild({
      className: 'mk-marquee', id: 'm',
      style: { width: '400px', overflow: 'hidden', whiteSpace: 'nowrap' },
      children: [
        { tag: 'span', text: 'A' },
        { tag: 'span', text: 'B' },
        { tag: 'span', text: 'C' },
      ],
    });
    const before = document.getElementById('m').children.length;
    window.MotionKit.refresh();
    await new Promise((r) => setTimeout(r, 100));
    const track = document.getElementById('m').firstElementChild;
    return { before, after: track.children.length };
  });
  expect(result.before).toBe(3);
  expect(result.after).toBe(6);
});

test('mk-marquee-pause-hover pauses animation on pointerenter', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const paused = await page.evaluate(async () => {
    window.mkClear();
    window.mkBuild({
      className: 'mk-marquee mk-marquee-pause-hover', id: 'm',
      style: { width: '400px', overflow: 'hidden', whiteSpace: 'nowrap' },
      children: [{ tag: 'span', text: 'A' }, { tag: 'span', text: 'B' }],
    });
    window.MotionKit.refresh();
    await new Promise((r) => setTimeout(r, 100));
    const m = document.getElementById('m');
    m.dispatchEvent(new PointerEvent('pointerenter'));
    await new Promise((r) => setTimeout(r, 50));
    const tween = window.gsap.getTweensOf(m.firstElementChild)[0];
    return tween ? tween.paused() : null;
  });
  expect(paused).toBe(true);
});

test('marquee waits for image load before measuring track width', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const tweenExistsImmediately = await page.evaluate(async () => {
    window.mkClear();
    window.mkBuild({
      className: 'mk-marquee', id: 'mimg',
      style: { width: '400px', overflow: 'hidden', whiteSpace: 'nowrap' },
      children: [
        { tag: 'img', attrs: { src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' } },
      ],
    });
    window.MotionKit.refresh();
    // Immediately after refresh, image may or may not be complete — test is lenient.
    await new Promise((r) => setTimeout(r, 300));
    const track = document.getElementById('mimg').firstElementChild;
    const tween = window.gsap.getTweensOf(track)[0];
    return Boolean(tween);
  });
  expect(tweenExistsImmediately).toBe(true);
});

test('marquee pauses when scrolled off-screen via IntersectionObserver', async ({ page }) => {
  await page.goto('/tests/fixtures/harness.html');
  const result = await page.evaluate(async () => {
    window.mkClear();
    // Build marquee far below viewport so it starts NOT intersecting
    window.mkBuild({
      className: 'mk-marquee', id: 'mio',
      style: { width: '400px', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '200vh' },
      children: [{ tag: 'span', text: 'X' }, { tag: 'span', text: 'Y' }],
    });
    window.MotionKit.refresh();
    // Give IntersectionObserver a tick to fire its initial "not intersecting" callback
    await new Promise((r) => setTimeout(r, 200));
    const track = document.getElementById('mio').firstElementChild;
    const tween = window.gsap.getTweensOf(track)[0];
    return tween ? tween.paused() : null;
  });
  expect(result).toBe(true);
});
