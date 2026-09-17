/* ═══════════════════════════════════════════════════════════════════
   3D models: the right shape per part (D8), the part's name printed on
   the chip (D11), old models freed instead of leaking (D16), and the
   resistor, capacitor and LED with their own models (#23b).
═══════════════════════════════════════════════════════════════════ */

import { test, expect, openApp, openViewer, waitForViewer, goToView, waitForStableModel, expectNoErrors } from './helpers.js';

const memory = (page) => page.evaluate(() => window.ThreeViewer.getMemoryInfo());
const modelInfo = (page) => page.evaluate(() => window.ThreeViewer.getModelInfo());

// Load a part straight through the engine and wait until the engine reports it.
// The model is built in one go, so there is no need to wait for the grow-in
// animation here — waiting for it on every part ran the test out of time.
async function loadPart(page, id) {
  await page.evaluate((c) => window.ThreeViewer.loadComponent(c), id);
  await expect
    .poll(async () => (await modelInfo(page))?.component, { message: `${id} should load` })
    .toBe(id);
}

test('every part gets a model with its own pin count (D8)', async ({ page, errors }) => {
  // Deliberately NOT on the Viewer screen: the engine still builds models, but
  // the scene is not drawn while hidden (D5), so loading all of them stays cheap.
  await openApp(page);
  await waitForViewer(page);
  const parts = await page.evaluate(() =>
    window.CircuitLabData.components.map((c) => ({ id: c.id, pins: c.pins, name: c.name })));
  expect(parts.length, 'the library has parts').toBeGreaterThan(5);

  const wrong = [];
  for (const part of parts) {
    await loadPart(page, part.id);
    const info = await modelInfo(page);
    if (info.pins !== part.pins) wrong.push(`${part.id} (${part.name}): model drew ${info.pins} pins, the part has ${part.pins}`);
  }
  expect(wrong, 'each model should have as many pins as the real part').toEqual([]);
  expectNoErrors(errors);
});

test('the resistor, capacitor and LED use their own models with 2 pins (#23b)', async ({ page, errors }) => {
  await openApp(page);
  await waitForViewer(page);
  // Real parts, each checked against its datasheet (sources in src/data/components.js).
  for (const id of ['cfr-25', 'eca-1em101', 'wp7113id']) {
    await loadPart(page, id);
    const info = await modelInfo(page);
    expect(info.pins, `${id}: both leads can be hovered and highlighted`).toBe(2);
    // The generic fallback is a labelled chip; the real passive models carry no label.
    expect(info.hasLabel, `${id}: drawn by its own model, not the generic chip`).toBe(false);
  }
  expectNoErrors(errors);
});

test('the 3D loader has no cases for parts that do not exist (D8)', async ({ page }) => {
  const missing = await page.request.get('/src/engines/three-viewer/index.js');
  const src = await missing.text();
  for (const ghost of ['nrf52840', 'bme280']) {
    expect(src, `${ghost} is not in the component data, so it should not have a case`).not.toContain(ghost);
  }
});

test('the chip has its name printed on it (D11)', async ({ page, errors }) => {
  await openApp(page);
  await waitForViewer(page);
  for (const id of ['atmega328p', 'ne555', 'stm32f103']) {
    await loadPart(page, id);
    const info = await modelInfo(page);
    expect(info.hasLabel, `${id} should show its name on the chip`).toBe(true);
  }
  expectNoErrors(errors);
});

test('visiting the Viewer again does not leak graphics memory (D16)', async ({ page, errors }) => {
  // It rebuilds the 3D model 5 times in software WebGL: ~17 s alone, and it
  // passed the 30 s limit once in 676 runs under full --repeat-each=4 load (E17).
  test.slow();
  await openViewer(page);
  const first = await memory(page);
  expect(first.geometries, 'a model was built').toBeGreaterThan(10);

  for (let i = 0; i < 4; i++) {
    await goToView(page, 'dashboard');
    await goToView(page, 'viewer');
    // Wait for the rebuilt model, not for its grow-in animation: this test
    // counts memory, and waiting for the animation 5 times ran out of time.
    await expect.poll(async () => (await modelInfo(page))?.pins ?? 0, { message: 'the model is rebuilt' })
      .toBeGreaterThan(0);
  }

  const after = await memory(page);
  expect(after.geometries,
    `5 visits should not pile up models (1 visit: ${first.geometries}, 5 visits: ${after.geometries})`)
    .toBeLessThan(first.geometries * 1.5);
  expectNoErrors(errors);
});

test('switching parts frees the model that was showing (D16)', async ({ page, errors }) => {
  // This one does need the Viewer on screen: the GPU memory counters only fill
  // in once the renderer has actually drawn the model.
  await openViewer(page);
  const first = await memory(page);
  expect(first.geometries, 'a model was drawn').toBeGreaterThan(10);

  for (const id of ['ne555', 'stm32f103', 'mpu6050', 'hc-sr04', 'esp32-wroom', 'atmega328p']) {
    await loadPart(page, id);
  }

  const after = await memory(page);
  expect(after.geometries,
    `6 parts should not pile up (start: ${first.geometries}, after: ${after.geometries})`)
    .toBeLessThan(first.geometries * 2);
  expectNoErrors(errors);
});

test('the model still works after all that switching (D16)', async ({ page, errors }) => {
  await openApp(page);
  await goToView(page, 'viewer');
  await waitForStableModel(page);
  for (const id of ['ne555', 'atmega328p']) await loadPart(page, id);

  const info = await modelInfo(page);
  expect(info.component, 'the last part loaded is the one showing').toBe('atmega328p');
  expect(info.pins, 'its pins are still there').toBe(28);
  await expect(page.locator('#pin-table-body .pin-row')).toHaveCount(28);
  expectNoErrors(errors);
});
