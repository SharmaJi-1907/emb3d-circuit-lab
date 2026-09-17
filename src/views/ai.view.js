/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — AI Assistant screen: chat (B1–B3)
   Split out of app/app.js (#27c)
═══════════════════════════════════════════════════════════════════ */

import { registerScreen } from '../app/router.js';
import { state } from '../app/state.js';
import { getAIResponse } from '../services/ai.js';
import { formatMarkdown } from '../utils/markdown.js';

function initAIPanel() {
  const panel = document.getElementById('view-ai');
  if (!panel) return;

  // Wire up send button (only once)
  const sendBtn = document.getElementById('ai-send-btn');
  const input = document.getElementById('ai-user-query');
  if (sendBtn && !sendBtn._wired) {
    sendBtn._wired = true;
    sendBtn.addEventListener('click', () => sendAIMessage(input?.value || ''));
  }

  if (input && !input._wired) {
    input._wired = true;
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendAIMessage(input.value);
      }
    });
  }

  // Wire up suggestion chips (only once)
  panel.querySelectorAll('.ai-suggestion-chip').forEach(chip => {
    if (!chip._wired) {
      chip._wired = true;
      chip.addEventListener('click', () => sendAIMessage(chip.dataset.query || chip.textContent));
    }
  });

  renderAIMessages();
}

function renderAIMessages() {
  const chatArea = document.getElementById('ai-chat-messages');
  if (!chatArea) return;

  // Redraw the messages below the page's static welcome bubble
  chatArea.querySelectorAll('.ai-message').forEach(el => el.remove());
  chatArea.insertAdjacentHTML('beforeend', state.aiMessages.map(msg => `
    <div class="ai-message ${msg.role}">
      <div class="ai-message-avatar">${msg.role === 'assistant' ? 'AI' : 'You'}</div>
      <div class="ai-message-body">
        <div class="ai-message-content">${formatMarkdown(msg.content)}</div>
        <div class="ai-message-time">${msg.time}</div>
      </div>
    </div>
  `).join(''));

  chatArea.scrollTop = chatArea.scrollHeight;
}

export function sendAIMessage(text) {
  if (!text.trim()) return;

  state.aiMessages.push({
    role: 'user',
    content: text,
    time: new Date().toLocaleTimeString()
  });

  // Clear input
  const input = document.getElementById('ai-user-query');
  if (input) input.value = '';

  renderAIMessages();

  // Simulate AI response
  setTimeout(() => {
    const response = getAIResponse(text);
    state.aiMessages.push({
      role: 'assistant',
      content: response,
      time: new Date().toLocaleTimeString()
    });
    renderAIMessages();
  }, 600 + Math.random() * 400);
}

registerScreen('ai', initAIPanel);
