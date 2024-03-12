import { minMax, lerp } from './helpers.js';

const canvas = document.getElementById('canvas1');
const card = document.getElementById('card');
const ctx = canvas.getContext('2d');
canvas.width = card.clientWidth;
canvas.height = card.clientHeight;

console.log(ctx);

ctx.strokeStyle = 'white';
ctx.lineWidth = 3;

// const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
// gradient.addColorStop(0, 'white');
// gradient.addColorStop(0.05, 'lightblue');
// gradient.addColorStop(0.5, 'blue');
// gradient.addColorStop(0.85, 'darkblue');
// gradient.addColorStop(1, 'black');
// ctx.fillStyle = gradient;

const numberOfParticles = minMax(40, 40);
let particleRepelRadius = 10;

class Particle {
	constructor(effect) {
		this.effect = effect;
		this.size = minMax(4, 15);


		/**
		 * Generate random x and y coordinates within the bounds of the effect, offset
		 * by the particle size. This positions particles randomly within the effect area.
		 */
		this.x = this.size + Math.random() * (this.effect.width - this.size * 2);
		this.y = this.size + Math.random() * (this.effect.height - this.size * 2);

		this.vx = minMax(0, 0);
		this.vy = minMax(0, 0);

	}


	/**
	 * Draws the particle on the canvas by creating a path and arc
	 * representing the particle's position and size.
	 */

	draw(context) {
		context.beginPath();
		context.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
		context.fill();
	}



	update() {

		const mouseRadius = minMax(100, 180);
		const mouseRepelForce = 8;



		// let particleRepelRadius = repelForceValue.value;

		// Repel from mouse
		if (this.effect.mouse.x > 0 && this.effect.mouse.x < this.effect.width &&
			this.effect.mouse.y > 0 && this.effect.mouse.y < this.effect.height) {
			const dx = this.x - this.effect.mouse.x;
			const dy = this.y - this.effect.mouse.y;
			const distance = Math.hypot(dx, dy);

			if (distance < mouseRadius) {
				const angle = Math.atan2(dy, dx);
				const repelX = mouseRepelForce * Math.cos(angle);
				const repelY = mouseRepelForce * Math.sin(angle);
				this.x += repelX;
				this.y += repelY;
			}
		}

		// Boids-like behavior
		for (let other of this.effect.particles) {
			if (other === this) continue; // Don't interact with self

			const dx = this.x - other.x;
			const dy = this.y - other.y;
			const distance = Math.hypot(dx, dy);

			// Separation: repel when too close
			let separationRadius = this.size + other.size * particleRepelRadius;
			if (distance < separationRadius) {
				const angle = Math.atan2(dy, dx);
				this.x += Math.cos(angle);
				this.y += Math.sin(angle);
			}

			// Cohesion: attract when too far
			let cohesionRadius = this.size + other.size * 16;
			if (distance > cohesionRadius) {
				const angle = Math.atan2(dy, dx);
				this.x -= Math.cos(angle);
				this.y -= Math.sin(angle);
			}

			// Alignment: match velocity of nearby particles
			let alignmentRadius = this.size + other.size * 2;
			if (distance < alignmentRadius) {
				this.vx += (other.vx - this.vx) * 2;
				this.vy += (other.vy - this.vy) * 2;
			}
		}

		// Move towards mouse
		if (this.effect.mouse.x > 0 && this.effect.mouse.x < this.effect.width) {

			const offsetX = minMax(0, 0);
			const offsetY = minMax(0, 0);
			const speed = minMax(0.02, 0.025);
			this.x = lerp(this.x, this.effect.mouse.x + offsetX, speed);
			this.y = lerp(this.y, this.effect.mouse.y + offsetY, speed);
		}

		this.x += this.vx;
		this.y += this.vy;

		// Bounce off edges
		if (this.x > this.effect.width - this.size || this.x < this.size) {
			this.vx *= -1;
		}

		if (this.y > this.effect.height - this.size || this.y < this.size) {
			this.vy *= -1;
		}
		this.x = Math.max(Math.min(this.x, this.effect.width - this.size), this.size);
		this.y = Math.max(Math.min(this.y, this.effect.height - this.size), this.size);


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
			size: 15
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


