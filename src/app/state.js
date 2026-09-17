/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — App state shared by every screen
═══════════════════════════════════════════════════════════════════ */

export const state = {
  currentView: 'dashboard',
  selectedComponent: null,
  selectedBoard: 'arduino-uno',
  selectedPin: null,
  selectedBoardPin: null, // Board Explorer only; selectedPin belongs to the 3D Viewer (D25)
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
  newProjectOpen: false,   // the "name your project" form is showing (C4)
  openProjectId: null,     // your project whose circuit is on the Simulator board (D47)
};
