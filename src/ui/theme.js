/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Light / dark theme (C5)
═══════════════════════════════════════════════════════════════════ */

import { state } from '../app/state.js';

/* ── Light / dark theme (C5) ────────────────────────────────────
   The palette lives in styles/base/tokens.css under :root[data-theme="light"],
   so only the attribute changes here. The choice is remembered.
──────────────────────────────────────────────────────────────── */
const THEME_KEY = 'circuitlab.theme';

function applyTheme(theme) {
  state.theme = theme === 'light' ? 'light' : 'dark';
  // Dark is the default, so it needs no attribute.
  if (state.theme === 'light') {
    document.documentElement.dataset.theme = 'light';
  } else {
    delete document.documentElement.dataset.theme;
  }
  const label = document.getElementById('theme-btn-toggle');
  if (label) label.textContent = state.theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
  try {
    localStorage.setItem(THEME_KEY, state.theme);
  } catch {
    // private mode: the choice just won't be remembered
  }
}

export function toggleTheme() {
  applyTheme(state.theme === 'light' ? 'dark' : 'light');
}

export function initTheme() {
  let saved;
  try {
    saved = localStorage.getItem(THEME_KEY);
  } catch {
    saved = null; // private mode
  }
  applyTheme(saved || 'dark');

  // Both buttons do the same thing; wired once each.
  for (const id of ['theme-toggle', 'theme-btn-toggle']) {
    const btn = document.getElementById(id);
    if (btn && !btn._wired) {
      btn._wired = true;
      btn.addEventListener('click', toggleTheme);
    }
  }
}
