import { alignmentForce, perceptionRadius } from "../script.js";

function align(particle, particles) {
	let alignment = { x: 0, y: 0 };
	let total = 0;

	particles.forEach(other => {
		let dx = other.x - particle.x;
		let dy = other.y - particle.y;
		let d = Math.hypot(dx, dy);

		if (d < perceptionRadius && particle !== other) {
			alignment.x += other.vx;
			alignment.y += other.vy;
			total++;
		}
	});

	if (total > 0) {
		alignment.x /= total;
		alignment.y /= total;

		let magnitude = Math.hypot(alignment.x, alignment.y);
		alignment.x /= magnitude;
		alignment.y /= magnitude;

		alignment.x *= alignmentForce / 1000;
		alignment.y *= alignmentForce / 1000;
	}

	return alignment;
}

export default align;