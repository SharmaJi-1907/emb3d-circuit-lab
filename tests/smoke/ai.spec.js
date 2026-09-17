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

/* ── Screen styles (F8) ───────────────────────────────────────── */
// The hard-coded colours the markup used before F8.
const HARD_CODED = {
  chatBg: 'rgb(7, 7, 10)',      // #07070a
  inputBg: 'rgb(12, 12, 20)',   // #0c0c14
  border: 'rgb(34, 34, 34)',    // #222
  white: 'rgb(255, 255, 255)',  // #fff
};
// Design tokens from src/styles/base/tokens.css.
const TOKEN = {
  border: 'rgba(0, 212, 255, 0.08)',
  borderActive: 'rgba(0, 212, 255, 0.4)',
  bgSurface: 'rgb(10, 10, 20)',
  bgElevated: 'rgb(15, 15, 30)',
  textPrimary: 'rgb(232, 232, 240)',
};

test('the AI screen has no inline styles (F8)', async ({ page, errors }) => {
  await openAI(page);
  // Only the markup inside the screen. The screen element itself carries an
  // inline `display`, which the app's router sets on every screen.
  const withStyle = await page.locator('#view-ai [style]').evaluateAll(
    (els) => els.map((el) => `${el.tagName.toLowerCase()}.${el.className || '(no class)'}: ${el.getAttribute('style')}`),
  );
  expect(withStyle, 'styling belongs in src/styles/views/ai.css, not the markup').toEqual([]);
  const screenInline = await page.locator('#view-ai').evaluate((el) => el.style.cssText);
  expect(screenInline, 'the router may only set display on the screen').toMatch(/^display: \w+;?$/);
  expectNoErrors(errors);
});

test('the chat area and input use the design tokens (F8)', async ({ page, errors }) => {
  await openAI(page);

  const chatBox = await styleOf(page, '#ai-chat-messages', ['backgroundColor', 'borderTopColor', 'borderTopWidth']);
  expect(chatBox.backgroundColor, 'chat background should be a token, not #07070a').not.toBe(HARD_CODED.chatBg);
  expect(chatBox.borderTopColor, 'chat border should be a token, not #222').not.toBe(HARD_CODED.border);
  expect(chatBox).toMatchObject({ backgroundColor: TOKEN.bgSurface, borderTopColor: TOKEN.border, borderTopWidth: '1px' });

  const input = await styleOf(page, '#ai-user-query', ['backgroundColor', 'color', 'borderTopColor']);
  expect(input.backgroundColor, 'input background should be a token, not #0c0c14').not.toBe(HARD_CODED.inputBg);
  expect(input.color, 'input text should be a token, not #fff').not.toBe(HARD_CODED.white);
  expect(input).toMatchObject({ backgroundColor: TOKEN.bgElevated, color: TOKEN.textPrimary, borderTopColor: TOKEN.border });

  // The avatar's gradient uses the cyan and purple tokens.
  const avatar = await styleOf(page, '.ai-avatar-large', ['backgroundImage', 'width', 'borderTopLeftRadius']);
  expect(avatar.backgroundImage, 'avatar gradient').toContain('rgb(0, 212, 255)');
  expect(avatar.backgroundImage, 'avatar gradient').toContain('rgb(123, 47, 255)');
  expect(avatar).toMatchObject({ width: '50px', borderTopLeftRadius: '50%' });
  expectNoErrors(errors);
});

test('the chat input shows no browser focus ring (F8)', async ({ page, errors }) => {
  await openAI(page);
  await page.locator('#ai-user-query').focus();
  expect((await styleOf(page, '#ai-user-query', ['outlineStyle'])).outlineStyle, 'no white browser outline').toBe('none');
  // The border colour fades in over 0.2 s, so wait for it rather than read it once.
  await expect
    .poll(async () => (await styleOf(page, '#ai-user-query', ['borderTopColor'])).borderTopColor,
      { message: 'focus is shown by the border instead' })
    .toBe(TOKEN.borderActive);
  expectNoErrors(errors);
});

