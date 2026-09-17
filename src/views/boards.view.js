/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Board Explorer screen (F4, D22–D25)
═══════════════════════════════════════════════════════════════════ */

import { PIN_TYPE_CONFIG } from '../app/pin-types.js';
import { navigateTo, registerScreen } from '../app/router.js';
import { state } from '../app/state.js';
import { showToast } from '../ui/toast.js';
import { roundRect } from '../utils/canvas.js';
import { cssColor } from '../utils/css.js';

let boardCanvas = null;
let boardCtx = null;
let boardW = 0; // the canvas size on screen, in CSS pixels
let boardH = 0;
let boardZoom = 1.0;
let boardOffsetX = 0;
let boardOffsetY = 0;
let isDraggingBoard = false;
let startDragX = 0;
let startDragY = 0;
let hoveredBoardPin = null;

// Board tab (data-board in index.html) → board in CircuitLabData.boards
const BOARD_MAPPING = {
  'arduino-uno': 'arduino-uno',
  'arduino-mega': 'arduino-mega',
  'esp32': 'esp32-devkit',
  'esp8266': 'esp8266-nodemcu',
  'rpi4': 'raspberry-pi-4',
  'rpi-pico': 'rpi-pico',
  'stm32': 'nucleo-f401re',
  'stm32-bluepill': 'stm32-bluepill',
};

function initBoardExplorer() {
  const panel = document.getElementById('view-boards');
  if (!panel) return;

  // Setup canvas element. Its mouse handlers are added on the first visit only (D22).
  boardCanvas = document.getElementById('board-canvas');
  if (boardCanvas && !boardCanvas._wired) {
    boardCanvas._wired = true;
    boardCtx = boardCanvas.getContext('2d');

    // Redraw at the new size whenever the board's box changes: a window
    // resize (D22), or the sidebar being hidden, which no window event
    // reports (D35). The observer runs after layout, so the size is final (D27).
    new ResizeObserver(() => {
      if (state.currentView === 'boards') sizeBoardCanvas();
    }).observe(boardCanvas);

    // Bind canvas mouse & click interactions
    boardCanvas.addEventListener('mousedown', (e) => {
      isDraggingBoard = true;
      startDragX = e.clientX - boardOffsetX;
      startDragY = e.clientY - boardOffsetY;
    });

    boardCanvas.addEventListener('mousemove', (e) => {
      const rect = boardCanvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      if (isDraggingBoard) {
        boardOffsetX = e.clientX - startDragX;
        boardOffsetY = e.clientY - startDragY;
        drawBoard();
      } else {
        checkHoverPin(clientX, clientY);
      }
    });

    boardCanvas.addEventListener('mouseup', () => {
      isDraggingBoard = false;
    });

    boardCanvas.addEventListener('mouseleave', () => {
      isDraggingBoard = false;
      hoveredBoardPin = null;
      drawBoard();
    });

    boardCanvas.addEventListener('click', () => {
      if (hoveredBoardPin) {
        selectBoardPin(hoveredBoardPin.num);
      }
    });
  }

  // Bind zoom tool buttons
  const zoomIn = document.getElementById('board-zoom-in');
  const zoomOut = document.getElementById('board-zoom-out');
  const reset = document.getElementById('board-reset');

  if (zoomIn) {
    zoomIn.onclick = () => { boardZoom *= 1.25; drawBoard(); };
  }
  if (zoomOut) {
    zoomOut.onclick = () => { boardZoom /= 1.25; drawBoard(); };
  }
  if (reset) {
    reset.onclick = () => { boardZoom = 1.0; boardOffsetX = 0; boardOffsetY = 0; drawBoard(); };
  }

  // Bind board tabs
  document.querySelectorAll('.board-tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.board-tab').forEach(b => b.classList.remove('active'));
      tab.classList.add('active');
      const dbKey = BOARD_MAPPING[tab.dataset.board] || 'arduino-uno';
      selectBoard(dbKey);
    };
  });

  // Bind pin filter buttons
  document.querySelectorAll('.pin-filter-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.pin-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.boardPinFilter = btn.dataset.filter || 'all';
      renderBoardExplorer();
    };
  });

  // Trigger initial render of current board
  selectBoard(state.selectedBoard || 'arduino-uno');
}

