/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Three.js 3D Component Viewer
   Procedural component models, orbit controls, pin highlighting
═══════════════════════════════════════════════════════════════════ */

// Bundled from npm instead of the old r128 CDN script, so 3D works offline (E7).
import * as THREE from 'three';
import { buildDIP, buildQFP, buildSIP } from './models/chips.js';
import { buildESP32, buildHCSR04 } from './models/boards.js';
import { buildCapacitor, buildLED, buildResistor } from './models/passives.js';

window.ThreeViewer = (function () {
  'use strict';

  let scene, camera, renderer;
  let currentModel = null;
  const pinMeshes = []; // emptied, never replaced: the model builders fill it through kit.pins
  let isInitialized = false;
  let explodeMode = false;
  let wireframeMode = false;
  let rotateMode = true;
  let highlightedPin = null;
  let canvas = null;

  // Materials
  const MAT = {};

  // Lights have been physically correct since r155. The migration guide's way to
  // keep the r128 look: intensities × π, and point lights with decay 1 (E7).
  const LEGACY_LIGHT = Math.PI;

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
    const [w, h] = containerSize();
    camera = new THREE.PerspectiveCamera(45, w / h, 0.01, 100);
    camera.position.set(0, 3, 6);

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(w, h, false); // false: leave the display size to CSS, so the canvas can follow its container
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap; // soft since r181, which deprecated PCFSoftShadowMap
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

    // Follow the size of the area the canvas sits in: a window resize, and
    // also the sidebar being hidden, which the window never hears about (D35).
    new ResizeObserver(onResize).observe(canvas.parentElement || canvas);
    onResize();

    isInitialized = true;
    animate();
  }

  function setupLights() {
    // Ambient
    const ambient = new THREE.AmbientLight(0x1a1a2e, 2 * LEGACY_LIGHT);
    scene.add(ambient);

    // Key light (cyan tint)
    const keyLight = new THREE.DirectionalLight(0x00d4ff, 1.5 * LEGACY_LIGHT);
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
    const fillLight = new THREE.DirectionalLight(0x7b2fff, 0.8 * LEGACY_LIGHT);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0x00ff88, 0.4 * LEGACY_LIGHT);
    rimLight.position.set(0, -5, 5);
    scene.add(rimLight);

    // Point lights for glow effect
    const glow1 = new THREE.PointLight(0x00d4ff, 0.5 * LEGACY_LIGHT, 8, 1);
    glow1.position.set(3, 2, 3);
    scene.add(glow1);

    const glow2 = new THREE.PointLight(0x7b2fff, 0.3 * LEGACY_LIGHT, 8, 1);
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

    // Highlight (named, so a highlighted pin can be told apart from its own material)
    MAT.highlight = new THREE.MeshStandardMaterial({
      name: 'pin-highlight',
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

  // Ease the camera towards its target: 8% of the way per 1/60 s, worked out
  // from the real time since the last frame so it feels the same at any frame rate (D42).
  function updateCamera(dt) {
    const k = 1 - Math.pow(1 - 0.08, dt * 60);
    spherical.theta += (targetSpherical.theta - spherical.theta) * k;
    spherical.phi += (targetSpherical.phi - spherical.phi) * k;
    spherical.radius += (targetSpherical.radius - spherical.radius) * k;

    camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
    camera.position.y = spherical.radius * Math.cos(spherical.phi);
    camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
    camera.lookAt(0, 0, 0);
  }

  /* ── Freeing a model ──────────────────────────────────────────
     Three.js does not free GPU memory when an object leaves the scene;
     every geometry, material and texture has to be disposed (D16).
  ──────────────────────────────────────────────────────────────── */
  function disposeObject(root) {
    root.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const mat of materials) {
        if (!mat) continue;
        for (const key of Object.keys(mat)) {
          const value = mat[key];
          if (value && value.isTexture) value.dispose();
        }
        mat.dispose();
      }
      // A highlighted pin keeps its original material aside; free that too.
      if (obj.userData && obj.userData.originalMaterial) {
        obj.userData.originalMaterial.dispose();
        obj.userData.originalMaterial = null;
      }
    });
  }

  /* ── Component Model Builders ─────────────────────────────── */
  // What the model builders in models/ get from the engine (see models/chips.js).
  const kit = { MAT, PIN_COLORS, LEGACY_LIGHT, getPinData, pins: pinMeshes };

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

    // Remove old model, and give its geometries and materials back to the GPU.
    // scene.remove() alone leaked about 59 geometries per visit (D16).
    if (currentModel) {
      scene.remove(currentModel);
      disposeObject(currentModel);
      currentModel = null;
      pinMeshes.length = 0;
    }
    highlightedPin = null; // it belonged to the old model
    explodeMode = false; // a new model starts assembled

    // Build model based on component
    let model;
    switch (componentId) {
      case 'atmega328p':
        model = buildDIP(kit, 28, 'ATmega328P');
        break;
      case 'esp32-wroom':
        model = buildESP32(kit);
        break;
      case 'ne555':
        model = buildDIP(kit, 8, 'NE555');
        break;
      case 'lm358':
        model = buildDIP(kit, 8, 'LM358');
        break;
      case 'stm32f103':
        model = buildQFP(kit, 48, 'STM32F103');
        break;
      case 'mpu6050':
        model = buildQFP(kit, 24, 'MPU-6050');
        break;
      case 'l298n':
        model = buildSIP(kit, 15, 'L298N');      // Multiwatt-15
        break;
      case 'ams1117':
        model = buildSIP(kit, 3, 'AMS1117');     // SOT-223
        break;
      case 'nrf24l01':
        model = buildDIP(kit, 8, 'nRF24L01+');   // module with a 2x4 header
        break;
      case 'hc-sr04':
        model = buildHCSR04(kit);
        break;
      case 'cfr-25':
        model = buildResistor(kit);
        break;
      case 'eca-1em101':
        model = buildCapacitor(kit);
        break;
      case 'wp7113id':
        model = buildLED(kit);
        break;
      default:
        // Follow the part's real pin count instead of always drawing an 8-pin
        // chip. A dual row needs an even count, so odd counts get a single row.
        model = data.pins % 2 === 0 ? buildDIP(kit, data.pins, data.name) : buildSIP(kit, data.pins, data.name);
    }

    // Animate in
    model.scale.set(0.01, 0.01, 0.01);
    scene.add(model);
    currentModel = model;
    if (wireframeMode) setWireframe(true); // the chosen view mode carries over to the new part (D32)

    // Scale up animation (time-based, so it lasts ~200 ms even when frames are slow)
    const start = performance.now();
    const scaleIn = setInterval(() => {
      const s = Math.min(1, (performance.now() - start) / 200);
      model.scale.set(s, s, s);
      if (s >= 1) clearInterval(scaleIn);
    }, 16);

    // Reset camera
    targetSpherical = { theta: 0.5, phi: 1.0, radius: 6 };

    return data;
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

  // A pin can be highlighted twice (hovering its table row, then clicking it).
  // The second time must not save the highlight as the pin's own material,
  // or the pin stays cyan for good (D34).
  function highlightPin(pin) {
    if (!pin.userData.originalMaterial) {
      pin.userData.originalMaterial = pin.material;
      pin.material = MAT.highlight.clone();
      pin.material.emissiveIntensity = 0.8;
      pin.material.wireframe = wireframeMode;
    }
    pin.scale.set(1.3, 1.3, 1.3);
  }

  function resetPinHighlight(pin) {
    if (pin.userData.originalMaterial) {
      pin.material.dispose(); // the highlight copy
      pin.material = pin.userData.originalMaterial;
      pin.userData.originalMaterial = null;
      pin.material.wireframe = wireframeMode;
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
        if (obj.userData.originalMaterial) obj.userData.originalMaterial.wireframe = enabled;
      }
    });
  }

  function setExplode(enabled) {
    explodeMode = enabled;
    if (!currentModel) return;
    const children = currentModel.children;
    children.forEach((child, i) => {
      // Remember the resting position before using it (0 is a valid position, so check for undefined).
      if (child.userData.origY === undefined) child.userData.origY = child.position.y;
      const targetY = enabled ? child.userData.origY + (i % 3 - 1) * 0.3 : child.userData.origY;
      // Animate (stop any animation still running from a quick earlier toggle, so they don't fight)
      clearInterval(child.userData.explodeAnim);
      const startY = child.position.y;
      const start = performance.now();
      const anim = setInterval(() => {
        // Time-based, so it lasts ~320 ms even when frames are slow.
        const t = Math.min(1, (performance.now() - start) / 320);
        child.position.y = startY + (targetY - startY) * t;
        if (t >= 1) clearInterval(anim);
      }, 16);
      child.userData.explodeAnim = anim;
    });
  }

  // Bounding box of the current model ({ min, max } as [x, y, z]), or null when nothing is loaded.
  function getModelBounds() {
    if (!currentModel) return null;
    const box = new THREE.Box3().setFromObject(currentModel);
    return { min: box.min.toArray(), max: box.max.toArray() };
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
  // Everything moves by real time, not by frame, so the model turns at the
  // same speed at 15 or 144 frames a second (D42).
  const ROTATE_SPEED = 0.18; // radians per second
  let lastFrame = 0;

  function animate(now = performance.now()) {
    requestAnimationFrame(animate);
    // Don't draw while the Viewer screen is hidden (D5): offsetParent is null under display:none.
    if (canvas.offsetParent === null) { lastFrame = 0; return; }
    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.5) : 0; // at most 0.5 s, e.g. after a background tab
    lastFrame = now;
    const time = now / 1000;

    // Auto rotate
    if (rotateMode && !isDragging && currentModel) {
      targetSpherical.theta += ROTATE_SPEED * dt;
    }

    // Pulse pin emissive
    pinMeshes.forEach(pin => {
      if (pin !== highlightedPin && pin.material.emissiveIntensity !== undefined && !pin.userData.originalMaterial) {
        pin.material.emissiveIntensity = 0.1 + Math.sin(time * 1.2 + pin.userData.pinNum) * 0.05;
      }
    });

    updateCamera(dt);
    renderer.render(scene, camera);
  }

  // Size of the element the canvas sits in. Falls back to 600×400 while it is hidden (0×0).
  function containerSize() {
    const box = canvas.parentElement || canvas;
    return [box.clientWidth || 600, box.clientHeight || 400];
  }

  function onResize() {
    if (!canvas || !renderer) return;
    const [w, h] = containerSize();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // Read each time: the window can move to a screen with another pixel density.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
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
    isWireframe: () => wireframeMode,
    isExploded: () => explodeMode,
    isAutoRotating: () => rotateMode,
    getCamera: () => ({ ...targetSpherical }),
    getModelBounds,
    getFrameCount: () => (renderer ? renderer.info.render.frame : 0),
    // What the GPU is still holding. Used to prove old models are freed (D16).
    getMemoryInfo: () => (renderer ? { ...renderer.info.memory } : null),
    // What the current model is made of: how many pins it drew, and whether the
    // part's name is printed on it (D8, D11).
    getModelInfo: () => {
      if (!currentModel) return null;
      let pins = 0;
      let hasLabel = false;
      let wireframe = true;
      const highlighted = [];
      currentModel.traverse((o) => {
        if (o.userData && o.userData.pinNum !== undefined) {
          pins++;
          if (o.material.name === 'pin-highlight') highlighted.push(o.userData.pinNum);
        }
        if (o.name === 'chip-label') hasLabel = true;
        if (o.isMesh && !o.material.wireframe && o.name !== 'chip-label') wireframe = false;
      });
      return { component: currentComponentData ? currentComponentData.id : null, pins, hasLabel, wireframe, highlighted };
    },
  };
})();
