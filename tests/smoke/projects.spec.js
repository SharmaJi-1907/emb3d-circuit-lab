/* ═══════════════════════════════════════════════════════════════════
   Projects screen: the "New Project" button and the project grid (C4).
   The screen keeps the index.html markup (ADR 0002); projects you make
   are kept in the browser, separate from the 6 stored examples.
═══════════════════════════════════════════════════════════════════ */

import { test, expect, openApp, appReady, goToView, expectNoErrors, styleOf } from './helpers.js';

const BROWSER_GREY = 'rgb(239, 239, 239)';

async function openProjects(page) {
  await openApp(page);
  await goToView(page, 'projects');
}

// Real project cards. The "name your project" form is drawn as a card too,
// so it is excluded here.
const cards = (page) => page.locator('#projects-grid .project-card:not(.project-card-new)');
const mine = (page) => page.locator('#projects-grid .project-card.is-mine');

// Fill the new-project form and submit it.
async function createProject(page, name) {
  await page.locator('#create-project-btn').click();
  await page.locator('#new-project-name').fill(name);
  await page.locator('#new-project-create').click();
}

test('the grid shows every stored project (C4)', async ({ page, errors }) => {
  await openProjects(page);
  const stored = await page.evaluate(() => window.CircuitLabData.projects.length);
  expect(stored, 'the sample projects').toBeGreaterThan(0);
  await expect(cards(page)).toHaveCount(stored);
  await expect(cards(page).first().locator('.project-card-name')).not.toBeEmpty();
  expectNoErrors(errors);
});

test('"New Project" opens a form, not a "coming soon" message (C4)', async ({ page, errors }) => {
  await openProjects(page);
  await expect(page.locator('#new-project-name')).toHaveCount(0);

  await page.locator('#create-project-btn').click();
  await expect(page.locator('#new-project-name'), 'a form to name the project').toBeVisible();
  await expect(page.locator('#new-project-create')).toBeVisible();

  // Cancel puts the grid back as it was.
  const before = await cards(page).count();
  await page.locator('#new-project-cancel').click();
  await expect(page.locator('#new-project-name')).toHaveCount(0);
  await expect(cards(page)).toHaveCount(before);
  expectNoErrors(errors);
});

test('creating a project adds a card that opens the simulator (C4)', async ({ page, errors }) => {
  await openProjects(page);
  const before = await cards(page).count();

  await createProject(page, 'Blinky test rig');
  await expect(cards(page)).toHaveCount(before + 1);
  await expect(mine(page)).toHaveCount(1);
  await expect(mine(page).locator('.project-card-name')).toHaveText('Blinky test rig');
  await expect(page.locator('#new-project-name'), 'the form closes again').toHaveCount(0);

  await mine(page).locator('.btn-primary').click();
  await expect(page.locator('#view-simulator')).toBeVisible();
  expectNoErrors(errors);
});

test('an empty name is refused and nothing is added (C4)', async ({ page, errors }) => {
  await openProjects(page);
  const before = await cards(page).count();

  await page.locator('#create-project-btn').click();
  await page.locator('#new-project-name').fill('   ');
  await page.locator('#new-project-create').click();

  await expect(cards(page), 'no card for a blank name').toHaveCount(before);
  await expect(page.locator('#new-project-name'), 'the form stays open').toBeVisible();
  expectNoErrors(errors);
});

test('a project name is shown as text, never as HTML (C4)', async ({ page, errors }) => {
  await openProjects(page);
  await createProject(page, '<img src=x onerror=alert(1)> & "quoted"');

  const card = mine(page).first();
  await expect(card.locator('img'), 'typed HTML must not become an element').toHaveCount(0);
  await expect(card.locator('.project-card-name')).toHaveText('<img src=x onerror=alert(1)> & "quoted"');
  expectNoErrors(errors);
});

