import { minMax } from './helpers.js';

export class Particle {
    constructor(effect) {
        this.effect = effect;
        this.baseSize = minMax(1, 10);
        this.size = this.baseSize;
        this.strokeWidth = 1;
        this.reset();
    }

    reset() {
        const margin = this.size * 0.2;
        this.x = margin + Math.random() * (this.effect.width - margin * 2);
        this.y = margin + Math.random() * (this.effect.height - margin * 2);
        this.vx = 0;
        this.vy = 0;
        this.maxSpeed = 0.5;
        // Increased center attraction strength for stronger pull to center
        this.centerAttractionStrength = 0.05;
        this.size = 3.15;
        this.isAbsorbed = false;
        this.organismId = null;
    }

    draw(context) {
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        context.fillStyle = 'rgba(2, 2, 2, 0.52)';
        context.fill();
    }

    update() {
        // Always apply center attraction
        this.applyCenterAttraction();
        
        // Apply movement
        this.x += this.vx;
        this.y += this.vy;

        this.limitSpeed();

        // Keep particles within bounds
        this.x = Math.max(Math.min(this.x, this.effect.width - this.size), this.size);
        this.y = Math.max(Math.min(this.y, this.effect.height - this.size), this.size);
    }
    
    applyCenterAttraction() {
        // Calculate direction to the center of the canvas
        const centerX = this.effect.width / 2;
        const centerY = this.effect.height / 2;
        
        const dx = centerX - this.x;
        const dy = centerY - this.y;
        const distanceToCenter = Math.hypot(dx, dy);
        
        if (distanceToCenter > 0) {
            // Apply force toward center, strength increases with distance
            this.vx += (dx / distanceToCenter) * this.centerAttractionStrength;
            this.vy += (dy / distanceToCenter) * this.centerAttractionStrength;
        }
        
        // Apply boids behavior for natural movement
        this.applyBoidsBehavior();
        
        // Handle mouse interaction
        this.handleMouseInteraction();
    }

    applyBoidsBehavior() {
        let separationForce = { x: 0, y: 0 };
        let cohesionForce = { x: 0, y: 0 };
        let alignmentForce = { x: 0, y: 0 };
        let neighborCount = 0;

        for (let other of this.effect.particles) {
            if (other === this || other.organismId !== this.organismId) continue;

            const dx = this.x - other.x;
            const dy = this.y - other.y;
            const distance = Math.hypot(dx, dy);

            if (distance < this.size * (minMax(5.75, 6.8))) {
                separationForce.x += dx / distance;
                separationForce.y += dy / distance;
            }

            if (distance < this.size * 20) {
                cohesionForce.x += other.x;
                cohesionForce.y += other.y;
                alignmentForce.x += other.vx;
                alignmentForce.y += other.vy;
                neighborCount++;
            }
        }

        if (neighborCount > 0) {
            cohesionForce.x = cohesionForce.x / neighborCount - this.x;
            cohesionForce.y = cohesionForce.y / neighborCount - this.y;
            alignmentForce.x /= neighborCount;
            alignmentForce.y /= neighborCount;
        }

        // Reduce the influence of boids behavior to prioritize center attraction
        this.vx += (separationForce.x * 0.3 + cohesionForce.x * 0.1 + alignmentForce.x * 0.4);
        this.vy += (separationForce.y * 0.3 + cohesionForce.y * 0.1 + alignmentForce.y * 0.4);
    }

    handleMouseInteraction() {
        if (this.effect.mouse.x && this.effect.mouse.y) {
            const dx = this.x - this.effect.mouse.x;
            const dy = this.y - this.effect.mouse.y;
            const distance = Math.hypot(dx, dy);
            const mouseRadius = 320;

            if (distance < mouseRadius) {
                const angle = Math.atan2(dy, dx);
                const force = (mouseRadius - distance) / mouseRadius;
                this.vx += Math.cos(angle) * force * 5.2;
                this.vy += Math.sin(angle) * force * 5.2;
            }
        }
    }

    limitSpeed() {
        const speed = Math.hypot(this.vx, this.vy);
        if (speed > this.maxSpeed) {
            const ratio = this.maxSpeed / speed;
            this.vx *= ratio;
            this.vy *= ratio;
        }
    }
}