/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Animated background: a PCB grid with moving electrons
   The only animation on #circuit-bg (D4). It follows the theme (D28),
   rebuilds its grid after a resize (D29) and moves by real time.
═══════════════════════════════════════════════════════════════════ */

class CircuitBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.nodes = [];
    this.particles = [];
    this.gridSize = 50; // Size of grid cells in pixels
    this.maxParticles = 40;

    this.resize();
    this.animate();

    window.addEventListener('resize', () => this.resize());
  }

  // Fill the window. On a high-DPI screen the canvas gets that many pixels
  // per CSS pixel, so it is sharp; drawing still uses CSS pixels (D45).
  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.generateGridNodes();
    // Start the particles again on the new grid; the old ones still point at the old nodes (D29)
    this.spawnParticles();
  }

  generateGridNodes() {
    this.nodes = [];
    const cols = Math.ceil(this.width / this.gridSize) + 1;
    const rows = Math.ceil(this.height / this.gridSize) + 1;
    const at = new Map(); // "col,row" → node

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        // Introduce randomness: only keep some nodes to make circuit-like clusters
        if (Math.random() < 0.25) {
          const node = {
            x: x * this.gridSize,
            y: y * this.gridSize,
            connections: [],
            size: Math.random() * 2 + 1.5,
            glow: Math.random() > 0.7
          };
          this.nodes.push(node);
          at.set(`${x},${y}`, node);
        }
      }
    }

    // Join each node to the nodes up to 2 grid cells to its right and below,
    // like PCB traces. Looking the neighbours up by cell keeps this fast on
    // a big window, instead of comparing every pair of nodes.
    for (const n1 of this.nodes) {
      const col = n1.x / this.gridSize;
      const row = n1.y / this.gridSize;
      for (const [dc, dr] of [[1, 0], [2, 0], [0, 1], [0, 2]]) {
        const n2 = at.get(`${col + dc},${row + dr}`);
        if (n2) {
          n1.connections.push(n2);
          n2.connections.push(n1);
        }
      }
    }
  }

  spawnParticles() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.spawnParticle();
    }
  }

  spawnParticle() {
    // Choose a random node with connections
    const nodesWithConnections = this.nodes.filter(n => n.connections.length > 0);
    if (nodesWithConnections.length === 0) return;

    const startNode = nodesWithConnections[Math.floor(Math.random() * nodesWithConnections.length)];
    const targetNode = startNode.connections[Math.floor(Math.random() * startNode.connections.length)];

    this.particles.push({
      x: startNode.x,
      y: startNode.y,
      currentNode: startNode,
      targetNode: targetNode,
      progress: 0,
      speed: Math.random() * 0.005 + 0.002, // Progress per 60 Hz frame
      size: Math.random() * 1.5 + 1.2,
      color: Math.random() > 0.5 ? 'hsl(188, 86%, 53%)' : 'hsl(268, 86%, 63%)' // Cyan or Purple
    });
  }

  animate(now = performance.now()) {
    const ctx = this.ctx;
    // Time-based (D29): `speed` is progress per 60 Hz frame, scaled by the real time since the last frame
    const frames = this.lastFrame ? Math.min((now - this.lastFrame) / (1000 / 60), 4) : 1;
    this.lastFrame = now;
    ctx.clearRect(0, 0, this.width, this.height);

    // Dark is the default; light sets data-theme on <html> (D28)
    const isDark = document.documentElement.dataset.theme !== 'light';
    const gridColor = isDark ? 'rgba(48, 54, 61, 0.25)' : 'rgba(210, 215, 220, 0.4)';
    const nodeColor = isDark ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.25)';

    // 1. Draw grid background traces
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    for (const n1 of this.nodes) {
      for (const n2 of n1.connections) {
        // Draw each trace once: from left to right, or top to bottom
        if (n1.x < n2.x || (n1.x === n2.x && n1.y < n2.y)) {
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.stroke();
        }
      }
    }

    // 2. Draw static nodes
    for (const node of this.nodes) {
      ctx.fillStyle = node.glow ? 'rgba(6, 182, 212, 0.5)' : nodeColor;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      ctx.fill();

      if (node.glow) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(6, 182, 212, 0.4)';
        ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // 3. Update & Draw particles (electrons)
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Advance particle progress along path
      p.progress += p.speed * frames;
      p.x = p.currentNode.x + (p.targetNode.x - p.currentNode.x) * p.progress;
      p.y = p.currentNode.y + (p.targetNode.y - p.currentNode.y) * p.progress;

      // Render glowing particle
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // If particle reached destination node
      if (p.progress >= 1.0) {
        const nextNode = p.targetNode;
        // Don't go straight back if there is another way
        const nextOptions = nextNode.connections.filter(n => n !== p.currentNode);

        if (nextOptions.length > 0) {
          p.currentNode = nextNode;
          p.targetNode = nextOptions[Math.floor(Math.random() * nextOptions.length)];
          p.progress = 0;
          p.speed = Math.random() * 0.005 + 0.002;
        } else {
          // Dead end, remove and spawn fresh particle
          this.particles.splice(i, 1);
          this.spawnParticle();
        }
      }
    }

    requestAnimationFrame((t) => this.animate(t));
  }
}

// Instantiate when DOM finishes loading
window.addEventListener('DOMContentLoaded', () => {
  new CircuitBackground('circuit-bg');
});
