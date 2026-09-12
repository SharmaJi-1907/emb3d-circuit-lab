// EMB3D: Central Application State, SPA Routing & UI Orchestration
import { ThreeViewer } from './three-viewer.js';
import { CircuitSimulator } from './simulator.js';

class AppState {
    constructor() {
        this.selectedComponentId = 'arduino_uno';
        this.activePanel = 'dashboard';
        this.compareList = [];
        this.aiHistory = [];
        
        this.init();
        
        window.appState = this;
    }
    
    init() {
        // Instantiate WebGL and Simulator Engines
        this.viewer = new ThreeViewer('webgl-container');
        this.simulator = new CircuitSimulator('simulator-canvas', 'scope-screen');
        
        this.setupRouting();
        this.setupUIRelations();
        this.loadComponentDatabase();
        this.setupBoardExplorer();
        this.setupAIAssistant();
        this.selectComponent(this.selectedComponentId);
    }
    
    // ==========================================================================
    // SPA Panel Router (GSAP Transitions)
    // ==========================================================================
    
    setupRouting() {
        const handleHashChange = () => {
            const hash = window.location.hash.slice(1) || 'dashboard';
            this.switchPanel(hash);
        };
        
        window.addEventListener('hashchange', handleHashChange);
        // Trigger initial routing
        if (!window.location.hash) {
            window.location.hash = '#dashboard';
        } else {
            handleHashChange();
        }
    }
    
