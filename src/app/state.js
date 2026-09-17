/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — App state shared by every screen
   Split out of app/app.js (#27c)
═══════════════════════════════════════════════════════════════════ */

export const state = {
  currentView: 'viewer',
  selectedComponent: null,
  selectedBoard: 'arduino-uno',
  selectedPin: null,
  selectedBoardPin: null, // Board Explorer only; selectedPin belongs to the 3D Viewer (D25)
  searchQuery: '',
  filterCategory: 'all',
  sortBy: 'name',
  compareList: [],
  aiMessages: [],
  datasheetSection: 'overview',
  theme: 'dark',
  searchIndex: 0,
  sidebarCollapsed: false,
  notifications: [],
  recentComponents: ['atmega328p', 'esp32-wroom', 'ne555'],
  boardPinFilter: 'all',
};
