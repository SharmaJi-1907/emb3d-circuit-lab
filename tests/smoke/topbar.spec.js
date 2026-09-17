/* ═══════════════════════════════════════════════════════════════════
   Top bar: the notifications drawer and "Clear All" (C6), and the
   search pop-up's ↑↓ / ↵ keys (D14), and the New Project and Share
   buttons (C9).
   The top bar keeps the index.html markup (ADR 0002).
═══════════════════════════════════════════════════════════════════ */

import { test, expect, openApp, goToView, expectNoErrors, styleOf } from './helpers.js';

const drawer = (page) => page.locator('#notif-drawer');
const items = (page) => page.locator('#notif-list-body .notif-item');
const results = (page) => page.locator('#modal-search-results .search-result-item');

// Open the search pop-up and type a query that matches several parts.
async function search(page, query) {
  await page.keyboard.press('/');
  await expect(page.locator('#modal-search-input')).toBeVisible();
  await page.locator('#modal-search-input').fill(query);
  await expect(results(page).first()).toBeVisible();
}

/* ── Notifications drawer (C6) ────────────────────────────────── */
test('the bell opens and closes the notifications drawer (C6)', async ({ page, errors }) => {
  await openApp(page);
  await expect(drawer(page), 'closed at first').toBeHidden();

  await page.locator('#notif-btn').click();
  await expect(drawer(page), 'the bell opens it').toBeVisible();
  expect(await items(page).count(), 'it lists the notifications').toBeGreaterThan(0);

  await page.locator('#notif-btn').click();
  await expect(drawer(page), 'the bell closes it again').toBeHidden();
  expectNoErrors(errors);
});

