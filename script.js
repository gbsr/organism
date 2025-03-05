import { minMax } from './helpers.js';

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


function getRandomBrightColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 30) + 70; // 70-100%
  const lightness = Math.floor(Math.random() * 30) + 50; // 50-80%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

ctx.strokeStyle = getRandomBrightColor();
ctx.lineWidth = 1;

const numberOfParticles = minMax(450, 650);

class Particle {
  constructor(effect) {
    this.effect = effect;
    this.baseSize = minMax(0.25, 8);
    this.size = this.baseSize;
    this.strokeWidth = 1;
    this.reset();
  }

  draw(context) {
    context.beginPath();
    // context.arc(this.x, this.y, this.size, 0, 8 * Math.PI);
    // context.fillStyle = 'rgba(2, 2, 2, 0.52)';
    // context.fill();
  }

  update() {

  
    this.x += this.vx;
    this.y += this.vy;

    this.limitSpeed();

    this.x = Math.max(Math.min(this.x, this.effect.width - this.size), this.size);
    this.y = Math.max(Math.min(this.y, this.effect.height - this.size), this.size);

    if (!isPulsing && this.centerAttractionStrength < 0.01) {
      this.centerAttractionStrength += 0.1;
    }
  }

  applyForces(centerOfMass) {
    const dx = centerOfMass.x - this.x;
    const dy = centerOfMass.y - this.y;
    const distanceToCenter = Math.hypot(dx, dy);

    this.vx += (dx / distanceToCenter) * this.centerAttractionStrength;
    this.vy += (dy / distanceToCenter) * this.centerAttractionStrength;

    const margin = this.size * 2.5;

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
    let separationForce = { x: 1, y: 1 };
    let cohesionForce = { x: 0, y: 0 };
    let alignmentForce = { x: 0, y: 0 };
    let neighborCount = 0;

    for (let other of this.effect.particles) {
      if (other === this || other.organismId !== this.organismId) continue;

      const dx = this.x - other.x;
      const dy = this.y - other.y;
      const distance = Math.hypot(dx, dy);

      if (distance < this.size * (minMax(6.75, 8.8))) {
        separationForce.x += dx / distance;
        separationForce.y += dy / distance;
      }

      if (distance < this.size * 200) {
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

    this.vx += (separationForce.x * 0.25 + cohesionForce.x * 0.5 + alignmentForce.x * 0.17);
    this.vy += (separationForce.y * 0.25 + cohesionForce.y * 0.5 + alignmentForce.y * 0.17);
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

class Effect {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.particles = [];
    this.numberOfParticles = numberOfParticles;
    this.createParticles();
    this.organisms = [];

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

  
  distance(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }

  handleParticles(context) {
    this.identifyOrganisms();

    this.organisms.forEach((organism) => {


      organism.particles.forEach(particle => {
        particle.draw(context);
      });

    });

    this.connectParticles(context);
  }

  // connectParticles(context) {
  //   for (let a = 0; a < this.particles.length; a++) {
  //     for (let b = a; b < this.particles.length; b++) {
  //       const dx = this.particles[a].x - this.particles[b].x;
  //       const dy = this.particles[a].y - this.particles[b].y;
  //       const distance = Math.hypot(dx, dy);

  //       if (distance < maxDistance) {
  //         const strokeWidth = 1;
  //         context.beginPath();
  //         context.moveTo(this.particles[a].x, this.particles[a].y);
  //         context.lineTo(this.particles[b].x, this.particles[b].y);
  //         context.lineWidth = strokeWidth;
  //         context.stroke();
  //       }
  //     }
  //   }
  // }

  
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  effect.width = canvas.width;
  effect.height = canvas.height;
  effect.createParticles();
});

let maxDistance = minMax(2, 20);

const effect = new Effect(canvas);

function animate() {
  effect.handleParticles(ctx);
  requestAnimationFrame(animate);
}

animate();