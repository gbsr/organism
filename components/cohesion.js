import { perceptionRadius, attractionForce } from "../script.js";

function cohesion(particle, particles) {
	let centerOfMass = { x: 0, y: 0 };
	let total = 0;

	/**
	 * Calculates the center of mass for nearby particles and applies
	 * a steering force towards that center of mass to the given particle.
	 *
	 * Iterates through all particles within perceptionRadius of the given particle.
	 * Sums the x and y positions into centerOfMass.
	 * Divides by total particles to get average center of mass.
	 * Calculates a steering vector towards the center of mass.
	 * Scales the steering vector by the attractionForce.
	 * Returns the steering vector to apply as a force to the given particle.
	 */
	particles.forEach((other) => {
		let dx = other.x - particle.x;
		let dy = other.y - particle.y;
		let d = Math.hypot(dx, dy);

		if (d < perceptionRadius && particle !== other) {
			centerOfMass.x += other.x;
			centerOfMass.y += other.y;
			total++;
		}
	});

	if (total > 0) {
		centerOfMass.x /= total;
		centerOfMass.y /= total;

		let steering = { x: centerOfMass.x - particle.x, y: centerOfMass.y - particle.y };
		let magnitude = Math.hypot(steering.x, steering.y);
		steering.x /= magnitude;
		steering.y /= magnitude;

		steering.x *= attractionForce / 1000;
		steering.y *= attractionForce / 1000;

		return steering;
	}

	return { x: 0, y: 0 };
}

export default cohesion;