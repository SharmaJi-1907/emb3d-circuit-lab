/* ═══════════════════════════════════════════════════════════════════
   Keyboard shortcut tests (D2) and the 3D explode fix (D13).
   Every key listed in the Settings screen and the shortcuts popup
   must work, and nothing else may react to it.
═══════════════════════════════════════════════════════════════════ */

import {
  test, expect, VIEWS, openApp, goToView, settle, expectNoErrors, modelSize, waitForStableModel,
} from './helpers.js';

const currentView = (page) => page.evaluate(() => window.CircuitApp.getState().currentView);

/* ── Screens ──────────────────────────────────────────────────── */
test('number keys 1-8 open the screens in sidebar order', async ({ page, errors }) => {
  await openApp(page);
  const sidebar = await page.locator('.nav-item').evaluateAll((items) => items.map((i) => i.dataset.view));
  expect(sidebar).toEqual(VIEWS);

  for (const [i, view] of VIEWS.entries()) {
    await page.locator('body').press(String(i + 1));
    await expect(page.locator(`#view-${view}`), `key ${i + 1} should open ${view}`).toBeVisible();
  }
  await settle(page);
  expectNoErrors(errors);
});

test('shortcuts ignore modifier keys and typing in text fields', async ({ page, errors }) => {
  await openApp(page);
  await goToView(page, 'settings');
  for (const combo of ['Control+3', 'Alt+3', 'Meta+3']) {
    await page.locator('body').press(combo);
    expect(await currentView(page), `${combo} must not switch screens`).toBe('settings');
  }

  await goToView(page, 'ai');
  await page.locator('#ai-user-query').press('3');
  expect(await currentView(page), 'typing in a text box must not switch screens').toBe('ai');

  await goToView(page, 'simulator');
  await page.locator('#mm-mode').press('1');
  expect(await currentView(page), 'typing in a dropdown must not switch screens').toBe('simulator');
  expectNoErrors(errors);
});

/* ── Search and help ──────────────────────────────────────────── */
test('Ctrl+K, Cmd+K and / open search', async ({ page, errors }) => {
  await openApp(page);
  const search = page.locator('.search-modal-content');
  for (const combo of ['Control+k', 'Meta+k', '/']) {
    await page.locator('body').press(combo);
    await expect(search, `${combo} should open search`).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(search).toBeHidden();
  }
  expectNoErrors(errors);
});

test('? opens the shortcuts list and Esc closes it', async ({ page, errors }) => {
  await openApp(page);
  const modal = page.locator('#shortcuts-modal');
  await expect(modal).toBeHidden();

  await page.locator('body').press('?');
  await expect(modal).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
  expectNoErrors(errors);
});

/* ── 3D viewer ────────────────────────────────────────────────── */
test('W toggles wireframe in the 3D viewer', async ({ page, errors }) => {
  await openApp(page);
  await waitForStableModel(page); // the Viewer is the start screen
  const wireframe = () => page.evaluate(() => window.ThreeViewer.isWireframe());

  await page.locator('body').press('w');
  expect(await wireframe()).toBe(true);
  await page.locator('body').press('w');
  expect(await wireframe()).toBe(false);

  // Holding the key down (auto-repeat) toggles only once.
  await page.keyboard.down('w');
  await page.keyboard.down('w');
  await page.keyboard.up('w');
  expect(await wireframe(), 'auto-repeat must not toggle again').toBe(true);
  expectNoErrors(errors);
});

test('E toggles explode in the 3D viewer', async ({ page, errors }) => {
  await openApp(page);
  await waitForStableModel(page); // the Viewer is the start screen
  const exploded = () => page.evaluate(() => window.ThreeViewer.isExploded());

  await page.locator('body').press('e');
  expect(await exploded()).toBe(true);
  await page.locator('body').press('e');
  expect(await exploded()).toBe(false);

  await settle(page, 1000); // explode animation
  expect(await modelSize(page), 'the model should still be intact (D13)').not.toBeNull();
  expectNoErrors(errors);
});

test('exploding and restoring the 3D model keeps it intact (D13)', async ({ page, errors }) => {
  await openApp(page);
  await waitForStableModel(page); // the Viewer is the start screen
  const before = await modelSize(page);
  expect(before, 'a model should be loaded before the test').not.toBeNull();

  await page.evaluate(() => window.ThreeViewer.setExplode(true));
  await settle(page, 1000);
  expect(await modelSize(page), 'the model should be intact while exploded').not.toBeNull();

  // Wait for the restore animation to finish (timers run slower in headless Chrome), then compare sizes.
  await page.evaluate(() => window.ThreeViewer.setExplode(false));
  await expect
    .poll(
      async () => {
        const after = await modelSize(page);
        return after ? Math.max(...after.map((n, i) => Math.abs(n - before[i]))) : Infinity;
      },
      { message: 'the model should return to its original size', timeout: 10_000 },
    )
    .toBeLessThan(0.005);
  expectNoErrors(errors);
});

test('R resets the 3D camera, only on the viewer screen', async ({ page, errors }) => {
  await openApp(page);
  await page.evaluate(() => {
    window.__resets = 0;
    const original = window.ThreeViewer.resetView;
    window.ThreeViewer.resetView = () => {
      window.__resets++;
      original();
    };
  });
  const resets = () => page.evaluate(() => window.__resets);

  await page.locator('body').press('r');
  expect(await resets()).toBe(1);

  await goToView(page, 'simulator');
  await page.locator('body').press('r');
  expect(await resets(), 'R must do nothing outside the viewer').toBe(1);
  expectNoErrors(errors);
});

/* ── Simulator ────────────────────────────────────────────────── */
test('Space starts and stops the simulation, only on the simulator screen', async ({ page, errors }) => {
  await openApp(page);
  const running = () => page.evaluate(() => window.CircuitSimulator.isRunning());

  await page.locator('body').press('Space');
  expect(await running(), 'Space must do nothing outside the simulator').toBe(false);

  // Straight after clicking the sidebar button, without clicking anywhere else.
  await goToView(page, 'simulator');
  await page.keyboard.press('Space');
  expect(await running()).toBe(true);
  await page.keyboard.press('Space');
  expect(await running()).toBe(false);
  expectNoErrors(errors);
});
