import { maxVelocity, minVelocity, attractionForce, separationForce, alignmentForce, perceptionRadius } from '../script.js';
import separate from './separate.js';
import align from './align.js';
import cohesion from './cohesion.js';

function handleSteeringBehaviour(particle, particles, context) {

	// calculate separation forces
	let separation = separate(particle, particles);
	separation.x *= separationForce;
	separation.y *= separationForce;

	// calculate alignment and cohesion forces
	let alignment = align(particle, particles);
	alignment.x *= alignmentForce;
	alignment.y *= alignmentForce;

	let cohesionForce = cohesion(particle, particles);
	cohesionForce.x *= attractionForce;
	cohesionForce.y *= attractionForce;

	// balance the forces
	let desiredVx = separation.x + alignment.x + cohesionForce.x;
	let desiredVy = separation.y + alignment.y + cohesionForce.y;

	// Calculate the steering force
	let steerX = desiredVx - particle.vx;
	let steerY = desiredVy - particle.vy;

	// Limit the steering force to the max acceleration
	let steerMagnitude = Math.sqrt(steerX * steerX + steerY * steerY);
	if (steerMagnitude > particle.maxAcceleration) {
		steerX = (steerX / steerMagnitude) * particle.maxAcceleration;
		steerY = (steerY / steerMagnitude) * particle.maxAcceleration;
	}

	// Apply the steering force
	particle.vx += steerX;
	particle.vy += steerY;

	// Update the position
	particle.x += particle.vx;
	particle.y += particle.vy;

	// limit velocity
	let speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
	if (speed > particle.maxVelocity) {
		particle.vx = (particle.vx / speed) * particle.maxVelocity;
		particle.vy = (particle.vy / speed) * particle.maxVelocity;
	} else if (speed < particle.minVelocity) {
		particle.vx = (particle.vx / speed) * particle.minVelocity;
		particle.vy = (particle.vy / speed) * particle.minVelocity;
	}

	// Check if the particle is within the perception radius of any mutated particle
	for (let other of particles) {
		if (other.isMutated) {
			let dx = particle.x - other.x;
			let dy = particle.y - other.y;
			let distance = Math.sqrt(dx * dx + dy * dy);

			if (distance < perceptionRadius) {
				// Make the particle follow the mutated particle
				particle.vx += (other.x - particle.x) * attractionForce / 100;
				particle.vy += (other.y - particle.y) * attractionForce / 100;
				particle.particleColor = other.randomParticleColor;
			}
		}
	}
}

export default handleSteeringBehaviour;