import { minMax } from './helpers/helpers.js';
import { randomizeParticles, maxDistance, perceptionRadius, separationForce } from '../script.js';
import Particle from './particle.js';
import { randomColor } from './helpers/helpers.js';

let currentNumberOfParticles = 0;
const minInterval = 1000; // 1 second
const maxInterval = 5000; // 20 seconds
const interval = minMax(minInterval, maxInterval);
const randomParticleColor = randomColor();

export class Effect {

	constructor(
		canvas,
		numberOfParticles,
		particleSizeRange,
		particleRepelRadius,
		particleColor,
		mouseRadiusRange,
		mouseRepelRange,
		isRepellingMouse,
		isAttractedToMouse,
		hasBeenTweaked,
		isLeader,
		perceptionRadius,

	) {
		this.canvas = canvas;
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.particles = [];
		this.numberOfParticles = numberOfParticles;
		this.particleColor = particleColor;
		this.particleRepelRadius = particleRepelRadius;
		this.repel = isRepellingMouse;
		this.size = minMax(particleSizeRange[0], particleSizeRange[1]);
		this.mouseRadius = minMax(mouseRadiusRange[0], mouseRadiusRange[1]);
		this.mouseRepelForce = minMax(mouseRepelRange[0], mouseRepelRange[1]);
		this.attract = isAttractedToMouse;
		this.tweaked = hasBeenTweaked;
		this.isLeader = isLeader;
		this.perceptionRadius = perceptionRadius;
		this.tweakParticlesCalled = false;
		this.createParticles();
		this.tweakParticles();

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
		console.log('Effect constructor perceptionRadius:', perceptionRadius);
	}

	createParticles() {
		console.log('this particleColor:', this.particleColor);
		console.log('this random particle color:', randomParticleColor);
		for (let i = 0; i < this.numberOfParticles; i++) {
			let particle = new Particle(
				false,
				false,
				i,
				this.leaderSpeedMultiplier,
				this.perceptionRadius,
				this,
				this.particleRepelRadius,
				this.size,
				this.particleColor,
				this.randomParticleColor = randomParticleColor,
				this.mouseRadius,
				this.repel,
				this.mouseRepelForce,
				this.attract,
				this.separationForce = separationForce,
			);
			this.particles.push(particle);
			currentNumberOfParticles = this.numberOfParticles;
			currentNumberOfParticles++;
			randomizeParticles(particle);
		}
		for (let i = 0; i < this.particles.length; i++) {
			this.particles[i].update(this.particles);
		}
	}

	handleParticles(context, respawn) {
		this.context = context;
		if (respawn) {
			this.particles = [];
			this.createParticles();
		}

		this.connectParticles(context);

		this.particles.forEach(particle => {


			particle.draw(context);
			particle.update(this.particles);
		});
	}
	tweakParticles(context) {

		const index = Math.floor(Math.random() * this.particles.length);
		const particle = this.particles[index];

		// Set a timeout to tweak a particle after the interval
		// Select a random particle
		setTimeout(() => {
			particle.mutate(this.context);
			particle.perceptionRadius = perceptionRadius;
			particle.minVelocity = 0.2;
			particle.maxVelocity = 0.5;
			particle.size = particle.size + 0.25;


			// Call this function again to set up the next tweak
			this.tweakParticles(context);
		}, interval);
	}

	connectParticles(context) {
		if (!context) {
			return;
		}

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
