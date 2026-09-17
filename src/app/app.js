/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Main application: startup and the window.CircuitApp API (ADR 0003)
   Split out of app/app.js (#27c)
═══════════════════════════════════════════════════════════════════ */

// Every screen registers itself with the router when it is imported.
import '../views/dashboard.view.js';
import '../views/library.view.js';
import '../views/viewer.view.js';
import '../views/simulator.view.js';
import '../views/boards.view.js';
import '../views/datasheet.view.js';
import '../views/ai.view.js';
import '../views/projects.view.js';

import { initNavigation, navigateTo } from './router.js';
import { state } from './state.js';
import { getAIResponse } from '../services/ai.js';
import { initNotifications } from '../ui/notifications.js';
import { initSearch } from '../ui/search.js';
import { initKeyboardShortcuts } from '../ui/shortcuts.js';
import { initTheme, toggleTheme } from '../ui/theme.js';
import { showToast } from '../ui/toast.js';
import { initTopbarButtons } from '../ui/topbar.js';
import { sendAIMessage } from '../views/ai.view.js';
import { selectBoard, selectBoardPin } from '../views/boards.view.js';
import { selectDatasheetByComponent } from '../views/datasheet.view.js';
import { clearCompare, setFilter, sortComponents, toggleCompare } from '../views/library.view.js';
import { deleteMyProject, newProject, openProject } from '../views/projects.view.js';
import { onPinHover, onPinSelect, openIn3D, selectComponent, selectPin, setViewMode, showSelectedModel } from '../views/viewer.view.js';

function init() {
  initTheme();
  initNavigation();
  initSearch();
  initKeyboardShortcuts();
  initNotifications();
  initTopbarButtons();

  // Set default selected component
  if (!state.selectedComponent && window.CircuitLabData && CircuitLabData.components.length > 0) {
    state.selectedComponent = CircuitLabData.components[0];
  }

  // Open the screen in the address (D9), else the Dashboard, the home screen (ADR 0002)
  navigateTo(location.hash.slice(1) || 'dashboard', { replace: true });

  // Init Three.js viewer after a tick
  setTimeout(() => {
    const viewerCanvas = document.getElementById('viewer-canvas');
    if (viewerCanvas && window.ThreeViewer) {
      ThreeViewer.init(viewerCanvas);
      viewerCanvas.addEventListener('mousemove', ThreeViewer.onMouseMove);
      viewerCanvas.addEventListener('click', ThreeViewer.onMouseClick);
      document.addEventListener('pin-hover', onPinHover);
      document.addEventListener('pin-select', onPinSelect);
      showSelectedModel(); // the Viewer was opened before the engine was ready (D15)
    }
  }, 300);

  // Welcome toast
  setTimeout(() => showToast('Welcome to CircuitLab Pro', 'info'), 800);
}

function navigate(view) {
  navigateTo(view);
}

// The public API: inline onclick handlers in the generated HTML and the smoke
// tests call these through window.CircuitApp (ADR 0003).
window.CircuitApp = {
  init,
  navigate,
  navigateTo,
  selectComponent,
  openIn3D,
  selectPin,
  selectBoard,
  selectBoardPin,
  setFilter,
  sortComponents,
  toggleCompare,
  clearCompare,
  setViewMode,
  selectDatasheetByComponent,
  sendAIMessage,
  getAIResponse,
  toggleTheme,
  newProject,
  openProject,
  deleteMyProject,
  showToast,
  getState: () => state,
};

/* ── Boot ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  window.CircuitApp.init();
});
