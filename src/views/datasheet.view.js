/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Datasheet Viewer screen (C8, D26, D36, D48)
═══════════════════════════════════════════════════════════════════ */

import { PIN_TYPE_CONFIG } from '../app/pin-types.js';
import { navigateTo, registerScreen } from '../app/router.js';
import { state } from '../app/state.js';
import { showToast } from '../ui/toast.js';
import { escapeHtml } from '../utils/html.js';
import { sendAIMessage } from './ai.view.js';

function initDatasheetViewer() {
  const panel = document.getElementById('view-datasheet');
  if (!panel) return;

  renderDatasheetList();

  // The search box filters the list as you type. Wired on the first visit
  // only, so repeat visits don't pile up handlers (C8).
  const search = document.getElementById('ds-search');
  if (search && !search._wired) {
    search._wired = true;
    search.addEventListener('input', renderDatasheetList);
  }

  // Bind TOC buttons
  document.querySelectorAll('.toc-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.toc-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.datasheetSection = btn.dataset.section || 'overview';
      renderDatasheetContent();
    };
  });

  // Both buttons act on the datasheet on screen (D36): the maker's PDF (D48),
  // and a question to the AI about it.
  const downloadBtn = document.getElementById('ds-download');
  if (downloadBtn) {
    downloadBtn.onclick = () => {
      const ds = shownDatasheet();
      if (ds?.pdf) window.open(ds.pdf, '_blank', 'noopener');
      else showToast(`No PDF link is stored for ${ds?.name || 'this datasheet'}`, 'warning');
    };
  }

  const explainBtn = document.getElementById('ds-ai-explain');
  if (explainBtn) {
    explainBtn.onclick = () => {
      const ds = shownDatasheet();
      if (!ds) return;
      navigateTo('ai');
      sendAIMessage(`Explain datasheet specifications and alt functions for ${ds.name}.`);
    };
  }

  renderDatasheetContent();
}

// Draw the sidebar list, keeping only the datasheets that match the search
// box. Matching is on the name and the maker, ignoring case (C8).
function renderDatasheetList() {
  const dsList = document.getElementById('ds-list');
  if (!dsList || !window.CircuitLabData) return;

  const query = (document.getElementById('ds-search')?.value || '').trim().toLowerCase();
  const shown = CircuitLabData.datasheets.filter(ds =>
    !query || `${ds.name} ${ds.manufacturer}`.toLowerCase().includes(query)
  );

  if (!shown.length) {
    dsList.innerHTML = `<div class="ds-empty">No datasheet matches "${escapeHtml(query)}"</div>`;
    return;
  }

  const open = shownDatasheet();
  dsList.innerHTML = shown.map(ds => `
    <div class="ds-item ${ds === open ? 'active' : ''}"
      onclick="CircuitApp.selectDatasheetByComponent('${ds.componentId}')">
      <div class="ds-item-name">${ds.name}</div>
      <div class="ds-item-mfr">${ds.manufacturer}</div>
    </div>
  `).join('');
}

// The datasheet on screen: the selected part's, or the first one when that
// part has none. The header, the marked row and both buttons all use this,
// so they never disagree (D36).
function shownDatasheet() {
  return CircuitLabData.datasheets.find(d => d.componentId === state.selectedComponent?.id)
    || CircuitLabData.datasheets[0];
}

// Open the Datasheet Viewer on one datasheet (a search result, D46).
export function openDatasheet(componentId) {
  const comp = CircuitLabData.components.find(c => c.id === componentId);
  if (!comp) return;
  state.selectedComponent = comp;
  navigateTo('datasheet');
}

export function selectDatasheetByComponent(id) {
  const comp = CircuitLabData.components.find(c => c.id === id);
  if (comp) {
    state.selectedComponent = comp;
    // Re-trigger active sidebar highlights
    document.querySelectorAll('.ds-item').forEach(item => item.classList.remove('active'));
    initDatasheetViewer();
  }
}

