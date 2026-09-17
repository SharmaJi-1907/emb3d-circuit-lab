/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Simulator screen: toolbar, palette and instruments (C2, C7)
═══════════════════════════════════════════════════════════════════ */

import { registerScreen } from '../app/router.js';
import { showToast } from '../ui/toast.js';
import { saveOpenProject } from './projects.view.js';

function initSimulatorPanel() {
  const panel = document.getElementById('view-simulator');
  if (!panel) return;
  wireSimulatorControls();
  updateSimToolbar();

  // Set the simulator up on the first visit only (D3). It sizes itself each time its screen is shown.
  if (!CircuitSimulator.getState().ready) {
    CircuitSimulator.init(document.getElementById('sim-canvas'), document.getElementById('osc-canvas'));
    CircuitSimulator.onChange(saveOpenProject); // your open project keeps its circuit (D47)
  }
}

// Toolbar and palette buttons (C2). Wired once, on the first visit.
function wireSimulatorControls() {
  const on = (id, event, fn) => {
    const el = document.getElementById(id);
    if (el && !el._wired) { el._wired = true; el.addEventListener(event, fn); }
  };
  const after = (fn) => () => { fn(); updateSimToolbar(); };
  on('sim-run', 'click', after(() => CircuitSimulator.startSim()));
  on('sim-pause', 'click', after(() => CircuitSimulator.stopSim()));
  on('sim-stop', 'click', after(() => CircuitSimulator.stopSim(true)));
  on('sim-clear', 'click', after(() => CircuitSimulator.resetSim()));
  on('sim-export', 'click', () => CircuitSimulator.exportCircuit());
  on('sim-speed', 'input', (e) => {
    CircuitSimulator.setSimSpeed(e.target.value);
    document.getElementById('sim-speed-val').textContent = `${e.target.value}x`;
  });

  // Oscilloscope (C7): the ON button, and dials that step through their values
  const scopeBtn = document.querySelector('#oscilloscope .instrument-toggle');
  if (scopeBtn && !scopeBtn._wired) {
    scopeBtn._wired = true;
    scopeBtn.addEventListener('click', () => {
      const on = !CircuitSimulator.getState().scope.on;
      CircuitSimulator.setScope({ on });
      scopeBtn.textContent = on ? 'ON' : 'OFF';
      scopeBtn.classList.toggle('active', on);
    });
  }
  wireDial('dial-ch1-volt', 'scope-volt-read', [0.5, 1, 2, 5, 10], v => `${v.toFixed(1)}V`, v => CircuitSimulator.setScope({ voltsPerDiv: v }));
  wireDial('dial-timebase', 'scope-time-read', [10, 50, 100, 500, 1000], v => (v >= 1000 ? `${v / 1000} s` : `${v} ms`), v => CircuitSimulator.setScope({ msPerDiv: v }));

  document.querySelectorAll('#view-simulator .palette-item').forEach(item => {
    if (item._wired) return;
    item._wired = true;
    item.addEventListener('click', () => {
      const type = item.dataset.component;
      if (type === 'wire') showToast('To add a wire, drag from one pin to another on the board', 'info');
      else CircuitSimulator.addComponentToCanvas(type);
    });
  });
}

// A dial starts at its data-val and each click moves to the next value (after the last, back to the first).
function wireDial(dialId, readoutId, values, format, apply) {
  const dial = document.getElementById(dialId);
  const readout = document.getElementById(readoutId);
  if (!dial || dial._wired) return;
  dial._wired = true;
  let i = Math.max(0, values.indexOf(Number(dial.dataset.val)));
  dial.addEventListener('click', () => {
    i = (i + 1) % values.length;
    dial.dataset.val = values[i];
    if (readout) readout.textContent = format(values[i]);
    apply(values[i]);
  });
}

// Run is off while running; Pause needs a running simulation; Stop needs one that has started.
export function updateSimToolbar() {
  const { running, time } = CircuitSimulator.getState();
  const set = (id, disabled) => { const el = document.getElementById(id); if (el) el.disabled = disabled; };
  set('sim-run', running);
  set('sim-pause', !running);
  set('sim-stop', !running && time === 0);
}

registerScreen('simulator', initSimulatorPanel);
