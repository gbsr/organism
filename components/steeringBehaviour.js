import { minMax } from '../helpers.js';
import { maxVelocity } from '../script.js';
import separate from './avoidance.js';
import align from './align.js';
import cohesion from './cohesion.js';
function handleSteeringBehaviour(particle) {
	let desiredVx = separate(particle.effect.particles, particle).x + align(particle.effect.particles, particle).x + cohesion(particle.effect.particles, particle).x;
	let desiredVy = separate(particle.effect.particles, particle).y + align(particle.effect.particles, particle).y + cohesion(particle.effect.particles, particle).y;

	// Calculate the steering force
	let steerX = desiredVx - particle.vx;
	let steerY = desiredVy - particle.vy;

	// Limit the steering force to the max acceleration
	let steerMagnitude = Math.sqrt(steerX * steerX + steerY * steerY);
	if (steerMagnitude > particle.maxAcceleration) {
		steerX = (steerX / steerMagnitude) * particle.maxAcceleration;
		steerY = (steerY / steerMagnitude) * particle.maxAcceleration;
	}

	// multiplier
	let steeringFactor = minMax(0.01, 0.09);

	// Apply the steering force (
	particle.vx += steerX * steeringFactor;
	particle.vy += steerY * steeringFactor;

	// Update the position
	particle.x += particle.vx;
	particle.y += particle.vy;

	// limit velocity
	// Calculate the current speed using the Pythagorean theorem
	let speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);

	// If the current speed is greater than the maximum speed
	if (speed > maxVelocity) {
		// Scale down the velocity to the maximum speed
		particle.vx = (particle.vx / speed) * maxVelocity;
		particle.vy = (particle.vy / speed) * maxVelocity;
	}
}

export default handleSteeringBehaviour;