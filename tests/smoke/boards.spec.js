/* ═══════════════════════════════════════════════════════════════════
   Board Explorer: layout and styles (F4), and behaviour (D22, D23, D25).
   The screen keeps the index.html markup (ADR 0002); its styles are in
   src/styles/views/boards.css.
═══════════════════════════════════════════════════════════════════ */

import { test, expect, openApp, goToView, expectNoErrors, styleOf, waitForStableModel } from './helpers.js';

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

/* ── Behaviour (D22, D23, D25) ────────────────────────────────── */
// Click a pin on the board drawing. Pins sit at (x, y) fractions of a
// 460 × 280 board drawn in the middle of the canvas (zoom 1, no panning).
async function clickBoardPin(page, index) {
  const pin = await page.evaluate((i) => {
    const canvas = document.getElementById('board-canvas');
    const box = canvas.getBoundingClientRect();
    const board = window.CircuitLabData.boards[window.CircuitApp.getState().selectedBoard];
    const p = board.pins[i];
    return { x: box.left + canvas.width / 2 - 230 + p.x * 460, y: box.top + canvas.height / 2 - 140 + p.y * 280, num: p.num, name: p.name };
  }, index);
  await page.mouse.move(pin.x, pin.y); // sets the hovered pin
  await page.mouse.click(pin.x, pin.y);
  return pin;
}

test('visiting the Board Explorer again does not repeat pin clicks (D22)', async ({ page, errors }) => {
  await openBoards(page);
  for (const view of ['dashboard', 'boards', 'dashboard', 'boards']) await goToView(page, view);
  const toasts = page.locator('.toast');
  const before = await toasts.count();
  await clickBoardPin(page, 2);
  expect(await toasts.count(), 'one click shows one toast').toBe(before + 1);
  expectNoErrors(errors);
});

test('the board redraws at its new size when the window changes size (D22)', async ({ page, errors }) => {
  await openBoards(page);
  await page.setViewportSize({ width: 1100, height: 650 });
  await expect.poll(async () => {
    const { box, buffer } = await boardCanvas(page);
    return box[0] < 800 && Math.abs(buffer[0] - box[0]) < 1 && Math.abs(buffer[1] - box[1]) < 1;
  }, { message: 'drawing size should follow the smaller board' }).toBe(true);
  expectNoErrors(errors);
});

test('a clicked pin is highlighted in the pin list (D23)', async ({ page, errors }) => {
  await openBoards(page);
  const pin = await clickBoardPin(page, 4);
  const selected = page.locator('.board-pin-item.selected');
  await expect(selected).toHaveCount(1);
  await expect(selected).toContainText(pin.name);
  expectNoErrors(errors);
});

test('board pins and 3D Viewer pins are separate, and a new board starts with no pin (D25)', async ({ page, errors }) => {
  await openBoards(page);
  await clickBoardPin(page, 4);

  await page.locator('.board-tab[data-board="esp32"]').click();
  await expect(page.locator('.board-pin-item.selected'), 'no pin is selected on the new board').toHaveCount(0);

  await goToView(page, 'viewer');
  await waitForStableModel(page);
  await expect(page.locator('#pin-table-body .pin-row.selected'), 'the 3D Viewer has no pin selected').toHaveCount(0);
  expectNoErrors(errors);
});
