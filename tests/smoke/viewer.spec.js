/* ═══════════════════════════════════════════════════════════════════
   3D Viewer in the new layout (ADR 0002): B4–B7, C1 and canvas sizing.
═══════════════════════════════════════════════════════════════════ */

import { test, expect, openViewer, goToView, expectNoErrors, modelSize, waitForStableModel } from './helpers.js';

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
  await openViewer(page);
  await expectCanvasFillsArea(page);
  expectNoErrors(errors);
});

test('3D canvas still fits after the window changes size on another screen', async ({ page, errors }) => {
  await openViewer(page);
  await goToView(page, 'simulator');
  await page.setViewportSize({ width: 1100, height: 700 });
  await goToView(page, 'viewer');
  await expectCanvasFillsArea(page);
  expectNoErrors(errors);
});

test('3D scene is not drawn while the Viewer is hidden (D5)', async ({ page, errors }) => {
  await openViewer(page);
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
  await openViewer(page);
  await expect(page.locator('#viewer-sidebar .viewer-comp-name')).toHaveText('ATmega328P');
  expectNoErrors(errors);
});

test('pin table lists every pin of the loaded part (B5)', async ({ page, errors }) => {
  await openViewer(page);
  const pins = await page.evaluate(() => window.CircuitApp.getState().selectedComponent.pinout.length);
  await expect(page.locator('#pin-table-body .pin-row')).toHaveCount(pins);
  expectNoErrors(errors);
});

test('clicking a pin row shows its details (B6)', async ({ page, errors }) => {
  await openViewer(page);
  const row = page.locator('#pin-table-body .pin-row').nth(3);
  const name = (await row.locator('.pin-name').textContent()).trim();
  await row.click();
  await expect(row).toHaveClass(/selected/);
  await expect(page.locator('#pin-detail-panel .pin-detail-name')).toHaveText(name);
  expectNoErrors(errors);
});

test('hovering a 3D pin shows its tooltip (B7)', async ({ page, errors }) => {
  await openViewer(page);
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
  await openViewer(page);
  await page.locator('#btn-wire').click();
  expect(await page.evaluate(() => window.ThreeViewer.isWireframe())).toBe(true);
  await page.locator('#btn-solid').click();
  expect(await page.evaluate(() => window.ThreeViewer.isWireframe())).toBe(false);
  expectNoErrors(errors);
});

test('part switcher loads another part (C1)', async ({ page, errors }) => {
  await openViewer(page);
  const before = await modelSize(page);
  await page.locator('#viewer-sidebar select').selectOption('esp32-wroom');
  await expect.poll(() => page.evaluate(() => window.CircuitApp.getState().selectedComponent.id)).toBe('esp32-wroom');
  await waitForStableModel(page);
  expect(await modelSize(page), 'a different model should be shown').not.toEqual(before);
  await expect(page.locator('#viewer-sidebar .viewer-comp-name')).toHaveText('ESP32-WROOM-32');
  expectNoErrors(errors);
});

/* ── Final clean-up (D32–D35, D40, D42) ───────────────────────── */
const viewModeButtons = (page) => page.locator('#viewer-sidebar .btn-ctrl[id^="btn-"]').evaluateAll(
  (btns) => btns.filter((b) => b.classList.contains('active')).map((b) => b.id));

test('the Wire button is marked active, and the camera buttons are left alone (D32)', async ({ page, errors }) => {
  await openViewer(page);
  await page.locator('#btn-wire').click();
  expect(await viewModeButtons(page), 'only Wire is marked').toEqual(['btn-wire']);
  await page.locator('#btn-explode').click();
  expect(await viewModeButtons(page)).toEqual(['btn-explode']);
  await page.locator('#btn-solid').click();
  expect(await viewModeButtons(page)).toEqual(['btn-solid']);
  expectNoErrors(errors);
});

