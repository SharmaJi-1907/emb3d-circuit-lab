/* ═══════════════════════════════════════════════════════════════════
   Light / dark theme (C5): the Settings button and the top-bar button.
   The choice is kept in the browser. Colours come from the design
   tokens, overridden under :root[data-theme="light"] in src/styles/base/tokens.css.
═══════════════════════════════════════════════════════════════════ */

import { test, expect, openApp, appReady, goToView, expectNoErrors, styleOf } from './helpers.js';

const themeOf = (page) => page.evaluate(() => document.documentElement.dataset.theme || 'dark');

// Average brightness of an "rgb(r, g, b)" string, 0 (black) to 255 (white).
function brightness(colour) {
  const [r, g, b] = (colour.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
  return (r + g + b) / 3;
}

async function openSettings(page) {
  await openApp(page);
  await goToView(page, 'settings');
}

test('the app starts dark (C5)', async ({ page, errors }) => {
  await openApp(page);
  expect(await themeOf(page)).toBe('dark');
  const body = await styleOf(page, 'body', ['backgroundColor']);
  expect(brightness(body.backgroundColor), 'a dark page').toBeLessThan(60);
  expectNoErrors(errors);
});

test('the Settings button switches to light and back (C5)', async ({ page, errors }) => {
  await openSettings(page);
  const darkBody = (await styleOf(page, 'body', ['backgroundColor'])).backgroundColor;

  await page.locator('#theme-btn-toggle').click();
  expect(await themeOf(page), 'the root carries the choice').toBe('light');
  const lightBody = (await styleOf(page, 'body', ['backgroundColor'])).backgroundColor;
  expect(lightBody, 'the page background changes').not.toBe(darkBody);
  expect(brightness(lightBody), 'a light page').toBeGreaterThan(200);

  await page.locator('#theme-btn-toggle').click();
  expect(await themeOf(page)).toBe('dark');
  expect((await styleOf(page, 'body', ['backgroundColor'])).backgroundColor).toBe(darkBody);
  expectNoErrors(errors);
});

test('the top-bar button switches the theme too (C5)', async ({ page, errors }) => {
  await openApp(page);
  await page.locator('#theme-toggle').click();
  expect(await themeOf(page)).toBe('light');
  await page.locator('#theme-toggle').click();
  expect(await themeOf(page)).toBe('dark');
  expectNoErrors(errors);
});

test('the choice survives a reload (C5)', async ({ page, errors }) => {
  await openApp(page);
  await page.locator('#theme-toggle').click();
  expect(await themeOf(page)).toBe('light');

  await page.reload();
  await appReady(page);
  expect(await themeOf(page), 'still light after a reload').toBe('light');
  expect(brightness((await styleOf(page, 'body', ['backgroundColor'])).backgroundColor)).toBeGreaterThan(200);
  expectNoErrors(errors);
});

test('light mode is readable: panels are light and text is dark (C5)', async ({ page, errors }) => {
  await openSettings(page);
  await page.locator('#theme-btn-toggle').click();

  // The panels that used a hard-coded dark colour must follow the theme.
  for (const sel of ['#view-settings .glass-panel', '.top-bar', '.sidebar']) {
    if (!(await page.locator(sel).count())) continue;
    const s = await styleOf(page, sel, ['backgroundColor']);
    expect(brightness(s.backgroundColor), `${sel} should be light, not a dark panel`).toBeGreaterThan(150);
  }

  const title = await styleOf(page, '#view-settings .view-title', ['color']);
  expect(brightness(title.color), 'text should be dark on a light page').toBeLessThan(120);
  expectNoErrors(errors);
});

test('the button says what it will do (C5)', async ({ page, errors }) => {
  await openSettings(page);
  await expect(page.locator('#theme-btn-toggle')).toHaveText(/light/i);
  await page.locator('#theme-btn-toggle').click();
  await expect(page.locator('#theme-btn-toggle')).toHaveText(/dark/i);
  expectNoErrors(errors);
});

test('keyboard keys stay readable in both themes (C5)', async ({ page, errors }) => {
  await openSettings(page);
  const key = '#view-settings kbd';
  expect(await page.locator(key).first().getAttribute('style'),
    'the keys carried an inline background:#222 before C5').toBeNull();

  for (const theme of ['dark', 'light']) {
    if (theme === 'light') await page.locator('#theme-btn-toggle').click();
    const s = await styleOf(page, key, ['backgroundColor', 'color']);
    const gap = Math.abs(brightness(s.backgroundColor) - brightness(s.color));
    expect(gap, `${theme}: the key's text must stand out from its box`).toBeGreaterThan(60);
  }
  expectNoErrors(errors);
});

/* ── Final clean-up (F11, F12) ────────────────────────────────── */
test('light mode: the 3D pin details panel is light with dark text (F11)', async ({ page, errors }) => {
  await openApp(page);
  await page.locator('#theme-toggle').click();
  await goToView(page, 'viewer');
  await page.locator('#pin-table-body .pin-row').first().click();
  await expect(page.locator('#pin-detail-panel .pin-detail-name')).toBeVisible();
  const panel = await styleOf(page, '#pin-detail-panel', ['backgroundColor']);
  const name = await styleOf(page, '#pin-detail-panel .pin-detail-name', ['color']);
  expect(brightness(panel.backgroundColor), `panel ${panel.backgroundColor}`).toBeGreaterThan(150);
  expect(brightness(panel.backgroundColor) - brightness(name.color), 'the pin name stands out').toBeGreaterThan(100);
  expectNoErrors(errors);
});

test('the shortcuts pop-up has no inline colours and its close button shows in both themes (F11)', async ({ page, errors }) => {
  await openApp(page);
  for (const sel of ['#shortcuts-modal', '#close-shortcuts-btn']) {
    const style = (await page.locator(sel).getAttribute('style')) || '';
    expect(style, `${sel}: colours come from the CSS`).not.toMatch(/#[0-9a-f]{3,6}\b|rgba?\(/i);
  }
  for (const theme of ['dark', 'light']) {
    if (theme === 'light') await page.locator('#theme-toggle').click();
    await page.locator('body').press('?');
    const card = await styleOf(page, '#shortcuts-modal .modal-card', ['backgroundColor']);
    const close = await styleOf(page, '#close-shortcuts-btn', ['color']);
    expect(Math.abs(brightness(card.backgroundColor) - brightness(close.color)), `${theme}: × must stand out`).toBeGreaterThan(100);
    await page.keyboard.press('Escape');
  }
  expectNoErrors(errors);
});

test('no screen writes hard-coded colours into its HTML (F12)', async ({ page, errors }) => {
  await openApp(page);
  const found = [];
  for (const view of ['dashboard', 'viewer', 'simulator', 'database', 'boards', 'datasheet', 'ai', 'projects', 'settings']) {
    await goToView(page, view);
    if (view === 'viewer') await page.locator('#pin-table-body .pin-row').first().click();
    const styles = await page.locator('#view-container [style]').evaluateAll((els) => els.map((e) => e.getAttribute('style')));
    for (const s of styles) if (/#[0-9a-f]{3,6}\b|rgba?\(/i.test(s)) found.push(`${view}: ${s}`);
  }
  expect([...new Set(found)], 'colours come from the design tokens').toEqual([]);
  expectNoErrors(errors);
});
