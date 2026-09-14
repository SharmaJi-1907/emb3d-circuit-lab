/* ═══════════════════════════════════════════════════════════════════
   Shared page styles (F2, ADR 0002).
   Checks computed styles on the building blocks used by the screens
   that keep index.html markup. Computed values are deterministic,
   unlike screenshots.
═══════════════════════════════════════════════════════════════════ */

import { test, expect, openApp, goToView, expectNoErrors } from './helpers.js';

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

// Read a few computed style properties of the first element matching `selector`.
function styleOf(page, selector, props) {
  return page.locator(selector).first().evaluate((el, names) => {
    const s = getComputedStyle(el);
    return Object.fromEntries(names.map((n) => [n, s[n]]));
  }, props);
}

test('sidebar buttons have no browser-grey background at rest', async ({ page, errors }) => {
  await openApp(page);
  // The Viewer is active on start, so Settings is a resting (not hovered, not active) button.
  const s = await styleOf(page, '.nav-item[data-view="settings"]', ['backgroundColor']);
  expect(s.backgroundColor).toBe(TRANSPARENT);
  expectNoErrors(errors);
});

test('top-bar icon buttons are transparent with a thin border', async ({ page, errors }) => {
  await openApp(page);
  const s = await styleOf(page, '#theme-toggle', ['backgroundColor', 'borderTopWidth', 'width']);
  expect(s).toEqual({ backgroundColor: TRANSPARENT, borderTopWidth: '1px', width: '32px' });
  expectNoErrors(errors);
});

test('glass panels look like cards', async ({ page, errors }) => {
  await openApp(page);
  await goToView(page, 'settings');
  const s = await styleOf(page, '#view-settings .glass-panel', ['backgroundColor', 'borderTopWidth']);
  expect(s.backgroundColor, 'card background').not.toBe(TRANSPARENT);
  expect(s.borderTopWidth, 'card border').toBe('1px');
  expectNoErrors(errors);
});

test('panel titles are small uppercase labels', async ({ page, errors }) => {
  await openApp(page);
  await goToView(page, 'datasheet');
  const s = await styleOf(page, '#view-datasheet .panel-title', ['textTransform', 'fontSize']);
  expect(s).toEqual({ textTransform: 'uppercase', fontSize: '11px' });
  expectNoErrors(errors);
});

test('screen titles use the shared title size', async ({ page, errors }) => {
  await openApp(page);
  await goToView(page, 'settings');
  const s = await styleOf(page, '#view-settings .view-title', ['fontSize', 'fontWeight']);
  expect(s).toEqual({ fontSize: '22px', fontWeight: '600' });
  expectNoErrors(errors);
});
