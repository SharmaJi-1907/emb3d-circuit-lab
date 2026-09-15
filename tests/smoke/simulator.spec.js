/* ═══════════════════════════════════════════════════════════════════
   Circuit Simulator: layout (F3), controls (C2) and multimeter (B9).
   The screen keeps the index.html markup (ADR 0002). Parts are read
   through the read-only CircuitSimulator.getState().
═══════════════════════════════════════════════════════════════════ */

import { test, expect, openApp, goToView, expectNoErrors, styleOf } from './helpers.js';

const TRANSPARENT = 'rgba(0, 0, 0, 0)';
const BROWSER_GREY = 'rgb(239, 239, 239)';

const simState = (page) => page.evaluate(() => window.CircuitSimulator.getState());
const parts = async (page) => (await simState(page)).parts;
const disabled = (page) => page.evaluate(() => Object.fromEntries(['sim-run', 'sim-pause', 'sim-stop'].map((id) => [id, document.getElementById(id).disabled])));
const lastToast = (page) => page.locator('.toast').last();

// Open the Simulator and wait until its engine has set up the board.
async function openSimulator(page) {
  await openApp(page);
  await goToView(page, 'simulator');
  await expect.poll(async () => (await simState(page)).ready, { message: 'the simulator engine should start' }).toBe(true);
}

// Size of the board: its box on screen and its drawing buffer.
const boardSize = (page) => page.locator('#sim-canvas').evaluate((c) => {
  const r = c.getBoundingClientRect();
  return { box: [Math.round(r.width), Math.round(r.height)], buffer: [c.width, c.height] };
});

/* ── Layout (F3) ──────────────────────────────────────────────── */
test('the board fills the middle, between the palette and the instruments (F3)', async ({ page, errors }) => {
  await openSimulator(page);
  const box = (sel) => page.locator(sel).boundingBox();
  const [palette, board, instruments] = [await box('.sim-palette'), await box('#sim-canvas'), await box('.instruments-panel')];
  expect(board.width, 'board width').toBeGreaterThanOrEqual(600);
  expect(board.height, 'board height').toBeGreaterThanOrEqual(400);
  expect(board.x, 'board is right of the palette').toBeGreaterThanOrEqual(palette.x + palette.width);
  expect(instruments.x, 'instruments are right of the board').toBeGreaterThanOrEqual(board.x + board.width);
  const scrolls = await page.locator('#view-simulator').evaluate((v) => v.scrollHeight > v.clientHeight);
  expect(scrolls, 'the screen should fit without scrolling').toBe(false);
  expectNoErrors(errors);
});

test('the board draws at its real size, also after the window changes size (F3)', async ({ page, errors }) => {
  await openSimulator(page);
  const first = await boardSize(page);
  expect(first.buffer, 'drawing size = size on screen').toEqual(first.box);

  await page.setViewportSize({ width: 1100, height: 650 });
  await expect.poll(async () => {
    const now = await boardSize(page);
    return now.box[0] < first.box[0] && now.buffer.join('x') === now.box.join('x');
  }, { message: 'after the window shrinks, the drawing size should match the smaller board' }).toBe(true);
  expectNoErrors(errors);
});

test('toolbar, palette and board are styled (F3)', async ({ page, errors }) => {
  await openSimulator(page);
  for (const id of ['#sim-run', '#sim-clear']) {
    expect(await page.locator(id).getAttribute('style')).toBeNull();
    const s = await styleOf(page, id, ['backgroundColor', 'borderTopWidth']);
    expect(s.backgroundColor, `${id} should not be browser grey`).not.toBe(BROWSER_GREY);
    expect(s.borderTopWidth).toBe('1px');
  }
  const item = await styleOf(page, '#ws-add-resistor', ['backgroundColor']);
  expect(item.backgroundColor, 'palette items are not browser grey').not.toBe(BROWSER_GREY);
  const board = await styleOf(page, '.sim-canvas-area', ['backgroundColor']);
  expect(board.backgroundColor, 'the board has a solid background').not.toBe(TRANSPARENT);
  expectNoErrors(errors);
});

