function cohesion(particles, particle) {
	let totalParticles = 0;
	let steering = { x: 0, y: 0 };

	particles.forEach(particle => {
		// Distance between particle and actual particle
		let dx = particle.x - particle.x;
		let dy = particle.y - particle.y;
		let d = Math.hypot(dx, dy);
		// If particle is inside perception radius of the leader
		if (d < (particle.isLeader ? particle.perceptionRadius : particle.perceptionRadius) && particle != particle) {
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
		steering.x -= particle.x;
		steering.y -= particle.y;

		// Set the magnitude of the steering vector to maxVelocity
		let magnitude = Math.hypot(steering.x, steering.y);
		if (magnitude > 0) {
			steering.x = (steering.x / magnitude) * particle.maxVelocity;
			steering.y = (steering.y / magnitude) * particle.maxVelocity;
		}

		// Subtract the current velocity to get the steering force
		steering.x -= particle.vx;
		steering.y -= particle.vy;

		// Limit the steering force to maxAcceleration
		magnitude = Math.hypot(steering.x, steering.y);
		if (magnitude > particle.maxAcceleration) {
			steering.x = (steering.x / magnitude) * particle.maxAcceleration;
			steering.y = (steering.y / magnitude) * particle.maxAcceleration;
		}
	}
	return steering;
}

export default cohesion;