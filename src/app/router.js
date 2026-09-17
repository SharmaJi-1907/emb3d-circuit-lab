/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Screen switching, the sidebar and the #screen address (D9)
═══════════════════════════════════════════════════════════════════ */

import { state } from './state.js';

// What runs when each screen opens. Every views/*.view.js file registers
// itself, so this file needs no import of the screens (no import cycle).
const screens = {};

export function registerScreen(view, onOpen) {
  screens[view] = onOpen;
}

export function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const view = item.dataset.view;
      if (view) navigateTo(view);
      // After a mouse click, drop focus so Space goes to the screen's shortcut, not this button.
      // Keyboard activation (e.detail === 0) keeps focus for keyboard users.
      if (e.detail > 0) item.blur();
    });
  });

  // Sidebar toggle
  const toggleBtn = document.getElementById('sidebar-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      document.getElementById('sidebar')?.classList.toggle('collapsed', state.sidebarCollapsed);
      document.querySelector('.main-area')?.classList.toggle('sidebar-collapsed', state.sidebarCollapsed);
    });
  }

  // Back/Forward, a #link or an address typed by hand switches the screen (D9)
  window.addEventListener('hashchange', () => {
    const view = location.hash.slice(1);
    if (view !== state.currentView) navigateTo(view, { replace: true });
  });
}

// The screens that exist, in sidebar order.
function knownView(view) {
  return [...document.querySelectorAll('.nav-item')].some(item => item.dataset.view === view);
}

export function navigateTo(view, { replace = false } = {}) {
  // An unknown screen would hide every screen and leave a blank page (D9)
  if (!knownView(view)) {
    view = 'dashboard';
    replace = true;
  }
  state.currentView = view;

  // Keep the address in step, so refresh, Back/Forward and links work (D9).
  // Each switch is a Back step; a correction (start-up, unknown screen)
  // replaces the entry instead, so Back never lands on a bad address again.
  if (location.hash !== `#${view}`) {
    if (replace) history.replaceState(null, '', `#${view}`);
    else location.hash = view;
  }

  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === view);
  });

  // Hide all view sections
  document.querySelectorAll('.view').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });

  // Show target view panel
  const panel = document.getElementById(`view-${view}`);
  if (panel) {
    panel.style.display = 'flex';
    requestAnimationFrame(() => panel.classList.add('active'));
  }

  // Panel-specific init: what the screen registered (views/*.view.js)
  screens[view]?.();

  // Update breadcrumb
  const bc = document.getElementById('breadcrumb-current');
  if (bc) {
    const labels = {
      dashboard: 'Dashboard',
      viewer: '3D Viewer', simulator: 'Circuit Simulator',
      boards: 'Board Explorer', datasheet: 'Datasheet Viewer',
      ai: 'AI Assistant', projects: 'Projects',
      database: 'Component Database', settings: 'Settings'
    };
    bc.textContent = labels[view] || view;
  }
}
