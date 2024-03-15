import { minMax, lerp } from '../helpers.js';
import RepelMouse from '../components/repelMouse.js';
class Particle {
	constructor(
		effect,
		particleRepelRadius,
		particleSize,
		particleColor,
		mouseRadius,
		mouseRepel,
		isRepellingMouse,
		isAttractedToMouse,
	) {
		this.effect = effect;
		this.size = particleSize;
		this.color = particleColor;
		this.particleRepelRadius = particleRepelRadius;
		this.mouseRadius = mouseRadius;
		this.mouseRepelForce = mouseRepel;
		this.repel = isRepellingMouse;
		this.attract = isAttractedToMouse;

		/**
		 * Generate random x and y coordinates within the bounds of the effect, offset
		 * by the particle size. This positions particles randomly within the effect area.
		*/
		this.x = this.size + Math.random() * (this.effect.width - this.size * 2);
		this.y = this.size + Math.random() * (this.effect.height - this.size * 2);

		// Define the minimum and maximum velocity
		const minVelocity = 0.2; // Adjust this value as needed
		const maxVelocity = 0.2; // Adjust this value as needed

		// Initialize the velocities
		this.vx = Math.random() * (maxVelocity - minVelocity) + minVelocity;
		this.vy = Math.random() * (maxVelocity - minVelocity) + minVelocity;

		this.maxVelocity = maxVelocity;
		this.maxAcceleration = 0.1;

		// Randomly invert the velocities to allow for movement in all directions
		if (Math.random() < 0.5) this.vx *= -1;
		if (Math.random() < 0.5) this.vy *= -1;

	}

	/**
	 * Draws the particle on the canvas by creating a path and arc
	 * representing the particle's position and size.
	 */

	draw(context) {
		context.beginPath();
		context.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
		context.fill();
		context.fillStyle = this.color;
	}

	update() {


		// Calculate the new velocity
		let newVelocity = this.separate(this.effect.particles);

		// Update the velocity
		this.vx = newVelocity.x;
		this.vy = newVelocity.y;

		// Update the position
		this.x += this.vx;
		this.y += this.vy;
		// Handle edge detection
		this.HandleEdgeDetection();


		// To make sure we bounce off the edge, and also stay within the canvas at all times
		this.HandleEdgeDetection();


	}

	separate(particles) {
		let perceptionRadius = 30; //Radius of perception
		let avoidance = { x: 0, y: 0 }; //Average Velocity

		// Loops through every particle to check if they fall
		// inside the perception Radius
		particles.forEach(particle => {
			// Distance between particle and actual particle
			let dx = this.x - particle.x;
			let dy = this.y - particle.y;
			let d = Math.hypot(dx, dy);

			// If particle is inside perception radius
			if (d < perceptionRadius && particle !== this) {
				// Calculates the average avoidance vector
				// which is inverse to the distance vector
				// between two particles
				let diff = { x: dx, y: dy };
				diff.x /= d * d; // Weight by distance squared
				diff.y /= d * d; // Weight by distance squared

				// Adds to the avoidance force vector
				// the proportional inverse vector
				avoidance.x += diff.x;
				avoidance.y += diff.y;
			}
		});

		// console.log('avoidance before normalization:', avoidance);

		// Normalize the avoidance vector and scale to maximum speed
		let magnitude = Math.hypot(avoidance.x, avoidance.y);
		if (magnitude !== 0) {
			avoidance.x /= magnitude;
			avoidance.y /= magnitude;

			avoidance.x *= this.maxVelocity;
			avoidance.y *= this.maxVelocity;
		}

		// console.log('this.vx:', this.vx);
		// console.log('this.vy:', this.vy);
		// Subtract current velocity to get steering force
		avoidance.x -= this.vx;
		avoidance.y -= this.vy;

		// Limit force to maximum steering force
		magnitude = Math.hypot(avoidance.x, avoidance.y);
		if (magnitude > this.maxAcceleration) {
			avoidance.x = (avoidance.x / magnitude) * this.maxAcceleration;
			avoidance.y = (avoidance.y / magnitude) * this.maxAcceleration;
		}

		// console.log('avoidance after limiting:', avoidance);

		return avoidance;
	}

	HandleEdgeDetection() {
		const buffer = 20;

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
}

export default Particle;