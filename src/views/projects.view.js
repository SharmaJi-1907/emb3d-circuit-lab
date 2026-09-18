/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Projects screen (C4)
═══════════════════════════════════════════════════════════════════ */

import { navigateTo, registerScreen } from '../app/router.js';
import { state } from '../app/state.js';
import { loadMyProjects, saveMyProjects as storeMyProjects } from '../services/my-projects.js';
import { showToast } from '../ui/toast.js';
import { escapeHtml } from '../utils/html.js';
import { selectComponent } from './viewer.view.js';

function saveMyProjects(list) {
  if (!storeMyProjects(list)) showToast('This browser will not save projects', 'warning');
}

function renderProjects() {
  const panel = document.getElementById('view-projects');
  const grid = document.getElementById('projects-grid');
  if (!panel) return;
  if (!grid) return;

  // Wire up create button
  const createBtn = document.getElementById('create-project-btn');
  if (createBtn && !createBtn._wired) {
    createBtn._wired = true;
    createBtn.addEventListener('click', () => newProject());
  }

  // Your project cards carry their id in data-id, read here, so a stored id
  // is never written into an onclick as code (D31). Wired once.
  if (!grid._wired) {
    grid._wired = true;
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      const id = btn?.closest('.project-card')?.dataset.id;
      if (!id) return;
      if (btn.dataset.action === 'delete') deleteMyProject(id);
      if (btn.dataset.action === 'open') openMyProject(id);
    });
  }

  // The name is typed by the user, so it is escaped everywhere it is shown.
  const form = state.newProjectOpen ? `
    <div class="project-card project-card-new">
      <div class="project-card-body">
        <label class="project-new-label" for="new-project-name">Project name</label>
        <input type="text" id="new-project-name" placeholder="e.g. Blinking LED rig" />
      </div>
      <div class="project-card-footer">
        <button class="btn-sm" id="new-project-cancel">Cancel</button>
        <button class="btn-primary btn-sm" id="new-project-create">Create</button>
      </div>
    </div>
  ` : '';

  const myCards = loadMyProjects().map(p => `
    <div class="project-card is-mine" data-id="${escapeHtml(String(p.id))}">
      <div class="project-card-icon">🛠️</div>
      <div class="project-card-body">
        <div class="project-card-name">${escapeHtml(p.name)}</div>
        <div class="project-card-desc">Your project — its circuit is kept in the Simulator.</div>
      </div>
      <div class="project-card-footer">
        <span class="project-modified">${escapeHtml(whenMade(p))}</span>
        <button class="project-delete" data-action="delete" aria-label="Delete ${escapeHtml(p.name)}">✕</button>
        <button class="btn-primary btn-sm" data-action="open">Open →</button>
      </div>
    </div>
  `).join('');

  grid.innerHTML = form + myCards + CircuitLabData.projects.map(p => `
    <div class="project-card" style="--accent:var(--${p.color})">
      <div class="project-card-icon">${p.icon}</div>
      <div class="project-card-body">
        <div class="project-card-name">${p.name}</div>
        <div class="project-card-desc">${p.description}</div>
        <div class="project-card-comps">
          ${p.components.map(cid => {
            const c = CircuitLabData.components.find(x => x.id === cid);
            return c ? `<span class="comp-chip">${c.icon} ${c.name}</span>` : '';
          }).join('')}
        </div>
        <div class="project-card-tags">
          ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
      </div>
      <div class="project-card-footer">
        <button class="btn-primary btn-sm" onclick="CircuitApp.openProject('${p.id}')">View in 3D →</button>
      </div>
    </div>
  `).join('');

  // The form is drawn fresh each time, so its buttons are wired here.
  const nameInput = document.getElementById('new-project-name');
  if (nameInput) {
    document.getElementById('new-project-create').onclick = createProject;
    document.getElementById('new-project-cancel').onclick = cancelNewProject;
    nameInput.onkeydown = (e) => {
      if (e.key === 'Enter') createProject();
      if (e.key === 'Escape') cancelNewProject();
    };
  }
}

// Show the "name your project" form at the top of the grid.
export function newProject() {
  state.newProjectOpen = true;
  renderProjects();
  document.getElementById('new-project-name')?.focus();
}

function cancelNewProject() {
  state.newProjectOpen = false;
  renderProjects();
}

function createProject() {
  const input = document.getElementById('new-project-name');
  const name = (input?.value || '').trim();
  if (!name) {
    showToast('Give the project a name first', 'warning');
    input?.focus();
    return; // the form stays open
  }
  const mine = loadMyProjects();
  // A timestamp, so the card can say how long ago it was made (D43).
  mine.unshift({ id: `mine-${Date.now()}`, name, createdAt: Date.now() });
  saveMyProjects(mine);
  state.newProjectOpen = false;
  renderProjects();
  showToast(`Created "${name}"`, 'success');
}

function deleteMyProject(id) {
  saveMyProjects(loadMyProjects().filter(p => p.id !== id));
  if (state.openProjectId === id) state.openProjectId = null;
  renderProjects();
}

// Open your project in the Simulator with the circuit it was left with.
// While it is open, every change to the board is saved into it (D47).
function openMyProject(id) {
  const project = loadMyProjects().find(p => p.id === id);
  if (!project) return;
  state.openProjectId = id;
  navigateTo('simulator');
  CircuitSimulator.loadCircuit(project.circuit || {});
  showToast(`Opened ${project.name}`, 'info');
}

// Called by the Simulator after every change to the board.
export function saveOpenProject(circuit) {
  if (!state.openProjectId) return;
  const mine = loadMyProjects();
  const project = mine.find(p => p.id === state.openProjectId);
  if (!project) return;
  project.circuit = circuit;
  saveMyProjects(mine);
}

// "3 days ago", from the time the project was made. Projects saved before
// that was stored keep the text they were saved with.
function whenMade(project) {
  if (!project.createdAt) return project.lastModified || '';
  const minutes = Math.floor((Date.now() - project.createdAt) / 60000);
  const [n, unit] =
    minutes < 1 ? [0, ''] :
    minutes < 60 ? [minutes, 'minute'] :
    minutes < 24 * 60 ? [Math.floor(minutes / 60), 'hour'] :
    [Math.floor(minutes / (24 * 60)), 'day'];
  return n ? `${n} ${unit}${n === 1 ? '' : 's'} ago` : 'just now';
}

// A sample project has no circuit, so it shows its main part in the 3D
// Viewer. It used to open the Simulator, which was empty, or still held
// your own project and kept saving into it (D49).
export function openProject(id) {
  const proj = CircuitLabData.projects.find(p => p.id === id);
  if (proj?.components.length) selectComponent(proj.components[0]);
}

registerScreen('projects', renderProjects);
