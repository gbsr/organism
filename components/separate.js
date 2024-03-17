import { separationForce } from "../script.js";

function separate(particle, particles) {
	let avoidance = { x: 0, y: 0 };
	let count = 0;

	for (let other of particles) {
		let dx = particle.x - other.x;
		let dy = particle.y - other.y;
		let distance = Math.sqrt(dx * dx + dy * dy);

		if (other !== particle && distance < particle.perceptionRadius) {
			let diff = { x: dx / distance, y: dy / distance };
			avoidance.x += diff.x;
			avoidance.y += diff.y;
			count++;
		}
	}

	if (count > 0) {
		avoidance.x /= count;
		avoidance.y /= count;

		let magnitude = Math.sqrt(avoidance.x * avoidance.x + avoidance.y * avoidance.y);
		if (magnitude > 0) {
			avoidance.x = (avoidance.x / magnitude) * particle.maxVelocity - particle.vx;
			avoidance.y = (avoidance.y / magnitude) * particle.maxVelocity - particle.vy;
		}
	}

	return avoidance;
}

export default separate;