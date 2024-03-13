import { minMax, lerp, setupSlider, setupButton, setupCheckbox } from './helpers.js';

const canvas = document.getElementById('canvas1');
const card = document.getElementById('card');
const ctx = canvas.getContext('2d');
let alpha = 0.15;
const mouseAttractOffsetX = minMax(-0.2, 0.2);
const mouseAttractOffsetY = minMax(-0.3, 0.24);
const mouseAttractSpeed = minMax(0.2, 0.4);

canvas.width = card.clientWidth;
canvas.height = card.clientHeight;
ctx.strokeStyle = 'white';
ctx.lineWidth = minMax(1, 3);

let numberOfParticles = minMax(250, 350);
let unrest = 0;
let particleRepelRadius = 2;
let particleSizes = minMax(1, 2);
let maxDistance = minMax(5, 15);
let evolution = 2;

let particleColor = 'rgba(5, 7, 9, 0.5)';

let paintParticle = true;
let paintConnections = true;
let repelMouse = true;
let attractToMouse = true;

let targetDistance = maxDistance;
let currentNumberOfParticles = 0;

// Setup sliders
const particleAmountSlider = document.getElementById('particleAmount');
particleAmountSlider.value = numberOfParticles;
setupSlider(particleAmountSlider, value => numberOfParticles = parseInt(value));

const repelForceSlider = document.getElementById('repelForce');
repelForceSlider.value = particleRepelRadius;
setupSlider(repelForceSlider, value => particleRepelRadius = parseFloat(value));

const unrestSlider = document.getElementById('unrest');
unrestSlider.value = unrest;
setupSlider(unrestSlider, value => unrest = parseFloat(value));

const evolveSlider = document.getElementById('evolution');
evolveSlider.value = evolution;
setupSlider(evolveSlider, value => evolution = parseFloat(value));

const alphaSlider = document.getElementById('alpha');
alphaSlider.value = alpha;
setupSlider(alphaSlider, value => alpha = parseFloat(value));
console.log('alpha', alpha);

const attractToMouseCheckbox = document.getElementById('attractToMouse');
attractToMouseCheckbox.checked = attractToMouse;
setupCheckbox(attractToMouseCheckbox, checked => attractToMouse = checked);

const repelMouseCheckbox = document.getElementById('repelMouse');
repelMouseCheckbox.checked = repelMouse;
setupCheckbox(repelMouseCheckbox, checked => repelMouse = checked);

const randomizeButton = document.getElementById('randomize');
const saveButton = document.getElementById('save');
// TODO: Implement the rest of these
const particleSizeSlider = document.getElementById('particleSize');
const paintParticleCheckbox = document.getElementById('paintParticle');
const paintConnectionsCheckbox = document.getElementById('paintConnections');

const particleColorInput = document.getElementById('particleColor');
// Setup buttons
setupButton(randomizeButton, function () {
	for (let particle of effect.particles) {
		console.log('' + particle.size);
		randomizeParticles(particle);
	}
});
setupButton(saveButton, function () {
	const settings = {
		numberOfParticles: numberOfParticles,
		particleRepelRadius: particleRepelRadius,
		unrest: unrest,
		evolution: evolution,
		alpha: alpha
	};

	const date = new Date();
	const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
	const settingsJson = JSON.stringify(settings);

	localStorage.setItem(dateString, settingsJson);
});

class Particle {
	/**
	 * Constructor for Particle class
	 * @param {Object} effect - The effect object this particle belongs to
	 * Initializes particle properties including:
	 * - effect: The effect this particle belongs to
	 * - size: Random size between min and max particle size
	 * - x: Random x position based on effect dimensions
	 * - y: Random y position based on effect dimensions
	 */
	constructor(effect) {
		this.effect = effect;
		this.size = particleSizes;

		this.x = this.size + Math.random() * (this.effect.width - this.size * 2);
		this.y = this.size + Math.random() * (this.effect.height - this.size * 2);
	}

	/**
	 * Draws the particle on the canvas
	 * @param {CanvasRenderingContext2D} context - The canvas context
	 */
	draw(context) {
		context.beginPath();
		context.arc(this.x, this.y, this.size, 0, 2 * Math.PI);

		if (paintParticle) {
			context.fillStyle = particleColor;
			context.fill();
		}
	}


