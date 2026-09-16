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
