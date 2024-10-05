import { minMax, lerp } from './helpers.js';

const canvas = document.getElementById('canvas1');
const card = document.getElementById('card');
const ctx = canvas.getContext('2d');
canvas.width = card.clientWidth;
canvas.height = card.clientHeight;

console.log(ctx);

ctx.strokeStyle = 'white';
ctx.lineWidth = 0.5;

// const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
// gradient.addColorStop(0, 'white');
// gradient.addColorStop(0.05, 'lightblue');
// gradient.addColorStop(0.5, 'blue');
// gradient.addColorStop(0.85, 'darkblue');
// gradient.addColorStop(1, 'black');
// ctx.fillStyle = gradient;

const numberOfParticles = minMax(50, 250);
let particleRepelRadius = 20;

class Particle {
    constructor(effect) {
        this.effect = effect;
        this.size = minMax(2, 16);

        // Adjust initial position to ensure particles start away from walls
        const margin = this.size * 3;
        this.x = margin + Math.random() * (this.effect.width - margin * 2);
        this.y = margin + Math.random() * (this.effect.height - margin * 2);

        this.vx = minMax(0, 0);
        this.vy = minMax(0, 1.5);

        this.maxSpeed = 0.5; // Adjust this value to set the maximum speed
    }

    draw(context) {
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        context.fill();
    }

    update() {
        // Wall avoidance
        const margin = this.size * 2.5;
        const repelStrength = 0.5;

        // Repel from walls
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

        // Boids-like behavior
        this.applyBoidsBehavior();

        // Mouse interaction
        this.handleMouseInteraction();

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Limit speed
        this.limitSpeed();

        // Ensure particles stay within bounds
        this.x = Math.max(Math.min(this.x, this.effect.width - this.size), this.size);
        this.y = Math.max(Math.min(this.y, this.effect.height - this.size), this.size);
    }

    applyBoidsBehavior() {
        let separationForce = { x: 0, y: 0 };
        let cohesionForce = { x: 0, y: 0 };
        let alignmentForce = { x: 0, y: 0 };
        let neighborCount = 0;

        for (let other of this.effect.particles) {
            if (other === this) continue;

            const dx = this.x - other.x;
            const dy = this.y - other.y;
            const distance = Math.hypot(dx, dy);

            if (distance < this.size * 8) {
                // Separation
                separationForce.x += dx / distance;
                separationForce.y += dy / distance;
            }

            if (distance < this.size * 50) {
                // Cohesion
                cohesionForce.x += other.x;
                cohesionForce.y += other.y;

                // Alignment
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

        // Apply forces
        this.vx += (separationForce.x * 0.15 + cohesionForce.x * 0.11 + alignmentForce.x * 0.11);
        this.vy += (separationForce.y * 0.15 + cohesionForce.y * 0.11 + alignmentForce.y * 0.11);
    }

    handleMouseInteraction() {
        if (this.effect.mouse.x && this.effect.mouse.y) {
            const dx = this.x - this.effect.mouse.x;
            const dy = this.y - this.effect.mouse.y;
            const distance = Math.hypot(dx, dy);
            const mouseRadius = 80;

            if (distance < mouseRadius) {
                const angle = Math.atan2(dy, dx);
                const force = (mouseRadius - distance) / mouseRadius;
                this.vx += Math.cos(angle) * force * 0.2;
                this.vy += Math.sin(angle) * force * 0.2;
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




const repelForceSlider = document.getElementById('repelForce');
const repelForceValue = document.getElementById('repelForceValue');

repelForceSlider.addEventListener('input', function () {
    particleRepelRadius = this.value;
    repelForceValue.textContent = this.value;
});

class Effect {



    constructor(canvas) {
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.particles = [];
        this.numberOfParticles = numberOfParticles;
        this.createParticles();

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

        canvas.addEventListener('mouseleave', (event) => {
            this.mouse.x = undefined;
            this.mouse.y = undefined;
        }
        );
    }

    createParticles() {
        for (let i = 0; i < this.numberOfParticles; i++) {
            this.particles.push(new Particle(this));
        }
    }

    handleParticles(context) {
        this.connectParticles(context);
        this.particles.forEach(particle => {
            particle.draw(context);
            particle.update();
        });
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
}

let maxDistance = minMax(20, 50);
let targetDistance = maxDistance;
function updateMaxDistance() {
    targetDistance = minMax(20, 50);

    setTimeout(updateMaxDistance, 5000);
}

updateMaxDistance();


const effect = new Effect(canvas);
effect.handleParticles(ctx);



function animate() {

    // we fill a semitransparent rect each frame to fade out over time. Adjust alpha value to change the speed of the fade.

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(5, 5, 7, 0.99)';
    effect.handleParticles(ctx);
    // lerp from old maxDistance to new distance
    maxDistance += (targetDistance - maxDistance) * 0.01;
    requestAnimationFrame(animate);
}

animate();


