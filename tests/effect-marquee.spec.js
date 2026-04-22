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
