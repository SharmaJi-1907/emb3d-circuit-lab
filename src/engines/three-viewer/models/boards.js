/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — 3D models: Modules and boards: ESP32, HC-SR04 and the (unused) Arduino Uno, with pin headers
   Moved out of three-viewer/index.js (#27c)
═══════════════════════════════════════════════════════════════════ */

import * as THREE from 'three';

// Every builder takes `kit` from the engine (index.js): the shared materials
// (kit.MAT), the colour for each pin type (kit.PIN_COLORS), the loaded part's
// pin data (kit.getPinData) and the list of hoverable pins (kit.pins), which a
// builder fills with its pin meshes.

export function buildESP32(kit) {
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

  // Pin headers. The list is started first: it used to be cleared after the
  // headers were added, so the ESP32 had no pins to hover or highlight (D8).
  kit.pins.length = 0;
  addPinHeader(kit, group, 19, 0.1, 0.08, 0.45, 'horizontal-left', 1);
  addPinHeader(kit, group, 19, 0.1, 0.08, -0.45, 'horizontal-right', 20);

  return group;
}

export function buildHCSR04(kit) {
  const group = new THREE.Group();

  // PCB
  const pcbGeo = new THREE.BoxGeometry(1.8, 0.06, 0.8);
  const pcb = new THREE.Mesh(pcbGeo, kit.MAT.pcb.clone());
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
  const chip = new THREE.Mesh(chipGeo, kit.MAT.chip.clone());
  chip.position.set(0, 0.08, 0);
  group.add(chip);

  // Pin header (VCC, Trig, Echo, GND). Started before the header is added, so
  // the pins survive and can be hovered and highlighted (D8).
  kit.pins.length = 0;
  addPinHeader(kit, group, 4, 0.1, 0.1, 0, 'vertical', 1);

  return group;
}

function buildArduinoUno(kit) {
  const group = new THREE.Group();

  // PCB
  const pcbGeo = new THREE.BoxGeometry(2.7, 0.08, 2.1);
  const pcb = new THREE.Mesh(pcbGeo, kit.MAT.pcb.clone());
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
  const chip = new THREE.Mesh(chipGeo, kit.MAT.chip.clone());
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
  const ledLight = new THREE.PointLight(0x00ff00, 0.3 * kit.LEGACY_LIGHT, 0.5, 1);
  ledLight.position.copy(led.position);
  group.add(ledLight);

  // Pin headers (digital)
  addPinHeader(kit, group, 14, 0.1, 0.12, 0.9, 'vertical');
  // Pin headers (analog)
  addPinHeader(kit, group, 6, 0.1, 0.12, -0.7, 'vertical');
  // Power header
  addPinHeader(kit, group, 6, 0.1, 0.12, -0.3, 'vertical');

  // Silkscreen traces (decorative lines)
  addTraces(group);

  kit.pins.length = 0;
  return group;
}

function addPinHeader(kit, group, count, pitch, height, zOffset, orientation, firstPin = 1) {
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
    const pinNum = firstPin + i;
    const pinData = kit.getPinData(pinNum);
    const pinColor = pinData ? kit.PIN_COLORS[pinData.type] || 0xffd700 : 0xffd700;
    const pinGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8);
    const pin = new THREE.Mesh(pinGeo, new THREE.MeshStandardMaterial({
      color: pinColor, roughness: 0.1, metalness: 0.9,
      emissive: pinColor, emissiveIntensity: 0.1,
    }));
    pin.userData = { pinNum, type: pinData ? pinData.type : 'digital' };
    kit.pins.push(pin);
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
