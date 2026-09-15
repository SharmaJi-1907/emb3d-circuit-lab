/* ═══════════════════════════════════════════════════════════════════
   Circuit Simulator: layout (F3), controls (C2), multimeter (B9),
   circuit logic (D12, D19) and instruments (C7, D21).
   The screen keeps the index.html markup (ADR 0002). Parts are read
   through the read-only CircuitSimulator.getState().
═══════════════════════════════════════════════════════════════════ */

import fs from 'node:fs/promises';
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
  // A 1 kΩ resistor across the battery (the meter reads the wired circuit, D21)
  await loadCircuit(page, [['battery', 100, 100], ['resistor', 240, 100]], [[0, 0, 1, 0], [1, 1, 0, 1]]);
  await page.locator('#mm-mode').selectOption('resistance');
  await expect(page.locator('#multimeter-val')).toHaveText('1.00');
  await expect(page.locator('#multimeter-unit')).toHaveText('kΩ');
  expectNoErrors(errors);
});

/* ── Circuit logic (D12, D19) ─────────────────────────────────── */
// Build a circuit with the engine's loadCircuit() (the Export format).
// parts: [type, x, y]; wires: [part, pin, part, pin].
// Pins: battery 0 = +, 1 = −; LED 0 = anode, 1 = cathode.
function loadCircuit(page, parts, wires = []) {
  return page.evaluate(({ parts, wires }) => window.CircuitSimulator.loadCircuit({
    components: parts.map(([type, x, y]) => ({ type, x, y })),
    wires: wires.map(([a, na, b, nb]) => ({ from: { compId: a, nodeIdx: na }, to: { compId: b, nodeIdx: nb } })),
  }), { parts, wires });
}
const readings = async (page) => (await simState(page)).readings;
const ledOn = async (page) => (await readings(page)).find((r) => r.type === 'led').on;

// battery + → part 1 → part 2 → battery −
const LOOP = [[0, 0, 1, 0], [1, 1, 2, 0], [2, 1, 0, 1]];
const BATTERY_1K_LED = [['battery', 100, 100], ['resistor', 240, 100], ['led', 400, 100]];

test('an LED lights only in a closed loop back to the battery (D12)', async ({ page, errors }) => {
  await openSimulator(page);
  await loadCircuit(page, BATTERY_1K_LED, LOOP);
  expect(await ledOn(page), 'closed loop').toBe(true);
  await loadCircuit(page, [['battery', 100, 100], ['led', 300, 100]], [[0, 0, 1, 0]]);
  expect(await ledOn(page), 'only + wired, no way back to −').toBe(false);
  expectNoErrors(errors);
});

test('an LED conducts one way only, and a capacitor blocks DC (D12)', async ({ page, errors }) => {
  await openSimulator(page);
  await loadCircuit(page, BATTERY_1K_LED, [[0, 0, 1, 0], [1, 1, 2, 1], [2, 0, 0, 1]]);
  expect(await ledOn(page), 'LED reversed').toBe(false);
  await loadCircuit(page, [['battery', 100, 100], ['capacitor', 240, 100], ['led', 400, 100]], LOOP);
  expect(await ledOn(page), 'capacitor in series').toBe(false);
  expectNoErrors(errors);
});

test('currents follow Ohm\'s law and the multimeter shows them (D12)', async ({ page, errors }) => {
  await openSimulator(page);
  // 9 V − 2 V LED over 1 kΩ (+ 10 Ω LED, 0.5 Ω battery) = 6.93 mA through every part
  await loadCircuit(page, BATTERY_1K_LED, LOOP);
  for (const r of await readings(page)) expect(r.mA, `${r.type} current`).toBeCloseTo(6.93, 1);
  await page.locator('#mm-mode').selectOption('current');
  await expect(page.locator('#multimeter-val')).toHaveText('6.9');
  await expect(page.locator('#multimeter-unit')).toHaveText('mA');

  // Two 1 kΩ in series halve it
  await loadCircuit(page, [['battery', 100, 100], ['resistor', 240, 60], ['resistor', 240, 160], ['led', 400, 100]],
    [[0, 0, 1, 0], [1, 1, 2, 0], [2, 1, 3, 0], [3, 1, 0, 1]]);
  for (const r of await readings(page)) expect(r.mA, `${r.type} current`).toBeCloseTo(3.48, 1);
  expectNoErrors(errors);
});

// Guard: the switch worked before and must keep working with the new solver.
test('double-clicking a switch closes the loop', async ({ page, errors }) => {
  await openSimulator(page);
  await loadCircuit(page, [['battery', 100, 100], ['switch', 240, 100], ['led', 400, 100]], LOOP);
  expect(await ledOn(page), 'switch open').toBe(false);
  const board = await page.locator('#sim-canvas').boundingBox();
  await page.mouse.dblclick(board.x + 265, board.y + 112); // middle of the switch
  expect(await ledOn(page), 'switch closed').toBe(true);
  expectNoErrors(errors);
});

test('right-click deletes a part and all its wires (D19)', async ({ page, errors }) => {
  await openSimulator(page);
  await loadCircuit(page, BATTERY_1K_LED, LOOP);
  const board = await page.locator('#sim-canvas').boundingBox();
  await page.mouse.click(board.x + 420, board.y + 110, { button: 'right' }); // middle of the LED
  const s = await simState(page);
  expect(s.parts).toEqual(['battery', 'resistor']);
  expect(s.wires, 'only the battery–resistor wire is left').toBe(1);
  expectNoErrors(errors);
});

