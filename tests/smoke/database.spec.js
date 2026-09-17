/* ═══════════════════════════════════════════════════════════════════
   Database screen = Component Library (ADR 0002): C3, B8, D10.
═══════════════════════════════════════════════════════════════════ */

import { test, expect, openApp, goToView, expectNoErrors } from './helpers.js';

const cards = (page) => page.locator('#view-database .comp-card');
const cardNames = (page) => page.locator('#view-database .comp-card-name').allTextContents();
const components = (page) => page.evaluate(() => window.CircuitLabData.components.map((c) => ({ name: c.name, category: c.category, pins: c.pins, voltage: c.voltage })));

test('database screen shows a card for every component (C3)', async ({ page, errors }) => {
  await openApp(page);
  await goToView(page, 'database');
  const all = await components(page);
  await expect(cards(page)).toHaveCount(all.length);
  expectNoErrors(errors);
});

test('category filter shows only that category (C3)', async ({ page, errors }) => {
  await openApp(page);
  await goToView(page, 'database');
  const sensors = (await components(page)).filter((c) => c.category === 'sensor').map((c) => c.name);

  await page.locator('#view-database .filter-chip', { hasText: /^SENSOR$/ }).click();
  await expect(cards(page)).toHaveCount(sensors.length);
  expect((await cardNames(page)).sort()).toEqual(sensors.sort());
  expectNoErrors(errors);
});

test('sorting reorders the cards and keeps the choice (D10)', async ({ page, errors }) => {
  await openApp(page);
  await goToView(page, 'database');
  const all = await components(page);
  const sortSelect = page.locator('#view-database select.filter-select');

  await sortSelect.selectOption('pins');
  const byPins = [...all].sort((a, b) => a.pins - b.pins || a.name.localeCompare(b.name)).map((c) => c.name);
  await expect.poll(() => cardNames(page)).toEqual(byPins);
  await expect(sortSelect).toHaveValue('pins');

  await sortSelect.selectOption('voltage');
  const byVoltage = [...all].sort((a, b) => parseFloat(a.voltage) - parseFloat(b.voltage) || a.name.localeCompare(b.name)).map((c) => c.name);
  await expect.poll(() => cardNames(page)).toEqual(byVoltage);

  await sortSelect.selectOption('name');
  await expect.poll(() => cardNames(page)).toEqual([...all].map((c) => c.name).sort((a, b) => a.localeCompare(b)));
  expectNoErrors(errors);
});

test('compare mode shows the chosen components side by side (C3)', async ({ page, errors }) => {
  await openApp(page);
  await goToView(page, 'database');
  await cards(page).nth(0).locator('.comp-compare-btn').click();
  await cards(page).nth(1).locator('.comp-compare-btn').click();
  const panel = page.locator('#view-database .compare-panel');
  await expect(panel).toBeVisible();
  const [a, b] = (await cardNames(page)).slice(0, 2);
  await expect(panel).toContainText(a);
  await expect(panel).toContainText(b);

  await page.locator('#view-database button', { hasText: /Clear \(2\)/ }).click();
  await expect(panel).toBeHidden();
  expectNoErrors(errors);
});

test('"View 3D" opens the part in the 3D viewer', async ({ page, errors }) => {
  await openApp(page);
  await goToView(page, 'database');
  const card = cards(page).filter({ hasText: 'NE555' });
  await card.locator('button', { hasText: 'View 3D' }).click();
  await expect(page.locator('#view-viewer')).toBeVisible();
  await expect(page.locator('#viewer-sidebar .viewer-comp-name')).toHaveText('NE555');
  expectNoErrors(errors);
});

test('dashboard "Components" card opens the library (B8)', async ({ page, errors }) => {
  await openApp(page);
  await page.locator('#view-dashboard .quick-card').filter({ has: page.getByText('Components', { exact: true }) }).click();
  await expect(page.locator('#view-database')).toBeVisible();
  await expect(cards(page).first()).toBeVisible();
  expectNoErrors(errors);
});

test('timers and op-amps are ICs, not passive parts (D30)', async ({ page, errors }) => {
  await openApp(page);
  await goToView(page, 'database');
  await page.locator('.filter-chip', { hasText: /^IC$/ }).click();
  await expect(page.locator('.comp-card-name')).toHaveText(['LM358', 'NE555']);

  await page.locator('.filter-chip', { hasText: 'PASSIVE' }).click();
  await expect(page.locator('.comp-card-name', { hasText: /NE555|LM358/ }), 'no IC under PASSIVE').toHaveCount(0);
  expectNoErrors(errors);
});
