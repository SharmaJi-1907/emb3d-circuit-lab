// EMB3D: Animated Circuit Background (Canvas Particle System)

class CircuitBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.particles = [];
        this.gridSize = 50; // Size of grid cells in pixels
        this.maxParticles = 40;
        
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    init() {
        this.resize();
        this.generateGridNodes();
        this.spawnParticles();
    }
    
    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.generateGridNodes();
        // Start the particles again on the new grid; the old ones still point at the old nodes (D29)
        this.spawnParticles();
    }
    
    generateGridNodes() {
        this.nodes = [];
        const cols = Math.ceil(this.width / this.gridSize) + 1;
        const rows = Math.ceil(this.height / this.gridSize) + 1;
        
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                // Introduce randomness: only keep some nodes to make circuit-like clusters
                if (Math.random() < 0.25) {
                    this.nodes.push({
                        x: x * this.gridSize,
                        y: y * this.gridSize,
                        connections: [],
                        size: Math.random() * 2 + 1.5,
                        glow: Math.random() > 0.7
                    });
                }
            }
        }
        
        // Form connections between nearby nodes (horizontal/vertical strictly to simulate PCB traces)
        for (let i = 0; i < this.nodes.length; i++) {
            const n1 = this.nodes[i];
            for (let j = i + 1; j < this.nodes.length; j++) {
                const n2 = this.nodes[j];
                const dx = Math.abs(n1.x - n2.x);
                const dy = Math.abs(n1.y - n2.y);
                
                // Allow connections only along grid axes within 2 grid units
                if ((dx === 0 && dy <= this.gridSize * 2) || (dy === 0 && dx <= this.gridSize * 2)) {
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
        if (this.nodes.length === 0) return;
        
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
            speed: Math.random() * 0.005 + 0.002, // Progress increment per frame
            size: Math.random() * 1.5 + 1.2,
            color: Math.random() > 0.5 ? 'hsl(188, 86%, 53%)' : 'hsl(268, 86%, 63%)' // Cyan or Purple
        });
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Check theme colors dynamically. Dark is the default; light sets data-theme on <html> (D28)
        const isDark = document.documentElement.dataset.theme !== 'light';
        const gridColor = isDark ? 'rgba(48, 54, 61, 0.25)' : 'rgba(210, 215, 220, 0.4)';
        const nodeColor = isDark ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.25)';
        
        // 1. Draw grid background traces
        this.ctx.strokeStyle = gridColor;
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.nodes.length; i++) {
            const n1 = this.nodes[i];
            for (let j = 0; j < n1.connections.length; j++) {
                const n2 = n1.connections[j];
                // Prevent duplicate line drawings (only draw from left-to-right or top-to-bottom)
                if (n1.x < n2.x || (n1.x === n2.x && n1.y < n2.y)) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(n1.x, n1.y);
                    this.ctx.lineTo(n2.x, n2.y);
                    this.ctx.stroke();
                }
            }
        }
        
        // 2. Draw static nodes
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            this.ctx.fillStyle = node.glow ? 'rgba(6, 182, 212, 0.5)' : nodeColor;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            if (node.glow) {
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = 'rgba(6, 182, 212, 0.4)';
                this.ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, node.size * 0.6, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0; // Reset shadow
            }
        }
        
        // 3. Update & Draw particles (electrons)
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Advance particle progress along path
            p.progress += p.speed;
            
            // Calculate current coordinates via linear interpolation
            p.x = p.currentNode.x + (p.targetNode.x - p.currentNode.x) * p.progress;
            p.y = p.currentNode.y + (p.targetNode.y - p.currentNode.y) * p.progress;
            
            // Render glowing particle
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = p.color;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0; // Reset
            
            // If particle reached destination node
            if (p.progress >= 1.0) {
                const nextNode = p.targetNode;
                // Filter possible next nodes, preventing going straight back if possible
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
        
        requestAnimationFrame(() => this.animate());
    }
}

// Instantiate when DOM finishes loading
window.addEventListener('DOMContentLoaded', () => {
    new CircuitBackground('circuit-bg');
});
