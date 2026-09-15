/* ═══════════════════════════════════════════════════════════════════
   AI Assistant chat: B1–B3, F6, F7, and which answer is picked (D1).
   The screen keeps the index.html markup (ADR 0002): #ai-user-query,
   #ai-send-btn, #ai-chat-messages.
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

/* ── Answers (D1) ─────────────────────────────────────────────── */
const LED = 'topic:What resistor do I need for an LED at 5V?';
const I2C = 'topic:How do I wire an I2C sensor to Arduino?';
const BLINK = 'topic:Generate Arduino blink code';
const ESP32 = 'topic:Explain how an ESP32 works';
const SPI = 'topic:SPI vs I2C';
const PWM = 'topic:PWM frequency';

// Which answer the engine picks for each question, keyed by question:
// 'topic:<stored question>', 'part:<component id>' or 'fallback'.
function answersFor(page, questions) {
  return page.evaluate((qs) => {
    const d = window.CircuitLabData;
    const label = (answer) => {
      const topic = Object.keys(d.aiResponses).find((k) => d.aiResponses[k] === answer);
      if (topic) return `topic:${topic}`;
      const part = d.components.find((c) => answer.startsWith(`**${c.name}** by`));
      if (part) return `part:${part.id}`;
      return answer.startsWith('I can help with that!') ? 'fallback' : 'unknown';
    };
    return Object.fromEntries(qs.map((q) => [q, label(window.CircuitApp.getAIResponse(q))]));
  }, questions);
}

// Check a list of [question, expected answer] pairs; the diff names every wrong one.
async function expectAnswers(page, cases) {
  expect(await answersFor(page, cases.map(([q]) => q))).toEqual(Object.fromEntries(cases));
}

test('every stored question gets its own answer (D1)', async ({ page, errors }) => {
  await openApp(page);
  const stored = await page.evaluate(() => Object.keys(window.CircuitLabData.aiResponses));
  await expectAnswers(page, stored.map((q) => [q, `topic:${q}`]));
  expectNoErrors(errors);
});

test('questions are matched by their topic words, not their first word (D1)', async ({ page, errors }) => {
  await openApp(page);
  await expectAnswers(page, [
    ['how many ohms for an led on 3.3v', LED],
    ['resistor value for a blue led', LED],
    ['what are SDA and SCL', I2C],
    ['i2c pull-up resistors', I2C],
    ['make an LED blink', BLINK],
    ['blinking led without delay', BLINK],
    ['how does an esp32 work', ESP32],
    ['does the esp32 have wifi and bluetooth', ESP32],
    ['what is the difference between spi and i2c', SPI],
    ['which is faster, spi or i2c?', SPI],
    ['what is pwm', PWM],
    ['dim an led with pwm', PWM],
  ]);
  expectNoErrors(errors);
});

test('a named part gets that part\'s card, however it is written (D1)', async ({ page, errors }) => {
  await openApp(page);
  await expectAnswers(page, [
    ['tell me about the NE555', 'part:ne555'],
    ['What is the timing equation for NE555 Astable Mode?', 'part:ne555'], // suggestion chip
    ['Explain datasheet specifications and alt functions for ATmega328P microcontroller.', 'part:atmega328p'], // Datasheet "Ask AI"
    ['how do I use the MPU-6050', 'part:mpu6050'],
    ['how do I use the mpu6050', 'part:mpu6050'],
    ['how do I use the mpu 6050', 'part:mpu6050'],
    ['what is the pinout of the hc sr04', 'part:hc-sr04'],
    ['nrf24l01+ wiring', 'part:nrf24l01'],
  ]);
  expectNoErrors(errors);
});

test('unrelated questions get the "be more specific" reply (D1)', async ({ page, errors }) => {
  await openApp(page);
  await expectAnswers(page, ['hello', 'what time is it', 'can you show me something', 'do you like pizza'].map((q) => [q, 'fallback']));
  expectNoErrors(errors);
});

test('asking "how does an esp32 work" shows the ESP32 overview (D1)', async ({ page, errors }) => {
  await openAI(page);
  await ask(page, 'how does an esp32 work');
  await expect(bubbles(page, 'assistant').locator('.ai-message-content')).toContainText('ESP32 Architecture Overview');
  expectNoErrors(errors);
});

/* ── Safe text and code blocks (D6, D7) ───────────────────────── */
// A fenced code block in the stored answers: ```lang\n<code>\n```
const CODE_BLOCK = /```[^\n]*\n([\s\S]*?)\n?```/g;

test('typed HTML shows as text and does not run (D6)', async ({ page, errors }) => {
  await openAI(page);
  const typed = ['<img src="data:," onerror="window.__d6 = 1">', '<b>not bold</b>'];
  for (const text of typed) await ask(page, text);
  await expect(userTexts(page)).toHaveText(typed);
  await expect(chat(page).locator('.ai-message img, .ai-message b')).toHaveCount(0);
  expect(await page.evaluate(() => window.__d6), 'typed onerror code must not run').toBeUndefined();
  expectNoErrors(errors);
});

test('every code block in the stored answers shows as one block with the exact code (D7)', async ({ page, errors }) => {
  await openAI(page);
  const answers = await page.evaluate(() => Object.entries(window.CircuitLabData.aiResponses));
  const expected = [];
  for (const [question, answer] of answers) {
    const blocks = [...answer.matchAll(CODE_BLOCK)].map((m) => m[1]);
    if (!blocks.length) continue;
    await ask(page, question);
    expected.push(...blocks);
  }
  expect(expected.length, 'the stored answers should contain code blocks').toBeGreaterThan(0);
  expect(await chat(page).locator('pre.ai-code').allTextContents()).toEqual(expected);
  const brokenCode = await chat(page).locator('.ai-message code').evaluateAll((els) => els.filter((el) => /^[\s`]*$/.test(el.textContent)).length);
  expect(brokenCode, 'no empty or backtick-only <code> boxes').toBe(0);
  await expect(chat(page)).toContainText('#include <Wire.h>');
  expectNoErrors(errors);
});

test('code inside a code block has no inline-code box (D7)', async ({ page, errors }) => {
  await openAI(page);
  await ask(page, 'Generate Arduino blink code');
  const code = chat(page).locator('pre.ai-code code').first();
  await expect(code, 'the reply should contain a code block').toBeVisible();
  expect(await code.evaluate((el) => el.getAttribute('style'))).toBeNull();
  const s = await styleOf(page, '#ai-chat-messages pre.ai-code code', ['backgroundColor', 'borderTopWidth', 'paddingLeft']);
  expect(s).toEqual({ backgroundColor: TRANSPARENT, borderTopWidth: '0px', paddingLeft: '0px' });
  expectNoErrors(errors);
});

// Guard: escaping must not break the formatting that already worked.
test('inline code, bold and & still show in messages', async ({ page, errors }) => {
  await openAI(page);
  await ask(page, 'use `digitalWrite()` for **fast** pins & more');
  const bubble = userTexts(page).first();
  await expect(bubble.locator('code')).toHaveText('digitalWrite()');
  await expect(bubble.locator('strong')).toHaveText('fast');
  await expect(bubble).toHaveText('use digitalWrite() for fast pins & more');
  expectNoErrors(errors);
});
