import { minMax, lerp, GetDeltaTime } from '../helpers.js';
import RepelMouse from '../components/repelMouse.js';

// TODO: slider 1 - 1000;
let separationForce = minMax(0.4, 1.23);
let maxVelocity = minMax(1, 4);
let maxAcceleration = minMax(1, 5);
let minVelocity = minMax(0.3, 1);

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
		this.maxVelocity = maxVelocity;
		this.maxAcceleration = maxAcceleration;
		this.separationForce = separationForce;

		/**
		 * Generate random x and y coordinates within the bounds of the effect, offset
		 * by the particle size. This positions particles randomly within the effect area.
		*/
		this.x = this.size + Math.random() * (this.effect.width - this.size * 2);
		this.y = this.size + Math.random() * (this.effect.height - this.size * 2);


		// Initialize the velocities
		this.vx = Math.random() * (maxVelocity - minVelocity) + minVelocity;
		this.vy = Math.random() * (maxVelocity - minVelocity) + minVelocity;

		this.maxVelocity = maxVelocity;
		this.maxAcceleration = maxAcceleration;

		// // Randomly invert the velocities to allow for movement in all directions
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

		// Calculate the desired velocity
		let desiredVx = this.separate(this.effect.particles).x + this.align(this.effect.particles).x + this.cohesion(this.effect.particles).x;
		let desiredVy = this.separate(this.effect.particles).y + this.align(this.effect.particles).y + this.cohesion(this.effect.particles).y;

		// Calculate the steering force
		let steerX = desiredVx - this.vx;
		let steerY = desiredVy - this.vy;

		// Limit the steering force to the max acceleration
		let steerMagnitude = Math.sqrt(steerX * steerX + steerY * steerY);
		if (steerMagnitude > this.maxAcceleration) {
			steerX = (steerX / steerMagnitude) * this.maxAcceleration;
			steerY = (steerY / steerMagnitude) * this.maxAcceleration;
		}

		// multiplier
		let steeringFactor = minMax(0.01, 0.09);

		// Apply the steering force (
		this.vx += steerX * steeringFactor;
		this.vy += steerY * steeringFactor;

		// Limit velo
		this.limitVelocity();

		// Update the position
		this.x += this.vx;
		this.y += this.vy;

		// Handle edge detection
		this.HandleEdgeDetection();
	}

	limitVelocity() {

		// Calculate the current speed using the Pythagorean theorem
		let speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

		// If the current speed is greater than the maximum speed
		if (speed > maxVelocity) {
			// Scale down the velocity to the maximum speed
			this.vx = (this.vx / speed) * maxVelocity;
			this.vy = (this.vy / speed) * maxVelocity;
		}
	}

	separate(particles) {
		let perceptionRadius = 40; //Radius of perception
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

		// Normalize the avoidance vector and scale to maximum speed
		let magnitude = Math.hypot(avoidance.x, avoidance.y);
		if (magnitude !== 0) {
			avoidance.x /= magnitude;
			avoidance.y /= magnitude;

			avoidance.x *= this.maxVelocity;
			avoidance.y *= this.maxVelocity;
		}

		// Subtract current velocity to get steering force
		avoidance.x -= this.vx;
		avoidance.y -= this.vy;

		// Limit force to maximum steering force
		magnitude = Math.hypot(avoidance.x, avoidance.y);
		if (magnitude > this.maxAcceleration) {
			avoidance.x = (avoidance.x / magnitude) * this.maxAcceleration;
			avoidance.y = (avoidance.y / magnitude) * this.maxAcceleration;
		}

		// Scale the avoidance force by the separation force
		avoidance.x *= this.separationForce;
		avoidance.y *= this.separationForce;

		return avoidance;
	}


	align(particles) {
		let perceptionRadius = 20;
		let totalParticles = 0;
		let desiredForce = { x: 0, y: 0 };

		particles.forEach(particle => {
			// Distance between particle and actual particle
			let dx = this.x - particle.x;
			let dy = this.y - particle.y;
			let d = Math.hypot(dx, dy);
			// If particle is inside perception radius
			if (d < perceptionRadius && particle != this) {
				desiredForce.x += particle.vx;
				desiredForce.y += particle.vy;
				totalParticles++;
			}
		});

		if (totalParticles > 0) {
			// Average the desired force
			desiredForce.x /= totalParticles;
			desiredForce.y /= totalParticles;

			// Set the magnitude of the desired force to maxVelocity
			let magnitude = Math.hypot(desiredForce.x, desiredForce.y);
			if (magnitude > 0) {
				desiredForce.x = (desiredForce.x / magnitude) * this.maxVelocity;
				desiredForce.y = (desiredForce.y / magnitude) * this.maxVelocity;
			}

			// Subtract the current velocity to get the steering force
			desiredForce.x -= this.vx;
			desiredForce.y -= this.vy;

			// Limit the steering force to maxAcceleration
			magnitude = Math.hypot(desiredForce.x, desiredForce.y);
			if (magnitude > this.maxAcceleration) {
				desiredForce.x = (desiredForce.x / magnitude) * this.maxAcceleration;
				desiredForce.y = (desiredForce.y / magnitude) * this.maxAcceleration;
			}
		}
		return desiredForce;
	}

	cohesion(particles) {
		let perceptionRadius = 35;
		let totalParticles = 0;
		let steering = { x: 0, y: 0 };

		particles.forEach(particle => {
			// Distance between particle and actual particle
			let dx = this.x - particle.x;
			let dy = this.y - particle.y;
			let d = Math.hypot(dx, dy);
			// If particle is inside perception radius
			if (d < perceptionRadius && particle != this) {
				steering.x += particle.x;
				steering.y += particle.y;
				totalParticles++;
			}
		});

		if (totalParticles > 0) {
			// Average the steering vector
			steering.x /= totalParticles;
			steering.y /= totalParticles;

			// Subtract the current position to get the steering vector
			steering.x -= this.x;
			steering.y -= this.y;

			// Set the magnitude of the steering vector to maxVelocity
			let magnitude = Math.hypot(steering.x, steering.y);
			if (magnitude > 0) {
				steering.x = (steering.x / magnitude) * this.maxVelocity;
				steering.y = (steering.y / magnitude) * this.maxVelocity;
			}

			// Subtract the current velocity to get the steering force
			steering.x -= this.vx;
			steering.y -= this.vy;

			// Limit the steering force to maxAcceleration
			magnitude = Math.hypot(steering.x, steering.y);
			if (magnitude > this.maxAcceleration) {
				steering.x = (steering.x / magnitude) * this.maxAcceleration;
				steering.y = (steering.y / magnitude) * this.maxAcceleration;
			}
		}
		return steering;
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