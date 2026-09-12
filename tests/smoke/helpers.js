import { test as base, expect } from '@playwright/test';

/* ── Known noise ────────────────────────────────────────────────
   Console errors that are tracked as separate issues and must not
   fail the smoke tests. Remove an entry when its issue is fixed.
──────────────────────────────────────────────────────────────── */
const IGNORED_CONSOLE_ERRORS = [
  { issue: 'E2', match: (text, url) => /favicon\.ico/.test(url) },
  { issue: 'E2', match: (text, url) => /manifest\.json/.test(url) || /^Manifest:/.test(text) },
];

export const VIEWS = ['viewer', 'simulator', 'database', 'boards', 'datasheet', 'ai', 'projects', 'settings'];

/* ── Fixtures ─────────────────────────────────────────────────── */
export const test = base.extend({
  // Every uncaught exception and unexpected console.error on the page.
  // They are also attached to the report, so the real cause is visible
  // even when a different assertion fails first.
  errors: async ({ page }, use, testInfo) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(`Uncaught ${err.name}: ${err.message}`));
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      const text = msg.text();
      const url = msg.location().url || '';
      if (IGNORED_CONSOLE_ERRORS.some((rule) => rule.match(text, url))) return;
      errors.push(`console.error: ${text}${url ? ` (${url})` : ''}`);
    });
    await use(errors);
    if (errors.length) {
      await testInfo.attach('page-errors', { body: errors.join('\n'), contentType: 'text/plain' });
    }
  },
});

export { expect };

/* ── Helpers ──────────────────────────────────────────────────── */

// Open the app and wait until it has fully started (app + 3D viewer).
export async function openApp(page) {
  await page.goto('/');
  await page.waitForFunction(() => window.CircuitApp && window.ThreeViewer && window.ThreeViewer.isReady());
}

// Click a sidebar menu item and wait for its screen to show.
export async function goToView(page, view) {
  await page.locator(`.nav-item[data-view="${view}"]`).click();
  await expect(page.locator(`#view-${view}`)).toBeVisible();
}

// Give timers started by the last action (e.g. setTimeout in panel setup) a moment to run.
export async function settle(page, ms = 300) {
  await page.waitForTimeout(ms);
}

// Fail with the full list of errors, so the report shows exactly what broke.
export function expectNoErrors(errors) {
  expect(errors, `Page errors:\n${errors.join('\n')}`).toEqual([]);
}
