/* ═══════════════════════════════════════════════════════════════════
   Animated background (#circuit-bg).
   D4: two animations used to draw on the same canvas, each clearing
   and redrawing it every frame (double the work, and one wiped the other).
   D28: the colours follow the light/dark theme.
   D29: after a window resize the moving dots follow the new grid.
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

// Record what each frame of the background draws: the grid line colour, the
// grid segments and where the moving dots are. A frame starts at clearRect.
// The dots are the only shapes drawn with a 10 px glow (shadowBlur).
async function recordBackground(page) {
  await page.addInitScript(() => {
    const P = CanvasRenderingContext2D.prototype;
    const frames = (window.__bgFrames = []);
    let frame = null;
    let path = [];
    const wrap = (name, fn) => {
      const original = P[name];
      P[name] = function (...args) {
        if (this.canvas.id === 'circuit-bg') fn(this, args);
        return original.apply(this, args);
      };
    };
    wrap('clearRect', (ctx) => {
      frame = { width: ctx.canvas.width, strokes: [], segs: [], dots: [] };
      frames.push(frame);
      if (frames.length > 300) frames.shift();
    });
    wrap('beginPath', () => { path = []; });
    wrap('moveTo', (ctx, [x, y]) => path.push([x, y]));
    wrap('lineTo', (ctx, [x, y]) => path.push([x, y]));
    wrap('stroke', (ctx) => {
      if (!frame) return;
      frame.strokes.push(ctx.strokeStyle);
      if (path.length === 2) frame.segs.push([...path[0], ...path[1]]);
    });
    wrap('arc', (ctx, [x, y]) => { if (frame && ctx.shadowBlur === 10) frame.dots.push([x, y]); });
  });
}

// Recorded frames drawn at this canvas width (the newest ones).
const framesAt = (page, width) => page.evaluate((w) => window.__bgFrames.filter((f) => f.width === w), width);

// Average brightness of an "rgba(r, g, b, a)" string, 0 (black) to 255 (white).
function brightness(colour) {
  const [r, g, b] = (colour.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
  return (r + g + b) / 3;
}

async function gridColour(page) {
  const start = await page.evaluate(() => window.__bgFrames.length);
  await expect.poll(() => page.evaluate(() => window.__bgFrames.length), { timeout: 15_000 }).toBeGreaterThan(start + 5);
  return page.evaluate(() => window.__bgFrames.at(-2).strokes[0]);
}

test('the background grid follows the theme (D28)', async ({ page, errors }) => {
  await recordBackground(page);
  await openApp(page);

  const dark = await gridColour(page);
  expect(brightness(dark), `dark mode should draw dark grid lines, got ${dark}`).toBeLessThan(128);

  await page.locator('#theme-toggle').click();
  const light = await gridColour(page);
  expect(light, 'the grid colour changes with the theme').not.toBe(dark);
  expectNoErrors(errors);
});

test('after a window resize the dots move on the new grid (D29)', async ({ page, errors }) => {
  await page.setViewportSize({ width: 800, height: 600 });
  await recordBackground(page);
  await openApp(page);
  await expect.poll(async () => (await framesAt(page, 800)).length, { timeout: 15_000 }).toBeGreaterThan(10);

  await page.setViewportSize({ width: 1600, height: 1000 });
  await expect.poll(async () => (await framesAt(page, 1600)).length, { timeout: 20_000 }).toBeGreaterThan(40);

  // A dot is on the grid when it lies on one of the grid lines drawn in the same frame.
  const { total, off } = await page.evaluate(() => {
    const onLine = ([x, y], [x1, y1, x2, y2]) =>
      (Math.abs(x1 - x2) < 0.01 && Math.abs(x - x1) < 0.5 && y >= Math.min(y1, y2) - 0.5 && y <= Math.max(y1, y2) + 0.5) ||
      (Math.abs(y1 - y2) < 0.01 && Math.abs(y - y1) < 0.5 && x >= Math.min(x1, x2) - 0.5 && x <= Math.max(x1, x2) + 0.5);
    let total = 0;
    let off = 0;
    for (const f of window.__bgFrames.filter((f) => f.width === 1600).slice(-40)) {
      for (const dot of f.dots) {
        total++;
        if (!f.segs.some((seg) => onLine(dot, seg))) off++;
      }
    }
    return { total, off };
  });
  expect(total, 'dots are drawn').toBeGreaterThan(0);
  expect(off / total, `${off} of ${total} dots are off the drawn grid`).toBeLessThan(0.05);
  expectNoErrors(errors);
});
