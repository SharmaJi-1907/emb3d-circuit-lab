/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Top bar New Project and Share buttons (C9)
   Split out of app/app.js (#27c)
═══════════════════════════════════════════════════════════════════ */

import { navigateTo } from '../app/router.js';
import { showToast } from './toast.js';
import { escapeHtml } from '../utils/html.js';
import { newProject } from '../views/projects.view.js';

/* ── New Project and Share (C9) ─────────────────────────────────
   Both top-bar buttons had no code. Wired once, at startup.
──────────────────────────────────────────────────────────────── */
export function initTopbarButtons() {
  const newBtn = document.getElementById('new-project-btn');
  if (newBtn && !newBtn._wired) {
    newBtn._wired = true;
    newBtn.addEventListener('click', () => {
      navigateTo('projects');
      newProject(); // the same "name your project" form as the Projects screen's button
    });
  }

  const shareBtn = document.getElementById('export-btn');
  if (shareBtn && !shareBtn._wired) {
    shareBtn._wired = true;
    shareBtn.addEventListener('click', shareLink);
  }
}

// Copy the page link. Since hash routing (D9) it opens the same screen.
function shareLink() {
  const link = location.href;
  const showLink = () => showToast(`Copy this link: ${escapeHtml(link)}`, 'info');
  if (!navigator.clipboard) return showLink(); // e.g. not a secure page
  navigator.clipboard.writeText(link).then(
    () => showToast('Link copied — it opens this screen', 'success'),
    showLink,
  );
}
