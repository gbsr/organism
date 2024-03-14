import { minMax } from '../helpers.js';
import { randomizeParticles, maxDistance } from '../script.js';
import Particle from './particle.js';

let currentNumberOfParticles = 0;
export class Effect {


	constructor(canvas, numberOfParticles, particleSize, particleColor, particleRepelRadius) {
		this.canvas = canvas;
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.particles = [];
		this.numberOfParticles = numberOfParticles;
		this.size = particleSize;
		this.particleColor = particleColor;
		this.particleRepelRadius = particleRepelRadius;
		this.createParticles();
		console.log('This is how I was constructed: ' + this.numberOfParticles + ' : ' + this.size + ' : ' + this.particleColor + ' : ' + this.particleRepelRadius);

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
			let newParticle = new Particle(this, this.particleRepelRadius, this.size, this.particleColor);
			this.particles.push(newParticle);
			currentNumberOfParticles = this.numberOfParticles;
			currentNumberOfParticles++;
			randomizeParticles(newParticle);
		}
	}

	handleParticles(context) {
		this.connectParticles(context);
		this.particles.forEach(particle => {
			particle.velocityX = minMax(-0.1, 0.1);
			particle.velocityY = minMax(-0.1, 0.1);
			// console.log('new particle speed:' + particle.velocityX + '' + particle.velocityY);
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