    switchPanel(panelId) {
        const panels = document.querySelectorAll('.panel');
        const navItems = document.querySelectorAll('.nav-item');
        
        const oldPanel = document.querySelector('.panel.active');
        const newPanel = document.getElementById(`panel-${panelId}`);
        
        if (!newPanel) return;
        
        this.activePanel = panelId;
        
        // 1. Update navigation items active state
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-panel') === panelId) {
                item.classList.add('active');
            }
        });
        
        // 2. Perform smooth GSAP panel transitions
        if (oldPanel && oldPanel !== newPanel) {
            gsap.to(oldPanel, {
                opacity: 0,
                y: -10,
                duration: 0.25,
                ease: 'power2.in',
                onComplete: () => {
                    oldPanel.classList.remove('active');
                    
                    newPanel.classList.add('active');
                    gsap.fromTo(newPanel, 
                        { opacity: 0, y: 15 },
                        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
                    );
                }
            });
        } else {
            newPanel.classList.add('active');
            gsap.fromTo(newPanel, 
                { opacity: 0 },
                { opacity: 1, duration: 0.35 }
            );
        }
        
        // 3. Viewport-specific updates
        if (panelId === 'viewer' && this.viewer) {
            this.viewer.resize();
            this.viewer.loadComponent(this.selectedComponentId);
        } else if (panelId === 'simulator' && this.simulator) {
            this.simulator.resize();
        }
    }
    
    // ==========================================================================
    // Sidebar, Theme, HUD & Keyboard Bindings
    // ==========================================================================
    
    setupUIRelations() {
        // Sidebar collapse toggle
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('sidebar-toggle');
        
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            setTimeout(() => {
                if (this.viewer) this.viewer.resize();
                if (this.simulator) this.simulator.resize();
            }, 300); // sync resize after transition
        });
        
        // Notification drawer toggle
        const notifBtn = document.getElementById('notif-btn');
        const notifDrawer = document.getElementById('notif-drawer');
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDrawer.classList.toggle('hidden');
        });
        document.addEventListener('click', () => notifDrawer.classList.add('hidden'));
        notifDrawer.addEventListener('click', (e) => e.stopPropagation());
        
        document.getElementById('clear-notifs').addEventListener('click', () => {
            document.getElementById('notif-list-body').innerHTML = '<div class="placeholder-msg"><p>Logs cleared</p></div>';
            document.getElementById('notif-badge').style.display = 'none';
        });
        
        // Keyboard Shortcuts Overlay
        const shortcutBtn = document.getElementById('shortcut-btn');
        const modal = document.getElementById('shortcuts-modal');
        const closeModal = document.getElementById('close-shortcuts-btn');
        
        shortcutBtn.addEventListener('click', () => modal.classList.remove('hidden'));
        closeModal.addEventListener('click', () => modal.classList.add('hidden'));
        
        // Theme toggle button
        const themeBtn = document.getElementById('theme-btn');
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const icon = themeBtn.querySelector('i');
            if (document.body.classList.contains('light-theme')) {
                icon.className = 'fa-solid fa-sun';
            } else {
                icon.className = 'fa-solid fa-moon';
            }
        });
        
        // Simulation HUD Controllers
        const playBtn = document.getElementById('sim-play-btn');
        const stopBtn = document.getElementById('sim-stop-btn');
        const speedSel = document.getElementById('sim-speed');
        
        playBtn.addEventListener('click', () => {
            if (this.simulator) {
                const isPlaying = !this.simulator.isRunning;
                this.simulator.toggleSimulation(isPlaying);
                
                playBtn.innerHTML = isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
                playBtn.title = isPlaying ? 'Pause Simulation' : 'Start Simulation';
                stopBtn.disabled = !isPlaying;
            }
        });
        
        stopBtn.addEventListener('click', () => {
            if (this.simulator) {
                this.simulator.toggleSimulation(false);
                this.simulator.clearBreadboard();
                
                playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                playBtn.title = 'Start Simulation';
                stopBtn.disabled = true;
            }
        });
        
        speedSel.addEventListener('change', (e) => {
            if (this.simulator) {
                this.simulator.simulationSpeed = parseFloat(e.target.value);
            }
        });
        
        // 3D Viewport Controls wireframe / explode toggles
        document.getElementById('view-mode-shaded').addEventListener('click', (e) => {
            document.getElementById('view-mode-shaded').classList.add('active');
            document.getElementById('view-mode-wireframe').classList.remove('active');
            if (this.viewer) this.viewer.applyViewMode('shaded');
        });
        
        document.getElementById('view-mode-wireframe').addEventListener('click', (e) => {
            document.getElementById('view-mode-wireframe').classList.add('active');
            document.getElementById('view-mode-shaded').classList.remove('active');
            if (this.viewer) this.viewer.applyViewMode('wireframe');
        });
        
        document.getElementById('view-mode-explode').addEventListener('click', (e) => {
            document.getElementById('view-mode-explode').classList.toggle('active');
            if (this.viewer) this.viewer.toggleExplode();
        });
        
        document.getElementById('viewer-reset-cam').addEventListener('click', () => {
            if (this.viewer) this.viewer.resetCamera();
        });
        
        // Package type switcher
        const pkgBtns = document.querySelectorAll('.pkg-btn');
        pkgBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                pkgBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (this.viewer) {
                    this.viewer.activePackage = btn.dataset.pkg;
                    this.viewer.loadComponent('ne555');
                }
            });
        });
        
        // Global Keyboard Handler
        window.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            if (e.key === ' ') {
                e.preventDefault();
                playBtn.click();
            } else if (e.key.toLowerCase() === 'w') {
                const shadedActive = document.getElementById('view-mode-shaded').classList.contains('active');
                if (shadedActive) {
                    document.getElementById('view-mode-wireframe').click();
                } else {
                    document.getElementById('view-mode-shaded').click();
                }
            } else if (e.key.toLowerCase() === 'e') {
                document.getElementById('view-mode-explode').click();
            } else if (e.key.toLowerCase() === 'r') {
                document.getElementById('viewer-reset-cam').click();
            } else if (e.key === 'Escape') {
                modal.classList.add('hidden');
                document.getElementById('comparison-matrix').classList.add('hidden');
            }
        });
        
        // Global Export Handler
        document.getElementById('export-btn').addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
                activeComponent: this.selectedComponentId,
                simulationSpeed: this.simulator ? this.simulator.simulationSpeed : 1.0,
                wiresCount: this.simulator ? this.simulator.wires.length : 0
            }));
            const dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", "emb3d_project_export.json");
            dlAnchorElem.click();
            
            // Success alert in notif log
            const notifBody = document.getElementById('notif-list-body');
            const item = document.createElement('div');
            item.className = 'notif-item unread';
            item.innerHTML = `<span class="n-dot"></span><div class="n-text"><strong>Project Export Successful:</strong>JSON saved to device.<span class="n-time">Just Now</span></div>`;
            notifBody.prepend(item);
            document.getElementById('notif-badge').style.display = 'flex';
        });
    }
    
    // ==========================================================================
    // Database Catalog & Compare Matrix Layouts
    // ==========================================================================
    
    loadComponentDatabase() {
        const grid = document.getElementById('db-components-grid');
        grid.innerHTML = '';
        
        Object.keys(ComponentDatabase).forEach(key => {
            const comp = ComponentDatabase[key];
            
            const card = document.createElement('div');
            card.className = 'database-card comp-card';
            card.innerHTML = `
                <div class="comp-card-top">
                    <span class="comp-card-tag">${comp.tag}</span>
                    <h3>${comp.name}</h3>
                </div>
                <div class="comp-card-body">
                    <p class="desc">${comp.description}</p>
                    <p><strong>Package pins:</strong> ${comp.pins.length} leads</p>
                </div>
                <div class="comp-card-actions">
                    <button class="btn btn-primary btn-select" data-id="${comp.id}">
                        <i class="fa-solid fa-arrow-right"></i> Load 3D
                    </button>
                    <button class="btn btn-secondary btn-compare" data-id="${comp.id}">
                        <i class="fa-solid fa-plus"></i> Compare
                    </button>
                </div>
            `;
            
            grid.appendChild(card);
        });
        
        // Listeners for load 3D component button inside cards
        grid.querySelectorAll('.btn-select').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectComponent(btn.dataset.id);
                window.location.hash = '#viewer';
            });
        });
        
        // Compare buttons inside cards
        grid.querySelectorAll('.btn-compare').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleCompareItem(btn.dataset.id, btn);
            });
        });
        
        // Grid search filter tags
        const filterChips = document.querySelectorAll('.filter-chip');
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                filterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.filterDatabaseGrid(chip.dataset.filter);
            });
        });
        
        // Compare matrix drawer binds
        document.getElementById('compare-mode-btn').addEventListener('click', () => this.showCompareMatrix());
        document.getElementById('close-matrix-btn').addEventListener('click', () => {
            document.getElementById('comparison-matrix').classList.add('hidden');
        });
    }
    
    filterDatabaseGrid(category) {
        const cards = document.querySelectorAll('.comp-card');
        cards.forEach((card, idx) => {
            const compId = Object.keys(ComponentDatabase)[idx];
            const comp = ComponentDatabase[compId];
            
            if (category === 'all' || comp.category === category) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    toggleCompareItem(id, btn) {
        const idx = this.compareList.indexOf(id);
        if (idx > -1) {
            this.compareList.splice(idx, 1);
            btn.innerHTML = '<i class="fa-solid fa-plus"></i> Compare';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
        } else {
            if (this.compareList.length >= 2) {
                alert('Comparison limits reached. Max two elements.');
                return;
            }
            this.compareList.push(id);
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');
        }
    }
    
    showCompareMatrix() {
        if (this.compareList.length < 2) {
            alert('Please select at least 2 components to compare first!');
            return;
        }
        
        const compA = ComponentDatabase[this.compareList[0]];
        const compB = ComponentDatabase[this.compareList[1]];
        
        document.getElementById('comp-col-1').innerText = compA.name;
        document.getElementById('comp-col-2').innerText = compB.name;
        
        const tbody = document.getElementById('comparison-table-body');
        tbody.innerHTML = '';
        
        // Gather unique spec keys
        const allKeys = new Set([...Object.keys(compA.specs), ...Object.keys(compB.specs)]);
        
        allKeys.forEach(key => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${key}</td>
                <td>${compA.specs[key] || '—'}</td>
                <td>${compB.specs[key] || '—'}</td>
            `;
            tbody.appendChild(tr);
        });
        
        document.getElementById('comparison-matrix').classList.remove('hidden');
    }
    
    // ==========================================================================
    // Selection Component Logic (Syncs 3D, Specs & Datasheets)
    // ==========================================================================
    
    selectComponent(id) {
        this.selectedComponentId = id;
        const comp = ComponentDatabase[id];
        if (!comp) return;
        
        // 1. Sync Viewport title badges
        const badge = document.getElementById('viewer-comp-badge');
        if (badge) badge.innerText = comp.name;
        
        // 2. Load into ThreeJS viewer if active
        if (this.viewer && this.activePanel === 'viewer') {
            this.viewer.loadComponent(id);
        }
        
        // 3. Build specifications summary sidebar card
        const specsBox = document.getElementById('comp-specs-summary');
        if (specsBox) {
            specsBox.innerHTML = '';
            
            // Load key details
            const l1 = document.createElement('div');
            l1.className = 'spec-line';
            l1.innerHTML = `<span>Package Tag</span><span>${comp.tag}</span>`;
            specsBox.appendChild(l1);
            
            const l2 = document.createElement('div');
            l2.className = 'spec-line';
            l2.innerHTML = `<span>GPIO Pins</span><span>${comp.pins.length} Leads</span>`;
            specsBox.appendChild(l2);
            
            Object.keys(comp.specs).slice(0, 4).forEach(key => {
                const el = document.createElement('div');
                el.className = 'spec-line';
                el.innerHTML = `<span>${key}</span><span>${comp.specs[key]}</span>`;
                specsBox.appendChild(el);
            });
        }
        
        // 4. Fill procedural customization panels dynamically
        const custBox = document.getElementById('customizer-controls');
        if (custBox) {
            custBox.innerHTML = '';
            comp.customizer.forEach(cust => {
                const ctrl = document.createElement('div');
                ctrl.className = 'custom-control';
                
                if (cust.type === 'color') {
                    ctrl.innerHTML = `
                        <label>${cust.name}</label>
                        <select class="hud-select" style="width: 100%; padding: 6px;">
                            ${cust.options.map(o => `<option value="${o}" ${o===cust.default?'selected':''}>${o}</option>`).join('')}
                        </select>
                    `;
                    // Bind customizer change
                    ctrl.querySelector('select').addEventListener('change', (e) => {
                        if (this.viewer && this.viewer.modelGroup.children[0]) {
                            this.viewer.modelGroup.children[0].material.color.set(e.target.value);
                        }
                    });
                } else if (cust.type === 'select') {
                    ctrl.innerHTML = `
                        <label>${cust.name}</label>
                        <select class="hud-select" style="width: 100%; padding: 6px;">
                            ${cust.options.map(o => `<option value="${o}" ${o===cust.default?'selected':''}>${o}</option>`).join('')}
                        </select>
                    `;
                } else if (cust.type === 'range') {
                    ctrl.innerHTML = `
                        <label>${cust.name} <span>${cust.default}</span></label>
                        <input type="range" min="${cust.min}" max="${cust.max}" value="${cust.default}">
                    `;
                    const slider = ctrl.querySelector('input');
                    const spanVal = ctrl.querySelector('span');
                    slider.addEventListener('input', (e) => {
                        spanVal.innerText = e.target.value;
                    });
                }
                
                custBox.appendChild(ctrl);
            });
        }
        
        // 5. Initialize clean Pin Analyzer UI state card
        const profileBox = document.getElementById('pin-active-profile');
        if (profileBox) {
            profileBox.innerHTML = `
                <div class="placeholder-msg">
                    <i class="fa-solid fa-arrow-pointer"></i>
                    <p>Hover over component pins in the 3D viewport to inspect signals, absolute limits, and electrical descriptions.</p>
                </div>
            `;
        }
        
        // 6. Sync HTML Engineering Datasheet Viewer Layout
        this.renderDatasheetDocument(comp);
    }
    
    // Raycasting event hooks
    onPinHover(pinData) {
        const profileBox = document.getElementById('pin-active-profile');
        if (!profileBox) return;
        
        profileBox.innerHTML = `
            <div class="pin-info-detail">
                <div class="pin-info-headline">
                    <span class="pin-badge ${pinData.type}">${pinData.name}</span>
                    <strong>Pin Index: ${pinData.num}</strong>
                </div>
                <p class="pin-desc">${pinData.desc}</p>
                
                <div class="waveform-canvas-box">
                    <label>Realtime Logic Signal Trace</label>
                    <canvas id="pin-signal-flow-canvas" width="280" height="60"></canvas>
                </div>
            </div>
        `;
        
        this.startPinSignalCanvas(pinData.type);
    }
    
    onPinSelect(pinData) {
        // Clicking jumps to datasheet details section
        window.location.hash = '#datasheet';
        
        // Query the AI Co-pilot automatically about this pin!
        setTimeout(() => {
            const chatInput = document.getElementById('ai-user-query');
            if (chatInput) {
                chatInput.value = `Explain pin hookups and absolute limits for ${this.selectedComponentId.toUpperCase()} Pin ${pinData.name}.`;
                document.getElementById('ai-send-btn').click();
            }
        }, 500);
    }
    
    startPinSignalCanvas(pinType) {
        const canv = document.getElementById('pin-signal-flow-canvas');
        if (!canv) return;
        const ctx = canv.getContext('2d');
        
        let t = 0;
        const anim = () => {
            if (!document.getElementById('pin-signal-flow-canvas')) return; // exit if hovered off
            
            ctx.clearRect(0, 0, canv.width, canv.height);
            ctx.strokeStyle = '#30363d';
            ctx.lineWidth = 1;
            
            // Grid lines
            ctx.beginPath();
            ctx.moveTo(0, canv.height/2); ctx.lineTo(canv.width, canv.height/2);
            ctx.stroke();
            
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            // Wave formulation based on type
            let glowColor = '#06b6d4'; // digital
            if (pinType === 'power') glowColor = '#ef4444';
            if (pinType === 'gnd') glowColor = '#374151';
            if (pinType === 'comm') glowColor = '#a855f7';
            if (pinType === 'analog') glowColor = '#eab308';
            if (pinType === 'pwm') glowColor = '#10b981';
            
            ctx.strokeStyle = glowColor;
            
            for (let x = 0; x < canv.width; x++) {
                let y = canv.height/2;
                t += 0.0002;
                
                if (pinType === 'power') {
                    y = 15; // solid high line
                } else if (pinType === 'gnd') {
                    y = canv.height - 15; // solid low line
                } else if (pinType === 'analog') {
                    y = canv.height/2 + Math.sin(x * 0.05 + t * 40) * 18; // clean sine wave
                } else if (pinType === 'pwm') {
                    // PWM square wave representation
                    const phase = (x * 0.08 + t * 30) % (Math.PI * 2);
                    y = phase < Math.PI * 0.8 ? 15 : canv.height - 15;
                } else {
                    // digital data clock spikes
                    const phase = (x * 0.1 + t * 50) % (Math.PI * 2);
                    y = phase < Math.PI ? 15 : canv.height - 15;
                }
                
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            
            requestAnimationFrame(anim);
        };
        
        requestAnimationFrame(anim);
    }
    
    // ==========================================================================
    // Interactive Board Blueprint hotspots explorer
    // ==========================================================================
    
    setupBoardExplorer() {
        const boardViewer = document.getElementById('board-blueprint-card');
        const boardNameEl = document.getElementById('board-card-name');
        const boardBodyEl = document.getElementById('board-card-content');
        
        const loadBoardBlueprint = (boardType) => {
            boardViewer.innerHTML = '';
            
            if (boardType === 'uno') {
                boardViewer.innerHTML = `
                    <svg viewBox="0 0 600 400" style="width: 100%; height: 100%; filter: drop-shadow(0 4px 20px rgba(0,0,0,0.6));">
                        <!-- Arduino SVG PCB Substrate outline -->
                        <rect x="50" y="50" width="500" height="300" rx="16" fill="#00539C" stroke="#0080ff" stroke-width="2" />
                        <!-- Core Chip ATmega328P -->
                        <rect x="350" y="160" width="160" height="60" rx="4" fill="#151515" stroke="#333" stroke-width="1.5" />
                        <text x="390" y="195" fill="#666" font-family="Fira Code" font-size="12">ATmega328P</text>
                        <!-- USB Port -->
                        <rect x="30" y="70" width="100" height="70" rx="3" fill="#cccccc" />
                        <!-- DC Barrel Jack -->
                        <rect x="30" y="240" width="100" height="80" rx="3" fill="#111" />
                        <!-- Headers -->
                        <rect x="220" y="60" width="280" height="18" fill="#222" />
                        <rect x="220" y="322" width="220" height="18" fill="#222" />
                    </svg>
                    
                    <!-- Hotspots -->
                    <div class="hotspot-dot" style="left: 430px; top: 190px;" data-title="ATmega328P Main MCU" data-desc="The central 8-bit brain of the Arduino Uno. Incorporates 32KB flash, 2KB SRAM, and operates on an external 16MHz clock source, managing all I/O instructions."></div>
                    <div class="hotspot-dot" style="left: 80px; top: 105px;" data-title="USB Serial Interface Bridge" data-desc="Converts USB differential logic levels to standard UART TTL serial lines (RX/TX), facilitating seamless code flashing from the Arduino IDE via ATmega16U2."></div>
                    <div class="hotspot-dot" style="left: 80px; top: 280px;" data-title="Linear Power LDO Regulator" data-desc="Steps down higher external supply potentials (DC power jack 7V-12V) to a strictly regulated 5.0V output logic board standard. High thermal dissipation boundaries."></div>
                    <div class="hotspot-dot" style="left: 310px; top: 280px;" data-title="16 MHz Quartz Crystal" data-desc="Piezoelectric crystal oscillator generating precise clock cycles. Drives synchronous AVR instruction pipeline pacing with high precision stability."></div>
                `;
            } else {
                boardViewer.innerHTML = `
                    <svg viewBox="0 0 600 400" style="width: 100%; height: 100%; filter: drop-shadow(0 4px 20px rgba(0,0,0,0.6));">
                        <!-- ESP32 PCB Substrate -->
                        <rect x="100" y="80" width="400" height="240" rx="10" fill="#121212" stroke="#222" stroke-width="2" />
                        <!-- RF Metal Shield box -->
                        <rect x="180" y="140" width="140" height="120" rx="4" fill="#dddddd" />
                        <text x="210" y="205" fill="#444" font-family="Fira Code" font-size="14" font-weight="700">ESP32</text>
                        <!-- Headers -->
                        <line x1="120" y1="90" x2="480" y2="90" stroke="#333" stroke-width="12" />
                        <line x1="120" y1="310" x2="480" y2="310" stroke="#333" stroke-width="12" />
                    </svg>
                    
                    <!-- Hotspots -->
                    <div class="hotspot-dot" style="left: 250px; top: 200px;" data-title="Tensilica LX6 Dual-Core CPU" data-desc="Dual Xtensa 32-bit CPU running up to 240MHz under metal casing. Features extreme hardware speeds, integrated RF Wi-Fi and Bluetooth antennas, targeting advanced connected applications."></div>
                    <div class="hotspot-dot" style="left: 450px; top: 200px;" data-title="Silicon CP2102 Serial Bridge" data-desc="USB-to-UART bridge converter chip. Governs high-speed programmatic flashing triggers and auto-reset mechanisms from USB debug channels."></div>
                    <div class="hotspot-dot" style="left: 370px; top: 150px;" data-title="3.3V Ultra-Low Dropout LDO" data-desc="Linear buck voltage regulator stabilizing USB 5.0V source inputs down to an ultra-precise 3.3V logic standard, managing up to 600mA spikes."></div>
                `;
            }
            
            // Attach bindings on active hotspots
            boardViewer.querySelectorAll('.hotspot-dot').forEach(dot => {
                dot.addEventListener('click', () => {
                    // Smooth GSAP content card transition
                    gsap.fromTo(boardBodyEl, { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.3 });
                    boardNameEl.innerText = dot.dataset.title;
                    boardBodyEl.innerHTML = `
                        <h4>Core System Module</h4>
                        <p>${dot.dataset.desc}</p>
                    `;
                });
            });
        };
        
        // Initial load
        loadBoardBlueprint('uno');
        
        // Boards selector toggle binds
        const boardBtns = document.querySelectorAll('.board-sel-btn');
        boardBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                boardBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                loadBoardBlueprint(btn.dataset.board);
                
                boardNameEl.innerText = `${btn.dataset.board === 'uno'?'Arduino Uno':'ESP32'} Core System`;
                boardBodyEl.innerHTML = `
                    <div class="placeholder-msg">
                        <i class="fa-solid fa-circle-nodes"></i>
                        <p>Click on any pulsing blue hotspot overlay mapped across the board blueprint to inspect layout details</p>
                    </div>
                `;
            });
        });
    }
    
    // ==========================================================================
    // PDF Datasheet Layout Generator
    // ==========================================================================
    
    renderDatasheetDocument(comp) {
        const dsBox = document.getElementById('datasheet-canvas-doc');
        if (!dsBox) return;
        
        const ds = comp.datasheet;
        document.getElementById('ds-doc-title').innerText = `${comp.name.toUpperCase()}_TIMER_DATASHEET.pdf`;
        
        dsBox.innerHTML = `
            <div class="ds-sheet-page">
                <span class="ds-mfg">EMB3D Standard Silicon Catalog</span>
                <h1>${comp.name}</h1>
                <p><strong>Package Type:</strong> Axial Leaded / SMT Integrated Circuit Specifications</p>
                
                <div class="ds-highlight-box">
                    <h3>General Description Overview</h3>
                    <p>${comp.description}</p>
                </div>
                
                <h3 class="ds-section-title">1. Absolute Maximum Power Ratings</h3>
                <p>Stresses beyond those listed under "Absolute Maximum Ratings" may cause permanent destruction to the device. These represent functional limits only.</p>
                
                <table class="ds-table">
                    <thead>
                        <tr>
                            <th>Operating Limits Parameter</th>
                            <th>Min Standard Value</th>
                            <th>Typical Index</th>
                            <th>Absolute Max Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ds.electrical.map(e => `
                            <tr>
                                <td>${e.parameter}</td>
                                <td><strong>${e.min}</strong></td>
                                <td>${e.typ}</td>
                                <td><span style="color:#ef4444; font-weight:700;">${e.max}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <h3 class="ds-section-title">2. Functional Pinout Configurations</h3>
                <table class="ds-table">
                    <thead>
                        <tr>
                            <th>Terminal Index</th>
                            <th>Port Name</th>
                            <th>Bus Domain</th>
                            <th>Pin functional specification details</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${comp.pins.map(p => `
                            <tr id="ds-row-pin-${p.num}">
                                <td>Pin ${p.num}</td>
                                <td><span class="pin-badge ${p.type}">${p.name}</span></td>
                                <td>${p.type.toUpperCase()}</td>
                                <td>${p.desc}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // ==========================================================================
    // AI Co-Pilot Assistant Chat Dialog Generator
    // ==========================================================================
    
    setupAIAssistant() {
        const sendBtn = document.getElementById('ai-send-btn');
        const chatInput = document.getElementById('ai-user-query');
        const chatMessages = document.getElementById('ai-chat-messages');
        
        const triggerAIResponse = (queryText) => {
            if (!queryText.trim()) return;
            
            // 1. Render User message
            const userBubble = document.createElement('div');
            userBubble.className = 'chat-bubble user-msg';
            userBubble.innerHTML = `<p>${queryText}</p>`;
            chatMessages.appendChild(userBubble);
            
            chatInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // 2. Fetch context-aware answers mock
            const comp = ComponentDatabase[this.selectedComponentId];
            let answer = `I've analyzed your query regarding the ${comp.name}. `;
            
            if (queryText.toLowerCase().includes('reset')) {
                answer += `The RESET pin is highly critical. For the ${comp.name}, bringing this active-low terminal down to GND forces the system to trigger standard hardware boot operations, resetting all CPU indices immediately. Ensure it is pulled high through a 10k resistor to prevent float.`;
            } else if (queryText.toLowerCase().includes('timing') || queryText.toLowerCase().includes('equation')) {
                answer += `For astable operation using NE555, the charging duration is govern by t1 = 0.693 * (R1 + R2) * C, and discharge cycle by t2 = 0.693 * R2 * C. Thus the complete oscillation period is T = t1 + t2 = 0.693 * (R1 + 2*R2) * C. Frequency equates to f = 1.44 / ((R1 + 2*R2) * C).`;
            } else if (queryText.toLowerCase().includes('5v') || queryText.toLowerCase().includes('voltage')) {
                answer += `Regarding input voltage: The ESP32 is strictly a 3.3V logic chip. Its GPIO pins are NOT 5V tolerant. Feeding a 5.0V signal directly to any pin will cause irreversible dielectric breakdown to the internal ESD clamp diodes! For level transitions, always deploy bi-directional level-shifter boards or basic resistive divider networks.`;
            } else {
                answer += `To hook up the ${comp.name}, examine its ${comp.pins.length} active pin terminals. Supply clean voltage to its ${comp.pins.filter(p => p.type==='power').map(p=>p.name).join('/')} lines and bind ${comp.pins.filter(p => p.type==='gnd').map(p=>p.name).join('/')} to common ground rails. You can inspect its procedural electrical limits in the adjacent technical datasheet panel. Let me know if you require SPI/I2C hookup schematics!`;
            }
            
            // 3. Render AI Response Bubble with teletype letter-by-letter effect
            setTimeout(() => {
                const aiBubble = document.createElement('div');
                aiBubble.className = 'chat-bubble ai-msg';
                chatMessages.appendChild(aiBubble);
                
                let i = 0;
                const speed = 15; // ms per char
                const typeEffect = () => {
                    if (i < answer.length) {
                        aiBubble.innerText = answer.slice(0, i + 1);
                        i++;
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                        setTimeout(typeEffect, speed);
                    }
                };
                typeEffect();
            }, 600);
        };
        
        // Listeners
        sendBtn.addEventListener('click', () => triggerAIResponse(chatInput.value));
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') triggerAIResponse(chatInput.value);
        });
        
        // Suggested Query Tabs Binds
        const queryTabs = document.querySelectorAll('.query-tab');
        queryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                triggerAIResponse(tab.dataset.query);
            });
        });
    }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
    new AppState();
});
export { AppState };
