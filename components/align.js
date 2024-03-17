import { alignmentForce, perceptionRadius } from "../script.js";

function align(particle, particles) {
	let totalParticles = 0;
	let desiredForce = { x: 0, y: 0 };

	particles.forEach(other => {
		// Distance between particle and actual particle
		let dx = particle.x - other.x;
		let dy = particle.y - other.y;
		let d = Math.hypot(dx, dy);
		// If particle is inside perception radius
		if (d < perceptionRadius && other != particle) {
			desiredForce.x += other.vx;
			desiredForce.y += other.vy;
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
			desiredForce.x = (desiredForce.x / magnitude) * particle.maxVelocity;
			desiredForce.y = (desiredForce.y / magnitude) * particle.maxVelocity;
		}

		// Subtract the current velocity to get the steering force
		desiredForce.x -= particle.vx;
		desiredForce.y -= particle.vy;

		// Limit the steering force to maxAcceleration
		magnitude = Math.hypot(desiredForce.x, desiredForce.y);
		if (magnitude > particle.maxAcceleration) {
			desiredForce.x = (desiredForce.x / magnitude) * particle.maxAcceleration;
			desiredForce.y = (desiredForce.y / magnitude) * particle.maxAcceleration;
		}
	}

	// Scale the desired force by the alignment force
	desiredForce.x *= alignmentForce;
	desiredForce.y *= alignmentForce;

	return desiredForce;
}
export default align;