test('the controls still match the 3D engine after switching part or screen (D32)', async ({ page, errors }) => {
  await openViewer(page);
  await page.locator('#btn-wire').click();
  await page.locator('#viewer-sidebar .toggle-switch').click();
  expect(await page.evaluate(() => window.ThreeViewer.isAutoRotating())).toBe(false);

  await goToView(page, 'dashboard');
  await goToView(page, 'viewer');
  expect(await viewModeButtons(page), 'Wire is still marked after coming back').toEqual(['btn-wire']);
  await expect(page.locator('#viewer-sidebar .toggle-switch input'), 'Auto Rotate is still off').not.toBeChecked();

  await page.locator('#viewer-sidebar select').selectOption('ne555');
  await expect.poll(() => page.evaluate(() => window.ThreeViewer.getModelInfo()?.component)).toBe('ne555');
  const info = await page.evaluate(() => window.ThreeViewer.getModelInfo());
  expect(info.wireframe, 'the new part is drawn in wireframe too').toBe(true);
  expect(await viewModeButtons(page)).toEqual(['btn-wire']);
  expectNoErrors(errors);
});

test('switching part clears the old pin details (D33)', async ({ page, errors }) => {
  await openViewer(page);
  await page.locator('#pin-table-body .pin-row').nth(4).click();
  await expect(page.locator('#pin-detail-panel .pin-detail-name')).toBeVisible();

  await page.locator('#viewer-sidebar select').selectOption('ne555');
  await expect(page.locator('#viewer-sidebar .viewer-comp-name')).toHaveText('NE555');
  await expect(page.locator('#pin-detail-panel .pin-detail-name'), 'no details of the old part').toHaveCount(0);
  await expect(page.locator('#pin-table-body .pin-row.selected'), 'no pin of the new part is selected').toHaveCount(0);
  expect(await page.evaluate(() => window.CircuitApp.getState().selectedPin)).toBeNull();
  expectNoErrors(errors);
});

test('a pin highlighted twice goes back to normal afterwards (D34)', async ({ page, errors }) => {
  await openViewer(page);
  const highlighted = () => page.evaluate(() => window.ThreeViewer.getModelInfo().highlighted);
  const rows = page.locator('#pin-table-body .pin-row');
  await rows.nth(0).hover();   // highlights pin 1
  await rows.nth(0).click();   // highlights pin 1 again
  expect(await highlighted()).toEqual([1]);
  await rows.nth(1).hover();   // highlights pin 2, pin 1 goes back
  expect(await highlighted(), 'pin 1 must not stay cyan').toEqual([2]);
  expectNoErrors(errors);
});

test('the 3D canvas follows the sidebar being hidden (D35)', async ({ page, errors }) => {
  await openViewer(page);
  const before = await canvasFit(page);
  await page.locator('#sidebar-toggle').click();
  await expect.poll(async () => {
    const fit = await canvasFit(page);
    const buffer = await page.locator('#viewer-canvas').evaluate((c) => c.width / window.devicePixelRatio);
    return fit.area[0] !== before.area[0] && Math.abs(buffer - fit.area[0]) <= 1;
  }, { message: 'the drawing size follows the wider area' }).toBe(true);
  expectNoErrors(errors);
});

test('a part with no pin list shows one message across the whole table (D40)', async ({ page, errors }) => {
  await openViewer(page);
  await page.evaluate(() => {
    window.CircuitLabData.components.find((c) => c.id === 'ne555').pinout = [];
    window.CircuitApp.selectComponent('ne555');
  });
  const columns = await page.locator('#viewer-pin-panel thead th').count();
  await expect(page.locator('#pin-table-body .no-pinout')).toHaveAttribute('colspan', String(columns));
  expectNoErrors(errors);
});

test('the model turns at the same speed whatever the frame rate (D42)', async ({ page, errors }) => {
  await openViewer(page);
  // Turn per real second, measured inside the page. Software WebGL in headless
  // Chrome draws far fewer than 60 frames per second.
  const rate = await page.evaluate(async () => {
    const v = window.ThreeViewer;
    const t0 = v.getCamera().theta;
    const f0 = v.getFrameCount();
    const p0 = performance.now();
    await new Promise((r) => setTimeout(r, 2000));
    const s = (performance.now() - p0) / 1000;
    return { perSecond: (v.getCamera().theta - t0) / s, fps: (v.getFrameCount() - f0) / s };
  });
  expect(rate.perSecond, `turned ${rate.perSecond.toFixed(3)} rad/s at ${rate.fps.toFixed(0)} fps`).toBeGreaterThan(0.14);
  expect(rate.perSecond, `turned ${rate.perSecond.toFixed(3)} rad/s at ${rate.fps.toFixed(0)} fps`).toBeLessThan(0.22);
  expectNoErrors(errors);
});
