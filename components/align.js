function align(particles, particle) {
	let totalParticles = 0;
	let desiredForce = { x: 0, y: 0 };

	particles.forEach(particle => {
		let dx = particle.x - particle.x;
		let dy = particle.y - particle.y;
		let d = Math.hypot(dx, dy);

		if (particle.isLeader && d < particle.perceptionRadius) {
			// Unique behavior for the leader
			desiredForce.x += particle.vx;
			desiredForce.y += particle.vy;
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
	return desiredForce;
}


export default align;