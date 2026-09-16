/* ═══════════════════════════════════════════════════════════════════
   Datasheet Viewer: sidebar and section-bar styles, and the layout
   containment that stops the screen being cut off (F5).
   The screen keeps the index.html markup (ADR 0002); its styles are in
   src/styles/views/datasheet.css.
═══════════════════════════════════════════════════════════════════ */

import { test, expect, openApp, goToView, expectNoErrors, styleOf } from './helpers.js';

const TRANSPARENT = 'rgba(0, 0, 0, 0)';
const BROWSER_GREY = 'rgb(239, 239, 239)';
const BROWSER_WHITE = 'rgb(255, 255, 255)';

async function openDatasheet(page) {
  await openApp(page);
  await goToView(page, 'datasheet');
}

// Height of an element's box, rounded.
const heightOf = (page, sel) => page.locator(sel).first().evaluate((el) => Math.round(el.getBoundingClientRect().height));

test('the datasheet search box is styled, not a browser default (F5)', async ({ page, errors }) => {
  await openDatasheet(page);
  expect(await page.locator('#ds-search').getAttribute('style'), '#ds-search has no inline style').toBeNull();

  const s = await styleOf(page, '#ds-search', ['backgroundColor', 'borderTopStyle', 'borderTopWidth', 'borderTopLeftRadius', 'paddingLeft', 'fontFamily']);
  expect(s.backgroundColor, 'the search box should not be browser white').not.toBe(BROWSER_WHITE);
  expect(s.borderTopStyle, 'a real border, not the browser inset one').toBe('solid');
  expect(s.borderTopWidth, 'border width').toBe('1px');
  expect(parseFloat(s.borderTopLeftRadius), 'rounded corners').toBeGreaterThan(0);
  expect(parseFloat(s.paddingLeft), 'padding inside the box').toBeGreaterThan(0);
  expect(s.fontFamily, 'the app font, not Arial').not.toBe('Arial');

  // It should fill the sidebar, not sit at the browser's default input width.
  const box = await page.locator('#ds-search').boundingBox();
  const wrap = await page.locator('.ds-search').boundingBox();
  expect(box.width, `input ${box.width} should fill its ${wrap.width} box`).toBeGreaterThan(wrap.width - 40);
  expectNoErrors(errors);
});

test('section buttons are styled and the active one stands out (F5)', async ({ page, errors }) => {
  await openDatasheet(page);
  const resting = '#view-datasheet .toc-btn:not(.active)';
  expect(await page.locator(resting).first().getAttribute('style'), 'no inline style').toBeNull();

  const s = await styleOf(page, resting, ['backgroundColor', 'cursor', 'borderTopWidth', 'paddingLeft', 'fontFamily']);
  expect(s.backgroundColor, 'should not be browser grey').not.toBe(BROWSER_GREY);
  expect(s.cursor, 'clickable buttons show a pointer').toBe('pointer');
  expect(s.borderTopWidth, 'border width').toBe('1px');
  expect(parseFloat(s.paddingLeft), 'padding inside the button').toBeGreaterThan(0);
  expect(s.fontFamily, 'the app font, not Arial').not.toBe('Arial');

  // Exactly one button is active, and it must look different from the others.
  await expect(page.locator('#view-datasheet .toc-btn.active')).toHaveCount(1);
  const active = await styleOf(page, '#view-datasheet .toc-btn.active', ['backgroundColor', 'color']);
  expect(active.backgroundColor, 'the active section stands out').not.toBe(s.backgroundColor);
  expectNoErrors(errors);
});

test('datasheet list rows look clickable and the name outranks the maker (F5)', async ({ page, errors }) => {
  await openDatasheet(page);
  await expect(page.locator('.ds-item')).toHaveCount(2);

  const row = await styleOf(page, '.ds-item', ['cursor', 'paddingLeft', 'borderTopLeftRadius']);
  expect(row.cursor, 'the row has an onclick, so it should show a pointer').toBe('pointer');
  expect(parseFloat(row.paddingLeft), 'padding inside the row').toBeGreaterThan(0);
  expect(parseFloat(row.borderTopLeftRadius), 'rounded corners').toBeGreaterThan(0);

  const name = await styleOf(page, '.ds-item-name', ['fontSize', 'color']);
  const mfr = await styleOf(page, '.ds-item-mfr', ['fontSize', 'color']);
  expect(parseFloat(name.fontSize), `name ${name.fontSize} should be bigger than maker ${mfr.fontSize}`)
    .toBeGreaterThan(parseFloat(mfr.fontSize));
  expect(mfr.color, 'the maker is muted, not the same colour as the name').not.toBe(name.color);
  expectNoErrors(errors);
});

test('clicking a datasheet row opens it and marks that row (F5)', async ({ page, errors }) => {
  await openDatasheet(page);
  await expect(page.locator('#ds-component-name')).toHaveText('ATmega328P');

  await page.locator('.ds-item').nth(1).click();
  await expect(page.locator('#ds-component-name')).toHaveText('ESP32-WROOM-32');
  await expect(page.locator('.ds-item.active'), 'one row is marked').toHaveCount(1);

  const active = await styleOf(page, '.ds-item.active', ['backgroundColor']);
  const resting = await styleOf(page, '.ds-item:not(.active)', ['backgroundColor']);
  expect(active.backgroundColor, 'the open datasheet stands out in the list').not.toBe(resting.backgroundColor);
  expect(active.backgroundColor, 'the open datasheet stands out in the list').not.toBe(TRANSPARENT);
  expectNoErrors(errors);
});

