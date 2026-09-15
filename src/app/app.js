/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Main Application Controller
   State management, routing, UI rendering, all panel logic
═══════════════════════════════════════════════════════════════════ */

window.CircuitApp = (function () {
  'use strict';

  /* ── App State ──────────────────────────────────────────────── */
  const state = {
    currentView: 'viewer',
    selectedComponent: null,
    selectedBoard: 'arduino-uno',
    selectedPin: null,
    searchQuery: '',
    filterCategory: 'all',
    sortBy: 'name',
    compareList: [],
    aiMessages: [],
    datasheetSection: 'overview',
    theme: 'dark',
    sidebarCollapsed: false,
    notifications: [],
    projects: [],
    recentComponents: ['atmega328p', 'esp32-wroom', 'ne555'],
    boardPinFilter: 'all',
  };

  /* ── Pin Type Config ────────────────────────────────────────── */
  const PIN_TYPE_CONFIG = {
    power:   { color: '#ff4444', label: 'Power',   icon: '⚡', bg: 'rgba(255,68,68,0.15)' },
    ground:  { color: '#888888', label: 'Ground',  icon: '⏚', bg: 'rgba(136,136,136,0.15)' },
    digital: { color: '#00d4ff', label: 'Digital', icon: '◻', bg: 'rgba(0,212,255,0.15)' },
    analog:  { color: '#ff9500', label: 'Analog',  icon: '〜', bg: 'rgba(255,149,0,0.15)' },
    pwm:     { color: '#7b2fff', label: 'PWM',     icon: '⊓', bg: 'rgba(123,47,255,0.15)' },
    uart:    { color: '#00ff88', label: 'UART',    icon: '⇄', bg: 'rgba(0,255,136,0.15)' },
    spi:     { color: '#ffd700', label: 'SPI',     icon: '⊕', bg: 'rgba(255,215,0,0.15)' },
    i2c:     { color: '#ff2d78', label: 'I2C',     icon: '⊗', bg: 'rgba(255,45,120,0.15)' },
    can:     { color: '#ff6b2b', label: 'CAN',     icon: '⊞', bg: 'rgba(255,107,43,0.15)' },
    usb:     { color: '#4488ff', label: 'USB',     icon: '⊟', bg: 'rgba(68,136,255,0.15)' },
  };

  /* ── Board Explorer Transform State ─────────────────────────── */
  let boardCanvas = null;
  let boardCtx = null;
  let boardZoom = 1.0;
  let boardOffsetX = 0;
  let boardOffsetY = 0;
  let isDraggingBoard = false;
  let startDragX = 0;
  let startDragY = 0;
  let hoveredBoardPin = null;

  /* ── Init ───────────────────────────────────────────────────── */
  function init() {
    initBackground();
    initNavigation();
    initSearch();
    initKeyboardShortcuts();
    initNotifications();
    loadProjects();

    // Set default selected component
    if (!state.selectedComponent && window.CircuitLabData && CircuitLabData.components.length > 0) {
      state.selectedComponent = CircuitLabData.components[0];
    }

    // Load default view (the Dashboard is the home screen, ADR 0002)
    navigateTo('dashboard');

    // Init Three.js viewer after a tick
    setTimeout(() => {
      const viewerCanvas = document.getElementById('viewer-canvas');
      if (viewerCanvas && window.THREE && window.ThreeViewer) {
        ThreeViewer.init(viewerCanvas);
        viewerCanvas.addEventListener('mousemove', ThreeViewer.onMouseMove);
        viewerCanvas.addEventListener('click', ThreeViewer.onMouseClick);
        document.addEventListener('pin-hover', onPinHover);
        document.addEventListener('pin-select', onPinSelect);
        showSelectedModel(); // the Viewer was opened before the engine was ready (D15)
      }
    }, 300);

    // Welcome toast
    setTimeout(() => showToast('Welcome to CircuitLab Pro', 'info'), 800);
  }

  /* ── Background Particle System ────────────────────────────── */
  function initBackground() {
    const canvas = document.getElementById('circuit-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Nodes
    const nodes = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 1,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Traces (static circuit-like lines)
    const traces = Array.from({ length: 20 }, () => ({
      x1: Math.random() * canvas.width,
      y1: Math.random() * canvas.height,
      x2: Math.random() * canvas.width,
      y2: Math.random() * canvas.height,
      alpha: Math.random() * 0.08 + 0.02,
    }));

    let t = 0;
    function draw() {
      requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.005;

      // Draw traces
      traces.forEach(tr => {
        ctx.strokeStyle = `rgba(0,212,255,${tr.alpha})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        // Right-angle routing
        const mx = tr.x1 + (tr.x2 - tr.x1) / 2;
        ctx.moveTo(tr.x1, tr.y1);
        ctx.lineTo(mx, tr.y1);
        ctx.lineTo(mx, tr.y2);
        ctx.lineTo(tr.x2, tr.y2);
        ctx.stroke();
        // Pad dots
        ctx.fillStyle = `rgba(0,212,255,${tr.alpha * 3})`;
        ctx.beginPath();
        ctx.arc(tr.x1, tr.y1, 2, 0, Math.PI * 2);
        ctx.arc(tr.x2, tr.y2, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update & draw nodes
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.02;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

        const alpha = 0.15 + Math.sin(n.pulse) * 0.1;
        ctx.fillStyle = `rgba(0,212,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.06;
            ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
    }
    draw();
  }

  /* ── Navigation ─────────────────────────────────────────────── */
  function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const view = item.dataset.view;
        if (view) navigateTo(view);
        // After a mouse click, drop focus so Space goes to the screen's shortcut, not this button.
        // Keyboard activation (e.detail === 0) keeps focus for keyboard users.
        if (e.detail > 0) item.blur();
      });
    });

    // Sidebar toggle
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        state.sidebarCollapsed = !state.sidebarCollapsed;
        document.getElementById('sidebar')?.classList.toggle('collapsed', state.sidebarCollapsed);
        document.querySelector('.main-area')?.classList.toggle('sidebar-collapsed', state.sidebarCollapsed);
      });
    }
  }

  function navigateTo(view) {
    state.currentView = view;

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === view);
    });

    // Hide all view sections
    document.querySelectorAll('.view').forEach(p => {
      p.classList.remove('active');
      p.style.display = 'none';
    });

    // Show target view panel
    const panel = document.getElementById(`view-${view}`);
    if (panel) {
      panel.style.display = 'flex';
      requestAnimationFrame(() => panel.classList.add('active'));
    }

    // Panel-specific init
    switch (view) {
      case 'dashboard':    renderDashboard(); break;
      case 'database':     renderComponentLibrary(); break;
      case 'viewer':       initViewerPanel(); break;
      case 'simulator':    initSimulatorPanel(); break;
      case 'boards':       initBoardExplorer(); break;
      case 'datasheet':    initDatasheetViewer(); break;
      case 'ai':           initAIPanel(); break;
      case 'projects':     renderProjects(); break;
    }

    // Update breadcrumb
    const bc = document.getElementById('breadcrumb-current');
    if (bc) {
      const labels = {
        dashboard: 'Dashboard',
        viewer: '3D Viewer', simulator: 'Circuit Simulator',
        boards: 'Board Explorer', datasheet: 'Datasheet Viewer',
        ai: 'AI Assistant', projects: 'Projects',
        database: 'Component Database', settings: 'Settings'
      };
      bc.textContent = labels[view] || view;
    }
  }

  /* ── Search Modal & Global Search ────────────────────────────── */
  function initSearch() {
    const searchInput = document.getElementById('global-search');
    const backdrop = document.getElementById('search-backdrop');
    const modal = document.querySelector('.search-modal-content');
    const modalSearchInput = document.getElementById('modal-search-input');

    if (backdrop && modal) {
      // Style search backdrop dynamically
      Object.assign(backdrop.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'rgba(5, 5, 10, 0.75)',
        backdropFilter: 'blur(12px)',
        webkitBackdropFilter: 'blur(12px)',
        zIndex: '9999',
        opacity: '0',
        display: 'none',
        transition: 'opacity 0.2s ease-out'
      });

      // Style modal content dynamically
      Object.assign(modal.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -46%) scale(0.96)',
        width: '90%',
        maxWidth: '640px',
        maxHeight: '75%',
        zIndex: '10000',
        opacity: '0',
        display: 'none',
        flexDirection: 'column',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(10, 10, 18, 0.9)',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8)',
        transition: 'opacity 0.2s ease-out, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        padding: '20px',
        overflow: 'hidden'
      });

      // Show modal when global search header input is focused/clicked
      if (searchInput) {
        searchInput.addEventListener('focus', (e) => {
          e.preventDefault();
          searchInput.blur();
          showSearchModal();
        });
      }

      backdrop.addEventListener('click', hideSearchModal);
    }

    if (modalSearchInput) {
      modalSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        renderModalSearchResults(query);
      });

      modalSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          hideSearchModal();
        }
      });
    }
  }

  function showSearchModal() {
    const backdrop = document.getElementById('search-backdrop');
    const modal = document.querySelector('.search-modal-content');
    if (backdrop && modal) {
      backdrop.style.display = 'block';
      modal.style.display = 'flex';
      requestAnimationFrame(() => {
        backdrop.style.opacity = '1';
        modal.style.opacity = '1';
        modal.style.transform = 'translate(-50%, -50%) scale(1)';
      });
      const input = document.getElementById('modal-search-input');
      if (input) {
        input.value = '';
        input.focus();
      }
      renderModalSearchResults('');
    }
  }

  function hideSearchModal() {
    const backdrop = document.getElementById('search-backdrop');
    const modal = document.querySelector('.search-modal-content');
    if (backdrop && modal) {
      backdrop.style.opacity = '0';
      modal.style.opacity = '0';
      modal.style.transform = 'translate(-50%, -46%) scale(0.96)';
      setTimeout(() => {
        backdrop.style.display = 'none';
        modal.style.display = 'none';
      }, 200);
    }
  }

  function renderModalSearchResults(query) {
    const resultsContainer = document.getElementById('modal-search-results');
    if (!resultsContainer) return;

    if (!query) {
      resultsContainer.innerHTML = '<div class="search-no-results">Type to search components, boards, and datasheets...</div>';
      return;
    }

    const filtered = CircuitLabData.components.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.tags.some(t => t.includes(query)) ||
      c.manufacturer.toLowerCase().includes(query)
    ).slice(0, 6);

    if (filtered.length === 0) {
      resultsContainer.innerHTML = '<div class="search-no-results">No components match your query</div>';
    } else {
      resultsContainer.innerHTML = filtered.map(c => `
        <div class="search-result-item" onclick="CircuitApp.selectComponent('${c.id}')">
          <span class="search-result-icon">${c.icon}</span>
          <div class="search-result-info">
            <div class="search-result-name">${c.name}</div>
            <div class="search-result-meta">${c.manufacturer} · ${c.package}</div>
          </div>
          <span class="search-result-type type-${c.category}">${c.category}</span>
        </div>
      `).join('');
    }
  }

  /* ── Dashboard ──────────────────────────────────────────────── */
  function renderDashboard() {
    const panel = document.getElementById('view-dashboard');
    if (!panel) return;

    const recentComps = state.recentComponents.map(id =>
      CircuitLabData.components.find(c => c.id === id)
    ).filter(Boolean);

    panel.innerHTML = `
      <div class="dashboard-grid">

        <!-- Hero Stats -->
        <div class="dash-stats-row">
          ${[
            { label: 'Components', value: CircuitLabData.components.length, icon: '🔲', color: '#00d4ff' },
            { label: 'Dev Boards', value: Object.keys(CircuitLabData.boards).length, icon: '📟', color: '#7b2fff' },
            { label: 'Protocols', value: '12', icon: '⚡', color: '#00ff88' },
            { label: 'Projects', value: CircuitLabData.projects.length, icon: '📁', color: '#ff9500' },
          ].map(s => `
            <div class="stat-card" style="--accent:${s.color}">
              <div class="stat-icon">${s.icon}</div>
              <div class="stat-value">${s.value}</div>
              <div class="stat-label">${s.label}</div>
              <div class="stat-bar"><div class="stat-bar-fill" style="width:${Math.min(100, s.value * 8)}%;background:${s.color}"></div></div>
            </div>
          `).join('')}
        </div>

        <!-- Quick Access -->
        <div class="dash-section">
          <h3 class="dash-section-title">Quick Access</h3>
          <div class="quick-access-grid">
            ${[
              { view: 'viewer',    icon: '🔮', label: '3D Viewer',    desc: 'Explore components in 3D' },
              { view: 'simulator', icon: '⚡', label: 'Simulator',    desc: 'Build & simulate circuits' },
              { view: 'boards',    icon: '📟', label: 'Board Explorer',desc: 'Interactive pinout maps' },
              { view: 'ai',        icon: '🤖', label: 'AI Assistant', desc: 'Get electronics help' },
              { view: 'datasheet', icon: '📄', label: 'Datasheets',   desc: 'Component specifications' },
              { view: 'database',  icon: '🔲', label: 'Components',   desc: 'Browse component library' },
            ].map(q => `
              <div class="quick-card" onclick="CircuitApp.navigate('${q.view}')">
                <div class="quick-card-icon">${q.icon}</div>
                <div class="quick-card-label">${q.label}</div>
                <div class="quick-card-desc">${q.desc}</div>
                <div class="quick-card-arrow">→</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Recent Components -->
        <div class="dash-section">
          <h3 class="dash-section-title">Recently Viewed</h3>
          <div class="recent-comps-list">
            ${recentComps.map(c => `
              <div class="recent-comp-item" onclick="CircuitApp.selectComponent('${c.id}')">
                <span class="recent-comp-icon">${c.icon}</span>
                <div class="recent-comp-info">
                  <div class="recent-comp-name">${c.name}</div>
                  <div class="recent-comp-meta">${c.manufacturer} · ${c.package} · ${c.pins} pins</div>
                </div>
                <div class="recent-comp-tags">
                  ${c.protocols.slice(0, 3).map(p => `<span class="tag">${p}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Sample Projects -->
        <div class="dash-section">
          <h3 class="dash-section-title">Sample Projects</h3>
          <div class="projects-grid">
            ${CircuitLabData.projects.slice(0, 4).map(p => `
              <div class="project-card" style="--accent:${p.color}">
                <div class="project-card-icon">${p.icon}</div>
                <div class="project-card-body">
                  <div class="project-card-name">${p.name}</div>
                  <div class="project-card-desc">${p.description}</div>
                  <div class="project-card-tags">
                    ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
                  </div>
                </div>
                <div class="project-card-meta">${p.lastModified}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Protocol Reference -->
        <div class="dash-section">
          <h3 class="dash-section-title">Protocol Quick Reference</h3>
          <div class="protocol-grid">
            ${[
              { name: 'I2C',  pins: 'SDA, SCL', speed: '100k–3.4M bps', addr: '7-bit', color: '#ff2d78' },
              { name: 'SPI',  pins: 'MOSI, MISO, SCK, CS', speed: 'Up to 80 MHz', addr: 'N/A', color: '#ffd700' },
              { name: 'UART', pins: 'TX, RX', speed: '300–4M bps', addr: 'N/A', color: '#00ff88' },
              { name: 'CAN',  pins: 'CANH, CANL', speed: '1 Mbps', addr: '11/29-bit', color: '#ff6b2b' },
              { name: 'USB',  pins: 'D+, D-', speed: '1.5M–480M bps', addr: '7-bit', color: '#4488ff' },
              { name: 'PWM',  pins: 'Signal', speed: 'Freq + Duty', addr: 'N/A', color: '#7b2fff' },
            ].map(p => `
              <div class="protocol-card" style="--pc:${p.color}">
                <div class="protocol-name" style="color:${p.color}">${p.name}</div>
                <div class="protocol-detail"><span>Pins:</span> ${p.pins}</div>
                <div class="protocol-detail"><span>Speed:</span> ${p.speed}</div>
                <div class="protocol-detail"><span>Addr:</span> ${p.addr}</div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  }

  /* ── Component Library ──────────────────────────────────────── */
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

  /* ── 3D Viewer Panel ────────────────────────────────────────── */
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
  function showSelectedModel() {
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

  /* ── Simulator Panel ────────────────────────────────────────── */
  function initSimulatorPanel() {
    const panel = document.getElementById('view-simulator');
    if (!panel) return;

    // Init simulator if not already
    setTimeout(() => {
      const simCanvas = document.getElementById('sim-canvas');
      const oscCanvas = document.getElementById('osc-canvas');
      if (simCanvas && window.CircuitSimulator) {
        CircuitSimulator.init(simCanvas, oscCanvas);
      }
    }, 100);
  }

  /* ── Board Explorer View Panel ──────────────────────────────── */
  const BOARD_MAPPING = {
    'arduino-uno': 'arduino-uno',
    'arduino-mega': 'arduino-uno', // Map Mega back to Uno as fallback
    'esp32': 'esp32-devkit',
    'esp8266': 'esp32-devkit',
    'rpi4': 'raspberry-pi-4',
    'rpi-pico': 'raspberry-pi-4',
    'stm32': 'stm32-bluepill'
  };

  function initBoardExplorer() {
    const panel = document.getElementById('view-boards');
    if (!panel) return;

    // Setup canvas element
    boardCanvas = document.getElementById('board-canvas');
    if (boardCanvas) {
      boardCtx = boardCanvas.getContext('2d');

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
          selectBoardPin(hoveredBoardPin.num, hoveredBoardPin.name, hoveredBoardPin.type);
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
      tab.onclick = (e) => {
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

  function selectBoard(id) {
    state.selectedBoard = id;
    renderBoardExplorer();
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

    // Dynamic resize canvas to match actual container aspect
    if (boardCanvas) {
      const rect = boardCanvas.parentElement.getBoundingClientRect();
      boardCanvas.width = rect.width;
      boardCanvas.height = rect.height || 480;
      drawBoard();
    }
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
        <div class="board-pin-item ${state.selectedPin === pin.num ? 'selected' : ''}"
          onclick="CircuitApp.selectBoardPin(${pin.num}, '${pin.name}', '${pin.type}')">
          <span class="pin-dot" style="background:${cfg.color}"></span>
          <span class="pin-num">${pin.num}</span>
          <span class="pin-name">${pin.name}</span>
          <span class="pin-badge" style="background:${cfg.bg};color:${cfg.color}">${cfg.label}</span>
        </div>
      `;
    }).join('');
  }

  function selectBoardPin(num, name, type) {
    state.selectedPin = num;
    const cfg = PIN_TYPE_CONFIG[type] || PIN_TYPE_CONFIG.digital;

    const detail = document.getElementById('board-pin-list');
    // Highlight item in list
    document.querySelectorAll('.board-pin-item').forEach(item => item.classList.remove('selected'));
    
    // Dynamically show toast overlay for pin
    showToast(`Inspecting Pin ${num}: ${name} (${cfg.label})`, 'info');
    drawBoard();
  }

  function drawBoard() {
    if (!boardCanvas || !boardCtx || !state.selectedBoard) return;
    const board = CircuitLabData.boards[state.selectedBoard];
    if (!board) return;

    const ctx = boardCtx;
    const cw = boardCanvas.width;
    const ch = boardCanvas.height;

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
      const isSelected = state.selectedPin === pin.num;
      const isHovered = hoveredBoardPin && hoveredBoardPin.num === pin.num;

      ctx.fillStyle = isSelected ? cfg.color : '#0a0a0f';
      ctx.beginPath();
      ctx.arc(px, py, 2.5 * boardZoom, 0, Math.PI * 2);
      ctx.fill();

      // Halo overlay for hover or select
      if (isSelected || isHovered) {
        ctx.strokeStyle = cfg.color;
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

    const cx = boardCanvas.width / 2 + boardOffsetX;
    const cy = boardCanvas.height / 2 + boardOffsetY;
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

  function roundRect(ctx, x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  /* ── Datasheet Viewer Panel ─────────────────────────────────── */
  function initDatasheetViewer() {
    const panel = document.getElementById('view-datasheet');
    if (!panel) return;

    // Load available datasheets to sidebar list
    const dsList = document.getElementById('ds-list');
    if (dsList && window.CircuitLabData) {
      dsList.innerHTML = CircuitLabData.datasheets.map(ds => `
        <div class="ds-item ${state.selectedComponent?.id === ds.componentId ? 'active' : ''}"
          onclick="CircuitApp.selectDatasheetByComponent('${ds.componentId}')">
          <div class="ds-item-name">${ds.name}</div>
          <div class="ds-item-mfr">${ds.manufacturer}</div>
        </div>
      `).join('');
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

    // Bind download actions & AI explains
    const downloadBtn = document.getElementById('ds-download');
    if (downloadBtn) {
      downloadBtn.onclick = () => {
        showToast('Initiating secure technical PDF assembly boundary...', 'success');
      };
    }

    const explainBtn = document.getElementById('ds-ai-explain');
    if (explainBtn) {
      explainBtn.onclick = () => {
        navigateTo('ai');
        sendAIMessage(`Explain datasheet specifications and alt functions for ${state.selectedComponent?.name || 'ATmega328P'} microcontroller.`);
      };
    }

    renderDatasheetContent();
  }

  function selectDatasheetByComponent(id) {
    const comp = CircuitLabData.components.find(c => c.id === id);
    if (comp) {
      state.selectedComponent = comp;
      // Re-trigger active sidebar highlights
      document.querySelectorAll('.ds-item').forEach(item => item.classList.remove('active'));
      initDatasheetViewer();
    }
  }

  function renderDatasheetContent() {
    const compNameEl = document.getElementById('ds-component-name');
    const mfrEl = document.getElementById('ds-mfr');
    const contentBox = document.getElementById('ds-content');

    if (!contentBox) return;

    const ds = CircuitLabData.datasheets.find(d =>
      d.componentId === (state.selectedComponent?.id || 'atmega328p')
    ) || CircuitLabData.datasheets[0];

    if (!ds) return;

    if (compNameEl) compNameEl.textContent = ds.name;
    if (mfrEl) mfrEl.textContent = ds.manufacturer;

    const sectionKey = state.datasheetSection || 'overview';
    const sec = ds.sections[sectionKey];

    if (!sec) {
      contentBox.innerHTML = `<div class="placeholder-msg">Section content under catalog index division.</div>`;
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
              <table class="ds-table" style="width:100%; border-collapse:collapse; margin-top:15px;">
                <thead>
                  <tr style="border-bottom:1px solid #333; text-align:left;">
                    <th style="padding:10px;">Parameter</th>
                    <th style="padding:10px;">Min</th>
                    <th style="padding:10px;">Typ</th>
                    <th style="padding:10px;">Max</th>
                    <th style="padding:10px;">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  ${sec.specs.map(s => `
                    <tr style="border-bottom:1px solid #222;">
                      <td style="padding:10px; color:var(--text-bright);">${s.param}</td>
                      <td style="padding:10px; font-family:var(--font-mono);">${s.min}</td>
                      <td style="padding:10px; font-family:var(--font-mono); color:var(--cyan);">${s.typ}</td>
                      <td style="padding:10px; font-family:var(--font-mono);">${s.max}</td>
                      <td style="padding:10px; color:var(--text-muted);">${s.unit}</td>
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
              <div class="ds-example" style="margin-top:20px;">
                <h4 style="color:var(--purple); margin-bottom:8px;">${ex.title}</h4>
                <pre class="ds-code" style="background:#07070a; border:1px solid #222; padding:15px; border-radius:6px; overflow-x:auto;"><code style="font-family:var(--font-mono); font-size:13px; color:var(--cyan);">${escapeHtml(ex.code)}</code></pre>
              </div>
            `).join('')}
          </div>
        `;
        break;

      default:
        contentBox.innerHTML = `
          <div class="ds-section">
            <h3 class="ds-section-title">${sec.title || sectionKey}</h3>
            <p class="ds-body-text">${sec.description || 'Full technical boundaries described inside catalog indexes. Direct datasheet files mapping.'}</p>
          </div>
        `;
    }
  }

  /* ── AI Assistant Panel ─────────────────────────────────────── */
  function initAIPanel() {
    const panel = document.getElementById('view-ai');
    if (!panel) return;

    // Wire up send button (only once)
    const sendBtn = document.getElementById('ai-send-btn');
    const input = document.getElementById('ai-user-query');
    if (sendBtn && !sendBtn._wired) {
      sendBtn._wired = true;
      sendBtn.addEventListener('click', () => sendAIMessage(input?.value || ''));
    }

    if (input && !input._wired) {
      input._wired = true;
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendAIMessage(input.value);
        }
      });
    }

    // Wire up suggestion chips (only once)
    panel.querySelectorAll('.ai-suggestion-chip').forEach(chip => {
      if (!chip._wired) {
        chip._wired = true;
        chip.addEventListener('click', () => sendAIMessage(chip.dataset.query || chip.textContent));
      }
    });

    renderAIMessages();
  }

  function renderAIMessages() {
    const chatArea = document.getElementById('ai-chat-messages');
    if (!chatArea) return;

    // Redraw the messages below the page's static welcome bubble
    chatArea.querySelectorAll('.ai-message').forEach(el => el.remove());
    chatArea.insertAdjacentHTML('beforeend', state.aiMessages.map(msg => `
      <div class="ai-message ${msg.role}">
        <div class="ai-message-avatar">${msg.role === 'assistant' ? 'AI' : 'You'}</div>
        <div class="ai-message-body">
          <div class="ai-message-content">${formatMarkdown(msg.content)}</div>
          <div class="ai-message-time">${msg.time}</div>
        </div>
      </div>
    `).join(''));

    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function sendAIMessage(text) {
    if (!text.trim()) return;

    state.aiMessages.push({
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString()
    });

    // Clear input
    const input = document.getElementById('ai-user-query');
    if (input) input.value = '';

    renderAIMessages();

    // Simulate AI response
    setTimeout(() => {
      const response = getAIResponse(text);
      state.aiMessages.push({
        role: 'assistant',
        content: response,
        time: new Date().toLocaleTimeString()
      });
      renderAIMessages();
    }, 600 + Math.random() * 400);
  }

  function getAIResponse(query) {
    const q = query.toLowerCase();

    // Check predefined responses
    for (const [key, response] of Object.entries(CircuitLabData.aiResponses)) {
      if (q.includes(key.toLowerCase().split(' ')[0]) ||
          q.includes(key.toLowerCase().split(' ')[1] || '')) {
        return response;
      }
    }

    // Component-specific responses
    const comp = CircuitLabData.components.find(c =>
      q.includes(c.name.toLowerCase()) || q.includes(c.id)
    );
    if (comp) {
      return `**${comp.name}** by ${comp.manufacturer}

**Key Specs:**
- Package: ${comp.package}
- Voltage: ${comp.voltage}
- Pins: ${comp.pins}
${comp.frequency ? `- Clock: ${comp.frequency}` : ''}
${comp.flash ? `- Flash: ${comp.flash}` : ''}

**Supported Protocols:** ${comp.protocols.join(', ')}

**Description:** ${comp.description}

Would you like to see the pinout, datasheet, or a wiring example?`;
    }

    // Generic responses
    if (q.includes('resistor') || q.includes('ohm')) {
      return CircuitLabData.aiResponses['What resistor do I need for an LED at 5V?'];
    }
    if (q.includes('i2c') || q.includes('wire')) {
      return CircuitLabData.aiResponses['How do I wire an I2C sensor to Arduino?'];
    }
    if (q.includes('blink') || q.includes('led') || q.includes('arduino')) {
      return CircuitLabData.aiResponses['Generate Arduino blink code'];
    }
    if (q.includes('esp32') || q.includes('wifi')) {
      return CircuitLabData.aiResponses['Explain how an ESP32 works'];
    }

    return `I can help with that! Here are some related topics:

- **Component selection** for your use case
- **Wiring diagrams** and connection guides
- **Code examples** for popular microcontrollers
- **Troubleshooting** common issues

Could you be more specific about what you're trying to build? For example:
- What microcontroller are you using?
- What sensors or modules are involved?
- What's the expected behavior?`;
  }

  /* ── Projects Panel ─────────────────────────────────────────── */
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

    grid.innerHTML = CircuitLabData.projects.map(p => `
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
  }

  /* ── Keyboard Shortcuts ─────────────────────────────────────── */
  function initKeyboardShortcuts() {
    const shortcutsModal = document.getElementById('shortcuts-modal');
    const closeShortcutsBtn = document.getElementById('close-shortcuts-btn');
    if (closeShortcutsBtn && shortcutsModal) {
      closeShortcutsBtn.addEventListener('click', () => {
        shortcutsModal.classList.add('hidden');
      });
    }

    document.addEventListener('keydown', (e) => {
      if (isTextField(e.target)) return;
      const key = e.key.toLowerCase();

      if ((e.ctrlKey || e.metaKey) && !e.altKey && key === 'k') {
        e.preventDefault();
        showSearchModal();
        return;
      }

      if (e.key === 'Escape') {
        hideSearchModal();
        if (shortcutsModal) {
          shortcutsModal.classList.add('hidden');
        }
        return;
      }

      // Leave browser shortcuts (Ctrl+3, Alt+←, …) alone, and ignore auto-repeat from a held key.
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;

      // 1–8: screens in sidebar order
      const views = [...document.querySelectorAll('.nav-item')].map(item => item.dataset.view);
      if (/^[1-9]$/.test(e.key) && views[Number(e.key) - 1]) {
        navigateTo(views[Number(e.key) - 1]);
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        showSearchModal();
        return;
      }

      if (e.key === '?') {
        if (shortcutsModal) shortcutsModal.classList.remove('hidden');
        return;
      }

      if (state.currentView === 'viewer' && window.ThreeViewer && ThreeViewer.isReady()) {
        if (key === 'w') ThreeViewer.setWireframe(!ThreeViewer.isWireframe());
        if (key === 'e') ThreeViewer.setExplode(!ThreeViewer.isExploded());
        if (key === 'r') ThreeViewer.resetView();
        return;
      }

      // Space on a focused button or link must still press it.
      if (state.currentView === 'simulator' && e.key === ' ' && !e.target.closest('button, a, [role="button"]')) {
        e.preventDefault();
        if (CircuitSimulator.isRunning()) CircuitSimulator.stopSim();
        else CircuitSimulator.startSim();
      }
    });
  }

  function isTextField(el) {
    return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
  }

  /* ── Notifications ──────────────────────────────────────────── */
  function initNotifications() {
    const btn = document.getElementById('notif-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        showToast('No new notifications', 'info');
      });
    }
  }

  /* ── Toast System ───────────────────────────────────────────── */
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { info: 'ℹ', success: '✓', warning: '⚠', error: '✕' };
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ'}</span>
      <span class="toast-msg">${message}</span>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /* ── Pin Events ─────────────────────────────────────────────── */
  function onPinHover(e) {
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

  /* ── Pin Select ─────────────────────────────────────────────── */
  function onPinSelect(e) {
    if (!e.detail) return;
    selectPin(e.detail.pinNum);
  }

  /* ── Utility ────────────────────────────────────────────────── */
  function formatMarkdown(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre class="ai-code"><code>$2</code></pre>')
      .replace(/^• (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, (m) => m.startsWith('<') ? m : m)
      .replace(/\n/g, '<br>');
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function loadProjects() {
    try {
      const saved = localStorage.getItem('circuitlab-projects');
      if (saved) state.projects = JSON.parse(saved);
    } catch (e) {}
  }

  /* ── Public API ─────────────────────────────────────────────── */
  function selectComponent(id) {
    const comp = CircuitLabData.components.find(c => c.id === id);
    if (!comp) return;

    state.selectedComponent = comp;

    // Add to recent
    state.recentComponents = [id, ...state.recentComponents.filter(r => r !== id)].slice(0, 5);

    hideSearchModal();
    navigateTo('viewer');
    showToast(`Loaded ${comp.name}`, 'success');
  }

  function openIn3D(id) {
    selectComponent(id);
  }

  function selectPin(pinNum) {
    state.selectedPin = pinNum;
    renderPinTable();
    renderPinDetail(pinNum);
    if (window.ThreeViewer) ThreeViewer.highlightPinByNumber(pinNum);
  }

  function setFilter(cat) {
    state.filterCategory = cat;
    renderComponentLibrary();
  }

  function sortComponents(by) {
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

  function toggleCompare(id) {
    if (state.compareList.includes(id)) {
      state.compareList = state.compareList.filter(c => c !== id);
    } else if (state.compareList.length < 4) {
      state.compareList.push(id);
    } else {
      showToast('Max 4 components in compare', 'warning');
    }
    renderComponentLibrary();
  }

  function clearCompare() {
    state.compareList = [];
    renderComponentLibrary();
  }

  function setViewMode(mode) {
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

  function newProject() {
    showToast('Project creation coming soon!', 'info');
  }

  function openProject(id) {
    const proj = CircuitLabData.projects.find(p => p.id === id);
    if (proj) {
      showToast(`Opening ${proj.name}...`, 'info');
      navigateTo('simulator');
    }
  }

  function navigate(view) {
    navigateTo(view);
  }

  return {
    init,
    navigate,
    navigateTo,
    selectComponent,
    openIn3D,
    selectPin,
    selectBoard,
    selectBoardPin,
    setFilter,
    sortComponents,
    toggleCompare,
    clearCompare,
    setViewMode,
    selectDatasheetByComponent,
    sendAIMessage,
    newProject,
    openProject,
    showToast,
    getState: () => state,
  };
})();

/* ── Boot ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  CircuitApp.init();
});
