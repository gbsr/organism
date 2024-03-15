import { minMax, randomColor } from '../helpers.js';
import RepelMouse from '../components/repelMouse.js';
// import AttractMouse from '../components/attractMouse.js';
import { weightedProbabilityBoolean } from '../helpers.js';
import handleSteeringBehaviour from '../components/steeringBehaviour.js';

// TODO: slider 1 - 1000;
let separationForce = minMax(0.4, 1.23);
let maxVelocity = 0.00001;
let maxAcceleration = 0.00001;
let minVelocity = 0.00001;
let perceptionRadius = minMax(1, 5);
let leaderSpeedMultiplier = minMax(1, 5);
let randomParticleColor = randomColor();


class Particle {
	/**
	 * Particle class constructor.
	 * Initializes a particle instance with provided parameters.
	 */
	constructor(
		id,
		effect,
		particleRepelRadius,
		particleSize,
		particleColor,
		mouseRadius,
		mouseRepel,
		isRepellingMouse,
		isAttractedToMouse,
		hasBeenTweaked = false,
		perceptionRadius,
		isLeader = false
	) {
		this.id = id;
		this.effect = effect;
		this.size = particleSize;
		this.leaderSpeedMultiplier = leaderSpeedMultiplier;
		this.color = particleColor;
		this.particleRepelRadius = particleRepelRadius;
		this.mouseRadius = mouseRadius;
		this.mouseRepelForce = mouseRepel;
		this.repel = isRepellingMouse;
		this.attract = isAttractedToMouse;
		this.maxVelocity = 0;
		this.maxAcceleration = maxAcceleration;
		this.separationForce = separationForce;
		this.tweaked = hasBeenTweaked;
		this.perceptionRadius = perceptionRadius;
		this.isLeader = isLeader;

		this.InitRandomPositions();
		this.InitVelocities();



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
		this.vx = Math.random() * (maxVelocity - minVelocity) + minVelocity;
		this.vy = Math.random() * (maxVelocity - minVelocity) + minVelocity;

		/**
		 * Randomly negate the x and y velocity components.
		 * This gives each particle a random initial direction.
		 */
		if (Math.random() < 0.5) this.vx *= -1;
		if (Math.random() < 0.5) this.vy *= -1;
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
		context.fill();
		context.fillStyle = this.color;
	}

	update() {


		handleSteeringBehaviour(this);
		// avoidance();
		// align();
		// cohesion();
		this.handleEdgeDetection();
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

	setLeader(id, isLeader, isTweaked, p) {
		console.log('leaderSpeedMultiplier: ' + this.leaderSpeedMultiplier);
		this.isLeader = isLeader;
		this.tweaked = isTweaked;
		this.id = id;
		this.color = randomColor();
		this.vx = Math.random() * (maxVelocity - minVelocity) + minVelocity + this.leaderSpeedMultiplier;
		this.vy = Math.random() * (maxVelocity - minVelocity) + minVelocity + this.leaderSpeedMultiplier;
		this.tweaked = true;
		if (Math.random() < 0.5) this.vx *= -1;
		if (Math.random() < 0.5) this.vy *= -1;
	}



}

export default Particle;