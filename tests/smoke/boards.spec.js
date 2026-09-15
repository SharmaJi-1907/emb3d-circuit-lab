/* ═══════════════════════════════════════════════════════════════════
   Board Explorer: layout and styles (F4).
   The screen keeps the index.html markup (ADR 0002); its styles are in
   src/styles/views/boards.css.
═══════════════════════════════════════════════════════════════════ */

import { test, expect, openApp, goToView, expectNoErrors, styleOf } from './helpers.js';

const TRANSPARENT = 'rgba(0, 0, 0, 0)';
const BROWSER_GREY = 'rgb(239, 239, 239)';

async function openBoards(page) {
  await openApp(page);
  await goToView(page, 'boards');
}

// The board canvas: its box on screen and its drawing size.
const boardCanvas = (page) => page.locator('#board-canvas').evaluate((c) => {
  const r = c.getBoundingClientRect();
  return { box: [r.width, r.height], buffer: [c.width, c.height] };
});

test('the board sits beside the info panel and the screen fits (F4)', async ({ page, errors }) => {
  await openBoards(page);
  const board = await page.locator('#board-canvas').boundingBox();
  const info = await page.locator('.board-info-panel').boundingBox();
  expect(board.width, 'board width').toBeGreaterThanOrEqual(600);
  expect(board.height, 'board height (the drawing is 280 px tall)').toBeGreaterThanOrEqual(400);
  expect(info.x, 'info panel is right of the board').toBeGreaterThanOrEqual(board.x + board.width);
  const scrolls = await page.locator('#view-boards').evaluate((v) => v.scrollHeight > v.clientHeight);
  expect(scrolls, 'the screen should fit without scrolling').toBe(false);
  expectNoErrors(errors);
});

test('the board draws at its real size and does not grow when filters are clicked (F4)', async ({ page, errors }) => {
  await openBoards(page);
  const first = await boardCanvas(page);
  expect(Math.abs(first.buffer[0] - first.box[0]), `drawing ${first.buffer} vs screen ${first.box}`).toBeLessThan(1);
  expect(Math.abs(first.buffer[1] - first.box[1]), `drawing ${first.buffer} vs screen ${first.box}`).toBeLessThan(1);

  for (const filter of ['power', 'digital', 'analog', 'all']) {
    await page.locator(`.pin-filter-btn[data-filter="${filter}"]`).click();
  }
  const after = await boardCanvas(page);
  expect(after.box, 'the board keeps its size').toEqual(first.box);
  expectNoErrors(errors);
});

test('tabs, filters, zoom buttons, specs and the pin list are styled (F4)', async ({ page, errors }) => {
  await openBoards(page);
  for (const sel of ['.board-tab:not(.active)', '.pin-filter-btn:not(.active)', '#board-zoom-in']) {
    expect(await page.locator(sel).first().getAttribute('style'), `${sel} has no inline style`).toBeNull();
    const s = await styleOf(page, sel, ['backgroundColor', 'borderTopWidth']);
    expect(s.backgroundColor, `${sel} should not be browser grey`).not.toBe(BROWSER_GREY);
    expect(s.borderTopWidth, `${sel} border`).toBe('1px');
  }

  const active = await styleOf(page, '.board-tab.active', ['backgroundColor']);
  const resting = await styleOf(page, '.board-tab:not(.active)', ['backgroundColor']);
  expect(active.backgroundColor, 'the active tab stands out').not.toBe(resting.backgroundColor);
  expect(active.backgroundColor).not.toBe(TRANSPARENT);

  expect(await styleOf(page, '#board-specs-grid', ['display'])).toEqual({ display: 'grid' });
  expect(await styleOf(page, '.board-pin-item', ['display', 'cursor'])).toEqual({ display: 'flex', cursor: 'pointer' });
  expectNoErrors(errors);
});
