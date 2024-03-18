import { maxVelocity, minVelocity, cohesionForce, separationForce, alignmentForce, perceptionRadius } from '../script.js';
import separate from './separate.js';
import align from './align.js';
import cohesion from './cohesion.js';
import { minMax, GetDeltaTime, lerp } from '../classes/helpers/helpers.js';

function handleSteeringBehaviour(particle, particles, context) {
	let separationVector = { x: 0, y: 0 };
	let alignmentVector = { x: 0, y: 0 };
	let cohesionVector = { x: 0, y: 0 };
	let count = 0;
	let mutatedParticle = null;
	let localFlockmates = [];

	// Step 1: Apply velocities to the entire particle system based on minVelocity and maxVelocity
	// Calculate a new random velocity
	let speed = Math.random() * (maxVelocity - minVelocity) + minVelocity;
	let angle = Math.random() * 2 * Math.PI;
	let newVx = speed * Math.cos(angle);
	let newVy = speed * Math.sin(angle);

	// Get the time elapsed since the last frame, use that to interpolate the velocity
	lerpVector(particle, newVx, newVy);

	// step 2: apply steering behaviours, where every particle tried to avoid crashing in to another particle. 
	// They can apply aggressive turns if needed.
	// we use the separate, align, and cohesion from separate.js, cohesion.js and align.js to calculate 
	//steering behaviours, and apply those forces to our collected min/max velocity + any potential aggressive 
	// extra turn they need to do in order to avoid each other
	// Step 2: Apply steering behaviours
	for (let i = 0; i < particles.length; i++) {
		let particle = particles[i];

		// Calculate the separate force
		let separateVector = separate(particle, particles);

		// Scale the separate force by the separationForce variable
		separateVector.x *= separationForce;
		separateVector.y *= separationForce;

		// Apply the separate force to the particle's velocity
		particle.vx += separateVector.x;
		particle.vy += separateVector.y;

		// Calculate the cohesion force
		let cohesionVector = cohesion(particle, particles);

		// Scale the cohesion force by the cohesionForce variable
		cohesionVector.x *= cohesionForce;
		cohesionVector.y *= cohesionForce;

		// Apply the cohesion force to the particle's velocity
		particle.vx += cohesionVector.x;
		particle.vy += cohesionVector.y;

		// Calculate the alignment force
		let alignmentVector = align(particle, particles);

		// Scale the alignment force by the alignmentForce variable
		alignmentVector.x *= alignmentForce;
		alignmentVector.y *= alignmentForce;

		// Apply the alignment force to the particle's velocity
		particle.vx += alignmentVector.x;
		particle.vy += alignmentVector.y;

	}

	// step 3 : if a particle mutates, it will be added to the localFlockmates array, and we will apply a different
	// steering behaviour to it.

	// step 4: let the other non-mutated particles start to move towards the mutated particle, 
	// if and only if they are inside it's perceptionRadius. They will still try to avoid each other (and the mutated particle,
	// but will start to follow it and wants to match its speed and average trajectory.




}


export default handleSteeringBehaviour;

function lerpVector(particle, newVx, newVy) {
	let deltaTime = GetDeltaTime();

	// Interpolate between the current velocity and the new velocity
	particle.vx = lerp(particle.vx, newVx, deltaTime);
	particle.vy = lerp(particle.vy, newVy, deltaTime);

	// Update the particle's position based on its velocity
	particle.x += particle.vx;
	particle.y += particle.vy;
}
