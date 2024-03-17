import { minMax, randomColor } from './helpers/helpers.js';
import DebugCircle from './helpers/debugCircle.js';
import RepelMouse from '../components/repelMouse.js';
// import AttractMouse from '../components/attractMouse.js';
import { weightedProbabilityBoolean } from './helpers/helpers.js';
import handleSteeringBehaviour from '../components/steeringBehaviour.js';

// TODO: slider 1 - 1000;
let separationForce = minMax(10, 25);
let maxVelocity = 0.01;
let maxAcceleration = 0.0001;
let minVelocity = 0.0001;
let mutatedMaxVelocity = 0.1;
let mutatedMinVelocity = 0.1;
let leaderSpeedMultiplier = 0.0001;
let canvas = document.getElementById('canvas1');
let context = canvas.getContext('2d');
let randomize = false;
let randomParticleColor = randomColor();
let particleColor = 'pink';
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
		randomParticleColor,
		leaderSpeedMultiplier,
		perceptionRadius,
		effect,
		particleRepelRadius,
		particleSize,
		particleColor,
		mouseRadius,
		mouseRepel,
		isRepellingMouse,
		isAttractedToMouse,
	) {
		this.isMutated = isMutated,
			this.tweaked = hasBeenTweaked;
		this.id = id;
		this.randomParticleColor = randomParticleColor;
		this.leaderSpeedMultiplier = leaderSpeedMultiplier;
		this.perceptionRadius = perceptionRadius;
		this.effect = effect;
		this.particleRepelRadius = particleRepelRadius;
		this.size = particleSize;
		this.color = particleColor;
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

		context.fillStyle = this.isMutated ? this.particleColor : particleColor; // Use the particleColor property if the particle has been mutated, otherwise use pink
		context.fill();

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

	mutate(context) {
		this.isMutated = true;
		this.particleColor = randomParticleColor;
		this.debug = true;
		this.maxVelocity = mutatedMaxVelocity;
		this.minVelocity = mutatedMinVelocity;
		// Add a velocity boost
		let angle = Math.random() * Math.PI * 2; // Random direction
		let speed = 20; // Change this to the speed you want
		this.vx = Math.cos(angle) * speed;
		this.vy = Math.sin(angle) * speed;
	}




}

export default Particle;