test('the AI screen keeps its layout without inline styles (F8)', async ({ page, errors }) => {
  await openAI(page);
  const header = await page.locator('#view-ai .ai-header').boundingBox();
  const chips = await page.locator('#view-ai .ai-suggestions').boundingBox();
  const box = await chat(page).boundingBox();
  const inputArea = await page.locator('#view-ai .ai-input-area').boundingBox();

  expect(chips.y, 'chips sit under the header').toBeGreaterThanOrEqual(header.y + header.height);
  expect(box.y, 'chat sits under the chips').toBeGreaterThanOrEqual(chips.y + chips.height);
  expect(inputArea.y, 'the input sits under the chat').toBeGreaterThanOrEqual(box.y + box.height);
  expect(box.height, 'the chat takes the space that is left').toBeGreaterThan(300);

  // The avatar and the title sit side by side, not stacked.
  const avatar = await page.locator('.ai-avatar-large').boundingBox();
  const title = await page.locator('#view-ai .view-title').boundingBox();
  expect(title.x, 'title is right of the avatar').toBeGreaterThan(avatar.x + avatar.width - 1);

  const scrolls = await page.locator('#view-ai').evaluate((v) => v.scrollHeight > v.clientHeight);
  expect(scrolls, 'the screen itself should not scroll').toBe(false);
  expectNoErrors(errors);
});

/* ── Suggestion chips have real answers (D17) ─────────────────── */
// Every chip's question, read from the page, with the answer it must get.
const CHIP_ANSWERS = {
  'How do I connect the RESET pin?': 'topic:How do I connect the RESET pin?',
  'What is the timing equation for NE555 Astable Mode?': 'topic:What is the timing equation for NE555 Astable Mode?',
  'Can ESP32 pins tolerate 5V signals?': 'topic:Can ESP32 pins tolerate 5V signals?',
};

test('every suggestion chip has its own stored answer (D17)', async ({ page, errors }) => {
  await openAI(page);
  const asked = await page.locator('#view-ai .ai-suggestion-chip').evaluateAll(
    (els) => els.map((el) => el.dataset.query));
  expect(asked, 'the chips still ask these questions').toEqual(Object.keys(CHIP_ANSWERS));
  await expectAnswers(page, Object.entries(CHIP_ANSWERS));
  expectNoErrors(errors);
});

test('a chip question beats the part card, a plain part question does not (D17)', async ({ page, errors }) => {
  await openApp(page);
  await expectAnswers(page, [
    // Asking about the topic wins, even though the question names a part.
    ['What is the timing equation for NE555 Astable Mode?', 'topic:What is the timing equation for NE555 Astable Mode?'],
    ['Can ESP32 pins tolerate 5V signals?', 'topic:Can ESP32 pins tolerate 5V signals?'],
    // Asking about the part itself still gives the part card.
    ['tell me about the NE555', 'part:ne555'],
    ['tell me about the ESP32-WROOM-32', 'part:esp32-wroom'],
    // One passing mention must not hijack an unrelated question.
    ['What resistor do I need for an LED at 5V?', LED],
    ['Explain how an ESP32 works', ESP32],
    ['PWM frequency', PWM],
  ]);
  expectNoErrors(errors);
});

test('the chip answers carry the facts they promise (D17)', async ({ page, errors }) => {
  await openAI(page);
  const answers = await page.evaluate((qs) =>
    Object.fromEntries(qs.map((q) => [q, window.CircuitApp.getAIResponse(q)])), Object.keys(CHIP_ANSWERS));

  const reset = answers['How do I connect the RESET pin?'];
  expect(reset, 'RESET is active low').toMatch(/active\s+LOW/i);
  expect(reset, 'the internal pull-up range').toContain('30–60');
  expect(reset, 'the minimum pulse width').toContain('2.5');

  const ne555 = answers['What is the timing equation for NE555 Astable Mode?'];
  expect(ne555, 'the frequency constant').toContain('1.44');
  expect(ne555, 'the charge/discharge constant').toContain('0.693');
  expect(ne555, 'the RA + 2RB term').toContain('RA + 2RB');

  const esp32 = answers['Can ESP32 pins tolerate 5V signals?'];
  expect(esp32, 'the absolute maximum pin voltage').toContain('3.6 V');
  expect(esp32, 'says plainly that it is not 5V tolerant').toMatch(/not\s+\*?\*?5\s?V\*?\*?\s+tolerant/i);

  // None of them falls back to the "be more specific" reply.
  for (const [q, text] of Object.entries(answers)) {
    expect(text.startsWith('I can help with that!'), `"${q}" should not fall back`).toBe(false);
  }
  expectNoErrors(errors);
});

