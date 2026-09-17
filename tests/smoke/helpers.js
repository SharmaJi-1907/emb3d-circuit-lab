import { test as base, expect } from '@playwright/test';

/* ── Known noise ────────────────────────────────────────────────
   Console errors that are tracked as separate issues and must not
   fail the smoke tests. Remove an entry when its issue is fixed.
──────────────────────────────────────────────────────────────── */
const IGNORED_CONSOLE_ERRORS = [
  // The fonts come from Google's CDN. A hiccup there is not a bug in this app,
  // but the fixture below would otherwise fail whichever test was running (E14).
  { issue: 'E14', match: (text, url) => /fonts\.(googleapis|gstatic)\.com/.test(url) },
];

// Sidebar order. The Dashboard is the home screen (ADR 0002).
export const VIEWS = ['dashboard', 'viewer', 'simulator', 'database', 'boards', 'datasheet', 'ai', 'projects', 'settings'];

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

/* ── Known bugs ───────────────────────────────────────────────────
   A test marked with knownBug('<code>') is EXPECTED to fail until the
   bug is fixed. When a fix makes it pass, Playwright reports it as failed
   ("expected to fail, but passed"), so remove the knownBug() line in the
   same branch as the fix. Codes refer to docs/FIX_PLAN.md.
──────────────────────────────────────────────────────────────── */
export function knownBug(...codes) {
  test.fail(true, `Known bug ${codes.join(', ')} — see docs/FIX_PLAN.md`);
}

/* ── Helpers ──────────────────────────────────────────────────── */

// Read a few computed style properties of the first element matching `selector`.
export function styleOf(page, selector, props) {
  return page.locator(selector).first().evaluate((el, names) => {
    const s = getComputedStyle(el);
    return Object.fromEntries(names.map((n) => [n, s[n]]));
  }, props);
}

// Wait until the app has started. This does NOT wait for the 3D engine:
// headless Chrome builds WebGL in software, and most screens never show 3D,
// so waiting for it on every test cost the whole suite time (E15).
// Tests that need the engine call waitForViewer() or openViewer().
export async function appReady(page) {
  await page.waitForFunction(() => window.CircuitApp && window.CircuitLabData);
}

// Open the app and wait until it has started.
export async function openApp(page) {
  await page.goto('/');
  await appReady(page);
}

// Wait until the 3D engine has finished starting up. The engine is downloaded
// the first time the 3D Viewer opens (E18), so open the Viewer before this.
export async function waitForViewer(page) {
  await page.waitForFunction(() => window.ThreeViewer && window.ThreeViewer.isReady());
}

// Open the app, go to the 3D Viewer and wait until its model has finished loading.
export async function openViewer(page) {
  await openApp(page);
  await goToView(page, 'viewer');
  await waitForViewer(page);
  await waitForStableModel(page);
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

// Size of the loaded 3D model as [x, y, z], or null if there is no model or its position is broken (NaN).
export async function modelSize(page) {
  // The engine may not have started yet when a test reaches the Viewer by
  // navigating rather than through openViewer(), so this waits rather than throws.
  const bounds = await page.evaluate(() => window.ThreeViewer?.getModelBounds?.() ?? null);
  if (!bounds) return null;
  const size = bounds.max.map((max, i) => max - bounds.min[i]);
  return size.every((n) => Number.isFinite(n) && n > 0) ? size : null;
}

// Wait until a 3D model is loaded and its grow-in animation has finished:
// the same size 3 readings in a row, 300 ms apart. (Timers run slowly in headless Chrome.)
export async function waitForStableModel(page) {
  const readings = [];
  await expect
    .poll(
      async () => {
        readings.push(await modelSize(page));
        const [a, b, c] = readings.slice(-3);
        return Boolean(a && b && c && a.every((n, i) => n === b[i] && n === c[i]));
      },
      { message: 'a 3D model should finish loading', timeout: 10_000, intervals: [300] },
    )
    .toBe(true);
}

// Fail with the full list of errors, so the report shows exactly what broke.
export function expectNoErrors(errors) {
  expect(errors, `Page errors:\n${errors.join('\n')}`).toEqual([]);
}
