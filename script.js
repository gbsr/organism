const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth / 2;
canvas.height = window.innerHeight / 2;

console.log(ctx);

ctx.fillStyle = '#c7444a';

const radius = 5;
const numberOfParticles = 30;

class Particle {
	constructor(effect) {
		this.effect = effect;
		this.x = Math.random() * this.effect.width;
		this.y = Math.random() * this.effect.height;
		this.radius = radius;
	}
	/**
	 * Draws the particle on the canvas by creating a path and arc
	 * representing the particle's position and radius.
	 */

	draw(context) {
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		context.fill();
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
		});
	}
}
const effect = new Effect(canvas);
console.log(effect);
effect.handleParticles(ctx);


function animate() {

}


