import { maxVelocity, minVelocity, attractionForce, separationForce, alignmentForce, perceptionRadius } from '../script.js';
import separate from './separate.js';
import align from './align.js';
import cohesion from './cohesion.js';
import { minMax } from '../classes/helpers/helpers.js';

function handleSteeringBehaviour(particle, particles, context) {
	let separationVector = { x: 0, y: 0 };
	let alignmentVector = { x: 0, y: 0 };
	let cohesionVector = { x: 0, y: 0 };
	let count = 0;
	let mutatedParticle = null;
	let localFlockmates = [];

	// Check if the particle is within the perception radius of any other particle
	for (let other of particles) {
		let dx = particle.x - other.x;
		let dy = particle.y - other.y;
		let distance = Math.sqrt(dx * dx + dy * dy);

		if (distance < perceptionRadius) {
			localFlockmates.push(other);

			if (other.isMutated) {
				mutatedParticle = other;
			}

			count++;
		}
	}

	// Calculate separation force based on local flockmates
	let localSeparation = separate(particle, localFlockmates);
	separationVector.x += localSeparation.x;
	separationVector.y += localSeparation.y;

	// Average the separation force
	if (count > 0) {
		separationVector.x /= count;
		separationVector.y /= count;
	}

	if (mutatedParticle) {
		let dx = particle.x - mutatedParticle.x;
		let dy = particle.y - mutatedParticle.y;
		let distance = Math.sqrt(dx * dx + dy * dy);

		if (particle.isMutated || distance < perceptionRadius) {
			// For the mutated particle, or for non-mutated particles within the perception radius of the mutated particle,
			// calculate forces based on all particles
			alignmentVector = align(particle, particles);
			cohesionVector = cohesion(particle, particles);
		}
	}



	// Apply the forces
	particle.vx += separationForce * separationVector.x + alignmentForce * alignmentVector.x + attractionForce * cohesionVector.x;
	particle.vy += separationForce * separationVector.y + alignmentForce * alignmentVector.y + attractionForce * cohesionVector.y;

	// Avoid walls
	if (particle.x < 0 || particle.x > context.canvas.width) {
		particle.vx = -particle.vx;
	}
	if (particle.y < 0 || particle.y > context.canvas.height) {
		particle.vy = -particle.vy;
	}

	// Update the position
	particle.x += particle.vx;
	particle.y += particle.vy;
}

export default handleSteeringBehaviour;