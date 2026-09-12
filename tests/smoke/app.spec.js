/* ═══════════════════════════════════════════════════════════════════
   Smoke tests — open every screen and use the main features.
   A test fails on any uncaught exception or console.error.

   Known bugs are marked with knownBug('<code>'). Those tests are
   EXPECTED to fail until the bug is fixed. When a fix makes one pass,
   Playwright reports it as failed ("expected to fail, but passed"),
   so remove the knownBug() line in the same branch as the fix.
   Codes refer to docs/FIX_PLAN.md.
═══════════════════════════════════════════════════════════════════ */

import { test, expect, VIEWS, openApp, goToView, settle, expectNoErrors } from './helpers.js';

function knownBug(...codes) {
  test.fail(true, `Known bug ${codes.join(', ')} — see docs/FIX_PLAN.md`);
}

// Screens that currently crash when opened. The root cause of all four is A1 (data.js not loaded).
const VIEW_BUGS = {
  viewer: ['A2'],
  boards: ['A4'],
  datasheet: ['A5'],
  projects: ['A6'],
};

/* ── Boot ─────────────────────────────────────────────────────── */
test('app boots without errors', async ({ page, errors }) => {
  await openApp(page);

  await expect(page.locator('.nav-item')).toHaveCount(VIEWS.length);
  await expect(page.locator('#view-viewer')).toBeVisible();
  expectNoErrors(errors);
});

/* ── Every screen ─────────────────────────────────────────────── */
for (const view of VIEWS) {
  test(`opens the ${view} screen`, async ({ page, errors }) => {
    if (VIEW_BUGS[view]) knownBug(...VIEW_BUGS[view]);

    await openApp(page);
    await goToView(page, view);
    await settle(page);
    expectNoErrors(errors);

    if (view === 'viewer') {
      const selected = await page.evaluate(() => window.CircuitApp.getState().selectedComponent?.id);
      expect(selected, 'a component should be loaded in the 3D viewer').toBeTruthy();
    }
  });
}

/* ── Search ───────────────────────────────────────────────────── */
test('search finds a component', async ({ page, errors }) => {
  knownBug('A7');

  await openApp(page);
  await page.keyboard.press('Control+k');
  const input = page.locator('#modal-search-input');
  await expect(input).toBeVisible();

  await input.fill('esp32');
  await expect(page.locator('#modal-search-results .search-result-item').first()).toContainText(/esp32/i);
  expectNoErrors(errors);
});

/* ── AI assistant ─────────────────────────────────────────────── */
test('AI assistant replies to a question', async ({ page, errors }) => {
  knownBug('A8', 'B1', 'B3');

  const question = 'how does an esp32 work';
  await openApp(page);
  await goToView(page, 'ai');

  await page.locator('#ai-user-query').fill(question);
  await page.locator('#ai-send-btn').click();

  const chat = page.locator('#ai-chat-messages');
  await expect(chat).toContainText(question);
  await expect(chat.locator('.ai-message.assistant').first()).toBeVisible();
  expectNoErrors(errors);
});

/* ── Keyboard shortcuts ───────────────────────────────────────── */
test('number keys 1-8 open the matching screens', async ({ page, errors }) => {
  knownBug('D2');

  await openApp(page);
  for (const [i, view] of VIEWS.entries()) {
    await page.locator('body').press(String(i + 1));
    await expect(page.locator(`#view-${view}`), `key ${i + 1} should open ${view}`).toBeVisible();
  }
  await settle(page);
  expectNoErrors(errors);
});
