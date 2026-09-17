/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — 3D Viewer screen: sidebar, pin table, pin details, tooltip
   Split out of app/app.js (#27c)
═══════════════════════════════════════════════════════════════════ */

import { PIN_TYPE_CONFIG } from '../app/pin-types.js';
import { navigateTo, registerScreen } from '../app/router.js';
import { state } from '../app/state.js';
import { hideSearchModal } from '../ui/search.js';
import { showToast } from '../ui/toast.js';

function initViewerPanel() {
  const panel = document.getElementById('view-viewer');
  if (!panel) return;

  if (!state.selectedComponent && window.CircuitLabData && CircuitLabData.components.length > 0) {
    state.selectedComponent = CircuitLabData.components[0];
  }

  renderViewerSidebar();
  renderPinTable();

  // The window may have changed size while the Viewer was hidden.
  if (window.ThreeViewer && ThreeViewer.isReady()) ThreeViewer.onResize();
  showSelectedModel();
}

// Draw the selected component in the 3D viewer, once the engine is ready.
export function showSelectedModel() {
  if (!state.selectedComponent || !window.ThreeViewer || !ThreeViewer.isReady()) return;
  ThreeViewer.loadComponent(state.selectedComponent.id);
  document.getElementById('viewer-loading')?.classList.add('hidden');
}

function renderViewerSidebar() {
  const sidebar = document.getElementById('viewer-sidebar');
  if (!sidebar || !state.selectedComponent) return;
  const comp = state.selectedComponent;

  sidebar.innerHTML = `
    <div class="viewer-comp-header">
      <span class="viewer-comp-icon">${comp.icon}</span>
      <div>
        <div class="viewer-comp-name">${comp.name}</div>
        <div class="viewer-comp-mfr">${comp.manufacturer}</div>
      </div>
    </div>

    <div class="viewer-specs">
      ${[
        ['Package', comp.package],
        ['Voltage', comp.voltage],
        ['Pins', comp.pins],
        ['Frequency', comp.frequency || '—'],
        ['Flash', comp.flash || '—'],
        ['RAM', comp.ram || '—'],
        ['Temp', comp.temperature],
        ['Power', comp.power],
      ].map(([k, v]) => `
        <div class="viewer-spec-row">
          <span class="viewer-spec-key">${k}</span>
          <span class="viewer-spec-val">${v}</span>
        </div>
      `).join('')}
    </div>

    <div class="viewer-protocols">
      ${comp.protocols.map(p => `<span class="proto-tag">${p}</span>`).join('')}
    </div>

    <div class="viewer-controls">
      <div class="viewer-ctrl-group">
        <label>View Mode</label>
        <div class="btn-group">
          <button class="btn-ctrl active" id="btn-solid" onclick="CircuitApp.setViewMode('solid')">Solid</button>
          <button class="btn-ctrl" id="btn-wire" onclick="CircuitApp.setViewMode('wireframe')">Wire</button>
          <button class="btn-ctrl" id="btn-explode" onclick="CircuitApp.setViewMode('explode')">Explode</button>
        </div>
      </div>
      <div class="viewer-ctrl-group">
        <label>Auto Rotate</label>
        <label class="toggle-switch">
          <input type="checkbox" checked onchange="ThreeViewer.setAutoRotate(this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="viewer-ctrl-group">
        <label>Camera</label>
        <div class="btn-group">
          <button class="btn-ctrl" onclick="ThreeViewer.zoomIn()">+</button>
          <button class="btn-ctrl" onclick="ThreeViewer.resetView()">⌂</button>
          <button class="btn-ctrl" onclick="ThreeViewer.zoomOut()">−</button>
        </div>
      </div>
    </div>

    <div class="viewer-comp-select">
      <label>Switch Component</label>
      <select onchange="CircuitApp.selectComponent(this.value)" class="filter-select">
        ${CircuitLabData.components.map(c => `
          <option value="${c.id}" ${c.id === comp.id ? 'selected' : ''}>${c.name}</option>
        `).join('')}
      </select>
    </div>
  `;
}

function renderPinTable() {
  const table = document.getElementById('pin-table-body');
  if (!table || !state.selectedComponent) return;
  const comp = state.selectedComponent;

  if (!comp.pinout || comp.pinout.length === 0) {
    table.innerHTML = '<tr><td colspan="6" class="no-pinout">Pinout data not available for this component</td></tr>';
    return;
  }

  table.innerHTML = comp.pinout.map(pin => {
    const cfg = PIN_TYPE_CONFIG[pin.type] || PIN_TYPE_CONFIG.digital;
    return `
      <tr class="pin-row ${state.selectedPin === pin.num ? 'selected' : ''}"
        onclick="CircuitApp.selectPin(${pin.num})"
        onmouseenter="ThreeViewer.highlightPinByNumber && ThreeViewer.highlightPinByNumber(${pin.num})">
        <td class="pin-num">${pin.num}</td>
        <td class="pin-name">${pin.name}</td>
        <td class="pin-alt">${pin.altName}</td>
        <td>
          <span class="pin-type-badge" style="background:${cfg.bg};color:${cfg.color}">
            ${cfg.icon} ${cfg.label}
          </span>
        </td>
        <td class="pin-voltage">${pin.voltage}</td>
        <td class="pin-protocol">
          <span class="proto-tag">${pin.protocol}</span>
        </td>
        ${pin.warning ? `<td class="pin-warning" title="${pin.warning}">⚠</td>` : '<td></td>'}
      </tr>
    `;
  }).join('');
}

function renderPinDetail(pinNum) {
  const detail = document.getElementById('pin-detail-panel');
  if (!detail || !state.selectedComponent) return;
  const pin = state.selectedComponent.pinout?.find(p => p.num === pinNum);
  if (!pin) return;

  const cfg = PIN_TYPE_CONFIG[pin.type] || PIN_TYPE_CONFIG.digital;

  detail.innerHTML = `
    <div class="pin-detail-header" style="border-color:${cfg.color}">
      <div class="pin-detail-num" style="background:${cfg.bg};color:${cfg.color}">Pin ${pin.num}</div>
      <div class="pin-detail-name">${pin.name}</div>
      <div class="pin-detail-alt">${pin.altName}</div>
    </div>
    <div class="pin-detail-body">
      <div class="pin-detail-row">
        <span>Type</span>
        <span class="pin-type-badge" style="background:${cfg.bg};color:${cfg.color}">${cfg.icon} ${cfg.label}</span>
      </div>
      <div class="pin-detail-row"><span>Voltage</span><span>${pin.voltage}</span></div>
      ${pin.current ? `<div class="pin-detail-row"><span>Max Current</span><span>${pin.current}</span></div>` : ''}
      <div class="pin-detail-row"><span>Protocol</span><span>${pin.protocol}</span></div>
      ${pin.altFunctions ? `<div class="pin-detail-row"><span>Alt Functions</span><span>${pin.altFunctions}</span></div>` : ''}
      ${pin.warning ? `
        <div class="pin-warning-box">
          <span>⚠</span> ${pin.warning}
        </div>
      ` : ''}
    </div>
    <div class="pin-signal-viz">
      <canvas id="signal-canvas" width="200" height="50"></canvas>
    </div>
  `;

  // Draw signal waveform
  drawSignalWaveform(pin.type);
}

function drawSignalWaveform(type) {
  const canvas = document.getElementById('signal-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = PIN_TYPE_CONFIG[type]?.color || '#00d4ff';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = ctx.strokeStyle;
  ctx.shadowBlur = 3;

  ctx.beginPath();
  switch (type) {
    case 'digital':
    case 'uart':
      ctx.moveTo(0, h - 8);
      ctx.lineTo(w * 0.15, h - 8);
      ctx.lineTo(w * 0.15, 8);
      ctx.lineTo(w * 0.35, 8);
      ctx.lineTo(w * 0.35, h - 8);
      ctx.lineTo(w * 0.55, h - 8);
      ctx.lineTo(w * 0.55, 8);
      ctx.lineTo(w * 0.75, 8);
      ctx.lineTo(w * 0.75, h - 8);
      ctx.lineTo(w, h - 8);
      ctx.stroke();
      break;
    case 'pwm':
      ctx.moveTo(0, h - 8);
      ctx.lineTo(w * 0.1, h - 8);
      ctx.lineTo(w * 0.1, 8);
      ctx.lineTo(w * 0.25, 8);
      ctx.lineTo(w * 0.25, h - 8);
      ctx.lineTo(w * 0.35, h - 8);
      ctx.lineTo(w * 0.35, 8);
      ctx.lineTo(w * 0.5, 8);
      ctx.lineTo(w * 0.5, h - 8);
      ctx.lineTo(w * 0.6, h - 8);
      ctx.lineTo(w * 0.6, 8);
      ctx.lineTo(w * 0.75, 8);
      ctx.lineTo(w * 0.75, h - 8);
      ctx.lineTo(w, h - 8);
      ctx.stroke();
      break;
    case 'analog':
    case 'i2c':
    case 'spi':
      ctx.moveTo(0, h / 2);
      for (let x = 0; x <= w; x++) {
        const y = h / 2 - Math.sin((x / w) * Math.PI * 4) * (h / 2 - 8);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      break;
    case 'power':
      ctx.moveTo(0, 8);
      ctx.lineTo(w, 8);
      ctx.stroke();
      break;
    case 'ground':
      ctx.moveTo(0, h - 8);
      ctx.lineTo(w, h - 8);
      ctx.stroke();
      break;
    default:
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
  }
}

export function onPinHover(e) {
  const tooltip = document.getElementById('pin-tooltip');
  if (!tooltip) return;

  if (!e.detail) {
    tooltip.style.display = 'none';
    return;
  }

  const { pinNum, screenX, screenY } = e.detail;
  if (!state.selectedComponent) return;

  const pin = state.selectedComponent.pinout?.find(p => p.num === pinNum);
  if (!pin) return;

  const cfg = PIN_TYPE_CONFIG[pin.type] || PIN_TYPE_CONFIG.digital;
  tooltip.innerHTML = `
    <div class="tooltip-pin-num" style="color:${cfg.color}">Pin ${pin.num}</div>
    <div class="tooltip-pin-name">${pin.name} / ${pin.altName}</div>
    <div class="tooltip-pin-type" style="color:${cfg.color}">${cfg.icon} ${cfg.label}</div>
    <div class="tooltip-pin-voltage">${pin.voltage}</div>
  `;
  tooltip.style.display = 'block';
  tooltip.style.left = (screenX + 12) + 'px';
  tooltip.style.top = (screenY - 10) + 'px';
}

export function onPinSelect(e) {
  if (!e.detail) return;
  selectPin(e.detail.pinNum);
}

export function selectComponent(id) {
  const comp = CircuitLabData.components.find(c => c.id === id);
  if (!comp) return;

  state.selectedComponent = comp;

  // Add to recent
  state.recentComponents = [id, ...state.recentComponents.filter(r => r !== id)].slice(0, 5);

  hideSearchModal();
  navigateTo('viewer');
  showToast(`Loaded ${comp.name}`, 'success');
}

export function openIn3D(id) {
  selectComponent(id);
}

export function selectPin(pinNum) {
  state.selectedPin = pinNum;
  renderPinTable();
  renderPinDetail(pinNum);
  if (window.ThreeViewer) ThreeViewer.highlightPinByNumber(pinNum);
}

export function setViewMode(mode) {
  document.querySelectorAll('.btn-ctrl').forEach(b => b.classList.remove('active'));
  document.getElementById(`btn-${mode}`)?.classList.add('active');

  if (!window.ThreeViewer) return;
  switch (mode) {
    case 'solid':
      ThreeViewer.setWireframe(false);
      ThreeViewer.setExplode(false);
      break;
    case 'wireframe':
      ThreeViewer.setWireframe(true);
      ThreeViewer.setExplode(false);
      break;
    case 'explode':
      ThreeViewer.setWireframe(false);
      ThreeViewer.setExplode(true);
      break;
  }
}

registerScreen('viewer', initViewerPanel);
