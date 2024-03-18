import { separationForce, perceptionRadius, minDistance } from "../script.js";

function separate(particle, particles) {
	let avoidance = { x: 0, y: 0 };
	let total = 0;
	let forceMultiplier = 100; // Adjust this value as needed
	let maxForce = 90; // Limit the force


	particles.forEach(other => {
		let dx = particle.x - other.x;
		let dy = particle.y - other.y;
		let d = Math.hypot(dx, dy);

		if (d < perceptionRadius && particle !== other) {
			let diff = { x: dx, y: dy };
			let magnitude = Math.hypot(diff.x, diff.y);
			diff.x /= magnitude;
			diff.y /= magnitude;

			// If particles are too close, separate them immediately
			if (d < minDistance) {
				let force = (d / minDistance - 1) * forceMultiplier;
				force = Math.max(force, maxForce); // Limit the force
				diff.x *= force;
				diff.y *= force;
			} else {
				// Increase the force as particles get closer
				let force = (separationForce / (d * d)) * forceMultiplier;
				diff.x *= force;
				diff.y *= force;

				avoidance.x += diff.x / 100;
				avoidance.y += diff.y / 100;
				total++;
				// console.log('pushpushpush!');
			}
		}
	});

	if (total > 0) {
		avoidance.x /= total;
		avoidance.y /= total;
	}

	return avoidance;
}

export default separate;