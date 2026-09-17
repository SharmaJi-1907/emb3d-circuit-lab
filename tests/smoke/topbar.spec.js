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
