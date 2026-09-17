/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Notifications drawer (C6, E5)
═══════════════════════════════════════════════════════════════════ */

import { state } from '../app/state.js';

/* ── Notifications drawer (C6) ──────────────────────────────────
   The bell opens the drawer, "Clear All" empties it, and the unread
   dot follows the list. The items live here so they can be cleared.
──────────────────────────────────────────────────────────────── */
// Built from what actually loaded, instead of the made-up messages and
// timestamps ("3 mins ago") that used to be hard-coded in the page (E5).
function startupNotifications() {
  const d = window.CircuitLabData;
  if (!d) return [];
  const started = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return [
    {
      title: 'Component library loaded',
      text: `${d.components.length} components and ${Object.keys(d.boards).length} boards are ready to browse.`,
      time: started,
      unread: true,
    },
    {
      title: 'Datasheets ready',
      text: `${d.datasheets.length} datasheets with pinouts, electrical limits and code examples.`,
      time: started,
      unread: true,
    },
    {
      title: 'Simulator ready',
      text: `${d.projects.length} example projects. Open one, or build a circuit from the palette.`,
      time: started,
      unread: false,
    },
  ];
}

function renderNotifications() {
  const list = document.getElementById('notif-list-body');
  const dot = document.querySelector('#notif-btn .notif-dot');
  if (!list) return;

  if (!state.notifications.length) {
    list.innerHTML = '<div class="notif-empty">Nothing new right now.</div>';
  } else {
    list.innerHTML = state.notifications.map(n => `
      <div class="notif-item ${n.unread ? 'unread' : ''}">
        ${n.unread ? '<span class="n-dot"></span>' : ''}
        <div class="n-text">
          <strong>${n.title}:</strong> ${n.text}
          <span class="n-time">${n.time}</span>
        </div>
      </div>
    `).join('');
  }
  if (dot) dot.hidden = !state.notifications.some(n => n.unread);
}

export function toggleNotifications(show) {
  const drawer = document.getElementById('notif-drawer');
  if (!drawer) return;
  const open = show === undefined ? drawer.classList.contains('hidden') : show;
  drawer.classList.toggle('hidden', !open);
}

export function initNotifications() {
  state.notifications = startupNotifications();
  renderNotifications();

  const btn = document.getElementById('notif-btn');
  if (btn && !btn._wired) {
    btn._wired = true;
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // so the document handler below doesn't close it again
      toggleNotifications();
    });
  }

  const clear = document.getElementById('clear-notifs');
  if (clear && !clear._wired) {
    clear._wired = true;
    clear.addEventListener('click', () => {
      state.notifications = [];
      renderNotifications();
    });
  }

  // A click anywhere else closes the drawer.
  document.addEventListener('click', (e) => {
    const drawer = document.getElementById('notif-drawer');
    if (drawer && !drawer.classList.contains('hidden') && !drawer.contains(e.target)) {
      toggleNotifications(false);
    }
  });
}
