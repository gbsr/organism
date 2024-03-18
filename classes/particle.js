// import AttractMouse from '../components/attractMouse.js';
import handleSteeringBehaviour from '../components/steeringBehaviour.js';
import { separationForce } from '../script.js';
import { maxVelocity, minVelocity, maxAcceleration, mutatedMaxVelocity, mutatedMinVelocity, numberOfParticles, particleColor } from '../script.js';

// TODO: slider 1 - 1000;

let canvas = document.getElementById('canvas1');
let context = canvas.getContext('2d');
let debug = false;
class Particle {
	static debug = debug;
	/**
	 * Particle class constructor.
	 * Initializes a particle instance with provided parameters.
	 */

	constructor(
		isMutated,
		hasBeenTweaked,
		id,
		leaderSpeedMultiplier,
		perceptionRadius,
		effect,
		particleRepelRadius,
		particleSize,
		particleColor,
		randomParticleColor,
		mouseRadius,
		mouseRepel,
		isRepellingMouse,
		isAttractedToMouse,
	) {
		this.isMutated = isMutated,
			this.tweaked = hasBeenTweaked;
		this.id = id;
		this.leaderSpeedMultiplier = leaderSpeedMultiplier;
		this.perceptionRadius = perceptionRadius;
		this.effect = effect;
		this.particleRepelRadius = particleRepelRadius;
		this.size = particleSize;
		this.color = particleColor;
		this.randomParticleColor = randomParticleColor;
		this.mouseRadius = mouseRadius;
		this.mouseRepelForce = mouseRepel;
		this.repel = isRepellingMouse;
		this.attract = isAttractedToMouse;
		this.minVelocity = minVelocity;
		this.maxVelocity = maxVelocity;
		this.maxAcceleration = maxAcceleration;
		this.separationForce = separationForce;
		this.particles = [],
			this.InitRandomPositions();
		this.InitVelocities();
		this.mutate = this.mutate.bind(this);
		this.debug = debug;
	}

	/**
	 * Generate random x and y coordinates within the bounds of the effect, offset
	 * by the particle size. This positions particles randomly within the effect area.
	*/
	InitRandomPositions() {
		this.x = this.size + Math.random() * (this.effect.width - this.size * 2);
		this.y = this.size + Math.random() * (this.effect.height - this.size * 2);
	}

	/**
	 * Initializes random x and y velocity components within the
	 * minVelocity and maxVelocity range. This gives each particle
	 * a random initial velocity.
	 */
	InitVelocities() {
		this.vx = Math.random() * (maxVelocity - minVelocity) + minVelocity + 0.01;
		this.vy = Math.random() * (maxVelocity - minVelocity) + minVelocity + 0.01;

		/**
		 * Randomly negate the x and y velocity components.
		 * This gives each particle a random initial direction.
		 */
		if (Math.random() < 0.5) this.vx *= -1;
		if (Math.random() < 0.5) this.vy *= -1;
	}

	update(particles) {
		if (this.isMutated) {
			this.color = this.randomParticleColor;
		}
		handleSteeringBehaviour(this, particles, context);
		this.handleEdgeDetection();
	}

	/**
	 * Draws the particle on the canvas.
	 * Begins a new path, draws a circle at the particle's x,y position with its size.
	 * Fills the circle with the particle's color.
	*/
	draw(context) {
		if (!context) return;
		context.beginPath();
		context.arc(this.x, this.y, this.size, 0, 2 * Math.PI);

		if (this.isMutated) {
			context.fillStyle = this.randomParticleColor;
		} else {
			context.fillStyle = this.color;
		}
		context.fill();

		// draw debugCircle for perceptionRadius
		if (this.debug) {
			context.save();
			context.beginPath();
			context.lineWidth = 1;
			context.arc(this.x, this.y, this.perceptionRadius, 0, Math.PI * 2);
			// console.log('perceptionRadius in debug: ' + this.perceptionRadius);
			context.strokeStyle = 'red'; // Change this to any color you want for the debug circle
			context.stroke();
			context.restore();
		}
	}


	/**
	 * Handles detecting when the particle reaches the edge of the canvas.
	 * Checks if the particle is within a buffer distance of the edge.
	 * If so, reverses the x or y velocity to bounce the particle.
	 * Also ensures the position remains within the canvas bounds.
	 */
	handleEdgeDetection() {
		const buffer = 2;

		// Bounce off edges
		if (this.x > this.effect.width - this.size - buffer || this.x < this.size + buffer) {
			this.vx *= -1;
		}

		if (this.y > this.effect.height - this.size - buffer || this.y < this.size + buffer) {
			this.vy *= -1;
		}

		// Ensure position stays within bounds
		this.x = Math.max(Math.min(this.x, this.effect.width - this.size - buffer), this.size + buffer);
		this.y = Math.max(Math.min(this.y, this.effect.height - this.size - buffer), this.size + buffer);
	}

	// randomly mutate a particle for further manipulation later on
	mutate(context) {
		this.isMutated = true;
		this.color = this.randomParticleColor;
		this.particleColor = 'red';
		console.log('mutated!');
		this.debug = false;
		this.maxVelocity = mutatedMaxVelocity;
		this.minVelocity = mutatedMinVelocity;
		// Add a velocity boost
		// let speed = 20; // Change this to the speed you want
		let angle = Math.random() * Math.PI * 2; // Random direction
		this.vx = Math.cos(angle);
		this.vy = Math.sin(angle);
		this.perceptionRadius = 100;
		console.log('perceptionRadius: ' + this.perceptionRadius);
	}
}

export default Particle;