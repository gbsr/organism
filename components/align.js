function align(particle, particles) {
	let totalParticles = 0;
	let desiredForce = { x: 0, y: 0 };

	particles.forEach(otherParticle => {
		let dx = otherParticle.x - particle.x;
		let dy = otherParticle.y - particle.y;
		let d = Math.hypot(dx, dy);

		if (otherParticle.isLeader && d < particle.perceptionRadius) {
			// Unique behavior for the leader
			desiredForce.x += otherParticle.vx;
			desiredForce.y += otherParticle.vy;
			totalParticles++;
		}
	});

	if (totalParticles > 0) {
		// Average the desired force
		desiredForce.x /= totalParticles;
		desiredForce.y /= totalParticles;

		// Normalize the desired force
		let magnitude = Math.hypot(desiredForce.x, desiredForce.y);
		if (magnitude > 0) {
			desiredForce.x /= magnitude;
			desiredForce.y /= magnitude;
		}

		// Scale the desired force by the particle's maximum velocity
		desiredForce.x *= particle.maxVelocity;
		desiredForce.y *= particle.maxVelocity;

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
	return desiredForce;
}

export default align;