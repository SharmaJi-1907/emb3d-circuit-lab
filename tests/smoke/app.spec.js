/* ═══════════════════════════════════════════════════════════════════
   Smoke tests — open every screen and use the main features.
   Keyboard shortcuts are tested in keyboard.spec.js.
   A test fails on any uncaught exception or console.error.

   Known bugs are marked with knownBug('<code>'). Those tests are
   EXPECTED to fail until the bug is fixed. When a fix makes one pass,
   Playwright reports it as failed ("expected to fail, but passed"),
   so remove the knownBug() line in the same branch as the fix.
   Codes refer to docs/FIX_PLAN.md.
═══════════════════════════════════════════════════════════════════ */

import { test, expect, VIEWS, openApp, goToView, settle, expectNoErrors, waitForStableModel } from './helpers.js';

function knownBug(...codes) {
  test.fail(true, `Known bug ${codes.join(', ')} — see docs/FIX_PLAN.md`);
}

/* ── Boot ─────────────────────────────────────────────────────── */
test('app boots without errors', async ({ page, errors }) => {
  await openApp(page);

  await expect(page.locator('.nav-item')).toHaveCount(VIEWS.length);
  await expect(page.locator('#view-dashboard')).toBeVisible();
  expectNoErrors(errors);
});

/* ── Dashboard (home screen) ──────────────────────────────────── */
test('dashboard is the home screen and shows the stats', async ({ page, errors }) => {
  await openApp(page);
  expect(await page.evaluate(() => window.CircuitApp.getState().currentView)).toBe('dashboard');
  await expect(page.locator('.nav-item[data-view="dashboard"]')).toHaveClass(/active/);
  await expect(page.locator('#view-dashboard .stat-card')).toHaveCount(4);
  expectNoErrors(errors);
});

test('every dashboard quick-access card opens a real screen', async ({ page, errors }) => {
  await openApp(page);
  const cards = page.locator('#view-dashboard .quick-card');
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    await goToView(page, 'dashboard');
    const label = (await cards.nth(i).locator('.quick-card-label').textContent()).trim();
    await cards.nth(i).click();
    const view = await page.evaluate(() => window.CircuitApp.getState().currentView);
    await expect(page.locator(`#view-${view}`), `"${label}" card should open a screen that exists`).toBeVisible();
  }
  expectNoErrors(errors);
});

/* ── Data ─────────────────────────────────────────────────────── */
test('component data is loaded', async ({ page, errors }) => {
  await openApp(page);

  const data = await page.evaluate(() => {
    const d = window.CircuitLabData;
    if (!d) return null;
    return {
      components: d.components?.length ?? 0,
      boards: Object.keys(d.boards ?? {}).length,
      datasheets: d.datasheets?.length ?? 0,
      projects: d.projects?.length ?? 0,
      aiResponses: Object.keys(d.aiResponses ?? {}).length,
    };
  });
  expect(data, 'window.CircuitLabData should exist (src/data/data.js imported in src/main.js)').not.toBeNull();
  for (const [key, count] of Object.entries(data)) {
    expect(count, `${key} should not be empty`).toBeGreaterThan(0);
  }
  expectNoErrors(errors);
});

/* ── Every screen ─────────────────────────────────────────────── */
for (const view of VIEWS) {
  test(`opens the ${view} screen`, async ({ page, errors }) => {
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

/* ── 3D viewer first load ─────────────────────────────────────── */
test('3D viewer shows a model the first time it is opened', async ({ page, errors }) => {
  await openApp(page);
  await goToView(page, 'viewer'); // one visit only: the model must not need a second visit (D15)
  await waitForStableModel(page);
  expectNoErrors(errors);
});

test('loading text is hidden once the model is shown', async ({ page, errors }) => {
  await openApp(page);
  await goToView(page, 'viewer'); // makes sure a model is drawn, so only the text is being tested
  await waitForStableModel(page);
  await expect(page.locator('#viewer-loading')).toBeHidden();
  expectNoErrors(errors);
});

/* ── Search ───────────────────────────────────────────────────── */
test('search finds a component', async ({ page, errors }) => {
  await openApp(page);
  await page.keyboard.press('Control+k');
  const input = page.locator('#modal-search-input');
  await expect(input).toBeVisible();

  await input.fill('esp32');
  await expect(page.locator('#modal-search-results .search-result-item').first()).toContainText(/esp32/i);
  expectNoErrors(errors);
});

/* ── AI assistant ─────────────────────────────────────────────── */
// Calls the answer engine directly, so it is tested separately from the Send button (B1/B3).
// Answer quality is D1 and is not checked here.
test('AI answer engine replies without errors', async ({ page, errors }) => {
  await openApp(page);
  await page.evaluate(() => window.CircuitApp.sendAIMessage('how does an esp32 work'));

  await expect
    .poll(() => page.evaluate(() => window.CircuitApp.getState().aiMessages.filter((m) => m.role === 'assistant').length), {
      message: 'an assistant reply should be added',
    })
    .toBeGreaterThan(0);
  expectNoErrors(errors);
});

test('AI assistant replies to a question', async ({ page, errors }) => {
  knownBug('B1', 'B3');

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
