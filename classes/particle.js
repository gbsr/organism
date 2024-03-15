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

		this.vx = minMax(-0.01, 0.01);
		this.vy = minMax(-0.1, 0.01);
		console.log('Heres my props - ' + this.size + ' : ' + this.color + ' : ' + this.particleRepelRadius);

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




		// let particleRepelRadius = repelForceValue.value;
		if (this.repel) {
			let newPosition = RepelMouse(this.effect, this.x, this.y, this.mouseRadius, this.mouseRepelForce);
			this.x = newPosition.x;
			this.y = newPosition.y;
		}
		// Boids-like behavior
		for (let other of this.effect.particles) {
			if (other === this) continue; // Don't interact with self

			const dx = this.x - other.x;
			const dy = this.y - other.y;
			const distance = Math.hypot(dx, dy);



			// // Cohesion: attract when too far
			let cohesionRadius = this.size + other.size * minMax(50, 380);
			if (distance > cohesionRadius) {
				const angle = Math.atan2(dy, dx);
				this.x -= Math.cos(angle);
				this.y -= Math.sin(angle);
			}

			// Alignment: match velocity of nearby particles
			let alignmentRadius = this.size + other.size * 2;
			if (distance < alignmentRadius) {
				let targetVx = minMax(other.vx * 1.3, other.vx * 0.6);
				let targetVy = minMax(other.vy * 0.3, other.vy * 0.6);
				this.vx += (targetVx - this.vx) * 0.5;
				this.vy += (targetVy - this.vy) * 0.5;
			}
			// Initialize target velocity
			this.targetVx = this.vx;// Random movement: steer in a random direction
			const angle = Math.random() * Math.PI * 2;
			const speed = 2; // Adjust this value as needed
			this.targetVx = Math.cos(angle) * speed;
			this.targetVy = Math.sin(angle) * speed;

			// Lerp between current velocity and target velocity
			const lerpFactor = 0.05; // Adjust this value as needed
			this.vx += (this.targetVx - this.vx) * lerpFactor;
			this.vy += (this.targetVy - this.vy) * lerpFactor;
		}

		// // Move towards mouse

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