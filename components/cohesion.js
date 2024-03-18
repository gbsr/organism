import { perceptionRadius, cohesionForce } from "../script.js";

function cohesion(particle, particles) {
	let centerOfMass = { x: 0, y: 0 };
	let total = 0;

	particles.forEach(other => {
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

		steering.x *= cohesionForce / 1000;
		steering.y *= cohesionForce / 1000;

		return steering;
	}

	return { x: 0, y: 0 };
}

export default cohesion;