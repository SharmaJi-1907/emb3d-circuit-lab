/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — 3D models: Chip packages: DIP, QFP and single-row (SIP), with the part name printed on top
   Moved out of three-viewer/index.js (#27c)
═══════════════════════════════════════════════════════════════════ */

import * as THREE from 'three';

// Every builder takes `kit` from the engine (index.js): the shared materials
// (kit.MAT), the colour for each pin type (kit.PIN_COLORS), the loaded part's
// pin data (kit.getPinData) and the list of hoverable pins (kit.pins), which a
// builder fills with its pin meshes.

// The part's name, drawn onto a canvas and used as a texture, so it can be
// read on top of the chip. buildDIP and buildQFP took a label and threw it
// away before this (D11).
function makeLabelMesh(text, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#e8e8e8';
  ctx.font = 'bold 64px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Shrink long names so they stay inside the chip body.
  let size = 64;
  while (ctx.measureText(text).width > canvas.width - 40 && size > 20) {
    size -= 4;
    ctx.font = `bold ${size}px monospace`;
  }
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace; // canvas pixels are sRGB, as colour management expects since r152
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true })
  );
  mesh.name = 'chip-label';
  return mesh;
}

// Single row of pins with a metal tab: Multiwatt-15 (L298N), SOT-223
// (AMS1117) and anything else with an odd pin count (D8).
export function buildSIP(kit, pinCount, label) {
  const group = new THREE.Group();
  const pitch = 0.22;
  const bodyW = (pinCount - 1) * pitch + 0.5;
  const bodyH = 0.5;
  const bodyD = 0.18;

  const body = new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyH, bodyD), kit.MAT.chip.clone());
  body.castShadow = true;
  group.add(body);

  // The metal tab along the back, which is what these packages are known for
  const tab = new THREE.Mesh(
    new THREE.BoxGeometry(bodyW * 0.92, bodyH * 0.42, 0.05),
    new THREE.MeshStandardMaterial({ color: 0xb8b8c0, roughness: 0.25, metalness: 0.9 })
  );
  tab.position.set(0, bodyH * 0.29, -bodyD / 2 - 0.02);
  group.add(tab);

  const labelMesh = makeLabelMesh(label, bodyW * 0.8, bodyW * 0.8 * 0.22);
  labelMesh.position.set(0, -bodyH * 0.1, bodyD / 2 + 0.001);
  group.add(labelMesh);

  kit.pins.length = 0;
  for (let i = 0; i < pinCount; i++) {
    const pinNum = i + 1;
    const x = (i - (pinCount - 1) / 2) * pitch;
    const pinData = kit.getPinData(pinNum);
    const pinColor = pinData ? kit.PIN_COLORS[pinData.type] || 0xc0c0c0 : 0xc0c0c0;

    const pin = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.3, 0.04),
      new THREE.MeshStandardMaterial({
        color: pinColor, roughness: 0.1, metalness: 0.9,
        emissive: pinColor, emissiveIntensity: 0.1,
      })
    );
    pin.position.set(x, -bodyH / 2 - 0.15, 0);
    pin.castShadow = true;
    pin.userData = { pinNum, type: pinData ? pinData.type : 'digital' };
    group.add(pin);
    kit.pins.push(pin);
  }
  return group;
}

export function buildDIP(kit, pinCount, label) {
  const group = new THREE.Group();
  const rows = pinCount / 2;
  const pitch = 0.3;
  const bodyW = 0.8;
  const bodyH = 0.2;
  const bodyL = (rows - 1) * pitch + 0.4;

  // Body
  const bodyGeo = new THREE.BoxGeometry(bodyW, bodyH, bodyL);
  const body = new THREE.Mesh(bodyGeo, kit.MAT.chip.clone());
  body.castShadow = true;
  group.add(body);

  // Notch
  const notchGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.01, 16);
  const notch = new THREE.Mesh(notchGeo, new THREE.MeshStandardMaterial({ color: 0x333333 }));
  notch.rotation.x = Math.PI / 2;
  notch.position.set(0, bodyH / 2 + 0.005, -bodyL / 2 + 0.15);
  group.add(notch);

  // The part's name, printed on the top of the chip (D11)
  const labelMesh = makeLabelMesh(label, bodyL * 0.7, bodyL * 0.7 * 0.25);
  labelMesh.position.y = bodyH / 2 + 0.001;
  labelMesh.rotation.x = -Math.PI / 2;
  labelMesh.rotation.z = Math.PI / 2;
  group.add(labelMesh);

  // Pins
  kit.pins.length = 0;
  for (let i = 0; i < pinCount; i++) {
    const side = i < rows ? -1 : 1;
    const row = i < rows ? i : (pinCount - 1 - i);
    const pinNum = i + 1;

    const pinGeo = new THREE.BoxGeometry(0.04, 0.15, 0.04);
    const pinData = kit.getPinData(pinNum);
    const pinColor = pinData ? kit.PIN_COLORS[pinData.type] || 0xc0c0c0 : 0xc0c0c0;
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
    kit.pins.push(pin);

    // Lead (horizontal part)
    const leadGeo = new THREE.BoxGeometry(0.12, 0.03, 0.03);
    const lead = new THREE.Mesh(leadGeo, kit.MAT.metal.clone());
    lead.position.set(
      side * (bodyW / 2 + 0.02),
      -bodyH / 2 - 0.01,
      -bodyL / 2 + 0.2 + row * pitch
    );
    group.add(lead);
  }

  return group;
}

export function buildQFP(kit, pinCount, label) {
  const group = new THREE.Group();
  const pinsPerSide = pinCount / 4;
  const pitch = 0.25;
  const bodySize = pinsPerSide * pitch * 0.7;
  const bodyH = 0.15;

  // Body
  const bodyGeo = new THREE.BoxGeometry(bodySize, bodyH, bodySize);
  const body = new THREE.Mesh(bodyGeo, kit.MAT.chip.clone());
  body.castShadow = true;
  group.add(body);

  // Corner marks
  const markGeo = new THREE.BoxGeometry(0.08, 0.01, 0.08);
  const markMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
  const mark = new THREE.Mesh(markGeo, markMat);
  mark.position.set(-bodySize / 2 + 0.06, bodyH / 2 + 0.001, -bodySize / 2 + 0.06);
  group.add(mark);

  // The part's name, printed on the top of the chip (D11)
  const labelMesh = makeLabelMesh(label, bodySize * 0.75, bodySize * 0.75 * 0.25);
  labelMesh.position.y = bodyH / 2 + 0.002;
  labelMesh.rotation.x = -Math.PI / 2;
  group.add(labelMesh);

  // Pins on all 4 sides
  kit.pins.length = 0;
  for (let side = 0; side < 4; side++) {
    for (let i = 0; i < pinsPerSide; i++) {
      const pinNum = side * pinsPerSide + i + 1;
      const offset = (i - (pinsPerSide - 1) / 2) * pitch;
      const pinData = kit.getPinData(pinNum);
      const pinColor = pinData ? kit.PIN_COLORS[pinData.type] || 0xc0c0c0 : 0xc0c0c0;

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
      kit.pins.push(pin);
    }
  }

  return group;
}