	update() {

		const mouseRadius = minMax(40, 120);
		const mouseRepelForce = 8;

		/**
		 * Creates new particles and adds them to the effect's particles array
		 * until the number of particles reaches the target numberOfParticles.
		 *
		 * Removes particles from the end of the effect's particles array
		 * until the number of particles reaches the target numberOfParticles.
		 * Control with Particles Slider
		 */
		this.handlePopulation();

		// Repel from mouse

		if (repelMouse) this.repelMouse(mouseRadius, mouseRepelForce);

		// Boids-like behavior
		for (let other of this.effect.particles) {
			if (other === this) continue; // Don't interact with self

			const dx = this.x - other.x;
			const dy = this.y - other.y;
			const distance = Math.hypot(dx, dy);

			// Separation: repel when too close
			this.boidSeparate(other, distance, dy, dx, evolution / 2);
		}
		// updates transition with linear interpolation
		if (this.transitionProgress !== undefined) {
			const lerpFactor = 0.5; // Adjust this value to change the speed of the transition
			this.transitionProgress += lerpFactor;
			if (this.transitionProgress >= 1) {
				// The transition is complete
				this.x = this.targetX;
				this.y = this.targetY;
				this.transitionProgress = undefined;
			} else {
				// The transition is in progress
				this.x = lerp(this.x, this.targetX, this.transitionProgress);
				this.y = lerp(this.y, this.targetY, this.transitionProgress);
			}
		}

		// Move towards mouse
		if (attractToMouse) this.moveToMouse(mouseAttractSpeed, mouseAttractOffsetX, mouseAttractOffsetY);

		this.velocityX = minMax(-0.1, 0.1) * 0.5;
		this.velocityY = minMax(-0.1, 0.1) * 0.5;
		this.y += this.velocityY + minMax(-0.05, 0.05);
		this.x += this.velocityX + minMax(-0.05, 0.05);

		// Bounce off edges
		if (this.x > this.effect.width - this.size || this.x < this.size) {
			this.velocityX *= -1;
		}

		if (this.y > this.effect.height - this.size || this.y < this.size) {
			this.velocityY *= -1;
		}
		this.x = Math.max(Math.min(this.x, this.effect.width - this.size), this.size);
		this.y = Math.max(Math.min(this.y, this.effect.height - this.size), this.size);
	}

	moveToMouse(mouseAttractOffsetX, mouseAttractOffsetY, mouseAttractSpeed) {
		if (this.effect.mouse.x > 0 && this.effect.mouse.x < this.effect.width) {
			const targetX = this.effect.mouse.x + mouseAttractOffsetX;
			const targetY = this.effect.mouse.y + mouseAttractOffsetY;
			const distance = Math.sqrt(Math.pow(targetX - this.x, 2) + Math.pow(targetY - this.y, 2));
			const lerpFactor = mouseAttractSpeed / distance;
			this.x = lerp(this.x, targetX, lerpFactor);
			this.y = lerp(this.y, targetY, lerpFactor);
		}
	}
	boidSeparate(other, distance, dy, dx) {
		let separationRadius = this.size + other.size * particleRepelRadius;
		if (distance < separationRadius) {
			const angle = Math.atan2(dy, dx);
			this.targetX = this.x + Math.cos(angle) * evolution;
			this.targetY = this.y + Math.sin(angle) * evolution;
			this.transitionProgress = 0; // Start the transition
		}
	}
	repelMouse(mouseRadius, mouseRepelForce) {
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
	}

	handlePopulation() {
		while (currentNumberOfParticles < numberOfParticles) {
			currentNumberOfParticles++;
			let newParticle = new Particle(this.effect);
			newParticle.x = Math.random() * this.effect.width;
			newParticle.y = Math.random() * this.effect.height;
			this.effect.particles.size = particleSizes;
			this.effect.particles.push(newParticle);
		}

		while (numberOfParticles < currentNumberOfParticles) {
			currentNumberOfParticles--;
			this.effect.particles.pop();
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
			let newParticle = new Particle(this);
			this.particles.push(newParticle);
			currentNumberOfParticles++;
			randomizeParticles(newParticle);
		}
	}

	handleParticles(context) {
		this.connectParticles(context);
		this.particles.forEach(particle => {
			particle.velocityX = minMax(-0.1, 0.1) * unrest * 0.1;
			particle.velocityY = minMax(-0.1, 0.1) * unrest * 0.1;
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
const effect = new Effect(canvas);
addEventListeners();
updateMaxDistance();
effect.handleParticles(ctx);
animate();
function animate() {
	let fillColor = `rgba(77, 77,77, ${alpha})`;
	console.log('alpha adj:' + alpha);
	// we fill a semitransparent rect each frame to fade out over time. Adjust alpha value to change the mouseAttractSpeed of the fade.
	ctx.fillStyle = fillColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	effect.handleParticles(ctx);
	// lerp from old maxDistance to new distance
	maxDistance += (targetDistance - maxDistance) * 0.0001;
	requestAnimationFrame(animate);
}
function addEventListeners() {

}

function randomizeParticles(particle) {
	let particleSizes = minMax(1, 14);
	particle.size = particleSizes;
}

function updateMaxDistance() {
	targetDistance = minMax(50, 150);

	setTimeout(updateMaxDistance, 5000);
}


