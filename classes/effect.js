import { minMax } from '../helpers.js';
import { randomizeParticles, maxDistance } from '../script.js';
import Particle from './particle.js';
import { randomColor } from '../helpers.js';

let currentNumberOfParticles = 0;
let isLeader = false;
export class Effect {

	constructor(
		canvas,
		numberOfParticles,
		particleSizeRange,
		particleColor,
		particleRepelRadius,
		mouseRadiusRange,
		mouseRepelRange,
		isRepellingMouse,
		isAttractedToMouse,
		hasBeenTweaked,
		isLeader,

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

	}

	createParticles() {
		for (let i = 0; i < this.numberOfParticles; i++) {
			let particle = new Particle(
				i,
				this,
				this.particleRepelRadius,
				this.size,
				this.leaderSpeedMultiplier,
				this.particleColor,
				this.mouseRadius,
				this.mouseRepelForce,
				this.repel,
				this.attract,
				this.hasBeenTweaked = false,
				this.isLeader = false,
				this.perceptionRadius,);
			this.particles.push(particle);
			currentNumberOfParticles = this.numberOfParticles;
			currentNumberOfParticles++;
			randomizeParticles(particle);
		}
	}

	handleParticles(context) {
		this.connectParticles(context);
		let leader = this.particles.find(particle => particle.isLeader);
		// console.log('leader: ' + leader + this.particles.i);


		let hasLoggedLeader = false; // Add this line before your loop

		this.particles.forEach(particle => {

			if (leader) {
				// Set the velocity of non-leader particles based on the leader's velocity
				let dx = leader.x - particle.x;
				let dy = leader.y - particle.y;
				let distance = Math.sqrt(dx * dx + dy * dy);
				// if (distance < leader.perceptionRadius) {
				// 	particle.velocityX = leader.vx;
				// 	particle.velocityY = leader.vy;
				// } else {
				// 	// Set the velocity to zero if the particle is not within the leader's perception radius
				// 	particle.velocityX = 0;
				// 	particle.velocityY = 0;
				// }
			}
			particle.draw(context);
			particle.update();
		});
	}
	tweakParticles(context) {
		// Define the min and max interval (in milliseconds)
		const minInterval = 1000; // 1 second
		const maxInterval = 2000; // 20 seconds

		// Calculate a random interval within the min-max range
		const interval = minMax(minInterval, maxInterval);

		// Set a timeout to tweak a particle after the interval
		setTimeout(() => {
			// Select a random particle
			const index = Math.floor(Math.random() * this.particles.length);
			const particle = this.particles[index];

			// // If the particle hasn't been tweaked already
			if (!particle.tweaked) {
				particle.isLeader = true;
				particle.tweaked = true;
				let tweakedPerceptionRadius = minMax(10, 45);
				particle.perceptionRadius += tweakedPerceptionRadius;
				particle.setLeader(index, particle.isLeader, particle.isTweaked, particle.color, particle.leaderSpeedMultiplier, particle.perceptionRadius);
				// particle.setLeader(index, particle.isLeader, particle.tweaked, this.particleColor, particle.leaderSpeedMultiplier, particle.perceptionRadius);
				// 	// Tweak the particle

				// 	// Mark the particle as tweaked
				// 	console.log('Tweaked particle ' + index + '!)');
			}
			if (isLeader) {
				this.color = randomColor();
				this.tweaked = true;
				this.vx = Math.random() * (maxVelocity - minVelocity) + minVelocity;
				this.vy = Math.random() * (maxVelocity - minVelocity) + minVelocity;
				if (Math.random() < 0.5) this.vx *= -1;
				if (Math.random() < 0.5) this.vy *= -1;
			} else {
				// this.color = particleColor;
				isLeader = false;
				this.tweaked = false;
				this.vx = 0;
				this.vy = 0;
			}



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
