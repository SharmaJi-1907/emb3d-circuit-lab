/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Component Library in the Database screen (C3, D10)
   Split out of app/app.js (#27c)
═══════════════════════════════════════════════════════════════════ */

import { registerScreen } from '../app/router.js';
import { state } from '../app/state.js';
import { showToast } from '../ui/toast.js';

function renderComponentLibrary() {
  const panel = document.getElementById('view-database');
  if (!panel) return;

  const categories = ['all', 'mcu', 'sensor', 'power', 'passive'];
  let filtered = CircuitLabData.components;

  if (state.filterCategory !== 'all') {
    filtered = filtered.filter(c => c.category === state.filterCategory);
  }
  if (state.searchQuery) {
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(state.searchQuery) ||
      c.manufacturer.toLowerCase().includes(state.searchQuery) ||
      c.tags.some(t => t.includes(state.searchQuery))
    );
  }
  filtered = sortList(filtered, state.sortBy);

  panel.innerHTML = `
    <div class="library-layout">
      <!-- Filters -->
      <div class="library-filters">
        <div class="filter-group">
          <label class="filter-label">Category</label>
          <div class="filter-chips">
            ${categories.map(cat => `
              <button class="filter-chip ${state.filterCategory === cat ? 'active' : ''}"
                onclick="CircuitApp.setFilter('${cat}')">${cat.toUpperCase()}</button>
            `).join('')}
          </div>
        </div>
        <div class="filter-group">
          <label class="filter-label">Compare Mode</label>
          <button class="btn-secondary btn-sm" onclick="CircuitApp.clearCompare()">
            Clear (${state.compareList.length})
          </button>
        </div>
        <div class="filter-group">
          <label class="filter-label">Sort By</label>
          <select class="filter-select" onchange="CircuitApp.sortComponents(this.value)">
            ${[['name', 'Name'], ['pins', 'Pin Count'], ['voltage', 'Voltage']].map(([value, label]) =>
              `<option value="${value}" ${state.sortBy === value ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Component Grid -->
      <div class="components-grid">
        ${filtered.length === 0 ? '<div class="no-results">No components match your search</div>' :
          filtered.map(c => renderComponentCard(c)).join('')}
      </div>

      <!-- Compare Panel -->
      ${state.compareList.length >= 2 ? renderComparePanel() : ''}
    </div>
  `;
}

function renderComponentCard(comp) {
  const inCompare = state.compareList.includes(comp.id);
  return `
    <div class="comp-card ${inCompare ? 'in-compare' : ''}" onclick="CircuitApp.selectComponent('${comp.id}')">
      <div class="comp-card-header">
        <span class="comp-card-icon">${comp.icon}</span>
        <div class="comp-card-title">
          <div class="comp-card-name">${comp.name}</div>
          <div class="comp-card-mfr">${comp.manufacturer}</div>
        </div>
        <button class="comp-compare-btn ${inCompare ? 'active' : ''}"
          onclick="event.stopPropagation(); CircuitApp.toggleCompare('${comp.id}')"
          title="Add to compare">⊕</button>
      </div>
      <div class="comp-card-specs">
        <div class="spec-row"><span>Package</span><span>${comp.package}</span></div>
        <div class="spec-row"><span>Voltage</span><span>${comp.voltage}</span></div>
        <div class="spec-row"><span>Pins</span><span>${comp.pins}</span></div>
        ${comp.frequency ? `<div class="spec-row"><span>Freq</span><span>${comp.frequency}</span></div>` : ''}
        ${comp.flash ? `<div class="spec-row"><span>Flash</span><span>${comp.flash}</span></div>` : ''}
      </div>
      <div class="comp-card-protocols">
        ${comp.protocols.slice(0, 4).map(p => `<span class="proto-tag">${p}</span>`).join('')}
        ${comp.protocols.length > 4 ? `<span class="proto-tag">+${comp.protocols.length - 4}</span>` : ''}
      </div>
      <div class="comp-card-footer">
        <span class="comp-type-badge type-${comp.category}">${comp.category}</span>
        <button class="btn-primary btn-xs" onclick="event.stopPropagation(); CircuitApp.openIn3D('${comp.id}')">
          View 3D →
        </button>
      </div>
    </div>
  `;
}

function renderComparePanel() {
  const comps = state.compareList.map(id => CircuitLabData.components.find(c => c.id === id)).filter(Boolean);
  const fields = ['voltage', 'package', 'pins', 'frequency', 'flash', 'ram', 'temperature', 'power'];

  return `
    <div class="compare-panel">
      <div class="compare-header">
        <h3>Component Comparison</h3>
        <button onclick="CircuitApp.clearCompare()" class="btn-ghost">✕ Clear</button>
      </div>
      <div class="compare-table-wrapper">
        <table class="compare-table">
          <thead>
            <tr>
              <th>Spec</th>
              ${comps.map(c => `<th>${c.name}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${fields.map(f => `
              <tr>
                <td class="compare-field">${f.charAt(0).toUpperCase() + f.slice(1)}</td>
                ${comps.map(c => `<td>${c[f] || '—'}</td>`).join('')}
              </tr>
            `).join('')}
            <tr>
              <td class="compare-field">Protocols</td>
              ${comps.map(c => `<td>${c.protocols.join(', ')}</td>`).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function setFilter(cat) {
  state.filterCategory = cat;
  renderComponentLibrary();
}

export function sortComponents(by) {
  state.sortBy = by;
  renderComponentLibrary();
}

// Sort components by name (A–Z), pin count or lowest voltage (low → high); ties by name.
function sortList(list, by) {
  const key = {
    pins: c => c.pins,
    voltage: c => parseFloat(c.voltage),
  }[by];
  return [...list].sort((a, b) => (key ? key(a) - key(b) : 0) || a.name.localeCompare(b.name));
}

export function toggleCompare(id) {
  if (state.compareList.includes(id)) {
    state.compareList = state.compareList.filter(c => c !== id);
  } else if (state.compareList.length < 4) {
    state.compareList.push(id);
  } else {
    showToast('Max 4 components in compare', 'warning');
  }
  renderComponentLibrary();
}

export function clearCompare() {
  state.compareList = [];
  renderComponentLibrary();
}

registerScreen('database', renderComponentLibrary);
