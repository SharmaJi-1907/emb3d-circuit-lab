/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Dashboard screen (home, ADR 0002)
   Split out of app/app.js (#27c)
═══════════════════════════════════════════════════════════════════ */

import { registerScreen } from '../app/router.js';
import { state } from '../app/state.js';

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

registerScreen('dashboard', renderDashboard);
