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
		const minVelocity = 0.02; // Adjust this value as needed
		const maxVelocity = 0.5; // Adjust this value as needed

		// Initialize the velocities
		this.vx = Math.random() * (maxVelocity - minVelocity) + minVelocity;
		this.vy = Math.random() * (maxVelocity - minVelocity) + minVelocity;

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

		this.x += this.vx;
		this.y += this.vy;

		// // Bounce off edges
		if (this.x > this.effect.width - this.size || this.x < this.size) {
			this.vx *= -1;
		}

		if (this.y > this.effect.height - this.size || this.y < this.size) {
			this.vy *= -1;
		}
		this.x = Math.max(Math.min(this.x, this.effect.width - this.size), this.size);
		this.y = Math.max(Math.min(this.y, this.effect.height - this.size), this.size);
	}

}

export default Particle;