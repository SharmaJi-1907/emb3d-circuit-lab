/* ═══════════════════════════════════════════════════════════════════
   Project hygiene: what the page loads and what it no longer loads.
   E2 (missing manifest/favicon), E3 (CSS loaded twice), E10 (GSAP
   loaded but unused), E12 (dead CSS), E14 (font CDN fails tests),
   E7 (Three.js from a CDN, so no 3D without the internet), E16 (unused leftovers).
═══════════════════════════════════════════════════════════════════ */

import { readFile } from 'node:fs/promises';

import { test, expect, openApp, appReady, expectNoErrors, waitForViewer, goToView, waitForStableModel } from './helpers.js';

test('the page loads with no console errors at all (E2)', async ({ page, errors }) => {
  // The known-noise list used to hide a missing favicon and manifest.
  const failures = [];
  page.on('response', (r) => {
    if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`);
  });

  await openApp(page);
  expect(failures, 'nothing the page asks for should 404').toEqual([]);
  expectNoErrors(errors);
});

test('the manifest and favicon are really there (E2)', async ({ page }) => {
  for (const path of ['/manifest.json', '/favicon.svg']) {
    const res = await page.request.get(path);
    expect(res.status(), `${path} should be served`).toBe(200);
  }
  const manifest = await (await page.request.get('/manifest.json')).json();
  expect(manifest.name, 'the manifest names the app').toMatch(/circuit/i);
  expect(Array.isArray(manifest.icons), 'the manifest lists icons').toBe(true);
});

test('GSAP is no longer downloaded (E10)', async ({ page, errors }) => {
  const asked = [];
  page.on('request', (r) => {
    if (/gsap|scrolltrigger/i.test(r.url())) asked.push(r.url());
  });

  await openApp(page);
  expect(asked, 'nothing uses GSAP, so it should not be fetched').toEqual([]);
  expect(await page.evaluate(() => typeof window.gsap)).toBe('undefined');
  expectNoErrors(errors);
});

test('FontAwesome is no longer downloaded, and the AI avatar still shows (E10)', async ({ page, errors }) => {
  const asked = [];
  page.on('request', (r) => {
    if (/font-?awesome/i.test(r.url())) asked.push(r.url());
  });

  await openApp(page);
  expect(asked, 'one icon does not justify a whole icon font').toEqual([]);

  await page.locator('.nav-item[data-view="ai"]').click();
  const avatar = page.locator('.ai-avatar-large');
  await expect(avatar).toBeVisible();
  await expect(avatar, 'the avatar still has its icon').not.toBeEmpty();
  expectNoErrors(errors);
});

test('the stylesheet is loaded once, not twice (E3)', async ({ page, errors }) => {
  await openApp(page);
  const links = await page.evaluate(() =>
    [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.getAttribute('href')));
  expect(links.filter((h) => /main\.css/.test(h || '')),
    'main.css is imported by src/main.js, so the page must not link it too').toEqual([]);
  expectNoErrors(errors);
});

test('the dead simulator and datasheet CSS is gone (E12)', async () => {
  // Read the source: the dev server wraps CSS in a JS module for hot reload.
  const css = await readFile(new URL('../../src/styles/main.css', import.meta.url), 'utf8');
  // IDs the page has never had — the working styles live in styles/views/.
  for (const dead of ['#sim-toolbar', '#sim-palette', '#sim-canvas-area', '#sim-instruments',
    '.datasheet-toc', '.toc-item', '.datasheet-content', '#ai-input-area']) {
    expect(css, `${dead} targets markup this app does not have`).not.toContain(dead);
  }
});

test('the notifications say something real (E5)', async ({ page, errors }) => {
  await openApp(page);
  await page.locator('#notif-btn').click();

  const counts = await page.evaluate(() => ({
    components: window.CircuitLabData.components.length,
    boards: Object.keys(window.CircuitLabData.boards).length,
  }));
  const text = await page.locator('#notif-list-body').textContent();
  expect(text, 'the feed should quote the real component count').toContain(String(counts.components));
  expect(text, 'the feed should quote the real board count').toContain(String(counts.boards));
  expect(text, 'no made-up timestamps').not.toMatch(/3 mins ago|10 mins ago/);
  expectNoErrors(errors);
});

test('a font CDN hiccup does not fail a test (E14)', async ({ page, errors }) => {
  // Block the font CDNs outright: the app must still start and report no errors.
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  await page.goto('/');
  await appReady(page);
  await expect(page.locator('#view-dashboard')).toBeVisible();
  expectNoErrors(errors);
});

test('Three.js is bundled, not downloaded from a CDN (E7)', async ({ page, errors }) => {
  const asked = [];
  page.on('request', (r) => {
    // Only other hosts count: in dev, Vite serves the bundled copy from /node_modules/.vite/deps/three.js.
    const url = new URL(r.url());
    if (url.hostname !== 'localhost' && /three|cdnjs/i.test(r.url())) asked.push(r.url());
  });

  await openApp(page);
  await waitForViewer(page);
  expect(asked, 'Three.js comes from the app bundle').toEqual([]);
  expectNoErrors(errors);
});

test('the 3D Viewer works with no internet (E7)', async ({ page, errors }) => {
  // Block everything that is not this app. The font CDNs failing is known noise (E14).
  const warnings = [];
  page.on('console', (msg) => { if (msg.type() === 'warning' && /THREE/.test(msg.text())) warnings.push(msg.text()); });
  await page.route((url) => url.hostname !== 'localhost', (route) => route.abort());

  await page.goto('/');
  await appReady(page);
  await waitForViewer(page);
  await goToView(page, 'viewer');
  await waitForStableModel(page);
  expect(warnings, 'no Three.js deprecation warnings').toEqual([]);
  expectNoErrors(errors);
});

test('unused leftovers are gone (E16)', async ({ page, errors }) => {
  await openApp(page);
  await expect(page.locator('#particle-field'), 'an empty div nothing drew into').toHaveCount(0);

  // Your projects live under circuitlab.my-projects (C4); the old key was only ever read.
  const state = await page.evaluate(() => window.CircuitApp.getState());
  expect('projects' in state, 'state.projects was never read').toBe(false);
  const src = await (await page.request.get('/src/app/app.js')).text();
  expect(src, 'nothing writes circuitlab-projects, so nothing should read it').not.toContain('circuitlab-projects');
  expectNoErrors(errors);
});