/* ── Palette (C2) ─────────────────────────────────────────────── */
test('palette buttons add a battery, resistor, capacitor and LED (C2)', async ({ page, errors }) => {
  await openSimulator(page);
  for (const type of ['battery', 'resistor', 'capacitor', 'led']) {
    await page.locator(`#view-simulator .palette-item[data-component="${type}"]`).click();
  }
  expect(await parts(page)).toEqual(['battery', 'resistor', 'capacitor', 'led']);
  expectNoErrors(errors);
});

test('Wire and NE555 explain themselves and add nothing (C2)', async ({ page, errors }) => {
  await openSimulator(page);
  await page.locator('#ws-add-wire').click();
  await expect(lastToast(page)).toContainText('drag from one pin to another');
  await page.locator('#ws-add-ic').click();
  await expect(lastToast(page)).toContainText("isn't available in the simulator yet");
  expect(await parts(page)).toEqual([]);
  expectNoErrors(errors);
});

test('dragging a palette item onto the board adds it (C2)', async ({ page, errors }) => {
  await openSimulator(page);
  await page.locator('#ws-add-led').dragTo(page.locator('#sim-canvas'));
  await expect.poll(() => parts(page)).toEqual(['led']);
  expectNoErrors(errors);
});

/* ── Toolbar (C2) ─────────────────────────────────────────────── */
test('Run, Pause and Stop control the simulation and the status bar (C2)', async ({ page, errors }) => {
  await openSimulator(page);
  expect(await disabled(page)).toEqual({ 'sim-run': false, 'sim-pause': true, 'sim-stop': true });

  await page.locator('#sim-run').click();
  await expect.poll(async () => (await simState(page)).time, { message: 'time should run' }).toBeGreaterThan(0);
  expect((await simState(page)).running).toBe(true);
  expect(await disabled(page)).toEqual({ 'sim-run': true, 'sim-pause': false, 'sim-stop': false });
  await expect(page.locator('#sim-status-text')).toHaveText('Running');
  await expect(page.locator('#sim-indicator')).toHaveClass(/running/);
  await expect(page.locator('#sim-time')).not.toHaveText('t = 0.000s');

  await page.locator('#sim-pause').click();
  const paused = await simState(page);
  expect(paused.running).toBe(false);
  expect(paused.time, 'pause keeps the time').toBeGreaterThan(0);
  expect(await disabled(page)).toEqual({ 'sim-run': false, 'sim-pause': true, 'sim-stop': false });
  await expect(page.locator('#sim-status-text')).toHaveText('Paused');

  await page.locator('#sim-stop').click();
  expect(await simState(page)).toMatchObject({ running: false, time: 0 });
  expect(await disabled(page)).toEqual({ 'sim-run': false, 'sim-pause': true, 'sim-stop': true });
  await expect(page.locator('#sim-status-text')).toHaveText('Ready');
  await expect(page.locator('#sim-time')).toHaveText('t = 0.000s');
  expectNoErrors(errors);
});

test('the speed slider sets the simulation speed (C2)', async ({ page, errors }) => {
  await openSimulator(page);
  await page.locator('#sim-speed').fill('5');
  expect((await simState(page)).speed).toBe(5);
  await expect(page.locator('#sim-speed-val')).toHaveText('5x');
  expectNoErrors(errors);
});

test('Clear, Export and Upload Code do something visible (C2)', async ({ page, errors }) => {
  await openSimulator(page);
  await page.locator('#ws-add-resistor').click();
  expect(await parts(page)).toEqual(['resistor']);

  const download = page.waitForEvent('download');
  await page.locator('#sim-export').click();
  expect((await download).suggestedFilename()).toBe('circuit.json');

  await page.locator('#sim-upload-code').click();
  await expect(lastToast(page)).toContainText("isn't available yet");

  await page.locator('#sim-clear').click();
  expect(await parts(page)).toEqual([]);
  expectNoErrors(errors);
});

/* ── Multimeter (B9) ──────────────────────────────────────────── */
test('the multimeter shows readings (B9)', async ({ page, errors }) => {
  await openSimulator(page);
  await page.locator('#ws-add-resistor').click();
  await page.locator('#mm-mode').selectOption('resistance');
  await expect(page.locator('#multimeter-val')).toHaveText('1.00');
  await expect(page.locator('#multimeter-unit')).toHaveText('kΩ');
  expectNoErrors(errors);
});