test('the status bar shows the number of nodes (C7)', async ({ page, errors }) => {
  await openSimulator(page);
  await loadCircuit(page, BATTERY_1K_LED, LOOP);
  await expect(page.locator('#sim-nodes')).toHaveText('Nodes: 3');
  await page.locator('#sim-clear').click();
  await expect(page.locator('#sim-nodes')).toHaveText('Nodes: 0');
  expectNoErrors(errors);
});

// Guard for the new loadCircuit(): Export, then load, gives back the same circuit.
test('an exported circuit loads back the same', async ({ page, errors }) => {
  await openSimulator(page);
  await loadCircuit(page, BATTERY_1K_LED, LOOP);
  const download = page.waitForEvent('download');
  await page.locator('#sim-export').click();
  const json = JSON.parse(await fs.readFile(await (await download).path(), 'utf8'));
  await page.locator('#sim-clear').click();
  await page.evaluate((data) => window.CircuitSimulator.loadCircuit(data), json);
  expect(await simState(page)).toMatchObject({ parts: ['battery', 'resistor', 'led'], wires: 3 });
  expect(await ledOn(page)).toBe(true);
  expectNoErrors(errors);
});

/* ── Instruments (C7, D21) ────────────────────────────────────── */
const scopeState = async (page) => (await simState(page)).scope;
// battery + → switch → 1 kΩ → LED → battery −
const SWITCHED_LED = [['battery', 100, 100], ['switch', 240, 100], ['resistor', 380, 100], ['led', 520, 100]];
const SWITCHED_LOOP = [[0, 0, 1, 0], [1, 1, 2, 0], [2, 1, 3, 0], [3, 1, 0, 1]];

test('the oscilloscope ON button turns the screen off and on (C7)', async ({ page, errors }) => {
  await openSimulator(page);
  const button = page.locator('#oscilloscope .instrument-toggle');
  await button.click();
  await expect(button).toHaveText('OFF');
  await expect(button).not.toHaveClass(/active/);
  expect((await scopeState(page)).on).toBe(false);
  await button.click();
  await expect(button).toHaveText('ON');
  await expect(button).toHaveClass(/active/);
  expect((await scopeState(page)).on).toBe(true);
  expectNoErrors(errors);
});

test('the V/div and T/div dials step through their values (C7)', async ({ page, errors }) => {
  await openSimulator(page);
  await expect(page.locator('#scope-volt-read')).toHaveText('2.0V');
  await page.locator('#dial-ch1-volt').click();
  await expect(page.locator('#scope-volt-read')).toHaveText('5.0V');
  expect((await scopeState(page)).voltsPerDiv).toBe(5);

  await page.locator('#dial-timebase').click();
  await page.locator('#dial-timebase').click();
  await expect(page.locator('#scope-time-read')).toHaveText('100 ms');
  expect((await scopeState(page)).msPerDiv).toBe(100);

  // After the last value a dial goes back to the first: 5 → 10 → 0.5 → 1
  for (let i = 0; i < 3; i++) await page.locator('#dial-ch1-volt').click();
  await expect(page.locator('#scope-volt-read')).toHaveText('1.0V');
  expectNoErrors(errors);
});

test('the oscilloscope shows the circuit\'s real voltages (D21)', async ({ page, errors }) => {
  await openSimulator(page);
  await loadCircuit(page, SWITCHED_LED, SWITCHED_LOOP);
  await page.locator('#sim-run').click();
  await expect.poll(async () => (await scopeState(page)).samples, { message: 'the scope should record while running' }).toBeGreaterThan(0);
  let s = await scopeState(page);
  expect(s.ch1, 'CH1 = battery voltage').toBeCloseTo(9, 1);
  expect(s.ch2, 'CH2 = LED voltage, switch open').toBeCloseTo(0, 1);

  const board = await page.locator('#sim-canvas').boundingBox();
  await page.mouse.dblclick(board.x + 265, board.y + 112); // close the switch
  s = await scopeState(page);
  expect(s.ch1, 'CH1 = battery voltage').toBeCloseTo(9, 1);
  expect(s.ch2, 'CH2 = LED voltage, switch closed').toBeCloseTo(2.07, 1);
  expectNoErrors(errors);
});

test('the oscilloscope screen draws at its real size', async ({ page, errors }) => {
  await openSimulator(page);
  const size = await page.locator('#osc-canvas').evaluate((c) => {
    const r = c.getBoundingClientRect();
    return { box: [r.width, r.height], buffer: [c.width, c.height] };
  });
  expect(Math.abs(size.buffer[0] - size.box[0]), `drawing ${size.buffer} vs screen ${size.box}`).toBeLessThan(1);
  expect(Math.abs(size.buffer[1] - size.box[1]), `drawing ${size.buffer} vs screen ${size.box}`).toBeLessThan(1);
  expectNoErrors(errors);
});

test('multimeter resistance measures the wired circuit, not every resistor (D21)', async ({ page, errors }) => {
  await openSimulator(page);
  await page.locator('#mm-mode').selectOption('resistance');
  // 1 kΩ across the battery, plus a loose 1 kΩ that isn't wired
  await loadCircuit(page, [['battery', 100, 100], ['resistor', 240, 100], ['resistor', 240, 300]], [[0, 0, 1, 0], [1, 1, 0, 1]]);
  await expect(page.locator('#multimeter-val')).toHaveText('1.00');
  await expect(page.locator('#multimeter-unit')).toHaveText('kΩ');
  // Nothing wired: no current flows, so the meter shows OL (open)
  await loadCircuit(page, [['resistor', 240, 300]]);
  await expect(page.locator('#multimeter-val')).toHaveText('OL');
  expectNoErrors(errors);
});
