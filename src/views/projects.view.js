/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Projects screen (C4)
   Split out of app/app.js (#27c)
═══════════════════════════════════════════════════════════════════ */

import { navigateTo, registerScreen } from '../app/router.js';
import { state } from '../app/state.js';
import { loadMyProjects, saveMyProjects } from '../services/my-projects.js';
import { showToast } from '../ui/toast.js';
import { escapeHtml } from '../utils/html.js';

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
    <div class="project-card is-mine">
      <div class="project-card-icon">🛠️</div>
      <div class="project-card-body">
        <div class="project-card-name">${escapeHtml(p.name)}</div>
        <div class="project-card-desc">Your project — open it in the Simulator.</div>
      </div>
      <div class="project-card-footer">
        <span class="project-modified">${escapeHtml(p.lastModified)}</span>
        <button class="project-delete" aria-label="Delete ${escapeHtml(p.name)}"
          onclick="CircuitApp.deleteMyProject('${p.id}')">✕</button>
        <button class="btn-primary btn-sm" onclick="CircuitApp.navigateTo('simulator')">Open →</button>
      </div>
    </div>
  `).join('');

  grid.innerHTML = form + myCards + CircuitLabData.projects.map(p => `
    <div class="project-card" style="--accent:${p.color}">
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
        <span class="project-modified">${p.lastModified}</span>
        <button class="btn-primary btn-sm" onclick="CircuitApp.openProject('${p.id}')">Open →</button>
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
  mine.unshift({ id: `mine-${Date.now()}`, name, lastModified: 'just now' });
  saveMyProjects(mine);
  state.newProjectOpen = false;
  renderProjects();
  showToast(`Created "${name}"`, 'success');
}

export function deleteMyProject(id) {
  saveMyProjects(loadMyProjects().filter(p => p.id !== id));
  renderProjects();
}

export function openProject(id) {
  const proj = CircuitLabData.projects.find(p => p.id === id);
  if (proj) {
    showToast(`Opening ${proj.name}...`, 'info');
    navigateTo('simulator');
  }
}

registerScreen('projects', renderProjects);
