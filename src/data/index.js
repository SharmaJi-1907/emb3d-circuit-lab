/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Data layer
   Components, boards, datasheets, projects, AI responses
═══════════════════════════════════════════════════════════════════ */

import { components } from './components.js';
import { boards } from './boards.js';
import { datasheets } from './datasheets.js';
import { projects } from './projects.js';
import { aiResponses } from './ai-responses.js';

// The app, the 3D viewer and the tests still read the data through this
// global. It stays the public entry point until they import it (ADR 0003).
window.CircuitLabData = {
  components,
  boards,
  datasheets,
  projects,
  aiResponses,
};
