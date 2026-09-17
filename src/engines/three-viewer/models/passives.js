/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — 3D models: Two-lead parts: resistor, capacitor and LED (#23b)
   Moved out of three-viewer/index.js (#27c)
═══════════════════════════════════════════════════════════════════ */

import * as THREE from 'three';

// Every builder takes `kit` from the engine (index.js): the shared materials
// (kit.MAT), the colour for each pin type (kit.PIN_COLORS), the loaded part's
// pin data (kit.getPinData) and the list of hoverable pins (kit.pins), which a
// builder fills with its pin meshes.

export function buildResistor(kit) {
  const group = new THREE.Group();

  // Body
  const bodyGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 16);
  const body = new THREE.Mesh(bodyGeo, kit.MAT.epoxy.clone());
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
  const lead1 = new THREE.Mesh(leadGeo, kit.MAT.metal.clone());
  lead1.rotation.z = Math.PI / 2;
  lead1.position.x = -0.45;
  group.add(lead1);

  const lead2 = new THREE.Mesh(leadGeo, kit.MAT.metal.clone());
  lead2.rotation.z = Math.PI / 2;
  lead2.position.x = 0.45;
  group.add(lead2);

  tagLeads(kit, lead1, lead2);
  return group;
}

export function buildCapacitor(kit) {
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
  const lead1 = new THREE.Mesh(leadGeo, kit.MAT.metal.clone());
  lead1.position.set(0.06, -0.4, 0);
  group.add(lead1);

  const lead2 = new THREE.Mesh(leadGeo, kit.MAT.metal.clone());
  lead2.position.set(-0.06, -0.4, 0);
  group.add(lead2);

  tagLeads(kit, lead1, lead2);
  return group;
}

export function buildLED(kit) {
  const group = new THREE.Group();

  // Dome. Red, like the only LED in the data: the WP7113ID has a red diffused lens (#23b)
  const domeGeo = new THREE.SphereGeometry(0.12, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const domeMat = new THREE.MeshStandardMaterial({
    color: 0xff2a1a,
    roughness: 0.1,
    metalness: 0.0,
    transparent: true,
    opacity: 0.8,
    emissive: 0xff2a1a,
    emissiveIntensity: 0.5,
  });
  const dome = new THREE.Mesh(domeGeo, domeMat);
  dome.position.y = 0.1;
  group.add(dome);

  // Base
  const baseGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.2, 16);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xcc1a10, roughness: 0.3 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  group.add(base);

  // Glow
  const light = new THREE.PointLight(0xff2a1a, 0.5 * kit.LEGACY_LIGHT, 1.5, 1);
  light.position.y = 0.2;
  group.add(light);

  // Leads
  const leadGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8);
  const lead1 = new THREE.Mesh(leadGeo, kit.MAT.metal.clone());
  lead1.position.set(0.04, -0.3, 0);
  group.add(lead1);

  const lead2 = new THREE.Mesh(leadGeo, kit.MAT.metal.clone());
  lead2.position.set(-0.04, -0.3, 0);
  group.add(lead2);

  tagLeads(kit, lead1, lead2);
  return group;
}

// A two-lead part's leads are its pins 1 and 2, so they can be hovered and
// highlighted like a chip's pins (#23b). They used to be left out of the pin list.
function tagLeads(kit, ...leads) {
  kit.pins.length = 0;
  leads.forEach((lead, i) => {
    const pinData = kit.getPinData(i + 1);
    lead.userData = { pinNum: i + 1, type: pinData ? pinData.type : 'analog' };
    kit.pins.push(lead);
  });
}
