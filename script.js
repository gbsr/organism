const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth / 2;
canvas.height = window.innerHeight / 2;

console.log(ctx);

ctx.fillStyle = '#c7444a';
ctx.strokeStyle = '#1e1e1e';
ctx.lineWidth = 4;

const radius = 10;
const numberOfParticles = 300;

class Particle {
	constructor(effect) {
		this.effect = effect;
		this.radius = radius;


		/**
		 * Initializes the x and y coordinates of the particle instance
		 * by generating a random value within the bounds of the effect area,
		 * offset by the particle's radius. This evenly distributes the particles
		 * within the effect area.
		 */
		this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
		this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);
	}


	/**
	 * Draws the particle on the canvas by creating a path and arc
	 * representing the particle's position and radius.
	 */

	draw(context) {
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		context.fill();
		context.stroke();
	}

	update() {
		this.x += Math.random() * 2 - 1;
		this.y += Math.random() * 2 - 1;
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


