/* ═══════════════════════════════════════════════════════════════════
   Animated background (#circuit-bg).
   D4: two animations used to draw on the same canvas, each clearing
   and redrawing it every frame (double the work, and one wiped the other).
═══════════════════════════════════════════════════════════════════ */

import { test, expect, openApp, expectNoErrors } from './helpers.js';

// Count how often the background canvas is cleared, and how many frames pass.
// Each animation clears the canvas once per frame, so clears ÷ frames is
// the number of animations drawing on it.
async function countBackgroundDraws(page) {
  await page.addInitScript(() => {
    const counts = { clears: 0, frames: 0 };
    window.__bgCounts = counts;
    const clearRect = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      if (this.canvas.id === 'circuit-bg') counts.clears++;
      return clearRect.apply(this, args);
    };
    const tick = () => { counts.frames++; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
}

test('only one animation draws the background (D4)', async ({ page, errors }) => {
  await countBackgroundDraws(page);
  await openApp(page);

  // Start counting once both would be running, then let some frames pass.
  const start = await page.evaluate(() => ({ ...window.__bgCounts }));
  await expect.poll(() => page.evaluate(() => window.__bgCounts.frames), { timeout: 15_000 })
    .toBeGreaterThan(start.frames + 30);
  const end = await page.evaluate(() => ({ ...window.__bgCounts }));

  const frames = end.frames - start.frames;
  const clears = end.clears - start.clears;
  expect(clears, 'the background is still animated').toBeGreaterThan(0);
  // 1 animation → about 1 clear per frame; 2 animations → about 2.
  expect(clears / frames, `${clears} clears in ${frames} frames`).toBeLessThan(1.5);
  expectNoErrors(errors);
});
