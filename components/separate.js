import { separationForce, perceptionRadius } from "../script.js";

function separate(particle, particles) {
	let avoidance = { x: 0, y: 0 };
	let total = 0;

	particles.forEach(other => {
		let dx = particle.x - other.x;
		let dy = particle.y - other.y;
		let d = Math.hypot(dx, dy);

		if (d < perceptionRadius && particle !== other) {
			let diff = { x: dx, y: dy };
			let magnitude = Math.hypot(diff.x, diff.y);
			diff.x /= magnitude;
			diff.y /= magnitude;

			diff.x *= separationForce / 1000;
			diff.y *= separationForce / 1000;

			avoidance.x += diff.x;
			avoidance.y += diff.y;
			total++;
		}
	});

	if (total > 0) {
		avoidance.x /= total;
		avoidance.y /= total;
	}

	return avoidance;
}

export default separate;