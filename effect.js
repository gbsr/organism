import { Particle } from './particle.js';
import { minMax } from './helpers.js';

export class Effect {
    constructor(canvas, ctx, numberOfParticles) {
        this.canvas = canvas;
        this.ctx = ctx;
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
        this.minTimeBetweenPulses = 1000;
        this.isPulsing = false;
        this.organisms = [];
        this.organismRadius = 200;

        this.mouse = {
            x: 0,
            y: 0,
            size: 50
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = event.clientX - rect.left;
            this.mouse.y = event.clientY - rect.top;
        });

        this.canvas.addEventListener('mouseleave', () => {
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
            if (cluster.size > 50) {
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

    handleParticles(maxDistance) {
        this.identifyOrganisms();

        this.organisms.forEach((organism) => {
            const currentTime = Date.now();
            const timeSinceLastPulse = currentTime - organism.lastPulseTime;

    
            organism.particles.forEach(particle => {
                particle.draw(this.ctx);
                particle.update();
            });
        });

        this.connectParticles(maxDistance);
    }

    connectParticles(maxDistance) {
        for (let a = 0; a < this.particles.length; a++) {
            for (let b = a; b < this.particles.length; b++) {
                const dx = this.particles[a].x - this.particles[b].x;
                const dy = this.particles[a].y - this.particles[b].y;
                const distance = Math.hypot(dx, dy);

                if (distance < maxDistance) {
                    const opacity = 1 - (distance / maxDistance);
                    this.ctx.save();
                    const strokeWidth = 0.75 - (distance / maxDistance);
                    this.ctx.globalAlpha = opacity;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[a].x, this.particles[a].y);
                    this.ctx.lineTo(this.particles[b].x, this.particles[b].y);
                    this.ctx.stroke();
                    this.ctx.lineWidth = strokeWidth;
                    this.ctx.restore();
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

            const force = 40 * (1 - Math.min(distance, maxDistance) / maxDistance);

            particle.vx = Math.cos(angle) * force * particle.maxSpeed;
            particle.vy = Math.sin(angle) * force * particle.maxSpeed;

            particle.vx += (Math.random() - 0.5) * 2;
            particle.vy += (Math.random() - 0.5) * 2;

            particle.centerAttractionStrength = 0;
        });
    }
}