// The Pinout section: every pin of the datasheet's component (D26).
function renderDatasheetPinout(ds) {
  const comp = CircuitLabData.components.find(c => c.id === ds.componentId);
  const pins = comp?.pinout || [];
  if (!pins.length) {
    return `<div class="placeholder-msg">No pin list is stored for ${ds.name}.</div>`;
  }
  return `
    <div class="ds-section">
      <h3 class="ds-section-title">Pinout — ${comp.package || ds.name} (${pins.length} pins)</h3>
      <div class="ds-table-wrapper">
        <table class="ds-table">
          <thead>
            <tr><th>Pin</th><th>Name</th><th>Alt name</th><th>Type</th><th>Voltage</th><th>Alt functions</th></tr>
          </thead>
          <tbody>
            ${pins.map(p => `
              <tr>
                <td>${p.num}</td>
                <td>${p.name}</td>
                <td>${p.altName || '—'}</td>
                <td>${(PIN_TYPE_CONFIG[p.type] || PIN_TYPE_CONFIG.digital).label}</td>
                <td>${p.voltage || '—'}</td>
                <td>${p.altFunctions || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderDatasheetContent() {
  const compNameEl = document.getElementById('ds-component-name');
  const mfrEl = document.getElementById('ds-mfr');
  const contentBox = document.getElementById('ds-content');

  if (!contentBox) return;

  const ds = shownDatasheet();
  if (!ds) return;

  if (compNameEl) compNameEl.textContent = ds.name;
  if (mfrEl) mfrEl.textContent = ds.manufacturer;

  const sectionKey = state.datasheetSection || 'overview';

  // The Pinout section is drawn from the linked component's pin list — the
  // same data the 3D Viewer's pin table uses. The datasheet data has no
  // `pinout` section of its own, so this runs before the check below (D26).
  if (sectionKey === 'pinout') {
    contentBox.innerHTML = renderDatasheetPinout(ds);
    return;
  }

  const sec = ds.sections[sectionKey];

  if (!sec) {
    contentBox.innerHTML = `<div class="placeholder-msg">${ds.name} has no ${sectionKey} section.</div>`;
    return;
  }

  // Render based on section key
  switch (sectionKey) {
    case 'overview':
      contentBox.innerHTML = `
        <div class="ds-section">
          <h3 class="ds-section-title">${sec.title}</h3>
          <p class="ds-body-text">${sec.content}</p>
          ${sec.highlights ? `
            <div class="ds-highlights" style="margin-top:20px;">
              <h4 style="color:var(--cyan);margin-bottom:10px;">Key Features</h4>
              <ul style="padding-left:20px;line-height:1.7;">
                ${sec.highlights.map(h => `<li>${h}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `;
      break;

    case 'electrical':
      contentBox.innerHTML = `
        <div class="ds-section">
          <h3 class="ds-section-title">${sec.title}</h3>
          <div class="ds-table-wrapper">
            <table class="ds-table ds-electrical">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Min</th>
                  <th>Typ</th>
                  <th>Max</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                ${sec.specs.map(s => `
                  <tr>
                    <td class="ds-el-param">${s.param}</td>
                    <td class="ds-el-num">${s.min}</td>
                    <td class="ds-el-num ds-el-typ">${s.typ}</td>
                    <td class="ds-el-num">${s.max}</td>
                    <td class="ds-el-unit">${s.unit}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
      break;

    case 'package':
      contentBox.innerHTML = `
        <div class="ds-section">
          <h3 class="ds-section-title">${sec.title}</h3>
          <div class="ds-table-wrapper">
            <table class="ds-table">
              <thead>
                <tr><th>Package</th><th>Width</th><th>Length</th><th>Height</th></tr>
              </thead>
              <tbody>
                ${sec.packages.map(pk => `
                  <tr>
                    <td>${pk.name}</td>
                    <td>${pk.width}</td>
                    <td>${pk.length}</td>
                    <td>${pk.height}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
      break;

    case 'examples':
      contentBox.innerHTML = `
        <div class="ds-section">
          <h3 class="ds-section-title">${sec.title}</h3>
          ${sec.examples.map(ex => `
            <div class="ds-example">
              <h4>${ex.title}</h4>
              <pre class="ds-code"><code>${escapeHtml(ex.code)}</code></pre>
            </div>
          `).join('')}
        </div>
      `;
      break;

    default:
      contentBox.innerHTML = `
        <div class="ds-section">
          <h3 class="ds-section-title">${sec.title || sectionKey}</h3>
          <p class="ds-body-text">${sec.description || ''}</p>
        </div>
      `;
  }
}

registerScreen('datasheet', initDatasheetViewer);
