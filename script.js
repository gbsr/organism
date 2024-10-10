import { minMax, lerp } from './helpers.js';

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ctx.strokeStyle = 'rgba(153, 3, 145, 0.95)';
ctx.strokeStyle = 'hotpink';
ctx.lineWidth = 0.015;

const numberOfParticles = minMax(900, 900);

class Particle {
    constructor(effect) {
        this.effect = effect;
        this.baseSize = minMax(2, 16);
        this.size = this.baseSize;
        this.strokeWidth = minMax(0.4, 0.8);
        this.reset();
    }

    reset() {
        const margin = this.size * 2;
        this.x = margin + Math.random() * (this.effect.width - margin * 2);
        this.y = margin + Math.random() * (this.effect.height - margin * 2);
        this.vx = minMax(-1, 0.5);
        this.vy = minMax(-1, 0.5);
        this.maxSpeed = 3;
        this.centerAttractionStrength = 0.00015;
        this.isAbsorbed = false;
        this.organismId = null;
    }

    draw(context) {
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        context.fillStyle = 'rgba(2, 2, 2, 0.12)';
        // context.fillStyle = 'rgba(2, 1, 1, 0.25)';
        // context.fillStyle = 'rgba(2, 1, 1, 0.25)';
        // context.fillStyle = 'black';
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

        if (!isPulsing && this.centerAttractionStrength < 0.05) {
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
        const repelStrength = 80;

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

            if (distance < this.size * 4) {
                separationForce.x += dx / distance;
                separationForce.y += dy / distance;
            }

            if (distance < this.size * 40) {
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

        this.vx += (separationForce.x * 0.6 + cohesionForce.x * 0.4 + alignmentForce.x * 0.4);
        this.vy += (separationForce.y * 0.6 + cohesionForce.y * 0.4 + alignmentForce.y * 0.4);
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

class Effect {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.particles = [];
        this.numberOfParticles = numberOfParticles;
        this.repulsionStrength = 4;
        this.repulsionRadius = 800;
        this.createParticles();
        this.absorptionThreshold = 0.95;
        this.pulseDuration = 2000;
        this.pulseInterval = 500;
        this.lastPulseTime = 0;
        this.minTimeBetweenPulses = 10000;
        this.isPulsing = false;
        this.organisms = [];
        this.organismRadius = 200;

        this.mouse = {
            x: 0,
            y: 0,
            size: 50
        };

        canvas.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = event.clientX - rect.left;
            this.mouse.y = event.clientY - rect.top;
        });

        canvas.addEventListener('mouseleave', () => {
            this.mouse.x = undefined;
            this.mouse.y = undefined;
        });
    }

    createParticles() {
        for (let i = 0; i < this.numberOfParticles; i++) {
            this.particles.push(new Particle(this));
        }
    }

    identifyOrganisms() {
        this.organisms = [];
        const unclustered = new Set(this.particles);

        while (unclustered.size > 0) {
            const seed = unclustered.values().next().value;
            const cluster = this.growCluster(seed, unclustered);
            if (cluster.size > 5) {
                const organismData = this.calculateOrganismData(cluster);
                this.organisms.push(organismData);
                for (const particle of cluster) {
                    particle.organismId = this.organisms.length - 1;
                }
            }
        }
    }

    growCluster(seed, unclustered) {
        const cluster = new Set([seed]);
        const queue = [seed];
        unclustered.delete(seed);

        while (queue.length > 0) {
            const particle = queue.shift();
            for (const other of unclustered) {
                if (this.distance(particle, other) <= this.organismRadius) {
                    cluster.add(other);
                    queue.push(other);
                    unclustered.delete(other);
                }
            }
        }

        return cluster;
    }

    distance(p1, p2) {
        return Math.hypot(p1.x - p2.x, p1.y - p2.y);
    }

    calculateOrganismData(cluster) {
        let totalX = 0, totalY = 0, totalMass = 0;
        let absorbedCount = 0;

        for (const particle of cluster) {
            totalX += particle.x * particle.size;
            totalY += particle.y * particle.size;
            totalMass += particle.size;
            if (particle.isAbsorbed) absorbedCount++;
        }

        return {
            centerOfMass: {
                x: totalX / totalMass,
                y: totalY / totalMass
            },
            particles: Array.from(cluster),
            absorbedRatio: absorbedCount / cluster.size,
            lastPulseTime: 0,
            isPulsing: false
        };
    }

    handleParticles(context) {
        this.identifyOrganisms();

        this.organisms.forEach((organism, index) => {
            const currentTime = Date.now();
            const timeSinceLastPulse = currentTime - organism.lastPulseTime;

            if (organism.absorbedRatio >= this.absorptionThreshold && timeSinceLastPulse > this.minTimeBetweenPulses) {
                this.triggerPulse(organism, currentTime);
            }

            organism.particles.forEach(particle => {
                particle.draw(context);
                particle.update(organism.isPulsing, organism.centerOfMass);
            });

            if (organism.isPulsing && currentTime - organism.lastPulseTime > this.pulseDuration) {
                organism.isPulsing = false;
            }
        });

        this.connectParticles(context);
    }

    connectParticles(context) {
        for (let a = 0; a < this.particles.length; a++) {
            for (let b = a; b < this.particles.length; b++) {
                const dx = this.particles[a].x - this.particles[b].x;
                const dy = this.particles[a].y - this.particles[b].y;
                const distance = Math.hypot(dx, dy);

                if (distance < maxDistance) {
                    const opacity = 1 - (distance / maxDistance);
                    context.save();
                    const strokeWidth = 2 - (distance / maxDistance);
                    context.globalAlpha = opacity;
                    context.beginPath();
                    context.moveTo(this.particles[a].x, this.particles[a].y);
                    context.lineTo(this.particles[b].x, this.particles[b].y);
                    context.stroke();
                    context.lineWidth = strokeWidth;
                    context.restore();
                }
            }
        }
    }

    triggerPulse(organism, currentTime) {
        organism.isPulsing = true;
        organism.lastPulseTime = currentTime;
        const maxDistance = Math.max(this.width, this.height) / 2;

        organism.particles.forEach(particle => {
            const dx = particle.x - organism.centerOfMass.x;
            const dy = particle.y - organism.centerOfMass.y;
            const distance = Math.hypot(dx, dy);
            const angle = Math.atan2(dy, dx);

            const force = 10 * (1 - Math.min(distance, maxDistance) / maxDistance);

            particle.vx = Math.cos(angle) * force * particle.maxSpeed;
            particle.vy = Math.sin(angle) * force * particle.maxSpeed;

            particle.vx += (Math.random() - 0.5) * 2;
            particle.vy += (Math.random() - 0.5) * 2;

            particle.centerAttractionStrength = 0;
        });
    }
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    effect.width = canvas.width;
    effect.height = canvas.height;
    effect.createParticles();
});

let maxDistance = minMax(2, 80);
let targetDistance = maxDistance;

function updateMaxDistance() {
    targetDistance = minMax(5, 50);
    setTimeout(updateMaxDistance, 500);
}

updateMaxDistance();

const effect = new Effect(canvas);

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.99)';
    effect.handleParticles(ctx);
    maxDistance += (targetDistance - maxDistance) * 0.01;
    requestAnimationFrame(animate);
}

animate();