/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Three.js 3D Component Viewer
   Procedural component models, orbit controls, pin highlighting
═══════════════════════════════════════════════════════════════════ */

window.ThreeViewer = (function () {
  'use strict';

  let scene, camera, renderer, controls;
  let currentModel = null;
  let pinMeshes = [];
  let animationId = null;
  let isInitialized = false;
  let explodeMode = false;
  let wireframeMode = false;
  let rotateMode = true;
  let highlightedPin = null;
  let canvas = null;

  // Materials
  const MAT = {};

  // Pin color map
  const PIN_COLORS = {
    power:   0xff4444,
    ground:  0x888888,
    digital: 0x00d4ff,
    analog:  0xff9500,
    pwm:     0x7b2fff,
    uart:    0x00ff88,
    spi:     0xffd700,
    i2c:     0xff2d78,
    can:     0xff6b2b,
    usb:     0x4488ff,
  };

  /* ── Init ─────────────────────────────────────────────────── */
  function init(canvasEl) {
    if (isInitialized) return;
    canvas = canvasEl;

    // Scene
    scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x05050a, 0.08);

    // Camera
    const w = canvas.clientWidth || 600;
    const h = canvas.clientHeight || 400;
    camera = new THREE.PerspectiveCamera(45, w / h, 0.01, 100);
    camera.position.set(0, 3, 6);

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Lights
    setupLights();

    // Materials
    setupMaterials();

    // Orbit Controls (manual implementation)
    setupOrbitControls();

    // Grid
    addGrid();

    // Resize handler
    window.addEventListener('resize', onResize);

    isInitialized = true;
    animate();
  }

  function setupLights() {
    // Ambient
    const ambient = new THREE.AmbientLight(0x1a1a2e, 2);
    scene.add(ambient);

    // Key light (cyan tint)
    const keyLight = new THREE.DirectionalLight(0x00d4ff, 1.5);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    scene.add(keyLight);

    // Fill light (purple tint)
    const fillLight = new THREE.DirectionalLight(0x7b2fff, 0.8);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0x00ff88, 0.4);
    rimLight.position.set(0, -5, 5);
    scene.add(rimLight);

    // Point lights for glow effect
    const glow1 = new THREE.PointLight(0x00d4ff, 0.5, 8);
    glow1.position.set(3, 2, 3);
    scene.add(glow1);

    const glow2 = new THREE.PointLight(0x7b2fff, 0.3, 8);
    glow2.position.set(-3, 2, -3);
    scene.add(glow2);
  }

  function setupMaterials() {
    // PCB green
    MAT.pcb = new THREE.MeshStandardMaterial({
      color: 0x1a4a1a,
      roughness: 0.3,
      metalness: 0.1,
      envMapIntensity: 0.5,
    });

    // PCB dark
    MAT.pcbDark = new THREE.MeshStandardMaterial({
      color: 0x0d2a0d,
      roughness: 0.4,
      metalness: 0.05,
    });

    // Chip black
    MAT.chip = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.2,
      metalness: 0.3,
    });

    // Metal (pins/leads)
    MAT.metal = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      roughness: 0.1,
      metalness: 0.9,
    });

    // Gold (pads)
    MAT.gold = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.1,
      metalness: 0.95,
    });

    // Ceramic (capacitor)
    MAT.ceramic = new THREE.MeshStandardMaterial({
      color: 0xd4a843,
      roughness: 0.6,
      metalness: 0.0,
    });

    // Epoxy (resistor body)
    MAT.epoxy = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.7,
      metalness: 0.0,
    });

    // Silkscreen white
    MAT.silk = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8,
      metalness: 0.0,
    });

    // Highlight
    MAT.highlight = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      roughness: 0.1,
      metalness: 0.5,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.5,
    });

    // Wireframe
    MAT.wireframe = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      wireframe: true,
    });
  }

  function addGrid() {
    const gridHelper = new THREE.GridHelper(20, 40, 0x1a1a2e, 0x0f0f1a);
    gridHelper.position.y = -1.5;
    scene.add(gridHelper);

    // Reflection plane
    const planeGeo = new THREE.PlaneGeometry(20, 20);
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0x05050a,
      roughness: 0.8,
      metalness: 0.2,
      transparent: true,
      opacity: 0.5,
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1.5;
    plane.receiveShadow = true;
    scene.add(plane);
  }

  /* ── Orbit Controls (manual) ──────────────────────────────── */
  let isDragging = false;
  let prevMouse = { x: 0, y: 0 };
  let spherical = { theta: 0.5, phi: 1.0, radius: 6 };
  let targetSpherical = { theta: 0.5, phi: 1.0, radius: 6 };

  function setupOrbitControls() {
    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      targetSpherical.theta -= dx * 0.01;
      targetSpherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, targetSpherical.phi + dy * 0.01));
      prevMouse = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mouseup', () => { isDragging = false; });
    canvas.addEventListener('mouseleave', () => { isDragging = false; });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      targetSpherical.radius = Math.max(2, Math.min(15, targetSpherical.radius + e.deltaY * 0.01));
    }, { passive: false });

    // Touch support
    let lastTouchDist = 0;
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        lastTouchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length === 1 && isDragging) {
        const dx = e.touches[0].clientX - prevMouse.x;
        const dy = e.touches[0].clientY - prevMouse.y;
        targetSpherical.theta -= dx * 0.01;
        targetSpherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, targetSpherical.phi + dy * 0.01));
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        targetSpherical.radius = Math.max(2, Math.min(15, targetSpherical.radius - (dist - lastTouchDist) * 0.02));
        lastTouchDist = dist;
      }
    }, { passive: false });

    canvas.addEventListener('touchend', () => { isDragging = false; });
  }

  function updateCamera() {
    spherical.theta += (targetSpherical.theta - spherical.theta) * 0.08;
    spherical.phi += (targetSpherical.phi - spherical.phi) * 0.08;
    spherical.radius += (targetSpherical.radius - spherical.radius) * 0.08;

    camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
    camera.position.y = spherical.radius * Math.cos(spherical.phi);
    camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
    camera.lookAt(0, 0, 0);
  }

  /* ── Component Model Builders ─────────────────────────────── */
  function buildDIP(pinCount, label) {
    const group = new THREE.Group();
    const cols = 2;
    const rows = pinCount / 2;
    const pitch = 0.3;
    const bodyW = 0.8;
    const bodyH = 0.2;
    const bodyL = (rows - 1) * pitch + 0.4;

    // Body
    const bodyGeo = new THREE.BoxGeometry(bodyW, bodyH, bodyL);
    const body = new THREE.Mesh(bodyGeo, MAT.chip.clone());
    body.castShadow = true;
    group.add(body);

    // Notch
    const notchGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.01, 16);
    const notch = new THREE.Mesh(notchGeo, new THREE.MeshStandardMaterial({ color: 0x333333 }));
    notch.rotation.x = Math.PI / 2;
    notch.position.set(0, bodyH / 2 + 0.005, -bodyL / 2 + 0.15);
    group.add(notch);

    // Label text plane
    const labelGeo = new THREE.PlaneGeometry(0.6, 0.12);
    const labelMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.y = bodyH / 2 + 0.001;
    labelMesh.rotation.x = -Math.PI / 2;
    group.add(labelMesh);

    // Pins
    pinMeshes = [];
    for (let i = 0; i < pinCount; i++) {
      const side = i < rows ? -1 : 1;
      const row = i < rows ? i : (pinCount - 1 - i);
      const pinNum = i + 1;

      const pinGeo = new THREE.BoxGeometry(0.04, 0.15, 0.04);
      const pinData = getPinData(pinNum);
      const pinColor = pinData ? PIN_COLORS[pinData.type] || 0xc0c0c0 : 0xc0c0c0;
      const pinMat = new THREE.MeshStandardMaterial({
        color: pinColor,
        roughness: 0.1,
        metalness: 0.9,
        emissive: pinColor,
        emissiveIntensity: 0.1,
      });

      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(
        side * (bodyW / 2 + 0.08),
        -bodyH / 2 - 0.075,
        -bodyL / 2 + 0.2 + row * pitch
      );
      pin.castShadow = true;
      pin.userData = { pinNum, type: pinData ? pinData.type : 'digital' };
      group.add(pin);
      pinMeshes.push(pin);

      // Lead (horizontal part)
      const leadGeo = new THREE.BoxGeometry(0.12, 0.03, 0.03);
      const lead = new THREE.Mesh(leadGeo, MAT.metal.clone());
      lead.position.set(
        side * (bodyW / 2 + 0.02),
        -bodyH / 2 - 0.01,
        -bodyL / 2 + 0.2 + row * pitch
      );
      group.add(lead);
    }

    return group;
  }

  function buildQFP(pinCount, label) {
    const group = new THREE.Group();
    const pinsPerSide = pinCount / 4;
    const pitch = 0.25;
    const bodySize = pinsPerSide * pitch * 0.7;
    const bodyH = 0.15;

    // Body
    const bodyGeo = new THREE.BoxGeometry(bodySize, bodyH, bodySize);
    const body = new THREE.Mesh(bodyGeo, MAT.chip.clone());
    body.castShadow = true;
    group.add(body);

    // Corner marks
    const markGeo = new THREE.BoxGeometry(0.08, 0.01, 0.08);
    const markMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const mark = new THREE.Mesh(markGeo, markMat);
    mark.position.set(-bodySize / 2 + 0.06, bodyH / 2 + 0.001, -bodySize / 2 + 0.06);
    group.add(mark);

    // Pins on all 4 sides
    pinMeshes = [];
    for (let side = 0; side < 4; side++) {
      for (let i = 0; i < pinsPerSide; i++) {
        const pinNum = side * pinsPerSide + i + 1;
        const offset = (i - (pinsPerSide - 1) / 2) * pitch;
        const pinData = getPinData(pinNum);
        const pinColor = pinData ? PIN_COLORS[pinData.type] || 0xc0c0c0 : 0xc0c0c0;

        const pinGeo = new THREE.BoxGeometry(0.04, 0.03, 0.15);
        const pinMat = new THREE.MeshStandardMaterial({
          color: pinColor,
          roughness: 0.1,
          metalness: 0.9,
          emissive: pinColor,
          emissiveIntensity: 0.15,
        });

        const pin = new THREE.Mesh(pinGeo, pinMat);
        const dist = bodySize / 2 + 0.1;

        if (side === 0) pin.position.set(offset, -bodyH / 2, -dist);
        else if (side === 1) { pin.position.set(dist, -bodyH / 2, offset); pin.rotation.y = Math.PI / 2; }
        else if (side === 2) pin.position.set(-offset, -bodyH / 2, dist);
        else { pin.position.set(-dist, -bodyH / 2, -offset); pin.rotation.y = Math.PI / 2; }

        pin.userData = { pinNum, type: pinData ? pinData.type : 'digital' };
        group.add(pin);
        pinMeshes.push(pin);
      }
    }

    return group;
  }

  function buildArduinoUno() {
    const group = new THREE.Group();

    // PCB
    const pcbGeo = new THREE.BoxGeometry(2.7, 0.08, 2.1);
    const pcb = new THREE.Mesh(pcbGeo, MAT.pcb.clone());
    pcb.castShadow = true;
    pcb.receiveShadow = true;
    group.add(pcb);

    // USB connector
    const usbGeo = new THREE.BoxGeometry(0.5, 0.2, 0.35);
    const usbMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.2, metalness: 0.8 });
    const usb = new THREE.Mesh(usbGeo, usbMat);
    usb.position.set(-1.35, 0.14, -0.5);
    group.add(usb);

    // Power jack
    const jackGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.35, 16);
    const jackMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3, metalness: 0.5 });
    const jack = new THREE.Mesh(jackGeo, jackMat);
    jack.rotation.z = Math.PI / 2;
    jack.position.set(-1.35, 0.1, 0.5);
    group.add(jack);

    // ATmega chip
    const chipGeo = new THREE.BoxGeometry(0.5, 0.12, 0.7);
    const chip = new THREE.Mesh(chipGeo, MAT.chip.clone());
    chip.position.set(0.2, 0.1, 0.1);
    group.add(chip);

    // Crystal
    const xtalGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8);
    const xtalMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.1, metalness: 0.9 });
    const xtal = new THREE.Mesh(xtalGeo, xtalMat);
    xtal.rotation.z = Math.PI / 2;
    xtal.position.set(0.6, 0.1, 0.1);
    group.add(xtal);

    // Voltage regulator
    const regGeo = new THREE.BoxGeometry(0.15, 0.2, 0.25);
    const regMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3, metalness: 0.4 });
    const reg = new THREE.Mesh(regGeo, regMat);
    reg.position.set(-0.8, 0.14, 0.7);
    group.add(reg);

    // LED (power)
    const ledGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8);
    const ledMat = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 1.0 });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(-0.5, 0.1, 0.7);
    group.add(led);

    // LED glow
    const ledLight = new THREE.PointLight(0x00ff00, 0.3, 0.5);
    ledLight.position.copy(led.position);
    group.add(ledLight);

    // Pin headers (digital)
    addPinHeader(group, 14, 0.1, 0.12, 0.9, 'vertical');
    // Pin headers (analog)
    addPinHeader(group, 6, 0.1, 0.12, -0.7, 'vertical');
    // Power header
    addPinHeader(group, 6, 0.1, 0.12, -0.3, 'vertical');

    // Silkscreen traces (decorative lines)
    addTraces(group);

    pinMeshes = [];
    return group;
  }

  function buildESP32() {
    const group = new THREE.Group();

    // PCB
    const pcbGeo = new THREE.BoxGeometry(2.2, 0.08, 1.1);
    const pcb = new THREE.Mesh(pcbGeo, new THREE.MeshStandardMaterial({
      color: 0x1a1a2e, roughness: 0.3, metalness: 0.1
    }));
    pcb.castShadow = true;
    pcb.receiveShadow = true;
    group.add(pcb);

    // Module (ESP32-WROOM)
    const moduleGeo = new THREE.BoxGeometry(1.2, 0.15, 0.8);
    const moduleMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.3 });
    const module = new THREE.Mesh(moduleGeo, moduleMat);
    module.position.set(0, 0.115, 0);
    group.add(module);

    // Antenna
    const antGeo = new THREE.BoxGeometry(0.08, 0.12, 0.25);
    const antMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.1, metalness: 0.9 });
    const ant = new THREE.Mesh(antGeo, antMat);
    ant.position.set(0.66, 0.115, 0);
    group.add(ant);

    // USB
    const usbGeo = new THREE.BoxGeometry(0.3, 0.15, 0.2);
    const usbMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.2, metalness: 0.8 });
    const usb = new THREE.Mesh(usbGeo, usbMat);
    usb.position.set(-1.1, 0.1, 0);
    group.add(usb);

    // Boot/Reset buttons
    const btnGeo = new THREE.BoxGeometry(0.12, 0.08, 0.12);
    const btnMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.5 });
    const btn1 = new THREE.Mesh(btnGeo, btnMat);
    btn1.position.set(-0.7, 0.08, 0.4);
    group.add(btn1);
    const btn2 = new THREE.Mesh(btnGeo, btnMat);
    btn2.position.set(-0.5, 0.08, 0.4);
    group.add(btn2);

    // LED
    const ledGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.04, 8);
    const ledMat = new THREE.MeshStandardMaterial({ color: 0x0000ff, emissive: 0x0000ff, emissiveIntensity: 0.8 });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(-0.3, 0.08, 0.4);
    group.add(led);

    // Pin headers
    addPinHeader(group, 19, 0.1, 0.08, 0.45, 'horizontal-left');
    addPinHeader(group, 19, 0.1, 0.08, -0.45, 'horizontal-right');

    pinMeshes = [];
    return group;
  }

  function buildResistor() {
    const group = new THREE.Group();

    // Body
    const bodyGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 16);
    const body = new THREE.Mesh(bodyGeo, MAT.epoxy.clone());
    body.rotation.z = Math.PI / 2;
    body.castShadow = true;
    group.add(body);

    // Color bands
    const bandColors = [0xff0000, 0x000000, 0xff8800, 0xffd700];
    bandColors.forEach((color, i) => {
      const bandGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.04, 16);
      const bandMat = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.rotation.z = Math.PI / 2;
      band.position.x = -0.15 + i * 0.1;
      group.add(band);
    });

    // Leads
    const leadGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8);
    const lead1 = new THREE.Mesh(leadGeo, MAT.metal.clone());
    lead1.rotation.z = Math.PI / 2;
    lead1.position.x = -0.45;
    group.add(lead1);

    const lead2 = new THREE.Mesh(leadGeo, MAT.metal.clone());
    lead2.rotation.z = Math.PI / 2;
    lead2.position.x = 0.45;
    group.add(lead2);

    pinMeshes = [];
    return group;
  }

  function buildCapacitor() {
    const group = new THREE.Group();

    // Body
    const bodyGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a3a6a, roughness: 0.4, metalness: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    group.add(body);

    // Top cap
    const capGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.04, 16);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.2, metalness: 0.8 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.27;
    group.add(cap);

    // Stripe (polarity)
    const stripeGeo = new THREE.CylinderGeometry(0.152, 0.152, 0.3, 16, 1, true, 0, Math.PI);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.FrontSide });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = 0.05;
    group.add(stripe);

    // Leads
    const leadGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
    const lead1 = new THREE.Mesh(leadGeo, MAT.metal.clone());
    lead1.position.set(0.06, -0.4, 0);
    group.add(lead1);

    const lead2 = new THREE.Mesh(leadGeo, MAT.metal.clone());
    lead2.position.set(-0.06, -0.4, 0);
    group.add(lead2);

    pinMeshes = [];
    return group;
  }

  function buildLED() {
    const group = new THREE.Group();

    // Dome
    const domeGeo = new THREE.SphereGeometry(0.12, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      roughness: 0.1,
      metalness: 0.0,
      transparent: true,
      opacity: 0.8,
      emissive: 0x00ff00,
      emissiveIntensity: 0.5,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 0.1;
    group.add(dome);

    // Base
    const baseGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.2, 16);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x00cc00, roughness: 0.3 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    group.add(base);

    // Glow
    const light = new THREE.PointLight(0x00ff00, 0.5, 1.5);
    light.position.y = 0.2;
    group.add(light);

    // Leads
    const leadGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8);
    const lead1 = new THREE.Mesh(leadGeo, MAT.metal.clone());
    lead1.position.set(0.04, -0.3, 0);
    group.add(lead1);

    const lead2 = new THREE.Mesh(leadGeo, MAT.metal.clone());
    lead2.position.set(-0.04, -0.3, 0);
    group.add(lead2);

    pinMeshes = [];
    return group;
  }

  function addPinHeader(group, count, pitch, height, zOffset, orientation) {
    const headerGeo = new THREE.BoxGeometry(count * pitch, height, 0.1);
    const headerMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
    const header = new THREE.Mesh(headerGeo, headerMat);

    if (orientation === 'vertical') {
      header.position.set(1.2, 0.1, zOffset);
    } else if (orientation === 'horizontal-left') {
      header.rotation.y = Math.PI / 2;
      header.position.set(0, 0.1, zOffset);
    } else {
      header.rotation.y = Math.PI / 2;
      header.position.set(0, 0.1, zOffset);
    }
    group.add(header);

    // Individual pins
    for (let i = 0; i < count; i++) {
      const pinGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8);
      const pin = new THREE.Mesh(pinGeo, MAT.gold.clone());
      if (orientation === 'vertical') {
        pin.position.set(1.2 - (count / 2 - 0.5 - i) * pitch, 0.15, zOffset);
      } else if (orientation === 'horizontal-left') {
        pin.position.set(-0.9 + i * pitch, 0.15, zOffset);
      } else {
        pin.position.set(-0.9 + i * pitch, 0.15, zOffset);
      }
      group.add(pin);
    }
  }

  function addTraces(group) {
    // Decorative PCB traces
    const traceMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.3 });
    const positions = [
      [-0.5, 0.05, 0.3], [0.3, 0.05, -0.5], [-0.8, 0.05, -0.2], [0.6, 0.05, 0.4]
    ];
    positions.forEach(pos => {
      const traceGeo = new THREE.BoxGeometry(0.4, 0.01, 0.02);
      const trace = new THREE.Mesh(traceGeo, traceMat);
      trace.position.set(...pos);
      group.add(trace);
    });
  }

  /* ── Current component data ───────────────────────────────── */
  let currentComponentData = null;

  function getPinData(pinNum) {
    if (!currentComponentData || !currentComponentData.pinout) return null;
    return currentComponentData.pinout.find(p => p.num === pinNum) || null;
  }

  /* ── Load Component ───────────────────────────────────────── */
  function loadComponent(componentId) {
    const data = window.CircuitLabData.components.find(c => c.id === componentId);
    if (!data) return;

    currentComponentData = data;

    // Remove old model
    if (currentModel) {
      scene.remove(currentModel);
      currentModel = null;
    }

    // Build model based on component
    let model;
    switch (componentId) {
      case 'atmega328p':
        model = buildDIP(28, 'ATmega328P');
        break;
      case 'esp32-wroom':
        model = buildESP32();
        break;
      case 'ne555':
        model = buildDIP(8, 'NE555');
        break;
      case 'lm358':
        model = buildDIP(8, 'LM358');
        break;
      case 'stm32f103':
        model = buildQFP(48, 'STM32F103');
        break;
      case 'nrf52840':
        model = buildQFP(48, 'nRF52840');
        break;
      case 'bme280':
        model = buildQFP(8, 'BME280');
        break;
      case 'mpu6050':
        model = buildQFP(24, 'MPU-6050');
        break;
      case 'hc-sr04':
        model = buildHCSR04();
        break;
      default:
        model = buildDIP(8, data.name);
    }

    // Animate in
    model.scale.set(0.01, 0.01, 0.01);
    scene.add(model);
    currentModel = model;

    // Scale up animation
    let t = 0;
    const scaleIn = setInterval(() => {
      t += 0.08;
      const s = Math.min(1, t);
      model.scale.set(s, s, s);
      if (t >= 1) clearInterval(scaleIn);
    }, 16);

    // Reset camera
    targetSpherical = { theta: 0.5, phi: 1.0, radius: 6 };

    return data;
  }

  function buildHCSR04() {
    const group = new THREE.Group();

    // PCB
    const pcbGeo = new THREE.BoxGeometry(1.8, 0.06, 0.8);
    const pcb = new THREE.Mesh(pcbGeo, MAT.pcb.clone());
    group.add(pcb);

    // Ultrasonic transducers
    for (let i = 0; i < 2; i++) {
      const transGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.2, 32);
      const transMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.2, metalness: 0.7 });
      const trans = new THREE.Mesh(transGeo, transMat);
      trans.rotation.x = Math.PI / 2;
      trans.position.set(0.4 + i * -0.8, 0.13, 0);
      group.add(trans);

      // Inner element
      const innerGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 32);
      const innerMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.1, metalness: 0.9 });
      const inner = new THREE.Mesh(innerGeo, innerMat);
      inner.rotation.x = Math.PI / 2;
      inner.position.set(0.4 + i * -0.8, 0.13, -0.12);
      group.add(inner);
    }

    // IC chip
    const chipGeo = new THREE.BoxGeometry(0.3, 0.1, 0.3);
    const chip = new THREE.Mesh(chipGeo, MAT.chip.clone());
    chip.position.set(0, 0.08, 0);
    group.add(chip);

    // Pin header
    addPinHeader(group, 4, 0.1, 0.1, 0, 'vertical');

    pinMeshes = [];
    return group;
  }

  /* ── Pin Interaction ──────────────────────────────────────── */
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onMouseMove(event) {
    if (!canvas || !currentModel) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(pinMeshes, false);

    if (intersects.length > 0) {
      const pin = intersects[0].object;
      if (highlightedPin !== pin) {
        if (highlightedPin) resetPinHighlight(highlightedPin);
        highlightedPin = pin;
        highlightPin(pin);
        canvas.style.cursor = 'pointer';

        // Emit event for tooltip
        const evt = new CustomEvent('pin-hover', {
          detail: { pinNum: pin.userData.pinNum, screenX: event.clientX, screenY: event.clientY }
        });
        document.dispatchEvent(evt);
      }
    } else {
      if (highlightedPin) {
        resetPinHighlight(highlightedPin);
        highlightedPin = null;
        canvas.style.cursor = 'default';
        document.dispatchEvent(new CustomEvent('pin-hover', { detail: null }));
      }
    }
  }

  function onMouseClick(event) {
    if (!canvas || !currentModel) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(pinMeshes, false);

    if (intersects.length > 0) {
      const pin = intersects[0].object;
      document.dispatchEvent(new CustomEvent('pin-select', {
        detail: { pinNum: pin.userData.pinNum }
      }));
    }
  }

  function highlightPin(pin) {
    pin.userData.originalMaterial = pin.material;
    pin.material = MAT.highlight.clone();
    pin.material.emissiveIntensity = 0.8;
    pin.scale.set(1.3, 1.3, 1.3);
  }

  function resetPinHighlight(pin) {
    if (pin.userData.originalMaterial) {
      pin.material = pin.userData.originalMaterial;
    }
    pin.scale.set(1, 1, 1);
  }

  function highlightPinByNumber(pinNum) {
    pinMeshes.forEach(pin => {
      if (pin.userData.pinNum === pinNum) {
        highlightPin(pin);
      } else {
        resetPinHighlight(pin);
      }
    });
  }

  /* ── View Modes ───────────────────────────────────────────── */
  function setWireframe(enabled) {
    wireframeMode = enabled;
    if (!currentModel) return;
    currentModel.traverse(obj => {
      if (obj.isMesh) {
        obj.material.wireframe = enabled;
      }
    });
  }

  function setExplode(enabled) {
    explodeMode = enabled;
    if (!currentModel) return;
    const children = currentModel.children;
    children.forEach((child, i) => {
      const targetY = enabled ? child.userData.origY + (i % 3 - 1) * 0.3 : child.userData.origY || 0;
      if (!child.userData.origY) child.userData.origY = child.position.y;
      // Animate
      let t = 0;
      const startY = child.position.y;
      const anim = setInterval(() => {
        t += 0.05;
        child.position.y = startY + (targetY - startY) * Math.min(1, t);
        if (t >= 1) clearInterval(anim);
      }, 16);
    });
  }

  function setAutoRotate(enabled) {
    rotateMode = enabled;
  }

  function resetView() {
    targetSpherical = { theta: 0.5, phi: 1.0, radius: 6 };
  }

  function zoomIn() {
    targetSpherical.radius = Math.max(2, targetSpherical.radius - 1);
  }

  function zoomOut() {
    targetSpherical.radius = Math.min(15, targetSpherical.radius + 1);
  }

  /* ── Animate ──────────────────────────────────────────────── */
  let time = 0;

  function animate() {
    animationId = requestAnimationFrame(animate);
    time += 0.01;

    // Auto rotate
    if (rotateMode && !isDragging && currentModel) {
      targetSpherical.theta += 0.003;
    }

    // Pulse pin emissive
    pinMeshes.forEach(pin => {
      if (pin !== highlightedPin && pin.material.emissiveIntensity !== undefined) {
        pin.material.emissiveIntensity = 0.1 + Math.sin(time * 2 + pin.userData.pinNum) * 0.05;
      }
    });

    updateCamera();
    renderer.render(scene, camera);
  }

  function onResize() {
    if (!canvas) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  /* ── Public API ───────────────────────────────────────────── */
  return {
    init,
    loadComponent,
    setWireframe,
    setExplode,
    setAutoRotate,
    resetView,
    zoomIn,
    zoomOut,
    highlightPinByNumber,
    onMouseMove,
    onMouseClick,
    onResize,
    isReady: () => isInitialized,
  };
})();
