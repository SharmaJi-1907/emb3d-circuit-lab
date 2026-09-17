/* ═══════════════════════════════════════════════════════════════════
   Hash routing (D9): the address follows the screen, and the screen
   follows the address. Refresh, Back/Forward and #links all work.
═══════════════════════════════════════════════════════════════════ */

import { test, expect, appReady, openApp, goToView, expectNoErrors, waitForStableModel } from './helpers.js';

const currentView = (page) => page.evaluate(() => window.CircuitApp.getState().currentView);
const hash = (page) => page.evaluate(() => location.hash);

test('opening a screen puts it in the address (D9)', async ({ page, errors }) => {
  await openApp(page);
  await goToView(page, 'boards');
  await expect.poll(() => hash(page)).toBe('#boards');

  await page.locator('body').press('3'); // keys use the same route
  await expect.poll(() => hash(page)).toBe('#simulator');
  expectNoErrors(errors);
});

test('a link to a screen opens it when the app starts (D9)', async ({ page, errors }) => {
  await page.goto('/#simulator');
  await appReady(page);
  await expect(page.locator('#view-simulator')).toBeVisible();
  expect(await currentView(page)).toBe('simulator');
  expectNoErrors(errors);
});

test('refreshing keeps the screen you were on (D9)', async ({ page, errors }) => {
  await openApp(page);
  await goToView(page, 'datasheet');
  await page.reload();
  await appReady(page);
  await expect(page.locator('#view-datasheet')).toBeVisible();
  expectNoErrors(errors);
});

test('Back and Forward move between screens (D9)', async ({ page, errors }) => {
  await openApp(page);
  await goToView(page, 'boards');
  await goToView(page, 'ai');

  await page.goBack();
  await expect(page.locator('#view-boards')).toBeVisible();
  expect(await currentView(page)).toBe('boards');

  await page.goForward();
  await expect(page.locator('#view-ai')).toBeVisible();
  expect(await currentView(page)).toBe('ai');
  expectNoErrors(errors);
});

test('changing the address by hand switches the screen (D9)', async ({ page, errors }) => {
  await openApp(page);
  await page.evaluate(() => { location.hash = '#projects'; });
  await expect(page.locator('#view-projects')).toBeVisible();
  expectNoErrors(errors);
});

test('an unknown screen in the address falls back to the Dashboard (D9)', async ({ page, errors }) => {
  await page.goto('/#nope');
  await appReady(page);
  await expect(page.locator('#view-dashboard')).toBeVisible();

  await page.evaluate(() => { location.hash = '#also-nope'; });
  await expect.poll(() => hash(page)).toBe('#dashboard');
  await expect(page.locator('#view-dashboard'), 'never a blank page').toBeVisible();
  expectNoErrors(errors);
});

test('a link to the 3D Viewer shows the model on first load (D9, D15)', async ({ page, errors }) => {
  await page.goto('/#viewer');
  await appReady(page);
  await expect(page.locator('#view-viewer')).toBeVisible();
  await waitForStableModel(page);
  expectNoErrors(errors);
});