test('projects you make survive a reload, and can be deleted (C4)', async ({ page, errors }) => {
  await openProjects(page);
  const stored = await cards(page).count();
  await createProject(page, 'Keeps its place');
  await expect(cards(page)).toHaveCount(stored + 1);

  await page.reload();
  await appReady(page);
  await goToView(page, 'projects');
  await expect(mine(page), 'still there after a reload').toHaveCount(1);
  await expect(mine(page).locator('.project-card-name')).toHaveText('Keeps its place');

  await mine(page).locator('.project-delete').click();
  await expect(mine(page)).toHaveCount(0);
  await expect(cards(page)).toHaveCount(stored);
  expectNoErrors(errors);
});

test('the Projects screen is styled (C4)', async ({ page, errors }) => {
  await openProjects(page);
  const btn = await styleOf(page, '#create-project-btn', ['backgroundColor', 'cursor']);
  expect(btn.backgroundColor, 'the button should not be browser grey').not.toBe(BROWSER_GREY);
  expect(btn.cursor).toBe('pointer');

  const scrolls = await page.locator('#view-projects').evaluate((v) => v.scrollHeight > v.clientHeight + 1);
  expect(scrolls, 'the screen should fit without scrolling').toBe(false);
  expectNoErrors(errors);
});

/* ── Final clean-up (D31, D43, D47) ───────────────────────────── */
test('the "Created" toast shows a typed name as text, never as HTML (D31)', async ({ page, errors }) => {
  await openProjects(page);
  await createProject(page, '<img src=x onerror="window.__xss = 1">');
  const toast = page.locator('.toast', { hasText: 'Created' });
  await expect(toast).toBeVisible();
  await expect(toast.locator('img'), 'typed HTML must not become an element').toHaveCount(0);
  await expect(toast).toContainText('<img src=x');
  expect(await page.evaluate(() => window.__xss), 'the typed code must not run').toBeUndefined();
  expectNoErrors(errors);
});

test('a project id from storage cannot run code when its card is deleted (D31)', async ({ page, errors }) => {
  await openApp(page);
  await page.evaluate(() => localStorage.setItem('circuitlab.my-projects',
    JSON.stringify([{ id: "x');window.__xss=1;('", name: 'Edited by hand', createdAt: Date.now() }])));
  await page.reload();
  await appReady(page);
  await goToView(page, 'projects');
  await mine(page).locator('.project-delete').click();
  await expect(mine(page), 'the project is deleted').toHaveCount(0);
  expect(await page.evaluate(() => window.__xss), 'the stored id must not run as code').toBeUndefined();
  expectNoErrors(errors);
});

test('your project says when it was made, not "just now" forever (D43)', async ({ page, errors }) => {
  await openApp(page);
  await page.evaluate(() => localStorage.setItem('circuitlab.my-projects',
    JSON.stringify([{ id: 'mine-1', name: 'Three days old', createdAt: Date.now() - 3 * 24 * 3600 * 1000 }])));
  await page.reload();
  await appReady(page);
  await goToView(page, 'projects');
  await expect(mine(page).locator('.project-modified')).toHaveText('3 days ago');
  expectNoErrors(errors);
});

test('your project keeps its circuit, and each project has its own (D47)', async ({ page, errors }) => {
  const parts = () => page.evaluate(() => window.CircuitSimulator.getState().parts);
  await openProjects(page);
  await createProject(page, 'Battery only');
  await createProject(page, 'Empty one');
  const card = (name) => mine(page).filter({ hasText: name });

  await card('Battery only').locator('.btn-primary').click();
  await expect(page.locator('#view-simulator')).toBeVisible();
  await expect.poll(parts, { message: 'a new project starts with an empty board' }).toEqual([]);
  await page.locator('#ws-add-battery').click();
  expect(await parts()).toEqual(['battery']);

  await page.reload();
  await appReady(page);
  await goToView(page, 'projects');
  await card('Empty one').locator('.btn-primary').click();
  await expect.poll(parts, { message: 'the other project has its own, empty board' }).toEqual([]);

  await goToView(page, 'projects');
  await card('Battery only').locator('.btn-primary').click();
  await expect.poll(parts, { message: 'the battery is still there after a reload' }).toEqual(['battery']);
  expectNoErrors(errors);
});
