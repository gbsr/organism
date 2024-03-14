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

		this.vx = minMax(0, 0);
		this.vy = minMax(0, 0);
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

			// Separation: repel when too close
			let separationRadius = this.size + other.size * this.particleRepelRadius;
			if (distance < separationRadius) {
				const angle = Math.atan2(dy, dx);
				this.x += Math.cos(angle);
				this.y += Math.sin(angle);
			}

			// Cohesion: attract when too far
			let cohesionRadius = this.size + other.size * 16;
			if (distance > cohesionRadius) {
				const angle = Math.atan2(dy, dx);
				this.x -= Math.cos(angle);
				this.y -= Math.sin(angle);
			}

			// Alignment: match velocity of nearby particles
			let alignmentRadius = this.size + other.size * 2;
			if (distance < alignmentRadius) {
				this.vx += (other.vx - this.vx) * 2;
				this.vy += (other.vy - this.vy) * 2;
			}
		}

		// // Move towards mouse
		// if (this.effect.mouse.x > 0 && this.effect.mouse.x < this.effect.width) {

		// 	const offsetX = minMax(0, 0);
		// 	const offsetY = minMax(0, 0);
		// 	const speed = minMax(0.02, 0.025);
		// 	this.x = lerp(this.x, this.effect.mouse.x + offsetX, speed);
		// 	this.y = lerp(this.y, this.effect.mouse.y + offsetY, speed);
		// }

		this.x += this.vx;
		this.y += this.vy;

		// Bounce off edges
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