import { minMax } from './helpers.js';

const canvas = document.getElementById('canvas1');
const card = document.getElementById('card');
const ctx = canvas.getContext('2d');
canvas.width = card.clientWidth;
canvas.height = card.clientHeight;

console.log(ctx);

ctx.fillStyle = '#c7444a';
ctx.strokeStyle = '#1e1e1e';
ctx.lineWidth = 4;

const numberOfParticles = minMax(100, 200);

class Particle {
	constructor(effect) {
		this.effect = effect;
		this.radius = minMax(4, 10);
		this.saturation = (this.radius - 4) / (10 - 4) * 100; // Calculate saturation based on radius


		this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
		this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);

		this.vx = minMax(0.25, 1);
		this.vy = minMax(0.1, 2);
	}


	/**
	 * Draws the particle on the canvas by creating a path and arc
	 * representing the particle's position and radius.
	 */

	draw(context) {
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		context.fillStyle = `hsl(0, ${this.saturation}%, 35%)`;
		context.fill();
		context.stroke();
	}

	update() {
		this.x += this.vx;
		this.y += this.vy;

		if (this.x > this.effect.width - this.radius || this.x < this.radius) {
			this.vx *= -1;
		}

		if (this.y > this.effect.height - this.radius || this.y < this.radius) {
			this.vy *= -1;
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


	}

	createParticles() {
		for (let i = 0; i < this.numberOfParticles; i++) {
			this.particles.push(new Particle(this));
		}
	}

	handleParticles(context) {
		this.particles.forEach(particle => {
			particle.draw(context);
			particle.update();
		});
	}

}

const effect = new Effect(canvas);
console.log(effect);
effect.handleParticles(ctx);


function animate() {

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	effect.handleParticles(ctx);
	requestAnimationFrame(animate);
}

animate();