export function selectBoard(id) {
  if (id !== state.selectedBoard) state.selectedBoardPin = null; // a pin number means nothing on another board
  state.selectedBoard = id;
  // Mark the tab of the board on show, however it was chosen (a tab, or search)
  document.querySelectorAll('.board-tab').forEach(tab => {
    tab.classList.toggle('active', BOARD_MAPPING[tab.dataset.board] === id);
  });
  renderBoardExplorer();
}

// Open the Board Explorer on one board (a search result, D46).
export function openBoard(id) {
  if (!CircuitLabData.boards[id]) return;
  if (id !== state.selectedBoard) state.selectedBoardPin = null;
  state.selectedBoard = id;
  navigateTo('boards'); // draws the board, and marks its tab
}

function renderBoardExplorer() {
  const board = CircuitLabData.boards[state.selectedBoard];
  if (!board) return;

  // Update specs card info
  const boardNameEl = document.getElementById('board-name');
  if (boardNameEl) boardNameEl.textContent = board.name;

  const specsGrid = document.getElementById('board-specs-grid');
  if (specsGrid) {
    specsGrid.innerHTML = [
      ['MCU', board.mcu],
      ['Voltage', board.voltage],
      ['Clock', board.frequency],
      ['Flash', board.flash],
      ['RAM', board.ram],
      ['GPIO Count', board.digitalPins],
      ['Analog Input', board.analogPins],
      ['Interface', board.usbInterface],
    ].map(([k, v]) => `
      <div class="spec-entry">
        <span class="spec-key">${k}</span>
        <span class="spec-val">${v}</span>
      </div>
    `).join('');
  }

  // Re-render pin list & legends
  renderBoardPinList(board);

  sizeBoardCanvas();
}

// Size the canvas drawing to its own box on screen (F4), then draw. On a
// high-DPI screen the drawing gets that many pixels per CSS pixel, so it is
// sharp; everything is still drawn in CSS pixels (D45).
function sizeBoardCanvas() {
  if (!boardCanvas) return;
  const rect = boardCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  boardW = rect.width;
  boardH = rect.height || 480;
  // Canvas sizes are whole pixels; round so a fractional box doesn't lose one.
  boardCanvas.width = Math.round(boardW * dpr);
  boardCanvas.height = Math.round(boardH * dpr);
  boardCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawBoard();
}

function renderBoardPinList(board) {
  const list = document.getElementById('board-pin-list');
  if (!list) return;

  const filter = state.boardPinFilter || 'all';
  let filteredPins = board.pins;
  if (filter !== 'all') {
    filteredPins = board.pins.filter(p => p.type === filter);
  }

  list.innerHTML = filteredPins.map(pin => {
    const cfg = PIN_TYPE_CONFIG[pin.type] || PIN_TYPE_CONFIG.digital;
    return `
      <div class="board-pin-item ${state.selectedBoardPin === pin.num ? 'selected' : ''}" data-pin="${pin.num}"
        onclick="CircuitApp.selectBoardPin(${pin.num})">
        <span class="pin-dot" style="background:${cfg.color}"></span>
        <span class="pin-num">${pin.num}</span>
        <span class="pin-name">${pin.name}</span>
        <span class="pin-badge" style="background:${cfg.bg};color:${cfg.color}">${cfg.label}</span>
      </div>
    `;
  }).join('');
}

export function selectBoardPin(num) {
  const pin = CircuitLabData.boards[state.selectedBoard]?.pins.find(p => p.num === num);
  if (!pin) return;
  state.selectedBoardPin = num;
  const cfg = PIN_TYPE_CONFIG[pin.type] || PIN_TYPE_CONFIG.digital;

  // Highlight the pin in the list (D23)
  document.querySelectorAll('.board-pin-item').forEach(item => {
    item.classList.toggle('selected', Number(item.dataset.pin) === num);
  });

  // Dynamically show toast overlay for pin
  showToast(`Inspecting Pin ${num}: ${pin.name} (${cfg.label})`, 'info');
  drawBoard();
}

