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
  await clickBoardPin(page, 2);
  // Count only the toast this click makes. Every toast deletes itself after
  // 3.3 s, so counting all toasts before and after the click is racy: under
  // load the welcome toast can go as this one arrives (E13). Repeated
  // handlers (D22) show this same message once per visit, so the count is
  // never 1 (measured: 3 visits → 3 toasts) and this still fails.
  const mine = page.locator('.toast').filter({ hasText: 'Inspecting Pin' });
  await expect(mine, 'one click shows one toast').toHaveCount(1);
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

/* ── Board data (D24) ─────────────────────────────────────────── */
// Each tab and a word its board's name must contain.
const TABS = {
  'Arduino Uno': 'Arduino Uno',
  'Arduino Mega': 'Arduino Mega',
  ESP32: 'ESP32',
  ESP8266: 'ESP8266',
  'Raspberry Pi 4': 'Raspberry Pi 4',
  'RPi Pico': 'Raspberry Pi Pico',
  'STM32 Nucleo': 'Nucleo',
  'STM32 Blue Pill': 'Blue Pill',
};

test('every board tab shows its own board (D24)', async ({ page, errors }) => {
  await openBoards(page);
  await expect(page.locator('.board-tab')).toHaveCount(Object.keys(TABS).length);
  const shown = [];
  for (const [tab, word] of Object.entries(TABS)) {
    await page.locator('.board-tab').filter({ hasText: new RegExp(`^${tab}$`) }).click();
    await expect(page.locator('#board-name'), `the "${tab}" tab`).toContainText(word);
    shown.push(await page.locator('#board-name').textContent());
  }
  expect(new Set(shown).size, 'every tab shows a different board').toBe(shown.length);

  await goToView(page, 'dashboard');
  const stat = page.locator('#view-dashboard .stat-card').filter({ hasText: 'Dev Boards' });
  await expect(stat.locator('.stat-value')).toHaveText(String(Object.keys(TABS).length));
  expectNoErrors(errors);
});

test('every board\'s pin data is well-formed', async ({ page, errors }) => {
  await openApp(page);
  const problems = await page.evaluate(() => {
    const TYPES = ['power', 'ground', 'digital', 'analog', 'pwm', 'uart', 'spi', 'i2c', 'can', 'usb'];
    const found = [];
    for (const [key, board] of Object.entries(window.CircuitLabData.boards)) {
      const nums = new Set();
      board.pins.forEach((p, i) => {
        if (nums.has(p.num)) found.push(`${key}: pin number ${p.num} is used twice`);
        nums.add(p.num);
        if (!TYPES.includes(p.type)) found.push(`${key} ${p.name}: unknown type "${p.type}"`);
        if (!(p.x > 0 && p.x < 1 && p.y > 0 && p.y < 1)) found.push(`${key} ${p.name}: outside the board`);
        // Pads are 11 px wide on the 460 × 280 px drawing
        board.pins.slice(i + 1).forEach((q) => {
          if (Math.hypot((p.x - q.x) * 460, (p.y - q.y) * 280) < 11) found.push(`${key}: ${p.name} and ${q.name} overlap`);
        });
      });
    }
    return found;
  });
  expect(problems).toEqual([]);
  expectNoErrors(errors);
});

test('key pins match the official pinouts (D24)', async ({ page, errors }) => {
  await openApp(page);
  // [board, pin name, type] from the official pinouts (sources in src/data/data.js)
  const expected = [
    ['arduino-mega', 'D0/RX0', 'uart'], ['arduino-mega', 'D14/TX3', 'uart'], ['arduino-mega', 'D19/RX1', 'uart'],
    ['arduino-mega', 'D20/SDA', 'i2c'], ['arduino-mega', 'D21/SCL', 'i2c'], ['arduino-mega', 'D13~', 'pwm'],
    ['arduino-mega', 'D44~', 'pwm'], ['arduino-mega', 'D50/MISO', 'spi'], ['arduino-mega', 'D53/SS', 'spi'],
    ['arduino-mega', 'A15', 'analog'],
    ['esp8266-nodemcu', 'D0/GPIO16', 'digital'], ['esp8266-nodemcu', 'D1/GPIO5 SCL', 'i2c'],
    ['esp8266-nodemcu', 'D2/GPIO4 SDA', 'i2c'], ['esp8266-nodemcu', 'D5/GPIO14 SCK', 'spi'],
    ['esp8266-nodemcu', 'D9/GPIO3 RX', 'uart'], ['esp8266-nodemcu', 'A0', 'analog'],
    ['rpi-pico', 'GP0', 'uart'], ['rpi-pico', 'GP4', 'i2c'], ['rpi-pico', 'GP18', 'spi'],
    ['rpi-pico', 'GP26/ADC0', 'analog'], ['rpi-pico', 'GP28/ADC2', 'analog'], ['rpi-pico', 'RUN', 'digital'],
    ['nucleo-f401re', 'PA5/D13', 'spi'], ['nucleo-f401re', 'PB8/D15', 'i2c'], ['nucleo-f401re', 'PB9/D14', 'i2c'],
    ['nucleo-f401re', 'PA3/D0', 'uart'], ['nucleo-f401re', 'PA0/A0', 'analog'], ['nucleo-f401re', 'PC13', 'digital'],
  ];
  const result = await page.evaluate((list) => {
    const boards = window.CircuitLabData.boards;
    const pins = (key) => boards[key]?.pins ?? [];
    const count = (key, re) => pins(key).filter((p) => re.test(p.name)).length;
    const pico = Object.fromEntries(pins('rpi-pico').map((p) => [p.num, p]));
    return {
      types: Object.fromEntries(list.map(([key, name]) => [`${key} ${name}`, pins(key).find((p) => p.name === name)?.type ?? 'missing'])),
      megaDigital: count('arduino-mega', /^D\d+/),
      megaAnalog: count('arduino-mega', /^A\d+$/),
      nucleoGpio: count('nucleo-f401re', /^P[A-H]\d+/),
      picoPins: pins('rpi-pico').length,
      picoNamed: [1, 30, 36, 40].map((n) => pico[n]?.name ?? 'missing'),
      picoLeftSide: pins('rpi-pico').filter((p) => (p.num <= 20) === (p.x < 0.5)).length,
    };
  }, expected);

  expect(result.types).toEqual(Object.fromEntries(expected.map(([key, name, type]) => [`${key} ${name}`, type])));
  expect(result.megaDigital, 'Mega: D0–D53').toBe(54);
  expect(result.megaAnalog, 'Mega: A0–A15').toBe(16);
  expect(result.nucleoGpio, 'Nucleo-F401RE: GPIO pins on the morpho headers').toBe(50);
  expect(result.picoPins, 'Pico: 40 pins').toBe(40);
  expect(result.picoNamed, 'Pico pins 1, 30, 36, 40').toEqual(['GP0', 'RUN', '3V3(OUT)', 'VBUS']);
  expect(result.picoLeftSide, 'Pico: pins 1–20 on the left, 21–40 on the right').toBe(40);
  expectNoErrors(errors);
});
