import { minMax } from './helpers.js';

export class Particle {
    constructor(effect) {
        this.effect = effect;
        this.baseSize = minMax(4, 20);
        this.size = this.baseSize;
        this.strokeWidth = 0.2;
        this.reset();
    }

    reset() {
        const margin = this.size * 2;
        this.x = margin + Math.random() * (this.effect.width - margin * 2);
        this.y = margin + Math.random() * (this.effect.height - margin * 2);
        this.vx = 0;
        this.vy = 0;
        this.maxSpeed = 0.5;
        this.centerAttractionStrength = 0.02;
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

    update(isPulsing, centerOfMass) {
        if (isPulsing) {
            this.repulse(centerOfMass);
        } else {
            this.applyForces(centerOfMass);
        }

        this.x += this.vx;
        this.y += this.vy;

        this.limitSpeed();

        this.x = Math.max(Math.min(this.x, this.effect.width - this.size), this.size);
        this.y = Math.max(Math.min(this.y, this.effect.height - this.size), this.size);

        if (!isPulsing && this.centerAttractionStrength < 0.01) {
            this.centerAttractionStrength += 0.0001;
        }
    }

    applyForces(centerOfMass) {
        const dx = centerOfMass.x - this.x;
        const dy = centerOfMass.y - this.y;
        const distanceToCenter = Math.hypot(dx, dy);

        this.vx += (dx / distanceToCenter) * this.centerAttractionStrength;
        this.vy += (dy / distanceToCenter) * this.centerAttractionStrength;

        const margin = this.size * 0.5;
        const repelStrength = 120;

        if (this.x < margin) {
            this.vx += repelStrength;
        } else if (this.x > this.effect.width - margin) {
            this.vx -= repelStrength;
        }
        if (this.y < margin) {
            this.vy += repelStrength;
        } else if (this.y > this.effect.height - margin) {
            this.vy -= repelStrength;
        }

        this.applyBoidsBehavior();
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

        this.vx += (separationForce.x * 0.45 + cohesionForce.x * 0.15 + alignmentForce.x * 0.7);
        this.vy += (separationForce.y * 0.45 + cohesionForce.y * 0.15 + alignmentForce.y * 0.7);
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

    repulse(centerOfMass) {
        const repulsionStrength = minMax(1, 2, this.effect.repulsionStrength);
        const repulsionRadius = minMax(400, 1600, this.effect.repulsionRadius);
        const dx = this.x - centerOfMass.x;
        const dy = this.y - centerOfMass.y;
        const distanceToCenter = Math.hypot(dx, dy);
        if (distanceToCenter < repulsionRadius) {
            const angle = Math.atan2(dy, dx);
            const force = repulsionStrength * (1 - distanceToCenter / repulsionRadius);
            this.vx += Math.cos(angle) * force;
            this.vy += Math.sin(angle) * force;
        }
        this.centerAttractionStrength = 0;
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