function drawBoard() {
  if (!boardCanvas || !boardCtx || !state.selectedBoard) return;
  const board = CircuitLabData.boards[state.selectedBoard];
  if (!board) return;

  // The board is drawn as a real PCB: its own colour, a black chip and gold
  // pads, in both themes. Only a selected or hovered pin uses a theme colour.
  const ctx = boardCtx;
  const cw = boardW;
  const ch = boardH;

  ctx.clearRect(0, 0, cw, ch);

  // Compute coordinate projections
  const cx = cw / 2 + boardOffsetX;
  const cy = ch / 2 + boardOffsetY;
  const bw = 460 * boardZoom;
  const bh = 280 * boardZoom;

  // 1. PCB Substrate body
  ctx.fillStyle = board.color || '#152b15';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2 * boardZoom;
  roundRect(ctx, cx - bw/2, cy - bh/2, bw, bh, 14 * boardZoom);
  ctx.fill();
  ctx.stroke();

  // 2. Copper PCB Traces procedural
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.04)';
  ctx.lineWidth = 1 * boardZoom;
  ctx.beginPath();
  for (let x = cx - bw/2 + 20*boardZoom; x < cx + bw/2; x += 30*boardZoom) {
    ctx.moveTo(x, cy - bh/2);
    ctx.lineTo(x + 10*boardZoom, cy - bh/2 + 20*boardZoom);
    ctx.lineTo(x + 10*boardZoom, cy + bh/2);
  }
  ctx.stroke();

  // 3. Central Main MCU Chip
  const chipW = 100 * boardZoom;
  const chipH = 60 * boardZoom;
  ctx.fillStyle = '#0f0f15';
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 1.5 * boardZoom;
  roundRect(ctx, cx - chipW/2, cy - chipH/2, chipW, chipH, 4 * boardZoom);
  ctx.fill();
  ctx.stroke();

  // MCU Text
  ctx.fillStyle = '#666';
  ctx.font = `600 ${10 * boardZoom}px 'JetBrains Mono', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(board.mcu || 'MCU', cx, cy);

  // 4. Connectors (USB Port / Power Jack)
  ctx.fillStyle = '#444';
  ctx.fillRect(cx - bw/2 - 5*boardZoom, cy - bh/4, 20*boardZoom, 40*boardZoom);

  // 5. Draw Dynamic Board Pins Pads
  board.pins.forEach(pin => {
    const cfg = PIN_TYPE_CONFIG[pin.type] || PIN_TYPE_CONFIG.digital;
    const px = cx - bw/2 + pin.x * bw;
    const py = cy - bh/2 + pin.y * bh;

    // Pad outline (Gold)
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(px, py, 5.5 * boardZoom, 0, Math.PI * 2);
    ctx.fill();

    // Pin core hole
    const isSelected = state.selectedBoardPin === pin.num;
    const isHovered = hoveredBoardPin && hoveredBoardPin.num === pin.num;

    const pinColour = isSelected || isHovered ? cssColor(cfg.color) : null;
    ctx.fillStyle = isSelected ? pinColour : '#0a0a0f';
    ctx.beginPath();
    ctx.arc(px, py, 2.5 * boardZoom, 0, Math.PI * 2);
    ctx.fill();

    // Halo overlay for hover or select
    if (isSelected || isHovered) {
      ctx.strokeStyle = pinColour;
      ctx.lineWidth = 1.5 * boardZoom;
      ctx.beginPath();
      const pulse = 8 + Math.sin(Date.now() / 150) * 1.5;
      ctx.arc(px, py, pulse * boardZoom, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
}

function checkHoverPin(clientX, clientY) {
  if (!boardCanvas || !state.selectedBoard) return;
  const board = CircuitLabData.boards[state.selectedBoard];
  if (!board) return;

  const cx = boardW / 2 + boardOffsetX;
  const cy = boardH / 2 + boardOffsetY;
  const bw = 460 * boardZoom;
  const bh = 280 * boardZoom;

  let found = null;
  for (const pin of board.pins) {
    const px = cx - bw/2 + pin.x * bw;
    const py = cy - bh/2 + pin.y * bh;
    const dist = Math.hypot(clientX - px, clientY - py);
    if (dist < 10 * boardZoom) {
      found = pin;
      break;
    }
  }

  if (hoveredBoardPin !== found) {
    hoveredBoardPin = found;
    boardCanvas.style.cursor = hoveredBoardPin ? 'pointer' : 'default';
    drawBoard();
  }
}

registerScreen('boards', initBoardExplorer);
