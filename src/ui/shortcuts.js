/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Keyboard shortcuts (D2)
   Split out of app/app.js (#27c)
═══════════════════════════════════════════════════════════════════ */

import { navigateTo } from '../app/router.js';
import { state } from '../app/state.js';
import { toggleNotifications } from './notifications.js';
import { hideSearchModal, showSearchModal } from './search.js';
import { updateSimToolbar } from '../views/simulator.view.js';

export function initKeyboardShortcuts() {
  const shortcutsModal = document.getElementById('shortcuts-modal');
  const closeShortcutsBtn = document.getElementById('close-shortcuts-btn');
  if (closeShortcutsBtn && shortcutsModal) {
    closeShortcutsBtn.addEventListener('click', () => {
      shortcutsModal.classList.add('hidden');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (isTextField(e.target)) return;
    const key = e.key.toLowerCase();

    if ((e.ctrlKey || e.metaKey) && !e.altKey && key === 'k') {
      e.preventDefault();
      showSearchModal();
      return;
    }

    if (e.key === 'Escape') {
      hideSearchModal();
      toggleNotifications(false); // Esc closes the drawer too (C6)
      if (shortcutsModal) {
        shortcutsModal.classList.add('hidden');
      }
      return;
    }

    // Leave browser shortcuts (Ctrl+3, Alt+←, …) alone, and ignore auto-repeat from a held key.
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;

    // 1–8: screens in sidebar order
    const views = [...document.querySelectorAll('.nav-item')].map(item => item.dataset.view);
    if (/^[1-9]$/.test(e.key) && views[Number(e.key) - 1]) {
      navigateTo(views[Number(e.key) - 1]);
      return;
    }

    if (e.key === '/') {
      e.preventDefault();
      showSearchModal();
      return;
    }

    if (e.key === '?') {
      if (shortcutsModal) shortcutsModal.classList.remove('hidden');
      return;
    }

    if (state.currentView === 'viewer' && window.ThreeViewer && ThreeViewer.isReady()) {
      if (key === 'w') ThreeViewer.setWireframe(!ThreeViewer.isWireframe());
      if (key === 'e') ThreeViewer.setExplode(!ThreeViewer.isExploded());
      if (key === 'r') ThreeViewer.resetView();
      return;
    }

    // Space on a focused button or link must still press it.
    if (state.currentView === 'simulator' && e.key === ' ' && !e.target.closest('button, a, [role="button"]')) {
      e.preventDefault();
      if (CircuitSimulator.isRunning()) CircuitSimulator.stopSim();
      else CircuitSimulator.startSim();
      updateSimToolbar();
    }
  });
}

function isTextField(el) {
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}
