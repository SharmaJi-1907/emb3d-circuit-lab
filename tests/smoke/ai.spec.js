/* ═══════════════════════════════════════════════════════════════════
   AI Assistant chat: B1–B3, F6, F7.
   The screen keeps the index.html markup (ADR 0002): #ai-user-query,
   #ai-send-btn, #ai-chat-messages. Answer quality is D1 and is not
   checked here.
═══════════════════════════════════════════════════════════════════ */

import { test, expect, openApp, goToView, expectNoErrors, styleOf } from './helpers.js';

const TRANSPARENT = 'rgba(0, 0, 0, 0)';
const BROWSER_GREY = 'rgb(239, 239, 239)';

const chat = (page) => page.locator('#ai-chat-messages');
const bubbles = (page, role) => page.locator(`#ai-chat-messages .ai-message.${role}`);
const userTexts = (page) => bubbles(page, 'user').locator('.ai-message-content');
const userMessagesInState = (page) => page.evaluate(() => window.CircuitApp.getState().aiMessages.filter((m) => m.role === 'user').length);

async function openAI(page) {
  await openApp(page);
  await goToView(page, 'ai');
}

// Type a question, press Enter and wait for its reply to show.
async function ask(page, question) {
  const replies = await bubbles(page, 'assistant').count();
  await page.locator('#ai-user-query').fill(question);
  await page.locator('#ai-user-query').press('Enter');
  await expect(bubbles(page, 'assistant')).toHaveCount(replies + 1);
}

/* ── Sending ──────────────────────────────────────────────────── */
test('clicking the arrow icon in Send shows the question and a reply (B3)', async ({ page, errors }) => {
  await openAI(page);
  await page.locator('#ai-user-query').fill('how does an esp32 work');
  await page.locator('#ai-send-btn svg').click(); // the icon fills the middle of the button
  await expect(userTexts(page)).toHaveText(['how does an esp32 work']);
  await expect(bubbles(page, 'assistant')).toHaveCount(1);
  expectNoErrors(errors);
});

test('Enter sends exactly one message and clears the input (B2)', async ({ page, errors }) => {
  await openAI(page);
  await ask(page, 'what resistor do I need for an LED');
  await expect(userTexts(page)).toHaveText(['what resistor do I need for an LED']);
  await expect(page.locator('#ai-user-query')).toHaveValue('');
  expect(await userMessagesInState(page), 'one Enter = one message').toBe(1);
  expectNoErrors(errors);
});

test('a suggestion chip sends its question (B1)', async ({ page, errors }) => {
  await openAI(page);
  const chip = page.locator('#view-ai .ai-suggestion-chip').first();
  const question = await chip.getAttribute('data-query');
  await chip.click();
  await expect(userTexts(page)).toHaveText([question]);
  await expect(bubbles(page, 'assistant')).toHaveCount(1);
  expectNoErrors(errors);
});

test('the welcome message stays above the chat (B1)', async ({ page, errors }) => {
  await openAI(page);
  await ask(page, 'hello');
  const firstIsWelcome = await chat(page).evaluate((el) => el.firstElementChild.classList.contains('chat-bubble'));
  expect(firstIsWelcome, 'welcome bubble should still be the first item').toBe(true);
  await expect(bubbles(page, 'user')).toHaveCount(1);
  expectNoErrors(errors);
});

test('leaving and coming back still sends one message per Enter', async ({ page, errors }) => {
  await openAI(page);
  await goToView(page, 'dashboard');
  await goToView(page, 'ai');
  await ask(page, 'what is pwm');
  expect(await userMessagesInState(page), 'buttons must be wired only once').toBe(1);
  await expect(bubbles(page, 'user')).toHaveCount(1);
  expectNoErrors(errors);
});

test('datasheet "Ask AI" shows its question in the chat (B1)', async ({ page, errors }) => {
  await openApp(page);
  await goToView(page, 'datasheet');
  await page.locator('#ds-ai-explain').click();
  await expect(page.locator('#view-ai')).toBeVisible();
  await expect(userTexts(page)).toContainText([/Explain datasheet/]);
  expectNoErrors(errors);
});

/* ── Layout (F7) ──────────────────────────────────────────────── */
test('the chat scrolls inside its box and the input stays on screen (F7)', async ({ page, errors }) => {
  await openAI(page);
  for (const q of ['what resistor do I need for an LED', 'how do I wire an i2c sensor', 'what is pwm']) {
    await ask(page, q);
  }
  expect(await chat(page).evaluate((el) => el.scrollHeight > el.clientHeight), 'chat should scroll, not grow').toBe(true);
  await expect(page.locator('#ai-user-query')).toBeInViewport();
  await expect(bubbles(page, 'assistant').last(), 'newest reply should be scrolled into view').toBeInViewport();
  expectNoErrors(errors);
});

test('the AI screen has the same side padding as other screens (F7)', async ({ page, errors }) => {
  await openAI(page);
  const inlinePadding = await page.locator('#view-ai').evaluate((el) => el.style.padding);
  expect(inlinePadding, 'no inline style may override the padding').toBe('');
  const s = await styleOf(page, '#view-ai', ['paddingLeft', 'paddingTop']);
  expect(s).toEqual({ paddingLeft: '20px', paddingTop: '20px' });
  expectNoErrors(errors);
});

/* ── Styles (F6) ──────────────────────────────────────────────── */
test('chips, welcome and message bubbles are styled (F6)', async ({ page, errors }) => {
  await openAI(page);

  const chip = await styleOf(page, '#view-ai .ai-suggestion-chip', ['backgroundColor', 'borderTopWidth', 'fontSize']);
  expect(chip.backgroundColor, 'chip should not be browser grey').not.toBe(BROWSER_GREY);
  expect(chip).toMatchObject({ borderTopWidth: '1px', fontSize: '11px' });

  const welcome = await styleOf(page, '#ai-chat-messages .chat-bubble', ['backgroundColor', 'borderTopWidth']);
  expect(welcome.backgroundColor, 'welcome bubble background').not.toBe(TRANSPARENT);
  expect(welcome.borderTopWidth).toBe('1px');

  await ask(page, 'what resistor do I need for an LED');
  for (const role of ['user', 'assistant']) {
    const bubble = await styleOf(page, `.ai-message.${role} .ai-message-content`, ['backgroundColor', 'borderTopWidth', 'borderTopLeftRadius']);
    expect(bubble.backgroundColor, `${role} bubble background`).not.toBe(TRANSPARENT);
    expect(bubble).toMatchObject({ borderTopWidth: '1px', borderTopLeftRadius: '12px' });
  }
  expect(await styleOf(page, '.ai-message-avatar', ['width', 'borderTopLeftRadius'])).toEqual({ width: '32px', borderTopLeftRadius: '50%' });
  expect(await styleOf(page, '.ai-message-time', ['fontSize'])).toEqual({ fontSize: '9px' });
  expectNoErrors(errors);
});
