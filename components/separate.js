import { separationForce } from "../script.js";

function separate(particle, particles) {
	let avoidance = { x: 0, y: 0 }; //Average Velocity

	// Loops through every particle to check if they fall
	// inside the perception Radius
	particles.forEach(otherParticle => {
		// Distance between particle and actual particle
		let dx = particle.x - otherParticle.x;
		let dy = particle.y - otherParticle.y;
		let d = Math.hypot(dx, dy);

		// If particle is inside perception radius
		if (d < (otherParticle.isLeader ? otherParticle.perceptionRadius : particle.perceptionRadius) && otherParticle !== particle) {
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

		avoidance.x *= particle.maxVelocity;
		avoidance.y *= particle.maxVelocity;
	}

	// Subtract current velocity to get steering force
	avoidance.x -= particle.vx;
	avoidance.y -= particle.vy;

	// Limit force to maximum steering force
	magnitude = Math.hypot(avoidance.x, avoidance.y);
	if (magnitude > particle.maxAcceleration) {
		avoidance.x = (avoidance.x / magnitude) * particle.maxAcceleration;
		avoidance.y = (avoidance.y / magnitude) * particle.maxAcceleration;
	}

	// Scale the avoidance force by the separation force
	avoidance.x *= separationForce;
	avoidance.y *= separationForce;

	return avoidance;
}

export default separate;