/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Circuit Simulator Engine
   Canvas-based drag-and-drop breadboard simulator with instruments
═══════════════════════════════════════════════════════════════════ */

window.CircuitSimulator = (function () {
  'use strict';

  /* ── State ──────────────────────────────────────────────────── */
  let canvas, ctx, oscCanvas, oscCtx;
  let components = [];
  let wires = [];
  let draggingComponent = null;
  let drawingWire = false;
  let wireStart = null;
  let hoveredNode = null;
  let simRunning = false;
  let simTime = 0;
  let simSpeed = 1;
  let dragOffset = { x: 0, y: 0 };
  let nextId = 1;
  let boardW = 0; // the board's size on screen, in CSS pixels (D45)
  let boardH = 0;
  let oscW = 0;
  let oscH = 0;
  let onChange = null; // told about every change to the circuit (D47)

  // Grid
  const GRID = 20;

  /* ── Colours ──────────────────────────────────────────────────
     Parts are drawn in the theme's colours (--sim-* in tokens.css), read
     again when the theme changes, so they stand out on a light board too
     (F11). Batteries, LEDs and resistor bands keep their real colours.
  ──────────────────────────────────────────────────────────────── */
  const C = { part: '#c0c0c0', label: '#8888aa', accent: '#00d4ff', live: '#00ff88', red: '#ff4444', gold: '#ffd700', purple: '#7b2fff' };
  let coloursFor = null;

  function readColours() {
    const theme = document.documentElement.dataset.theme || 'dark';
    if (theme === coloursFor) return;
    coloursFor = theme;
    const css = getComputedStyle(canvas);
    const token = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
    Object.assign(C, {
      part: token('--sim-part', C.part),
      label: token('--sim-label', C.label),
      accent: token('--sim-accent', C.accent),
      live: token('--sim-live', C.live),
      red: token('--red', C.red),
      gold: token('--gold', C.gold),
      purple: token('--purple', C.purple),
    });
  }

  /* ── Component Definitions ──────────────────────────────────── */
  const COMPONENT_DEFS = {
    resistor: {
      label: 'Resistor',
      width: 60, height: 20,
      nodes: [{ x: 0, y: 10, name: 'A' }, { x: 60, y: 10, name: 'B' }],
      value: 1000,
      unit: 'Ω',
      draw(ctx, comp) {
        const { x, y, w, h } = comp.bounds;
        ctx.strokeStyle = comp.selected ? C.accent : C.part;
        ctx.lineWidth = comp.selected ? 2 : 1.5;
        // Leads
        ctx.beginPath();
        ctx.moveTo(x, y + h / 2);
        ctx.lineTo(x + 12, y + h / 2);
        ctx.moveTo(x + w - 12, y + h / 2);
        ctx.lineTo(x + w, y + h / 2);
        ctx.stroke();
        // Body
        ctx.strokeRect(x + 12, y + 2, w - 24, h - 4);
        // Bands
        const bandColors = ['#ff0000', '#000000', '#ff8800', '#ffd700'];
        bandColors.forEach((c, i) => {
          ctx.fillStyle = c;
          ctx.fillRect(x + 18 + i * 8, y + 2, 4, h - 4);
        });
        // Label
        ctx.fillStyle = C.label;
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(formatValue(comp.value, comp.unit), x + w / 2, y - 4);
      }
    },
    led: {
      label: 'LED',
      width: 40, height: 30,
      nodes: [{ x: 0, y: 15, name: 'A' }, { x: 40, y: 15, name: 'K' }],
      value: 2.0,
      unit: 'V',
      draw(ctx, comp) {
        const { x, y, w, h } = comp.bounds;
        const cx = x + w / 2;
        const cy = y + h / 2;
        const isOn = comp.state && comp.state.on;
        ctx.strokeStyle = comp.selected ? C.accent : C.part;
        ctx.lineWidth = comp.selected ? 2 : 1.5;
        // Leads
        ctx.beginPath();
        ctx.moveTo(x, cy);
        ctx.lineTo(cx - 10, cy);
        ctx.moveTo(cx + 10, cy);
        ctx.lineTo(x + w, cy);
        ctx.stroke();
        // Triangle
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy - 10);
        ctx.lineTo(cx - 10, cy + 10);
        ctx.lineTo(cx + 8, cy);
        ctx.closePath();
        ctx.fillStyle = isOn ? '#00ff00' : 'rgba(0,255,0,0.2)'; // the LED's own light
        ctx.fill();
        ctx.stroke();
        // Bar
        ctx.beginPath();
        ctx.moveTo(cx + 8, cy - 10);
        ctx.lineTo(cx + 8, cy + 10);
        ctx.stroke();
        // Glow
        if (isOn) {
          ctx.save();
          const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 15);
          grd.addColorStop(0, 'rgba(0,255,0,0.4)');
          grd.addColorStop(1, 'rgba(0,255,0,0)');
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(cx, cy, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        // Label
        ctx.fillStyle = C.label;
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LED', cx, y - 4);
      }
    },
    battery: {
      label: 'Battery',
      width: 50, height: 30,
      nodes: [{ x: 0, y: 15, name: '+' }, { x: 50, y: 15, name: '-' }],
      value: 9,
      unit: 'V',
      draw(ctx, comp) {
        const { x, y, w, h } = comp.bounds;
        const cx = x + w / 2;
        const cy = y + h / 2;
        ctx.strokeStyle = comp.selected ? C.accent : C.part;
        ctx.lineWidth = comp.selected ? 2 : 1.5;
        // Leads
        ctx.beginPath();
        ctx.moveTo(x, cy);
        ctx.lineTo(cx - 8, cy);
        ctx.moveTo(cx + 8, cy);
        ctx.lineTo(x + w, cy);
        ctx.stroke();
        // Plates
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy - 10);
        ctx.lineTo(cx - 8, cy + 10);
        ctx.stroke();
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + 8, cy - 6);
        ctx.lineTo(cx + 8, cy + 6);
        ctx.stroke();
        // +/- labels
        ctx.fillStyle = C.gold;
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('+', cx - 8, cy - 13);
        ctx.fillText('−', cx + 8, cy - 9);
        // Value
        ctx.fillStyle = C.label;
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(comp.value + 'V', cx, y - 4);
      }
    },
    capacitor: {
      label: 'Capacitor',
      width: 40, height: 30,
      nodes: [{ x: 0, y: 15, name: '+' }, { x: 40, y: 15, name: '-' }],
      value: 100,
      unit: 'µF',
      draw(ctx, comp) {
        const { x, y, w, h } = comp.bounds;
        const cx = x + w / 2;
        const cy = y + h / 2;
        ctx.strokeStyle = comp.selected ? C.accent : C.part;
        ctx.lineWidth = comp.selected ? 2 : 1.5;
        // Leads
        ctx.beginPath();
        ctx.moveTo(x, cy);
        ctx.lineTo(cx - 5, cy);
        ctx.moveTo(cx + 5, cy);
        ctx.lineTo(x + w, cy);
        ctx.stroke();
        // Plates
        ctx.beginPath();
        ctx.moveTo(cx - 5, cy - 10);
        ctx.lineTo(cx - 5, cy + 10);
        ctx.moveTo(cx + 5, cy - 10);
        ctx.lineTo(cx + 5, cy + 10);
        ctx.stroke();
        // Label
        ctx.fillStyle = C.label;
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(formatValue(comp.value, comp.unit), cx, y - 4);
      }
    },
    switch: {
      label: 'Switch',
      width: 50, height: 24,
      nodes: [{ x: 0, y: 12, name: 'A' }, { x: 50, y: 12, name: 'B' }],
      value: 0,
      unit: '',
      draw(ctx, comp) {
        const { x, y, w, h } = comp.bounds;
        const cy = y + h / 2;
        const closed = comp.state && comp.state.closed;
        ctx.strokeStyle = comp.selected ? C.accent : C.part;
        ctx.lineWidth = comp.selected ? 2 : 1.5;
        // Leads
        ctx.beginPath();
        ctx.moveTo(x, cy);
        ctx.lineTo(x + 12, cy);
        ctx.moveTo(x + w - 12, cy);
        ctx.lineTo(x + w, cy);
        ctx.stroke();
        // Contacts
        ctx.beginPath();
        ctx.arc(x + 12, cy, 3, 0, Math.PI * 2);
        ctx.arc(x + w - 12, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = C.part;
        ctx.fill();
        // Lever
        ctx.beginPath();
        ctx.moveTo(x + 12, cy);
        if (closed) {
          ctx.lineTo(x + w - 12, cy);
        } else {
          ctx.lineTo(x + w - 12, cy - 12);
        }
        ctx.strokeStyle = closed ? C.live : C.red;
        ctx.lineWidth = 2;
        ctx.stroke();
        // Label
        ctx.fillStyle = C.label;
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(closed ? 'CLOSED' : 'OPEN', x + w / 2, y - 4);
      }
    },
    ground: {
      label: 'Ground',
      width: 30, height: 30,
      nodes: [{ x: 15, y: 0, name: 'GND' }],
      value: 0,
      unit: 'V',
      draw(ctx, comp) {
        const { x, y, w } = comp.bounds;
        const cx = x + w / 2;
        ctx.strokeStyle = comp.selected ? C.accent : C.part;
        ctx.lineWidth = comp.selected ? 2 : 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.lineTo(cx, y + 10);
        ctx.stroke();
        // Ground lines
        const lines = [{ w: 20, y: 10 }, { w: 14, y: 15 }, { w: 8, y: 20 }];
        lines.forEach(l => {
          ctx.beginPath();
          ctx.moveTo(cx - l.w / 2, y + l.y);
          ctx.lineTo(cx + l.w / 2, y + l.y);
          ctx.stroke();
        });
      }
    },
    npn: {
      label: 'NPN BJT',
      width: 50, height: 50,
      nodes: [
        { x: 0, y: 25, name: 'B' },
        { x: 50, y: 5, name: 'C' },
        { x: 50, y: 45, name: 'E' }
      ],
      value: 100,
      unit: 'hFE',
      draw(ctx, comp) {
        const { x, y, w, h } = comp.bounds;
        const cx = x + 20;
        const cy = y + h / 2;
        ctx.strokeStyle = comp.selected ? C.accent : C.part;
        ctx.lineWidth = comp.selected ? 2 : 1.5;
        // Base lead
        ctx.beginPath();
        ctx.moveTo(x, cy);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        // Vertical bar
        ctx.beginPath();
        ctx.moveTo(cx, cy - 15);
        ctx.lineTo(cx, cy + 15);
        ctx.stroke();
        // Collector
        ctx.beginPath();
        ctx.moveTo(cx, cy - 10);
        ctx.lineTo(cx + 15, cy - 20);
        ctx.lineTo(x + w, y + 5);
        ctx.stroke();
        // Emitter with arrow
        ctx.beginPath();
        ctx.moveTo(cx, cy + 10);
        ctx.lineTo(cx + 15, cy + 20);
        ctx.lineTo(x + w, y + h - 5);
        ctx.stroke();
        // Arrow on emitter
        ctx.save();
        ctx.translate(cx + 10, cy + 16);
        ctx.rotate(Math.atan2(10, 15));
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-6, -3);
        ctx.lineTo(-6, 3);
        ctx.closePath();
        ctx.fillStyle = C.part;
        ctx.fill();
        ctx.restore();
        // Label
        ctx.fillStyle = C.label;
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('NPN', x + w / 2, y - 4);
      }
    },
    opamp: {
      label: 'Op-Amp',
      width: 60, height: 60,
      nodes: [
        { x: 0, y: 15, name: 'IN+' },
        { x: 0, y: 45, name: 'IN-' },
        { x: 60, y: 30, name: 'OUT' }
      ],
      value: 100000,
      unit: 'V/V',
      draw(ctx, comp) {
        const { x, y, w, h } = comp.bounds;
        ctx.strokeStyle = comp.selected ? C.accent : C.part;
        ctx.lineWidth = comp.selected ? 2 : 1.5;
        // Triangle body
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 5);
        ctx.lineTo(x + 10, y + h - 5);
        ctx.lineTo(x + w - 5, y + h / 2);
        ctx.closePath();
        ctx.strokeStyle = comp.selected ? C.accent : '#ff6b2b';
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,107,43,0.1)';
        ctx.fill();
        // Input leads
        ctx.strokeStyle = comp.selected ? C.accent : C.part;
        ctx.beginPath();
        ctx.moveTo(x, y + 15);
        ctx.lineTo(x + 10, y + 15);
        ctx.moveTo(x, y + 45);
        ctx.lineTo(x + 10, y + 45);
        ctx.moveTo(x + w - 5, y + h / 2);
        ctx.lineTo(x + w, y + h / 2);
        ctx.stroke();
        // +/- symbols
        ctx.fillStyle = C.part;
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('+', x + 13, y + 19);
        ctx.fillText('−', x + 13, y + 49);
        // Label
        ctx.fillStyle = C.label;
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Op-Amp', x + w / 2, y - 4);
      }
    },
    diode: {
      label: 'Diode',
      width: 40, height: 24,
      nodes: [{ x: 0, y: 12, name: 'A' }, { x: 40, y: 12, name: 'K' }],
      value: 0.7,
      unit: 'V',
      draw(ctx, comp) {
        const { x, y, w, h } = comp.bounds;
        const cx = x + w / 2;
        const cy = y + h / 2;
        ctx.strokeStyle = comp.selected ? C.accent : C.part;
        ctx.lineWidth = comp.selected ? 2 : 1.5;
        ctx.beginPath();
        ctx.moveTo(x, cy);
        ctx.lineTo(cx - 8, cy);
        ctx.moveTo(cx + 8, cy);
        ctx.lineTo(x + w, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy - 9);
        ctx.lineTo(cx - 8, cy + 9);
        ctx.lineTo(cx + 8, cy);
        ctx.closePath();
        ctx.fillStyle = 'rgba(136,136,136,0.3)';
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 8, cy - 9);
        ctx.lineTo(cx + 8, cy + 9);
        ctx.stroke();
        ctx.fillStyle = C.label;
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('1N4148', cx, y - 4);
      }
    },
    mosfet: {
      label: 'N-MOSFET',
      width: 55, height: 55,
      nodes: [
        { x: 0, y: 27, name: 'G' },
        { x: 55, y: 5, name: 'D' },
        { x: 55, y: 50, name: 'S' }
      ],
      value: 0,
      unit: '',
      draw(ctx, comp) {
        const { x, y, w, h } = comp.bounds;
        ctx.strokeStyle = comp.selected ? C.accent : C.part;
        ctx.lineWidth = comp.selected ? 2 : 1.5;
        // Gate lead
        ctx.beginPath();
        ctx.moveTo(x, y + h / 2);
        ctx.lineTo(x + 15, y + h / 2);
        ctx.stroke();
        // Gate plate
        ctx.beginPath();
        ctx.moveTo(x + 15, y + 10);
        ctx.lineTo(x + 15, y + h - 10);
        ctx.stroke();
        // Channel
        ctx.beginPath();
        ctx.moveTo(x + 20, y + 10);
        ctx.lineTo(x + 20, y + h - 10);
        ctx.stroke();
        // Drain/Source connections
        ctx.beginPath();
        ctx.moveTo(x + 20, y + 10);
        ctx.lineTo(x + 35, y + 10);
        ctx.lineTo(x + 35, y + 5);
        ctx.lineTo(x + w, y + 5);
        ctx.moveTo(x + 20, y + h - 10);
        ctx.lineTo(x + 35, y + h - 10);
        ctx.lineTo(x + 35, y + h - 5);
        ctx.lineTo(x + w, y + h - 5);
        ctx.stroke();
        // Arrow
        ctx.beginPath();
        ctx.moveTo(x + 20, y + h / 2);
        ctx.lineTo(x + 35, y + h / 2);
        ctx.stroke();
        ctx.fillStyle = C.part;
        ctx.beginPath();
        ctx.moveTo(x + 20, y + h / 2);
        ctx.lineTo(x + 26, y + h / 2 - 4);
        ctx.lineTo(x + 26, y + h / 2 + 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = C.label;
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('NMOS', x + w / 2, y - 4);
      }
    },
    arduino: {
      label: 'Arduino',
      width: 100, height: 70,
      nodes: [
        { x: 0, y: 10, name: 'D2' },
        { x: 0, y: 20, name: 'D3' },
        { x: 0, y: 30, name: 'D4' },
        { x: 0, y: 40, name: 'D5' },
        { x: 0, y: 50, name: 'D6' },
        { x: 0, y: 60, name: 'GND' },
        { x: 100, y: 10, name: '5V' },
        { x: 100, y: 20, name: 'A0' },
        { x: 100, y: 30, name: 'A1' },
        { x: 100, y: 40, name: 'SDA' },
        { x: 100, y: 50, name: 'SCL' },
        { x: 100, y: 60, name: 'GND' },
      ],
      value: 0,
      unit: '',
      draw(ctx, comp) {
        const { x, y, w, h } = comp.bounds;
        ctx.fillStyle = comp.selected ? 'rgba(0,212,255,0.1)' : 'rgba(0,151,157,0.15)';
        ctx.strokeStyle = comp.selected ? C.accent : '#00979D';
        ctx.lineWidth = comp.selected ? 2 : 1.5;
        ctx.beginPath();
        ctx.roundRect(x + 5, y + 5, w - 10, h - 10, 4);
        ctx.fill();
        ctx.stroke();
        // Label
        ctx.fillStyle = '#00979D';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ARDUINO', x + w / 2, y + h / 2 + 4);
        // Pin labels
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.fillStyle = C.label;
        const leftPins = ['D2','D3','D4','D5','D6','GND'];
        const rightPins = ['5V','A0','A1','SDA','SCL','GND'];
        leftPins.forEach((p, i) => {
          ctx.textAlign = 'left';
          ctx.fillText(p, x + 8, y + 14 + i * 10);
        });
        rightPins.forEach((p, i) => {
          ctx.textAlign = 'right';
          ctx.fillText(p, x + w - 8, y + 14 + i * 10);
        });
      }
    },
    esp32: {
      label: 'ESP32',
      width: 100, height: 80,
      nodes: [
        { x: 0, y: 10, name: 'GPIO2' },
        { x: 0, y: 20, name: 'GPIO4' },
        { x: 0, y: 30, name: 'GPIO5' },
        { x: 0, y: 40, name: 'GPIO18' },
        { x: 0, y: 50, name: 'GPIO19' },
        { x: 0, y: 60, name: 'GPIO21' },
        { x: 0, y: 70, name: 'GND' },
        { x: 100, y: 10, name: '3V3' },
        { x: 100, y: 20, name: 'GPIO22' },
        { x: 100, y: 30, name: 'GPIO23' },
        { x: 100, y: 40, name: 'GPIO25' },
        { x: 100, y: 50, name: 'GPIO26' },
        { x: 100, y: 60, name: 'GPIO27' },
        { x: 100, y: 70, name: 'GND' },
      ],
      value: 0,
      unit: '',
      draw(ctx, comp) {
        const { x, y, w, h } = comp.bounds;
        ctx.fillStyle = comp.selected ? 'rgba(0,212,255,0.1)' : 'rgba(123,47,255,0.1)';
        ctx.strokeStyle = comp.selected ? C.accent : C.purple;
        ctx.lineWidth = comp.selected ? 2 : 1.5;
        ctx.beginPath();
        ctx.roundRect(x + 5, y + 5, w - 10, h - 10, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = C.purple;
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ESP32', x + w / 2, y + h / 2 + 4);
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.fillStyle = C.label;
        const leftPins = ['GPIO2','GPIO4','GPIO5','GPIO18','GPIO19','GPIO21','GND'];
        const rightPins = ['3V3','GPIO22','GPIO23','GPIO25','GPIO26','GPIO27','GND'];
        leftPins.forEach((p, i) => {
          ctx.textAlign = 'left';
          ctx.fillText(p, x + 8, y + 14 + i * 10);
        });
        rightPins.forEach((p, i) => {
          ctx.textAlign = 'right';
          ctx.fillText(p, x + w - 8, y + 14 + i * 10);
        });
      }
    }
  };

  /* ── Helpers ────────────────────────────────────────────────── */
  function snap(v) { return Math.round(v / GRID) * GRID; }

  function formatValue(v, unit) {
    if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M' + unit;
    if (v >= 1e3) return (v / 1e3).toFixed(1) + 'k' + unit;
    return v + unit;
  }

  function getNodeWorld(comp, nodeIdx) {
    const node = comp.def.nodes[nodeIdx];
    return {
      x: comp.x + node.x,
      y: comp.y + node.y
    };
  }

  function hitTestNode(comp, mx, my) {
    for (let i = 0; i < comp.def.nodes.length; i++) {
      const n = getNodeWorld(comp, i);
      if (Math.hypot(mx - n.x, my - n.y) < 8) return i;
    }
    return -1;
  }

  function hitTestComp(comp, mx, my) {
    return mx >= comp.x && mx <= comp.x + comp.def.width &&
           my >= comp.y && my <= comp.y + comp.def.height;
  }

  /* ── Component Factory ──────────────────────────────────────── */
  function createComponent(type, x, y) {
    const def = COMPONENT_DEFS[type];
    if (!def) return null;
    return {
      id: nextId++,
      type,
      def,
      x: snap(x - def.width / 2),
      y: snap(y - def.height / 2),
      value: def.value,
      unit: def.unit,
      selected: false,
      state: { on: false, closed: false, voltage: 0, current: 0, drop: 0 },
      get bounds() {
        return { x: this.x, y: this.y, w: this.def.width, h: this.def.height };
      }
    };
  }

  /* ── Init ───────────────────────────────────────────────────── */
  function init(simCanvasEl, oscCanvasEl) {
    if (ctx) return; // set up once (D3)
    canvas = simCanvasEl;
    oscCanvas = oscCanvasEl;
    ctx = canvas.getContext('2d');
    if (oscCanvas) oscCtx = oscCanvas.getContext('2d');

    // Follow the board's size: a window resize, the sidebar being hidden (D35),
    // and the screen being shown again after a resize while it was hidden.
    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas);
    if (oscCanvas) observer.observe(oscCanvas);

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    // On the window, so letting go outside the board still ends a drag (D41)
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('dblclick', onDblClick);
    canvas.addEventListener('contextmenu', onContextMenu);

    // Drag from palette
    document.querySelectorAll('.palette-item').forEach(item => {
      item.draggable = true;
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('component-type', item.dataset.component);
      });
    });

    canvas.addEventListener('dragover', (e) => e.preventDefault());
    canvas.addEventListener('drop', onDrop);

    render();
  }

  // Size each canvas to its box on screen. On a high-DPI screen it gets that
  // many pixels per CSS pixel, so lines are sharp; drawing and the mouse
  // still use CSS pixels (D45). A hidden canvas (0 × 0) keeps its last size.
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const fit = (el, context) => {
      const box = el.getBoundingClientRect();
      if (!box.width) return null;
      el.width = Math.round(box.width * dpr);
      el.height = Math.round(box.height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      return box;
    };
    const osc = oscCanvas && fit(oscCanvas, oscCtx);
    if (osc) { oscW = osc.width; oscH = osc.height; }
    const board = canvas && fit(canvas, ctx);
    if (board) { boardW = board.width; boardH = board.height; }
  }

  /* ── Mouse Events ───────────────────────────────────────────── */
  function onMouseDown(e) {
    const { mx, my } = getMouse(e);

    // Check nodes first (wire drawing)
    for (const comp of components) {
      const ni = hitTestNode(comp, mx, my);
      if (ni >= 0) {
        drawingWire = true;
        wireStart = { comp, nodeIdx: ni, x: getNodeWorld(comp, ni).x, y: getNodeWorld(comp, ni).y };
        return;
      }
    }

    // Check components
    let hit = null;
    for (let i = components.length - 1; i >= 0; i--) {
      if (hitTestComp(components[i], mx, my)) {
        hit = components[i];
        break;
      }
    }

    // Deselect all
    components.forEach(c => c.selected = false);

    if (hit) {
      hit.selected = true;
      draggingComponent = hit;
      dragOffset = { x: mx - hit.x, y: my - hit.y };
    }
  }

  function onMouseMove(e) {
    const { mx, my } = getMouse(e);

    if (draggingComponent) {
      draggingComponent.x = snap(mx - dragOffset.x);
      draggingComponent.y = snap(my - dragOffset.y);
      updateWirePositions(); // its wires follow while it moves (D41)
    }

    if (drawingWire) {
      wireStart.endX = mx;
      wireStart.endY = my;
    }

    // Hover node detection
    hoveredNode = null;
    for (const comp of components) {
      const ni = hitTestNode(comp, mx, my);
      if (ni >= 0) {
        hoveredNode = { comp, nodeIdx: ni };
        canvas.style.cursor = 'crosshair';
        return;
      }
    }

    canvas.style.cursor = draggingComponent ? 'grabbing' : 'default';
  }

  function onMouseUp(e) {
    const { mx, my } = getMouse(e);

    if (drawingWire && wireStart) {
      // Check if we landed on a node
      for (const comp of components) {
        if (comp === wireStart.comp) continue;
        const ni = hitTestNode(comp, mx, my);
        if (ni >= 0) {
          const endNode = getNodeWorld(comp, ni);
          wires.push({
            id: nextId++,
            from: { comp: wireStart.comp, nodeIdx: wireStart.nodeIdx },
            to: { comp, nodeIdx: ni },
            x1: wireStart.x, y1: wireStart.y,
            x2: endNode.x, y2: endNode.y,
          });
          runSimulation();
        }
      }
    }

    const moved = draggingComponent !== null;
    drawingWire = false;
    wireStart = null;
    draggingComponent = null;

    // Update wire positions
    updateWirePositions();
    if (moved) notifyChange();
  }

  function onDblClick(e) {
    const { mx, my } = getMouse(e);
    // Toggle switch
    for (const comp of components) {
      if (comp.type === 'switch' && hitTestComp(comp, mx, my)) {
        comp.state.closed = !comp.state.closed;
        runSimulation();
        return;
      }
    }
  }

  function onContextMenu(e) {
    e.preventDefault();
    const { mx, my } = getMouse(e);
    for (let i = components.length - 1; i >= 0; i--) {
      if (hitTestComp(components[i], mx, my)) {
        const [removed] = components.splice(i, 1);
        // Remove its wires (D19)
        wires = wires.filter(w => w.from.comp !== removed && w.to.comp !== removed);
        runSimulation();
        return;
      }
    }
  }

  function onDrop(e) {
    e.preventDefault();
    const type = e.dataTransfer.getData('component-type');
    if (!type) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const comp = createComponent(type, x, y);
    if (comp) {
      components.push(comp);
      runSimulation();
      showToast(`Added ${COMPONENT_DEFS[type].label}`, 'info');
    }
  }

  function getMouse(e) {
    const rect = canvas.getBoundingClientRect();
    return { mx: e.clientX - rect.left, my: e.clientY - rect.top };
  }

  function updateWirePositions() {
    wires.forEach(w => {
      w.x1 = getNodeWorld(w.from.comp, w.from.nodeIdx).x;
      w.y1 = getNodeWorld(w.from.comp, w.from.nodeIdx).y;
      w.x2 = getNodeWorld(w.to.comp, w.to.nodeIdx).x;
      w.y2 = getNodeWorld(w.to.comp, w.to.nodeIdx).y;
    });
  }

  /* ── Simulation Engine ──────────────────────────────────────── */
  // DC solver (D12). Wires and closed switches join pins into nets; the
  // voltages come from nodal analysis. Batteries have a small internal
  // resistance, LEDs and diodes conduct only forwards (their forward voltage
  // plus a small resistance), and capacitors don't conduct in DC. Parts
  // without a model here (transistors, boards…) don't conduct. A tiny leak
  // from every net to ground keeps unconnected parts solvable (they read 0 V).
  const R_BATTERY = 0.5;   // Ω
  const R_DIODE_ON = 10;   // Ω
  const G_LEAK = 1e-9;     // S
  const I_LED_ON = 0.001;  // A: an LED lights above 1 mA
  let netCount = 0;

  function runSimulation() {
    updateWirePositions();

    // Join pins into nets
    const pin = (comp, i) => `${comp.id}:${i}`;
    const parent = new Map();
    const find = (p) => (parent.get(p) === p ? p : find(parent.get(p)));
    const join = (a, b) => parent.set(find(a), find(b));
    components.forEach(c => c.def.nodes.forEach((_, i) => parent.set(pin(c, i), pin(c, i))));
    wires.forEach(w => join(pin(w.from.comp, w.from.nodeIdx), pin(w.to.comp, w.to.nodeIdx)));
    components.forEach(c => { if (c.type === 'switch' && c.state.closed) join(pin(c, 0), pin(c, 1)); });

    // Number the nets. Ground is a ground part, else the first battery's − pin.
    const roots = [...new Set([...parent.keys()].map(find))];
    netCount = roots.length;
    const groundPart = components.find(c => c.type === 'ground');
    const firstBattery = components.find(c => c.type === 'battery');
    const ground = groundPart ? find(pin(groundPart, 0)) : firstBattery ? find(pin(firstBattery, 1)) : null;
    const index = new Map(roots.filter(r => r !== ground).map((r, i) => [r, i]));
    const net = (comp, i) => { const r = find(pin(comp, i)); return r === ground ? -1 : index.get(r); };

    const diodes = components.filter(c => c.type === 'led' || c.type === 'diode');
    diodes.forEach(d => { d.state.on = false; });

    // Solve, then switch each diode on or off until nothing changes
    let volts = [];
    for (let pass = 0; pass < 20; pass++) {
      volts = solveNets(index.size, net);
      let changed = false;
      diodes.forEach(d => {
        const vd = voltAt(volts, net(d, 0)) - voltAt(volts, net(d, 1));
        const on = vd > d.value; // conducts when forward-biased past its forward voltage
        if (on !== d.state.on) { d.state.on = on; changed = true; }
      });
      if (!changed) break;
    }

    // Store each part's highest pin voltage and the current through it
    components.forEach(c => {
      const v = c.def.nodes.map((_, i) => voltAt(volts, net(c, i)));
      const drop = (v[0] || 0) - (v[1] || 0);
      c.state.voltage = Math.max(0, ...v);
      c.state.drop = drop;
      c.state.current =
        c.type === 'resistor' ? Math.abs(drop) / c.value :
        c.type === 'battery' ? Math.max(0, (c.value - drop) / R_BATTERY) :
        (c.type === 'led' || c.type === 'diode') && c.state.on ? (drop - c.value) / R_DIODE_ON :
        0;
    });
    components.forEach(c => { if (c.type === 'led') c.state.on = c.state.current > I_LED_ON; });
    notifyChange();
  }

  function notifyChange() {
    if (onChange) onChange(getCircuit());
  }

  function voltAt(volts, n) {
    return n < 0 ? 0 : volts[n];
  }

  // Nodal analysis: build G·V = I for the nets (ground excluded) and solve it.
  function solveNets(n, net) {
    const G = Array.from({ length: n }, () => new Array(n).fill(0));
    const I = new Array(n).fill(0);
    const conductance = (a, b, g) => {
      if (a >= 0) G[a][a] += g;
      if (b >= 0) G[b][b] += g;
      if (a >= 0 && b >= 0) { G[a][b] -= g; G[b][a] -= g; }
    };
    const inject = (a, i) => { if (a >= 0) I[a] += i; };

    for (let k = 0; k < n; k++) G[k][k] += G_LEAK;
    components.forEach(c => {
      if (c.type === 'resistor') {
        conductance(net(c, 0), net(c, 1), 1 / c.value);
      } else if (c.type === 'battery') {
        // A voltage source with internal resistance, as a current source in parallel
        conductance(net(c, 0), net(c, 1), 1 / R_BATTERY);
        inject(net(c, 0), c.value / R_BATTERY);
        inject(net(c, 1), -c.value / R_BATTERY);
      } else if ((c.type === 'led' || c.type === 'diode') && c.state.on) {
        // i = (Va − Vk − Vf) / R
        conductance(net(c, 0), net(c, 1), 1 / R_DIODE_ON);
        inject(net(c, 0), c.value / R_DIODE_ON);
        inject(net(c, 1), -c.value / R_DIODE_ON);
      }
    });
    return gaussianSolve(G, I);
  }

  // Solve A·x = b (Gaussian elimination with partial pivoting).
  function gaussianSolve(A, b) {
    const n = b.length;
    for (let col = 0; col < n; col++) {
      let best = col;
      for (let r = col + 1; r < n; r++) if (Math.abs(A[r][col]) > Math.abs(A[best][col])) best = r;
      [A[col], A[best]] = [A[best], A[col]];
      [b[col], b[best]] = [b[best], b[col]];
      for (let r = col + 1; r < n; r++) {
        const f = A[r][col] / A[col][col];
        for (let k = col; k < n; k++) A[r][k] -= f * A[col][k];
        b[r] -= f * b[col];
      }
    }
    const x = new Array(n).fill(0);
    for (let r = n - 1; r >= 0; r--) {
      let sum = b[r];
      for (let k = r + 1; k < n; k++) sum -= A[r][k] * x[k];
      x[r] = sum / A[r][r];
    }
    return x;
  }

  /* ── Render ─────────────────────────────────────────────────── */
  let wireAnimOffset = 0;
  let lastFrame = 0;
  let frameCount = 0;

  function render() {
    requestAnimationFrame(render);
    // Don't draw while the Simulator screen is hidden (D5): offsetParent is null under display:none.
    // The simulation pauses too, and restarts its clock when the screen comes back.
    if (!ctx || canvas.offsetParent === null) { lastFrame = 0; return; }
    readColours();
    frameCount++;

    // Time-based clock (D20): real seconds since the last frame, at most 1 s
    const now = performance.now();
    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 1) : 0;
    lastFrame = now;

    ctx.clearRect(0, 0, boardW, boardH);

    if (simRunning) {
      simTime += dt * simSpeed;
      wireAnimOffset = (wireAnimOffset + dt * 60) % 20;
    }

    // Draw wires
    drawWires();

    // Draw wire being drawn
    if (drawingWire && wireStart) {
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(wireStart.x, wireStart.y);
      ctx.lineTo(wireStart.endX || wireStart.x, wireStart.endY || wireStart.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw components
    components.forEach(comp => {
      ctx.save();
      comp.def.draw(ctx, comp);
      drawNodes(comp);
      ctx.restore();
    });

    // Draw oscilloscope
    if (oscCtx) drawOscilloscope();

    // Update multimeter and status bar
    updateMultimeter();
    updateStatus();
  }

  function drawWires() {
    wires.forEach(wire => {
      const isActive = wire.from.comp.state.current > 0 && wire.to.comp.state.current > 0;

      ctx.save();
      ctx.lineWidth = 2;

      if (isActive && simRunning) {
        // Animated current flow
        ctx.strokeStyle = C.live;
        ctx.shadowColor = C.live;
        ctx.shadowBlur = 4;
        ctx.setLineDash([8, 8]);
        ctx.lineDashOffset = -wireAnimOffset;
      } else {
        ctx.strokeStyle = C.accent;
        ctx.setLineDash([]);
      }

      // Route wire with right angles
      const dx = wire.x2 - wire.x1;
      const midX = wire.x1 + dx / 2;

      ctx.beginPath();
      ctx.moveTo(wire.x1, wire.y1);
      ctx.lineTo(midX, wire.y1);
      ctx.lineTo(midX, wire.y2);
      ctx.lineTo(wire.x2, wire.y2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Junction dots
      ctx.fillStyle = C.accent;
      ctx.beginPath();
      ctx.arc(wire.x1, wire.y1, 3, 0, Math.PI * 2);
      ctx.arc(wire.x2, wire.y2, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawNodes(comp) {
    comp.def.nodes.forEach((node, i) => {
      const nx = comp.x + node.x;
      const ny = comp.y + node.y;
      const isHovered = hoveredNode && hoveredNode.comp === comp && hoveredNode.nodeIdx === i;

      ctx.beginPath();
      ctx.arc(nx, ny, isHovered ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = C.accent;
      ctx.globalAlpha = isHovered ? 1 : 0.5;
      ctx.fill();
      ctx.globalAlpha = 1;

      if (isHovered) {
        ctx.strokeStyle = C.accent;
        ctx.lineWidth = 1;
        ctx.stroke();
        // Node label
        ctx.fillStyle = C.accent;
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, nx, ny - 8);
      }
    });
  }

  /* ── Oscilloscope ───────────────────────────────────────────── */
  // CH1 = the battery's voltage, CH2 = the voltage across the first LED (D21).
  // Samples keep their simulation time. The screen shows the last 10 divisions
  // of time, with 0 V on the centre line and 2 divisions above and below it.
  const scope = { on: true, voltsPerDiv: 2, msPerDiv: 10 };
  const SCOPE_MAX_WINDOW = 10; // s: 10 divisions at the slowest T/div (1 s)
  let scopeSamples = [];

  function scopeChannels() {
    const battery = components.find(c => c.type === 'battery');
    const led = components.find(c => c.type === 'led');
    return { ch1: battery ? battery.state.drop : 0, ch2: led ? led.state.drop : 0 };
  }

  function setScope(settings) {
    Object.assign(scope, settings);
  }

  // The scope screen looks like real hardware, dark in both themes, so it
  // keeps its own colours.
  function drawOscilloscope() {
    const w = oscW;
    const h = oscH;
    const { ch1, ch2 } = scopeChannels();

    if (simRunning) {
      scopeSamples.push({ t: simTime, ch1, ch2 });
      scopeSamples = scopeSamples.filter(p => p.t >= simTime - SCOPE_MAX_WINDOW);
    }

    oscCtx.fillStyle = '#000';
    oscCtx.fillRect(0, 0, w, h);
    oscCtx.font = '9px JetBrains Mono, monospace';

    if (!scope.on) {
      oscCtx.fillStyle = 'rgba(0,212,255,0.4)';
      oscCtx.textAlign = 'center';
      oscCtx.fillText('OFF', w / 2, h / 2 + 3);
      return;
    }

    // Grid: 10 × 4 divisions, 0 V on the centre line
    oscCtx.strokeStyle = 'rgba(0,212,255,0.1)';
    oscCtx.lineWidth = 0.5;
    for (let i = 0; i <= 10; i++) {
      oscCtx.beginPath();
      oscCtx.moveTo(i * w / 10, 0);
      oscCtx.lineTo(i * w / 10, h);
      oscCtx.stroke();
    }
    for (let i = 0; i <= 4; i++) {
      oscCtx.beginPath();
      oscCtx.moveTo(0, i * h / 4);
      oscCtx.lineTo(w, i * h / 4);
      oscCtx.stroke();
    }
    oscCtx.strokeStyle = 'rgba(0,212,255,0.2)';
    oscCtx.lineWidth = 1;
    oscCtx.beginPath();
    oscCtx.moveTo(0, h / 2);
    oscCtx.lineTo(w, h / 2);
    oscCtx.stroke();

    // Traces: the newest sample is at the right edge
    const windowS = scope.msPerDiv * 10 / 1000;
    const x = t => w - ((simTime - t) / windowS) * w;
    const y = v => h / 2 - (v / scope.voltsPerDiv) * (h / 4);
    [['ch1', '#00d4ff'], ['ch2', '#00ff88']].forEach(([key, color]) => {
      oscCtx.strokeStyle = color;
      oscCtx.lineWidth = 1.5;
      oscCtx.beginPath();
      scopeSamples.filter(p => p.t >= simTime - windowS).forEach((p, i) => {
        i === 0 ? oscCtx.moveTo(x(p.t), y(p[key])) : oscCtx.lineTo(x(p.t), y(p[key]));
      });
      oscCtx.stroke();
    });

    // Live readings
    oscCtx.textAlign = 'left';
    oscCtx.fillStyle = '#00d4ff';
    oscCtx.fillText(`CH1 battery: ${ch1.toFixed(2)}V`, 4, 12);
    oscCtx.fillStyle = '#00ff88';
    oscCtx.fillText(`CH2 LED: ${ch2.toFixed(2)}V`, 4, 24);
  }

  /* ── Multimeter ─────────────────────────────────────────────── */
  function updateMultimeter() {
    const mmEl = document.getElementById('multimeter-val');
    const mmUnitEl = document.getElementById('multimeter-unit');
    if (!mmEl) return;

    // Find highest voltage in circuit
    let maxV = 0;
    components.forEach(c => {
      if (c.state.voltage > maxV) maxV = c.state.voltage;
    });

    const mmMode = document.getElementById('mm-mode');
    const mode = mmMode ? mmMode.value : 'voltage';

    if (mode === 'voltage') {
      mmEl.textContent = maxV.toFixed(2);
      if (mmUnitEl) mmUnitEl.textContent = 'V';
    } else if (mode === 'current') {
      // Current the batteries supply
      let totalCurrent = 0;
      components.forEach(c => { if (c.type === 'battery') totalCurrent += c.state.current; });
      mmEl.textContent = (totalCurrent * 1000).toFixed(1);
      if (mmUnitEl) mmUnitEl.textContent = 'mA';
    } else if (mode === 'resistance') {
      // The resistance the battery sees: its voltage ÷ its current. "OL" (open) when no current flows.
      const battery = components.find(c => c.type === 'battery');
      const r = battery && battery.state.current > 1e-9 ? battery.state.drop / battery.state.current : Infinity;
      const kilo = isFinite(r) && r >= 999.5; // 999.99 Ω shows as 1.00 kΩ
      mmEl.textContent = !isFinite(r) ? 'OL' : kilo ? (r / 1000).toFixed(2) : r.toFixed(0);
      if (mmUnitEl) mmUnitEl.textContent = kilo ? 'kΩ' : 'Ω';
    }
  }

  /* ── Status Bar ─────────────────────────────────────────────── */
  function updateStatus() {
    const text = document.getElementById('sim-status-text');
    if (!text) return;
    text.textContent = simRunning ? 'Running' : simTime > 0 ? 'Paused' : 'Ready';
    document.getElementById('sim-indicator')?.classList.toggle('running', simRunning);
    const time = document.getElementById('sim-time');
    if (time) time.textContent = `t = ${simTime.toFixed(3)}s`;
    const nodes = document.getElementById('sim-nodes');
    if (nodes) nodes.textContent = `Nodes: ${netCount}`;
  }

  /* ── Public Controls ────────────────────────────────────────── */
  function startSim() {
    simRunning = true;
    runSimulation();
    showToast('Simulation started', 'success');
  }

  // Pause keeps the time; stop (rewind = true) sets it back to 0.
  function stopSim(rewind = false) {
    simRunning = false;
    if (rewind) { simTime = 0; scopeSamples = []; }
    showToast(rewind ? 'Simulation stopped' : 'Simulation paused', 'info');
  }

  function resetSim() {
    components = [];
    wires = [];
    simRunning = false;
    simTime = 0;
    scopeSamples = [];
    runSimulation();
    showToast('Circuit cleared', 'info');
  }

  function addComponentToCanvas(type) {
    const w = boardW || 400;
    const h = boardH || 300;
    const comp = createComponent(type, w / 2 + Math.random() * 60 - 30, h / 2 + Math.random() * 60 - 30);
    if (comp) {
      components.push(comp);
      runSimulation();
    }
    return Boolean(comp);
  }

  function setSimSpeed(speed) {
    simSpeed = parseFloat(speed);
  }

  // Build a circuit from the JSON that exportCircuit() writes.
  function loadCircuit(data) {
    components = [];
    wires = [];
    const byId = new Map();
    (data.components || []).forEach((d, i) => {
      const comp = createComponent(d.type, 0, 0);
      if (!comp) return;
      comp.x = d.x;
      comp.y = d.y;
      if (d.value !== undefined) comp.value = d.value;
      if (d.closed) comp.state.closed = true; // a switch keeps its position (D44)
      components.push(comp);
      byId.set(d.id ?? i, comp);
    });
    (data.wires || []).forEach(w => {
      const from = byId.get(w.from.compId);
      const to = byId.get(w.to.compId);
      if (from && to) wires.push({ id: nextId++, from: { comp: from, nodeIdx: w.from.nodeIdx }, to: { comp: to, nodeIdx: w.to.nodeIdx } });
    });
    runSimulation();
  }

  // The circuit as plain data: what Export saves and loadCircuit() reads.
  function getCircuit() {
    return {
      components: components.map(c => ({
        id: c.id, type: c.type, x: c.x, y: c.y, value: c.value,
        ...(c.type === 'switch' ? { closed: c.state.closed } : {}),
      })),
      wires: wires.map(w => ({
        from: { compId: w.from.comp.id, nodeIdx: w.from.nodeIdx },
        to: { compId: w.to.comp.id, nodeIdx: w.to.nodeIdx }
      }))
    };
  }

  function exportCircuit() {
    const blob = new Blob([JSON.stringify(getCircuit(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'circuit.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0); // free the file once the download has it (D44)
    showToast('Circuit exported', 'success');
  }

  function showToast(msg, type) {
    if (window.CircuitApp && window.CircuitApp.showToast) {
      window.CircuitApp.showToast(msg, type);
    }
  }

  /* ── Public API ─────────────────────────────────────────────── */
  return {
    init,
    startSim,
    stopSim,
    resetSim,
    addComponentToCanvas,
    setSimSpeed,
    setScope,
    exportCircuit,
    loadCircuit,
    getCircuit,
    onChange: (fn) => { onChange = fn; },
    isRunning: () => simRunning,
    getFrameCount: () => frameCount,
    getState: () => ({
      ready: Boolean(ctx), parts: components.map(c => c.type), wires: wires.length, running: simRunning, time: simTime, speed: simSpeed,
      readings: components.map(c => ({ type: c.type, on: c.state.on, volts: +c.state.voltage.toFixed(3), mA: +(c.state.current * 1000).toFixed(2) })),
      positions: components.map(c => [c.x, c.y]),
      wireEnds: wires.map(w => [w.x1, w.y1, w.x2, w.y2]),
      scope: { ...scope, ...scopeChannels(), samples: scopeSamples.length },
    }),
  };
})();
