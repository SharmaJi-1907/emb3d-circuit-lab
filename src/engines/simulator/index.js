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
  let selectedComponent = null;
  let draggingComponent = null;
  let drawingWire = false;
  let wireStart = null;
  let hoveredNode = null;
  let simRunning = false;
  let simTime = 0;
  let simSpeed = 1;
  let animId = null;
  let dragOffset = { x: 0, y: 0 };
  let nextId = 1;

  // Instruments
  let oscEnabled = true;
  let mmEnabled = true;
  let sigGenEnabled = false;
  let sigGenFreq = 1000;
  let sigGenAmp = 5;
  let sigGenWave = 'sine';

  // Grid
  const GRID = 20;

  /* ── Component Definitions ──────────────────────────────────── */
  const COMPONENT_DEFS = {
    resistor: {
      label: 'Resistor',
      width: 60, height: 20,
      nodes: [{ x: 0, y: 10, name: 'A' }, { x: 60, y: 10, name: 'B' }],
      value: 1000,
      unit: 'Ω',
      color: '#8b4513',
      draw(ctx, comp) {
        const { x, y, w, h } = comp.bounds;
        ctx.strokeStyle = comp.selected ? '#00d4ff' : '#c0c0c0';
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
        ctx.fillStyle = '#8888aa';
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
      color: '#00ff00',
      draw(ctx, comp) {
        const { x, y, w, h } = comp.bounds;
        const cx = x + w / 2;
        const cy = y + h / 2;
        const isOn = comp.state && comp.state.on;
        ctx.strokeStyle = comp.selected ? '#00d4ff' : '#c0c0c0';
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
        ctx.fillStyle = isOn ? (comp.ledColor || '#00ff00') : 'rgba(0,255,0,0.2)';
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
        ctx.fillStyle = '#8888aa';
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
      color: '#ffd700',
      draw(ctx, comp) {
        const { x, y, w, h } = comp.bounds;
        const cx = x + w / 2;
        const cy = y + h / 2;
        ctx.strokeStyle = comp.selected ? '#00d4ff' : '#c0c0c0';
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
        ctx.fillStyle = '#ffd700';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('+', cx - 8, cy - 13);
        ctx.fillText('−', cx + 8, cy - 9);
        // Value
        ctx.fillStyle = '#8888aa';
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
      color: '#1a3a6a',
      draw(ctx, comp) {
        const { x, y, w, h } = comp.bounds;
        const cx = x + w / 2;
        const cy = y + h / 2;
        ctx.strokeStyle = comp.selected ? '#00d4ff' : '#c0c0c0';
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
        ctx.fillStyle = '#8888aa';
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
      color: '#888888',
      draw(ctx, comp) {
        const { x, y, w, h } = comp.bounds;
        const cy = y + h / 2;
        const closed = comp.state && comp.state.closed;
        ctx.strokeStyle = comp.selected ? '#00d4ff' : '#c0c0c0';
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
        ctx.fillStyle = '#c0c0c0';
        ctx.fill();
        // Lever
        ctx.beginPath();
        ctx.moveTo(x + 12, cy);
        if (closed) {
          ctx.lineTo(x + w - 12, cy);
        } else {
          ctx.lineTo(x + w - 12, cy - 12);
        }
        ctx.strokeStyle = closed ? '#00ff88' : '#ff4444';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Label
        ctx.fillStyle = '#8888aa';
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
      color: '#888888',
      draw(ctx, comp) {
        const { x, y, w, h } = comp.bounds;
        const cx = x + w / 2;
        ctx.strokeStyle = comp.selected ? '#00d4ff' : '#888888';
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
      color: '#7b2fff',
      draw(ctx, comp) {
        const { x, y, w, h } = comp.bounds;
        const cx = x + 20;
        const cy = y + h / 2;
        ctx.strokeStyle = comp.selected ? '#00d4ff' : '#c0c0c0';
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
        ctx.fillStyle = '#c0c0c0';
        ctx.fill();
        ctx.restore();
        // Label
        ctx.fillStyle = '#8888aa';
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
      color: '#ff6b2b',
      draw(ctx, comp) {
        const { x, y, w, h } = comp.bounds;
        ctx.strokeStyle = comp.selected ? '#00d4ff' : '#c0c0c0';
        ctx.lineWidth = comp.selected ? 2 : 1.5;
        // Triangle body
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 5);
        ctx.lineTo(x + 10, y + h - 5);
        ctx.lineTo(x + w - 5, y + h / 2);
        ctx.closePath();
        ctx.strokeStyle = comp.selected ? '#00d4ff' : '#ff6b2b';
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,107,43,0.1)';
        ctx.fill();
        // Input leads
        ctx.strokeStyle = comp.selected ? '#00d4ff' : '#c0c0c0';
        ctx.beginPath();
        ctx.moveTo(x, y + 15);
        ctx.lineTo(x + 10, y + 15);
        ctx.moveTo(x, y + 45);
        ctx.lineTo(x + 10, y + 45);
        ctx.moveTo(x + w - 5, y + h / 2);
        ctx.lineTo(x + w, y + h / 2);
        ctx.stroke();
        // +/- symbols
        ctx.fillStyle = '#c0c0c0';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('+', x + 13, y + 19);
        ctx.fillText('−', x + 13, y + 49);
        // Label
        ctx.fillStyle = '#8888aa';
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
      color: '#888888',
      draw(ctx, comp) {
        const { x, y, w, h } = comp.bounds;
        const cx = x + w / 2;
        const cy = y + h / 2;
        ctx.strokeStyle = comp.selected ? '#00d4ff' : '#c0c0c0';
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
        ctx.fillStyle = '#8888aa';
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
      color: '#00d4ff',
      draw(ctx, comp) {
        const { x, y, w, h } = comp.bounds;
        ctx.strokeStyle = comp.selected ? '#00d4ff' : '#c0c0c0';
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
        ctx.fillStyle = '#c0c0c0';
        ctx.beginPath();
        ctx.moveTo(x + 20, y + h / 2);
        ctx.lineTo(x + 26, y + h / 2 - 4);
        ctx.lineTo(x + 26, y + h / 2 + 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#8888aa';
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
      color: '#00979D',
      draw(ctx, comp) {
        const { x, y, w, h } = comp.bounds;
        ctx.fillStyle = comp.selected ? 'rgba(0,212,255,0.1)' : 'rgba(0,151,157,0.15)';
        ctx.strokeStyle = comp.selected ? '#00d4ff' : '#00979D';
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
        ctx.fillStyle = '#8888aa';
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
      color: '#7b2fff',
      draw(ctx, comp) {
        const { x, y, w, h } = comp.bounds;
        ctx.fillStyle = comp.selected ? 'rgba(0,212,255,0.1)' : 'rgba(123,47,255,0.1)';
        ctx.strokeStyle = comp.selected ? '#00d4ff' : '#7b2fff';
        ctx.lineWidth = comp.selected ? 2 : 1.5;
        ctx.beginPath();
        ctx.roundRect(x + 5, y + 5, w - 10, h - 10, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#7b2fff';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ESP32', x + w / 2, y + h / 2 + 4);
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.fillStyle = '#8888aa';
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
      state: { on: false, closed: false, voltage: 0, current: 0 },
      ledColor: '#00ff00',
      get bounds() {
        return { x: this.x, y: this.y, w: this.def.width, h: this.def.height };
      }
    };
  }

  /* ── Init ───────────────────────────────────────────────────── */
  function init(simCanvasEl, oscCanvasEl) {
    canvas = simCanvasEl;
    oscCanvas = oscCanvasEl;
    ctx = canvas.getContext('2d');
    if (oscCanvas) oscCtx = oscCanvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('dblclick', onDblClick);
    canvas.addEventListener('contextmenu', onContextMenu);

    // Drag from palette
    document.querySelectorAll('.palette-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('component-type', item.dataset.type);
      });
    });

    canvas.addEventListener('dragover', (e) => e.preventDefault());
    canvas.addEventListener('drop', onDrop);

    render();
  }

  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
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
      selectedComponent = hit;
      draggingComponent = hit;
      dragOffset = { x: mx - hit.x, y: my - hit.y };
    } else {
      selectedComponent = null;
    }
  }

  function onMouseMove(e) {
    const { mx, my } = getMouse(e);

    if (draggingComponent) {
      draggingComponent.x = snap(mx - dragOffset.x);
      draggingComponent.y = snap(my - dragOffset.y);
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
            color: '#00d4ff',
            animated: simRunning,
          });
          runSimulation();
        }
      }
    }

    drawingWire = false;
    wireStart = null;
    draggingComponent = null;

    // Update wire positions
    updateWirePositions();
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
        components.splice(i, 1);
        // Remove connected wires
        wires = wires.filter(w => w.from.comp !== components[i] && w.to.comp !== components[i]);
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
  function runSimulation() {
    updateWirePositions();

    // Simple voltage propagation
    // Find voltage sources
    const voltageSources = components.filter(c => c.type === 'battery');

    // Reset states
    components.forEach(c => {
      c.state.voltage = 0;
      c.state.current = 0;
      if (c.type === 'led') c.state.on = false;
    });

    // Propagate from each battery
    voltageSources.forEach(bat => {
      const posNode = getNodeWorld(bat, 0);
      const negNode = getNodeWorld(bat, 1);

      // Find components connected to positive terminal
      propagateVoltage(bat, 0, bat.value, new Set());
    });
  }

  function propagateVoltage(sourceComp, nodeIdx, voltage, visited) {
    const key = `${sourceComp.id}-${nodeIdx}`;
    if (visited.has(key)) return;
    visited.add(key);

    const nodePos = getNodeWorld(sourceComp, nodeIdx);

    // Find all wires connected to this node
    wires.forEach(wire => {
      let otherComp = null, otherNodeIdx = -1;

      if (wire.from.comp === sourceComp && wire.from.nodeIdx === nodeIdx) {
        otherComp = wire.to.comp;
        otherNodeIdx = wire.to.nodeIdx;
      } else if (wire.to.comp === sourceComp && wire.to.nodeIdx === nodeIdx) {
        otherComp = wire.from.comp;
        otherNodeIdx = wire.from.nodeIdx;
      }

      if (!otherComp) return;

      // Apply voltage to connected component
      applyVoltage(otherComp, otherNodeIdx, voltage, visited);
    });
  }

  function applyVoltage(comp, nodeIdx, voltage, visited) {
    const key = `${comp.id}-${nodeIdx}`;
    if (visited.has(key)) return;
    visited.add(key);

    comp.state.voltage = Math.max(comp.state.voltage, voltage);

    // Component-specific behavior
    switch (comp.type) {
      case 'led':
        if (voltage > comp.value) {
          comp.state.on = true;
          comp.state.current = (voltage - comp.value) / 150; // Assume 150Ω series
        }
        break;
      case 'switch':
        if (comp.state.closed) {
          // Pass voltage through
          const otherNode = nodeIdx === 0 ? 1 : 0;
          propagateVoltage(comp, otherNode, voltage, visited);
        }
        break;
      case 'resistor':
        // Voltage divider (simplified)
        const otherNode = nodeIdx === 0 ? 1 : 0;
        const dropVoltage = voltage * 0.1; // Simplified
        propagateVoltage(comp, otherNode, voltage - dropVoltage, visited);
        break;
      case 'diode':
        if (nodeIdx === 0 && voltage > comp.value) {
          propagateVoltage(comp, 1, voltage - comp.value, visited);
        }
        break;
      default:
        // Pass through for other components
        comp.def.nodes.forEach((_, i) => {
          if (i !== nodeIdx) {
            propagateVoltage(comp, i, voltage * 0.95, visited);
          }
        });
    }
  }

  /* ── Render ─────────────────────────────────────────────────── */
  let wireAnimOffset = 0;

  function render() {
    animId = requestAnimationFrame(render);
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (simRunning) {
      simTime += 0.016 * simSpeed;
      wireAnimOffset = (wireAnimOffset + 1) % 20;
    }

    // Draw wires
    drawWires();

    // Draw wire being drawn
    if (drawingWire && wireStart) {
      ctx.strokeStyle = '#00d4ff';
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
    if (oscEnabled && oscCtx) drawOscilloscope();

    // Update multimeter
    updateMultimeter();
  }

  function drawWires() {
    wires.forEach(wire => {
      const isActive = wire.from.comp.state.voltage > 0 || wire.to.comp.state.voltage > 0;

      ctx.save();
      ctx.lineWidth = 2;

      if (isActive && simRunning) {
        // Animated current flow
        ctx.strokeStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 4;
        ctx.setLineDash([8, 8]);
        ctx.lineDashOffset = -wireAnimOffset;
      } else {
        ctx.strokeStyle = wire.color || '#00d4ff';
        ctx.setLineDash([]);
      }

      // Route wire with right angles
      const dx = wire.x2 - wire.x1;
      const dy = wire.y2 - wire.y1;
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
      ctx.fillStyle = '#00d4ff';
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
      ctx.fillStyle = isHovered ? '#00d4ff' : 'rgba(0,212,255,0.5)';
      ctx.fill();

      if (isHovered) {
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Node label
        ctx.fillStyle = '#00d4ff';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, nx, ny - 8);
      }
    });
  }

  /* ── Oscilloscope ───────────────────────────────────────────── */
  let oscHistory = new Array(200).fill(0);
  let oscHistory2 = new Array(200).fill(0);

  function drawOscilloscope() {
    if (!oscCtx || !oscCanvas) return;
    const w = oscCanvas.width;
    const h = oscCanvas.height;

    oscCtx.fillStyle = '#000';
    oscCtx.fillRect(0, 0, w, h);

    // Grid
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

    // Center line
    oscCtx.strokeStyle = 'rgba(0,212,255,0.2)';
    oscCtx.lineWidth = 1;
    oscCtx.beginPath();
    oscCtx.moveTo(0, h / 2);
    oscCtx.lineTo(w, h / 2);
    oscCtx.stroke();

    // Generate signal
    const freq = sigGenEnabled ? sigGenFreq : 1000;
    const amp = sigGenEnabled ? sigGenAmp : 5;

    // Update history
    let sample = 0;
    if (simRunning) {
      switch (sigGenWave) {
        case 'sine':
          sample = amp * Math.sin(2 * Math.PI * freq * simTime / 1000);
          break;
        case 'square':
          sample = amp * Math.sign(Math.sin(2 * Math.PI * freq * simTime / 1000));
          break;
        case 'triangle':
          sample = amp * (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * freq * simTime / 1000));
          break;
        case 'sawtooth':
          sample = amp * ((simTime * freq / 500) % 2 - 1);
          break;
      }
    }

    oscHistory.push(sample);
    oscHistory.shift();

    // LED voltage channel 2
    const ledComp = components.find(c => c.type === 'led');
    const ch2 = ledComp ? (ledComp.state.on ? 3.3 : 0) : 0;
    oscHistory2.push(ch2);
    oscHistory2.shift();

    // Draw channel 1 (cyan)
    oscCtx.strokeStyle = '#00d4ff';
    oscCtx.lineWidth = 1.5;
    oscCtx.shadowColor = '#00d4ff';
    oscCtx.shadowBlur = 2;
    oscCtx.beginPath();
    oscHistory.forEach((v, i) => {
      const px = (i / oscHistory.length) * w;
      const py = h / 2 - (v / (amp * 1.2)) * (h / 2 - 4);
      i === 0 ? oscCtx.moveTo(px, py) : oscCtx.lineTo(px, py);
    });
    oscCtx.stroke();

    // Draw channel 2 (green)
    oscCtx.strokeStyle = '#00ff88';
    oscCtx.lineWidth = 1;
    oscCtx.shadowColor = '#00ff88';
    oscCtx.shadowBlur = 1;
    oscCtx.beginPath();
    oscHistory2.forEach((v, i) => {
      const px = (i / oscHistory2.length) * w;
      const py = h / 2 - (v / 10) * (h / 2 - 4);
      i === 0 ? oscCtx.moveTo(px, py) : oscCtx.lineTo(px, py);
    });
    oscCtx.stroke();
    oscCtx.shadowBlur = 0;

    // Labels
    oscCtx.font = '9px JetBrains Mono, monospace';
    oscCtx.fillStyle = '#00d4ff';
    oscCtx.textAlign = 'left';
    oscCtx.fillText('CH1: ' + sample.toFixed(2) + 'V', 4, 12);
    oscCtx.fillStyle = '#00ff88';
    oscCtx.fillText('CH2: ' + ch2.toFixed(2) + 'V', 4, 24);
    oscCtx.fillStyle = 'rgba(0,212,255,0.5)';
    oscCtx.textAlign = 'right';
    oscCtx.fillText(freq >= 1000 ? (freq/1000).toFixed(1)+'kHz' : freq+'Hz', w - 4, 12);
  }

  /* ── Multimeter ─────────────────────────────────────────────── */
  function updateMultimeter() {
    const mmEl = document.getElementById('mm-value');
    const mmUnitEl = document.getElementById('mm-unit');
    if (!mmEl) return;

    // Find highest voltage in circuit
    let maxV = 0;
    components.forEach(c => {
      if (c.state.voltage > maxV) maxV = c.state.voltage;
    });

    const mmMode = document.getElementById('mm-mode-select');
    const mode = mmMode ? mmMode.value : 'voltage';

    if (mode === 'voltage') {
      mmEl.textContent = maxV.toFixed(2);
      if (mmUnitEl) mmUnitEl.textContent = 'V';
    } else if (mode === 'current') {
      let totalCurrent = 0;
      components.forEach(c => { totalCurrent += c.state.current || 0; });
      mmEl.textContent = (totalCurrent * 1000).toFixed(1);
      if (mmUnitEl) mmUnitEl.textContent = 'mA';
    } else if (mode === 'resistance') {
      const resistors = components.filter(c => c.type === 'resistor');
      const totalR = resistors.reduce((sum, r) => sum + r.value, 0);
      mmEl.textContent = totalR >= 1000 ? (totalR/1000).toFixed(2) : totalR.toFixed(0);
      if (mmUnitEl) mmUnitEl.textContent = totalR >= 1000 ? 'kΩ' : 'Ω';
    }
  }

  /* ── Public Controls ────────────────────────────────────────── */
  function startSim() {
    simRunning = true;
    runSimulation();
    wires.forEach(w => w.animated = true);
    showToast('Simulation started', 'success');
  }

  function stopSim() {
    simRunning = false;
    wires.forEach(w => w.animated = false);
    showToast('Simulation stopped', 'info');
  }

  function resetSim() {
    components = [];
    wires = [];
    simRunning = false;
    simTime = 0;
    selectedComponent = null;
    showToast('Circuit cleared', 'info');
  }

  function addComponentToCanvas(type) {
    const w = canvas ? canvas.width : 400;
    const h = canvas ? canvas.height : 300;
    const comp = createComponent(type, w / 2 + Math.random() * 60 - 30, h / 2 + Math.random() * 60 - 30);
    if (comp) {
      components.push(comp);
      runSimulation();
    }
  }

  function setSimSpeed(speed) {
    simSpeed = parseFloat(speed);
  }

  function setSigGen(freq, amp, wave) {
    if (freq !== undefined) sigGenFreq = freq;
    if (amp !== undefined) sigGenAmp = amp;
    if (wave !== undefined) sigGenWave = wave;
  }

  function exportCircuit() {
    const data = {
      components: components.map(c => ({
        type: c.type, x: c.x, y: c.y, value: c.value
      })),
      wires: wires.map(w => ({
        from: { compId: w.from.comp.id, nodeIdx: w.from.nodeIdx },
        to: { compId: w.to.comp.id, nodeIdx: w.to.nodeIdx }
      }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'circuit.json';
    a.click();
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
    setSigGen,
    exportCircuit,
    isRunning: () => simRunning,
  };
})();