/* ── Lists and tables in replies (D18) ────────────────────────── */
// The last reply's content element.
const lastReply = (page) => bubbles(page, 'assistant').last().locator('.ai-message-content');

test('a reply shows "- " lines as a real list, not raw text (D18)', async ({ page, errors }) => {
  await openAI(page);
  await ask(page, 'what resistor do I need for an LED');
  const reply = lastReply(page);

  await expect(reply.locator('li').first(), 'the list should have items').toBeVisible();
  expect(await reply.locator('li').count(), 'every "- " line becomes an item').toBeGreaterThan(2);
  expect(await reply.textContent(), 'no raw "- " bullets left').not.toMatch(/(^|\n)- /);
  expectNoErrors(errors);
});

test('separate lists stay separate (D18)', async ({ page, errors }) => {
  await openAI(page);
  // The ESP32 overview has several separate runs of "- " lines with headings
  // between them, so a single <ul> would swallow those headings.
  await ask(page, 'how does an esp32 work');
  const reply = lastReply(page);

  // Count the runs and the lines in the stored answer, so this can't go stale.
  const expected = await page.evaluate(() => {
    const text = window.CircuitApp.getAIResponse('how does an esp32 work').replace(/```[\s\S]*?```/g, '');
    let runs = 0, items = 0, inList = false;
    for (const line of text.split('\n')) {
      const isItem = /^[-•]\s+\S/.test(line.trim());
      if (isItem) { items++; if (!inList) runs++; }
      inList = isItem;
    }
    return { runs, items };
  });
  expect(expected.runs, 'this answer should have several separate lists').toBeGreaterThan(1);

  await expect(reply.locator('ul'), 'one <ul> per run of lines').toHaveCount(expected.runs);
  await expect(reply.locator('li'), 'one <li> per "- " line').toHaveCount(expected.items);

  // The headings sit between the lists, so no list may contain one.
  // (List items do contain bold of their own, e.g. "- **PRO_CPU** (Core 0)".)
  for (const heading of ['Memory:', 'Wireless:', 'Power Modes:']) {
    await expect(reply.locator('ul').filter({ hasText: heading }),
      `a list must not swallow the "${heading}" heading`).toHaveCount(0);
  }
  expectNoErrors(errors);
});

test('a reply shows a markdown table as a real table (D18)', async ({ page, errors }) => {
  await openAI(page);
  await ask(page, 'how do I wire an i2c sensor');
  const reply = lastReply(page);

  await expect(reply.locator('table'), 'the wiring table should be a table').toHaveCount(1);
  await expect(reply.locator('table thead th')).toHaveText(['Sensor', 'Arduino Uno']);
  expect(await reply.locator('table tbody tr').count(), 'one row per connection').toBe(4);
  await expect(reply.locator('table tbody tr').first().locator('td')).toHaveText(['VCC', '3.3V or 5V']);

  const text = await reply.textContent();
  expect(text, 'no raw | pipes left outside code').not.toContain('|----');
  expect(text, 'the separator row is gone').not.toMatch(/\|\s*Sensor\s*\|/);
  expectNoErrors(errors);
});

test('lists and tables do not break code blocks or escaping (D18)', async ({ page, errors }) => {
  await openAI(page);

  // A code block may contain "-" and "|" and must stay exactly as written.
  await ask(page, 'Can ESP32 pins tolerate 5V signals?');
  const withCode = lastReply(page);
  await expect(withCode.locator('pre.ai-code')).toHaveCount(1);
  expect(await withCode.locator('pre.ai-code').textContent(), 'the divider drawing survives').toContain('---[ 10k ]---');
  expect(await withCode.locator('pre.ai-code table').count(), 'no table inside a code block').toBe(0);
  expect(await withCode.locator('pre.ai-code li').count(), 'no list inside a code block').toBe(0);

  // D6 still holds: typed HTML is shown, not run.
  await ask(page, '<img src=x onerror=alert(1)> - one - two');
  const typed = bubbles(page, 'user').last().locator('.ai-message-content');
  await expect(typed.locator('img')).toHaveCount(0);
  await expect(typed).toContainText('<img src=x onerror=alert(1)>');
  expectNoErrors(errors);
});