test('the screen fits and the content scrolls instead of being cut off (F5)', async ({ page, errors }) => {
  await openDatasheet(page);

  // Examples is the tallest section (1222 px of content before the fix).
  await page.locator('#view-datasheet .toc-btn', { hasText: /^Examples$/ }).click();
  await expect(page.locator('#ds-content .ds-code').first()).toBeVisible();

  const layout = await heightOf(page, '.datasheet-layout');
  for (const sel of ['.datasheet-sidebar', '.datasheet-viewer-area']) {
    const h = await heightOf(page, sel);
    expect(h, `${sel} (${h} px) must fit inside the layout (${layout} px)`).toBeLessThanOrEqual(layout);
  }

  const content = await page.locator('#ds-content').evaluate((el) => ({ scroll: el.scrollHeight, client: el.clientHeight }));
  expect(content.scroll, 'the tall section scrolls inside its box').toBeGreaterThan(content.client);

  const scrolls = await page.locator('#view-datasheet').evaluate((v) => v.scrollHeight > v.clientHeight);
  expect(scrolls, 'the screen itself should not scroll').toBe(false);
  expectNoErrors(errors);
});

/* ── Search box (C8) ──────────────────────────────────────────── */
test('the search box filters the datasheet list (C8)', async ({ page, errors }) => {
  await openDatasheet(page);
  await expect(page.locator('.ds-item')).toHaveCount(2);

  await page.locator('#ds-search').fill('esp');
  await expect(page.locator('.ds-item')).toHaveCount(1);
  await expect(page.locator('.ds-item-name')).toHaveText('ESP32-WROOM-32');

  // The maker is searched too, not just the name.
  await page.locator('#ds-search').fill('microchip');
  await expect(page.locator('.ds-item')).toHaveCount(1);
  await expect(page.locator('.ds-item-name')).toHaveText('ATmega328P');

  await page.locator('#ds-search').fill('nothing here');
  await expect(page.locator('.ds-item')).toHaveCount(0);
  await expect(page.locator('.ds-empty')).toContainText('No datasheet matches');

  await page.locator('#ds-search').fill('');
  await expect(page.locator('.ds-item')).toHaveCount(2);
  expectNoErrors(errors);
});

test('the search box still works after leaving and coming back (C8)', async ({ page, errors }) => {
  await openDatasheet(page);
  for (const view of ['dashboard', 'datasheet', 'dashboard', 'datasheet']) await goToView(page, view);
  await page.locator('#ds-search').fill('esp');
  await expect(page.locator('.ds-item'), 'one handler, not one per visit').toHaveCount(1);
  expectNoErrors(errors);
});

/* ── Every section has content (D26) ──────────────────────────── */
test('every section button shows real content, not a placeholder (D26)', async ({ page, errors }) => {
  await openDatasheet(page);
  const sections = ['Overview', 'Pinout', 'Electrical', 'Timing', 'Memory', 'Examples', 'Package'];
  await expect(page.locator('#view-datasheet .toc-btn')).toHaveCount(sections.length);

  for (const name of sections) {
    await page.locator('#view-datasheet .toc-btn', { hasText: new RegExp(`^${name}$`) }).click();
    await expect(page.locator('#ds-content .ds-section'), `the "${name}" section`).toBeVisible();
    await expect(page.locator('#ds-content .placeholder-msg'), `"${name}" should not be a placeholder`).toHaveCount(0);
  }
  expectNoErrors(errors);
});

test('the Pinout section lists every pin of the part (D26)', async ({ page, errors }) => {
  await openDatasheet(page);
  await page.locator('#view-datasheet .toc-btn', { hasText: /^Pinout$/ }).click();

  const expected = await page.evaluate(() =>
    window.CircuitLabData.components.find((c) => c.id === 'atmega328p').pinout);
  await expect(page.locator('#ds-content .ds-table tbody tr')).toHaveCount(expected.length);

  const firstRow = page.locator('#ds-content .ds-table tbody tr').first();
  await expect(firstRow).toContainText(expected[0].name);
  await expect(firstRow).toContainText(expected[0].altName);

  // It follows the chosen datasheet.
  await page.locator('.ds-item').nth(1).click();
  const esp = await page.evaluate(() =>
    window.CircuitLabData.components.find((c) => c.id === 'esp32-wroom').pinout.length);
  await expect(page.locator('#ds-content .ds-table tbody tr')).toHaveCount(esp);
  expectNoErrors(errors);
});

test('the Package section shows the package sizes (D26)', async ({ page, errors }) => {
  await openDatasheet(page);
  await page.locator('#view-datasheet .toc-btn', { hasText: /^Package$/ }).click();
  const packs = await page.evaluate(() => window.CircuitLabData.datasheets[0].sections.package.packages);
  await expect(page.locator('#ds-content .ds-table tbody tr')).toHaveCount(packs.length);
  await expect(page.locator('#ds-content .ds-table')).toContainText(packs[0].name);
  expectNoErrors(errors);
});
