/* ═══════════════════════════════════════════════════════════════════
   3D Viewer in the new layout (ADR 0002): B4–B7, C1 and canvas sizing.
═══════════════════════════════════════════════════════════════════ */

import { test, expect, openApp, goToView, expectNoErrors, modelSize, waitForStableModel } from './helpers.js';

// Canvas size vs. the area it should fill.
function canvasFit(page) {
  return page.evaluate(() => {
    const canvas = document.getElementById('viewer-canvas');
    const area = document.getElementById('viewer-canvas-area');
    if (!canvas || !area) return null;
    return { canvas: [canvas.clientWidth, canvas.clientHeight], area: [area.clientWidth, area.clientHeight] };
  });
}

async function expectCanvasFillsArea(page) {
  await expect
    .poll(async () => {
      const fit = await canvasFit(page);
      if (!fit) return 'no #viewer-canvas inside #viewer-canvas-area';
      const [cw, ch] = fit.canvas;
      const [aw, ah] = fit.area;
      return Math.abs(cw - aw) <= 2 && Math.abs(ch - ah) <= 2 && aw > 300 ? 'fits' : `canvas ${cw}x${ch}, area ${aw}x${ah}`;
    }, { message: 'the 3D canvas should fill its area' })
    .toBe('fits');
}

test('3D canvas fills its area', async ({ page, errors }) => {
  await openApp(page);
  await waitForStableModel(page);
  await expectCanvasFillsArea(page);
  expectNoErrors(errors);
});

test('3D canvas still fits after the window changes size on another screen', async ({ page, errors }) => {
  await openApp(page);
  await waitForStableModel(page);
  await goToView(page, 'simulator');
  await page.setViewportSize({ width: 1100, height: 700 });
  await goToView(page, 'viewer');
  await expectCanvasFillsArea(page);
  expectNoErrors(errors);
});

test('3D scene is not drawn while the Viewer is hidden (D5)', async ({ page, errors }) => {
  await openApp(page);
  await waitForStableModel(page);
  const frames = () => page.evaluate(() => window.ThreeViewer.getFrameCount());

  await goToView(page, 'simulator');
  const hidden = await frames();
  await page.waitForTimeout(1000);
  expect(await frames(), 'no frames drawn while on another screen').toBe(hidden);

  await goToView(page, 'viewer');
  await expect.poll(frames, { message: 'frames drawn again on the Viewer' }).toBeGreaterThan(hidden);
  expectNoErrors(errors);
});

test('sidebar shows the loaded part (B4)', async ({ page, errors }) => {
  await openApp(page);
  await expect(page.locator('#viewer-sidebar .viewer-comp-name')).toHaveText('ATmega328P');
  expectNoErrors(errors);
});

test('pin table lists every pin of the loaded part (B5)', async ({ page, errors }) => {
  await openApp(page);
  const pins = await page.evaluate(() => window.CircuitApp.getState().selectedComponent.pinout.length);
  await expect(page.locator('#pin-table-body .pin-row')).toHaveCount(pins);
  expectNoErrors(errors);
});

test('clicking a pin row shows its details (B6)', async ({ page, errors }) => {
  await openApp(page);
  const row = page.locator('#pin-table-body .pin-row').nth(3);
  const name = (await row.locator('.pin-name').textContent()).trim();
  await row.click();
  await expect(row).toHaveClass(/selected/);
  await expect(page.locator('#pin-detail-panel .pin-detail-name')).toHaveText(name);
  expectNoErrors(errors);
});

test('hovering a 3D pin shows its tooltip (B7)', async ({ page, errors }) => {
  await openApp(page);
  const tooltip = page.locator('#pin-tooltip');
  // The same event the 3D engine sends when the mouse is over a pin.
  const hover = (detail) => page.evaluate((d) => document.dispatchEvent(new CustomEvent('pin-hover', { detail: d })), detail);

  await hover({ pinNum: 1, screenX: 400, screenY: 300 });
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toContainText('Pin 1');
  await hover(null);
  await expect(tooltip).toBeHidden();
  expectNoErrors(errors);
});

test('view mode buttons switch wireframe (C1)', async ({ page, errors }) => {
  await openApp(page);
  await waitForStableModel(page);
  await page.locator('#btn-wire').click();
  expect(await page.evaluate(() => window.ThreeViewer.isWireframe())).toBe(true);
  await page.locator('#btn-solid').click();
  expect(await page.evaluate(() => window.ThreeViewer.isWireframe())).toBe(false);
  expectNoErrors(errors);
});

test('part switcher loads another part (C1)', async ({ page, errors }) => {
  await openApp(page);
  await waitForStableModel(page);
  const before = await modelSize(page);
  await page.locator('#viewer-sidebar select').selectOption('esp32-wroom');
  await expect.poll(() => page.evaluate(() => window.CircuitApp.getState().selectedComponent.id)).toBe('esp32-wroom');
  await waitForStableModel(page);
  expect(await modelSize(page), 'a different model should be shown').not.toEqual(before);
  await expect(page.locator('#viewer-sidebar .viewer-comp-name')).toHaveText('ESP32-WROOM-32');
  expectNoErrors(errors);
});