test('Esc and a click outside close the drawer (C6)', async ({ page, errors }) => {
  await openApp(page);
  await page.locator('#notif-btn').click();
  await expect(drawer(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(drawer(page), 'Esc closes it').toBeHidden();

  await page.locator('#notif-btn').click();
  await expect(drawer(page)).toBeVisible();
  await page.locator('#view-dashboard').click({ position: { x: 5, y: 5 } });
  await expect(drawer(page), 'clicking the page closes it').toBeHidden();
  expectNoErrors(errors);
});

test('"Clear All" empties the drawer and hides the unread dot (C6)', async ({ page, errors }) => {
  await openApp(page);
  await expect(page.locator('#notif-btn .notif-dot'), 'unread dot shows at first').toBeVisible();

  await page.locator('#notif-btn').click();
  expect(await items(page).count()).toBeGreaterThan(0);

  await page.locator('#clear-notifs').click();
  await expect(items(page), 'the list is empty').toHaveCount(0);
  await expect(page.locator('#notif-list-body')).toContainText(/nothing|no notification/i);
  await expect(page.locator('#notif-btn .notif-dot'), 'no unread dot left').toBeHidden();

  // It stays cleared while the drawer is reopened.
  await page.locator('#notif-btn').click();
  await page.locator('#notif-btn').click();
  await expect(items(page)).toHaveCount(0);
  expectNoErrors(errors);
});

test('the drawer follows the theme (C6)', async ({ page, errors }) => {
  await openApp(page);
  await page.locator('#notif-btn').click();
  await expect(drawer(page)).toBeVisible();
  const dark = await styleOf(page, '#notif-drawer', ['backgroundColor']);

  // Switching the theme clicks outside the drawer, which closes it, so open it
  // again and check it while it is actually on screen.
  await page.locator('#theme-toggle').click();
  await page.locator('#notif-btn').click();
  await expect(drawer(page)).toBeVisible();
  const light = await styleOf(page, '#notif-drawer', ['backgroundColor']);
  expect(light.backgroundColor, 'the drawer must not stay dark in light mode').not.toBe(dark.backgroundColor);

  const bright = (c) => (c.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number).reduce((a, b) => a + b, 0) / 3;
  expect(bright(light.backgroundColor), 'a light drawer').toBeGreaterThan(150);
  expectNoErrors(errors);
});

/* ── Search pop-up keys (D14) ─────────────────────────────────── */
test('↑ and ↓ move through the search results (D14)', async ({ page, errors }) => {
  await openApp(page);
  await search(page, 'ti');
  const total = await results(page).count();
  expect(total, 'several results to move through').toBeGreaterThan(1);

  await expect(results(page).nth(0), 'the first result starts selected').toHaveClass(/selected/);

  await page.keyboard.press('ArrowDown');
  await expect(results(page).nth(1)).toHaveClass(/selected/);
  await expect(results(page).nth(0)).not.toHaveClass(/selected/);

  await page.keyboard.press('ArrowUp');
  await expect(results(page).nth(0)).toHaveClass(/selected/);

  // Up from the top wraps to the bottom.
  await page.keyboard.press('ArrowUp');
  await expect(results(page).nth(total - 1), 'wraps to the last result').toHaveClass(/selected/);
  expectNoErrors(errors);
});

test('↵ opens the selected search result (D14)', async ({ page, errors }) => {
  await openApp(page);
  await goToView(page, 'dashboard');
  await search(page, 'ti');

  await page.keyboard.press('ArrowDown');
  const name = await results(page).nth(1).locator('.search-result-name').textContent();
  await page.keyboard.press('Enter');

  await expect(page.locator('#modal-search-input'), 'the pop-up closes').toBeHidden();
  await expect(page.locator('#view-viewer'), 'the part opens in the 3D Viewer').toBeVisible();
  const selected = await page.evaluate(() => window.CircuitApp.getState().selectedComponent.name);
  expect(selected, 'the highlighted part is the one that opens').toBe(name.trim());
  expectNoErrors(errors);
});

test('typing again starts the selection at the top (D14)', async ({ page, errors }) => {
  await openApp(page);
  await search(page, 'ti');
  await page.keyboard.press('ArrowDown');
  await expect(results(page).nth(1)).toHaveClass(/selected/);

  await page.locator('#modal-search-input').fill('atmega');
  await expect(results(page).first()).toBeVisible();
  await expect(results(page).nth(0), 'a new search selects the first result').toHaveClass(/selected/);
  expectNoErrors(errors);
});

/* ── New Project and Share (C9) ───────────────────────────────── */
test('the top bar\'s New Project button opens the new-project form (C9)', async ({ page, errors }) => {
  await openApp(page);
  await goToView(page, 'boards');

  await page.locator('#new-project-btn').click();
  await expect(page.locator('#view-projects'), 'it goes to the Projects screen').toBeVisible();
  await expect(page.locator('#new-project-name'), 'with the name box ready to type in').toBeFocused();
  expectNoErrors(errors);
});

test('Share copies a link to the current screen (C9)', async ({ page, errors }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await openApp(page);
  await goToView(page, 'simulator');

  await page.locator('#export-btn').click();
  await expect(page.locator('.toast', { hasText: 'Link copied' }), 'it says what it did').toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied, 'the link opens the same screen').toBe(await page.evaluate(() => location.href));
  expect(copied).toMatch(/#simulator$/);
  expectNoErrors(errors);
});

/* ── Final clean-up (D37, D46, F11) ───────────────────────────── */
test('search opened again straight after closing stays open (D37)', async ({ page, errors }) => {
  await openApp(page);
  await page.keyboard.press('/');
  await expect(page.locator('#modal-search-input')).toBeVisible();
  // Close and reopen within the 200 ms close animation.
  await page.evaluate(() => {
    const key = (k) => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    document.activeElement.blur();
    key('Escape');
    key('/');
  });
  await page.waitForTimeout(600);
  await expect(page.locator('#modal-search-input'), 'the old close timer must not hide it').toBeVisible();
  expectNoErrors(errors);
});

test('search finds boards and datasheets, as its placeholder says (D46)', async ({ page, errors }) => {
  await openApp(page);
  await page.keyboard.press('/');
  await page.locator('#modal-search-input').fill('mega');
  const board = results(page).filter({ hasText: 'Arduino Mega' });
  await expect(board).toHaveCount(1);
  await board.click();
  await expect(page.locator('#view-boards')).toBeVisible();
  await expect(page.locator('#board-name')).toHaveText(/Mega/);
  await expect(page.locator('.board-tab.active')).toHaveText('Arduino Mega');

  await page.keyboard.press('/');
  await page.locator('#modal-search-input').fill('esp32-wroom');
  const sheet = results(page).filter({ has: page.locator('.search-result-type', { hasText: 'datasheet' }) });
  await expect(sheet).toHaveCount(1);
  await sheet.click();
  await expect(page.locator('#view-datasheet')).toBeVisible();
  await expect(page.locator('#ds-component-name')).toHaveText('ESP32-WROOM-32');
  expectNoErrors(errors);
});

test('the search pop-up has no inline colours and follows the theme (F11)', async ({ page, errors }) => {
  await openApp(page);
  await page.locator('#theme-toggle').click();
  await page.keyboard.press('/');
  await expect(page.locator('#modal-search-input')).toBeVisible();
  for (const sel of ['#search-backdrop', '.search-modal-content']) {
    const style = (await page.locator(sel).getAttribute('style')) || '';
    expect(style, `${sel}: colours come from the CSS`).not.toMatch(/#[0-9a-f]{3,6}\b|rgba?\(/i);
  }
  const bg = (await styleOf(page, '.search-modal-content', ['backgroundColor'])).backgroundColor;
  const bright = (bg.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number).reduce((a, b) => a + b, 0) / 3;
  expect(bright, `a light pop-up in the light theme (${bg})`).toBeGreaterThan(150);
  const input = await styleOf(page, '#modal-search-input', ['backgroundColor']);
  expect(input.backgroundColor, 'the input sits on the pop-up, not in a browser-white box').toBe('rgba(0, 0, 0, 0)');
  expectNoErrors(errors);
});
