/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Projects you make, kept in localStorage (C4)
   Split out of app/app.js (#27c)
═══════════════════════════════════════════════════════════════════ */

import { showToast } from '../ui/toast.js';

/* ── Projects you make (C4) ─────────────────────────────────────
   Kept in the browser under MY_PROJECTS_KEY, separate from the
   stored example projects in CircuitLabData.
──────────────────────────────────────────────────────────────── */
const MY_PROJECTS_KEY = 'circuitlab.my-projects';

export function loadMyProjects() {
  try {
    const saved = JSON.parse(localStorage.getItem(MY_PROJECTS_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return []; // private mode, or someone edited the value by hand
  }
}

export function saveMyProjects(list) {
  try {
    localStorage.setItem(MY_PROJECTS_KEY, JSON.stringify(list));
  } catch {
    showToast('This browser will not save projects', 'warning');
  }
}
